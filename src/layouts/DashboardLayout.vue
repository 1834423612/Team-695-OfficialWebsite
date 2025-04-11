<template>
    <div>
        <!-- 加载状态显示 -->
        <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
            <div class="text-center p-8 bg-white rounded-lg shadow-lg">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4">
                </div>
                <p class="text-gray-700 text-lg font-semibold">Loading user information...</p>
                <p class="text-sm text-gray-500 mt-2">Please wait</p>
            </div>
        </div>

        <!-- 错误状态显示 -->
        <div v-else-if="error" class="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div class="flex items-center justify-center mb-4">
                    <div class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:alert-circle" class="h-8 w-8 text-red-500" />
                    </div>
                </div>
                <h2 class="text-xl font-bold text-center text-gray-900 mb-2">Authentication Error</h2>
                <p class="text-gray-600 text-center mb-4">{{ error }}</p>
                
                <div v-if="isUnauthorizedError" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p class="text-amber-800 text-sm">
                        <strong>401 Unauthorized:</strong> Your login session has expired or is invalid. Please try to log in again.
                    </p>
                </div>
                
                <div class="flex flex-col space-y-3">
                    <button @click="retryAuth" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                        <Icon icon="mdi:refresh" class="mr-2" />
                        Retry Authentication
                    </button>
                    <button @click="directLogin" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center">
                        <Icon icon="mdi:login" class="mr-2" />
                        Login Again
                    </button>
                    <button @click="logout" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center">
                        <Icon icon="mdi:logout" class="mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </div>

        <!-- 主体内容 -->
        <template v-else>
            <slot></slot>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
    name: 'DashboardLayout',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        const isLoading = ref(true);
        const error = ref<string | null>(null);
        const authCheckInterval = ref<number | null>(null);
        const initRetries = ref(0);
        const maxRetries = 3;

        // Check if the error is a 401 Unauthorized error
        const isUnauthorizedError = computed(() => {
            return error.value?.toLowerCase().includes('unauthorized') || 
                   error.value?.includes('401');
        });

        // Direct login by redirecting to Casdoor login page
        const directLogin = () => {
            // Clear any stored tokens before redirecting
            casdoorService.logout();
            userStore.clearUserInfo();
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                casdoorService.startLogin();
            }, 100);
        };

        // Retry authentication
        const retryAuth = async () => {
            isLoading.value = true;
            error.value = null;

            try {
                // Check if we have a token and try to refresh it
                if (casdoorService.isLoggedIn()) {
                    await casdoorService.refreshAccessToken();
                } else {
                    // No token, redirect to login
                    router.push('/login');
                    return;
                }

                // Get user info
                await userStore.refreshUserInfo();
                isLoading.value = false;
            } catch (err) {
                error.value = err instanceof Error ? err.message : 'Authentication failed';
                console.error('Authentication retry failed:', err);
                isLoading.value = false;
            }
        };

        // Logout
        const logout = () => {
            casdoorService.logout();
            userStore.clearUserInfo();
            router.push('/login');
        };

        // Periodically check authentication status
        const setupAuthCheck = () => {
            authCheckInterval.value = window.setInterval(() => {
                if (!casdoorService.isLoggedIn()) {
                    console.log('Auth check: User not logged in, redirecting to login');
                    logout();
                }
            }, 60000); // Check every minute
        };

        // Initialize authentication and user info
        const initializeAuth = async () => {
            if (initRetries.value >= maxRetries) {
                error.value = 'Unable to load user information. Please try logging in again.';
                isLoading.value = false;
                return;
            }

            isLoading.value = true;
            error.value = null;

            try {
                // Check login status
                if (!casdoorService.isLoggedIn()) {
                    console.log('User not logged in, redirecting to login');
                    router.push('/login');
                    return;
                }

                // Initialize user store
                await userStore.initializeStore();

                if (!userStore.userInfo && initRetries.value < maxRetries) {
                    // If getting user info fails but token is valid, retry
                    initRetries.value++;
                    console.log(`Retrying user info fetch: attempt ${initRetries.value}`);
                    setTimeout(initializeAuth, 1000);
                    return;
                }

                isLoading.value = false;

                // Set up periodic check
                setupAuthCheck();
            } catch (err) {
                console.error('Dashboard layout auth error:', err);

                if (initRetries.value < maxRetries) {
                    // Auto retry
                    initRetries.value++;
                    console.log(`Auth error, retrying: attempt ${initRetries.value}`);
                    setTimeout(initializeAuth, 1000);
                } else {
                    error.value = err instanceof Error ? err.message : 'Failed to load user information';
                    isLoading.value = false;
                }
            }
        };

        onMounted(initializeAuth);

        onUnmounted(() => {
            if (authCheckInterval.value !== null) {
                window.clearInterval(authCheckInterval.value);
            }
        });

        return {
            isLoading,
            error,
            isUnauthorizedError,
            retryAuth,
            directLogin,
            logout
        };
    }
});
</script>
