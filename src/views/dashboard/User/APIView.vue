<template>
    <div class="space-y-6">
        <!-- API Overview Card -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <div class="flex items-center">
                    <div class="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon icon="mdi:api" class="h-6 w-6 text-white" />
                    </div>
                    <div class="ml-4">
                        <h2 class="text-xl font-bold text-white">API Management</h2>
                        <p class="text-blue-100">Manage your API credentials for Team 695 services</p>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <div v-if="isLoading" class="flex justify-center py-8">
                    <Icon icon="mdi:loading" class="h-10 w-10 animate-spin text-blue-600" />
                </div>

                <div v-else-if="error" class="text-center py-6">
                    <div class="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon icon="mdi:alert-circle" class="h-10 w-10 text-red-500" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading API Information</h3>
                    <p class="text-gray-600 mb-6">{{ error }}</p>
                    <div class="flex justify-center space-x-4">
                        <button @click="retryFetchUserInfo"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Icon icon="mdi:refresh" class="h-4 w-4 mr-1" />
                            Retry
                        </button>
                    </div>
                </div>

                <div v-else>
                    <!-- API Documentation Link -->
                    <div
                        class="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="flex items-center">
                            <Icon icon="mdi:book-open-variant" class="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                                <h3 class="font-medium text-gray-900">API Documentation</h3>
                                <p class="text-sm text-gray-600">Learn how to use Team 695's API services</p>
                            </div>
                        </div>
                        <a href="https://api.team695.com/api-docs/" target="_blank"
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Icon icon="mdi:open-in-new" class="h-4 w-4 mr-1" />
                            View Docs
                        </a>
                    </div>

                    <div v-if="!userData.accessKey || !userData.accessSecret">
                        <!-- First Time API Key Creation Section -->
                        <div class="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <Icon icon="mdi:key-plus" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No API Keys Found</h3>
                            <p class="text-gray-600 mb-6 max-w-md mx-auto">
                                You don't have any API keys yet. Generate API keys to access Team 695's API
                                services.
                                Your API secret will only be shown once after creation.
                            </p>
                            <button @click="generateApiKeys"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
                                :disabled="isGeneratingKeys">
                                <Icon :icon="isGeneratingKeys ? 'mdi:loading' : 'mdi:key-plus'"
                                    :class="{ 'animate-spin': isGeneratingKeys }" class="h-5 w-5 mr-2" />
                                {{ isGeneratingKeys ? 'Generating...' : 'Generate New API Keys' }}
                            </button>
                        </div>
                    </div>

                    <div v-else class="space-y-6">
                        <!-- API Endpoint -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-3">API Endpoint</h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-sm font-medium text-gray-700">Base URL</label>
                                    <button @click="copyToClipboard('https://api.team695.com')"
                                        class="text-blue-600 hover:text-blue-500 text-sm flex items-center">
                                        <Icon icon="mdi:content-copy" class="h-4 w-4 mr-1" />
                                        Copy
                                    </button>
                                </div>
                                <div class="relative">
                                    <input type="text" readonly value="https://api.team695.com"
                                        class="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        <!-- API Credentials -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-3">API Credentials</h3>

                            <!-- Access Key -->
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-sm font-medium text-gray-700">Access Key</label>
                                    <button @click="copyToClipboard(userData.accessKey)"
                                        class="text-blue-600 hover:text-blue-500 text-sm flex items-center">
                                        <Icon icon="mdi:content-copy" class="h-4 w-4 mr-1" />
                                        Copy
                                    </button>
                                </div>
                                <div class="relative">
                                    <input type="text" readonly :value="userData.accessKey"
                                        class="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                            </div>

                            <!-- Access Secret -->
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-sm font-medium text-gray-700">Access Secret</label>
                                    <div class="flex items-center space-x-2">
                                        <button @click="toggleSecretVisibility"
                                            class="text-blue-600 hover:text-blue-500 text-sm flex items-center">
                                            <Icon :icon="showSecret ? 'mdi:eye-off' : 'mdi:eye'" class="h-4 w-4 mr-1" />
                                            {{ showSecret ? 'Hide' : 'Show' }}
                                        </button>
                                        <button @click="copyToClipboard(userData.accessSecret)"
                                            class="text-blue-600 hover:text-blue-500 text-sm flex items-center">
                                            <Icon icon="mdi:content-copy" class="h-4 w-4 mr-1" />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div class="relative">
                                    <input :type="showSecret ? 'text' : 'password'" readonly
                                        :value="userData.accessSecret"
                                        class="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        <!-- API Usage Example -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-3">Example API Request</h3>
                            <div class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
                                <pre
                                    class="text-xs"><code>curl -X GET "https://api.team695.com/auth/me" \
    -H "X-API-Key: {{ userData.accessKey || 'YOUR_ACCESS_KEY' }}" \
    -H "X-API-Secret: {{ showSecret ? (userData.accessSecret || 'YOUR_ACCESS_SECRET') : '************************' }}"</code></pre>
                            </div>
                        </div>

                        <!-- API Management -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-3">API Key Management</h3>
                            <div class="flex flex-wrap gap-4">
                                <button @click="confirmResetApiKeys"
                                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                                    :disabled="isGeneratingKeys">
                                    <Icon icon="mdi:key-remove" class="h-4 w-4 mr-2" />
                                    Reset API Keys
                                </button>
                            </div>

                            <!-- Reset Warning -->
                            <div class="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <Icon icon="mdi:alert" class="h-5 w-5 text-red-400" />
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm text-red-700">
                                            <strong>Warning:</strong> Resetting your API keys will invalidate
                                            any existing keys. All
                                            applications using these credentials will need to be updated.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Security Notice -->
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <Icon icon="mdi:shield-alert" class="h-5 w-5 text-yellow-400" />
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-yellow-800">Security Notice</h3>
                                    <p class="text-sm text-yellow-700 mt-1">
                                        Keep your API credentials secure. Never share your Access Secret or
                                        include it in client-side
                                        code. If you suspect your credentials have been compromised, reset them
                                        immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- API Keys Reset Confirmation Modal -->
        <div v-if="showResetConfirmModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div class="flex items-start">
                    <div class="flex-shrink-0 bg-red-100 rounded-full p-2">
                        <Icon icon="mdi:alert" class="h-6 w-6 text-red-600" />
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900">Reset API Keys?</h3>
                        <p class="mt-2 text-sm text-gray-500">
                            This action will permanently delete your current API keys. All applications using
                            these
                            credentials will stop working. Are you sure you want to continue?
                        </p>
                        <div class="mt-4 flex justify-end space-x-3">
                            <button @click="showResetConfirmModal = false"
                                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Cancel
                            </button>
                            <button @click="resetApiKeys"
                                class="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Reset Keys
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Notification Toast -->
        <div v-if="showToast"
            class="fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300"
            :class="toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
            {{ toastMessage }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';

export default defineComponent({
    name: 'APIView',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        const showSecret = ref(false);
        const isGeneratingKeys = ref(false);
        const showResetConfirmModal = ref(false);

        // Toast notification
        const showToast = ref(false);
        const toastMessage = ref('');
        const toastType = ref('success');

        // Use Pinia store
        const userStore = useUserStore();

        // Use storeToRefs to maintain reactivity
        const { userInfo } = storeToRefs(userStore);

        // Access other properties directly from the store
        const isLoading = computed(() => userStore.isLoading);
        const error = computed(() => userStore.error);

        // User data computed property
        const userData = computed(() => {
            return userInfo.value || {};
        });

        // Display toast notification
        const displayToast = (message: string, type: 'success' | 'error' = 'success') => {
            toastMessage.value = message;
            toastType.value = type;
            showToast.value = true;

            setTimeout(() => {
                showToast.value = false;
            }, 3000);
        };

        // Generate new API keys
        const generateApiKeys = async () => {
            try {
                isGeneratingKeys.value = true;

                // Ensure user is logged in
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Unauthorized: Please log in first');
                }

                // Call Team 695 API to generate new API keys
                const response = await fetch('https://api.team695.com/auth/api-keys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to generate API keys: ${response.statusText}`);
                }

                // Parse the response data
                const responseData = await response.json();

                if (!responseData.success) {
                    throw new Error(responseData.error || 'Failed to generate API keys');
                }

                // Update user information directly from the API response
                if (responseData.data) {
                    // Create a copy of the current user info
                    const updatedUserInfo = { ...userInfo.value };

                    // Update the access keys
                    updatedUserInfo.accessKey = responseData.data.accessKey;
                    updatedUserInfo.accessSecret = responseData.data.accessSecret;

                    // Update the store
                    await userStore.updateUserInfo(updatedUserInfo);
                }

                // Show success message
                displayToast(`Successfully generated new API keys!`);

            } catch (err) {
                console.error('Failed to generate API keys:', err);

                // Show error message
                displayToast(`Failed to generate API keys: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
            } finally {
                isGeneratingKeys.value = false;
            }
        };

        // Confirm reset API keys
        const confirmResetApiKeys = () => {
            showResetConfirmModal.value = true;
        };

        // Reset API keys
        const resetApiKeys = async () => {
            try {
                isGeneratingKeys.value = true;
                showResetConfirmModal.value = false;

                // Ensure user is logged in
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Unauthorized: Please log in first');
                }

                // Call Team 695 API to reset API keys
                const response = await fetch('https://api.team695.com/auth/api-keys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Reset failed: ${response.statusText}`);
                }

                // Parse the response data
                const responseData = await response.json();

                if (!responseData.success) {
                    throw new Error(responseData.error || 'Failed to reset API keys');
                }

                // Update user information directly from the API response
                if (responseData.data) {
                    // Create a copy of the current user info
                    const updatedUserInfo = { ...userInfo.value };

                    // Update the access keys
                    updatedUserInfo.accessKey = responseData.data.accessKey;
                    updatedUserInfo.accessSecret = responseData.data.accessSecret;

                    // Update the store
                    await userStore.updateUserInfo(updatedUserInfo);

                    // If we want to display the new keys in a more prominent way
                    displayToast(`API keys have been successfully reset! New keys are now active.`);
                } else {
                    displayToast('API keys have been successfully reset!');
                }

            } catch (err) {
                console.error('Failed to reset API keys:', err);

                // Show error message
                displayToast(`Failed to reset API keys: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
            } finally {
                isGeneratingKeys.value = false;
            }
        };

        // Toggle visibility of the API secret
        const toggleSecretVisibility = () => {
            showSecret.value = !showSecret.value;
        };

        // Copy text to clipboard
        const copyToClipboard = async (text: string) => {
            try {
                await navigator.clipboard.writeText(text);
                displayToast('Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                displayToast('Failed to copy to clipboard', 'error');
            }
        };

        // Retry fetching user info
        const retryFetchUserInfo = () => {
            userStore.refreshUserInfo();
        };

        onMounted(() => {
            // Check if user is logged in
            if (!casdoorService.isLoggedIn()) {
                router.push({ name: 'login' });
                return;
            }

            // Initialize the store - this will use cached data and refresh in background
            userStore.initializeStore();
        });

        return {
            userData,
            isLoading,
            error,
            showSecret,
            isGeneratingKeys,
            showResetConfirmModal,
            showToast,
            toastMessage,
            toastType,
            toggleSecretVisibility,
            copyToClipboard,
            retryFetchUserInfo,
            generateApiKeys,
            confirmResetApiKeys,
            resetApiKeys
        };
    }
});
</script>

<style scoped>
/* Toast notification transition */
.transition-opacity {
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
}

/* Custom scrollbar for code blocks */
pre {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

pre::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

pre::-webkit-scrollbar-track {
    background: transparent;
}

pre::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
}
</style>
