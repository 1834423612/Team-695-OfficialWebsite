import Sdk from 'casdoor-js-sdk';
import Cookies from 'js-cookie';

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

// User info cache duration (1 hour)
const USER_INFO_CACHE_DURATION = 60 * 60 * 1000;

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

// Create a service to handle authentication
class CasdoorService {
    private userInfoCache: UserInfo | null = null;
    private tokenExpiryTimer: number | null = null;
    private refreshing: boolean = false;
    private refreshPromise: Promise<string> | null = null;
    config: any;
    getBasicUserInfoFromToken: any;

    constructor() {
        // Check for backup tokens in localStorage
        this.checkLocalStorageBackup();
        
        // Check token status on initialization
        this.setupTokenRefresh();
        
        // Listen for storage changes to sync across tabs
        window.addEventListener('storage', this.handleStorageChange);
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
                const userInfoUrl = `${config.serverUrl}/api/userinfo`;
                const response = await fetch(userInfoUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    // Remove credentials configuration to avoid preflight requests
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
                    const userInfoUrl = `${config.serverUrl}/api/get-user`;
                    const response = await fetch(userInfoUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                        // 移除credentials配置
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
        const userInfoUrl = `${config.serverUrl}/api/get-account`;
        
        // 修改fetch选项来解决CORS问题
        const fetchOptions: RequestInit = {
            headers: {
                'Authorization': `Bearer ${token}`,
                // 添加额外的头信息以避免触发复杂请求
                'Accept': 'application/json',
            },
            // 移除cache配置，可能引起preflight请求
            // cache: 'no-store',
            // 对所有环境移除credentials配置，这通常会触发预检请求
            // credentials: 'include', 
            // mode: 'cors' 显式设置模式
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
                // 修改fetch选项
                const fetchOptions: RequestInit = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    // 移除credentials
                    mode: 'cors'
                };
                
                await fetch(`${config.serverUrl}/api/logout`, fetchOptions)
                    .catch(e => console.warn('Server logout failed:', e));
            }
        } catch (error) {
            console.error('Error during server logout:', error);
        } finally {
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

// Export a singleton instance
export const casdoorService = new CasdoorService();

// Export the SDK for direct access if needed
export { sdk };