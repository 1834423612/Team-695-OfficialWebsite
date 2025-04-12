import { defineStore } from 'pinia';
import { casdoorService, isInvalidAuthResponse } from '@/services/auth';

// 用户信息自动刷新间隔 (2小时)
const USER_INFO_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

// 定义存储状态接口
export interface UserStoreState {
    userInfo: any;
    orgData: any;
    isLoading: boolean;
    error: string | null;
    lastFetchTime: number | null;
    isInitialized: boolean;
    refreshTimer: number | null; // 添加定期刷新计时器
}

export const useUserStore = defineStore('user', {
    state: (): UserStoreState => ({
        userInfo: null,
        orgData: null,
        isLoading: false,
        error: null,
        lastFetchTime: null,
        isInitialized: false,
        refreshTimer: null // 添加定期刷新计时器
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
                
                // 验证token是否有效
                if (await casdoorService.isTokenValid()) {
                    this.setupAutoRefresh(); // 设置自动刷新
                    return this.userInfo;
                } else {
                    console.warn('Stored token is invalid, clearing user info');
                    this.clearUserInfo();
                    return null;
                }
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
                
                // 即使缓存有效，也验证一下token是否有效
                if (await casdoorService.isTokenValid()) {
                    this.setupAutoRefresh(); // 设置自动刷新
                    return this.userInfo;
                }
            }

            const result = await this.refreshUserInfo(false);
            if (result) {
                this.setupAutoRefresh(); // 设置自动刷新
            }
            return result;
        },

        // 设置自动刷新用户信息
        setupAutoRefresh() {
            // 清除现有定时器
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }

            // 设置新的定时器，每2小时刷新一次用户信息
            this.refreshTimer = window.setInterval(() => {
                console.log('Auto refreshing user info');
                this.refreshUserInfo(false).catch(error => {
                    console.error('Auto refresh user info failed:', error);
                });
            }, USER_INFO_REFRESH_INTERVAL);
        },

        // 增强的刷新用户信息方法
        async refreshUserInfo(showLoading = true): Promise<any> {
            console.log('Refreshing user info...');

            // 如果显示加载中且当前无数据，则设置加载状态
            if (showLoading && !this.userInfo) {
                this.isLoading = true;
            }

            this.error = null;

            try {
                // 1. 先使用团队API验证token有效性
                const validationResult = await casdoorService.validateWithTeamApi();
                if (!validationResult.valid) {
                    console.warn('Token validation failed before fetching user info');
                    
                    // 尝试刷新令牌
                    try {
                        await casdoorService.refreshAccessToken();
                        
                        // 再次验证
                        const refreshedResult = await casdoorService.validateWithTeamApi();
                        if (!refreshedResult.valid) {
                            throw new Error('Authentication token remains invalid after refresh');
                        }
                    } catch (refreshError) {
                        throw new Error('Authentication token is invalid');
                    }
                }
                
                // 2. 验证通过后再获取用户信息
                const userInfo = await casdoorService.getUserInfo(showLoading);
                console.log('User info received:', userInfo ? 'yes' : 'no');
                
                // 检测是否为无效响应
                if (isInvalidAuthResponse(userInfo)) {
                    console.warn('Invalid user info response detected');
                    // 尝试处理无效认证
                    if (await casdoorService.handleInvalidAuthResponse()) {
                        // 如果处理成功，重新获取用户信息
                        return this.refreshUserInfo(showLoading);
                    } else {
                        throw new Error('Authentication session expired');
                    }
                }

                this.userInfo = userInfo;
                this.orgData = userInfo.data2;
                this.lastFetchTime = Date.now();
                this.isInitialized = true;
                
                // 3. 根据验证结果更新用户的管理员状态
                if (validationResult.isAdmin && !userInfo.isAdmin) {
                    console.log('Updating user admin status based on token validation');
                    userInfo.isAdmin = true;
                    this.userInfo.isAdmin = true;
                }
                
                return userInfo;
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                this.error = error instanceof Error ? error.message : String(error);
                
                // 如果是认证错误，清除用户信息
                if (error instanceof Error && 
                    (error.message.includes('Authentication') || 
                     error.message.includes('Unauthorized') || 
                     error.message.includes('token'))) {
                    this.clearUserInfo();
                }
                
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // 清除用户信息
        clearUserInfo() {
            console.log('Clearing user info');
            
            // 清除刷新定时器
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
            
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