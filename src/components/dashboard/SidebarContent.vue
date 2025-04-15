<template>
    <div class="flex flex-col h-full">
        <!-- Sidebar header -->
        <div class="flex items-center justify-between flex-shrink-0 p-2" :class="{ 'justify-center': !sidebarOpen }">
            <router-link to="/" class="flex items-center space-x-2" :class="{ 'justify-center w-full': !sidebarOpen }">
                <img v-if="orgData && orgData.logo" :src="orgData.logo" alt="Team 695 Logo" class="h-8 w-auto" />
                <span v-if="sidebarOpen"
                    class="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Team
                    695</span>
            </router-link>
            <!-- Only show close button in overlay mode and when sidebar is open -->
            <button v-if="sidebarOpen" @click="$emit('close')" class="p-2 rounded-md lg:hidden hover:bg-gray-100">
                <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
            </button>
        </div>

        <!-- User details -->
        <div class="flex-shrink-0 p-2 mb-2">
            <div class="flex items-center space-x-2 bg-gray-50 p-2 rounded-md" :class="{ 'justify-center': !sidebarOpen }">
                <div class="relative">
                    <CachedAvatar v-if="userData.id" :userId="userData.id" :src="userData.avatar" :name="userData.name"
                        :firstName="userData.firstName" :lastName="userData.lastName" :displayName="userData.displayName"
                        :size="32" class="h-8 w-8 rounded-full" />
                    <div v-else class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon icon="mdi:account" class="h-5 w-5 text-blue-600" />
                    </div>
                </div>
                <div v-if="sidebarOpen" class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-700 truncate">{{ userData.displayName || userData.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ userData.email }}</p>
                </div>
                <!-- Logout button only visible when sidebar is expanded -->
                <button v-if="sidebarOpen" @click="() => logout()" 
                    class="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Sign out">
                    <Icon icon="mdi:logout" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Sidebar navigation -->
        <nav class="flex-1 overflow-y-auto py-2 px-2">
            <template v-for="section in ['main', 'scouting', 'user', 'external']" :key="section">
                <div v-if="getNavItemsBySection(section).length > 0" class="mb-6">
                    <h3 v-if="sidebarOpen" class="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {{ section }}
                    </h3>
                    <ul class="space-y-1">
                        <li v-for="(item, index) in getNavItemsBySection(section)" :key="item.path || `${section}-${index}`">
                            <!-- Handle items with submenus -->
                            <div v-if="item.children && item.children.length > 0">
                                <!-- Parent menu -->
                                <div @click="toggleSubmenu(item)"
                                    class="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                    :class="{ 
                                    'bg-blue-50 text-blue-600 font-medium': isParentActive(item),
                                    'justify-center': !sidebarOpen 
                                }">
                                    <Icon :icon="item.icon" class="w-5 h-5 flex-shrink-0"
                                        :class="{ 'mr-3': sidebarOpen }" />
                                    <span v-if="sidebarOpen" class="text-sm flex-1">{{ item.text }}</span>
                                    <Icon v-if="sidebarOpen" 
                                        :icon="getSubmenuExpandedState(item) ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                                        class="w-4 h-4" />
                                </div>
                                
                                <!-- Submenu list -->
                                <transition
                                    enter-active-class="transition duration-200 ease-out"
                                    enter-from-class="transform scale-y-0 opacity-0"
                                    enter-to-class="transform scale-y-100 opacity-100"
                                    leave-active-class="transition duration-200 ease-out"
                                    leave-from-class="transform scale-y-100 opacity-100"
                                    leave-to-class="transform scale-y-0 opacity-0"
                                >
                                    <ul v-if="sidebarOpen && getSubmenuExpandedState(item)" 
                                        class="ml-6 mt-1 space-y-1 origin-top">
                                        <li v-for="child in item.children" :key="child.path"
                                            v-show="!child.adminOnly || userData.isAdmin">
                                            <router-link :to="child.path"
                                                class="flex items-center p-1.5 text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                                :class="{ 'bg-blue-50 text-blue-600 font-medium': isActive(child.path, child.exact) }">
                                                <Icon :icon="child.icon" class="w-4 h-4 mr-2" />
                                                <span class="text-xs">{{ child.text }}</span>
                                            </router-link>
                                        </li>
                                    </ul>
                                </transition>
                            </div>

                            <!-- Handle router links -->
                            <router-link v-else-if="!item.isExternalLink" :to="item.path"
                                class="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                :class="{ 
                                    'bg-blue-50 text-blue-600 font-medium': isActive(item.path, item.exact),
                                    'justify-center': !sidebarOpen 
                                }">
                                <Icon :icon="item.icon" class="w-5 h-5 flex-shrink-0"
                                    :class="{ 'mr-3': sidebarOpen }" />
                                <span v-if="sidebarOpen" class="text-sm">{{ item.text }}</span>
                                <span v-if="item.badge && sidebarOpen"
                                    class="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                                    :class="`bg-${item.badge.color}-100 text-${item.badge.color}-800`">
                                    {{ item.badge.text }}
                                </span>
                            </router-link>
                            
                            <!-- Handle external links -->
                            <a v-else :href="item.path" :target="item.targetBlank ? '_blank' : '_self'"
                                class="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                :class="{ 'justify-center': !sidebarOpen }">
                                <Icon :icon="item.icon" class="w-5 h-5 flex-shrink-0"
                                    :class="{ 'mr-3': sidebarOpen }" />
                                <span v-if="sidebarOpen" class="text-sm">{{ item.text }}</span>
                                <Icon v-if="sidebarOpen && item.targetBlank" icon="mdi:open-in-new"
                                    class="h-3 w-3 ml-auto text-gray-400" />
                            </a>
                        </li>
                    </ul>
                </div>
            </template>
        </nav>

        <!-- Sidebar footer -->
        <div class="flex-shrink-0 p-2 border-t max-h-14 space-y-2">
            <!-- Toggle sidebar button -->
            <button @click="toggleSidebar"
                class="flex items-center justify-center w-full p-2 space-x-1 font-medium rounded-md bg-gray-100 hover:bg-gray-200 mb-1">
                <span>
                    <Icon :icon="sidebarOpen ? 'mdi:chevron-double-left' : 'mdi:chevron-double-right'"
                        class="w-5 h-5" />
                </span>
                <span v-if="sidebarOpen">Collapse</span>
            </button>
            
            <!-- Show logout button at bottom when sidebar is collapsed -->
            <button v-if="!sidebarOpen" @click="() => logout()" 
                class="flex items-center justify-center w-full p-2 text-red-600 hover:bg-red-50 rounded-md">
                <Icon icon="mdi:logout" class="w-5 h-5" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import CachedAvatar from '@/components/common/CachedAvatar.vue';
// Use relative path instead of @ alias
import { navigationConfig, NavItem } from '../../config/navigation';

export default defineComponent({
    name: 'SidebarContent',
    components: {
        Icon,
        CachedAvatar
    },
    props: {
        sidebarOpen: {
            type: Boolean,
            required: true
        },
        userData: {
            type: Object,
            required: true
        },
        orgData: {
            type: Object,
            default: null
        },
        logout: {
            type: Function,
            required: true
        }
    },
    emits: ['close', 'toggle-sidebar'],
    setup(props, { emit }) {
        const route = useRoute();
        
        // Track current navigation mode
        const navMode = ref(localStorage.getItem('dashboard_nav_mode') || 'overlay');
        const isLargeScreen = ref(window.innerWidth >= 720);
        
        // Listen for navigation mode changes in localStorage
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'dashboard_nav_mode') {
                navMode.value = event.newValue || 'overlay';
            }
        };
        
        // Listen for custom navigation mode change events
        const handleNavModeChanged = (event: CustomEvent) => {
            navMode.value = event.detail.mode;
            // console.log('Received nav mode change event:', event.detail);
        };
        
        // Monitor window size changes
        const handleResize = () => {
            isLargeScreen.value = window.innerWidth >= 720;
        };
        
        // Add event listeners on component mount
        onMounted(() => {
            window.addEventListener('storage', handleStorageChange);
            window.addEventListener('nav-mode-changed', handleNavModeChanged as EventListener);
            window.addEventListener('resize', handleResize);
            initExpandedMenus();
        });
        
        // Remove event listeners on component unmount
        onUnmounted(() => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('nav-mode-changed', handleNavModeChanged as EventListener);
            window.removeEventListener('resize', handleResize);
        });

        // Submenu expansion state management
        const expandedMenus = ref<Record<string, boolean>>({});
        
        // Improved isActive function with smarter path matching and fixed submenu highlighting
        const isActive = (path: string, exact?: boolean) => {
            const currentPath = route.path.toLowerCase();
            const targetPath = path.toLowerCase();
            
            // First identify if this is a parent or child menu item
            let isParentMenu = false;
            let isChildMenu = false;
            let parentPath = '';
            
            // Check if this is a parent menu with children
            isParentMenu = navigationConfig.sidebarNavItems.some(item => 
                item.path.toLowerCase() === targetPath && item.children && item.children.length > 0
            );
            
            // Check if this is a child menu and identify its parent
            for (const item of navigationConfig.sidebarNavItems) {
                if (item.children) {
                    const childMatch = item.children.find(child => child.path.toLowerCase() === targetPath);
                    if (childMatch) {
                        isChildMenu = true;
                        parentPath = item.path.toLowerCase();
                        break;
                    }
                }
            }
            
            // 如果是父菜单，应该只由isParentActive函数来判断高亮
            if (isParentMenu) {
                return false;
            }
            
            // 子菜单项的高亮逻辑
            if (isChildMenu) {
                if (exact) {
                    return currentPath === targetPath;
                } else {
                    return currentPath.startsWith(targetPath);
                }
            }
            
            // 普通菜单项的高亮逻辑
            if (exact) {
                return currentPath === targetPath;
            } else {
                return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
            }
        };
        
        // 新增函数，专门处理父菜单的高亮状态
        const isParentActive = (item: NavItem) => {
            const currentPath = route.path.toLowerCase();
            
            // 如果父菜单没有路径
            if (!item.path) {
                // 检查当前路径是否匹配任何子菜单路径
                if (item.children) {
                    return item.children.some(child => {
                        const childPath = child.path.toLowerCase();
                        return currentPath === childPath || currentPath.startsWith(childPath + '/');
                    });
                }
                return false;
            }
            
            // 处理有路径的父菜单
            const targetPath = item.path.toLowerCase();
            
            // 首先检查当前路径是否直接匹配父菜单路径
            if (currentPath === targetPath) return true;
            
            // 检查是否匹配任何子菜单路径
            if (item.children) {
                return item.children.some(child => {
                    const childPath = child.path.toLowerCase();
                    return currentPath === childPath || currentPath.startsWith(childPath + '/');
                });
            }
            
            return false;
        };

        // Initialize submenu expansion state based on current path
        const initExpandedMenus = () => {
            const currentPath = route.path.toLowerCase();
            
            navigationConfig.sidebarNavItems.forEach((item, index) => {
                if (item.children && item.children.length > 0) {
                    // 创建一个可靠的键
                    const menuKey = getMenuKey(item, index);
                    
                    // 检查是否应该展开
                    const shouldExpand = item.children.some(child => {
                        const childPath = child.path.toLowerCase();
                        return currentPath === childPath || currentPath.startsWith(childPath + '/');
                    });
                    
                    if (shouldExpand) {
                        expandedMenus.value[menuKey] = true;
                    }
                }
            });
        };
        
        // Toggle submenu expansion state
        const toggleSubmenu = (item: NavItem) => {
            // 使用唯一标识符作为键
            const menuKey = getMenuKey(item);
            expandedMenus.value[menuKey] = !expandedMenus.value[menuKey];
        };

        // Get navigation items for specific section
        const getNavItemsBySection = (section: string) => {
            return navigationConfig.sidebarNavItems.filter(item => {
                if (item.section !== section) return false;
                if (item.adminOnly && !props.userData.isAdmin) return false;
                return true;
            });
        };

        // Toggle sidebar
        const toggleSidebar = () => {
            // 修复: 无论当前模式如何，都允许切换sidebar状态
            // 移除对于fixed模式下的限制条件
            emit('toggle-sidebar');
        };
        
        // 创建一个更可靠的获取菜单唯一标识符的方法
        const getMenuKey = (item: NavItem, index?: number): string => {
            // 如果有路径且不为空，使用路径作为键
            if (item.path) {
                return item.path;
            }
            
            // 否则使用节、文本和索引组合创建唯一键
            return `${item.section}-${item.text}-${index || 0}`;
        };
        
        // 获取子菜单展开状态
        const getSubmenuExpandedState = (item: NavItem): boolean => {
            // 为父菜单创建的唯一键
            const menuKey = getMenuKey(item);
            
            // 检查这个键是否在expandedMenus中为true
            return !!expandedMenus.value[menuKey];
        };

        // Update submenu state when route changes
        watch(route, () => {
            initExpandedMenus();
        });

        return {
            getNavItemsBySection,
            isActive,
            isParentActive,
            toggleSidebar,
            expandedMenus,
            toggleSubmenu,
            getSubmenuExpandedState,
            navMode,
            isLargeScreen
        };
    }
});
</script>