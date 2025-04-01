import { defineStore } from 'pinia';
import { casdoorService } from '@/services/auth';

// Define interface for the store state
interface UserStoreState {
    userInfo: any | null;
    orgData: any | null;
    isLoading: boolean;
    error: string | null;
    lastFetchTime: number | null;
    isInitialized: boolean;
}

export const useUserStore = defineStore('user', {
    state: (): UserStoreState => ({
        userInfo: null,
        orgData: null,
        isLoading: false,
        error: null,
        lastFetchTime: null,
        isInitialized: false // Track if the store has been initialized
    }),

    // Persistence is handled via a plugin like pinia-plugin-persistedstate

    actions: {
        async initializeStore() {
            // If already initialized and data was fetched recently (within 15 minutes), don't fetch again
            const now = Date.now();
            const fifteenMinutes = 15 * 60 * 1000;

            if (this.isInitialized && this.lastFetchTime && (now - this.lastFetchTime < fifteenMinutes)) {
                console.log('Using cached user data - last fetch was less than 15 minutes ago');
                return;
            }

            // If we have cached data, mark as initialized to prevent showing loading state
            if (this.userInfo) {
                this.isInitialized = true;
            }

            // Refresh data in the background
            this.refreshUserInfo().catch(error => {
                console.error('Failed to refresh user data:', error);
            });
        },

        async refreshUserInfo() {
            // Don't set loading to true if we already have data
            // This prevents UI flicker when refreshing in the background
            if (!this.userInfo) {
                this.isLoading = true;
            }

            this.error = null;

            try {
                // Get the token
                const token = casdoorService.getToken();

                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Hardcoded server URL to avoid the undefined serverUrl issue
                const serverUrl = 'https://sso.team695.com';

                // Fetch user info from the get-account endpoint
                const response = await fetch(`${serverUrl}/api/get-account`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch user info: ${response.statusText}`);
                }

                // Parse the response
                const data = await response.json();

                // Update the store
                this.userInfo = data.data;
                this.orgData = data.data2;
                this.lastFetchTime = Date.now();
                this.isInitialized = true;
            } catch (err: any) {
                console.error('Error loading user info:', err);
                this.error = err.message || 'Failed to load user information';

                // If we don't have any data at all, this is a critical error
                if (!this.userInfo) {
                    throw err; // Re-throw to allow components to handle the error
                }
            } finally {
                this.isLoading = false;
            }
        },

        clearUserInfo() {
            this.userInfo = null;
            this.orgData = null;
            this.lastFetchTime = null;
            this.isInitialized = false;
        }
    }
});