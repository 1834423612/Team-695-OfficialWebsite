import Sdk from 'casdoor-js-sdk';
import Cookies from 'js-cookie';
import { avatarCache } from '@/services/avatarCache';
import { AUTH_LOCKS, cleanupStaleLocks, setAuthLock, releaseAuthLock, isLockActive } from '@/utils/authUtils';
import { logger } from '@/utils/logger';

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
    expires: 2,  // 2 days expiration
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
// const TEAM_API_VALIDATE_URL = 'https://api.team695.com/auth/validate';

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

    private normalizeAndCacheUserInfo(userInfo: any): UserInfo {
        const normalized = normalizeUserInfo(userInfo);
        this.userInfoCache = normalized;

        localStorage.setItem(USER_INFO_CACHE, JSON.stringify(normalized));
        localStorage.setItem(USER_INFO_TIMESTAMP, Date.now().toString());
        localStorage.setItem('userInfo', JSON.stringify(normalized));

        return normalized;
    }

    getCachedUserInfo(allowExpired = false): UserInfo | null {
        if (this.userInfoCache) {
            return this.userInfoCache;
        }

        const cachedUserInfo = localStorage.getItem(USER_INFO_CACHE) || localStorage.getItem('userInfo');
        const cachedTimestamp = localStorage.getItem(USER_INFO_TIMESTAMP);

        if (!cachedUserInfo) {
            return null;
        }

        if (!allowExpired) {
            const timestamp = cachedTimestamp ? parseInt(cachedTimestamp, 10) : NaN;
            if (isNaN(timestamp) || Date.now() - timestamp >= USER_INFO_CACHE_DURATION) {
                return null;
            }
        }

        try {
            const parsedUserInfo = JSON.parse(cachedUserInfo);
            return this.normalizeAndCacheUserInfo(parsedUserInfo);
        } catch (error) {
            console.warn('Failed to parse cached user info:', error);
            return null;
        }
    }

    setCachedUserInfo(userInfo: any): UserInfo {
        return this.normalizeAndCacheUserInfo(userInfo);
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
            this.getCachedUserInfo();
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
            // Get the authorization code and state from the browser URL
            // Security check: trust flags are valid only when multiple conditions are satisfied, reducing single-point failure risk
            const absoluteTrustEnabled = localStorage.getItem('token_absolute_trust') === 'true';
            const trustExpireAtStr = localStorage.getItem('trust_flags_expire_at');
            const tokenValidated = localStorage.getItem('token_verified') === 'true';
            const authCallbackStr = localStorage.getItem('auth_callback_completed_time');
            
            // Validate the trust flag with multiple checks
            let trustValid = false;
            
            // 1. Validate expiration time: the trust flag must have an explicit expiration time and must not be expired
            if (trustExpireAtStr) {
                const trustExpireAt = parseInt(trustExpireAtStr, 10);
                if (!isNaN(trustExpireAt) && Date.now() < trustExpireAt) {
                    // 2. Validate consistency with the authentication callback time
                    if (authCallbackStr) {
                        const authCallbackTime = parseInt(authCallbackStr, 10);
                        // The trust flag must be created shortly after the authentication callback to prevent forgery
                        if (!isNaN(authCallbackTime) && 
                            trustExpireAt - authCallbackTime < 15 * 60 * 1000 && // The trust window cannot exceed 15 minutes from the authentication time
                            Date.now() - authCallbackTime < 10 * 60 * 1000) {    // Authentication must have happened within 10 minutes
                            trustValid = true;
                        }
                    }
                } else {
                    // The trust flag has expired, so clear it immediately
                    localStorage.removeItem('token_absolute_trust');
                    localStorage.removeItem('trust_flags_expire_at');
                }
            }
            
            // Allow absolute trust only when multiple security conditions are met
            if (absoluteTrustEnabled && trustValid && tokenValidated) {
                const existingToken = this.getToken();
                if (existingToken) {
                    // Add a restriction: even when the trust flag is valid, still verify the token format and basic validity
                    const tokenInfo = this.parseAccessToken(existingToken);
                    if (tokenInfo?.payload?.exp && tokenInfo.payload.exp * 1000 > Date.now()) {
                        logger.info('Secure trust validation passed, using existing token');
                        return existingToken;
                    } else {
                        logger.warn('Token appears invalid despite trust flag, removing trust');
                        localStorage.removeItem('token_absolute_trust');
                    }
                } else {
                    localStorage.removeItem('token_absolute_trust');
                }
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            // First check whether a valid token already exists
            if (this.isLoggedIn()) {
                console.log('Already have token, skipping code exchange completely');
                
                // Get the current token directly without performing validation
                const existingToken = this.getToken();
                if (existingToken) {
                    // Set the trust flag
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                    
                    return existingToken;
                }
            }
            
            // Check whether this is a valid authorization callback
            if (!code || !state) {
                console.warn('Missing code or state in signin request');
                throw new Error('Invalid authorization callback - missing code or state');
            }
            
            // Handle it with the signinWithCode method
            return this.signinWithCode(code, state);
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // New: handle login directly with the provided code and state without reading the URL again
    async signinWithCode(code: string, state: string): Promise<string> {
        try {
            // Add a re-entry lock to ensure multiple token requests are not started at the same time
            const SIGNIN_LOCK = AUTH_LOCKS.SIGNIN;
            
            // First check the sign-in state to avoid handling the same authorization callback twice
            const processedAuth = sessionStorage.getItem('casdoor_auth_processed');
            if (processedAuth === 'true') {
                console.log('This authorization code was already processed');
                const existingToken = this.getToken();
                if (existingToken) {
                    // Mark as absolute trust
                    localStorage.setItem('token_absolute_trust', 'true');
                    localStorage.setItem('token_trusted', 'true');
                    localStorage.setItem('token_verified', 'true');
                    return existingToken;
                }
                // If no token is found but the callback was already handled, clear the state and continue
                sessionStorage.removeItem('casdoor_auth_processed');
            }
            
            // First check whether a valid token already exists; this is the key part
            const existingToken = this.getToken();
            if (existingToken) {
                console.log('Found existing token, checking if it can be used instead of requesting new one');
                
                // Mark as absolute trust and skip token validation entirely
                localStorage.setItem('token_absolute_trust', 'true');
                localStorage.setItem('token_trusted', 'true');
                localStorage.setItem('token_verified', 'true');
                localStorage.setItem('auth_callback_completed_time', Date.now().toString());
                
                // Ensure the token refresh timer is set
                this.setupTokenRefresh();
                
                // Mark the current authorization code as handled
                sessionStorage.setItem('casdoor_auth_processed', 'true');
                sessionStorage.setItem('casdoor_processed_code', code);
                
                return existingToken;
            }
            
            // Check whether a forced-refresh flag exists
            const forceRefresh = sessionStorage.getItem('force_token_refresh') === 'true';
            
            // Check whether this authorization code has already been handled
            const processedCode = sessionStorage.getItem('casdoor_processed_code');
            if (processedCode === code && !forceRefresh) {
                console.log(`Authorization code ${code.substring(0, 5)}... already processed, checking for existing token`);
                
                const existingToken = this.getToken();
                if (existingToken) {
                    console.log('Found existing token for processed code, using it');
                    sessionStorage.setItem('casdoor_auth_processed', 'true');
                    return existingToken;
                }
                
                // Clean up when no valid token is found but the code-handled flag is set
                console.log('No token found for processed code, clearing processed flag to retry');
                sessionStorage.removeItem('casdoor_processed_code');
            }
            
            // Check whether a login flow is already in progress
            if (isLockActive(SIGNIN_LOCK, 20000)) {
                console.log('Signin already in progress, waiting for completion');
                
                // Wait briefly to see whether a new token is generated
                for (let i = 0; i < 5; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                    
                    // Check again for a new token
                    const newToken = this.getToken();
                    if (newToken) {
                        console.log('New token was generated while waiting');
                        
                        // Mark the current authorization code as handled
                        sessionStorage.setItem('casdoor_auth_processed', 'true');
                        sessionStorage.setItem('casdoor_processed_code', code);
                        return newToken;
                    }
                }
                
                // If there is still no new token after waiting, clear the lock and continue
                console.warn('No token generated after waiting, clearing lock and continuing');
                releaseAuthLock(SIGNIN_LOCK);
            }
            
            // Set a lock to ensure only one token exchange runs at a time
            const lockResult = setAuthLock(SIGNIN_LOCK);
            if (!lockResult.success) {
                console.warn('Failed to acquire signin lock, another process may be signing in');
                // Wait and check again whether a token exists
                await new Promise(resolve => setTimeout(resolve, 2000));
                const existingToken = this.getToken();
                if (existingToken) {
                    console.log('Found token after waiting for lock');
                    sessionStorage.setItem('casdoor_auth_processed', 'true');
                    sessionStorage.setItem('casdoor_processed_code', code);
                    return existingToken;
                }
                // If there is still no token, try to force-acquire the lock
                releaseAuthLock(SIGNIN_LOCK);
                const retryLockResult = setAuthLock(SIGNIN_LOCK);
                if (!retryLockResult.success) {
                    console.error('Could not acquire signin lock after retrying, but continuing anyway');
                }
            }
            
            try {
                // Record the authorization code currently being processed
                sessionStorage.setItem('casdoor_processed_code', code);
                
                // Exchange the code for a token using the provided code and state
                console.log('Exchanging code for token...');
                
                // Manually store the code and state in sessionStorage so the SDK can find them
                sessionStorage.setItem('casdoor-state', state);
                
                // Use the SDK to exchange the token
                const tokenResponse = await sdk.exchangeForAccessToken();
                console.log('Token response received:', !!tokenResponse);
        
                if (!tokenResponse || !tokenResponse.access_token) {
                    throw new Error('Failed to exchange code for token');
                }
        
                // Store the token
                this.storeTokensInCookies(tokenResponse);
                
                // Mark the current authorization code as fully handled
                sessionStorage.setItem('casdoor_auth_processed', 'true');
                
                return tokenResponse.access_token;
            } finally {
                // Clear the lock to ensure it is released even when an error occurs
                releaseAuthLock(SIGNIN_LOCK);
            }
        } catch (error) {
            console.error('Signin with code error:', error);
            // Clear all state that may be stuck
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
        localStorage.removeItem('userInfo');
        
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
        localStorage.removeItem('userInfo');
        
        // Setup token refresh timer
        this.setupTokenRefresh();
    }

    // Refresh the access token
    async refreshAccessToken(): Promise<string> {
        // Add a re-entry flag to prevent conflicts from multiple refresh attempts
        const REFRESH_LOCK = AUTH_LOCKS.REFRESH;
        
        // If a refresh is already in progress, return the existing promise
        if (this.refreshing && this.refreshPromise) {
            return this.refreshPromise;
        }
        
        // Check whether another page or component is refreshing by using isLockActive
        if (isLockActive(REFRESH_LOCK, 5000)) {
            console.log('Another refresh is in progress, waiting for it to complete');
            
            // Wait briefly and then check whether a new token exists
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get the current token and verify whether it is new
            const currentToken = this.getToken();
            if (currentToken) {
                // Check whether the token is fresh with an expiration time far in the future
                const tokenInfo = this.parseAccessToken(currentToken);
                if (tokenInfo?.payload?.exp && tokenInfo.payload.exp * 1000 > Date.now() + 10 * 60 * 1000) {
                    console.log('Using newly refreshed token from another process');
                    return currentToken;
                }
            }
            
            // Remove any potentially stuck lock when no new token is obtained
            releaseAuthLock(REFRESH_LOCK);
        } else if (localStorage.getItem(REFRESH_LOCK) === 'true') {
            // Clear the lock when it is too old
            releaseAuthLock(REFRESH_LOCK);
        }
        
        // Set the refresh lock
        const lockResult = setAuthLock(REFRESH_LOCK);
        if (!lockResult.success) {
            console.error('Failed to acquire refresh lock');
        }
        
        // Get the refresh token
        let refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE);
        
        // If it is not in localStorage, try reading it from cookies
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
                    // Clear the lock whether the operation succeeds or fails
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
        // First check the absolute-trust flag; if it exists, trust the token completely
        if (localStorage.getItem('token_absolute_trust') === 'true') {
            // Check whether the token exists
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            if (localToken) return true;
            
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            if (cookieToken) return true;
            
            // Clear the trust flag when no token exists
            localStorage.removeItem('token_absolute_trust');
            return false;
        }
        
        // Next check the regular trust flag
        if (localStorage.getItem('token_trusted') === 'true') {
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            if (localToken) return true;
            
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            if (cookieToken) return true;
            
            localStorage.removeItem('token_trusted');
            return false;
        }
        
        // Check the regular validation flag
        const tokenVerified = localStorage.getItem('token_verified') === 'true';
        
        // If a validation flag exists, check whether the token actually exists
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
            
            // Clear the flag when a validation marker exists but no token is found
            localStorage.removeItem('token_verified');
            return false;
        }
        
        // Use the traditional validation path when no validation flag exists
        const localToken = localStorage.getItem(TOKEN_COOKIE);
        if (localToken) {
            // Set the validation flag when a token is found
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
                    if (hasAdminPrivileges(payload)) {
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
            const cachedUserInfo = this.getCachedUserInfo();
            if (cachedUserInfo) {
                return cachedUserInfo;
            }
        }
        
        // Extract basic info from token first
        const tokenInfo = this.parseAccessToken(token);
        let basicUserInfo: UserInfo | null = null;
        
        if (tokenInfo?.payload) {
            const payload = tokenInfo.payload;

            basicUserInfo = normalizeUserInfo(payload);
        }

        // Try to get detailed user info from Casdoor API
        try {
            // Try primary endpoint first
            const userInfo = await this.fetchUserInfoFromAPI(token);
            
            // Cache the avatar when the user has one
            if (userInfo.id && userInfo.avatar) {
                avatarCache.cacheAvatar(userInfo.id, userInfo.avatar).catch(e => {
                    console.warn('Failed to cache avatar:', e);
                });
                
                // Try prefetching the avatar while passing user information so a better default avatar can be generated
                avatarCache.getAvatar(userInfo.id, userInfo.avatar, {
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    displayName: userInfo.displayName,
                    name: userInfo.name
                }).catch(e => {
                    console.warn('Failed to preload avatar:', e);
                });
            }
            
            return this.normalizeAndCacheUserInfo(userInfo);
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
                const normalizedUserData = normalizeUserInfo(userData, basicUserInfo || undefined);
                
                return this.normalizeAndCacheUserInfo(normalizedUserData);
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
                    const normalizedUserInfo = normalizeUserInfo(userInfo, basicUserInfo || undefined);
                    
                    return this.normalizeAndCacheUserInfo(normalizedUserInfo);
                } catch (tertiaryError) {
                    console.error('All user info endpoints failed:', tertiaryError);

                    const cachedUserInfo = this.getCachedUserInfo(true);
                    if (cachedUserInfo) {
                        return normalizeUserInfo(cachedUserInfo, basicUserInfo || undefined);
                    }
                    
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

        return normalizeUserInfo(userData);
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
            // Clear the global validation flag
            localStorage.removeItem('token_verified');
            localStorage.removeItem('auth_callback_completed_time');
            localStorage.removeItem('last_token_validated_time');
            localStorage.removeItem('last_auth_check_time');
            localStorage.removeItem('is_admin_validated');
            
            // Clear the periodic check timer
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
            localStorage.removeItem('userInfo');
            
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

    // Validate the token with the team API and always send the request to the server
    async validateWithTeamApi(token: string | null = null): Promise<{valid: boolean, isAdmin: boolean}> {
        // Ensure the API validation endpoint is always reached and do not use cache in critical authentication flows
        // Still keep the absolute-trust flag check, but only for special login-flow scenarios
        if (localStorage.getItem('token_absolute_trust') === 'true' && 
            localStorage.getItem('auth_callback_completed_time') !== null) {
            
            const authTime = parseInt(localStorage.getItem('auth_callback_completed_time') || '0');
            // Only valid within 10 minutes after login and not used for periodic validation
            if (Date.now() - authTime < 10 * 60 * 1000) {
                logger.debug('Team API validation: Absolute trust flag detected during auth callback flow');
                return { valid: true, isAdmin: localStorage.getItem('is_admin_validated') === 'true' };
            } else {
                // Automatically clear the trust flag after 10 minutes
                localStorage.removeItem('token_absolute_trust');
            }
        }
        
        // Always request the API during periodic validation regardless of other conditions
        const isPeriodicCheck = localStorage.getItem('is_periodic_validation') === 'true';
        
        // Determine whether cache should be used
        const shouldUseCache = !isPeriodicCheck && 
                              isRecentLogin(10) && 
                              localStorage.getItem('token_trusted') === 'true';
        
        // Always skip the cache for periodic validation, but allow it in other scenarios
        if (!isPeriodicCheck && shouldUseCache) {
            logger.debug('Team API validation: Recent login with trust flag, but will still validate with API');
            // Even during the trust window, still perform API validation but at a lower frequency
            
            const cachedResult = localStorage.getItem('team_api_validation_result');
            if (cachedResult) {
                try {
                    const parsed = JSON.parse(cachedResult);
                    if (Date.now() - parsed.timestamp < 60000) { // Use the cache only for results that are less than 1 minute old
                        // Do not use the cache when a specific token is provided and it differs from the cached token
                        if (token && parsed.tokenHash && parsed.tokenHash !== this.simpleTokenHash(token)) {
                            logger.debug('Token changed, not using cached validation result');
                        } else {
                            logger.debug('Using cached team API validation result');
                            return {
                                valid: parsed.valid,
                                isAdmin: parsed.isAdmin
                            };
                        }
                    }
                } catch (e) {
                    // Ignore cache parsing errors
                }
            }
        }
        
        // Return the existing request promise when a request is already in progress
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
            // Set the validation lock
            setAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
            
            // Create a new promise and store its reference
            this.teamApiValidationPromise = (async () => {
                try {
                    // Validate the token with the Casdoor API
                    logger.info('Validating token with Casdoor API...');
                    
                    // Validate the token using Casdoor's user endpoint
                    const validationUrl = `${config.serverUrl}/api/user`;
                    
                    const response = await fetch(validationUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    // Check the response status
                    if (!response.ok) {
                        logger.warn(`Casdoor API validation failed with status: ${response.status}`);
                        return { valid: false, isAdmin: false };
                    }
                    
                    // Parse the response
                    const result = await response.json();
                    
                    // Check whether the response is an error
                    if (result.status === 'error') {
                        logger.warn('Casdoor API returned error:', result.msg);
                        return { valid: false, isAdmin: false };
                    }
                    
                    // If the response is in JWT format, treat it as a successful valid token
                    // Parse the user information from the response
                    const isAdmin = this.checkIfUserIsAdmin(result);
                    
                    // Apply short-term caching only for non-periodic validation
                    if (!isPeriodicCheck) {
                        localStorage.setItem('team_api_validation_result', JSON.stringify({
                            valid: true,
                            isAdmin: isAdmin,
                            timestamp: Date.now(),
                            tokenHash: token ? this.simpleTokenHash(token) : null
                        }));
                    }
                    
                    // Set a flag when the user is an administrator
                    if (isAdmin) {
                        localStorage.setItem('is_admin_validated', 'true');
                    }
                    
                    logger.info('Casdoor API validation successful, token is valid');
                    return { valid: true, isAdmin: isAdmin };
                } finally {
                    // Clear the promise reference and lock after the request completes, regardless of success or failure
                    setTimeout(() => {
                        this.teamApiValidationPromise = null;
                        releaseAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
                    }, 100);
                }
            })();
            
            return this.teamApiValidationPromise;
        } catch (error) {
            logger.error('Casdoor API validation error:', error);
            this.teamApiValidationPromise = null;
            releaseAuthLock(AUTH_LOCKS.TEAM_API_VALIDATION);
            return { valid: false, isAdmin: false };
        }
    }
    
    // Check admin privileges from Casdoor user response.
    private checkIfUserIsAdmin(userResponse: any): boolean {
        try {
            return hasAdminPrivileges(userResponse);
        } catch (e) {
            logger.error('Error checking admin status from user response:', e);
            return false;
        }
    }

    // Implement a simple token hash for token comparison
    private simpleTokenHash(token: string): string {
        // Build a simple hash from only the first 8 and last 8 characters of the token
        // This is not a cryptographically secure hash; it is only used for token cache comparison
        if (!token || token.length < 16) {
            return token; // Return the original value directly when the token is too short
        }
        
        const prefix = token.substring(0, 8);
        const suffix = token.substring(token.length - 8);
        const length = token.length.toString();
        
        // Combine token length with its first and last characters to create a simple hash identifier
        return `${prefix}_${length}_${suffix}`;
    }

    // Basic token validation without external API calls
    public async validateLocalToken(): Promise<boolean> {
        // First check the absolute-trust flag and return true immediately without validation if it exists
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            logger.debug('Local validation: Absolute trust flag detected, returning true without validation');
            return true;
        }
        
        // Check the standard trust flag
        if (localStorage.getItem('token_trusted') === 'true') {
            logger.debug('Local validation: Trust flag detected, returning true without validation');
            return true;
        }
        
        // Check the short post-login window during which the token is absolutely trusted
        const authCallbackCompleted = localStorage.getItem('auth_callback_completed_time');
        if (authCallbackCompleted) {
            const completionTime = parseInt(authCallbackCompleted);
            if (!isNaN(completionTime) && Date.now() - completionTime < 10 * 60 * 1000) {
                logger.debug('Local validation: Recent login detected (<10min), returning true without validation');
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
            
            // Local validation is sufficient; if the token has not expired, treat it as valid
            if (expiryTime > now + 30 * 1000) { // Expires at least 30 seconds later
                localStorage.setItem('token_verified', 'true');
                return true;
            }
            
            // Try refreshing the token when it is close to expiring
            if (expiryTime <= now + 10 * 60 * 1000) { // Expires within 10 minutes
                try {
                    await this.refreshAccessToken();
                    localStorage.setItem('token_verified', 'true');
                    return true;
                } catch (error) {
                    logger.error('Token near expiry and refresh failed during local validation:', error);
                    // Log out if it has already expired
                    if (expiryTime <= now) {
                        await this.logout();
                        return false;
                    }
                    // If it has not expired yet, still treat it as valid and try refreshing later
                    return true;
                }
            }
            
            // Set the validation flag after successful validation
            localStorage.setItem('token_verified', 'true');
            return true;
        } catch (error) {
            logger.error('Error in local token validation:', error);
            return false;
        }
    }

    // Helper method for triggering the invalid-authentication event
    private triggerInvalidAuthEvent(message: string): void {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:invalid', { 
                detail: { message }
            }));
        }
    }

    // Combined validation method that uses both local validation and team API validation
    async validateToken(noRefresh: boolean = false): Promise<boolean> {
        const token = this.getToken();
        
        if (!token) return false;
        
        try {
            // Check the highest-level trust flag and skip validation entirely if it exists
            if (localStorage.getItem('token_absolute_trust') === 'true' || 
                localStorage.getItem('skip_all_token_validation') === 'true') {
                console.log('Auth: Using absolute trust flag, skipping validateToken');
                return true;
            }
            
            // First validate the token format and expiration time
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) {
                console.warn('Token lacks expiration information');
                return false;
            }
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // Do not call the API when the token is clearly expired
            if (expiryTime <= now) {
                console.warn('Token has expired based on exp claim');
                
                // If noRefresh is set, return false without refreshing the token
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
            
            // Do not perform further validation when the noRefresh parameter is set
            if (noRefresh) {
                // Validate only with local token checks without API calls or refreshes
                return true;
            }
            
            // Normal API validation flow
            // ...existing code for API validation...
            
            // Proactively refresh the token when it is close to expiring within 30 minutes
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

    // Public method for checking whether a token is valid, updated to avoid unnecessary token refreshes
    async isTokenValid(): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        // Check the highest-level trust flag
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            console.log('Auth: Using absolute trust flag, skipping isTokenValid check');
            return true;
        }
        
        try {
            // Perform only basic validation and do not refresh the token automatically
            const isBasicValid = await this.isTokenValidWithoutRefresh();
            if (!isBasicValid) {
                console.warn('Basic token validation failed');
                
                // Still try refreshing the token here because this may be an explicit validity check
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

    // Check whether a token is valid without requesting a new token, improved for more accurate validation
    async isTokenValidWithoutRefresh(): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        // Check the absolute-trust flag and skip validation entirely if it exists
        if (localStorage.getItem('token_absolute_trust') === 'true' || 
            localStorage.getItem('skip_all_token_validation') === 'true') {
            logger.debug('No-refresh validation: Absolute trust flag detected, returning true without validation');
            return true;
        }
        
        // Check the standard trust flag
        if (localStorage.getItem('token_trusted') === 'true') {
            logger.debug('No-refresh validation: Trust flag detected, returning true without validation');
            return true;
        }
        
        // Check the short post-login window during which the token is absolutely trusted
        const authCallbackCompleted = localStorage.getItem('auth_callback_completed_time');
        if (authCallbackCompleted) {
            const completionTime = parseInt(authCallbackCompleted);
            if (!isNaN(completionTime) && Date.now() - completionTime < 10 * 60 * 1000) {
                logger.debug('No-refresh validation: Recent login detected (<10min), returning true without validation');
                return true;
            }
        }
        
        try {
            // Basic local validation that checks only token format and expiration time
            const token = this.getToken();
            if (!token) return false;
            
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload || !tokenInfo.payload.exp) return false;
            
            const expiryTime = tokenInfo.payload.exp * 1000;
            const now = Date.now();
            
            // Return false when the token has expired, but do not refresh it automatically
            if (expiryTime <= now) {
                logger.warn('Token has expired based on exp claim');
                return false;
            }
            
            // Stop after local validation succeeds and do not request further API validation
            return true;
        } catch (error) {
            logger.error('Error in token validation without refresh:', error);
            return false;
        }
    }

    // Handle authentication errors in API responses
    checkApiResponse(response: any): boolean {
        // Check whether this is a standard error response
        if (response && response.success === true && response.data) {
            const data = response.data;
            
            // Check specific error-message formats
            if (data.status === 'error' && data.msg && 
                (data.msg.includes('token') || 
                 data.msg.includes('Access') || 
                 data.msg.includes('exist'))) {
                
                console.warn('API returned auth error:', data.msg);
                
                // Trigger invalid-authentication handling
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
            
            // Notify the user that they need to log in again
            this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
            return false;
        }
    }

    // Set up a timer to periodically check token validity
    private setupTokenPeriodicCheck(): void {
        // Clear the existing timer
        if (this.tokenCheckTimer !== null) {
            window.clearInterval(this.tokenCheckTimer);
            this.tokenCheckTimer = null;
        }

        // Set up periodic checks when the user is logged in
        if (this.isLoggedIn()) {
            const checkInterval = TOKEN_CHECK_INTERVAL; // 5-minute interval
            
            this.tokenCheckTimer = window.setInterval(async () => {
                logger.debug('Token check interval triggered, checking if validation needed');
                
                try {
                    // Check whether it is within 10 minutes after login
                    const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
                    if (authCallbackTime && Date.now() - parseInt(authCallbackTime) < 10 * 60 * 1000) {
                        logger.debug('Token check: Recent auth callback detected (<10min), skipping validation');
                        return;
                    }
                    
                    // Check whether another validation is already in progress
                    if (localStorage.getItem('auth_validation_in_progress') === 'true') {
                        logger.debug('Token check: Validation already in progress, skipping');
                        return;
                    }
                    
                    // Check whether AuthManager has validated recently
                    const lastAuthCheck = localStorage.getItem('last_auth_check_time');
                    if (lastAuthCheck && Date.now() - parseInt(lastAuthCheck) < 60000) { // Within 1 minute
                        logger.debug('Token check: Recent validation detected, skipping check');
                        return;
                    }

                    // The initial 10-minute trust period has passed, so clear the absolute-trust flag
                    localStorage.removeItem('token_absolute_trust');
                    localStorage.removeItem('skip_all_token_validation');
                    
                    logger.info('Token check: Validating token without requesting new token');
                    
                    // Mark validation as in progress
                    localStorage.setItem('auth_validation_in_progress', 'true');
                    
                    try {
                        // Validate based on local token information by checking only format and expiration time without sending an API request
                        const isValid = await this.isTokenValidWithoutRefresh();
                        
                        if (!isValid) {
                            logger.warn('Token check: Token validation failed - token appears invalid');
                            
                            // Trigger the logout flow when validation fails
                            this.triggerInvalidAuthEvent('Your session has expired. Please login again.');
                            await this.logout();
                        } else {
                            // Record the validation time when local validation succeeds
                            logger.info('Token check: Local validation successful');
                            localStorage.setItem('last_token_validated_time', Date.now().toString());
                            localStorage.setItem('last_auth_check_time', Date.now().toString());
                        }
                    } finally {
                        // Clear the validation flag
                        localStorage.removeItem('auth_validation_in_progress');
                    }
                } catch (error) {
                    logger.error('Error during periodic token validation:', error);
                    localStorage.removeItem('auth_validation_in_progress');
                }
            }, checkInterval);
        }
    }
}

function normalizeClaimArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            if (typeof entry === 'string') {
                return entry;
            }

            if (entry && typeof entry === 'object') {
                const record = entry as Record<string, unknown>;
                if (typeof record.name === 'string') {
                    return record.name;
                }
                if (typeof record.id === 'string') {
                    return record.id;
                }
            }

            return '';
        })
        .filter(Boolean);
}

function hasAdminPrivileges(payload: any): boolean {
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    if (payload.isAdmin === true || payload.role === 'admin') {
        return true;
    }

    const groups = normalizeClaimArray(payload.groups);
    const roles = normalizeClaimArray(payload.roles);
    const permissions = normalizeClaimArray(payload.permissions);

    const hasAdminKeyword = (values: string[]) =>
        values.some((value) => value.toLowerCase().includes('admin'));

    return hasAdminKeyword(groups) || hasAdminKeyword(roles) || hasAdminKeyword(permissions);
}

function normalizeUserInfo(rawUser: any, fallback?: Partial<UserInfo>): UserInfo {
    const source = rawUser && typeof rawUser === 'object' ? rawUser : {};
    const groups = normalizeClaimArray(source.groups ?? fallback?.groups);
    const roles = normalizeClaimArray(source.roles ?? fallback?.roles);
    const permissions = normalizeClaimArray(source.permissions ?? fallback?.permissions);

    const normalized: UserInfo = {
        ...(fallback || {}),
        ...(source || {}),
        id: source.id || source.sub || fallback?.id || '',
        name: source.name || source.preferred_username || fallback?.name || '',
        displayName: source.displayName || source.fullName || source.name || fallback?.displayName || '',
        firstName: source.firstName || fallback?.firstName || '',
        lastName: source.lastName || fallback?.lastName || '',
        email: source.email || fallback?.email || '',
        owner: source.owner || fallback?.owner || '',
        avatar: source.avatar || source.picture || fallback?.avatar || '',
        groups,
        roles,
        permissions,
        isAdmin: hasAdminPrivileges({ ...fallback, ...source, groups, roles, permissions }),
    };

    normalized.fullName = source.fullName || fallback?.fullName || createFullName(normalized);

    return normalized;
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

    if (userData.name) {
        return userData.name;
    }

    if (userData.preferred_username) {
        return userData.preferred_username;
    }
    
    // Last resort: use name (username)
    return userData.name || '';
}

// Helper function to detect invalid auth responses
function isInvalidAuthResponse(response: any): boolean {
    // Detect empty responses
    if (!response) return true;
    
    // Check explicit error-response formats
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
    
    // Check standard invalid-response characteristics
    if (response.status === 'error' && 
        response.msg && (
            response.msg.includes('token') || 
            response.msg.includes('Access') || 
            response.msg.includes('exist')
        )) {
        return true;
    }
    
    // Typical invalid-response characteristics
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

// Helper function to determine if the login was recent (within specified minutes)
function isRecentLogin(minutes: number): boolean {
    const authCallbackTime = localStorage.getItem('auth_callback_completed_time');
    if (!authCallbackTime) {
        return false;
    }
    
    const loginTime = parseInt(authCallbackTime, 10);
    if (isNaN(loginTime)) {
        return false;
    }
    
    // Check if login happened within specified minutes
    return Date.now() - loginTime < minutes * 60 * 1000;
}

// Export the helper functions
export { isInvalidAuthResponse, AUTH_LOCKS, isRecentLogin };




