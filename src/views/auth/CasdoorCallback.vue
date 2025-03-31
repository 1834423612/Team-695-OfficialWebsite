<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-6">
            <div class="text-center">
                <Icon icon="mdi:loading" class="h-16 w-16 mx-auto animate-spin text-indigo-600" />
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                    {{ message }}
                </h2>
                <p v-if="error" class="mt-2 text-sm text-red-600">
                    {{ error }}
                </p>
                <div v-if="error" class="mt-6">
                    <button @click="goToLogin"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
    name: 'CasdoorCallback',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const message = ref('Processing your login...');
        const error = ref('');

        const goToLogin = () => {
            router.push({ name: 'login' });
        };

        onMounted(async () => {
            try {
                // Process the authentication using PKCE flow
                // The SDK will automatically extract the code from the URL
                await casdoorService.signin();

                // Update message
                message.value = 'Login successful! Redirecting...';

                // Redirect to profile page
                setTimeout(() => {
                    router.push({ name: 'profile' });
                }, 1000);
            } catch (err: any) {
                console.error('Authentication error:', err);
                message.value = 'Authentication failed';
                error.value = err.message || 'An unexpected error occurred';
            }
        });

        return {
            message,
            error,
            goToLogin
        };
    }
});
</script>