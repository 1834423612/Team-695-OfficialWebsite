<template>
    <!-- This component has no UI and is only used to handle API errors -->
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { casdoorService } from '@/services/auth';
import { isRecentLogin, AUTH_FLAGS, clearTrustFlags } from '@/utils/authConfig';
import { logger } from '@/utils/logger';

// Define the global notification function type
declare global {
    interface Window {
        $notify?: (title: string, message: string, type?: string, actionText?: string, callback?: () => void) => void;
    }
}

export default defineComponent({
    name: 'ApiErrorHandler',
    setup() {
        const userStore = useUserStore();

        // Track the error count to avoid repetitive alerts
        const errorCount = ref(0);
        const lastErrorTime = ref(0);
        const ERROR_THRESHOLD = 3; // Show at most 3 errors within 30 seconds
        const ERROR_RESET_TIME = 30000; // 30 seconds

        // Last validation time
        const lastValidationCheck = ref(0);
        const VALIDATION_INTERVAL = 5 * 60 * 1000; // Adjust to the standard 5-minute validation interval

        // Track whether a notification has already been shown
        const hasShownNotification = ref(false);

        // Handle authentication error events
        const handleAuthError = async (event: CustomEvent) => {
            // Do not show another notification if one is already visible
            if (hasShownNotification.value) {
                return;
            }

            const now = Date.now();

            // Reset the error counter when the reset window has passed
            if (now - lastErrorTime.value > ERROR_RESET_TIME) {
                errorCount.value = 0;
            }

            // Update the error timestamp
            lastErrorTime.value = now;

            // Increase the error count
            errorCount.value++;

            // Stop showing alerts once the error threshold is exceeded
            if (errorCount.value <= ERROR_THRESHOLD) {
                // Get the error message
                const message = event.detail?.message || 'Your session has expired. Please login again.';

                // Mark the notification as shown
                hasShownNotification.value = true;

                // Show the message through the global notification component
                if (window.$notify) {
                    window.$notify(
                        'Authentication Error',
                        message,
                        'error',
                        'Login Again',
                        () => {
                            forceLogout();
                        }
                    );
                } else {
                    // Fallback: use the native alert
                    alert(message);
                    forceLogout();
                }
            } else {
                console.warn('Too many auth errors in short period, suppressing alerts');
                // Log out silently
                forceLogout();
            }
        };

        // Force logout and refresh the page
        const forceLogout = async () => {
            try {
                // Clear user information
                userStore.clearUserInfo();

                // Log out
                await casdoorService.logout();

                // Refresh the page and go directly to the login page instead of using router.push
                window.location.href = '/login';
            } catch (error) {
                console.error('Error during automatic logout:', error);
                // Ensure the user is redirected to the login page no matter what
                window.location.href = '/login';
            }
        };

        // Listen for global AJAX errors
        const handleAjaxError = (event: ErrorEvent) => {
            const target = event.target as XMLHttpRequest;

            // Check whether the error came from an API call
            if (target && target instanceof XMLHttpRequest) {
                // Check whether it is an authentication error
                if (target.status === 401 || target.status === 403) {
                    console.warn('Caught XHR auth error:', target.status, target.statusText);

                    // Trigger authentication error handling
                    casdoorService.handleInvalidAuthResponse().catch(console.error);
                }

                // Try to parse the returned JSON to detect an error message
                try {
                    if (target.responseText) {
                        const response = JSON.parse(target.responseText);

                        // Check for specific error formats
                        if (response.success === true && response.data &&
                            response.data.status === 'error' && response.data.msg) {

                            const errorMsg = response.data.msg;
                            if (errorMsg.includes('token') ||
                                errorMsg.includes('Access') ||
                                errorMsg.includes('exist') ||
                                errorMsg.includes('expired') ||
                                errorMsg.includes('auth')) {

                                console.warn('Detected auth error in XHR response:', errorMsg);
                                casdoorService.handleInvalidAuthResponse().catch(console.error);
                            }
                        }
                    }
                } catch (e) {
                    // Failed to parse the response; it may not be JSON
                }
            }
        };

        // Periodically validate the token
        const setupPeriodicValidation = () => {
            // Reset the last validation time when the page refreshes
            lastValidationCheck.value = Date.now();

            // Avoid running immediately on page load and let AuthManager validate first
            // Delay the first validation by 5 seconds to avoid conflicting with AuthManager
            setTimeout(() => {
                // Immediately check trust flags and validation state instead of validating right away
                checkTokenStatus();
            }, 5000);

            // Set up periodic validation
            const intervalId = setInterval(() => {
                checkTokenStatus();
            }, VALIDATION_INTERVAL);

            return intervalId;
        };

        // New method: check token state without requesting a new token
        const checkTokenStatus = async () => {
            const now = Date.now();
            
            // Check whether the user is within the 10-minute trust window
            if (isRecentLogin(10)) {
                logger.debug('ApiErrorHandler: Recent login detected (<10min), skipping validation');
                return;
            }
            
            // Clear the absolute-trust flag after 10 minutes
            clearTrustFlags();
            
            // Avoid validating too frequently
            if (now - lastValidationCheck.value < VALIDATION_INTERVAL) {
                return;
            }
            
            // Check whether AuthManager validated recently
            const lastAuthCheck = localStorage.getItem(AUTH_FLAGS.AUTH_CHECK_TIME);
            if (lastAuthCheck && now - parseInt(lastAuthCheck) < VALIDATION_INTERVAL / 2) {
                logger.debug('ApiErrorHandler: AuthManager recently verified, skipping validation');
                lastValidationCheck.value = now; // Update the timestamp while skipping validation
                return;
            }
            
            // Check whether validation is already in progress
            if (localStorage.getItem('auth_validation_in_progress') === 'true' ||
                localStorage.getItem('api_error_handler_validating') === 'true') {
                logger.debug('ApiErrorHandler: Validation already in progress, skipping');
                return;
            }
            
            // Update the timestamp
            lastValidationCheck.value = now;
            
            try {
                // Validate only when the user is logged in
                if (casdoorService.isLoggedIn()) {
                    // Set a lock to prevent conflicts
                    localStorage.setItem('api_error_handler_validating', 'true');
                    
                    try {
                        logger.info('ApiErrorHandler: Performing token validation against Casdoor API');
                        
                        // Validate directly with the Casdoor API to detect server-side revoked tokens
                        const validationResult = await casdoorService.validateWithTeamApi();
                        
                        if (!validationResult.valid) {
                            logger.warn('ApiErrorHandler: Casdoor API validation failed - token is invalid');
                            
                            // Trigger logout immediately when the token is invalid without trying to refresh it
                            handleAuthError(new CustomEvent('auth:invalid', {
                                detail: { message: 'Your session has expired or been revoked. Please login again.' }
                            }));
                        } else {
                            // Record the validation result
                            logger.info('ApiErrorHandler: Casdoor API validation successful');
                            localStorage.setItem(AUTH_FLAGS.VALIDATION_TIME, Date.now().toString());
                            localStorage.setItem(AUTH_FLAGS.AUTH_CHECK_TIME, Date.now().toString());
                        }
                    } finally {
                        // Remove the lock after validation completes
                        localStorage.removeItem('api_error_handler_validating');
                    }
                }
            } catch (error) {
                logger.error('ApiErrorHandler: Error during validation check:', error);
                localStorage.removeItem('api_error_handler_validating');
            }
        };

        // Store the timer ID
        let validationIntervalId: ReturnType<typeof setInterval> | null = null;

        onMounted(() => {
            // Listen for invalid-authentication events
            window.addEventListener('auth:invalid', handleAuthError as unknown as EventListener);

            // Listen for global AJAX errors
            window.addEventListener('error', handleAjaxError);

            // Set up periodic validation
            validationIntervalId = setupPeriodicValidation();

            // Listen to fetch responses
            const originalFetch = window.fetch;
            window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
                try {
                    const response = await originalFetch(input, init);

                    // Clone the response so the content can be inspected
                    const clone = response.clone();

                    // Check the status
                    if (!response.ok && (response.status === 401 || response.status === 403)) {
                        console.warn('Caught fetch auth error:', response.status);
                        casdoorService.handleInvalidAuthResponse().catch(console.error);
                        return response;
                    }

                    // Inspect the response content asynchronously
                    clone.text().then(text => {
                        if (text) {
                            try {
                                const data = JSON.parse(text);

                                // Check for specific error formats
                                if (data.success === true && data.data &&
                                    data.data.status === 'error' && data.data.msg) {

                                    const errorMsg = data.data.msg;
                                    if (errorMsg.includes('token') ||
                                        errorMsg.includes('Access') ||
                                        errorMsg.includes('exist') ||
                                        errorMsg.includes('expired') ||
                                        errorMsg.includes('auth')) {

                                        console.warn('Detected auth error in fetch response:', errorMsg);
                                        casdoorService.handleInvalidAuthResponse().catch(console.error);
                                    }
                                }
                            } catch (e) {
                                // Failed to parse the response; it may not be JSON
                            }
                        }
                    }).catch(_e => {
                        // Ignore response parsing errors
                    });

                    return response;
                } catch (error) {
                    // Propagate the error
                    throw error;
                }
            };

            // Clear the notification flag
            hasShownNotification.value = false;
        });

        onBeforeUnmount(() => {
            window.removeEventListener('auth:invalid', handleAuthError as unknown as EventListener);
            window.removeEventListener('error', handleAjaxError);

            // Clear the periodic-validation timer
            if (validationIntervalId !== null) {
                clearInterval(validationIntervalId);
            }

            // Restore the original fetch
            // Note: in a real application, you may need to save and restore the original fetch
            // This is simplified here because the component is usually never unmounted
        });

        return {};
    }
});
</script>

