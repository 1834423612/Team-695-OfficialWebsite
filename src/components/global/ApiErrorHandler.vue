<template>
    <!-- 该组件没有UI，只用于处理API错误 -->
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { casdoorService } from '@/services/auth';

export default defineComponent({
    name: 'ApiErrorHandler',
    setup() {
        const router = useRouter();
        const userStore = useUserStore();

        // 记录错误次数，避免循环提示
        const errorCount = ref(0);
        const lastErrorTime = ref(0);
        const ERROR_THRESHOLD = 3; // 在30秒内最多显示3次错误
        const ERROR_RESET_TIME = 30000; // 30秒
        
        // 上次验证时间
        const lastValidationCheck = ref(0);
        const VALIDATION_INTERVAL = 5 * 60 * 1000; // 修正为标准5分钟验证间隔

        // 处理认证错误事件
        const handleAuthError = async (event: CustomEvent) => {
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
                // 显示错误消息
                const message = event.detail?.message || 'Your session has expired. Please login again.';
                alert(message);

                try {
                    // 清除用户信息
                    userStore.clearUserInfo();

                    // 登出
                    await casdoorService.logout();

                    // 重定向到登录页
                    router.push('/login');
                } catch (error) {
                    console.error('Error during automatic logout:', error);
                    // 确保无论如何都重定向到登录页
                    router.push('/login');
                }
            } else {
                console.warn('Too many auth errors in short period, suppressing alerts');

                // 自动尝试登出并重定向，但不显示提醒
                try {
                    userStore.clearUserInfo();
                    await casdoorService.logout();
                    router.push('/login');
                } catch (error) {
                    console.error('Error during silent logout:', error);
                }
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
            
            // 进行初始验证
            setTimeout(async () => {
                try {
                    if (casdoorService.isLoggedIn()) {
                        const isValid = await casdoorService.validateToken();
                        console.log('Initial token validation result:', isValid);
                        
                        if (!isValid) {
                            // 如果初始验证失败，尝试自动刷新
                            const wasRefreshed = await casdoorService.handleInvalidAuthResponse();
                            if (!wasRefreshed) {
                                // 如果刷新失败，通知用户
                                handleAuthError(new CustomEvent('auth:invalid', {
                                    detail: { message: 'Your session is invalid. Please login again.' }
                                }));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error during initial token validation:', error);
                }
            }, 1000);
            
            // 设置定期验证
            const intervalId = setInterval(async () => {
                const now = Date.now();
                
                // 避免频繁验证
                if (now - lastValidationCheck.value < VALIDATION_INTERVAL) {
                    return;
                }
                
                lastValidationCheck.value = now;
                
                try {
                    if (casdoorService.isLoggedIn()) {
                        console.log('Performing periodic token validation');
                        const teamApiResult = await casdoorService.validateWithTeamApi();
                        
                        if (!teamApiResult.valid) {
                            console.warn('Team API indicates token is invalid during periodic check');
                            const wasRefreshed = await casdoorService.handleInvalidAuthResponse();
                            if (!wasRefreshed) {
                                handleAuthError(new CustomEvent('auth:invalid', {
                                    detail: { message: 'Your session has expired. Please login again.' }
                                }));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error during periodic validation:', error);
                }
            }, VALIDATION_INTERVAL);
            
            return intervalId;
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
            window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
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
