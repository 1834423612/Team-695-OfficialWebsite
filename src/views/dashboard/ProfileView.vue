<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
        <p class="mt-1 text-sm text-gray-500">
          View and manage your account information
        </p>
      </div>

      <!-- Help Card -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="px-6 py-6 md:p-8 md:flex md:items-center md:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Need help with your account?</h3>
            <p class="mt-2 text-blue-100">
              If you need to update your profile information or have questions about your account,
              please contact an administrator or visit the Casdoor portal.
            </p>
          </div>
          <div class="mt-4 md:mt-0 md:ml-6">
            <a :href="`${casdoorUrl}/login/Team695`" target="_blank"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap">
              <Icon icon="mdi:open-in-new" class="h-4 w-4 mr-1 flex-shrink-0" />
              <span class="truncate">Visit Casdoor Portal</span>
            </a>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <Icon icon="mdi:loading" class="h-10 w-10 mx-auto animate-spin text-indigo-600" />
        <p class="mt-4 text-gray-600">Loading user information...</p>
      </div>

      <div v-else-if="error" class="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div class="text-center py-6">
          <div class="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:alert-circle" class="h-10 w-10 text-red-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <div class="flex justify-center space-x-4">
            <button @click="retryFetchUserInfo"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Icon icon="mdi:refresh" class="h-4 w-4 mr-1" />
              Retry
            </button>
            <button @click="logout"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <Icon icon="mdi:logout" class="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- User Profile Card -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 sm:px-8 flex flex-wrap justify-between items-center border-b border-gray-200">
            <div class="flex items-center">
              <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4 border-2 border-indigo-200">
                <img v-if="userData.avatar" :src="userData.avatar" alt="User Avatar" class="h-full w-full object-cover" />
                <Icon v-else icon="mdi:account" class="h-10 w-10 text-indigo-500" />
              </div>
              <div>
                <h3 class="text-xl leading-6 font-bold text-gray-900">{{ userData.displayName || userData.name }}</h3>
                <p class="mt-1 text-sm text-gray-500 flex items-center">
                  <Icon icon="mdi:email-outline" class="h-4 w-4 mr-1" />
                  {{ userData.email || 'No email provided' }}
                </p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <button @click="logout"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-md">
                <Icon icon="mdi:logout" class="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:account-outline" class="h-5 w-5 mr-2 text-indigo-500" />
                  Username
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.name || 'Not set' }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:card-account-details-outline" class="h-5 w-5 mr-2 text-indigo-500" />
                  Display Name
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.displayName || 'Not set' }}</dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:email-outline" class="h-5 w-5 mr-2 text-indigo-500" />
                  Email
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.email || 'Not set' }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:identifier" class="h-5 w-5 mr-2 text-indigo-500" />
                  ID
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.id || 'Not set' }}</dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:calendar-plus" class="h-5 w-5 mr-2 text-indigo-500" />
                  Created Time
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ formatDate(userData.createdTime) }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:calendar-edit" class="h-5 w-5 mr-2 text-indigo-500" />
                  Updated Time
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ formatDate(userData.updatedTime) }}</dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:domain" class="h-5 w-5 mr-2 text-indigo-500" />
                  Organization
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.owner || 'Not set' }}</dd>
              </div>
              <div v-if="userData.countryCode" class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:earth" class="h-5 w-5 mr-2 text-indigo-500" />
                  Country
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.countryCode }}</dd>
              </div>
              <div v-if="userData.signupApplication" class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:application" class="h-5 w-5 mr-2 text-indigo-500" />
                  Signup Application
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.signupApplication }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Google Authentication Card -->
        <div v-if="userData.google || (userData.properties && Object.keys(userData.properties).some(key => key.startsWith('oauth_Google')))"
          class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 sm:px-8 border-b border-gray-200">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <Icon icon="mdi:google" class="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 class="text-lg leading-6 font-bold text-gray-900">Google Account Linked</h3>
                <p class="mt-1 text-sm text-gray-500">Your account is connected to Google for secure authentication</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:identifier" class="h-5 w-5 mr-2 text-red-500" />
                  Google ID
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.google || 'Not available' }}</dd>
              </div>

              <div v-if="userData.properties && Object.keys(userData.properties).some(key => key.startsWith('oauth_Google'))"
                class="bg-white px-6 py-4 sm:px-8 m-2">
                <details class="w-full">
                  <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none flex items-center">
                    <Icon icon="mdi:information-outline" class="h-5 w-5 mr-2" />
                    View Google Account Details
                    <Icon icon="mdi:chevron-down" class="ml-2 h-4 w-4" />
                  </summary>
                  <div class="mt-4 border border-gray-200 rounded-md overflow-hidden">
                    <dl>
                      <div v-for="(value, key, index) in googleProperties" :key="key"
                        :class="{'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1}"
                        class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">{{ formatPropertyKey(key) }}</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div v-if="key.includes('avatarUrl') || key.includes('picture')">
                            <img :src="value" alt="Google Avatar" class="h-10 w-10 rounded-full" />
                          </div>
                          <div v-else>{{ value }}</div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </details>
              </div>
            </dl>
          </div>
        </div>

        <!-- Organization Info Card -->
        <div v-if="orgData" class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 sm:px-8 border-b border-gray-200">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Icon icon="mdi:office-building" class="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 class="text-lg leading-6 font-bold text-gray-900">Organization Information</h3>
                <p class="mt-1 text-sm text-gray-500">Details about your organization</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:domain" class="h-5 w-5 mr-2 text-blue-500" />
                  Organization Name
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ orgData.name }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:card-account-details-outline" class="h-5 w-5 mr-2 text-blue-500" />
                  Display Name
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ orgData.displayName }}</dd>
              </div>
              <div v-if="orgData.websiteUrl" class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:web" class="h-5 w-5 mr-2 text-blue-500" />
                  Website
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  <a :href="orgData.websiteUrl" target="_blank" class="text-indigo-600 hover:text-indigo-500">
                    {{ orgData.websiteUrl }}
                  </a>
                </dd>
              </div>
              <div v-if="orgData.logo" class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:image" class="h-5 w-5 mr-2 text-blue-500" />
                  Logo
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <img :src="orgData.logo" alt="Organization Logo" class="h-12 object-contain" />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Properties Card -->
        <div v-if="userData.properties && Object.keys(otherProperties).length > 0"
          class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 sm:px-8 border-b border-gray-200">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Icon icon="mdi:puzzle" class="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 class="text-lg leading-6 font-bold text-gray-900">Additional Properties</h3>
                <p class="mt-1 text-sm text-gray-500">Other information associated with your account</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <details class="w-full">
              <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none px-6 py-4 sm:px-8 flex items-center">
                <Icon icon="mdi:information-outline" class="h-5 w-5 mr-2" />
                View All Properties
                <Icon icon="mdi:chevron-down" class="ml-2 h-4 w-4" />
              </summary>
              <div class="border-t border-gray-200">
                <dl>
                  <div v-for="(value, key, index) in otherProperties" :key="key"
                    :class="{'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1}"
                    class="px-6 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
                    <dt class="text-sm font-medium text-gray-500">{{ key }}</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ value }}</dd>
                  </div>
                </dl>
              </div>
            </details>
          </div>
        </div>

        <div v-if="!isLoading && !error && isDev"
          class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 sm:px-8 border-b border-gray-200">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <Icon icon="mdi:code-json" class="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h3 class="text-lg leading-6 font-bold text-gray-900">Debug Information</h3>
                <p class="mt-1 text-sm text-gray-500">Raw user data (development mode only)</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <details class="w-full">
              <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none px-6 py-4 sm:px-8 flex items-center">
                <Icon icon="mdi:code-braces" class="h-5 w-5 mr-2" />
                View Raw Data
                <Icon icon="mdi:chevron-down" class="ml-2 h-4 w-4" />
              </summary>
              <div class="border-t border-gray-200 p-4">
                <pre class="text-xs overflow-auto bg-gray-100 p-4 rounded">{{ JSON.stringify(userInfo, null, 2) }}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ProfileView',
  components: {
    Icon
  },
  setup() {
    const router = useRouter();
    const casdoorUrl = 'https://sso.team695.com';

    // Check if in development mode
    const isDev = import.meta.env.DEV;

    // Use the Pinia store
    const userStore = useUserStore();
    
    // Use storeToRefs to maintain reactivity
    const { userInfo, orgData } = storeToRefs(userStore);
    
    // Access other properties directly from the store
    const isLoading = computed(() => userStore.isLoading);
    const error = computed(() => userStore.error);

    // Computed property for user data
    const userData = computed(() => {
      return userInfo.value || {};
    });

    // Computed property to get Google-related properties
    const googleProperties = computed(() => {
      if (!userData.value.properties) return {};
      
      return Object.entries(userData.value.properties)
        .filter(([key]) => key.startsWith('oauth_Google'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    });
    
    // Computed property to get non-Google properties
    const otherProperties = computed(() => {
      if (!userData.value.properties) return {};
      
      return Object.entries(userData.value.properties)
        .filter(([key]) => !key.startsWith('oauth_Google'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    });

    // Format property keys for display
    const formatPropertyKey = (key: string) => {
      if (key.startsWith('oauth_Google_')) {
        return key.replace('oauth_Google_', '');
      }
      return key;
    };
    
    // Format date for display
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Not set';
      
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(date);
      } catch (e) {
        return dateString;
      }
    };

    const retryFetchUserInfo = () => {
      userStore.refreshUserInfo();
    };

    const logout = () => {
      casdoorService.logout();
      userStore.clearUserInfo(); // Clear user info in the store
      router.push({ name: 'login' }).catch(err => {
        console.error('Failed to navigate to login:', err);
      });
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
      userInfo,
      userData,
      orgData,
      isLoading,
      error,
      isDev,
      casdoorUrl,
      googleProperties,
      otherProperties,
      formatPropertyKey,
      formatDate,
      retryFetchUserInfo,
      logout
    };
  }
});
</script>