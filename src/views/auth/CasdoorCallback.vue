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
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
    name: 'CallbackView',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        const message = ref('Processing Authentication...');
        const subMessage = ref('Please wait while we complete your login');
        const showDebug = ref(false);
        const debugInfo = ref('');
        const showRetryButton = ref(false);
        const isLoading = ref(true);
        const maxRetries = 3;
        const retryCount = ref(0);

        // 生成调试信息
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
                userAgent: navigator.userAgent
            };
            
            debugInfo.value = JSON.stringify(info, null, 2);
            return info;
        };

        // 处理登录流程
        const processLogin = async () => {
            if (retryCount.value >= maxRetries) {
                message.value = 'Maximum retries reached';
                subMessage.value = 'Please try using the direct login button';
                isLoading.value = false;
                showRetryButton.value = true;
                showDebug.value = true;
                return;
            }
            
            retryCount.value++;
            isLoading.value = true;
            message.value = 'Attempting to login...';
            subMessage.value = `Attempt ${retryCount.value}/${maxRetries}`;
            showRetryButton.value = false;
            
            try {
                // 清除旧的处理标记
                localStorage.removeItem('auth_callback_processed');
                
                // 获取认证令牌
                await casdoorService.signin();
                
                // 获取用户信息
                await userStore.refreshUserInfo();
                
                // 登录成功
                message.value = 'Login successful!';
                subMessage.value = 'Redirecting to dashboard...';
                isLoading.value = false;
                
                // 延迟重定向以显示成功消息
                setTimeout(() => {
                    router.push({ path: '/dashboard' });
                }, 1500);
            } catch (error) {
                console.error('Authentication error:', error);
                
                if (retryCount.value < maxRetries) {
                    // 自动重试
                    message.value = 'Login attempt failed';
                    subMessage.value = `Retrying (${retryCount.value}/${maxRetries})...`;
                    
                    setTimeout(() => {
                        processLogin();
                    }, 1000);
                } else {
                    // 达到最大重试次数
                    message.value = 'Login failed after multiple attempts';
                    subMessage.value = 'Please try the options below';
                    showDebug.value = true;
                    showRetryButton.value = true;
                    isLoading.value = false;
                    generateDebugInfo();
                }
            }
        };

        // 手动触发登录流程
        const handleManualLogin = async () => {
            retryCount.value = 0;
            await processLogin();
        };

        // 直接重定向到 Casdoor 登录页
        const handleDirectLogin = () => {
            // 清除所有相关存储
            sessionStorage.clear();
            localStorage.removeItem('auth_callback_processed');
            localStorage.removeItem('casdoor-token');
            localStorage.removeItem('casdoor-refresh-token');
            localStorage.removeItem('casdoor-user-info');
            
            // 重定向到登录页
            casdoorService.startLogin();
        };

        onMounted(async () => {
            // 检查URL中是否有授权码
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has('code')) {
                message.value = 'Missing authorization code';
                subMessage.value = 'Please try again';
                showRetryButton.value = true;
                isLoading.value = false;
                return;
            }
            
            // 生成调试信息
            generateDebugInfo();
            
            // 开始登录流程
            await processLogin();
        });

        return {
            message,
            subMessage,
            showDebug,
            debugInfo,
            showRetryButton,
            isLoading,
            handleManualLogin,
            handleDirectLogin
        };
    }
});
</script>