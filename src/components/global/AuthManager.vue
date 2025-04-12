<template>
    <!-- 无可视内容的管理组件 -->
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { useUserStore } from '@/stores/userStore';

/**
 * 全局认证管理组件
 * 统一处理 /Dashboard 路径下所有页面的身份验证逻辑
 * 实现集中式的令牌验证、刷新和用户信息管理
 */
export default defineComponent({
    name: 'AuthManager',
    setup() {
        const router = useRouter();
        const route = useRoute();
        const userStore = useUserStore();

        // 状态标记
        const isValidating = ref(false);
        const lastValidationTime = ref(Date.now());
        const validationInterval = 5 * 60 * 1000; // 5分钟验证一次
        let validationTimer: number | null = null;

        // 请求锁，防止重复请求
        const validationLock = ref<Promise<void> | null>(null);

        /**
         * 验证并确保用户已通过身份验证
         * 包含防重复请求机制
         */
        const validateAuth = async (): Promise<void> => {
            // 如果已经在验证中，返回当前验证Promise
            if (validationLock.value) {
                return validationLock.value;
            }

            // 创建新的验证Promise并保存引用
            validationLock.value = (async () => {
                try {
                    // 避免重复验证
                    if (isValidating.value) return;

                    isValidating.value = true;
                    console.log('AuthManager: Validating authentication...');

                    // 检查是否在Dashboard路径下
                    if (!route.path.startsWith('/Dashboard')) {
                        isValidating.value = false;
                        return;
                    }

                    // 检查用户是否已登录
                    if (!casdoorService.isLoggedIn()) {
                        console.warn('AuthManager: User not logged in, redirecting to login');
                        await navigateToLogin();
                        return;
                    }

                    // 检查上次验证时间，如果小于间隔时间则跳过验证
                    const now = Date.now();
                    if (now - lastValidationTime.value < validationInterval / 2) {
                        console.log('AuthManager: Skipping validation, too soon since last check');
                        isValidating.value = false;
                        return;
                    }

                    // 验证令牌有效性
                    const validationResult = await casdoorService.validateWithTeamApi();
                    if (!validationResult.valid) {
                        console.warn('AuthManager: Token validation failed');

                        try {
                            // 尝试刷新令牌
                            await casdoorService.refreshAccessToken();

                            // 刷新后再次验证
                            const refreshedResult = await casdoorService.validateWithTeamApi();
                            if (!refreshedResult.valid) {
                                console.error('AuthManager: Token still invalid after refresh');
                                throw new Error('Invalid authentication token');
                            }

                            // 缓存验证结果
                            lastValidationTime.value = now;

                            // 如果是管理员，保存标记
                            if (refreshedResult.isAdmin) {
                                localStorage.setItem('is_admin_validated', 'true');
                            }
                        } catch (error) {
                            console.error('AuthManager: Token refresh failed:', error);
                            await handleAuthFailure('Your session has expired. Please login again.');
                            return;
                        }
                    } else {
                        // 令牌有效，更新验证时间
                        lastValidationTime.value = now;

                        // 如果是管理员，保存标记
                        if (validationResult.isAdmin) {
                            localStorage.setItem('is_admin_validated', 'true');
                        }
                    }

                    // 令牌已验证，确保用户信息已加载
                    // 作为双重验证，在token验证后再次请求用户信息
                    if (!userStore.userInfo || now - (userStore.lastFetchTime || 0) > 5 * 60 * 1000) {
                        console.log('AuthManager: Loading user info after validation as secondary validation');
                        try {
                            await userStore.refreshUserInfo(false);
                        } catch (error) {
                            console.error('AuthManager: Failed to load user info:', error);
                            await handleAuthFailure('Failed to load user profile. Please try again.');
                            return;
                        }
                    }

                    // 如果访问管理员页面，验证权限
                    if (route.meta.requiresAdmin) {
                        // 从验证结果或用户信息中确认管理员状态
                        const isAdmin = validationResult.isAdmin ||
                            userStore.isAdmin ||
                            casdoorService.isUserAdmin();

                        if (!isAdmin) {
                            console.warn('AuthManager: User is not an admin, redirecting');
                            router.push({ name: 'DashboardHome' });
                        }
                    }
                } catch (error) {
                    console.error('AuthManager: Authentication validation error:', error);
                    await handleAuthFailure();
                } finally {
                    isValidating.value = false;
                    // 验证完成后清除锁
                    validationLock.value = null;
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

                // 显示消息（如果提供）
                if (message) {
                    alert(message);
                }

                // 重定向到登录页
                await navigateToLogin();
            } catch (error) {
                console.error('AuthManager: Error during auth failure handling:', error);
                // 确保重定向到登录页
                await navigateToLogin();
            }
        };

        /**
         * 重定向到登录页面
         */
        const navigateToLogin = async () => {
            // 保存当前路径用于登录后重定向
            const returnPath = route.fullPath;
            await router.push({
                name: 'login',
                query: { redirect: returnPath }
            });
        };

        /**
         * 设置定期验证定时器
         */
        const setupPeriodicValidation = () => {
            // 清除现有定时器
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }

            // 创建新定时器
            validationTimer = window.setInterval(() => {
                const now = Date.now();
                if (now - lastValidationTime.value >= validationInterval) {
                    validateAuth().catch(console.error);
                }
            }, validationInterval / 2);
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
            // 初始验证
            validateAuth().catch(console.error);

            // 设置定期验证
            setupPeriodicValidation();

            // 监听认证无效事件 - 修复类型转换
            window.addEventListener('auth:invalid', handleAuthInvalid);
        });

        // 组件卸载前
        onBeforeUnmount(() => {
            if (validationTimer !== null) {
                window.clearInterval(validationTimer);
            }

            window.removeEventListener('auth:invalid', handleAuthInvalid);
        });

        return {};
    },
});
</script>
