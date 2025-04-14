import { defineStore } from 'pinia';
import { casdoorService, isInvalidAuthResponse, AUTH_LOCKS } from '@/services/auth';
import { setAuthLock, releaseAuthLock, isLockActive } from '@/utils/authUtils';
import { logger } from '@/utils/logger';
import { AvatarMigrationTool } from '@/utils/avatarMigrationTool';

// User info refresh interval (2 hours)
const USER_INFO_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

// Define store state interface
export interface UserStoreState {
    userInfo: any;
    orgData: any;
    isLoading: boolean;
    error: string | null;
    lastFetchTime: number | null;
    isInitialized: boolean;
    refreshTimer: number | null; // Auto-refresh timer
}

export const useUserStore = defineStore('user', {
    state: (): UserStoreState => ({
        userInfo: null,
        orgData: null,
        isLoading: false,
        error: null,
        lastFetchTime: null,
        isInitialized: false,
        refreshTimer: null
    }),

    getters: {
        isLoggedIn(): boolean {
            return casdoorService.isLoggedIn();
        },

        // Get current username, handling multiple scenarios
        userName(): string {
            if (!this.userInfo) return 'User';
            return this.userInfo.displayName ||
                (this.userInfo.name ? this.userInfo.name.split('@')[0] : 'User');
        },

        // Check if user is admin
        isAdmin(): boolean {
            if (!this.userInfo) return false;
            return !!this.userInfo.isAdmin;
        },

        // Return avatar URL or null
        avatarUrl(): string | null {
            return this.userInfo?.avatar || null;
        }
    },

    actions: {
        // Initialize store
        async initializeStore(skipValidation = false) {
            logger.prettyGroup('User Store Initialization', 'primary', skipValidation ? true : false);
            
            try {
                logger.pretty('Validation Strategy', skipValidation ? 'Skip validation' : 'Requires validation', skipValidation ? 'warn' : 'info');

                // First check absolute trust flag, if exists, force skip validation
                if (localStorage.getItem('token_absolute_trust') === 'true' || 
                    localStorage.getItem('skip_all_token_validation') === 'true') {
                    logger.pretty('Trust Flag', 'Absolute trust flag detected, forcing skip validation', 'important');
                    skipValidation = true;
                }
                
                // Check login time, if logged in within last 10 minutes, force skip validation
                const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
                if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                    const minutesAgo = Math.round((Date.now() - parseInt(authCallbackTime)) / (60 * 1000));
                    logger.pretty('Recent Login', `Logged in ${minutesAgo} minutes ago, skipping validation`, 'info');
                    skipValidation = true;
                }

                // If already initialized and has data, avoid re-initializing
                if (this.isInitialized && this.userInfo) {
                    logger.pretty('Status', 'Already initialized with user data', 'success');
                    
                    // If skip validation is set, return without validating
                    if (skipValidation) {
                        logger.pretty('Action', 'Skipping duplicate initialization', 'info');
                        return this.userInfo;
                    }
                    
                    // After 10 minutes, use Team API to validate token
                    if (authCallbackTime && Date.now() - parseInt(authCallbackTime) >= 10 * 60 * 1000) {
                        logger.pretty('Validation', 'Trust period expired, using Team API to validate token', 'info');
                        try {
                            const validationResult = await casdoorService.validateWithTeamApi();
                            if (!validationResult.valid) {
                                logger.pretty('Validation Failed', 'Team API validation failed, clearing user info', 'error');
                                this.clearUserInfo();
                                return null;
                            } else {
                                logger.pretty('Validation Success', 'Team API validation passed', 'success');
                            }
                        } catch (error) {
                            logger.pretty('Validation Error', 'Using local validation as fallback', 'warn');
                            logger.error('Team API validation error:', error);
                            // If API validation fails, fall back to local validation
                            const isValid = await casdoorService.isTokenValidWithoutRefresh();
                            if (!isValid) {
                                logger.pretty('Local Validation', 'Failed, clearing user info', 'error');
                                this.clearUserInfo();
                                return null;
                            } else {
                                logger.pretty('Local Validation', 'Passed', 'success');
                            }
                        }
                    } else {
                        // Within trust period, use local validation
                        const isValid = await casdoorService.isTokenValidWithoutRefresh();
                        if (!isValid) {
                            logger.pretty('Local Validation', 'Stored token invalid, clearing user info', 'error');
                            this.clearUserInfo();
                            return null;
                        } else {
                            logger.pretty('Local Validation', 'Token valid', 'success');
                        }
                    }
                    
                    this.setupAutoRefresh();
                    return this.userInfo;
                }

                // If not logged in, don't initialize
                if (!casdoorService.isLoggedIn()) {
                    logger.pretty('Status', 'User not logged in, skipping initialization', 'warn');
                    return null;
                }

                // If data fetched recently, don't refetch
                const now = Date.now();
                if (this.lastFetchTime && now - this.lastFetchTime < 5 * 60 * 1000) {
                    const minutesAgo = Math.round((now - this.lastFetchTime) / (60 * 1000));
                    logger.pretty('Using Cache', `Using data from ${minutesAgo} minutes ago (<5min)`, 'info');
                    this.isInitialized = true;
                    
                    // If skip validation is set, return without validating
                    if (skipValidation) {
                        this.setupAutoRefresh();
                        return this.userInfo;
                    }
                    
                    // Use validation method that doesn't request new token
                    const isValid = await casdoorService.isTokenValidWithoutRefresh();
                    if (isValid) {
                        logger.pretty('Local Validation', 'Token valid', 'success');
                        this.setupAutoRefresh();
                        return this.userInfo;
                    } else {
                        logger.pretty('Local Validation', 'Token invalid', 'error');
                    }
                }

                // Refresh user info, passing skipValidation parameter
                logger.pretty('Action', 'Refreshing user info', 'info');
                const result = await this.refreshUserInfo(false, skipValidation);
                if (result) {
                    logger.pretty('Result', 'Refresh successful and auto-refresh set up', 'success');
                    this.setupAutoRefresh();
                } else {
                    logger.pretty('Result', 'Refresh failed', 'error');
                }
                
                return result;
            } catch (error) {
                logger.error('Store initialization error:', error);
                throw error;
            } finally {
                // 确保无论成功失败都正确关闭日志组
                logger.safeGroupEnd('User Store Initialization');
            }
        },

        // Set up automatic user info refresh
        setupAutoRefresh() {
            // Clear existing timer
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }

            // Set new timer, refresh user info every 2 hours
            this.refreshTimer = window.setInterval(() => {
                logger.pretty('User Info Auto Refresh', 'Refreshing user info', 'info', true);
                this.refreshUserInfo(false).catch(error => {
                    logger.pretty('User Info Auto Refresh', 'Failed', 'error', true);
                    logger.error('Auto refresh user info failed:', error);
                });
            }, USER_INFO_REFRESH_INTERVAL);
            
            logger.pretty('Timer', `User Info Auto refresh set for every ${USER_INFO_REFRESH_INTERVAL/(60*60*1000)} hours`, 'info');
        },

        // Enhanced user info refresh method
        async refreshUserInfo(showLoading = true, skipValidation = false): Promise<any> {
            logger.prettyGroup('Refresh User Info', 'primary', true);
            
            try {
                logger.info(`Parameters: showLoading=${showLoading}, skipValidation=${skipValidation}`);
                
                // Check absolute trust flag, if exists, force skip validation
                if (localStorage.getItem('token_absolute_trust') === 'true' || 
                    localStorage.getItem('skip_all_token_validation') === 'true') {
                    logger.pretty('Trust Flag', 'Absolute trust flag detected, forcing skip validation', 'important');
                    skipValidation = true;
                }
                
                // Check login time, if within last 10 minutes, force skip validation
                const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
                if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                    const minutesAgo = Math.round((Date.now() - parseInt(authCallbackTime)) / (60 * 1000));
                    logger.pretty('Recent Login', `Logged in ${minutesAgo} minutes ago, skipping validation`, 'info');
                    skipValidation = true;
                }
                
                // If skipping validation, get user info directly
                if (skipValidation) {
                    logger.pretty('Strategy', 'Skipping validation, getting user info directly', 'info');
                    
                    try {
                        // Get user info directly without token validation
                        const userInfo = await casdoorService.getUserInfo(showLoading);
                        this.userInfo = userInfo;
                        this.orgData = userInfo.data2;
                        this.lastFetchTime = Date.now();
                        this.isInitialized = true;
                        
                        // 注册用户ID映射，帮助迁移缓存
                        if (userInfo && userInfo.id) {
                            AvatarMigrationTool.registerUserOnLogin(userInfo);
                        }
                        
                        logger.pretty('Result', 'Successfully retrieved user info', 'success');
                        return userInfo;
                    } catch (error) {
                        logger.pretty('Error', 'Failed to get user info', 'error');
                        logger.error('Get user info detailed error:', error);
                        this.error = error instanceof Error ? error.message : String(error);
                        return null;
                    }
                }
                
                // Add re-entrancy protection
                const REFRESH_INFO_LOCK = AUTH_LOCKS.USER_REFRESH;
                
                // If lock exists and not older than 10 seconds, return cached data
                if (isLockActive(REFRESH_INFO_LOCK, 10000)) {
                    logger.pretty('Re-entrancy', 'User info refresh already in progress, returning cached info', 'warn');
                    return this.userInfo;
                }
                
                try {
                    const lockResult = setAuthLock(REFRESH_INFO_LOCK);
                    logger.info(`Acquired refresh lock: ${lockResult.success ? 'success' : 'failed'}`);
                    
                    // If showing loading and no current data, set loading state
                    if (showLoading && !this.userInfo) {
                        this.isLoading = true;
                        logger.info('Setting loading state: true');
                    }

                    this.error = null;
                    
                    // Check if cache is fresh enough to avoid frequent refreshes
                    const minRefreshInterval = 2000; // Minimum refresh interval of 2 seconds
                    if (this.lastFetchTime && Date.now() - this.lastFetchTime < minRefreshInterval) {
                        logger.pretty('Using Cache', 'Using recently fetched user info (<2sec)', 'info');
                        return this.userInfo;
                    }

                    try {
                        logger.prettyGroup('API Validation Flow', 'secondary', true);
                        
                        try {
                            // 1. First validate token with Casdoor API
                            logger.info('Step 1: Validating token with Casdoor API');
                            const validationResult = await casdoorService.validateWithTeamApi();
                            
                            if (!validationResult.valid) {
                                logger.pretty('Validation Failed', 'Attempting to refresh token', 'warn');
                                
                                // Try to refresh token
                                try {
                                    logger.info('Refreshing token...');
                                    await casdoorService.refreshAccessToken();
                                    
                                    // Validate again
                                    logger.info('Validating with new token');
                                    const refreshedResult = await casdoorService.validateWithTeamApi();
                                    
                                    if (!refreshedResult.valid) {
                                        logger.pretty('Validation Failed', 'Token still invalid after refresh', 'error');
                                        throw new Error('Authentication token remains invalid after refresh');
                                    } else {
                                        logger.pretty('Validation Success', 'Refreshed token is valid', 'success');
                                    }
                                } catch (refreshError) {
                                    logger.pretty('Refresh Failed', 'Unable to refresh authentication token', 'error');
                                    logger.error('Token refresh detailed error:', refreshError);
                                    throw new Error('Authentication token is invalid');
                                }
                            } else {
                                logger.pretty('Validation Success', 'Token valid', 'success');
                            }
                            
                            // 2. After validation, get user info
                            logger.info('Step 2: Getting user info');
                            const userInfo = await casdoorService.getUserInfo(showLoading);
                            
                            // Check for invalid response
                            if (isInvalidAuthResponse(userInfo)) {
                                logger.pretty('Response Error', 'Invalid user info response detected', 'error');
                                
                                // Try to handle invalid auth
                                logger.info('Attempting to handle invalid auth...');
                                if (await casdoorService.handleInvalidAuthResponse()) {
                                    // If successful, try to get user info again
                                    logger.pretty('Handle Success', 'Retrying to get user info', 'info');
                                    
                                    // 确保关闭当前嵌套组
                                    logger.safeGroupEnd('API Validation Flow');
                                    return this.refreshUserInfo(showLoading);
                                } else {
                                    logger.pretty('Handle Failed', 'Authentication session expired', 'error');
                                    throw new Error('Authentication session expired');
                                }
                            }

                            logger.pretty('User Info', 'Retrieved successfully', 'success');
                            
                            this.userInfo = userInfo;
                            this.orgData = userInfo.data2;
                            this.lastFetchTime = Date.now();
                            this.isInitialized = true;
                            
                            // 注册用户ID映射，帮助迁移缓存
                            if (userInfo && userInfo.id) {
                                AvatarMigrationTool.registerUserOnLogin(userInfo);
                            }
                            
                            // 3. Update user's admin status based on validation result
                            if (validationResult.isAdmin && !userInfo.isAdmin) {
                                logger.pretty('Update Permissions', 'Updating admin status based on token validation result', 'important');
                                userInfo.isAdmin = true;
                                this.userInfo.isAdmin = true;
                            }
                            
                            logger.pretty('Result', 'User info refresh successful', 'success');
                            return userInfo;
                        } finally {
                            // 确保关闭验证流程组
                            logger.safeGroupEnd('API Validation Flow');
                        }
                    } catch (error) {
                        logger.pretty('Error', 'Failed to get user info', 'error');
                        logger.error('Detailed error:', error);
                        this.error = error instanceof Error ? error.message : String(error);
                        
                        // If auth error, clear user info
                        if (error instanceof Error && 
                            (error.message.includes('Authentication') || 
                             error.message.includes('Unauthorized') || 
                             error.message.includes('token'))) {
                            logger.pretty('Auth Error', 'Clearing user info', 'error');
                            this.clearUserInfo();
                        }
                        
                        throw error;
                    }
                } finally {
                    // Clear loading state and lock
                    this.isLoading = false;
                    releaseAuthLock(REFRESH_INFO_LOCK);
                }
            } catch (error) {
                logger.error('User info refresh error:', error);
                throw error;
            } finally {
                // 确保主组正确关闭
                logger.safeGroupEnd('Refresh User Info');
            }
        },

        // Clear user info
        clearUserInfo() {
            logger.prettyGroup('Clear User Info', 'warn', true);
            
            try {
                // Clear refresh timer
                if (this.refreshTimer) {
                    clearInterval(this.refreshTimer);
                    this.refreshTimer = null;
                    logger.info('Cleared user info auto-refresh timer');
                }
                
                this.userInfo = null;
                this.orgData = null;
                this.lastFetchTime = null;
                this.isInitialized = false;
                
                logger.pretty('Status', 'User info cleared', 'info');
            } finally {
                // 确保清除组正确关闭
                logger.safeGroupEnd('Clear User Info');
            }
        },

        // Check and ensure user is authenticated
        async ensureAuthenticated() {
            if (!casdoorService.isLoggedIn()) {
                logger.pretty('Auth Check', 'User not logged in', 'warn');
                return false;
            }

            if (!this.userInfo) {
                logger.pretty('Auth Check', 'User logged in but missing info, initializing store', 'info');
                try {
                    await this.initializeStore();
                    return !!this.userInfo;
                } catch (e) {
                    logger.pretty('Auth Check', 'Failed to initialize store', 'error');
                    logger.error('Initialization error:', e);
                    return false;
                }
            }

            logger.pretty('Auth Check', 'User logged in and has valid info', 'success');
            return true;
        },

        // Update user info with new data
        updateUserInfo(userData: any) {
            logger.prettyGroup('Update User Info', 'info', true);
            this.userInfo = userData;
            
            // 注册用户ID映射，帮助迁移缓存
            if (userData && userData.id) {
                AvatarMigrationTool.registerUserOnLogin(userData);
            }
            
            // Store in localStorage for persistence
            localStorage.setItem('userInfo', JSON.stringify(userData));
            logger.pretty('Status', 'User info updated', 'success');
            logger.groupEnd();
            return Promise.resolve();
        }
    }
});