import SDK from 'casdoor-js-sdk';

// Casdoor configuration
export const casdoorConfig = {
    serverUrl: import.meta.env.VITE_CASDOOR_SERVER_URL,
    clientId: import.meta.env.VITE_CASDOOR_CLIENT_ID,
    clientSecret: import.meta.env.VITE_CASDOOR_CLIENT_SECRET,
    appName: import.meta.env.VITE_CASDOOR_APP_NAME,
    organizationName: import.meta.env.VITE_CASDOOR_ORGANIZATION_NAME,
    redirectPath: '/callback',
    signinPath: '/api/signin',
    storage: localStorage, // Use localStorage to persist state across tabs
};

export interface UserInfo {
    id: string;
    name: string;
    displayName?: string;
    email: string;
    phone?: string;
    avatar?: string;
    owner: string;
    [key: string]: any;
}

class CasdoorService {
    // Remove the sdk property to avoid the TypeScript warning
    
    constructor() {
        // Initialize SDK but don't store it since we're not using it directly
        new SDK(casdoorConfig);
    }

    /**
     * Get the sign-in URL from Casdoor
     * This will also generate and store a state parameter
     */
    getSigninUrl(): string {
        // Generate a random state value and store it
        const state = Math.random().toString(36).substring(2);
        localStorage.setItem('casdoorState', state);

        // Build the authorization URL manually to ensure state is included
        const redirectUri = `${window.location.origin}${casdoorConfig.redirectPath}`;
        const authUrl = `${casdoorConfig.serverUrl}/login/oauth/authorize?` +
            `client_id=${casdoorConfig.clientId}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=read` +
            `&state=${state}`;

        return authUrl;
    }

    /**
     * Handle the OAuth callback
     * @param code The authorization code from Casdoor
     * @param state The state parameter for CSRF protection
     * @returns Promise with the access token response
     */
    async handleCallback(code: string, state: string): Promise<any> {
        try {
            // Verify state to prevent CSRF attacks
            const savedState = localStorage.getItem('casdoorState');
            if (!state || state !== savedState) {
                throw new Error('Invalid state parameter');
            }

            // Clear the stored state
            localStorage.removeItem('casdoorState');

            // Exchange the code for an access token
            const redirectUri = `${window.location.origin}${casdoorConfig.redirectPath}`;

            // Use the SDK's token endpoint directly
            const tokenUrl = `${casdoorConfig.serverUrl}/api/login/oauth/access_token`;
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: casdoorConfig.clientId,
                    client_secret: casdoorConfig.clientSecret,
                    code: code,
                    redirect_uri: redirectUri,
                }),
            });

            const tokenResponse = await response.json();

            if (tokenResponse.error) {
                throw tokenResponse;
            }

            // Store the token in localStorage
            if (tokenResponse.access_token) {
                localStorage.setItem('casdoorToken', tokenResponse.access_token);
                if (tokenResponse.refresh_token) {
                    localStorage.setItem('casdoorRefreshToken', tokenResponse.refresh_token);
                }
            }

            return tokenResponse;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    /**
     * Get user information using the access token
     * @param accessToken The access token
     * @returns Promise with user information
     */
    async getUserInfo(accessToken?: string): Promise<UserInfo> {
        const token = accessToken || localStorage.getItem('casdoorToken');
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            // First, try to parse the JWT token to get basic user info
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                try {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log("Token payload:", payload);
                    if (payload.name && payload.owner) {
                        // If we have basic info from the token, fetch complete user info
                        const response = await fetch(`${casdoorConfig.serverUrl}/api/get-user?id=${payload.owner}/${payload.name}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            const responseData = await response.json();
                            console.log("Full response from API:", responseData);
                            
                            // Extract user data from the 'data' property
                            if (responseData.status === "ok" && responseData.data) {
                                console.log("User data extracted from 'data' property:", responseData.data);
                                return responseData.data;
                            }
                            
                            return responseData;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing token:', e);
                }
            }

            // Fallback to userinfo endpoint
            const response = await fetch(`${casdoorConfig.serverUrl}/api/userinfo`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log("Full response from userinfo endpoint:", responseData);
            
            // Extract user data from the 'data' property if it exists
            if (responseData.status === "ok" && responseData.data) {
                console.log("User data extracted from 'data' property:", responseData.data);
                return responseData.data;
            }

            // If we still don't have complete user info, try to get it by name
            if (responseData.name && responseData.owner && (!responseData.email || !responseData.id)) {
                try {
                    const detailResponse = await fetch(`${casdoorConfig.serverUrl}/api/get-user?id=${responseData.owner}/${responseData.name}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (detailResponse.ok) {
                        const detailData = await detailResponse.json();
                        console.log("Detail response:", detailData);
                        
                        // Extract user data from the 'data' property if it exists
                        if (detailData.status === "ok" && detailData.data) {
                            console.log("User data extracted from 'data' property:", detailData.data);
                            return detailData.data;
                        }
                        
                        return detailData;
                    }
                } catch (e) {
                    console.error('Error fetching detailed user info:', e);
                }
            }

            return responseData;
        } catch (error) {
            console.error('Error getting user info:', error);
            throw error;
        }
    }

    /**
     * Get the Casdoor server URL
     */
    getServerUrl(): string {
        return casdoorConfig.serverUrl;
    }

    /**
     * Check if the user is logged in
     */
    isLoggedIn(): boolean {
        return !!localStorage.getItem('casdoorToken');
    }

    /**
     * Log out the user
     */
    logout(): void {
        localStorage.removeItem('casdoorToken');
        localStorage.removeItem('casdoorRefreshToken');
        localStorage.removeItem('casdoorState');
    }

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<any> {
        const refreshToken = localStorage.getItem('casdoorRefreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${casdoorConfig.serverUrl}/api/login/oauth/refresh_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: casdoorConfig.clientId,
                    client_secret: casdoorConfig.clientSecret,
                }),
            });

            const tokenResponse = await response.json();

            if (tokenResponse.access_token) {
                localStorage.setItem('casdoorToken', tokenResponse.access_token);
                if (tokenResponse.refresh_token) {
                    localStorage.setItem('casdoorRefreshToken', tokenResponse.refresh_token);
                }
            }

            return tokenResponse;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    /**
     * Parse the JWT token to get basic user info
     * @param token The JWT token
     * @returns The decoded token payload
     */
    parseToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    /**
     * Revoke the access token
     */
    async revokeToken(): Promise<void> {
        const token = localStorage.getItem('casdoorToken');
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch(`${casdoorConfig.serverUrl}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    client_id: casdoorConfig.clientId,
                    client_secret: casdoorConfig.clientSecret,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to revoke token: ${response.status} ${response.statusText}`);
            }

            // Clear local storage
            this.logout();
        } catch (error) {
            console.error('Error revoking token:', error);
            throw error;
        }
    }
}

// Export as a singleton
export const casdoorService = new CasdoorService();