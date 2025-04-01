import { defineStore } from 'pinia';
import { ref } from 'vue';
import { casdoorService } from '@/services/auth';

// Define the Casdoor server URL as a constant to avoid undefined issues
const CASDOOR_SERVER_URL = 'https://sso.team695.com';

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<any>(null); // 用户信息缓存
    const orgData = ref<any>(null); // 组织信息缓存
    const lastUpdated = ref<number>(0); // 上次更新的时间戳

    const fetchUserInfo = async (forceRefresh = false) => {
        const now = Date.now();
        const cacheDuration = 5 * 60 * 1000; // 缓存有效期为 5 分钟

        // 如果缓存存在且未过期，且不强制刷新，直接返回缓存
        if (userInfo.value && !forceRefresh && now - lastUpdated.value < cacheDuration) {
            return { userInfo: userInfo.value, orgData: orgData.value };
        }

        try {
            const token = casdoorService.getToken();
            if (!token) throw new Error('No authentication token found');

            // Use the constant instead of accessing casdoorService.config.serverUrl
            const response = await fetch(`${CASDOOR_SERVER_URL}/api/get-account`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch user info: ${response.statusText}`);

            const data = await response.json();
            userInfo.value = data.data || data; // Handle both possible structures
            orgData.value = data.data2;
            lastUpdated.value = now;

            return { userInfo: userInfo.value, orgData: orgData.value };
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    };

    const clearUserInfo = () => {
        userInfo.value = null;
        orgData.value = null;
        lastUpdated.value = 0;
    };

    return {
        userInfo,
        orgData,
        lastUpdated,
        fetchUserInfo,
        clearUserInfo,
    };
});