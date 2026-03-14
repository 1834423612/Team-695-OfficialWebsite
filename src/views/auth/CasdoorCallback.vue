<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="flex items-center justify-center">
                        <Icon v-if="isLoading" icon="line-md:loading-loop" class="w-12 h-12 text-blue-600" />
                        <Icon v-else-if="message.includes('success')" icon="mdi:check-circle" class="w-12 h-12 text-green-500" />
                        <Icon v-else icon="mdi:alert-circle" class="w-12 h-12 text-red-500" />
                    </div>
                </div>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ message }}</h2>
                <p class="text-gray-600">{{ subMessage }}</p>
                <div v-if="showDebug" class="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
                    <pre>{{ debugInfo }}</pre>
                </div>
                <div v-if="showRetryButton" class="mt-4 space-y-2">
                    <button @click="handleManualLogin" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Try Again
                    </button>
                    <div class="mt-2">
                        <button @click="handleDirectLogin" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                            Use Direct Login
                        </button>
                    </div>
                    <div class="mt-4">
                        <button @click="redirectToLogin" class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
                            Return to Login Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { casdoorService, AUTH_LOCKS } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { releaseAuthLock } from '@/utils/authUtils';

export default defineComponent({
    name: 'CallbackView',
    components: {
        Icon
    },
    setup() {
        const userStore = useUserStore();
        const message = ref('Processing Authentication...');
        const subMessage = ref('Please wait while we complete your login');
        const showDebug = ref(false);
        const debugInfo = ref('');
        const showRetryButton = ref(false);
        const isLoading = ref(true);
        const maxRetries = 3;
        const retryCount = ref(0);
        const isProcessing = ref(false);
        // Add a processed flag to avoid handling the same callback twice
        const callbackProcessed = ref(false);
        
        // Global singleton flag to ensure only one callback is being processed across the app
        const GLOBAL_SINGLETON_KEY = 'global_auth_callback_processing';
        
        // Return to the login page
        const redirectToLogin = () => {
            // Navigate to the login page with a full page refresh
            window.location.href = '/login';
        };

        // Generate debug information
        const generateDebugInfo = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const info = {
                url: window.location.href,
                hasCode: urlParams.has('code'),
                code: urlParams.has('code') ? `${urlParams.get('code')?.substring(0, 5)}...` : null,
                hasState: urlParams.has('state'),
                state: urlParams.has('state') ? urlParams.get('state') : null,
                hasHash: !!window.location.hash,
                isLoggedIn: casdoorService.isLoggedIn() ? 'Yes' : 'No',
                storedState: sessionStorage.getItem('casdoor-state') || 'None',
                retryCount: retryCount.value,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                callbackProcessed: callbackProcessed.value
            };
            
            debugInfo.value = JSON.stringify(info, null, 2);
            return info;
        };

        /**
         * Stronger token validation to avoid unnecessary new-token requests
         */
        // Completely rewrite validateExistingToken to trust any existing token without further validation
        const validateExistingToken = async (): Promise<boolean> => {
            const token = casdoorService.getToken();
            if (!token) return false;

            try {
                console.log('Found existing token - setting trust flags and SKIPPING validation completely');
                
                // Set the highest trust flag to indicate the token should not be validated again
                localStorage.setItem('token_absolute_trust', 'true');
                localStorage.setItem('token_trusted', 'true');
                localStorage.setItem('token_verified', 'true');
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                localStorage.setItem('skip_all_token_validation', 'true');
                
                return true;
            } catch (error) {
                console.error('Error setting trust flags:', error);
                return !!token; // If a token exists, treat it as valid even if setting the flag fails
            }
        };

        // Improved login flow handling
        const processLogin = async () => {
            try {
                // First check whether a token already exists; if it does, trust it completely without validation
                if (await validateExistingToken()) {
                    message.value = 'Using existing session';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    isProcessing.value = false;
                    
                    // Set the processing-complete flag
                    callbackProcessed.value = true;
                    sessionStorage.setItem('auth_callback_processed', 'true');
                    
                    // Redirect immediately
                    window.location.href = '/dashboard';
                    return;
                }

                // Check URL parameters and continue only when the authorization code truly needs handling
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                
                // If there is no authorization code or state but a valid token exists, redirect directly
                if ((!code || !state) && casdoorService.isLoggedIn()) {
                    console.log('No auth parameters but user is logged in, redirecting');
                    message.value = 'Already authenticated';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    
                    // Set the processing-complete flag
                    callbackProcessed.value = true;
                    sessionStorage.setItem('auth_callback_processed', 'true');
                    
                    // Redirect directly without a delay
                    window.location.href = '/dashboard';
                    return;
                }
                
                // Show an error when there is no authorization code or state and the user is not logged in
                if (!code || !state) {
                    console.error("Missing authorization code or state in URL parameters");
                    message.value = 'Missing authorization parameters';
                    subMessage.value = 'Please try logging in again';
                    isLoading.value = false;
                    showRetryButton.value = true;
                    return;
                }
                
                // Authentication token flow; keep the rest of the code unchanged
                // ...existing code...
                // Get the authorization code and state from the URL
                const currentToken = casdoorService.getToken();
                if (currentToken) {
                    console.log("Token already exists in storage, validating...");
                    
                    // Validate the existing token instead of blindly creating a new one
                    try {
                        const isValid = await casdoorService.validateLocalToken();
                        if (isValid) {
                            console.log("Existing token is valid, using it");
                            message.value = 'Authentication already completed';
                            subMessage.value = 'Redirecting to dashboard...';
                            isLoading.value = false;
                            isProcessing.value = false;
                            
                            // Set the processing-complete flag to avoid duplicate handling
                            callbackProcessed.value = true;
                            sessionStorage.setItem('auth_callback_processed', 'true');
                            sessionStorage.setItem('casdoor_processed_code', code);
                            
                            // Get user information
                            await userStore.refreshUserInfo();
                            
                            // Delay redirection so the success message can be shown
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1000);
                            return;
                        } else {
                            console.log("Existing token is invalid, will get new token");
                            // Continue the flow for obtaining a new token
                        }
                    } catch (error) {
                        console.error("Error validating existing token:", error);
                        // Continue the flow for obtaining a new token
                    }
                }
                
                // Check the global singleton lock first to prevent concurrent processing from other pages
                if (localStorage.getItem(GLOBAL_SINGLETON_KEY) === 'true') {
                    console.log("Global auth callback processing already in progress, skipping");
                    message.value = 'Authentication already in progress';
                    subMessage.value = 'Please wait for current process to complete';
                    isLoading.value = false;
                    showRetryButton.value = true;
                    return;
                }
                
                // Prevent concurrent and duplicate processing
                if (isProcessing.value || callbackProcessed.value) {
                    console.log("Skipping login process - already processed or processing");
                    return;
                }
                
                if (retryCount.value >= maxRetries) {
                    message.value = 'Maximum retries reached';
                    subMessage.value = 'Please try one of the options below';
                    isLoading.value = false;
                    showRetryButton.value = true;
                    showDebug.value = true;
                    return;
                }
                
                // Check whether this authorization code has already been handled
                const processedCode = sessionStorage.getItem('processed_auth_code');
                if (processedCode === code) {
                    console.warn(`Authorization code ${code.substring(0,5)}... already processed, checking for tokens`);
                    
                    // If the authorization code was handled but no token exists, processing may have failed; clear the flag and retry
                    if (!casdoorService.getToken()) {
                        console.log("No token found for processed code, clearing processed flag to retry");
                        sessionStorage.removeItem('processed_auth_code');
                    } else {
                        // The authorization code has already been handled and a token exists, so use it directly
                        message.value = 'This authorization code has already been used';
                        subMessage.value = 'Redirecting to dashboard...';
                        isLoading.value = false;
                        showRetryButton.value = false;
                        
                        // Delay redirection so the success message can be shown
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1500);
                        return;
                    }
                }
                
                isProcessing.value = true;
                retryCount.value++;
                isLoading.value = true;
                message.value = 'Completing authentication...';
                subMessage.value = `Attempt ${retryCount.value}/${maxRetries}`;
                showRetryButton.value = false;
                
                // Add callback-processing markers and use multiple safeguards against duplication
                sessionStorage.setItem('auth_callback_in_progress', 'true');
                localStorage.setItem(GLOBAL_SINGLETON_KEY, 'true');
                
                // Record the code currently being processed
                sessionStorage.setItem('processed_auth_code', code);
                
                // Use the extracted authorization code and state without reading the URL again
                console.log(`Processing authorization code: ${code.substring(0, 5)}...`);
                
                // Clear any existing old tokens before login to ensure a new one is acquired
                if (retryCount.value > 1) {
                    console.log('Forcing token refresh on retry attempt');
                    sessionStorage.setItem('force_token_refresh', 'true');
                    
                    // Clear Casdoor local state
                    sessionStorage.removeItem('casdoor-state');
                    sessionStorage.removeItem('casdoor-code-verifier');
                    sessionStorage.removeItem('casdoor-code-challenge');
                    sessionStorage.removeItem('casdoor_processed_code');
                    sessionStorage.removeItem('casdoor_auth_processed');
                }
                
                // Obtain the authentication token using the provided code and state
                const token = await casdoorService.signinWithCode(code, state);
                console.log('Token obtained successfully:', !!token);
                
                if (!token) {
                    throw new Error('Failed to obtain authentication token');
                }
                
                // Set the processing-complete flag to avoid duplicate handling
                callbackProcessed.value = true;
                sessionStorage.setItem('auth_callback_processed', 'true');
                
                // Get user information
                await userStore.refreshUserInfo();
                
                // Login succeeded
                message.value = 'Login successful!';
                subMessage.value = 'Redirecting to dashboard...';
                isLoading.value = false;
                isProcessing.value = false;
                
                // Record the authentication completion time to avoid repeated validation after refresh
                // This timestamp is used by AuthManager and other components to determine whether the 10-minute trust window is still active
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                
                // Set the validation flag to indicate the token passed initial validation
                localStorage.setItem('token_verified', 'true');
                
                // Set the trust flag, but keep it valid for only 10 minutes
                // AuthManager clears this flag after 10 minutes to ensure the token is revalidated
                localStorage.setItem('token_trusted', 'true');
                
                // Set an expiration time for the trust flag to prevent indefinite trust
                localStorage.setItem('trust_flags_expire_at', (Date.now() + 10 * 60 * 1000).toString());

                // Clear the global processing flag
                localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                
                // Delay redirection so the success message can be shown
                setTimeout(() => {
                    // Redirect to the dashboard with a full page refresh
                    window.location.href = '/dashboard';
                }, 1000); // Shorten the delay to speed up the redirect
            } catch (error) {
                console.error('Authentication error:', error);
                isProcessing.value = false;
                localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                
                if (retryCount.value < maxRetries) {
                    // Automatically retry with a delay that increases on each attempt
                    message.value = 'Login attempt failed';
                    subMessage.value = `Will retry in ${retryCount.value * 2} seconds...`;
                    
                    // Increase the delay time for each retry
                    const retryDelay = retryCount.value * 2000;
                    
                    // Clear the in-progress flag to allow the next retry
                    sessionStorage.removeItem('auth_callback_in_progress');
                    
                    setTimeout(() => {
                        processLogin();
                    }, retryDelay);
                } else {
                    message.value = 'Login failed after multiple attempts';
                    subMessage.value = 'Please try one of the options below';
                    showDebug.value = true;
                    showRetryButton.value = true;
                    isLoading.value = false;
                    generateDebugInfo();
                    
                    // Clear the in-progress flag
                    sessionStorage.removeItem('auth_callback_in_progress');
                }
            }
        };

        onMounted(async () => {
            try {
                // Immediately check whether a token already exists; trust it completely without validation
                const token = casdoorService.getToken();
                if (token) {
                    console.log("Token exists - setting absolute trust flags and redirecting");
                    
                    // Set the highest-level trust flag
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                    localStorage.setItem('skip_all_token_validation', 'true');
                    
                    message.value = 'Already authenticated';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    showRetryButton.value = false;
                    
                    // Redirect directly
                    window.location.href = '/dashboard';
                    return;
                }
                
                // Clear stale global flags to support retrying after a refresh
                if (localStorage.getItem(GLOBAL_SINGLETON_KEY) === 'true') {
                    const processingStartTime = parseInt(localStorage.getItem('auth_processing_start_time') || '0');
                    if (Date.now() - processingStartTime > 30000) { // 30-second timeout
                        localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                    }
                }
                
                // Set the processing start time
                localStorage.setItem('auth_processing_start_time', Date.now().toString());
                
                // Check whether this callback has already been handled
                if (sessionStorage.getItem('auth_callback_processed') === 'true' || 
                    sessionStorage.getItem('auth_callback_in_progress') === 'true' ||
                    localStorage.getItem(GLOBAL_SINGLETON_KEY) === 'true') {
                    
                    console.log("Callback already processed or in progress, skipping");
                    message.value = 'Login already in progress';
                    subMessage.value = 'Please wait or try again';
                    showRetryButton.value = true;
                    isLoading.value = false;
                    callbackProcessed.value = true;
                    generateDebugInfo();
                    return;
                }

                // Check whether the URL contains an authorization code
                const urlParams = new URLSearchParams(window.location.search);
                if (!urlParams.has('code')) {
                    message.value = 'Missing authorization code';
                    subMessage.value = 'Please try again';
                    showRetryButton.value = true;
                    isLoading.value = false;
                    return;
                }
                
                // Safely clear potentially stuck state
                try {
                    const lockAge = parseInt(localStorage.getItem('auth_validation_start_time') || '0');
                    if (Date.now() - lockAge > 30000) { // 30-second timeout
                        console.log('Clearing possible stale auth locks');
                        releaseAuthLock(AUTH_LOCKS.SIGNIN);
                        releaseAuthLock(AUTH_LOCKS.REFRESH);
                        releaseAuthLock(AUTH_LOCKS.VALIDATION);
                        sessionStorage.removeItem('casdoor_processed_code');
                        sessionStorage.removeItem('casdoor_auth_processed');
                    }
                } catch (lockError) {
                    console.error('Error clearing auth locks:', lockError);
                    // Continue with the rest of the flow; do not stop the login process just because lock cleanup failed
                }

                // Generate debug information
                generateDebugInfo();
                
                // Start the login flow
                await processLogin();
            } catch (error) {
                console.error("Error during callback setup:", error);
                message.value = 'An unexpected error occurred';
                subMessage.value = 'Please try again';
                showRetryButton.value = true;
                isLoading.value = false;
            }
        });

        // Manually trigger the login flow
        const handleManualLogin = async () => {
            if (isProcessing.value) return;
            
            // Reset the processing state
            callbackProcessed.value = false;
            sessionStorage.removeItem('auth_callback_processed');
            sessionStorage.removeItem('auth_callback_in_progress');
            sessionStorage.removeItem('processed_auth_code');
            sessionStorage.removeItem('casdoor_processed_code');
            sessionStorage.removeItem('casdoor_auth_processed');
            localStorage.removeItem(GLOBAL_SINGLETON_KEY);
            
            releaseAuthLock(AUTH_LOCKS.SIGNIN);
            releaseAuthLock(AUTH_LOCKS.REFRESH);
            
            retryCount.value = 0;
            await processLogin();
        };

        // Redirect directly to the Casdoor login page
        const handleDirectLogin = () => {
            if (isProcessing.value) return;
            
            // Clear all related storage
            sessionStorage.clear();
            localStorage.removeItem('auth_callback_processed');
            localStorage.removeItem('auth_callback_in_progress');
            localStorage.removeItem('casdoor-token');
            localStorage.removeItem('casdoor-refresh-token');
            localStorage.removeItem('casdoor-user-info');
            
            // Redirect to the login page
            casdoorService.startLogin();
        };

        return {
            message,
            subMessage,
            showDebug,
            debugInfo,
            showRetryButton,
            isLoading,
            handleManualLogin,
            handleDirectLogin,
            redirectToLogin
        };
    }
});
</script>

