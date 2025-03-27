<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
            <div v-if="loading" class="space-y-4">
                <Icon icon="mdi:loading" class="h-12 w-12 mx-auto animate-spin text-indigo-600" />
                <p class="text-lg font-medium text-gray-700">Processing login...</p>
            </div>
            <div v-if="error" class="space-y-4 text-red-500">
                <Icon icon="mdi:alert-circle" class="h-12 w-12 mx-auto text-red-500" />
                <p class="text-lg font-medium">{{ error }}</p>
                <button @click="goToLogin"
                    class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Return to Login Page
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';

export default defineComponent({
    name: 'CallbackView',
    setup() {
        const loading = ref(true);
        const error = ref('');
        const route = useRoute();
        const router = useRouter();

        const goToLogin = () => {
            router.push('/login');
        };

        onMounted(async () => {
            try {
                const code = route.query.code as string;
                const state = route.query.state as string;
        
                if (!code || !state) {
                    throw new Error('Invalid authorization code or state');
                }
        
                // Process the callback
                await casdoorService.handleCallback(code, state);
        
                // Notify the parent window about the success
                if (window.opener) {
                    window.opener.postMessage({ success: true }, casdoorService.getServerUrl());
                }
        
                // Close the current window
                window.close();
            } catch (err: any) {
                console.error('Callback error:', err);
                error.value = err.message;
                loading.value = false;
        
                // Notify the parent window about the error
                if (window.opener) {
                    window.opener.postMessage({ success: false, error: err.message }, casdoorService.getServerUrl());
                }
        
                // Do not close the window on error
                // window.close(); // Removed this line
            }
        });

        return {
            loading,
            error,
            goToLogin
        };
    }
});
</script>