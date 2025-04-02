<template>
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
                            <router-link to="/dashboard" :class="[
                                isExactActive('/dashboard')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                            ]">
                                Dashboard
                            </router-link>
                            <router-link to="/" :class="[
                                isExactActive('/')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                            ]">
                                Home
                            </router-link>
                            <!-- <router-link to="/dashboard/calendar" :class="[
                                isExactActive('/dashboard/calendar')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                            ]">
                                Calendar
                            </router-link>
                            <router-link to="/dashboard/team" :class="[
                                isExactActive('/dashboard/team')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                            ]">
                                Team
                            </router-link>
                            <router-link to="/dashboard/projects" :class="[
                                isExactActive('/dashboard/projects')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                            ]">
                                Projects
                            </router-link> -->
                        </div>
                    </div>

                    <!-- Desktop Menu -->
                    <div class="hidden sm:ml-6 sm:flex sm:items-center">
                        <div class="flex items-center space-x-4">
                            <!-- Notifications -->
                            <div class="relative notifications-container">
                                <!-- <button @click="toggleNotifications"
                                    class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Icon icon="mdi:bell-outline" class="h-6 w-6" />
                                    <span
                                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                                </button> -->

                                <!-- Notifications Dropdown -->
                                <!-- <div v-if="showNotifications"
                                    class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div class="py-1">
                                        <div class="px-4 py-2 border-b border-gray-100">
                                            <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
                                        </div>
                                        <div class="max-h-60 overflow-y-auto">
                                            <a href="#"
                                                class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-50 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-blue-100 rounded-full p-1">
                                                        <Icon icon="mdi:calendar-clock" class="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">Team meeting
                                                            tomorrow</p>
                                                        <p class="text-xs text-gray-500">10 minutes ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#"
                                                class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-50 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-green-100 rounded-full p-1">
                                                        <Icon icon="mdi:robot" class="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">Robot maintenance
                                                            completed</p>
                                                        <p class="text-xs text-gray-500">1 hour ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-purple-100 rounded-full p-1">
                                                        <Icon icon="mdi:trophy" class="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">Competition
                                                            registration open</p>
                                                        <p class="text-xs text-gray-500">Yesterday</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="border-t border-gray-100 px-4 py-2">
                                            <a href="#"
                                                class="text-xs text-blue-600 hover:text-blue-800 font-medium">View all
                                                notifications</a>
                                        </div>
                                    </div>
                                </div> -->
                            </div>

                            <!-- User Profile Section -->
                            <div class="flex items-center space-x-3">
                                <div class="relative user-menu-container">
                                    <button @click="toggleUserMenu"
                                        class="flex items-center space-x-2 focus:outline-none">
                                        <div class="flex items-center">
                                            <img v-if="userData.avatar" :src="userData.avatar" alt="User Avatar"
                                                class="h-8 w-8 rounded-full" />
                                            <div v-else
                                                class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Icon icon="mdi:account" class="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div class="ml-2 text-left">
                                                <div class="text-sm font-medium text-gray-700">{{ userData.displayName
                                                    || userData.name }}</div>
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
                                            <router-link to="/dashboard/profile" :class="[
                                                isExactActive('/dashboard/profile')
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100',
                                                'px-4 py-2 text-sm flex items-center'
                                            ]">
                                                <Icon icon="mdi:account-circle" class="h-4 w-4 mr-2 text-gray-500" />
                                                Your Profile
                                            </router-link>
                                            <!-- <router-link to="/dashboard/settings" :class="[
                                                isExactActive('/dashboard/settings')
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100',
                                                'px-4 py-2 text-sm flex items-center'
                                            ]">
                                                <Icon icon="mdi:cog" class="h-4 w-4 mr-2 text-gray-500" />
                                                Settings
                                            </router-link> -->
                                            <div v-if="userData.isAdmin" class="border-t-2 border-gray-200">
                                                <!-- <router-link to="/dashboard/admin" :class="[
                                                    isExactActive('/dashboard/admin')
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-100',
                                                    'px-4 py-2 text-sm flex items-center'
                                                ]">
                                                    <Icon icon="mdi:shield-account"
                                                        class="h-4 w-4 mr-2 text-gray-500" />
                                                    Admin Panel
                                                </router-link> -->
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
                            <!-- Mobile Notifications -->
                            <!-- <div class="relative notifications-container">
                                <button @click="toggleNotifications"
                                    class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Icon icon="mdi:bell-outline" class="h-6 w-6" />
                                    <span
                                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                                </button> -->

                                <!-- Mobile Notifications Dropdown -->
                                <!-- <div v-if="showNotifications"
                                    class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div class="py-1">
                                        <div
                                            class="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <h3 class="text-sm font-medium text-gray-900">Notifications
                                            </h3>
                                            <button @click="showNotifications = false"
                                                class="text-gray-400 hover:text-gray-500">
                                                <Icon icon="mdi:close" class="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div class="max-h-96 overflow-y-auto">
                                            <a href="#"
                                                class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-50 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-blue-100 rounded-full p-1">
                                                        <Icon icon="mdi:calendar-clock" class="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">
                                                            Team
                                                            meeting
                                                            tomorrow</p>
                                                        <p class="text-xs text-gray-500 mt-1">Strategy
                                                            session
                                                            at 4:00
                                                            PM</p>
                                                        <p class="text-xs text-gray-400 mt-1">10 minutes
                                                            ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#"
                                                class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-50 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-green-100 rounded-full p-1">
                                                        <Icon icon="mdi:robot" class="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">
                                                            Robot
                                                            maintenance
                                                            completed</p>
                                                        <p class="text-xs text-gray-500 mt-1">Drivetrain
                                                            updated
                                                        </p>
                                                        <p class="text-xs text-gray-400 mt-1">1 hour ago
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0 bg-purple-100 rounded-full p-1">
                                                        <Icon icon="mdi:trophy" class="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900">
                                                            Competition
                                                            registration open</p>
                                                        <p class="text-xs text-gray-500 mt-1">Regional
                                                            competition</p>
                                                        <p class="text-xs text-gray-400 mt-1">Yesterday
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="border-t border-gray-100 px-4 py-2">
                                            <a href="#"
                                                class="text-xs text-blue-600 hover:text-blue-800 font-medium">View
                                                all
                                                notifications</a>
                                        </div>
                                    </div>
                                </div>
                            </div> -->

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

            <!-- Mobile menu -->
            <div v-show="mobileMenuOpen" class="sm:hidden bg-gray-50 border-t border-gray-200" id="mobile-menu">
                <!-- Mobile User Profile -->
                <div class="pt-4 pb-3 border-b border-gray-200 bg-white">
                    <div class="flex items-center px-4">
                        <div class="flex-shrink-0">
                            <img v-if="userData.avatar" :src="userData.avatar" alt="User Avatar"
                                class="h-10 w-10 rounded-full" />
                            <div v-else class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Icon icon="mdi:account" class="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div class="ml-3 flex-1">
                            <div class="text-base font-medium text-gray-800">{{ userData.displayName ||
                                userData.name }}
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
                    <router-link to="/dashboard" exact
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/dashboard')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:view-dashboard" class="h-5 w-5 mr-2" />
                        Dashboard
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
                    <!-- <router-link to="/dashboard/calendar"
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/dashboard/calendar')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:calendar" class="h-5 w-5 mr-2" />
                        Calendar
                    </router-link>
                    <router-link to="/dashboard/team"
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/dashboard/team')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:account-group" class="h-5 w-5 mr-2" />
                        Team
                    </router-link>
                    <router-link to="/dashboard/projects"
                        class="pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center" :class="[
                            isExactActive('/dashboard/projects')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:folder" class="h-5 w-5 mr-2" />
                        Projects
                    </router-link> -->
                </div>

                <!-- Mobile User Actions -->
                <div class="pb-1 border-t border-gray-200 bg-white">
                    <div class="space-y-1">
                        <router-link to="/dashboard/profile"
                            class="pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium flex items-center"
                            :class="[
                                isExactActive('/dashboard/profile')
                                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            ]">
                            <Icon icon="mdi:account-circle" class="h-5 w-5 mr-2" />
                            Your Profile
                        </router-link>
                        <!-- <router-link to="/dashboard/settings"
                            class="pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium flex items-center"
                            :class="[
                                isExactActive('/dashboard/settings')
                                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            ]">
                            <Icon icon="mdi:cog" class="h-5 w-5 mr-2" />
                            Settings
                        </router-link> -->
                    </div>
                </div>

                <!-- Mobile Admin Panel (if user is admin) -->
                <div v-if="userData.isAdmin" class="pb-1 border-t border-gray-200 bg-white">
                    <!-- <router-link to="/dashboard/admin"
                        class="pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium flex items-center"
                        :class="[
                            isExactActive('/dashboard/admin')
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        ]">
                        <Icon icon="mdi:shield-account" class="h-5 w-5 mr-2" />
                        Admin Panel
                    </router-link> -->
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="flex-grow">
            <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                            <!-- <a href="#" target="_blank" class="text-gray-400 hover:text-gray-500">
                                <Icon icon="mdi:facebook" class="h-5 w-5" />
                            </a> -->
                            <a href="https://www.instagram.com/beachwood695/" target="_blank"
                                class="text-gray-500 hover:text-gray-600">
                                <Icon icon="mdi:instagram" class="h-5 w-5" />
                            </a>
                            <!-- <a href="#" target="_blank" class="text-gray-400 hover:text-gray-500">
                                <Icon icon="mdi:twitter" class="h-5 w-5" />
                            </a> -->
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
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import router from '@/router';

export default defineComponent({
    name: 'DashboardIndexView',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const mobileMenuOpen = ref(false);
        const showUserMenu = ref(false);
        const showNotifications = ref(false);

        // Use the Pinia store
        const userStore = useUserStore();

        // Use storeToRefs to maintain reactivity
        // Only destructure what we need to avoid TypeScript errors
        const { userInfo, orgData } = storeToRefs(userStore);

        // Access other properties directly from the store
        const storeIsLoading = computed(() => userStore.isLoading);
        const storeError = computed(() => userStore.error);

        // Computed property for user data
        const userData = computed(() => {
            return userInfo.value || {};
        });

        // Improved active route detection
        const isExactActive = (path: string) => {
            if (path === '/dashboard' && route.path === '/dashboard') {
                return true;
            }
            return path !== '/dashboard' && route.path === path;
        };

        // Close mobile menu when route changes
        watch(
            () => route.path,
            () => {
                mobileMenuOpen.value = false;
                showUserMenu.value = false;
                showNotifications.value = false;
            }
        );

        // Toggle user menu dropdown
        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value;
            if (showUserMenu.value) {
                showNotifications.value = false;
            }
        };

        // Toggle notifications dropdown
        const toggleNotifications = () => {
            showNotifications.value = !showNotifications.value;
            if (showNotifications.value) {
                showUserMenu.value = false;
            }
        };

        // Close dropdowns when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if click is outside user menu
            if (showUserMenu.value && !target.closest('.user-menu-container')) {
                showUserMenu.value = false;
            }

            // Check if click is outside notifications menu
            if (showNotifications.value && !target.closest('.notifications-container')) {
                showNotifications.value = false;
            }
        };

        const logout = () => {
            casdoorService.logout();
            userStore.clearUserInfo(); // Clear user info in the store
            router.push({ name: 'login' }).catch(err => console.error('Failed to navigate to login:', err));
        };

        onMounted(() => {
            if (!casdoorService.isLoggedIn()) {
                router.push({ name: 'login' });
                return;
            }

            // Initialize the store only if not already initialized
            // This prevents redundant API calls during navigation
            userStore.initializeStore();

            // Add click outside listener
            document.addEventListener('click', handleClickOutside);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        return {
            userData,
            orgData,
            isLoading: storeIsLoading,
            error: storeError,
            mobileMenuOpen,
            showUserMenu,
            showNotifications,
            logout,
            isExactActive,
            toggleUserMenu,
            toggleNotifications
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