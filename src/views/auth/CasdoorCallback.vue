<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="flex items-center justify-center">
                        <Icon icon="line-md:loading-loop" class="w-12 h-12 text-blue-600" />
                    </div>
                </div>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ message }}</h2>
                <p class="text-gray-600">{{ subMessage }}</p>
                <div v-if="showDebug" class="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
                    <pre>{{ debugInfo }}</pre>
                </div>
                <!-- Only show the button if the user is logged in and in development mode -->
                <button v-if="showRedirectButton" @click="redirectToDashboard"
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Go to Dashboard
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import Cookies from 'js-cookie';

export default defineComponent({
    name: 'CallbackView',
    setup() {
        const router = useRouter();
        const message = ref('Logging in...');
        const subMessage = ref('Please wait while we process your login request');
        const showDebug = ref(false);
        const debugInfo = ref('');
        const showRedirectButton = ref(false);

        const checkTokenStatus = () => {
            const cookieToken = Cookies.get('casdoor-token');
            const localStorageToken = localStorage.getItem('casdoor-token');
            const info = {
                cookieToken: cookieToken ? 'Exists' : 'Does not exist',
                localStorageToken: localStorageToken ? 'Exists' : 'Does not exist',
                isLoggedIn: casdoorService.isLoggedIn() ? 'Yes' : 'No',
                url: window.location.href,
                hasHash: !!window.location.hash,
                hasCode: new URLSearchParams(window.location.search).has('code'),
                userAgent: navigator.userAgent
            };
            debugInfo.value = JSON.stringify(info, null, 2);
            return info;
        };

        const redirectToDashboard = () => {
            router.push({ path: '/dashboard' });
        };

        const handleManualTokenStorage = () => {
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
                localStorage.setItem('casdoor-token', token);
                Cookies.set('casdoor-token', token);
                return true;
            }
            return false;
        };

        onMounted(async () => {
            try {
                const tokenStatus = checkTokenStatus();
                console.log('Initial token status:', tokenStatus);

                const manuallyHandled = handleManualTokenStorage();
                if (!manuallyHandled) {
                    message.value = 'Processing authentication...';
                    const urlParams = new URLSearchParams(window.location.search);
                    const hasCode = urlParams.has('code');
                    if (hasCode) {
                        await casdoorService.signin();
                    } else {
                        throw new Error('No authorization code found in URL');
                    }
                }

                const finalTokenStatus = checkTokenStatus();
                console.log('Final token status:', finalTokenStatus);

                if (casdoorService.isLoggedIn()) {
                    message.value = 'Login successful!';
                    subMessage.value = 'Click the button below to proceed to the dashboard.';
                    if (process.env.NODE_ENV === 'development') {
                        showRedirectButton.value = true; // Show button in development mode
                    } else {
                        redirectToDashboard(); // Automatically redirect in production mode
                    }
                } else {
                    message.value = 'Login process completed, but no valid token detected';
                    subMessage.value = 'Please check the debug information below or contact the administrator';
                    showDebug.value = true;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                message.value = 'Login failed';
                subMessage.value = 'Please try again or contact the administrator';
                showDebug.value = true;
                setTimeout(() => {
                    router.push({ path: '/login' });
                }, 5000);
            }
        });

        return {
            message,
            subMessage,
            showDebug,
            debugInfo,
            showRedirectButton,
            redirectToDashboard
        };
    }
});
</script>