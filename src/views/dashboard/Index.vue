<template>
    <DashboardLayout>
        <div class="min-h-screen bg-gray-50 flex flex-col">
            <!-- Top Navigation Bar -->
            <nav class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex">
                            <div class="flex-shrink-0 flex items-center">
                                <router-link to="/" class="flex items-center">
                                    <img v-if="orgData && orgData.logo" :src="orgData.logo" alt="Team 695 Logo"
                                        class="h-9 w-auto" />
                                    <span v-else class="text-xl font-bold text-blue-600">Team 695</span>
                                </router-link>
                                <!-- Mobile title -->
                                <div v-if="orgData && orgData.logo">
                                    <span class="ml-2 text-lg font-semibold text-blue-600 sm:hidden">695 Dashboard</span>
                                </div>
                                <div v-else class="ml-2 text-md font-semibold sm:hidden">
                                    <span class="text-gray-300">|</span>
                                    <span class="ml-2 text-orange-500">Dashboard</span>
                                </div>
                            </div>
                            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <router-link to="/Dashboard" :class="[
                                    isExactActive('/Dashboard')
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]">
                                    Dashboard
                                </router-link>
                                <router-link to="/Dashboard/Pit-Scouting" :class="[
                                    isExactActive('/Dashboard/Pit-Scouting')
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]">
                                    Pit-Scouting
                                </router-link>
                                <router-link to="/" :class="[
                                    isExactActive('/')
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]">
                                    Home
                                </router-link>
                                <!-- 其他路由链接注释掉的代码 -->
                            </div>
                        </div>

                        <!-- Desktop Menu -->
                        <div class="hidden sm:ml-6 sm:flex sm:items-center">
                            <div class="flex items-center space-x-4">
                                <!-- Notifications 注释掉的代码 -->

                                <!-- User Profile Section -->
                                <div class="flex items-center space-x-3">
                                    <div class="relative user-menu-container">
                                        <button @click="toggleUserMenu"
                                            class="flex items-center space-x-2 focus:outline-none">
                                            <div class="flex items-center">
                                                <CachedAvatar
                                                    v-if="userData.id"
                                                    :userId="userData.id"
                                                    :src="userData.avatar"
                                                    :name="userData.name"
                                                    :firstName="userData.firstName"
                                                    :lastName="userData.lastName"
                                                    :displayName="userData.displayName"
                                                    :size="32"
                                                    class="h-8 w-8"
                                                />
                                                <div v-else
                                                    class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Icon icon="mdi:account" class="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div class="ml-2 text-left">
                                                    <div class="text-sm font-medium text-gray-700">
                                                        {{ userData.displayName || userData.fullName || userData.name }}
                                                    </div>
                                                    <div class="text-xs text-gray-500">{{ userData.isAdmin ? 'Administrator'
                                                        : 'Team Member' }}</div>
                                                </div>
                                            </div>
                                            <Icon icon="mdi:chevron-down" class="h-4 w-4 ml-1 text-gray-400" />
                                        </button>

                                        <!-- User Menu Dropdown -->
                                        <div v-if="showUserMenu"
                                            class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div class="py-1">
                                                <router-link to="/Dashboard/profile" :class="[
                                                    isExactActive('/Dashboard/profile')
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-100',
                                                    'px-4 py-2 text-sm flex items-center'
                                                ]">
                                                    <Icon icon="mdi:account-circle" class="h-4 w-4 mr-2 text-gray-500" />
                                                    Your Profile
                                                </router-link>
                                                <!-- Settings 链接注释掉的代码 -->
                                                <div v-if="userData.isAdmin" class="border-t-2 border-gray-200">
                                                    <!-- Admin Panel 链接注释掉的代码 -->
                                                </div>
                                                <div class="border-t-2 border-gray-200">
                                                    <button @click="logout"
                                                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                                        <Icon icon="mdi:logout" class="h-4 w-4 mr-2 text-gray-500" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Logout Button -->
                                    <button @click="logout"
                                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
                                        <Icon icon="mdi:logout" class="h-4 w-4 mr-1" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="flex items-center sm:hidden">
                            <div class="flex items-center space-x-3">
                                <!-- Mobile Notifications 注释掉的代码 -->

                                <!-- Mobile Menu Toggle -->
                                <button @click="mobileMenuOpen = !mobileMenuOpen" type="button"
                                    class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                    aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen">
                                    <span class="sr-only">Open main menu</span>
                                    <Icon v-if="!mobileMenuOpen" icon="mdi:menu" class="h-6 w-6" />
                                    <Icon v-else icon="mdi:close" class="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Mobile menu -->
            <div v-show="mobileMenuOpen" class="sm:hidden bg-gray-50 border-t border-gray-200" id="mobile-menu">
                <!-- Mobile User Profile -->
                <div class="pt-4 pb-3 border-b border-gray-200 bg-white">
                    <div class="flex items-center px-4">
                        <div class="flex-shrink-0">
                            <CachedAvatar
                                v-if="userData.id"
                                :userId="userData.id"
                                :src="userData.avatar"
                                :name="userData.name"
                                :firstName="userData.firstName"
                                :lastName="userData.lastName"
                                :displayName="userData.displayName"
                                :size="40"
                                class="h-10 w-10"
                            />
                            <div v-else class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Icon icon="mdi:account" class="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div class="ml-3 flex-1">
                            <div class="text-base font-medium text-gray-800">
                                {{ userData.displayName || userData.fullName || userData.name }}
                            </div>
                            <div class="text-sm font-medium text-gray-500">{{ userData.email }}</div>
                            <div class="text-xs text-gray-500">{{ userData.isAdmin ? 'Administrator' :
                                'Team Member' }}
                            </div>
                        </div>
                        <button @click="logout"
                            class="ml-auto inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
                            <Icon icon="mdi:logout" class="h-4 w-4 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Links -->
                <div class="pt-2 pb-3 space-y-1 bg-white shadow-inner">
                    <router-link to="/Dashboard" exact
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/Dashboard')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:view-dashboard" class="h-5 w-5 mr-2" />
                        Dashboard
                    </router-link>
                    <router-link to="/Dashboard/Pit-Scouting" exact
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/Dashboard/Pit-Scouting')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:clipboard-text" class="h-5 w-5 mr-2" />
                        Pit-Scouting Form
                    </router-link>
                    <router-link to="/"
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:home" class="h-5 w-5 mr-2" />
                        Home
                    </router-link>
                    <!-- 其他移动端路由链接注释掉的代码 -->
                </div>

                <!-- Mobile User Actions -->
                <div class="pb-1 border-t border-gray-200 bg-white">
                    <div class="space-y-1">
                        <router-link to="/Dashboard/profile"
                            class="pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium flex items-center"
                            :class="[
                                isExactActive('/Dashboard/profile')
                                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            ]">
                            <Icon icon="mdi:account-circle" class="h-5 w-5 mr-2" />
                            Your Profile
                        </router-link>
                        <!-- Settings 链接注释掉的代码 -->
                    </div>
                </div>

                <!-- Mobile Admin Panel (if user is admin) -->
                <div v-if="userData.isAdmin" class="pb-1 border-t border-gray-200 bg-white">
                    <!-- 管理面板链接注释掉的代码 -->
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-grow">
                <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <!-- 面包屑导航 -->
                    <nav class="mb-4 flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
                        <div class="flex">
                            <div class="flex items-center">
                                <router-link to="/Dashboard" class="hover:text-blue-600 flex items-center">
                                    <Icon icon="mdi:view-dashboard" class="h-4 w-4 mr-1" />
                                    Dashboard
                                </router-link>
                                
                                <template v-if="currentBreadcrumb">
                                    <Icon icon="mdi:chevron-right" class="h-4 w-4 mx-2 text-gray-400" />
                                    <span class="text-gray-900 font-medium flex items-center">
                                        <Icon :icon="getBreadcrumbIcon(currentBreadcrumb.path)" class="h-4 w-4 mr-1" />
                                        {{ currentBreadcrumb.name }}
                                    </span>
                                </template>
                            </div>
                        </div>
                    </nav>
                    
                    <router-view></router-view>
                </div>
            </div>

            <footer class="bg-white mt-auto">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div class="flex flex-col md:flex-row justify-between items-center">
                        <!-- Logo and Copyright -->
                        <div class="flex flex-col items-center md:items-start md:flex-row">
                            <!-- Logo (hidden on desktop) -->
                            <img v-if="orgData && orgData.logo" :src="orgData.logo" alt="Team 695 Logo"
                                class="h-8 w-auto mb-2 md:mb-0 md:hidden" />
                            <!-- Copyright Text -->
                            <span class="text-gray-500 text-sm text-center md:text-left">
                                © {{ new Date().getFullYear() }} Team 695. All rights reserved.
                            </span>
                        </div>

                        <!-- Social Media Links -->
                        <div class="mt-4 md:mt-0">
                            <div class="flex space-x-6">
                                <!-- Facebook 链接注释掉的代码 -->
                                <a href="https://www.instagram.com/beachwood695/" target="_blank"
                                    class="text-gray-500 hover:text-gray-600">
                                    <Icon icon="mdi:instagram" class="h-5 w-5" />
                                </a>
                                <!-- Twitter 链接注释掉的代码 -->
                                <a href="https://github.com/FRCTeam695" target="_blank"
                                    class="text-gray-500 hover:text-gray-600">
                                    <Icon icon="mdi:github" class="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import CachedAvatar from '@/components/common/CachedAvatar.vue';

export default defineComponent({
    name: 'DashboardIndexView',
    components: {
        Icon,
        DashboardLayout,
        CachedAvatar
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const mobileMenuOpen = ref(false);
        const showUserMenu = ref(false);
        const showNotifications = ref(false);

        // 使用 Pinia 存储
        const userStore = useUserStore();
        const { userInfo, orgData } = storeToRefs(userStore);

        // 用户数据计算属性
        const userData = computed(() => userInfo.value || {});

        // 面包屑导航映射
        const breadcrumbMap: Record<string, { name: string; icon: string }> = {
            '/Dashboard/profile': { name: 'Profile', icon: 'mdi:account-circle' },
            '/Dashboard/Pit-Scouting': { name: 'Pit Scouting', icon: 'mdi:clipboard-text' },
            // 可以根据需要添加更多路由映射
        };

        // 当前面包屑
        const currentBreadcrumb = computed(() => {
            // 尝试精确匹配
            const path = route.path;
            const lowercasePath = path.toLowerCase();
            
            // 查找对应路径的面包屑信息
            for (const [key, value] of Object.entries(breadcrumbMap)) {
                if (lowercasePath === key.toLowerCase()) {
                    return { ...value, path: key };
                }
            }

            // 尝试匹配路径前缀
            for (const [key, value] of Object.entries(breadcrumbMap)) {
                if (lowercasePath.startsWith(key.toLowerCase())) {
                    return { ...value, path: key };
                }
            }

            // 没有匹配则返回null
            return null;
        });

        // 根据路径获取图标
        const getBreadcrumbIcon = (path: string) => {
            return breadcrumbMap[path]?.icon || 'mdi:chevron-right';
        };

        // 改进的路由活动检测，考虑大小写
        const isExactActive = (path: string) => {
            const normalizePath = (p: string) => p.toLowerCase();
            
            if (normalizePath(path) === '/dashboard' && normalizePath(route.path) === '/dashboard') {
                return true;
            }
            return normalizePath(path) !== '/dashboard' && normalizePath(route.path) === normalizePath(path);
        };

        // 路由变化时关闭菜单
        watch(
            () => route.path,
            () => {
                mobileMenuOpen.value = false;
                showUserMenu.value = false;
                showNotifications.value = false;
            }
        );

        // 切换用户菜单下拉框
        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value;
            if (showUserMenu.value) {
                showNotifications.value = false;
            }
        };

        // 切换通知下拉框
        const toggleNotifications = () => {
            showNotifications.value = !showNotifications.value;
            if (showNotifications.value) {
                showUserMenu.value = false;
            }
        };

        // 点击外部时关闭下拉框
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showUserMenu.value && !target.closest('.user-menu-container')) {
                showUserMenu.value = false;
            }
            if (showNotifications.value && !target.closest('.notifications-container')) {
                showNotifications.value = false;
            }
        };

        // 改进的登出功能
        const logout = async () => {
            try {
                // 调用服务登出
                await casdoorService.logout();
                
                // 清除用户信息
                userStore.clearUserInfo();
                
                // 重定向到登录页
                await router.push({ name: 'login' });
                
                // 强制刷新页面以确保所有状态被清除
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } catch (error) {
                console.error("Logout failed:", error);
                // 如果登出过程中发生错误，仍然尝试重定向和刷新
                router.push({ name: 'login' });
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        };

        // 添加全局认证错误监听器
        const handleAuthInvalid = (event: CustomEvent) => {
            console.warn('Auth invalid event detected:', event.detail);
            // 显示提醒消息
            alert(event.detail.message || 'Your session has expired. Please login again.');
            // 执行登出
            logout();
        };

        // 注册全局认证事件监听器
        onMounted(() => {
            window.addEventListener('auth:invalid', handleAuthInvalid as EventListener);
            
            // 首次加载时验证token有效性
            casdoorService.isTokenValid().catch(error => {
                console.error('Initial token validation failed:', error);
                // 如果初始验证失败，执行登出
                logout();
            });
        });

        // 添加点击外部监听器
        document.addEventListener('click', handleClickOutside);

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('auth:invalid', handleAuthInvalid as EventListener);
        });

        return {
            userData,
            orgData,
            mobileMenuOpen,
            showUserMenu,
            showNotifications,
            logout,
            isExactActive,
            toggleUserMenu,
            toggleNotifications,
            currentBreadcrumb,
            getBreadcrumbIcon
        };
    }
});
</script>

<style scoped>
/* Custom scrollbar for notification list */
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
}
</style>