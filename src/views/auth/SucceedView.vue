<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
    <h2 class="text-3xl font-extrabold text-gray-900">Login Successful</h2>
    <p class="mt-2 text-lg text-gray-600">
      You have successfully authenticated with Casdoor.
    </p>
  </div>

  <div v-if="loading" class="text-center py-10">
    <Icon icon="mdi:loading" class="h-10 w-10 mx-auto animate-spin text-indigo-600" />
    <p class="mt-4 text-gray-600">Loading user information...</p>
  </div>

  <div v-else-if="error" class="text-center py-10 text-red-500">
    <Icon icon="mdi:alert-circle" class="h-10 w-10 mx-auto text-red-500" />
    <p class="mt-4">{{ error }}</p>
    <button 
      @click="retryFetchUserInfo" 
      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Retry
    </button>
    <button 
      @click="logout" 
      class="mt-4 ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
    >
      Logout
    </button>
  </div>

  <div v-else>
    <!-- User Profile Card -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div class="flex items-center">
          <img 
            v-if="userInfo.avatar" 
            :src="userInfo.avatar" 
            alt="User Avatar" 
            class="h-16 w-16 rounded-full mr-4 object-cover border-2 border-indigo-200"
          />
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">{{ userInfo.displayName || userInfo.name }}</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ userInfo.email }}</p>
          </div>
        </div>
        <!-- <div class="relative">
          <button 
            @click="toggleDropdown" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Icon icon="mdi:logout" class="mr-2 h-4 w-4" />
            Logout
            <Icon icon="mdi:chevron-down" class="ml-2 h-4 w-4" />
          </button>
          <div v-show="dropdownVisible" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <button 
              @click="logout" 
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout Locally
            </button>
            <button 
              @click="logoutCasdoor" 
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout from Casdoor
            </button>
          </div>
        </div> -->
        <div class="relative">
          <button 
            @click="logout" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Icon icon="mdi:logout" class="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
          
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Username</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.name || 'Not set' }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Display Name</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.displayName || 'Not set' }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.email || 'Not set' }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">ID</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.id || 'Not set' }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Created Time</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(userInfo.createdTime) }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Updated Time</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(userInfo.updatedTime) }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Organization</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.owner || 'Not set' }}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Google Authentication Card -->
        <div v-if="userInfo.google" class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:px-6">
            <div class="flex items-center">
              <Icon icon="mdi:google" class="h-6 w-6 text-red-500 mr-2" />
              <h3 class="text-lg leading-6 font-medium text-gray-900">Google Account Linked</h3>
            </div>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Your account is linked to a Google account.</p>
          </div>
          
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Google ID</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userInfo.google }}</dd>
              </div>
              
              <div v-if="userInfo.properties && Object.keys(userInfo.properties).some(key => key.startsWith('oauth_Google'))" class="bg-white px-4 py-5 sm:px-6">
                <details class="w-full">
                  <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
                    View Google Account Details
                  </summary>
                  <div class="mt-4 border border-gray-200 rounded-md overflow-hidden">
                    <dl>
                      <div v-for="(value, key, index) in googleProperties" :key="key" 
                           :class="{'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1}"
                           class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">{{ formatPropertyKey(key) }}</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div v-if="key.includes('avatarUrl')">
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
        
        <!-- Properties Card -->
        <div v-if="userInfo.properties && Object.keys(userInfo.properties).length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Other Properties</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Additional user properties.</p>
          </div>
          
          <div class="border-t border-gray-200">
            <details class="w-full">
              <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none px-4 py-3">
                View All Properties
              </summary>
              <div class="border-t border-gray-200">
                <dl>
                  <div v-for="(value, key, index) in otherProperties" :key="key" 
                       :class="{'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1}"
                       class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">{{ key }}</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ value }}</dd>
                  </div>
                </dl>
              </div>
            </details>
          </div>
        </div>

        <div v-if="!loading && !error && isDev" class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Debug Information</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Raw user data</p>
          </div>
        
          <div class="border-t border-gray-200">
            <!-- open -->
            <details class="w-full">
              <summary class="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none px-4 py-3">
                View Raw Data
              </summary>
              <div class="border-t border-gray-200 p-4">
                <pre class="text-xs overflow-auto bg-gray-100 p-2 rounded">{{ JSON.stringify(userInfo, null, 2) }}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService, UserInfo } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'SucceedView',
  components: {
    Icon
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref('');
    const userInfo = ref<UserInfo>({
      id: '',
      name: '',
      email: '',
      owner: ''
    });
    const dropdownVisible = ref(false);

    // Check if in development mode
    const isDev = import.meta.env.DEV;

    // Computed property to get Google-related properties
    const googleProperties = computed(() => {
      if (!userInfo.value.properties) return {};
      
      return Object.entries(userInfo.value.properties)
        .filter(([key]) => key.startsWith('oauth_Google'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    });
    
    // Computed property to get non-Google properties
    const otherProperties = computed(() => {
      if (!userInfo.value.properties) return {};
      
      return Object.entries(userInfo.value.properties)
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

    const fetchUserInfo = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // Get user info
        const userData = await casdoorService.getUserInfo();
        // console.log('Raw user data from service:', userData);
        
        // Make sure we're getting all properties
        userInfo.value = { ...userData };
        
        // console.log('User info after assignment:', userInfo.value);
        loading.value = false;
      } catch (err: any) {
        console.error('Error loading user info:', err);
        error.value = err.message || 'Failed to load user information';
        loading.value = false;
      }
    };

    const retryFetchUserInfo = () => {
      fetchUserInfo();
    };

    const logout = () => {
      casdoorService.logout();
      router.push({ name: 'login' }).catch(err => {
        console.error('Failed to navigate to login:', err);
      });
    };

    const logoutCasdoor = async () => {
      const originalError = error.value;
      try {
        await casdoorService.revokeToken();
        router.push({ name: 'login' }).catch(err => {
          if (import.meta.env.DEV) {
            console.error('Failed to navigate to login:', err);
          }
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Failed to revoke token:', err);
        }
        error.value = 'Failed to revoke login session. Please try again.';
        // Reset error after 5 seconds
        setTimeout(() => {
          error.value = originalError;
        }, 5000);
      }
    };

    const toggleDropdown = () => {
      dropdownVisible.value = !dropdownVisible.value;
    };

    onMounted(async () => {
      // Check if user is logged in
      if (!casdoorService.isLoggedIn()) {
        router.push({ name: 'login' });
        return;
      }
      
      await fetchUserInfo();
    });

    return {
      userInfo,
      loading,
      error,
      isDev,
      googleProperties,
      otherProperties,
      formatPropertyKey,
      formatDate,
      retryFetchUserInfo,
      logout,
      logoutCasdoor,
      toggleDropdown,
      dropdownVisible
    };
  }
});
</script>