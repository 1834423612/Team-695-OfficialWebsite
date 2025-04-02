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

// 根据环境动态设置 Cookie 选项
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Cookie configuration
const COOKIE_OPTIONS = {
    // 在开发环境中禁用 secure 标志，允许 HTTP
    secure: !isDevelopment && window.location.protocol === 'https:',
    // 在开发环境中使用 lax，生产环境使用 strict
    sameSite: isDevelopment ? 'lax' as const : 'strict' as const,
    expires: 7,  // 7 天过期
    path: '/'    // 全站可用
};

// 备用存储方法 - 当 Cookie 不可用时使用 localStorage
const useLocalStorageBackup = isDevelopment;

// Token cookie/storage names
const TOKEN_COOKIE = 'casdoor-token';
const REFRESH_TOKEN_COOKIE = 'casdoor-refresh-token';
const SESSION_ID_COOKIE = 'casdoor_session_id';

// Initialize the SDK
const sdk = new Sdk(config);

// Define user info interface
export interface UserInfo {
    id: string;
    name: string;
    displayName?: string;
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

    constructor() {
        // 检查是否有备用存储的令牌
        if (useLocalStorageBackup) {
            this.checkLocalStorageBackup();
        }
    }

    // 检查 localStorage 中是否有备用令牌
    private checkLocalStorageBackup(): void {
        try {
            const accessToken = localStorage.getItem(TOKEN_COOKIE);
            if (accessToken) {
                console.log('Found backup token in localStorage, attempting to restore');
                // 尝试将 localStorage 中的令牌恢复到 cookie
                Cookies.set(TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
                
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE);
                if (refreshToken) {
                    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
                }
                
                // 检查是否成功设置了 cookie
                if (!Cookies.get(TOKEN_COOKIE)) {
                    console.warn('Failed to restore token to cookie, will continue using localStorage');
                } else {
                    console.log('Successfully restored token from localStorage to cookie');
                }
            }
        } catch (error) {
            console.error('Error checking localStorage backup:', error);
        }
    }

    // Start the PKCE authorization flow
    startLogin(provider?: string): void {
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
            // Exchange the authorization code for an access token using PKCE
            const tokenResponse = await sdk.exchangeForAccessToken();
            // console.log('Token response received:', !!tokenResponse);

            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to exchange code for token');
            }

            // Manually store tokens in cookies
            this.storeTokensInCookies(tokenResponse);

            return tokenResponse.access_token;
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // Helper method to store tokens in cookies
    private storeTokensInCookies(tokenResponse: TokenResponse): void {
        console.log('Storing tokens...');
        
        try {
            // 尝试存储在 cookie 中
            Cookies.set(TOKEN_COOKIE, tokenResponse.access_token, COOKIE_OPTIONS);
            
            if (tokenResponse.refresh_token) {
                Cookies.set(REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token, COOKIE_OPTIONS);
            }
            
            // 检查 cookie 是否设置成功
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            console.log('Cookie token set success:', !!cookieToken);
            
            // 如果 cookie 设置失败且在开发环境，使用 localStorage 作为备份
            if (!cookieToken && useLocalStorageBackup) {
                console.warn('Failed to set cookie, using localStorage as backup');
                localStorage.setItem(TOKEN_COOKIE, tokenResponse.access_token);
                
                if (tokenResponse.refresh_token) {
                    localStorage.setItem(REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token);
                }
            }
        } catch (error) {
            console.error('Error storing tokens:', error);
            
            // 出错时使用 localStorage 作为备份
            if (useLocalStorageBackup) {
                console.warn('Error setting cookies, using localStorage as backup');
                localStorage.setItem(TOKEN_COOKIE, tokenResponse.access_token);
                
                if (tokenResponse.refresh_token) {
                    localStorage.setItem(REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token);
                }
            }
        }
    }

    // Manually set tokens (useful for testing or when tokens are received from other sources)
    setTokens(accessToken: string, refreshToken?: string): void {
        try {
            Cookies.set(TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
            
            if (refreshToken) {
                Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
            }
            
            // 检查 cookie 是否设置成功
            const cookieToken = Cookies.get(TOKEN_COOKIE);
            
            // 如果 cookie 设置失败且在开发环境，使用 localStorage 作为备份
            if (!cookieToken && useLocalStorageBackup) {
                localStorage.setItem(TOKEN_COOKIE, accessToken);
                
                if (refreshToken) {
                    localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
                }
            }
        } catch (error) {
            console.error('Error setting tokens:', error);
            
            // 出错时使用 localStorage 作为备份
            if (useLocalStorageBackup) {
                localStorage.setItem(TOKEN_COOKIE, accessToken);
                
                if (refreshToken) {
                    localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
                }
            }
        }
    }

    // Refresh the access token
    async refreshAccessToken(): Promise<string> {
        // 先尝试从 cookie 获取刷新令牌
        let refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
        
        // 如果 cookie 中没有且使用备份存储，则从 localStorage 获取
        if (!refreshToken && useLocalStorageBackup) {
            refreshToken = localStorage.getItem(REFRESH_TOKEN_COOKIE) || undefined;
        }
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const tokenResponse = await sdk.refreshAccessToken(refreshToken);

            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to refresh token');
            }

            // Update the tokens
            this.storeTokensInCookies(tokenResponse);

            return tokenResponse.access_token;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, clear tokens and force re-login
            this.logout();
            throw error;
        }
    }

    // Check if the user is logged in
    isLoggedIn(): boolean {
        // 先检查 cookie
        const cookieToken = Cookies.get(TOKEN_COOKIE);
        if (cookieToken) {
            return true;
        }
        
        // 如果 cookie 中没有且使用备份存储，则检查 localStorage
        if (useLocalStorageBackup) {
            const localToken = localStorage.getItem(TOKEN_COOKIE);
            return !!localToken;
        }
        
        return false;
    }

    // Get the token
    getToken(): string | null {
        // 先尝试从 cookie 获取
        const cookieToken = Cookies.get(TOKEN_COOKIE);
        if (cookieToken) {
            return cookieToken;
        }
        
        // 如果 cookie 中没有且使用备份存储，则从 localStorage 获取
        if (useLocalStorageBackup) {
            return localStorage.getItem(TOKEN_COOKIE);
        }
        
        return null;
    }

    // Parse JWT token to get user info
    parseAccessToken(token: string): { header: any, payload: any } | null {
        try {
            return sdk.parseAccessToken(token);
        } catch (e) {
            console.error('Error parsing JWT:', e);
            return null;
        }
    }

    // Get user information with retry mechanism
    async getUserInfo(forceRefresh = false): Promise<UserInfo> {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }

        // If we have cached user info and don't need to refresh, return it
        if (this.userInfoCache && !forceRefresh) {
            return this.userInfoCache;
        }

        try {
            // Use the SDK to get user info
            const response = await sdk.getUserInfo(token);

            // Check if response is a Response object
            if (response instanceof Response) {
                if (!response.ok) {
                    throw new Error(`Failed to get user info: ${response.statusText}`);
                }

                // Parse the response JSON
                const userInfo: UserInfo = await response.json();

                // Cache the user info
                this.userInfoCache = userInfo;

                return userInfo;
            } else {
                // If it's already a UserInfo object (in case SDK implementation changes)
                this.userInfoCache = response as unknown as UserInfo;
                return this.userInfoCache;
            }
        } catch (error) {
            console.error('Get user info error:', error);

            // Try to get user info directly from Casdoor API
            try {
                const userInfoUrl = `${config.serverUrl}/api/get-account`;
                const response = await fetch(userInfoUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to get user info: ${response.statusText}`);
                }

                const userInfo: UserInfo = await response.json();
                this.userInfoCache = userInfo;
                return userInfo;
            } catch (secondError) {
                console.error('Second attempt to get user info failed:', secondError);

                // If we can't get detailed info, try to get basic info from token
                if (token) {
                    const tokenInfo = this.parseAccessToken(token);
                    if (tokenInfo && tokenInfo.payload) {
                        const payload = tokenInfo.payload;
                        const basicUserInfo: UserInfo = {
                            id: payload.sub || '',
                            name: payload.name || '',
                            email: payload.email || '',
                            owner: payload.owner || '',
                            displayName: payload.preferred_username || payload.name || '',
                        };
                        return basicUserInfo;
                    }
                }

                throw error;
            }
        }
    }

    // 获取当前会话ID
    private getSessionId(): string | null {
        // 先尝试从 cookie 获取
        const sessionId = Cookies.get(SESSION_ID_COOKIE);
        if (sessionId) {
            return sessionId;
        }
        
        // 如果没有找到会话ID，尝试从令牌中提取用户信息
        const token = this.getToken();
        if (token) {
            const tokenInfo = this.parseAccessToken(token);
            if (tokenInfo && tokenInfo.payload) {
                const payload = tokenInfo.payload;
                // 构建会话ID格式：organization/application/user
                return `${config.organizationName}/${config.appName}/${payload.sub || payload.name}`;
            }
        }
        
        return null;
    }

    // 根据 Swagger 文档修改：删除 Casdoor 服务器上的会话
    private async deleteSession(): Promise<boolean> {
        const sessionId = this.getSessionId();
        if (!sessionId) {
            console.warn('No session ID found to delete');
            return false;
        }

        try {
            // 使用查询参数传递会话ID
            const response = await fetch(`${config.serverUrl}/api/delete-session?id=${encodeURIComponent(sessionId)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Failed to delete session: ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to delete session:', error);
            return false;
        }
    }

    // 根据 Swagger 文档修改：删除 Casdoor 服务器上的令牌
    private async deleteToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) {
            console.warn('No token found to delete');
            return false;
        }

        try {
            // 解析令牌以获取必要的信息
            const tokenInfo = this.parseAccessToken(token);
            if (!tokenInfo || !tokenInfo.payload) {
                console.error('Failed to parse token for deletion');
                return false;
            }

            // 构建符合 Swagger 文档的请求体
            const payload = tokenInfo.payload;
            const tokenData = {
                accessToken: token,
                accessTokenHash: "", // 可能需要从令牌中提取或留空
                application: config.appName,
                organization: config.organizationName,
                name: payload.name || payload.sub || "",
                createdTime: payload.iat ? new Date(payload.iat * 1000).toISOString() : "",
                expiresIn: payload.exp ? (payload.exp - payload.iat) : 0,
                scope: payload.scope || "",
                tokenType: "Bearer",
                user: payload.sub || payload.name || ""
            };

            const response = await fetch(`${config.serverUrl}/api/delete-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tokenData)
            });

            if (!response.ok) {
                console.error(`Failed to delete token: ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to delete token:', error);
            return false;
        }
    }

    // Logout the user - enhanced version
    async logout(): Promise<void> {
        try {
            // First try to delete the session and token on the server
            await Promise.allSettled([
                this.deleteSession(),
                this.deleteToken()
            ]);
        } catch (error) {
            console.error('Error during server logout:', error);
        } finally {
            // Always clear local state regardless of server response
            this.userInfoCache = null;
            
            // Remove cookies
            Cookies.remove(TOKEN_COOKIE, { path: '/' });
            Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
            Cookies.remove(SESSION_ID_COOKIE, { path: '/' });
            
            // 如果使用备份存储，也清除 localStorage
            if (useLocalStorageBackup) {
                localStorage.removeItem(TOKEN_COOKIE);
                localStorage.removeItem(REFRESH_TOKEN_COOKIE);
            }
            
            // Clear PKCE state
            sessionStorage.clear();
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

// Export a singleton instance
export const casdoorService = new CasdoorService();

// Export the SDK for direct access if needed
export { sdk };