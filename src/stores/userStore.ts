import { defineStore } from 'pinia';
import { casdoorService, isInvalidAuthResponse, AUTH_LOCKS } from '@/services/auth';
import { setAuthLock, releaseAuthLock, isLockActive } from '@/utils/authUtils';
import { logger } from '@/utils/logger';

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
        async initializeStore(skipValidation = false) {
            logger.debug('Initializing user store...' + (skipValidation ? ' (skipping validation)' : ''));

            // 首先检查绝对信任标记，如果存在，强制跳过验证
            if (localStorage.getItem('token_absolute_trust') === 'true' || 
                localStorage.getItem('skip_all_token_validation') === 'true') {
                logger.debug('UserStore: Absolute trust flag detected, forcing skipValidation to true');
                skipValidation = true;
            }
            
            // 检查登录时间，如果在最近10分钟内登录，强制跳过验证
            const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
            if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                logger.debug('UserStore: Recent login detected (<10min), forcing skipValidation to true');
                skipValidation = true;
            }

            // 如果已初始化且有数据，则不重复初始化
            if (this.isInitialized && this.userInfo) {
                logger.debug('UserStore: Already initialized with data');
                
                // 如果设置了跳过验证，直接返回不做验证
                if (skipValidation) {
                    return this.userInfo;
                }
                
                // 10分钟后使用Team API验证令牌状态
                if (authCallbackTime && Date.now() - parseInt(authCallbackTime) >= 10 * 60 * 1000) {
                    logger.info('UserStore: Trust period elapsed, validating against Team API');
                    try {
                        const validationResult = await casdoorService.validateWithTeamApi();
                        if (!validationResult.valid) {
                            logger.warn('UserStore: Team API validation failed, clearing user info');
                            this.clearUserInfo();
                            return null;
                        }
                    } catch (error) {
                        logger.error('UserStore: Team API validation error:', error);
                        // 如果API验证出错，回退到本地验证
                        const isValid = await casdoorService.isTokenValidWithoutRefresh();
                        if (!isValid) {
                            this.clearUserInfo();
                            return null;
                        }
                    }
                } else {
                    // 信任期内使用本地验证
                    const isValid = await casdoorService.isTokenValidWithoutRefresh();
                    if (!isValid) {
                        logger.warn('UserStore: Stored token is invalid, clearing user info');
                        this.clearUserInfo();
                        return null;
                    }
                }
                
                this.setupAutoRefresh();
                return this.userInfo;
            }

            // 如果未登录，则不初始化
            if (!casdoorService.isLoggedIn()) {
                console.log('UserStore: Not logged in, skipping initialization');
                return null;
            }

            // 如果最近已获取数据，则不重复获取
            const now = Date.now();
            if (this.lastFetchTime && now - this.lastFetchTime < 5 * 60 * 1000) {
                console.log('UserStore: Using cached user data (<5min)');
                this.isInitialized = true;
                
                // 如果设置了跳过验证，无需验证直接返回
                if (skipValidation) {
                    this.setupAutoRefresh();
                    return this.userInfo;
                }
                
                // 使用不请求新token的验证方法
                const isValid = await casdoorService.isTokenValidWithoutRefresh();
                if (isValid) {
                    this.setupAutoRefresh();
                    return this.userInfo;
                }
            }

            // 刷新用户信息，传递skipValidation参数
            const result = await this.refreshUserInfo(false, skipValidation);
            if (result) {
                this.setupAutoRefresh();
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
        async refreshUserInfo(showLoading = true, skipValidation = false): Promise<any> {
            console.log('Refreshing user info...' + (skipValidation ? ' (skipping validation)' : ''));
            
            // 检查绝对信任标记，如果存在，强制跳过验证
            if (localStorage.getItem('token_absolute_trust') === 'true' || 
                localStorage.getItem('skip_all_token_validation') === 'true') {
                console.log('UserStore: Absolute trust flag detected, forcing skipValidation to true');
                skipValidation = true;
            }
            
            // 检查登录时间，如果在最近10分钟内登录，强制跳过验证
            const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
            if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                console.log('UserStore: Recent login detected (<10min), forcing skipValidation to true');
                skipValidation = true;
            }
            
            // 如果要跳过验证，直接获取用户信息
            if (skipValidation) {
                console.log('UserStore: Skipping validation for user info refresh');
                
                try {
                    // 直接获取用户信息，不进行令牌验证
                    const userInfo = await casdoorService.getUserInfo(showLoading);
                    this.userInfo = userInfo;
                    this.orgData = userInfo.data2;
                    this.lastFetchTime = Date.now();
                    this.isInitialized = true;
                    return userInfo;
                } catch (error) {
                    console.error('UserStore: Failed to fetch user info with skipped validation:', error);
                    this.error = error instanceof Error ? error.message : String(error);
                    return null;
                }
            }
            
            // 添加防重入机制
            const REFRESH_INFO_LOCK = AUTH_LOCKS.USER_REFRESH;
            
            // 如果锁存在且不超过10秒，则返回缓存的数据
            if (isLockActive(REFRESH_INFO_LOCK, 10000)) {
                console.log('User info refresh already in progress, returning cached info');
                return this.userInfo;
            }
            
            try {
                setAuthLock(REFRESH_INFO_LOCK);
                
                // 如果显示加载中且当前无数据，则设置加载状态
                if (showLoading && !this.userInfo) {
                    this.isLoading = true;
                }

                this.error = null;
                
                // 检查缓存是否足够新，避免频繁刷新
                const minRefreshInterval = 2000; // 最小刷新间隔为2秒
                if (this.lastFetchTime && Date.now() - this.lastFetchTime < minRefreshInterval) {
                    console.log('Using recently fetched user info (less than 2 seconds old)');
                    return this.userInfo;
                }

                try {
                    // 1. 先使用团队API验证token有效性
                    const validationResult = await casdoorService.validateWithTeamApi();
                    if (!validationResult.valid) {
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
                }
            } finally {
                // 清除加载状态和锁
                this.isLoading = false;
                releaseAuthLock(REFRESH_INFO_LOCK);
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