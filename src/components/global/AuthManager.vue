<template>
    <!-- 
        全局身份认证管理组件
        此组件在UI上不可见，但负责以下功能：
        1. 定期验证用户身份令牌
        2. 处理令牌过期和刷新
        3. 确保只有有效用户可访问受限页面
    -->
    <div aria-hidden="true" class="auth-manager-component"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { casdoorService, AUTH_LOCKS } from '@/services/auth';
import { useUserStore } from '@/stores/userStore';
import { isLockActive, setAuthLock, releaseAuthLock } from '@/utils/authUtils';
import { shouldSkipAllValidation, recordValidationTime, setAbsoluteTrust } from '@/utils/authConfig';

/**
 * 全局认证管理组件
 * 统一处理 /Dashboard 路径下所有页面的身份验证逻辑
 * 实现集中式的令牌验证、刷新和用户信息管理
 */
export default defineComponent({
    name: 'AuthManager',
    setup() {
        const route = useRoute();
        const userStore = useUserStore();

        // 状态标记
        const lastValidationTime = ref(Date.now());
        const validationInterval = 5 * 60 * 1000; // 5分钟验证间隔
        let validationTimer: number | null = null;
        let pageVisible = ref(true);

        // 请求锁，防止重复请求
        const validationLock = ref<Promise<void> | null>(null);

        /**
         * 验证并确保用户已通过身份验证
         * 包含防重复请求机制
         */
        const validateAuth = async (): Promise<void> => {
            // 使用统一配置检查是否需要跳过验证
            if (shouldSkipAllValidation()) {
                console.log('AuthManager: Skipping validation due to trust flags');
                
                // 确保用户信息已加载，但不进行令牌验证
                if (!userStore.userInfo) {
                    try {
                        await userStore.initializeStore(true); // true = 强制跳过令牌验证
                    } catch (e) {
                        console.warn('Failed to initialize user store with trusted token:', e);
                    }
                }
                
                // 更新验证时间但不实际验证
                lastValidationTime.value = Date.now();
                recordValidationTime();
                return;
            }

            // 创建验证锁的键
            const AUTH_VALIDATION_LOCK = AUTH_LOCKS.VALIDATION;
            
            // 如果已经在验证中，避免并发验证
            if (isLockActive(AUTH_VALIDATION_LOCK)) {
                console.log('AuthManager: Another validation is in progress, skipping');
                return;
            }
            
            // 如果已经有验证Promise，等待它完成
            if (validationLock.value) {
                return validationLock.value;
            }

            // 严格检查是否在登录回调后的一段时间内（10分钟），如果是则完全跳过验证
            const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
            if (authCallbackTime) {
                const callbackTimestamp = parseInt(authCallbackTime);
                if (!isNaN(callbackTimestamp) && Date.now() - callbackTimestamp < 10 * 60 * 1000) {
                    console.log('AuthManager: Completely skipping validation, recent auth callback detected (<10min)');
                    // 确保用户信息已加载
                    if (!userStore.userInfo) {
                        try {
                            await userStore.initializeStore(true); // 跳过验证加载用户信息
                        } catch (e) {
                            console.warn('Failed to initialize user store during auth skip:', e);
                        }
                    }
                    // 标记验证时间但不实际验证
                    lastValidationTime.value = Date.now();
                    recordValidationTime();
                    return;
                }
            }

            // 创建新的验证Promise并保存引用
            validationLock.value = (async () => {
                try {
                    // 设置锁，防止并发验证
                    setAuthLock(AUTH_VALIDATION_LOCK);
                    localStorage.setItem('auth_validation_start_time', Date.now().toString());
                    
                    console.log('AuthManager: Validating authentication...');

                    // 检查是否在Dashboard路径下
                    if (!route.path.startsWith('/Dashboard')) {
                        return;
                    }

                    // 检查用户是否已登录
                    if (!casdoorService.isLoggedIn()) {
                        console.warn('AuthManager: User not logged in, redirecting to login');
                        await handleAuthFailure('You need to login to access this page');
                        return;
                    }

                    // 使用本地令牌验证 - 关键改变：使用不请求新token的验证方法
                    const isLocallyValid = await casdoorService.isTokenValidWithoutRefresh();
                    
                    if (!isLocallyValid) {
                        console.warn('AuthManager: Local token validation failed');
                        
                        // 如果验证失败，尝试刷新token
                        try {
                            await casdoorService.refreshAccessToken();
                            console.log('AuthManager: Token refreshed successfully');
                        } catch (refreshError) {
                            console.error('AuthManager: Token refresh failed:', refreshError);
                            await handleAuthFailure('Your session appears to be invalid. Please login again.');
                            return;
                        }
                    }

                    // 记录验证时间，但不进行API验证
                    lastValidationTime.value = Date.now();
                    localStorage.setItem('last_token_validated_time', Date.now().toString());
                    recordValidationTime();
                    
                    // 令牌已通过本地验证，确保用户信息已加载
                    if (!userStore.userInfo) {
                        try {
                            await userStore.initializeStore(true); // 跳过验证加载用户信息
                        } catch (error) {
                            console.error('AuthManager: Failed to load user info after token validation:', error);
                            // 但不因用户信息加载失败而登出用户
                        }
                    }
                } catch (error) {
                    console.error('AuthManager: Authentication validation error:', error);
                    // 不要因为验证错误而立即登出，等待APIErrorHandler决定
                } finally {
                    // 验证完成后清除锁
                    validationLock.value = null;
                    releaseAuthLock(AUTH_VALIDATION_LOCK);
                }
            })();

            return validationLock.value;
        };

        /**
         * 处理身份验证失败
         */
        const handleAuthFailure = async (message?: string) => {
            try {
                // 清除用户信息
                userStore.clearUserInfo();

                // 注销用户
                await casdoorService.logout();

                // 显示消息（如果提供）并重定向
                if (message) {
                    if (window.$notify) {
                        window.$notify(
                            'Authentication Error',
                            message,
                            'error',
                            'Login Again',
                            () => {
                                // 直接刷新页面跳转到登录
                                window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                            }
                        );
                    } else {
                        // 降级方案：使用原生alert
                        alert(message);
                        // 直接刷新页面跳转到登录
                        window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                    }
                } else {
                    // 直接刷新页面跳转到登录
                    window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
                }
            } catch (error) {
                console.error('AuthManager: Error during auth failure handling:', error);
                // 确保重定向到登录页
                window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
            }
        };

        /**
         * 设置定期验证定时器，支持页面可见性检测
         */
        const setupPeriodicValidation = () => {
            // 清除现有定时器
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }
            
            // 重置上次验证时间为当前时间（确保页面刷新后计时重新开始）
            lastValidationTime.value = Date.now();

            // 创建新定时器 - 使用固定5分钟间隔
            validationTimer = window.setInterval(() => {
                // 检查是否完全跳过验证
                const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
                if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                    console.log('AuthManager: Periodic check skipped due to recent auth');
                    return;
                }
                
                // 只有当页面可见且没有正在进行的验证时才执行验证
                if (pageVisible.value && !validationLock.value) {
                    console.log('AuthManager: Periodic auth check triggered');
                    validateAuth().catch(console.error);
                } else {
                    console.log('AuthManager: Periodic check skipped - page invisible or validation in progress');
                }
            }, validationInterval);
        };

        /**
         * 处理页面可见性变化
         */
        const handleVisibilityChange = () => {
            pageVisible.value = document.visibilityState === 'visible';
            
            // 当页面重新可见时，检查验证时间，如果已过期则立即验证
            if (pageVisible.value && Date.now() - lastValidationTime.value >= validationInterval) {
                console.log('Page became visible, performing authentication check');
                validateAuth().catch(console.error);
            }
        };

        /**
         * 处理认证无效事件
         */
        const handleAuthInvalid = async (event: Event) => {
            // 将 Event 转换为 CustomEvent 以访问 detail 属性
            const customEvent = event as CustomEvent;
            console.warn('AuthManager: Auth invalid event detected:', customEvent.detail);
            await handleAuthFailure(customEvent.detail?.message);
        };

        // 监听路由变化
        watch(() => route.path, (newPath, oldPath) => {
            if (newPath !== oldPath && newPath.startsWith('/Dashboard')) {
                validateAuth().catch(console.error);
            }
        });

        // 组件挂载时
        onMounted(() => {
            // 清除任何过期的锁
            if (!isLockActive(AUTH_LOCKS.VALIDATION, 30000)) { // 30秒超时
                releaseAuthLock(AUTH_LOCKS.VALIDATION);
            }
            
            // 检查token是否刚刚被验证过，如果是则完全跳过验证
            // 这是关键：登录回调10分钟内绝对不要再验证token
            const authCallbackCompleted = localStorage.getItem('auth_callback_completed_time');
            if (authCallbackCompleted && Date.now() - parseInt(authCallbackCompleted) < 10 * 60 * 1000) {
                console.log('AuthManager: Completely skipping initial validation, recent login detected (<10min)');
                
                // 设置绝对信任标记 - 添加这行以强化防止验证
                setAbsoluteTrust();
                
                // 更新验证时间但不执行验证
                lastValidationTime.value = Date.now();
                recordValidationTime();
                
                // 仍然确保用户数据已加载，但跳过验证
                if (!userStore.userInfo) {
                    userStore.initializeStore(true).catch(error => {
                        console.warn('Failed to load user info during auth skip:', error);
                    });
                }
            } else {
                // 检查是否已被验证过
                const lastAuthCheck = localStorage.getItem('last_token_validated_time');
                if (lastAuthCheck && Date.now() - parseInt(lastAuthCheck) < 2 * 60 * 1000) {
                    console.log('AuthManager: Skipping initial validation, recent validation detected (<2min)');
                    // 更新验证时间但不执行验证
                    lastValidationTime.value = Date.now();
                    recordValidationTime();
                } else {
                    // 仅当真正需要验证时才验证
                    console.log('AuthManager: Performing initial validation check');
                    validateAuth().catch(console.error);
                }
            }

            // 设置定期验证
            setupPeriodicValidation();

            // 监听认证无效事件
            window.addEventListener('auth:invalid', handleAuthInvalid);
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', handleVisibilityChange);
        });

        // 组件卸载前
        onBeforeUnmount(() => {
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }

            window.removeEventListener('auth:invalid', handleAuthInvalid);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        });

        return {};
    },
});
</script>

<style scoped>
/* 让组件不可见但保持其存在于DOM中 */
.auth-manager-component {
    display: none;
    height: 0;
    width: 0;
    position: absolute;
    overflow: hidden;
}
</style>
