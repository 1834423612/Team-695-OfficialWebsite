<template>
    <!-- 
        Global authentication management component
        This component is not visible in the UI, but it is responsible for the following:
        1. Periodically validate user authentication tokens
        2. Handle token expiration and refresh
        3. Ensure only valid users can access restricted pages
    -->
    <div aria-hidden="true" class="auth-manager-component"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { casdoorService, AUTH_LOCKS } from '@/services/auth';
import { useUserStore } from '@/stores/userStore';
import { isLockActive, setAuthLock, releaseAuthLock } from '@/utils/authUtils';
import { 
    recordValidationTime, 
    setAbsoluteTrust, 
    isRecentLogin,
    clearTrustFlags
} from '@/utils/authConfig';
import { logger } from '@/utils/logger';

/**
 * Global authentication management component
 * Centrally handle authentication logic for all pages under /Dashboard
 * Implement centralized token validation, refresh, and user information management
 */
export default defineComponent({
    name: 'AuthManager',
    setup() {
        const route = useRoute();
        const userStore = useUserStore();

        // State flags
        const lastValidationTime = ref(Date.now());
        const validationInterval = 5 * 60 * 1000; // 5-minute validation interval
        let validationTimer: number | null = null;
        let pageVisible = ref(true);

        // Request lock to prevent duplicate requests
        const validationLock = ref<Promise<void> | null>(null);

        /**
         * Validate and ensure the user is authenticated
         * Includes a duplicate-request prevention mechanism
         */
        const validateAuth = async (): Promise<void> => {
            // Check whether the user is within 10 minutes of login; still validate during the trust window, but use a different strategy
            const isInTrustPeriod = isRecentLogin(10);
            if (isInTrustPeriod) {
                logger.debug('AuthManager: In trust period (<10min), using lightweight validation');
                
                // Mark whether this is a periodic validation
                localStorage.setItem('is_periodic_validation', 'false');

                // Ensure user information has been loaded
                if (!userStore.userInfo) {
                    try {
                        await userStore.initializeStore(true); // true = use lightweight validation
                    } catch (e) {
                        logger.warn('Failed to initialize user store during trust period:', e);
                    }
                }
                
                // Still perform API validation during the trust window, but do not log out immediately on failure
                try {
                    await casdoorService.validateWithTeamApi();
                    // Update the validation time
                    lastValidationTime.value = Date.now();
                    recordValidationTime();
                } catch (e) {
                    logger.warn('API validation during trust period failed, but continuing:', e);
                }
                return;
            }
            
            // Clear the absolute-trust flag after 10 minutes
            clearTrustFlags();
            
            // Create the validation lock key
            const AUTH_VALIDATION_LOCK = AUTH_LOCKS.VALIDATION;
            
            // Avoid concurrent validation if one is already in progress
            if (isLockActive(AUTH_VALIDATION_LOCK)) {
                logger.debug('AuthManager: Another validation is in progress, skipping');
                return;
            }
            
            // Wait for the existing validation promise if one already exists
            if (validationLock.value) {
                return validationLock.value;
            }

            // Create a new validation promise and store its reference
            validationLock.value = (async () => {
                try {
                    // Set a lock to prevent concurrent validation
                    setAuthLock(AUTH_VALIDATION_LOCK);
                    localStorage.setItem('auth_validation_start_time', Date.now().toString());
                    
                    logger.info('AuthManager: Validating authentication...');
                    
                    // Mark this as periodic validation so API validation skips the cache
                    localStorage.setItem('is_periodic_validation', 'true');

                    // Check whether the current route is under Dashboard
                    if (!route.path.startsWith('/Dashboard')) {
                        return;
                    }

                    // Check whether the user is logged in
                    if (!casdoorService.isLoggedIn()) {
                        logger.warn('AuthManager: User not logged in, redirecting to login');
                        await handleAuthFailure('You need to login to access this page');
                        return;
                    }

                    // Validate directly with the Casdoor API to ensure server-side revoked tokens are detected
                    const validationResult = await casdoorService.validateWithTeamApi();
                    
                    if (!validationResult.valid) {
                        logger.warn('AuthManager: Casdoor API validation failed');
                        
                        // Log out immediately if validation fails without attempting a refresh
                        logger.error('AuthManager: Token is invalid or revoked, logging out');
                        await handleAuthFailure('Your session has expired or been revoked. Please login again.');
                        return;
                    }

                    // Record the validation time
                    lastValidationTime.value = Date.now();
                    recordValidationTime();
                    
                    // After the token passes API validation, ensure user information is loaded
                    if (!userStore.userInfo) {
                        try {
                            // User info loading can skip validation because validation just completed
                            await userStore.initializeStore(true);
                        } catch (error) {
                            logger.error('AuthManager: Failed to load user info after validation:', error);
                            // Do not log out the user if loading user info fails
                        }
                    }
                } catch (error) {
                    logger.error('AuthManager: Authentication validation error:', error);
                } finally {
                    // Clear the periodic-validation flag
                    localStorage.removeItem('is_periodic_validation');
                    // Clear the lock after validation completes
                    validationLock.value = null;
                    releaseAuthLock(AUTH_VALIDATION_LOCK);
                }
            })();

            return validationLock.value;
        };

        /**
         * Handle authentication failure
         */
        const handleAuthFailure = async (message?: string) => {
            try {
                // Clear user information
                userStore.clearUserInfo();

                // Log out the user
                await casdoorService.logout();

                // Show the message if provided, then redirect
                if (message) {
                    if (window.$notify) {
                        window.$notify(
                            'Authentication Error',
                            message,
                            'error',
                            'Login Again',
                            () => {
                                // Redirect to login with a full page refresh
                                window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                            }
                        );
                    } else {
                        // Fallback: use the native alert
                        alert(message);
                        // Redirect to login with a full page refresh
                        window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                    }
                } else {
                    // Redirect to login with a full page refresh
                    window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                }
            } catch (error) {
                logger.error('AuthManager: Error during auth failure handling:', error);
                // Ensure the redirect goes to the login page
                window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
            }
        };

        /**
         * Set up a periodic validation timer with page-visibility support
         */
        const setupPeriodicValidation = () => {
            // Clear the existing timer
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }
            
            // Reset the last validation time to now so timing restarts after a page refresh
            lastValidationTime.value = Date.now();

            // Create a new timer using a fixed 5-minute interval
            validationTimer = window.setInterval(() => {
                // Only validate when the page is visible and no validation is already running
                if (pageVisible.value && !validationLock.value) {
                    // Skip validation during the 10-minute trust window
                    if (isRecentLogin(10)) {
                        logger.debug('AuthManager: Periodic check skipped due to recent login (<10min)');
                        return;
                    }
                    
                    logger.info('AuthManager: Periodic auth check triggered');
                    validateAuth().catch(error => logger.error('Periodic validation error:', error));
                } else {
                    logger.debug('AuthManager: Periodic check skipped - page invisible or validation in progress');
                }
            }, validationInterval);
        };

        /**
         * Handle page visibility changes
         */
        const handleVisibilityChange = () => {
            pageVisible.value = document.visibilityState === 'visible';
            
            // When the page becomes visible again, check validation timing and validate immediately if it has expired
            if (pageVisible.value && Date.now() - lastValidationTime.value >= validationInterval) {
                logger.info('Page became visible, performing authentication check');
                validateAuth().catch(error => logger.error('Visibility change validation error:', error));
            }
        };

        /**
         * Handle invalid-authentication events
         */
        const handleAuthInvalid = async (event: Event) => {
            // Cast Event to CustomEvent to access the detail property
            const customEvent = event as CustomEvent;
            logger.warn('AuthManager: Auth invalid event detected:', customEvent.detail);
            await handleAuthFailure(customEvent.detail?.message);
        };

        // Watch for route changes
        watch(() => route.path, (newPath, oldPath) => {
            if (newPath !== oldPath && newPath.startsWith('/Dashboard')) {
                validateAuth().catch(error => logger.error('Route change validation error:', error));
            }
        });

        // When the component is mounted
        onMounted(() => {
            // Clear any expired locks
            if (!isLockActive(AUTH_LOCKS.VALIDATION, 30000)) { // 30-second timeout
                releaseAuthLock(AUTH_LOCKS.VALIDATION);
            }
            
            // Check whether the user is within 10 minutes of login
            if (isRecentLogin(10)) {
                logger.debug('AuthManager: Recent login detected on mount (<10min), skipping validation');
                
                // Set the absolute-trust flag
                setAbsoluteTrust();
                
                // Update the validation time without running validation
                lastValidationTime.value = Date.now();
                recordValidationTime();
                
                // Ensure user data is loaded and skip validation
                if (!userStore.userInfo) {
                    userStore.initializeStore(true).catch(error => {
                        logger.warn('Failed to load user info during trust period:', error);
                    });
                }
            } else {
                // Clear the absolute-trust flag after 10 minutes
                clearTrustFlags();
                
                // Run validation
                logger.info('AuthManager: Not in trust period, performing validation');
                validateAuth().catch(error => logger.error('Initial validation error:', error));
            }

            // Set up periodic validation
            setupPeriodicValidation();

            // Listen for invalid-authentication events
            window.addEventListener('auth:invalid', handleAuthInvalid);
            
            // Listen for page-visibility changes
            document.addEventListener('visibilitychange', handleVisibilityChange);
        });

        // Before the component is unmounted
        onBeforeUnmount(() => {
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }

            window.removeEventListener('auth:invalid', handleAuthInvalid);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        });

        return {};
    },
});
</script>

<style scoped>
/* Keep the component invisible while preserving it in the DOM */
.auth-manager-component {
    display: none;
    height: 0;
    width: 0;
    position: absolute;
    overflow: hidden;
}
</style>


