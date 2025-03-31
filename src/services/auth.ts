import Sdk from 'casdoor-js-sdk';

// Define the Casdoor configuration
const config = {
    serverUrl: 'https://695cas.fastbirdcdn.online',
    clientId: '300932808273326bac0c',
    appName: '695_website',
    organizationName: 'Team695',
    redirectPath: '/callback',
    // Use sessionStorage for PKCE state
    storage: sessionStorage
};

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
// interface TokenResponse {
//     access_token: string;
//     token_type: string;
//     expires_in: number;
//     refresh_token?: string;
//     scope?: string;
// }

// Create a service to handle authentication
class CasdoorService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private userInfoCache: UserInfo | null = null;

    constructor() {
        // Initialize tokens from localStorage if available
        this.accessToken = localStorage.getItem('casdoor-token');
        this.refreshToken = localStorage.getItem('casdoor-refresh-token');
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

            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to exchange code for token');
            }

            // Store the tokens
            this.accessToken = tokenResponse.access_token;
            localStorage.setItem('casdoor-token', tokenResponse.access_token);

            if (tokenResponse.refresh_token) {
                this.refreshToken = tokenResponse.refresh_token;
                localStorage.setItem('casdoor-refresh-token', tokenResponse.refresh_token);
            }

            return tokenResponse.access_token;
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // Refresh the access token
    async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const tokenResponse = await sdk.refreshAccessToken(this.refreshToken);

            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to refresh token');
            }

            // Update the tokens
            this.accessToken = tokenResponse.access_token;
            localStorage.setItem('casdoor-token', tokenResponse.access_token);

            if (tokenResponse.refresh_token) {
                this.refreshToken = tokenResponse.refresh_token;
                localStorage.setItem('casdoor-refresh-token', tokenResponse.refresh_token);
            }

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
        return !!this.accessToken;
    }

    // Get the token
    getToken(): string | null {
        return this.accessToken;
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

    // Add this method to the CasdoorService class to ensure we're properly fetching user info

    // Get user information with retry mechanism
    async getUserInfo(forceRefresh = false): Promise<UserInfo> {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        // If we have cached user info and don't need to refresh, return it
        if (this.userInfoCache && !forceRefresh) {
            return this.userInfoCache;
        }

        try {
            // Use the SDK to get user info
            const response = await sdk.getUserInfo(this.accessToken);

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
                        'Authorization': `Bearer ${this.accessToken}`,
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
                if (this.accessToken) {
                    const tokenInfo = this.parseAccessToken(this.accessToken);
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

    // Logout the user
    logout(): void {
        this.accessToken = null;
        this.refreshToken = null;
        this.userInfoCache = null;
        localStorage.removeItem('casdoor-token');
        localStorage.removeItem('casdoor-refresh-token');
        sessionStorage.clear(); // Clear PKCE state
    }

    // Revoke the token and logout
    async revokeToken(): Promise<void> {
        // Just perform a local logout for now
        this.logout();

        // Redirect to Casdoor logout page if needed
        // window.location.href = `${config.serverUrl}/logout`;
    }
}

// Export a singleton instance
export const casdoorService = new CasdoorService();

// Export the SDK for direct access if needed
export { sdk };