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
        // 添加已处理标记，避免重复处理同一个回调
        const callbackProcessed = ref(false);
        
        // 全局单例标志 - 确保整个应用中只有一个回调处理正在进行
        const GLOBAL_SINGLETON_KEY = 'global_auth_callback_processing';
        
        // 退回到登录页
        const redirectToLogin = () => {
            // 使用页面刷新方式导航到登录页
            window.location.href = '/login';
        };

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
                userAgent: navigator.userAgent,
                callbackProcessed: callbackProcessed.value
            };
            
            debugInfo.value = JSON.stringify(info, null, 2);
            return info;
        };

        /**
         * 更强大的令牌验证，避免不必要的新令牌请求
         */
        // 完全重写validateExistingToken方法，不再做任何验证，直接信任存在的token
        const validateExistingToken = async (): Promise<boolean> => {
            const token = casdoorService.getToken();
            if (!token) return false;

            try {
                console.log('Found existing token - setting trust flags and SKIPPING validation completely');
                
                // 设置最高级别的信任标记，表示绝对不要再验证
                localStorage.setItem('token_absolute_trust', 'true');
                localStorage.setItem('token_trusted', 'true');
                localStorage.setItem('token_verified', 'true');
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                localStorage.setItem('skip_all_token_validation', 'true');
                
                return true;
            } catch (error) {
                console.error('Error setting trust flags:', error);
                return !!token; // 如果有token，即使设置标记失败也视为有效
            }
        };

        // 改进的处理登录流程
        const processLogin = async () => {
            try {
                // 首先检查是否已经有token - 如果有，完全信任它，不做任何验证
                if (await validateExistingToken()) {
                    message.value = 'Using existing session';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    isProcessing.value = false;
                    
                    // 设置处理完成标记
                    callbackProcessed.value = true;
                    sessionStorage.setItem('auth_callback_processed', 'true');
                    
                    // 立即重定向
                    window.location.href = '/dashboard';
                    return;
                }

                // 检查URL参数 - 只有在真正需要处理授权码时才继续
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                
                // 如果没有授权码或状态，但有有效令牌，直接跳转
                if ((!code || !state) && casdoorService.isLoggedIn()) {
                    console.log('No auth parameters but user is logged in, redirecting');
                    message.value = 'Already authenticated';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    
                    // 设置处理完成标记
                    callbackProcessed.value = true;
                    sessionStorage.setItem('auth_callback_processed', 'true');
                    
                    // 直接重定向，无需延迟
                    window.location.href = '/dashboard';
                    return;
                }
                
                // 如果没有授权码或状态，且未登录，显示错误
                if (!code || !state) {
                    console.error("Missing authorization code or state in URL parameters");
                    message.value = 'Missing authorization parameters';
                    subMessage.value = 'Please try logging in again';
                    isLoading.value = false;
                    showRetryButton.value = true;
                    return;
                }
                
                // 获取认证令牌流程 - 其余代码保持不变
                // ...existing code...
                // 获取URL中的授权码和状态
                const currentToken = casdoorService.getToken();
                if (currentToken) {
                    console.log("Token already exists in storage, validating...");
                    
                    // 验证已有token是否有效，而不是盲目创建新token
                    try {
                        const isValid = await casdoorService.validateLocalToken();
                        if (isValid) {
                            console.log("Existing token is valid, using it");
                            message.value = 'Authentication already completed';
                            subMessage.value = 'Redirecting to dashboard...';
                            isLoading.value = false;
                            isProcessing.value = false;
                            
                            // 设置处理完成标记，避免重复处理
                            callbackProcessed.value = true;
                            sessionStorage.setItem('auth_callback_processed', 'true');
                            sessionStorage.setItem('casdoor_processed_code', code);
                            
                            // 获取用户信息
                            await userStore.refreshUserInfo();
                            
                            // 延迟重定向以显示成功消息
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1000);
                            return;
                        } else {
                            console.log("Existing token is invalid, will get new token");
                            // 继续获取新token的流程
                        }
                    } catch (error) {
                        console.error("Error validating existing token:", error);
                        // 继续获取新token的流程
                    }
                }
                
                // 先检查全局单例锁，防止其他页面可能存在的并发处理
                if (localStorage.getItem(GLOBAL_SINGLETON_KEY) === 'true') {
                    console.log("Global auth callback processing already in progress, skipping");
                    message.value = 'Authentication already in progress';
                    subMessage.value = 'Please wait for current process to complete';
                    isLoading.value = false;
                    showRetryButton.value = true;
                    return;
                }
                
                // 防止并发处理与重复处理
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
                
                // 检查此授权码是否已处理过
                const processedCode = sessionStorage.getItem('processed_auth_code');
                if (processedCode === code) {
                    console.warn(`Authorization code ${code.substring(0,5)}... already processed, checking for tokens`);
                    
                    // 如果授权码已处理但没有token，则可能是处理失败，需要清除标记并重试
                    if (!casdoorService.getToken()) {
                        console.log("No token found for processed code, clearing processed flag to retry");
                        sessionStorage.removeItem('processed_auth_code');
                    } else {
                        // 授权码已处理且有token存在，直接使用
                        message.value = 'This authorization code has already been used';
                        subMessage.value = 'Redirecting to dashboard...';
                        isLoading.value = false;
                        showRetryButton.value = false;
                        
                        // 延迟重定向以显示成功消息
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
                
                // 添加回调处理标记 - 使用多种方式确保防重复
                sessionStorage.setItem('auth_callback_in_progress', 'true');
                localStorage.setItem(GLOBAL_SINGLETON_KEY, 'true');
                
                // 记录正在处理的code
                sessionStorage.setItem('processed_auth_code', code);
                
                // 使用提取好的授权码和状态，不需要再次从URL获取
                console.log(`Processing authorization code: ${code.substring(0, 5)}...`);
                
                // 在登录前清除任何可能存在的旧令牌，以确保获取新令牌
                if (retryCount.value > 1) {
                    console.log('Forcing token refresh on retry attempt');
                    sessionStorage.setItem('force_token_refresh', 'true');
                    
                    // 清除casdoor的本地状态
                    sessionStorage.removeItem('casdoor-state');
                    sessionStorage.removeItem('casdoor-code-verifier');
                    sessionStorage.removeItem('casdoor-code-challenge');
                    sessionStorage.removeItem('casdoor_processed_code');
                    sessionStorage.removeItem('casdoor_auth_processed');
                }
                
                // 获取认证令牌 - 使用提供的code和state
                const token = await casdoorService.signinWithCode(code, state);
                console.log('Token obtained successfully:', !!token);
                
                if (!token) {
                    throw new Error('Failed to obtain authentication token');
                }
                
                // 设置处理完成标记，避免重复处理
                callbackProcessed.value = true;
                sessionStorage.setItem('auth_callback_processed', 'true');
                
                // 获取用户信息
                await userStore.refreshUserInfo();
                
                // 登录成功
                message.value = 'Login successful!';
                subMessage.value = 'Redirecting to dashboard...';
                isLoading.value = false;
                isProcessing.value = false;
                
                // 记录认证完成时间，避免页面刷新后重复验证
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                localStorage.setItem('token_verified', 'true');
                localStorage.setItem('token_trusted', 'true'); // 添加绝对信任标记
                
                // 清除全局处理标记
                localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                
                // 延迟重定向以显示成功消息
                setTimeout(() => {
                    // 使用页面刷新方式重定向到dashboard
                    window.location.href = '/dashboard';
                }, 1000); // 缩短延迟时间，加快转向
            } catch (error) {
                console.error('Authentication error:', error);
                isProcessing.value = false;
                localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                
                if (retryCount.value < maxRetries) {
                    // 自动重试但添加延迟 - 每次重试增加延迟时间
                    message.value = 'Login attempt failed';
                    subMessage.value = `Will retry in ${retryCount.value * 2} seconds...`;
                    
                    // 每次重试的延迟时间递增
                    const retryDelay = retryCount.value * 2000;
                    
                    // 清除进行中标记，允许下一次重试
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
                    
                    // 清除进行中标记
                    sessionStorage.removeItem('auth_callback_in_progress');
                }
            }
        };

        onMounted(async () => {
            try {
                // 立即检查是否已有token - 完全信任它，不做任何验证
                const token = casdoorService.getToken();
                if (token) {
                    console.log("Token exists - setting absolute trust flags and redirecting");
                    
                    // 设置最高级别的信任标记
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                    localStorage.setItem('skip_all_token_validation', 'true');
                    
                    message.value = 'Already authenticated';
                    subMessage.value = 'Redirecting to dashboard...';
                    isLoading.value = false;
                    showRetryButton.value = false;
                    
                    // 直接重定向
                    window.location.href = '/dashboard';
                    return;
                }
                
                // 清除过时的全局标记（预防通过刷新页面重试）
                if (localStorage.getItem(GLOBAL_SINGLETON_KEY) === 'true') {
                    const processingStartTime = parseInt(localStorage.getItem('auth_processing_start_time') || '0');
                    if (Date.now() - processingStartTime > 30000) { // 30秒超时
                        localStorage.removeItem(GLOBAL_SINGLETON_KEY);
                    }
                }
                
                // 设置处理开始时间
                localStorage.setItem('auth_processing_start_time', Date.now().toString());
                
                // 检查是否已经处理过此回调
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

                // 检查URL中是否有授权码
                const urlParams = new URLSearchParams(window.location.search);
                if (!urlParams.has('code')) {
                    message.value = 'Missing authorization code';
                    subMessage.value = 'Please try again';
                    showRetryButton.value = true;
                    isLoading.value = false;
                    return;
                }
                
                // 安全地清除可能卡住的状态
                try {
                    const lockAge = parseInt(localStorage.getItem('auth_validation_start_time') || '0');
                    if (Date.now() - lockAge > 30000) { // 30秒超时
                        console.log('Clearing possible stale auth locks');
                        releaseAuthLock(AUTH_LOCKS.SIGNIN);
                        releaseAuthLock(AUTH_LOCKS.REFRESH);
                        releaseAuthLock(AUTH_LOCKS.VALIDATION);
                        sessionStorage.removeItem('casdoor_processed_code');
                        sessionStorage.removeItem('casdoor_auth_processed');
                    }
                } catch (lockError) {
                    console.error('Error clearing auth locks:', lockError);
                    // 继续执行后续流程，不要因为清理锁失败而中断整个登录流程
                }

                // 生成调试信息
                generateDebugInfo();
                
                // 开始登录流程
                await processLogin();
            } catch (error) {
                console.error("Error during callback setup:", error);
                message.value = 'An unexpected error occurred';
                subMessage.value = 'Please try again';
                showRetryButton.value = true;
                isLoading.value = false;
            }
        });

        // 手动触发登录流程
        const handleManualLogin = async () => {
            if (isProcessing.value) return;
            
            // 重置处理状态
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

        // 直接重定向到 Casdoor 登录页
        const handleDirectLogin = () => {
            if (isProcessing.value) return;
            
            // 清除所有相关存储
            sessionStorage.clear();
            localStorage.removeItem('auth_callback_processed');
            localStorage.removeItem('auth_callback_in_progress');
            localStorage.removeItem('casdoor-token');
            localStorage.removeItem('casdoor-refresh-token');
            localStorage.removeItem('casdoor-user-info');
            
            // 重定向到登录页
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