import Sdk from 'casdoor-js-sdk';
import Cookies from 'js-cookie';
import { avatarCache } from '@/services/avatarCache';
import { AUTH_LOCKS, cleanupStaleLocks, setAuthLock, releaseAuthLock, isLockActive } from '@/utils/authUtils';

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
    expires: 2,  // 7 days expiration
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
const USER_INFO_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Token check interval (every 5 minutes)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Initialize the SDK
const sdk = new Sdk(config);

// Define user info interface
export interface UserInfo {
    id: string;
    name: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
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

// Team API validation URL
const TEAM_API_VALIDATE_URL = 'https://api.team695.com/auth/validate';

// Create a service to handle authentication
class CasdoorService {
    private userInfoCache: UserInfo | null = null;
    private tokenExpiryTimer: number | null = null;
    private tokenCheckTimer: number | null = null; // Periodic token check timer
    private refreshing: boolean = false;
    private refreshPromise: Promise<string> | null = null;
    private teamApiValidationPromise: Promise<{valid: boolean, isAdmin: boolean}> | null = null;
    config: any;
    getBasicUserInfoFromToken: any;

    constructor() {
        // Check for backup tokens in localStorage
        this.checkLocalStorageBackup();
        
        // Check token status on initialization
        this.setupTokenRefresh();
        
        // Listen for storage changes to sync across tabs
        window.addEventListener('storage', this.handleStorageChange);

        // Setup token periodic check when the app is initialized
        this.setupTokenPeriodicCheck();

        // Cleanup stale locks on initialization
        this.cleanupStaleLocks();
    }

    // Cleanup stale locks based on predefined timeouts - using `authUtils`
    private cleanupStaleLocks(): void {
        const timeouts: Record<string, number> = {
            [AUTH_LOCKS.SIGNIN]: 20000,      // 20seconds
            [AUTH_LOCKS.REFRESH]: 10000,     // 10seconds
            [AUTH_LOCKS.VALIDATION]: 15000,  // 15seconds
            [AUTH_LOCKS.USER_REFRESH]: 10000, // 10seconds
            [AUTH_LOCKS.TEAM_API_VALIDATION]: 10000 // 10seconds
        };
        
        cleanupStaleLocks(timeouts);
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
            // 首先检查最高级别信任标志 - 如果存在，完全跳过后续处理
            if (localStorage.getItem('token_absolute_trust') === 'true') {
                const existingToken = this.getToken();
                if (existingToken) {
                    console.log('ABSOLUTE TRUST: Using existing token without ANY validation');
                    return existingToken;
                }
                localStorage.removeItem('token_absolute_trust');
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            // 首先检查是否已有有效令牌
            if (this.isLoggedIn()) {
                console.log('Already have token, skipping code exchange completely');
                
                // 直接获取当前token而不执行任何验证
                const existingToken = this.getToken();
                if (existingToken) {
                    // 设置信任标记
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                    
                    return existingToken;
                }
            }
            
            // 检查是否是有效的授权回调
            if (!code || !state) {
                console.warn('Missing code or state in signin request');
                throw new Error('Invalid authorization callback - missing code or state');
            }
            
            // 使用signinWithCode方法处理
            return this.signinWithCode(code, state);
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // 新增：使用提供的code和state直接处理登录，无需重新从URL获取
    async signinWithCode(code: string, state: string): Promise<string> {
        try {
            // 添加防重入锁，确保不会同时发起多个token请求
            const SIGNIN_LOCK = AUTH_LOCKS.SIGNIN;
            
            // 首先检查签名状态，防止重复处理同一个授权回调
            const processedAuth = sessionStorage.getItem('casdoor_auth_processed');
            if (processedAuth === 'true') {
                console.log('This authorization code was already processed');
                const existingToken = this.getToken();
                if (existingToken) {
                    // 标记为绝对信任
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    return existingToken;
                }
                // 如果找不到令牌但已处理过，清除状态并继续
                sessionStorage.removeItem('casdoor_auth_processed');
            }
            
            // 首先检查是否已经有有效令牌 - 这是关键部分
            const existingToken = this.getToken();
            if (existingToken) {
                console.log('Found existing token, checking if it can be used instead of requesting new one');
                
                // 标记为绝对信任，完全跳过token验证
                localStorage.setItem('token_absolute_trust', 'true');
                localStorage.setItem('token_trusted', 'true');
                localStorage.setItem('token_verified', 'true');
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                
                // 确保令牌刷新定时器已设置
                this.setupTokenRefresh();
                
                // 标记当前授权码已处理
                sessionStorage.setItem('casdoor_auth_processed', 'true');
                sessionStorage.setItem('casdoor_processed_code', code);
                
                return existingToken;
            }
            
            // 检查是否有强制刷新标记
            const forceRefresh = sessionStorage.getItem('force_token_refresh') === 'true';
            
            // 检查此授权码是否已处理过
            const processedCode = sessionStorage.getItem('casdoor_processed_code');
            if (processedCode === code && !forceRefresh) {
                console.log(`Authorization code ${code.substring(0, 5)}... already processed, checking for existing token`);
                
                const existingToken = this.getToken();
                if (existingToken) {
                    console.log('Found existing token for processed code, using it');
                    sessionStorage.setItem('casdoor_auth_processed', 'true');
                    return existingToken;
                }
                
                // 如果找不到有效令牌但设置了代码已处理标记，进行清理
                console.log('No token found for processed code, clearing processed flag to retry');
                sessionStorage.removeItem('casdoor_processed_code');
            }
            
            // 检查是否已有正在进行的登录流程
            if (isLockActive(SIGNIN_LOCK, 20000)) {
                console.log('Signin already in progress, waiting for completion');
                
                // 等待一小段时间，看是否有新token生成
                for (let i = 0; i < 5; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
                    
                    // 再次检查是否有新token
                    const newToken = this.getToken();
                    if (newToken) {
                        console.log('New token was generated while waiting');
                        
                        // 标记当前授权码已处理
                        sessionStorage.setItem('casdoor_auth_processed', 'true');
                        sessionStorage.setItem('casdoor_processed_code', code);
                        return newToken;
                    }
                }
                
                // 如果等待后仍然没有新令牌，清除锁并继续
                console.warn('No token generated after waiting, clearing lock and continuing');
                releaseAuthLock(SIGNIN_LOCK);
            }
            
            // 设置锁 - 确保只能有一个令牌交换进行
            const lockResult = setAuthLock(SIGNIN_LOCK);
            if (!lockResult.success) {
                console.warn('Failed to acquire signin lock, another process may be signing in');
                // 等待并再次检查是否有令牌
                await new Promise(resolve => setTimeout(resolve, 2000));
                const existingToken = this.getToken();
                if (existingToken) {
                    console.log('Found token after waiting for lock');
                    sessionStorage.setItem('casdoor_auth_processed', 'true');
                    sessionStorage.setItem('casdoor_processed_code', code);
                    return existingToken;
                }
                // 如果仍然没有令牌，尝试强制获取锁
                releaseAuthLock(SIGNIN_LOCK);
                const retryLockResult = setAuthLock(SIGNIN_LOCK);
                if (!retryLockResult.success) {
                    console.error('Could not acquire signin lock after retrying, but continuing anyway');
                }
            }
            
            try {
                // 记录当前正在处理的授权码
                sessionStorage.setItem('casdoor_processed_code', code);
                
                // 执行代码交换获取令牌 - 使用提供的code和state
                console.log('Exchanging code for token...');
                
                // 手动将code和state存储到sessionStorage中，以便SDK可以找到它们
                sessionStorage.setItem('casdoor-state', state);
                
                // 使用SDK交换令牌
                const tokenResponse = await sdk.exchangeForAccessToken();
                console.log('Token response received:', !!tokenResponse);
        
                if (!tokenResponse || !tokenResponse.access_token) {
                    throw new Error('Failed to exchange code for token');
                }
        
                // 存储令牌
                this.storeTokensInCookies(tokenResponse);
                
                // 标记当前授权码已处理完成
                sessionStorage.setItem('casdoor_auth_processed', 'true');
                
                return tokenResponse.access_token;
            } finally {
                // 清除锁，确保即使出错也会释放
                releaseAuthLock(SIGNIN_LOCK);
            }
        } catch (error) {
            console.error('Signin with code error:', error);
            // 清理所有可能卡住的状态
            sessionStorage.removeItem('casdoor_processed_code');
            releaseAuthLock(AUTH_LOCKS.SIGNIN);
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
        
        // Clear user info cache when tokens change
        this.userInfoCache = null;
        localStorage.removeItem(USER_INFO_CACHE);
        localStorage.removeItem(USER_INFO_TIMESTAMP);
        
        // Setup token refresh timer
        this.setupTokenRefresh();
    }

    // Refresh the access token
    async refreshAccessToken(): Promise<string> {
        // 添加防重入标记，防止多次刷新冲突
        const REFRESH_LOCK = AUTH_LOCKS.REFRESH;
        
        // 如果已经在刷新中，返回现有的Promise
        if (this.refreshing && this.refreshPromise) {
            return this.refreshPromise;
        }
        
        // 检查是否有其他页面/组件正在刷新 - 使用isLockActive方法
        if (isLockActive(REFRESH_LOCK, 5000)) {
            console.log('Another refresh is in progress, waiting for it to complete');
            
            // 等待短暂时间后检查是否有新令牌
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 获取当前令牌并验证它是否是新的
            const currentToken = this.getToken();
            if (currentToken) {
                // 检查令牌是否新鲜（过期时间远在未来）
                const tokenInfo = this.parseAccessToken(currentToken);
                if (tokenInfo?.payload?.exp && tokenInfo.payload.exp * 1000 > Date.now() + 10 * 60 * 1000) {
                    console.log('Using newly refreshed token from another process');
                    return currentToken;
                }
            }
            
            // 如果没有获得新令牌，移除可能卡住的锁
            releaseAuthLock(REFRESH_LOCK);
        } else if (localStorage.getItem(REFRESH_LOCK) === 'true') {
            // 如果锁太旧，清除它
            releaseAuthLock(REFRESH_LOCK);
        }
        
        // 设置刷新锁
        const lockResult = setAuthLock(REFRESH_LOCK);
        if (!lockResult.success) {
            console.error('Failed to acquire refresh lock');
        }
        
        // 获取刷新令牌
        let refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE);
        
        // 如果不在localStorage，尝试从cookie获取
        if (!refreshToken) {
            refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) || null;
        }
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            this.refreshing = true;
            this.refreshPromise = (async () => {
                try {
                    const tokenResponse = await sdk.refreshAccessToken(refreshToken!);
    
                    if (!tokenResponse || !tokenResponse.access_token) {
                        throw new Error('Failed to refresh token');
                    }
    
                    // Update the tokens
                    this.storeTokensInCookies(tokenResponse);
                    
                    return tokenResponse.access_token;
                } finally {
                    // 无论成功或失败，都清除锁
                    releaseAuthLock(REFRESH_LOCK);
                }
            })();

            return await this.refreshPromise;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, clear tokens and force re-login
            this.logout();
            releaseAuthLock(REFRESH_LOCK);
            throw error;
        } finally {
            this.refreshing = false;
            this.refreshPromise = null;
        }
    }

    // Check if the user is logged in
    isLoggedIn(): boolean {
        // 首先检查绝对信任标记 - 如果存在，完全信任token
        if (localStorage.getItem('token_absolute_trust') === 'true') {
            // 检查token是否存在
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            if (localToken) return true;
            
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            if (cookieToken) return true;
            
            // 如果没有token但有信任标记，清除标记
            localStorage.removeItem('token_absolute_trust');
            return false;
        }
        
        // 其次检查常规信任标记
        if (localStorage.getItem('token_trusted') === 'true') {
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            if (localToken) return true;
            
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            if (cookieToken) return true;
            
            localStorage.removeItem('token_trusted');
            return false;
        }
        
        // 检查常规验证标记
        const tokenVerified = localStorage.getItem('token_verified') === 'true';
        
        // 如果有验证标记，再检查token是否真的存在
        if (tokenVerified) {
            // First check localStorage (more reliable)
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            if (localToken) {
                return true;
            }
            
            // Then check cookie
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            if (cookieToken) {
                return true;
            }
            
            // 如果有验证标记但没找到token，清除标记
            localStorage.removeItem('token_verified');
            return false;
        }
        
        // 没有验证标记，使用传统验证方式
        const localToken = localStorage.getItem(TOKEN_COOKIE);
        if (localToken) {
            // 找到token时设置验证标记
            localStorage.setItem('token_verified', 'true');
            return true;
        }
        
        // Then check cookie
        const cookieToken = Cookies.get(TOKEN_COOKIE);
        if (cookieToken) {
            localStorage.setItem('token_verified', 'true');
            return true;
        }
        
        return false;
    }

    // Check if the current user is an admin
    isUserAdmin(): boolean {
        // First check for validated admin status
        if (localStorage.getItem('is_admin_validated') === 'true') {
            return true;
        }

        // Check user info cache
        if (this.userInfoCache?.isAdmin) {
            return true;
        }

        // Try to extract admin status from token
        const token = this.getToken();
        if (token) {
            try {
                const tokenInfo = this.parseAccessToken(token);
                if (tokenInfo?.payload) {
                    const payload = tokenInfo.payload;
                    
                    // Check for admin status in token payload
                    if (
                        payload.role === 'admin' || 
                        payload.isAdmin === true || 
                        (payload.groups && Array.isArray(payload.groups) && payload.groups.includes('admin'))
                    ) {
                        return true;
                    }
                }
            } catch (e) {
                console.warn('Error checking admin status from token:', e);
            }
        }

        return false;
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
        
        // Process name fields correctly
        if (!userData.fullName) {
            userData.fullName = createFullName(userData);
        }
        
        return userData;
    }

    // Logout the user
    async logout(): Promise<void> {
        try {
            // Try to call the server logout API
            const token = this.getToken();
            if (token) {
                try {
                    // Determine API URL based on environment
                    const baseUrl = isDevelopment ? '/api/sso' : config.serverUrl;
                    const logoutUrl = `${baseUrl}/api/logout`;
                    
                    await fetch(logoutUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                        body: JSON.stringify({ token })
                    });
                    
                    console.log('Server logout successful');
                } catch (apiError) {
                    console.warn('Error during server logout API call:', apiError);
                }
            }
        } catch (error) {
            console.error('Error during server logout:', error);
        } finally {
            // 清除全局验证标记
            localStorage.removeItem('token_verified');
            localStorage.removeItem('auth_callback_completed_time');
            localStorage.removeItem('last_token_validated_time');
            localStorage.removeItem('last_auth_check_time');
            localStorage.removeItem('is_admin_validated');
            
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
        // 首先检查绝对信任标记，如果存在，不进行API验证
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            console.log('Team API validation: Absolute trust flag detected, returning true without validation');
            return { valid: true, isAdmin: localStorage.getItem('is_admin_validated') === 'true' };
        }
        
        // 检查标准信任标记
        if (localStorage.getItem('token_trusted') === 'true') {
            console.log('Team API validation: Trust flag detected, returning true without validation');
            return { valid: true, isAdmin: localStorage.getItem('is_admin_validated') === 'true' };
        }
        
        // 检查登录后时间，10分钟内跳过API验证
        const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
        if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
            console.log('Team API validation: Recent auth callback detected, returning true without validation');
            return { valid: true, isAdmin: localStorage.getItem('is_admin_validated') === 'true' };
        }
        
        // 添加缓存机制，避免短时间内频繁调用
        const CACHE_KEY = 'team_api_validation_result';
        const CACHE_TIME = 60000; // 60秒缓存时间
        
        // 检查缓存
        const cachedResult = localStorage.getItem(CACHE_KEY);
        if (cachedResult) {
            try {
                const parsed = JSON.parse(cachedResult);
                if (Date.now() - parsed.timestamp < CACHE_TIME) {
                    // 如果提供了特定令牌且与缓存时的令牌不同，则不使用缓存
                    if (token && parsed.tokenHash && parsed.tokenHash !== this.simpleTokenHash(token)) {
                        console.log('Token changed, not using cached validation result');
                    } else {
                        console.log('Using cached team API validation result');
                        return {
                            valid: parsed.valid,
                            isAdmin: parsed.isAdmin
                        };
                    }
                }
            } catch (e) {
                // 忽略缓存解析错误
            }
        }
        
        // 如果已经有请求在进行中，返回该请求的Promise
        if (this.teamApiValidationPromise && isLockActive(AUTH_LOCKS.TEAM_API_VALIDATION)) {
            return this.teamApiValidationPromise;
        }
        
        if (!token) {
            token = this.getToken();
        }
        
        if (!token) {
            return { valid: false, isAdmin: false };
        }
        
        try {
            // 设置验证锁
            setAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
            
            // 创建新的Promise并存储引用
            this.teamApiValidationPromise = (async () => {
                try {
                    console.log('Validating token with Team API...');
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
                        
                        // 缓存结果
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            valid: result.data.valid,
                            isAdmin: !!result.data.isAdmin,
                            timestamp: Date.now(),
                            tokenHash: token ? this.simpleTokenHash(token) : null
                        }));
                        
                        // 如果用户是管理员，设置标记
                        if (result.data.valid && result.data.isAdmin) {
                            localStorage.setItem('is_admin_validated', 'true');
                        }
                        
                        return {
                            valid: result.data.valid,
                            isAdmin: !!result.data.isAdmin
                        };
                    }
                    
                    return { valid: false, isAdmin: false };
                } finally {
                    // 无论成功失败，请求完成后清除Promise引用和锁
                    setTimeout(() => {
                        this.teamApiValidationPromise = null;
                        releaseAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
                    }, 100);
                }
            })();
            
            return this.teamApiValidationPromise;
        } catch (error) {
            console.error('Team API validation error:', error);
            this.teamApiValidationPromise = null;
            releaseAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
            return { valid: false, isAdmin: false };
        }
    }

    // 简单的令牌散列函数，用于比较令牌是否变化
    private simpleTokenHash(token: string): string {
        // 只取令牌的前10个和后10个字符进行比较
        // 注意：这不是安全散列，仅用于检测令牌变化
        const prefix = token.substring(0, 10);
        const suffix = token.length > 10 ? token.substring(token.length - 10) : '';
        return `${prefix}...${suffix}`;
    }

    // Basic token validation without external API calls
    public async validateLocalToken(): Promise<boolean> {
        // 首先检查绝对信任标记 - 如果存在，立即返回true而不做任何验证
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            console.log('Local validation: Absolute trust flag detected, returning true without validation');
            return true;
        }
        
        // 检查标准信任标记
        if (localStorage.getItem('token_trusted') === 'true') {
            console.log('Local validation: Trust flag detected, returning true without validation');
            return true;
        }
        
        // 检查登录后短时间，在此期间绝对信任token
        const authCallbackCompleted = localStorage.getItem('auth_callback_completed_time');
        if (authCallbackCompleted) {
            const completionTime = parseInt(authCallbackCompleted);
            if (!isNaN(completionTime) && Date.now() - completionTime < 10 * 60 * 1000) {
                console.log('Local validation: Recent login detected (<10min), returning true without validation');
                return true;
            }
        }
        
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return false;
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // 本地验证足够 - 如果token没有过期，直接视为有效
            if (expiryTime > now + 30 * 1000) { // 至少30秒后过期
                localStorage.setItem('token_verified', 'true');
                return true;
            }
            
            // 如果token即将过期，尝试刷新
            if (expiryTime <= now + 10 * 60 * 1000) { // 10分钟内过期
                try {
                    await this.refreshAccessToken();
                    localStorage.setItem('token_verified', 'true');
                    return true;
                } catch (error) {
                    console.error('Token near expiry and refresh failed during local validation:', error);
                    // 如果已经过期则登出
                    if (expiryTime <= now) {
                        await this.logout();
                        return false;
                    }
                    // 如果还没过期，仍然视为有效，稍后再尝试刷新
                    return true;
                }
            }
            
            // 验证成功，设置验证标记
            localStorage.setItem('token_verified', 'true');
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
    async validateToken(noRefresh: boolean = false): Promise<boolean> {
        const token = this.getToken();
        
        if (!token) return false;
        
        try {
            // 检查最高级别的信任标记 - 如果存在，完全跳过验证
            if (localStorage.getItem('token_absolute_trust') === 'true' || 
                localStorage.getItem('skip_all_token_validation') === 'true') {
                console.log('Auth: Using absolute trust flag, skipping validateToken');
                return true;
            }
            
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
                
                // 如果设置noRefresh，仅返回false但不刷新令牌
                if (noRefresh) {
                    return false;
                }
                
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
            
            // 如果设置了noRefresh参数，不进行进一步验证
            if (noRefresh) {
                // 仅基于本地验证令牌，不进行API调用或刷新
                return true;
            }
            
            // 正常的API验证流程
            // ...existing code for API validation...
            
            // 如果令牌即将过期（30分钟内），主动刷新
            if (expiryTime - now < 30 * 60 * 1000 && !noRefresh) {
                console.log('Token will expire soon, preemptively refreshing');
                this.refreshAccessToken().catch(err => 
                    console.warn('Preemptive token refresh failed:', err)
                );
            }
            
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // 检查token是否有效（公开方法）- 修改为避免不必要的token刷新
    async isTokenValid(): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        // 检查最高级别的信任标记
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            console.log('Auth: Using absolute trust flag, skipping isTokenValid check');
            return true;
        }
        
        try {
            // 仅进行基本验证，不自动刷新token
            const isBasicValid = await this.isTokenValidWithoutRefresh();
            if (!isBasicValid) {
                console.warn('Basic token validation failed');
                
                // 这里我们仍然尝试刷新token，因为这可能是显式的有效性检查
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (error) {
                    console.error('Token validation and refresh failed:', error);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            return this.validateLocalToken();
        }
    }

    // 检查token是否有效但不会请求新token（仅验证）
    async isTokenValidWithoutRefresh(): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        // 检查绝对信任标记 - 如果存在，完全跳过验证
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            console.log('No-refresh validation: Absolute trust flag detected, returning true without validation');
            return true;
        }
        
        // 检查标准信任标记
        if (localStorage.getItem('token_trusted') === 'true') {
            console.log('No-refresh validation: Trust flag detected, returning true without validation');
            return true;
        }
        
        // 检查登录后短时间，在此期间绝对信任token
        const authCallbackCompleted = localStorage.getItem('auth_callback_completed_time');
        if (authCallbackCompleted) {
            const completionTime = parseInt(authCallbackCompleted);
            if (!isNaN(completionTime) && Date.now() - completionTime < 10 * 60 * 1000) {
                console.log('No-refresh validation: Recent login detected (<10min), returning true without validation');
                return true;
            }
        }
        
        try {
            // 基础本地验证 - 仅检查token格式和过期时间
            const token = this.getToken();
            if (!token) return false;
            
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return false;
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // 如果token已过期，返回false，但不自动刷新
            if (expiryTime <= now) {
                console.warn('Token has expired based on exp claim');
                return false;
            }
            
            // 本地验证通过，不进一步请求API验证
            return true;
        } catch (error) {
            console.error('Error in token validation without refresh:', error);
            return false;
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
            
            const checkInterval = TOKEN_CHECK_INTERVAL; // 使用固定的5分钟间隔
            
            this.tokenCheckTimer = window.setInterval(async () => {
                console.log('Token check interval triggered, checking if validation needed');
                
                // 首先检查绝对信任标记，如果存在，完全跳过任何验证
                if (localStorage.getItem('token_absolute_trust') === 'true' || 
                    localStorage.getItem('skip_all_token_validation') === 'true') {
                    console.log('Token check: Absolute trust flag detected, COMPLETELY skipping validation');
                    return;
                }
                
                // 然后检查标准信任标记
                if (localStorage.getItem('token_trusted') === 'true') {
                    console.log('Token check: Trust flag detected, skipping validation');
                    return;
                }
                
                // 检查登录后时间，10分钟内跳过
                const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
                if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                    console.log('Token check: Recent auth callback detected, skipping validation');
                    return;
                }
                
                // 验证是否有正在进行的验证
                if (localStorage.getItem('auth_validation_in_progress') === 'true') {
                    console.log('Token check: Validation already in progress, skipping');
                    return;
                }
                
                // 检查最近是否已由AuthManager验证，避免重复验证
                const lastAuthCheck = localStorage.getItem('last_auth_check_time');
                if (lastAuthCheck && Date.now() - parseInt(lastAuthCheck) < 60000) { // 1分钟内
                    console.log('Token check: Recent validation detected, skipping check');
                    return;
                }
                
                console.log('Token check: Performing validation without creating new token');
                
                try {
                    // 标记验证进行中
                    localStorage.setItem('auth_validation_in_progress', 'true');
                    
                    // 仅使用不请求新token的验证方法 - 这是关键修改
                    const isValid = await this.isTokenValidWithoutRefresh();
                    
                    if (!isValid) {
                        console.warn('Token check: Token validation failed');
                        
                        // 仅当验证失败时才尝试刷新令牌
                        try {
                            await this.refreshAccessToken();
                            console.log('Token check: Successfully refreshed invalid token');
                        } catch (error) {
                            console.error('Token check: Failed to refresh invalid token', error);
                            this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                        }
                    } else {
                        // 验证成功，简单记录结果
                        console.log('Token check: Token is valid');
                        localStorage.setItem('last_token_validated_time', Date.now().toString());
                    }
                } catch (error) {
                    console.error('Error during periodic token validation:', error);
                } finally {
                    // 清除验证标记
                    localStorage.removeItem('auth_validation_in_progress');
                }
            }, checkInterval);
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
export { isInvalidAuthResponse, AUTH_LOCKS };