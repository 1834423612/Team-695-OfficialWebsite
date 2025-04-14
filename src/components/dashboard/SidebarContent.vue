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

        <!-- User profile summary -->
        <div class="p-2 border-b border-gray-200" v-if="sidebarOpen">
            <div class="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <CachedAvatar v-if="userData.id" :userId="userData.id" :src="userData.avatar" :name="userData.name"
                    :firstName="userData.firstName" :lastName="userData.lastName" :displayName="userData.displayName"
                    :size="40" class="h-10 w-10 rounded-full" />
                <div v-else class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon icon="mdi:account" class="h-6 w-6 text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-sm font-medium text-gray-900 truncate">
                        {{ userData.displayName || userData.name || 'Guest User' }}
                    </h2>
                    <p class="text-xs text-gray-500 truncate">
                        {{ userData.isAdmin ? 'Administrator' : 'Team Member' }}
                    </p>
                </div>
                <!-- 添加登出按钮 -->
                <button @click="() => logout()" 
                    class="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Sign out">
                    <Icon icon="mdi:logout" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Sidebar content -->
        <nav class="flex-1 overflow-auto p-2">
            <!-- Dynamically generate navigation sections based on config -->
            <template v-for="section in ['main', 'scouting', 'user', 'external']" :key="section">
                <div class="mb-4">
                    <h3 v-if="sidebarOpen" class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {{ getSectionTitle(section) }}
                    </h3>
                    <ul class="mt-2 space-y-1">
                        <li v-for="item in getNavItemsBySection(section)" :key="item.path">
                            <!-- Handle router links -->
                            <router-link v-if="!item.isExternalLink" :to="item.path"
                                class="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                :class="{ 
                                    'bg-blue-50 text-blue-600 font-medium': isActive(item.path),
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
        <div class="flex-shrink-0 p-2 border-t max-h-14">
            <button @click="toggleSidebar"
                class="flex items-center justify-center w-full p-2 space-x-1 font-medium rounded-md bg-gray-100 hover:bg-gray-200">
                <span>
                    <Icon :icon="sidebarOpen ? 'mdi:chevron-double-left' : 'mdi:chevron-double-right'"
                        class="w-5 h-5" />
                </span>
                <span v-if="sidebarOpen">Collapse</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import CachedAvatar from '@/components/common/CachedAvatar.vue';
// 修改导入路径，使用相对路径而不是使用 @ 别名
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
            default: () => ({})
        },
        // 添加logout方法作为prop
        logout: {
            type: Function,
            required: true
        }
    },
    emits: ['close', 'toggle-sidebar'],
    setup(props, { emit }) {
        const route = useRoute();

        // Check if route is active
        const isActive = (path: string) => {
            const currentPath = route.path.toLowerCase();
            const checkPath = path.toLowerCase();

            if (checkPath === '/dashboard' && currentPath === '/dashboard') {
                return true;
            }

            return checkPath !== '/dashboard' && currentPath.startsWith(checkPath);
        };

        // Get navigation items by section
        const getNavItemsBySection = (section: string): NavItem[] => {
            return navigationConfig.sidebarNavItems.filter((item: NavItem) => 
                item.section === section && 
                (!item.adminOnly || props.userData.isAdmin)
            );
        };

        // Get human-readable section title
        const getSectionTitle = (section: string): string => {
            const titles: Record<string, string> = {
                main: 'Main',
                scouting: 'Scouting',
                user: 'User Settings',
                external: 'External'
            };
            return titles[section] || section;
        };

        // Toggle sidebar
        const toggleSidebar = () => {
            emit('toggle-sidebar');
        };

        return {
            isActive,
            toggleSidebar,
            navigationConfig,
            getNavItemsBySection,
            getSectionTitle
        };
    }
});
</script>