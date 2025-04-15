<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- Sidebar - Overlay Mode -->
        <aside v-if="navMode === 'overlay'"
            class="fixed inset-y-0 z-20 flex flex-col flex-shrink-0 w-64 max-h-screen overflow-hidden transition-all transform bg-white border-r shadow-lg lg:z-auto"
            :class="{
                '-translate-x-full': !sidebarOpen,
                'translate-x-0': sidebarOpen
            }">
            <SidebarContent :sidebarOpen="sidebarOpen" :userData="userData" :orgData="orgData" @close="closeSidebar"
                @toggle-sidebar="toggleSidebar" :logout="logout" />
        </aside>

        <!-- Sidebar - Fixed Mode -->
        <aside v-if="navMode === 'fixed'"
            class="flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out bg-white border-r shadow-sm h-screen sticky top-0"
            :class="{
                'w-64': sidebarOpen,
                'w-20': !sidebarOpen
            }">
            <SidebarContent :sidebarOpen="sidebarOpen" :userData="userData" :orgData="orgData" @close="closeSidebar"
                @toggle-sidebar="toggleSidebar" :logout="logout" />
        </aside>

        <!-- Backdrop for overlay sidebar on mobile -->
        <div v-if="sidebarOpen && navMode === 'overlay'" class="fixed inset-0 z-10 bg-black bg-opacity-30 lg:hidden"
            @click="closeSidebar"></div>

        <!-- Main content -->
        <div class="flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out" 
            :class="{
                'filter blur-sm pointer-events-none': sidebarOpen && navMode === 'overlay' && !isLargeScreen
            }">
            <!-- Navbar -->
            <header
                class="flex-shrink-0 border-b bg-white shadow-sm sticky top-0 z-10 transition-all duration-300 ease-in-out">
                <div class="flex items-center justify-between p-2 px-4">
                    <!-- Navbar left -->
                    <div class="flex items-center space-x-3">
                        <button @click="toggleSidebar" class="p-2 rounded-md hover:bg-gray-100 relative">
                            <Icon v-if="!sidebarOpen || navMode === 'overlay'" icon="mdi:menu"
                                class="w-6 h-6 text-gray-600" />
                            <Icon v-else icon="mdi:chevron-double-left" class="w-6 h-6 text-gray-600" />
                        </button>
                        <div class="block">
                            <h1
                                class="md:text-xl sm:text-lg font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {{ pageTitle }}</h1>
                            <p class="text-[12px] lg:text-sm leading-none text-gray-600">{{ currentDate }}</p>
                        </div>
                    </div>

                    <!-- Navbar right (Header) -->
                    <div class="relative flex items-center space-x-3">
                        <div class="items-center hidden md:flex">
                            <!-- Home icon with tooltip -->
                            <div class="relative group">
                                <router-link to="/"
                                    class="hover:bg-gray-100 p-2 rounded-md text-gray-500 hover:text-gray-700 flex items-center justify-center"
                                    @touchstart="handleTouchStart($event, 'home')"
                                    @touchend="handleTouchEnd">
                                    <Icon icon="mdi:home" class="w-5 h-5" />
                                </router-link>
                                <!-- Desktop tooltip (hover) - set to show on bottom -->
                                <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                        Go to Home
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Navigation mode toggle with tooltip -->
                            <div class="relative group ml-1">
                                <button @click="toggleNavMode"
                                    class="hover:bg-gray-100 p-2 rounded-md text-gray-500 hover:text-gray-700 flex items-center justify-center"
                                    @touchstart="handleTouchStart($event, 'navMode')" 
                                    @touchend="handleTouchEnd">
                                    <Icon :icon="navMode === 'fixed' ? 'mdi:dock-left' : 'mdi:dock-window'"
                                        class="w-5 h-5" />
                                </button>
                                <!-- Desktop tooltip (hover) - set to show on bottom -->
                                <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                        {{ navMode === 'fixed' ? 'Switch to Overlay Mode' : 'Switch to Fixed Mode' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- User dropdown -->
                        <div class="relative" ref="userMenuContainer">
                            <button @click="toggleUserMenu" class="flex items-center p-2 rounded-md hover:bg-gray-100">
                                <span class="sr-only">User menu</span>
                                <div class="flex items-center space-x-2">
                                    <div class="relative flex-shrink-0">
                                        <CachedAvatar v-if="userData.id" :userId="userData.id" :src="userData.avatar"
                                            :name="userData.name" :firstName="userData.firstName"
                                            :lastName="userData.lastName" :displayName="userData.displayName" :size="32"
                                            class="h-8 w-8 rounded-full" />
                                        <div v-else
                                            class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Icon icon="mdi:account" class="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div class="hidden md:block text-left">
                                        <h2 class="text-sm font-medium text-gray-700 text-left">{{ userData.displayName
                                            ||
                                            userData.name }}</h2>
                                        <p class="text-xs text-gray-500 text-left">{{ userData.isAdmin ? 'Administrator'
                                            : 'Team Member' }}</p>
                                    </div>
                                    <Icon icon="mdi:chevron-down" class="w-4 h-4 text-gray-500" />
                                </div>
                            </button>

                            <!-- User dropdown menu -->
                            <div v-if="showUserMenu"
                                class="absolute right-0 z-10 w-48 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                <div class="py-1">
                                    <template v-for="item in userMenuItems" :key="item.text">
                                        <router-link v-if="item.path" :to="item.path"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <div class="flex items-center">
                                                <Icon :icon="item.icon || 'mdi:circle-small'" class="w-4 h-4 mr-2"
                                                    :class="item.iconClass" />
                                                {{ item.text }}
                                            </div>
                                        </router-link>
                                        <button v-else-if="item.action" @click="item.action"
                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <div class="flex items-center">
                                                <Icon :icon="item.icon || 'mdi:circle-small'" class="w-4 h-4 mr-2"
                                                    :class="item.iconClass" />
                                                {{ item.text }}
                                            </div>
                                        </button>
                                        <div v-else-if="item.divider" class="border-t border-gray-200"></div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main content with scrollable area -->
            <div class="flex-1 overflow-auto">
                <main class="p-2 mb-4 mx-auto w-full max-w-7xl">
                    <!-- Breadcrumb -->
                    <div class="flex items-center mt-4 mb-2 mx-4 space-x-2 text-sm p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <router-link to="/Dashboard" class="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
                            <span class="flex items-center justify-center bg-blue-50 p-1.5 rounded-md">
                                <Icon icon="mdi:view-dashboard" class="w-4 h-4 text-blue-500" />
                            </span>
                            <span class="ml-1.5 font-medium">Dashboard</span>
                        </router-link>
                        <template v-if="currentBreadcrumb">
                            <span class="flex items-center text-gray-400">
                                <Icon icon="mdi:chevron-right" class="w-4 h-4" />
                            </span>
                            <span class="flex items-center text-blue-600 font-medium">
                                <span class="flex items-center justify-center bg-blue-50 p-1.5 rounded-md">
                                    <Icon :icon="getBreadcrumbIcon(currentBreadcrumb.path)" class="w-4 h-4 text-blue-500" />
                                </span>
                                <span class="ml-1.5">{{ currentBreadcrumb.name }}</span>
                            </span>
                        </template>
                    </div>

                    <!-- Page content -->
                    <slot></slot>
                </main>

                <!-- Footer -->
                <footer class="flex items-center justify-between p-4 border-t">
                    <div>
                        <p class="text-sm text-gray-500">
                            © {{ new Date().getFullYear() }} Team 695. All rights reserved.
                        </p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="https://www.instagram.com/beachwood695/" target="_blank"
                            class="text-gray-500 hover:text-gray-600">
                            <Icon icon="mdi:instagram" class="w-5 h-5" />
                        </a>
                        <a href="https://github.com/FRCTeam695" target="_blank"
                            class="text-gray-500 hover:text-gray-600">
                            <Icon icon="mdi:github" class="w-5 h-5" />
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import CachedAvatar from '@/components/common/CachedAvatar.vue';
import SidebarContent from '@/components/dashboard/SidebarContent.vue';
// Modify import path to use relative path instead of @ alias
import { navigationConfig } from '../config/navigation';

// User menu item interface
interface UserMenuItem {
    text?: string;
    icon?: string;
    path?: string;
    action?: () => void;
    divider?: boolean;
    iconClass?: string;
}

export default defineComponent({
    name: 'DashboardLayout',
    components: {
        Icon,
        CachedAvatar,
        SidebarContent
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const sidebarOpen = ref(true); // Start with sidebar open in fixed mode
        const showUserMenu = ref(false);
        const userMenuContainer = ref<HTMLElement | null>(null);
        const navMode = ref<'overlay' | 'fixed'>('overlay');
        const isLargeScreen = ref(false);
        const showMobileWarning = ref(false);

        // For mobile tooltip functionality
        const activeTouchTooltip = ref<string | null>(null);
        const touchTimer = ref<number | null>(null);
        
        // Handle long press on mobile devices
        const handleTouchStart = (_event: TouchEvent, buttonType: string) => {
            // Clear any existing timer
            if (touchTimer.value) {
                clearTimeout(touchTimer.value);
            }
            
            // Set a timeout to trigger the tooltip after 500ms (long press)
            touchTimer.value = window.setTimeout(() => {
                activeTouchTooltip.value = buttonType;
            }, 500);
        };
        
        // Clear tooltip on touch end
        const handleTouchEnd = () => {
            // Clear timeout if touch ends before long press threshold
            if (touchTimer.value) {
                clearTimeout(touchTimer.value);
                touchTimer.value = null;
            }
            
            // Hide tooltip after a short delay to allow user to see it
            setTimeout(() => {
                activeTouchTooltip.value = null;
            }, 1500);
        };

        // Use Pinia store
        const userStore = useUserStore();
        const { userInfo, orgData } = storeToRefs(userStore);

        // Initialize navigation mode, prioritize local storage
        const initNavMode = () => {
            console.log('Initializing navigation mode...');
            
            // Get navigation mode from localStorage
            const savedNavMode = localStorage.getItem('dashboard_nav_mode');
            const savedSidebarState = localStorage.getItem('sidebar_open');
            
            // console.log('Read from localStorage:', { savedNavMode, savedSidebarState });
            
            // First detect current screen size - Fixed to 720px instead of 800px to match checkScreenSize
            const isMobileSize = window.innerWidth < 720;
            
            if (isMobileSize) {
                // Always use overlay mode on small screen devices
                navMode.value = 'overlay';
                sidebarOpen.value = false;
                // console.log('Mobile screen detected, forcing overlay mode');
            } else if (savedNavMode === 'fixed' || savedNavMode === 'overlay') {
                // Use saved settings on desktop
                navMode.value = savedNavMode;
                // console.log('Using saved navigation mode:', navMode.value);
                
                // Set sidebar state based on saved preferences
                if (savedSidebarState) {
                    sidebarOpen.value = savedSidebarState === 'true';
                } else {
                    // By default, open sidebar in fixed mode, close it in overlay mode
                    sidebarOpen.value = navMode.value === 'fixed';
                }
                // console.log('Setting sidebar state based on preferences:', sidebarOpen.value);
            } else {
                // Default mode for desktop is fixed
                navMode.value = 'fixed';
                sidebarOpen.value = true;
                // console.log('Setting default mode for desktop:', { navMode: 'fixed', sidebarOpen: true });
            }
            
            // Save current state to localStorage
            localStorage.setItem('dashboard_nav_mode', navMode.value);
            localStorage.setItem('sidebar_open', sidebarOpen.value.toString());
        };

        // User data computed property
        const userData = computed(() => userInfo.value || {});

        // Current date formatted
        const currentDate = computed(() => {
            return new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });

        // Shorter date format for mobile
        const currentDateShort = computed(() => {
            return new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        });

        // Page title based on current route
        const pageTitle = computed(() => {
            const path = route.path.toLowerCase();

            if (path === '/dashboard') return 'Dashboard';
            if (path.includes('profile')) return 'User Profile';
            if (path.includes('api')) return 'API Management';
            if (path.includes('assignments')) return 'Assignments';
            if (path.includes('pit-scouting/admin')) return 'Pit Scouting Admin';
            if (path.includes('pit-scouting')) return 'Pit Scouting';
            if (path.includes('calendar')) return 'Calendar';
            if (path.includes('system/version')) return 'System Version';

            return 'Dashboard';
        });

        // Breadcrumb navigation mapping
        const breadcrumbMap: Record<string, { name: string; icon: string; path: string }> = {
            '/Dashboard/Profile': { name: 'Profile', icon: 'mdi:account-circle', path: '/Dashboard/Profile' },
            '/Dashboard/API': { name: 'API', icon: 'mdi:api', path: '/Dashboard/API' },
            '/Dashboard/Assignments': { name: 'Assignments', icon: 'mdi:calendar-check', path: '/Dashboard/Assignments' },
            '/Dashboard/Pit-Scouting': { name: 'Pit Scouting Form', icon: 'mdi:clipboard-text', path: '/Dashboard/Pit-Scouting' },
            '/Dashboard/Pit-Scouting/Admin': { name: 'Pit Scouting Admin', icon: 'mdi:shield-account', path: '/Dashboard/Pit-Scouting/Admin' },
            '/Dashboard/Calendar': { name: 'Calendar', icon: 'mdi:calendar', path: '/Dashboard/Calendar' },
            '/Dashboard/System/Version': { name: 'System Version', icon: 'mdi:information-outline', path: '/Dashboard/System/Version' },
        };

        // Current breadcrumb
        const currentBreadcrumb = computed(() => {
            const path = route.path;
            const lowercasePath = path.toLowerCase();

            // Try exact match first
            for (const [key, value] of Object.entries(breadcrumbMap)) {
                if (lowercasePath === key.toLowerCase()) {
                    return value;
                }
            }

            // Try prefix match
            for (const [key, value] of Object.entries(breadcrumbMap)) {
                if (lowercasePath.startsWith(key.toLowerCase())) {
                    return value;
                }
            }

            return null;
        });

        // Logout function
        const logout = async () => {
            try {
                await casdoorService.logout();
                userStore.clearUserInfo();
                await router.push({ name: 'login' });

                // Force page reload to clear all states
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } catch (error) {
                console.error("Logout failed:", error);
                router.push({ name: 'login' });
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        };

        // User menu items configuration
        const userMenuItems = computed<UserMenuItem[]>(() => [
            {
                text: 'Your Profile',
                icon: 'mdi:account-circle',
                path: '/Dashboard/Profile'
            },
            {
                text: 'API Keys',
                icon: 'mdi:api',
                path: '/Dashboard/API'
            },
            {
                divider: true
            },
            {
                text: 'Sign out',
                icon: 'mdi:logout',
                iconClass: 'text-red-500',
                action: logout
            }
        ]);

        // Get breadcrumb icon
        const getBreadcrumbIcon = (path: string) => {
            return breadcrumbMap[path]?.icon || 'mdi:chevron-right';
        };

        // Toggle sidebar
        const toggleSidebar = () => {
            sidebarOpen.value = !sidebarOpen.value;
            // Save sidebar state to local storage
            localStorage.setItem('sidebar_open', sidebarOpen.value.toString());
            // console.log('Toggle sidebar state:', sidebarOpen.value);
        };

        // Close sidebar (for overlay mode and mobile)
        const closeSidebar = () => {
            if (navMode.value === 'overlay' || !isLargeScreen.value) {
                sidebarOpen.value = false;
                localStorage.setItem('sidebar_open', 'false');
            }
        };

        // Toggle navigation mode between fixed and overlay
        const toggleNavMode = () => {
            // Only allow mode switching on large screens - Fixed to 720px to match checkScreenSize
            if (window.innerWidth < 720) {
                showMobileWarning.value = true;
                
                // Hide the warning after 2 seconds
                setTimeout(() => {
                    showMobileWarning.value = false;
                }, 2000);
                
                console.log('Mobile devices cannot switch to fixed mode');
                return;
            }
            
            // Toggle mode
            navMode.value = navMode.value === 'fixed' ? 'overlay' : 'fixed';
            // console.log('Switching navigation mode to:', navMode.value);
            
            // Adjust sidebar state based on new mode
            if (navMode.value === 'fixed') {
                sidebarOpen.value = true;
            } else {
                sidebarOpen.value = false;
            }
            
            // Save settings to localStorage
            localStorage.setItem('dashboard_nav_mode', navMode.value);
            localStorage.setItem('sidebar_open', sidebarOpen.value.toString());
            console.log('Saved settings:', { navMode: navMode.value, sidebarOpen: sidebarOpen.value });
        };

        // Toggle user menu
        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value;
        };

        // Handle click outside to close user menu
        const handleClickOutside = (event: MouseEvent) => {
            if (showUserMenu.value && userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
                showUserMenu.value = false;
            }
        };

        // Check screen size
        const checkScreenSize = () => {
            const wasLargeScreen = isLargeScreen.value;
            isLargeScreen.value = window.innerWidth >= 720;
            
            // If screen size category changed
            if (wasLargeScreen !== isLargeScreen.value) {
                // console.log('Screen size changed:', isLargeScreen.value ? 'Desktop' : 'Mobile');
                
                if (!isLargeScreen.value) {
                    // Small screen: force overlay mode and close sidebar
                    navMode.value = 'overlay';
                    sidebarOpen.value = false;
                    localStorage.setItem('dashboard_nav_mode', navMode.value);
                    localStorage.setItem('sidebar_open', 'false');
                    // console.log('Switched to mobile view:', { navMode: 'overlay', sidebarOpen: false });
                } else {
                    // Large screen: restore user's saved settings
                    const savedNavMode = localStorage.getItem('dashboard_nav_mode');
                    const savedSidebarState = localStorage.getItem('sidebar_open');
                    
                    // If there were previously saved settings not forced by mobile view
                    if (savedNavMode && (savedNavMode === 'fixed' || savedNavMode === 'overlay')) {
                        navMode.value = savedNavMode as 'fixed' | 'overlay';
                        // console.log('Restored saved navigation mode:', navMode.value);
                    } else {
                        // Default desktop mode is fixed
                        navMode.value = 'fixed';
                        localStorage.setItem('dashboard_nav_mode', 'fixed');
                        // console.log('Set default desktop mode to fixed');
                    }
                    
                    // Restore sidebar state
                    if (navMode.value === 'fixed') {
                        // In fixed mode, default to open sidebar
                        sidebarOpen.value = savedSidebarState !== 'false';
                        localStorage.setItem('sidebar_open', sidebarOpen.value.toString());
                        // console.log('Restored sidebar state for fixed mode:', sidebarOpen.value);
                    } else {
                        // In overlay mode, default to closed sidebar
                        sidebarOpen.value = savedSidebarState === 'true';
                        localStorage.setItem('sidebar_open', sidebarOpen.value.toString());
                        // console.log('Restored sidebar state for overlay mode:', sidebarOpen.value);
                    }
                }
                
                // Dispatch custom event to notify other components of mode change
                window.dispatchEvent(new CustomEvent('nav-mode-changed', { 
                    detail: { mode: navMode.value, sidebarOpen: sidebarOpen.value } 
                }));
            }
        };

        // Close menus on route change
        watch(() => route.path, () => {
            showUserMenu.value = false;

            // Only close sidebar on mobile devices or in overlay mode
            if (!isLargeScreen.value || navMode.value === 'overlay') {
                sidebarOpen.value = false;
                localStorage.setItem('sidebar_open', 'false');
            }
        });

        onMounted(() => {
            console.log('Component mounted');
            // Initialize navigation mode and sidebar state
            initNavMode();
            
            document.addEventListener('click', handleClickOutside);
            window.addEventListener('resize', checkScreenSize);
            // Run checkScreenSize once to set initial state correctly
            checkScreenSize();

            // Initialize user store
            if (casdoorService.isLoggedIn()) {
                userStore.initializeStore();
            }
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('resize', checkScreenSize);
        });

        return {
            sidebarOpen,
            showUserMenu,
            showMobileWarning,
            userMenuContainer,
            userData,
            orgData,
            currentDate,
            currentDateShort,
            pageTitle,
            currentBreadcrumb,
            navMode,
            isLargeScreen,
            toggleSidebar,
            closeSidebar,
            toggleNavMode,
            toggleUserMenu,
            logout,
            getBreadcrumbIcon,
            userMenuItems,
            navigationConfig,
            handleTouchStart,
            handleTouchEnd,
            activeTouchTooltip
        };
    }
});
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

/* Mobile tooltip styles */
.mobile-tooltip {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    z-index: 100;
    font-size: 14px;
    max-width: 280px;
    text-align: center;
}

/* Fade transition for mobile tooltip */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
}
</style>