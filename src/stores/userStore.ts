import { defineStore } from 'pinia';
import { casdoorService } from '@/services/auth';
// import { ref, computed } from 'vue';

// 定义存储状态接口
export interface UserStoreState {
    userInfo: any;
    orgData: any;
    isLoading: boolean;
    error: string | null;
    lastFetchTime: number | null;
    isInitialized: boolean;
}

export const useUserStore = defineStore('user', {
    state: (): UserStoreState => ({
        userInfo: null,
        orgData: null,
        isLoading: false,
        error: null,
        lastFetchTime: null,
        isInitialized: false
    }),

    getters: {
        isLoggedIn(): boolean {
            return casdoorService.isLoggedIn();
        },

        // 获取当前用户名，兼容多种情况
        userName(): string {
            if (!this.userInfo) return 'User';
            return this.userInfo.displayName ||
                (this.userInfo.name ? this.userInfo.name.split('@')[0] : 'User');
        },

        // 检查是否为管理员
        isAdmin(): boolean {
            if (!this.userInfo) return false;
            return !!this.userInfo.isAdmin;
        },

        // 返回头像URL或null
        avatarUrl(): string | null {
            return this.userInfo?.avatar || null;
        }
    },

    actions: {
        // 初始化存储
        async initializeStore() {
            console.log('Initializing user store...');

            // 如果已初始化且有数据，则不重复初始化
            if (this.isInitialized && this.userInfo) {
                console.log('User store already initialized with data');
                return this.userInfo;
            }

            // 如果未登录，则不初始化
            if (!casdoorService.isLoggedIn()) {
                console.log('User not logged in, skipping initialization');
                return null;
            }

            // 如果最近已获取数据，则不重复获取
            const now = Date.now();
            if (this.lastFetchTime && now - this.lastFetchTime < 5 * 60 * 1000) {
                console.log('Using cached user data (less than 5 minutes old)');
                this.isInitialized = true;
                return this.userInfo;
            }

            return this.refreshUserInfo(false);
        },

        // 刷新用户信息
        async refreshUserInfo(showLoading = true) {
            console.log('Refreshing user info...');

            // 如果显示加载中且当前无数据，则设置加载状态
            if (showLoading && !this.userInfo) {
                this.isLoading = true;
            }

            this.error = null;

            try {
                // 获取用户信息
                const userInfo = await casdoorService.getUserInfo(showLoading);
                console.log('User info received:', userInfo ? 'yes' : 'no');

                this.userInfo = userInfo;
                this.orgData = userInfo.data2;
                this.lastFetchTime = Date.now();
                this.isInitialized = true;
                return userInfo;
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                this.error = error instanceof Error ? error.message : String(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // 清除用户信息
        clearUserInfo() {
            console.log('Clearing user info');
            this.userInfo = null;
            this.orgData = null;
            this.lastFetchTime = null;
            this.isInitialized = false;
        },

        // 检查并确保用户登录状态
        async ensureAuthenticated() {
            if (!casdoorService.isLoggedIn()) {
                return false;
            }

            if (!this.userInfo) {
                try {
                    await this.initializeStore();
                } catch (e) {
                    console.error('Failed to initialize store during auth check:', e);
                    return false;
                }
            }

            return true;
        },

        // Add this method to update user info with new data
        updateUserInfo(userData: any) {
            this.userInfo = userData;
            // Store in localStorage for persistence
            localStorage.setItem('userInfo', JSON.stringify(userData));
            return Promise.resolve();
        }
    }
});