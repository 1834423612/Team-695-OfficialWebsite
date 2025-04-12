import Sdk from 'casdoor-js-sdk';
import Cookies from 'js-cookie';
import { avatarCache } from '@/services/avatarCache';

// Define the Casdoor configuration
const config = {
    serverUrl: 'https://sso.team695.com',
    clientId: '300932808273326bac0c',
    appName: '695_website',
    organizationName: 'Team695',
    redirectPath: '/callback',
    // Use sessionStorage for PKCE state
    storage: sessionStorage
};

// Detect environment
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const isVercel = window.location.hostname.includes('vercel.app');

// Cookie options for different environments
const COOKIE_OPTIONS = {
    // In Vercel preview environments, we need to allow cross-domain cookies
    secure: window.location.protocol === 'https:',
    // In Vercel preview environments use 'none', otherwise decide based on development environment
    sameSite: isVercel ? 'none' as const : (isDevelopment ? 'lax' as const : 'strict' as const),
    expires: 7,  // 7 days expiration
    path: '/',   // Available site-wide
    // In Vercel preview environments, we need to set domain
    ...(isVercel ? {} : {})
};

// Always use localStorage as backup, especially in Vercel preview environments
const useLocalStorageBackup = true;

// Token storage names
const TOKEN_COOKIE = 'casdoor-token';
const REFRESH_TOKEN_COOKIE = 'casdoor-refresh-token';
const SESSION_ID_COOKIE = 'casdoor_session_id';
const USER_INFO_CACHE = 'casdoor-user-info-cache';
const USER_INFO_TIMESTAMP = 'casdoor-user-info-timestamp';

// User info cache duration (24 hours)
const USER_INFO_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

// Token check interval (every 5 minutes)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5分钟

// Initialize the SDK
const sdk = new Sdk(config);

// Define user info interface
export interface UserInfo {
    id: string;
    name: string;
    displayName?: string;
    firstName?: string;  // Add firstName field
    lastName?: string;   // Add lastName field
    fullName?: string;   // Add fullName field
    avatar?: string;
    email?: string;
    phone?: string;
    address?: string;
    affiliation?: string;
    tag?: string;
    score?: number;
    ranking?: number;
    isOnline?: boolean;
    isAdmin?: boolean;
    isForbidden?: boolean;
    signupApplication?: string;
    createdTime?: string;
    updatedTime?: string;
    type?: string;
    password?: string;
    passwordSalt?: string;
    github?: string;
    google?: string;
    qq?: string;
    wechat?: string;
    facebook?: string;
    dingtalk?: string;
    weibo?: string;
    gitee?: string;
    linkedin?: string;
    wecom?: string;
    lark?: string;
    gitlab?: string;
    adfs?: string;
    baidu?: string;
    alipay?: string;
    casdoor?: string;
    infoflow?: string;
    apple?: string;
    azuread?: string;
    slack?: string;
    steam?: string;
    bilibili?: string;
    okta?: string;
    douyin?: string;
    line?: string;
    amazon?: string;
    auth0?: string;
    battlenet?: string;
    bitbucket?: string;
    box?: string;
    cloudfoundry?: string;
    dailymotion?: string;
    deezer?: string;
    digitalocean?: string;
    discord?: string;
    dropbox?: string;
    eveonline?: string;
    fitbit?: string;
    gitea?: string;
    heroku?: string;
    influxcloud?: string;
    instagram?: string;
    intercom?: string;
    kakao?: string;
    lastfm?: string;
    mailru?: string;
    meetup?: string;
    microsoftonline?: string;
    naver?: string;
    nextcloud?: string;
    onedrive?: string;
    oura?: string;
    patreon?: string;
    paypal?: string;
    salesforce?: string;
    shopify?: string;
    soundcloud?: string;
    spotify?: string;
    strava?: string;
    stripe?: string;
    tiktok?: string;
    tumblr?: string;
    twitch?: string;
    twitter?: string;
    typetalk?: string;
    uber?: string;
    vk?: string;
    wepay?: string;
    xero?: string;
    yahoo?: string;
    yammer?: string;
    yandex?: string;
    zoom?: string;
    custom?: string;
    webauthnCredentials?: any[];
    recoveryCodesEnabled?: boolean;
    totpSecret?: string;
    properties?: Record<string, string>;
    roles?: string[];
    permissions?: string[];
    groups?: string[];
    owner?: string;
    data2?: {
        logo?: string;
        [key: string]: any;
    };
}

// Token response interface
interface TokenResponse {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
}

// 添加团队API验证端点
const TEAM_API_VALIDATE_URL = 'https://api.team695.com/auth/validate';

// Create a service to handle authentication
class CasdoorService {
    private userInfoCache: UserInfo | null = null;
    private tokenExpiryTimer: number | null = null;
    private tokenCheckTimer: number | null = null; // 定期检查令牌有效性的定时器
    private refreshing: boolean = false;
    private refreshPromise: Promise<string> | null = null;
    private lastValidationTime: number = 0; // 上次验证令牌的时间
    config: any;
    getBasicUserInfoFromToken: any;

    constructor() {
        // Check for backup tokens in localStorage
        this.checkLocalStorageBackup();
        
        // Check token status on initialization
        this.setupTokenRefresh();
        
        // Listen for storage changes to sync across tabs
        window.addEventListener('storage', this.handleStorageChange);

        // 初始化时启动令牌定期检查
        this.setupTokenPeriodicCheck();
    }
    
    // Handle storage changes (for cross-tab synchronization)
    private handleStorageChange = (event: StorageEvent) => {
        if (event.key === TOKEN_COOKIE || event.key === REFRESH_TOKEN_COOKIE || event.key === USER_INFO_CACHE) {
            // User info or tokens were updated in another tab
            if (event.key === USER_INFO_CACHE && event.newValue) {
                try {
                    this.userInfoCache = JSON.parse(event.newValue);
                } catch (e) {
                    this.userInfoCache = null;
                }
            } else if (event.key === TOKEN_COOKIE) {
                // Token was changed in another tab, reset refresh timer
                this.setupTokenRefresh();
            }
        }
    }

    // Setup token auto-refresh
    private setupTokenRefresh(): void {
        // Clear any existing timer
        if (this.tokenExpiryTimer !== null) {
            window.clearTimeout(this.tokenExpiryTimer);
            this.tokenExpiryTimer = null;
        }

        // Get current token
        const token = this.getToken();
        if (!token) return;

        try {
            // Parse token to get expiration time
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return;

            // Calculate expiration time (in milliseconds)
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            const timeToExpiry = expiryTime - now;

            // If token is already expired, refresh immediately
            if (timeToExpiry <= 0) {
                this.refreshAccessToken().catch(err => {
                    console.error('Failed to refresh expired token:', err);
                });
                return;
            }

            // Set to refresh 5 minutes before expiration
            const refreshTime = Math.max(timeToExpiry - 5 * 60 * 1000, 0);
            console.log(`Token refresh scheduled in ${Math.floor(refreshTime / 60000)} minutes`);
            
            this.tokenExpiryTimer = window.setTimeout(() => {
                this.refreshAccessToken().catch(err => {
                    console.error('Failed to refresh token:', err);
                });
            }, refreshTime);

        } catch (error) {
            console.error('Error setting up token refresh:', error);
        }
    }

    // Check for backup tokens in localStorage
    private checkLocalStorageBackup(): void {
        try {
            if (!useLocalStorageBackup) {
                console.log('LocalStorage backup is disabled.');
                return;
            }
    
            const accessToken = localStorage.getItem(TOKEN_COOKIE);
            if (accessToken) {
                console.log('Found backup token in localStorage, attempting to restore');
                // Try to restore token from localStorage to cookie
                Cookies.set(TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
                
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE);
                if (refreshToken) {
                    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
                }
                
                // Check if cookie was set successfully
                if (!Cookies.get(TOKEN_COOKIE)) {
                    console.warn('Failed to restore token to cookie, will continue using localStorage');
                } else {
                    console.log('Successfully restored token from localStorage to cookie');
                }
            }
            
            // Check for cached user info
            const cachedUserInfo = localStorage.getItem(USER_INFO_CACHE);
            const cachedTimestamp = localStorage.getItem(USER_INFO_TIMESTAMP);
            
            if (cachedUserInfo && cachedTimestamp) {
                const timestamp = parseInt(cachedTimestamp, 10);
                if (!isNaN(timestamp) && Date.now() - timestamp < USER_INFO_CACHE_DURATION) {
                    try {
                        this.userInfoCache = JSON.parse(cachedUserInfo);
                    } catch (e) {
                        console.warn('Failed to parse cached user info:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking localStorage backup:', error);
        }
    }

    // Start the PKCE authorization flow
    startLogin(provider?: string): void {
        // Clear any potentially conflicting state
        sessionStorage.removeItem('casdoor-state');
        sessionStorage.removeItem('casdoor-code-verifier');
        sessionStorage.removeItem('casdoor-code-challenge');
        
        // Additional parameters for the authorization URL
        const additionalParams: Record<string, string> = {};

        // If a specific provider is requested (e.g., Google)
        if (provider) {
            additionalParams.provider = provider;
        }

        // Redirect to the authorization URL
        sdk.signin_redirect(additionalParams);
    }

    // Get the sign-in URL (for compatibility with existing code)
    getSigninUrl(provider?: string): string {
        // This is just for compatibility, we'll use startLogin instead
        return sdk.getSigninUrl() + (provider ? `&provider=${provider}` : '');
    }

    // Handle the callback from Casdoor
    async signin(): Promise<string> {
        try {
            // Check if we have a valid access token in localStorage or cookie
            const existingToken = this.getToken();
            if (existingToken) {
                const tokenInfo = this.parseAccessToken(existingToken);
                if (tokenInfo && tokenInfo.payload && tokenInfo.payload.exp) {
                    const expiryTime = tokenInfo.payload.exp * 1000; // Transform to milliseconds
                    const now = Date.now();
                    
                    // If token is valid and not about to expire, return it
                    if (expiryTime > now + 30 * 60 * 1000) {
                        this.setupTokenRefresh();
                        return existingToken;
                    } else if (expiryTime > now) {
                        // Token is about to expire, proactively refresh it
                        try {
                            return await this.refreshAccessToken();
                        } catch (e) {
                            // If refresh fails but token is still valid, return it
                            return existingToken;
                        }
                    }
                }
            }
    
            // If no valid token, get a new one
            const tokenResponse = await sdk.exchangeForAccessToken();
            console.log('Token response received:', !!tokenResponse);
    
            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to exchange code for token');
            }
    
            // Store the tokens
            this.storeTokensInCookies(tokenResponse);
    
            return tokenResponse.access_token;
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // Helper method to store tokens in cookies and localStorage
    private storeTokensInCookies(tokenResponse: TokenResponse): void {
        console.log('Storing tokens...');
        
        // Store tokens in localStorage first (more reliable)
        if (tokenResponse.access_token) {
            localStorage.setItem(TOKEN_COOKIE, tokenResponse.access_token);
        }
        
        if (tokenResponse.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token);
        }
        
        // Then try to store in cookies
        try {
            if (tokenResponse.access_token) {
                Cookies.set(TOKEN_COOKIE, tokenResponse.access_token, COOKIE_OPTIONS);
            }
            
            if (tokenResponse.refresh_token) {
                Cookies.set(REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token, COOKIE_OPTIONS);
            }
            
            // Check if cookies were set successfully
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            console.log('Cookie token set success:', !!cookieToken);
        } catch (error) {
            console.warn('Error setting cookies, but tokens are stored in localStorage:', error);
        }
        
        // Clear user info cache when tokens change
        this.userInfoCache = null;
        localStorage.removeItem(USER_INFO_CACHE);
        localStorage.removeItem(USER_INFO_TIMESTAMP);
        
        // Setup token refresh timer
        this.setupTokenRefresh();
    }

    // Manually set tokens (useful for testing or when tokens are received from other sources)
    setTokens(accessToken: string, refreshToken?: string): void {
        // First store in localStorage
        localStorage.setItem(TOKEN_COOKIE, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
        }
        
        // Then try to store in cookies
        try {
            Cookies.set(TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
            if (refreshToken) {
                Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
            }
        } catch (error) {
            console.warn('Error setting cookies, but tokens are stored in localStorage:', error);
        }
        
        // Setup token refresh timer
        this.setupTokenRefresh();
    }

    // Refresh the access token
    async refreshAccessToken(): Promise<string> {
        // If already refreshing, return the existing promise
        if (this.refreshing && this.refreshPromise) {
            return this.refreshPromise;
        }
        
        // Try to get refresh token from localStorage first (more reliable)
        let refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE);
        
        // If not in localStorage, try from cookie
        if (!refreshToken) {
            refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) || null;
        }
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            this.refreshing = true;
            this.refreshPromise = (async () => {
                const tokenResponse = await sdk.refreshAccessToken(refreshToken!);

                if (!tokenResponse || !tokenResponse.access_token) {
                    throw new Error('Failed to refresh token');
                }

                // Update the tokens
                this.storeTokensInCookies(tokenResponse);

                return tokenResponse.access_token;
            })();

            return await this.refreshPromise;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, clear tokens and force re-login
            this.logout();
            throw error;
        } finally {
            this.refreshing = false;
            this.refreshPromise = null;
        }
    }

    // Check if the user is logged in
    isLoggedIn(): boolean {
        // First check localStorage (more reliable)
        const localToken = localStorage.getItem(TOKEN_COOKIE);
        if (localToken) {
            return true;
        }
        
        // Then check cookie
        const cookieToken = Cookies.get(TOKEN_COOKIE);
        return !!cookieToken;
    }

    // Get the token
    getToken(): string | null {
        // First get from localStorage (more reliable)
        const localToken = localStorage.getItem(TOKEN_COOKIE);
        if (localToken) {
            return localToken;
        }
        
        // Then try from cookie
        return Cookies.get(TOKEN_COOKIE) || null;
    }

    // Parse JWT token to get user info
    parseAccessToken(token: string): { header: any, payload: any } | null {
        try {
            // First try to use SDK
            return sdk.parseAccessToken(token);
        } catch (e) {
            console.error('Error parsing JWT with SDK:', e);
            
            // If SDK parsing fails, try manual parsing
            try {
                const parts = token.split('.');
                if (parts.length !== 3) {
                    throw new Error('Invalid JWT format');
                }
                
                // Decode JWT parts
                const decode = (str: string): any => {
                    try {
                        // Convert Base64URL format to Base64
                        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
                        // Decode and parse JSON
                        return JSON.parse(atob(padded));
                    } catch (err) {
                        console.warn('JWT part decoding failed:', err);
                        return {};
                    }
                };
                
                return {
                    header: decode(parts[0]),
                    payload: decode(parts[1])
                };
            } catch (manualError) {
                console.error('Manual JWT parsing failed:', manualError);
                return null;
            }
        }
    }

    // Get user information with enhanced multi-endpoint strategy
    async getUserInfo(forceRefresh = false): Promise<UserInfo> {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }

        // Check for valid cached user info
        if (!forceRefresh) {
            // Check memory cache first
            if (this.userInfoCache) {
                return this.userInfoCache;
            }
            
            // Then check localStorage cache
            const cachedUserInfo = localStorage.getItem(USER_INFO_CACHE);
            const cachedTimestamp = localStorage.getItem(USER_INFO_TIMESTAMP);
            
            if (cachedUserInfo && cachedTimestamp) {
                const timestamp = parseInt(cachedTimestamp, 10);
                if (!isNaN(timestamp) && Date.now() - timestamp < USER_INFO_CACHE_DURATION) {
                    try {
                        const userInfo = JSON.parse(cachedUserInfo);
                        this.userInfoCache = userInfo;
                        return userInfo;
                    } catch (e) {
                        console.warn('Failed to parse cached user info:', e);
                    }
                }
            }
        }

        // Extract basic info from token first
        const tokenInfo = this.parseAccessToken(token);
        let basicUserInfo: UserInfo | null = null;
        
        if (tokenInfo?.payload) {
            const payload = tokenInfo.payload;
            
            // Check admin status
            const isAdmin = payload.role === 'admin' || 
                          payload.isAdmin === true || 
                          (payload.groups && Array.isArray(payload.groups) && payload.groups.includes('admin'));
            
            // Create a basic user info object with proper name handling
            const fullName = createFullName(payload);
            
            basicUserInfo = {
                id: payload.sub || '',
                name: payload.name || '',
                email: payload.email || '',
                owner: payload.owner || '',
                displayName: payload.displayName || '',
                firstName: payload.firstName || '',
                lastName: payload.lastName || '',
                fullName: fullName,
                avatar: payload.avatar || null,
                isAdmin: isAdmin
            };
        }

        // Try to get detailed user info from Casdoor API
        try {
            // Try primary endpoint first
            const userInfo = await this.fetchUserInfoFromAPI(token);
            
            // 如果用户有头像，缓存头像
            if (userInfo.id && userInfo.avatar) {
                avatarCache.cacheAvatar(userInfo.id, userInfo.avatar).catch(e => {
                    console.warn('Failed to cache avatar:', e);
                });
                
                // 尝试提前获取头像，同时传递用户信息以便生成更好的默认头像
                avatarCache.getAvatar(userInfo.id, userInfo.avatar, {
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    displayName: userInfo.displayName,
                    name: userInfo.name
                }).catch(e => {
                    console.warn('Failed to preload avatar:', e);
                });
            }
            
            // Cache the user info
            this.userInfoCache = userInfo;
            localStorage.setItem(USER_INFO_CACHE, JSON.stringify(userInfo));
            localStorage.setItem(USER_INFO_TIMESTAMP, Date.now().toString());
            
            return userInfo;
        } catch (primaryError) {
            console.error('Primary user info endpoint failed:', primaryError);
            
            // Try alternate endpoints if primary fails
            try {
                // Try second endpoint
                // Determine API URL based on environment
                const baseUrl = isDevelopment ? '/api/sso' : config.serverUrl;
                const userInfoUrl = `${baseUrl}/api/userinfo`;
                const response = await fetch(userInfoUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    mode: 'cors'
                });

                if (!response.ok) {
                    throw new Error(`Failed to get user info from secondary endpoint: ${response.status}`);
                }

                const userData = await response.json();
                
                // Process name fields if needed
                if (!userData.fullName) {
                    userData.fullName = createFullName(userData);
                }
                
                // Cache the user info
                this.userInfoCache = userData;
                localStorage.setItem(USER_INFO_CACHE, JSON.stringify(userData));
                localStorage.setItem(USER_INFO_TIMESTAMP, Date.now().toString());
                
                return userData;
            } catch (secondaryError) {
                console.error('Secondary user info endpoint failed:', secondaryError);
                
                // Try third endpoint
                try {
                    // Determine API URL based on environment
                    const baseUrl = isDevelopment ? '/api/sso' : config.serverUrl;
                    const userInfoUrl = `${baseUrl}/api/get-user`;
                    const response = await fetch(userInfoUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                        mode: 'cors'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get user info from tertiary endpoint: ${response.status}`);
                    }

                    const userInfo: UserInfo = await response.json();
                    
                    // Process name fields if needed
                    if (!userInfo.fullName) {
                        userInfo.fullName = createFullName(userInfo);
                    }
                    
                    // Cache the user info
                    this.userInfoCache = userInfo;
                    localStorage.setItem(USER_INFO_CACHE, JSON.stringify(userInfo));
                    localStorage.setItem(USER_INFO_TIMESTAMP, Date.now().toString());
                    
                    return userInfo;
                } catch (tertiaryError) {
                    console.error('All user info endpoints failed:', tertiaryError);
                    
                    // If we have basic info from token, return that as fallback
                    if (basicUserInfo) {
                        return basicUserInfo;
                    }
                    
                    // If all else fails, throw the original error
                    throw primaryError;
                }
            }
        }
    }
    
    // Helper method to fetch user info from primary API endpoint
    private async fetchUserInfoFromAPI(token: string): Promise<UserInfo> {
        // Determine API URL based on environment
        const baseUrl = isDevelopment ? '/api/sso' : config.serverUrl;
        const userInfoUrl = `${baseUrl}/api/get-account`;
        
        const fetchOptions: RequestInit = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            mode: 'cors'
        };
        
        const response = await fetch(userInfoUrl, fetchOptions);

        if (!response.ok) {
            throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        
        // Extract user data from the API response format
        let userData: UserInfo;
        
        if (responseData.data) {
            // Handle the nested structure from get-account endpoint
            userData = responseData.data;
            
            // Also check for data2 which might contain organization info
            if (responseData.data2) {
                userData.data2 = responseData.data2;
            }
        } else if (responseData.data && responseData.data.payload) {
            userData = responseData.data.payload;
        } else {
            // Handle direct user object from other endpoints
            userData = responseData;
        }
        
        // Process name fields correctly based on priority
        // If firstName and lastName exist, use them to create a full name
        if (userData.firstName && userData.lastName) {
            userData.fullName = `${userData.firstName} ${userData.lastName}`;
        } else if (userData.displayName) {
            // Otherwise use displayName if available
            userData.fullName = userData.displayName;
        } else {
            // Fall back to username
            userData.fullName = userData.name;
        }
        
        return userData;
    }

    // Check if the current user is an admin
    isUserAdmin(): boolean {
        try {
            const token = this.getToken();
            if (!token) return false;
            
            // Decode the JWT token to get user claims
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload) return false;
            
            const payload = tokenInfo.payload;
            
            // Check for admin role in the token
            if (payload.role === 'admin' || payload.isAdmin === true) {
                return true;
            }
            
            // Check if user is in admin group
            if (payload.groups && Array.isArray(payload.groups)) {
                return payload.groups.includes('admin');
            }
            
            // Check if user has admin permissions
            if (payload.permissions && Array.isArray(payload.permissions)) {
                return payload.permissions.some((p: string | string[]) => 
                    p.includes('admin') || p.includes('Admin') || p === '*'
                );
            }
            
            // If we have cached user info, check that too
            if (this.userInfoCache) {
                if (this.userInfoCache.isAdmin) return true;
                
                if (this.userInfoCache.roles && Array.isArray(this.userInfoCache.roles)) {
                    return this.userInfoCache.roles.some(r => 
                        r.includes('admin') || r.includes('Admin')
                    );
                }
                
                if (this.userInfoCache.groups && Array.isArray(this.userInfoCache.groups)) {
                    return this.userInfoCache.groups.includes('admin');
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Enhanced logout method
    async logout(): Promise<void> {
        try {
            // Call Casdoor's /api/logout API
            const token = this.getToken();
            if (token) {
                // Determine API URL based on environment
                const baseUrl = isDevelopment ? '/api/sso' : config.serverUrl;
                const fetchOptions: RequestInit = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'cors'
                };
                
                await fetch(`${baseUrl}/api/logout`, fetchOptions)
                    .catch(e => console.warn('Server logout failed:', e));
            }
        } catch (error) {
            console.error('Error during server logout:', error);
        } finally {
            // 清除定期检查定时器
            if (this.tokenCheckTimer !== null) {
                window.clearInterval(this.tokenCheckTimer);
                this.tokenCheckTimer = null;
            }

            // Clear any token refresh timer
            if (this.tokenExpiryTimer !== null) {
                window.clearTimeout(this.tokenExpiryTimer);
                this.tokenExpiryTimer = null;
            }
            
            // Clear user info cache
            this.userInfoCache = null;
    
            // Clear tokens from localStorage
            localStorage.removeItem(TOKEN_COOKIE);
            localStorage.removeItem(REFRESH_TOKEN_COOKIE);
            localStorage.removeItem(USER_INFO_CACHE);
            localStorage.removeItem(USER_INFO_TIMESTAMP);
            
            // Try to clear cookies
            try {
                Cookies.remove(TOKEN_COOKIE, { path: '/' });
                Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
                Cookies.remove(SESSION_ID_COOKIE, { path: '/' });
            } catch (error) {
                console.warn('Error removing cookies:', error);
            }
    
            // Clear PKCE state
            sessionStorage.clear();
            
            // Signal that logout is complete
            return Promise.resolve();
        }
    }
    
    // Handle token response directly (for cases where we get tokens from another source)
    handleTokenResponse(tokenResponse: TokenResponse): void {
        if (!tokenResponse || !tokenResponse.access_token) {
            throw new Error('Invalid token response');
        }
        
        this.storeTokensInCookies(tokenResponse);
    }

    // 使用团队API验证令牌
    async validateWithTeamApi(token: string | null = null): Promise<{valid: boolean, isAdmin: boolean}> {
        if (!token) {
            token = this.getToken();
        }
        
        if (!token) {
            return { valid: false, isAdmin: false };
        }
        
        try {
            const response = await fetch(TEAM_API_VALIDATE_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`Team API validation failed with status: ${response.status}`);
                return { valid: false, isAdmin: false };
            }
            
            const result = await response.json();
            
            if (result.success && result.data && typeof result.data.valid === 'boolean') {
                console.log('Team API validation result:', result.data);
                return {
                    valid: result.data.valid,
                    isAdmin: !!result.data.isAdmin
                };
            }
            
            return { valid: false, isAdmin: false };
        } catch (error) {
            console.error('Team API validation error:', error);
            return { valid: false, isAdmin: false };
        }
    }

    // Basic token validation without external API calls
    private async validateLocalToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return false;
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // If token is expired, try to refresh it
            if (expiryTime <= now) {
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (error) {
                    console.error('Token expired and refresh failed during local validation:', error);
                    await this.logout();
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error in local token validation:', error);
            return false;
        }
    }

    // 触发认证无效事件的辅助方法
    private triggerInvalidAuthEvent(message: string): void {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:invalid', { 
                detail: { message }
            }));
        }
    }

    // 综合验证方法，结合本地验证和团队API验证
    async validateToken(): Promise<boolean> {
        const token = this.getToken();
        
        if (!token) return false;

        try {
            // 首先验证令牌格式和过期时间
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) {
                console.warn('Token lacks expiration information');
                return false;
            }
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // 如果令牌明显已过期，无需调用API
            if (expiryTime <= now) {
                console.warn('Token has expired based on exp claim');
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (error) {
                    console.error('Failed to refresh expired token:', error);
                    await this.logout();
                    this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                    return false;
                }
            }

            // 使用团队API验证令牌
            const teamApiResult = await this.validateWithTeamApi(token);
            if (!teamApiResult.valid) {
                console.warn('Team API indicates token is invalid');
                
                // 尝试刷新token
                try {
                    await this.refreshAccessToken();
                    
                    // 再次验证刷新后的令牌
                    const refreshedToken = this.getToken();
                    if (!refreshedToken) return false;
                    
                    const refreshedResult = await this.validateWithTeamApi(refreshedToken);
                    if (!refreshedResult.valid) {
                        // 如果刷新后的令牌仍然无效，则登出
                        console.error('Refreshed token is still invalid according to Team API');
                        await this.logout();
                        this.triggerInvalidAuthEvent('Your session could not be restored. Please login again.');
                        return false;
                    }
                    
                    // 刷新成功
                    this.lastValidationTime = Date.now();
                    return true;
                } catch (error) {
                    console.error('Failed to refresh invalid token:', error);
                    await this.logout();
                    this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                    return false;
                }
            }
            
            // 如果令牌即将过期（30分钟内），主动刷新
            if (expiryTime - now < 30 * 60 * 1000) {
                console.log('Token will expire soon, preemptively refreshing');
                this.refreshAccessToken().catch(err => 
                    console.warn('Preemptive token refresh failed:', err)
                );
            }

            // 更新上次验证时间
            this.lastValidationTime = Date.now();
            return true;
            
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }
    
    // 检查token是否有效（公开方法，首选使用团队API验证）
    async isTokenValid(): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        try {
            // Try team API first
            const token = this.getToken();
            if (!token) return false;
            
            const teamApiResult = await this.validateWithTeamApi(token);
            if (!teamApiResult.valid) {
                console.warn('Team API indicates token is invalid');
                
                // 尝试刷新token
                try {
                    await this.refreshAccessToken();
                    
                    // 再次验证刷新后的令牌
                    const refreshedToken = this.getToken();
                    if (!refreshedToken) return false;
                    
                    const refreshedResult = await this.validateWithTeamApi(refreshedToken);
                    return refreshedResult.valid;
                } catch (error) {
                    console.error('Token validation and refresh failed:', error);
                    return false;
                }
            }
            
            // Parse token expiration time as additional check
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return false;
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // If token is expired despite team API saying it's valid, refresh it
            if (expiryTime <= now) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    console.error('Token expired and refresh failed:', error);
                    await this.logout();
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error validating token with team API:', error);
            
            // Fall back to basic validation
            return this.validateLocalToken();
        }
    }

    // 处理API响应中的认证错误
    checkApiResponse(response: any): boolean {
        // 检查是否为标准错误响应
        if (response && response.success === true && response.data) {
            const data = response.data;
            
            // 检查特定的错误消息格式
            if (data.status === 'error' && data.msg && 
                (data.msg.includes('token') || 
                 data.msg.includes('Access') || 
                 data.msg.includes('exist'))) {
                
                console.warn('API returned auth error:', data.msg);
                
                // 触发无效认证处理
                setTimeout(() => {
                    this.handleInvalidAuthResponse().catch(console.error);
                }, 0);
                
                return false;
            }
        }
        
        return true;
    }
    
    // Handle invalid auth responses globally
    async handleInvalidAuthResponse(): Promise<boolean> {
        try {
            // Try to refresh the token
            await this.refreshAccessToken();
            return true;
        } catch (error) {
            console.error('Failed to refresh token after invalid response:', error);
            // If refresh fails, log out and clear everything
            await this.logout();
            // 通知用户需要重新登录
            this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
            return false;
        }
    }

    // 设置定期检查令牌有效性的定时器
    private setupTokenPeriodicCheck(): void {
        // 清除已有定时器
        if (this.tokenCheckTimer !== null) {
            window.clearInterval(this.tokenCheckTimer);
            this.tokenCheckTimer = null;
        }

        // 如果用户已登录，设置定期检查
        if (this.isLoggedIn()) {
            const checkInterval = Math.min(TOKEN_CHECK_INTERVAL, 5 * 60 * 1000); // 最多5分钟检查一次
            
            this.tokenCheckTimer = window.setInterval(async () => {
                // 验证令牌是否有效
                try {
                    const now = Date.now();
                    // 只有在距离上次验证超过一定时间后才执行验证，避免频繁验证
                    if (now - this.lastValidationTime > checkInterval / 2) {
                        this.lastValidationTime = now;
                        console.log('Performing periodic token validation check');
                        
                        // 直接使用团队API验证
                        const teamApiResult = await this.validateWithTeamApi();
                        if (!teamApiResult.valid) {
                            console.warn('Token validation failed during periodic check');
                            
                            try {
                                // 尝试刷新令牌
                                await this.refreshAccessToken();
                                
                                // 再次验证刷新后的令牌
                                const refreshedResult = await this.validateWithTeamApi();
                                if (!refreshedResult.valid) {
                                    // 如果刷新后的令牌仍然无效，则登出
                                    console.error('Refreshed token is still invalid');
                                    await this.logout();
                                    this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                                }
                            } catch (error) {
                                console.error('Failed to refresh token during periodic check:', error);
                                // 如果刷新失败，触发无效认证事件
                                this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error during periodic token validation:', error);
                }
            }, checkInterval);
            
            // 立即进行一次初始验证
            setTimeout(() => {
                this.validateToken().catch(console.error);
            }, 1000);
        }
    }
}

// Helper function to create a full name from user data
function createFullName(userData: any): string {
    // First priority: use firstName + lastName if both exist
    if (userData.firstName && userData.lastName) {
        return `${userData.firstName} ${userData.lastName}`;
    }
    
    // Second priority: use displayName
    if (userData.displayName) {
        return userData.displayName;
    }
    
    // Last resort: use name (username)
    return userData.name || '';
}

// Helper function to detect invalid auth responses
function isInvalidAuthResponse(response: any): boolean {
    // 检测空响应
    if (!response) return true;
    
    // 检查显式错误响应格式
    if (response.success === true && response.data && response.data.status === 'error') {
        const errorMsg = response.data.msg;
        if (errorMsg && (
            errorMsg.includes('token') || 
            errorMsg.includes('Access') || 
            errorMsg.includes('exist')
        )) {
            return true;
        }
    }
    
    // 检查标准的无效响应特征
    if (response.status === 'error' && 
        response.msg && (
            response.msg.includes('token') || 
            response.msg.includes('Access') || 
            response.msg.includes('exist')
        )) {
        return true;
    }
    
    // 典型的无效响应特征
    if (response.status === 'ok' && 
        (!response.sub || response.sub === '') && 
        (!response.name || response.name === '') && 
        (response.data === true || response.data === null) && 
        response.data2 === null) {
        return true;
    }
    
    return false;
}

// Export a singleton instance
export const casdoorService = new CasdoorService();

// Export the SDK for direct access if needed
export { sdk };

// Export the helper function to detect invalid auth responses
export { isInvalidAuthResponse };