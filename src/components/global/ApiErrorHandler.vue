<template>
    <!-- 该组件没有UI，只用于处理API错误 -->
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { casdoorService } from '@/services/auth';

// 定义全局通知函数类型
declare global {
    interface Window {
        $notify?: (title: string, message: string, type?: string, actionText?: string, callback?: () => void) => void;
    }
}

export default defineComponent({
    name: 'ApiErrorHandler',
    setup() {
        const userStore = useUserStore();

        // 记录错误次数，避免循环提示
        const errorCount = ref(0);
        const lastErrorTime = ref(0);
        const ERROR_THRESHOLD = 3; // 在30秒内最多显示3次错误
        const ERROR_RESET_TIME = 30000; // 30秒

        // 上次验证时间
        const lastValidationCheck = ref(0);
        const VALIDATION_INTERVAL = 5 * 60 * 1000; // 修正为标准5分钟验证间隔

        // 标记是否已显示通知
        const hasShownNotification = ref(false);

        // 处理认证错误事件
        const handleAuthError = async (event: CustomEvent) => {
            // 如果已显示通知，则不再显示
            if (hasShownNotification.value) {
                return;
            }

            const now = Date.now();

            // 重置错误计数器（如果超过了重置时间）
            if (now - lastErrorTime.value > ERROR_RESET_TIME) {
                errorCount.value = 0;
            }

            // 更新错误时间
            lastErrorTime.value = now;

            // 增加错误计数
            errorCount.value++;

            // 如果错误次数超过阈值，就不再显示提示
            if (errorCount.value <= ERROR_THRESHOLD) {
                // 获取错误消息
                const message = event.detail?.message || 'Your session has expired. Please login again.';

                // 标记已显示通知
                hasShownNotification.value = true;

                // 使用全局通知组件显示消息
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
                    // 降级方案：使用原生alert
                    alert(message);
                    forceLogout();
                }
            } else {
                console.warn('Too many auth errors in short period, suppressing alerts');
                // 静默登出
                forceLogout();
            }
        };

        // 强制登出并刷新页面
        const forceLogout = async () => {
            try {
                // 清除用户信息
                userStore.clearUserInfo();

                // 登出
                await casdoorService.logout();

                // 直接刷新页面跳转到登录页，而不是用router.push
                window.location.href = '/login';
            } catch (error) {
                console.error('Error during automatic logout:', error);
                // 确保无论如何都跳转到登录页
                window.location.href = '/login';
            }
        };

        // 监听全局ajax错误
        const handleAjaxError = (event: ErrorEvent) => {
            const target = event.target as XMLHttpRequest;

            // 检查是否是API调用的错误
            if (target && target instanceof XMLHttpRequest) {
                // 检查是否是认证错误
                if (target.status === 401 || target.status === 403) {
                    console.warn('Caught XHR auth error:', target.status, target.statusText);

                    // 触发认证错误处理
                    casdoorService.handleInvalidAuthResponse().catch(console.error);
                }

                // 尝试解析返回的JSON以检测错误消息
                try {
                    if (target.responseText) {
                        const response = JSON.parse(target.responseText);

                        // 检查特定的错误格式
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
                    // 解析错误，可能不是JSON
                }
            }
        };

        // 定期验证令牌
        const setupPeriodicValidation = () => {
            // 刷新页面时重置上次验证时间
            lastValidationCheck.value = Date.now();

            // 避免页面加载时立即执行，允许 AuthManager 先处理验证
            // 首次验证延迟到5秒后执行，避免和AuthManager冲突
            setTimeout(() => {
                // 立即检查信任标记和验证状态，而不是尝试验证
                checkTokenStatus();
            }, 5000);

            // 设置定期验证
            const intervalId = setInterval(() => {
                checkTokenStatus();
            }, VALIDATION_INTERVAL);

            return intervalId;
        };

        // 新方法：检查令牌状态但不触发验证
        const checkTokenStatus = async () => {
            // 检查绝对信任标记
            if (localStorage.getItem('token_absolute_trust') === 'true' || 
                localStorage.getItem('skip_all_token_validation') === 'true') {
                console.log('ApiErrorHandler: Absolute trust flag detected, skipping ALL validation');
                return;
            }
            
            // 检查常规信任标记
            if (localStorage.getItem('token_trusted') === 'true') {
                console.log('ApiErrorHandler: Trust flag detected, skipping validation');
                return;
            }
            
            // 检查登录后时间
            const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
            if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                console.log('ApiErrorHandler: Recent auth (<10min), skipping validation');
                return;
            }
            
            const now = Date.now();
            
            // 避免频繁验证
            if (now - lastValidationCheck.value < VALIDATION_INTERVAL) {
                return;
            }
            
            // 检查AuthManager是否已经最近验证过
            const lastAuthCheck = localStorage.getItem('last_auth_check_time');
            if (lastAuthCheck && now - parseInt(lastAuthCheck) < VALIDATION_INTERVAL / 2) {
                console.log('ApiErrorHandler: AuthManager recently verified, skipping validation');
                lastValidationCheck.value = now; // 更新时间戳，但跳过验证
                return;
            }
            
            // 检查是否有验证正在进行中
            if (localStorage.getItem('auth_validation_in_progress') === 'true' ||
                localStorage.getItem('api_error_handler_validating') === 'true') {
                console.log('ApiErrorHandler: Validation already in progress, skipping');
                return;
            }
            
            // 更新时间戳
            lastValidationCheck.value = now;
            
            try {
                // 只有在真正需要验证时，且用户已登录时
                if (casdoorService.isLoggedIn()) {
                    // 设置锁，防止与其他组件验证冲突
                    localStorage.setItem('api_error_handler_validating', 'true');
                    
                    try {
                        console.log('ApiErrorHandler: Performing token validation without requesting new token');
                        
                        // 使用不请求新token的验证方法
                        const isValid = await casdoorService.isTokenValidWithoutRefresh();
                        
                        if (!isValid) {
                            console.warn('ApiErrorHandler: Token is invalid');
                            // 只有在token无效时才尝试刷新
                            const wasRefreshed = await casdoorService.handleInvalidAuthResponse();
                            if (!wasRefreshed) {
                                handleAuthError(new CustomEvent('auth:invalid', {
                                    detail: { message: 'Your session has expired. Please login again.' }
                                }));
                            }
                        } else {
                            // 如果token有效，简单记录结果，但不执行任何操作
                            console.log('ApiErrorHandler: Token is valid');
                            localStorage.setItem('last_token_validated_time', Date.now().toString());
                        }
                    } finally {
                        // 完成验证，删除锁
                        localStorage.removeItem('api_error_handler_validating');
                    }
                }
            } catch (error) {
                console.error('ApiErrorHandler: Error during validation check:', error);
                localStorage.removeItem('api_error_handler_validating');
            }
        };

        // 保存定时器ID
        let validationIntervalId: ReturnType<typeof setInterval> | null = null;

        onMounted(() => {
            // 监听认证无效事件
            window.addEventListener('auth:invalid', handleAuthError as unknown as EventListener);

            // 监听全局ajax错误
            window.addEventListener('error', handleAjaxError);

            // 设置定期验证
            validationIntervalId = setupPeriodicValidation();

            // 监听fetch请求的响应
            const originalFetch = window.fetch;
            window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
                try {
                    const response = await originalFetch(input, init);

                    // 克隆响应以便检查内容
                    const clone = response.clone();

                    // 检查状态
                    if (!response.ok && (response.status === 401 || response.status === 403)) {
                        console.warn('Caught fetch auth error:', response.status);
                        casdoorService.handleInvalidAuthResponse().catch(console.error);
                        return response;
                    }

                    // 异步检查响应内容
                    clone.text().then(text => {
                        if (text) {
                            try {
                                const data = JSON.parse(text);

                                // 检查特定的错误格式
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
                                // 解析错误，可能不是JSON
                            }
                        }
                    }).catch(_e => {
                        // 忽略响应解析错误
                    });

                    return response;
                } catch (error) {
                    // 传递错误
                    throw error;
                }
            };

            // 清除通知标记
            hasShownNotification.value = false;
        });

        onBeforeUnmount(() => {
            window.removeEventListener('auth:invalid', handleAuthError as unknown as EventListener);
            window.removeEventListener('error', handleAjaxError);

            // 清除定期验证定时器
            if (validationIntervalId !== null) {
                clearInterval(validationIntervalId);
            }

            // 恢复原始fetch
            // 注意：在实际应用中，你可能需要保存和还原原始的fetch
            // 但由于组件通常不会被卸载，这里简化处理
        });

        return {};
    }
});
</script>
