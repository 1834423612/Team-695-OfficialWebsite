<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                <p class="mt-2 text-sm text-gray-600">
                    Authenticate with Casdoor
                </p>
            </div>

            <div class="mt-8">
                <button v-if="!isLoggedIn" @click="handleLogin"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Icon icon="mdi:login" class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                    </span>
                    Sign in with Casdoor
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
    name: 'LoginView',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const isLoggedIn = ref(false);

        const handleLogin = () => {
            // Open Casdoor login page in a new window
            const loginWindow = window.open(
                casdoorService.getSigninUrl(),
                '_blank',
                'width=500,height=600'
            );

            if (!loginWindow || loginWindow.closed || typeof loginWindow.closed === 'undefined') {
                console.error('Popup blocked or window failed to open');
                // Show user-friendly error message about popup blockers
                alert('Please allow popups for this site to continue with login');
                return;
            }

            // Listen for messages from the login window
            const messageListener = (event: MessageEvent) => {
                if (event.origin !== casdoorService.getServerUrl()) {
                    return; // Ignore messages from unknown origins
                }

                const { success, error } = event.data;

                if (success) {
                    // Login successful, navigate to success page
                    router.push({ name: 'login-success' });
                } else if (error) {
                    // Handle login error
                    console.error('Login failed:', error);
                    isLoggedIn.value = false;
                    // Provide user feedback about the error
                    alert(`Login failed: ${error || 'Unknown error'}`);
                }

                // Clean up listener and close the login window
                window.removeEventListener('message', messageListener);
                loginWindow?.close();
            };

            window.addEventListener('message', messageListener);
        };

        // Check if user is already logged in
        const checkLoginStatus = () => {
            if (localStorage.getItem('casdoorToken')) {
                router.push({ name: 'login-success' });
            }
        };

        onMounted(() => {
            // Check if user is already logged in
            checkLoginStatus();

            // Listen for changes in localStorage to detect login status updates
            window.addEventListener('storage', () => {
                checkLoginStatus();
            });
        });

        return {
            handleLogin,
            isLoggedIn
        };
    }
});
</script>