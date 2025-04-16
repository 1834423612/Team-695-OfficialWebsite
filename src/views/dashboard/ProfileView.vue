<template>
  <!-- <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"> -->
  <div class="min-h-screen bg-gray-50">
    <div class="px-4 py-6 max-w-4xl mx-auto">
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
        <Icon icon="mdi:loading" class="h-10 w-10 mx-auto animate-spin text-blue-600" />
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
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
              <div
                class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-4 border-2 border-blue-200">
                <!-- <img v-if="userData.avatar" :src="userData.avatar" alt="User Avatar" class="h-full w-full object-cover" /> -->
                <CachedAvatar v-if="userData.id" :userId="userData.id" :src="userData.avatar" :name="userData.name"
                  :firstName="userData.firstName" :lastName="userData.lastName" :displayName="userData.displayName"
                  :size="60" class="h-8 w-8" />
                <Icon v-else icon="mdi:account" class="h-10 w-10 text-blue-500" />
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
                  <Icon icon="mdi:account-outline" class="h-5 w-5 mr-2 text-blue-500" />
                  Username
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.name || 'Not set'
                  }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:card-account-details-outline" class="h-5 w-5 mr-2 text-blue-500" />
                  Display Name
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.displayName || 'Not set' }}</dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:email-outline" class="h-5 w-5 mr-2 text-blue-500" />
                  Email
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.email || 'Not set'
                  }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:identifier" class="h-5 w-5 mr-2 text-blue-500" />
                  ID
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.id || 'Not set' }}
                </dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:calendar-plus" class="h-5 w-5 mr-2 text-blue-500" />
                  Created Time
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{
                  formatDate(userData.createdTime) }}</dd>
              </div>
              <div class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:calendar-edit" class="h-5 w-5 mr-2 text-blue-500" />
                  Updated Time
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{
                  formatDate(userData.updatedTime) }}</dd>
              </div>
              <div class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:domain" class="h-5 w-5 mr-2 text-blue-500" />
                  Organization
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.owner || 'Not set'
                  }}</dd>
              </div>
              <div v-if="userData.countryCode"
                class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:earth" class="h-5 w-5 mr-2 text-blue-500" />
                  Country
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.countryCode }}</dd>
              </div>
              <div v-if="userData.signupApplication"
                class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:application" class="h-5 w-5 mr-2 text-blue-500" />
                  Signup Application
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{{ userData.signupApplication
                  }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div v-if="!userData.accessKey || !userData.accessSecret">
          <!-- First Time API Key Creation Section -->
          <div class="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg overflow-hidden mb-6">
            <div class="px-6 py-6 md:p-8">
              <div class="flex items-center mb-4">
                <div class="h-12 w-12 rounded-full bg-white flex items-center justify-center mr-4">
                  <Icon icon="mdi:api" class="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Create Your API Keys</h3>
                  <p class="text-blue-100">Generate API keys to access Team 695's API services</p>
                </div>
              </div>

              <div class="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-sm">
                <p class="text-white mb-4">
                  You don't have any API keys yet. API keys allow your applications to authenticate with Team 695's API
                  services.
                  Once created, you'll be able to perform authorized requests to our API endpoints.
                </p>
                <div class="flex items-center space-x-2 mb-4 text-blue-100 text-sm">
                  <Icon icon="mdi:shield-lock" class="h-5 w-5" />
                  <span>Your API secret will only be shown once after creation. Make sure to store it securely.</span>
                </div>
                <div class="mt-6 flex justify-end">
                  <button @click="generateApiKeys"
                    class="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                    :disabled="isGeneratingKeys">
                    <Icon :icon="isGeneratingKeys ? 'mdi:loading' : 'mdi:key-plus'"
                      :class="{'animate-spin': isGeneratingKeys}" class="h-5 w-5 mr-2" />
                    {{ isGeneratingKeys ? 'Generating...' : 'Generate New API Keys' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <!-- API Keys Card -->
          <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div class="px-6 py-5 sm:px-8 border-b border-gray-200">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Icon icon="mdi:api" class="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 class="text-lg leading-6 font-bold text-gray-900">API Credentials</h3>
                  <p class="mt-1 text-sm text-gray-500">Your API keys for accessing Team 695 API services</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 p-6">
              <div class="mb-6">
                <p class="text-sm text-gray-500 mb-4">
                  Use these credentials to authenticate with the Team 695 API. Keep your API Secret secure and never
                  share it publicly.
                </p>

                <!-- API Endpoint -->
                <div class="bg-gray-50 rounded-md p-4 mb-4 border border-gray-200 shadow-inner">
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">API Endpoint</label>
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
                  <div class="mt-2 flex space-x-2">
                    <a href="https://api.team695.com/" target="_blank"
                      class="text-xs text-blue-600 hover:text-blue-500 flex items-center">
                      <Icon icon="mdi:web" class="h-3 w-3 mr-1" />
                      Visit API
                    </a>
                    <span class="text-gray-300">|</span>
                    <a href="https://api.team695.com/api-docs/" target="_blank"
                      class="text-xs text-blue-600 hover:text-blue-500 flex items-center">
                      <Icon icon="mdi:book-open-variant" class="h-3 w-3 mr-1" />
                      API Documentation
                    </a>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <!-- Access Key -->
                <div class="bg-gray-50 rounded-md p-4 border border-gray-200 shadow-inner">
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
                <div class="bg-gray-50 rounded-md p-4 border border-gray-200 shadow-inner">
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
                    <input :type="showSecret ? 'text' : 'password'" readonly :value="userData.accessSecret"
                      class="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                <!-- API Management Buttons -->
                <div class="flex flex-wrap gap-4 mt-6">
                  <button @click="confirmResetApiKeys"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200"
                    :disabled="isGeneratingKeys">
                    <Icon icon="mdi:delete" class="h-4 w-4 mr-2" />
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
                        <strong>Warning:</strong> Resetting your API keys will invalidate any existing keys. All
                        applications using these credentials will need to be updated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- API Usage Example -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Example API Request</h4>
                <div class="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                  <pre
                    class="text-xs"><code>curl -X GET "https://api.team695.com/auth/me" \
  -H "X-API-Key: {{ userData.accessKey || 'YOUR_ACCESS_KEY' }}" \
  -H "X-API-Secret: {{ showSecret ? (userData.accessSecret || 'YOUR_ACCESS_SECRET') : '************************' }}"</code></pre>
                </div>
              </div>

              <!-- API Security Notice -->
              <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <Icon icon="mdi:shield-alert" class="h-5 w-5 text-yellow-400" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-yellow-700">
                      Keep your API credentials secure. Never share your Access Secret or include it in client-side
                      code.
                      If you suspect your credentials have been compromised, reset them immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Google Authentication Card -->
        <div
          v-if="userData.google || (userData.properties && Object.keys(userData.properties).some(key => key.startsWith('oauth_Google')))"
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

              <div
                v-if="userData.properties && Object.keys(userData.properties).some(key => key.startsWith('oauth_Google'))"
                class="bg-white px-6 py-4 sm:px-8 m-2">
                <details class="w-full">
                  <summary
                    class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none flex items-center">
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
              <div v-if="orgData.websiteUrl"
                class="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
                <dt class="text-sm font-medium text-gray-500 flex items-center">
                  <Icon icon="mdi:web" class="h-5 w-5 mr-2 text-blue-500" />
                  Website
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  <a :href="orgData.websiteUrl" target="_blank" class="text-blue-600 hover:text-blue-500">
                    {{ orgData.websiteUrl }}
                  </a>
                </dd>
              </div>
              <div v-if="orgData.logo"
                class="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 rounded-md m-2">
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
              <summary
                class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none px-6 py-4 sm:px-8 flex items-center">
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

        <div v-if="!isLoading && !error && isDev" class="bg-white shadow rounded-lg overflow-hidden mb-6">
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
              <summary
                class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none px-6 py-4 sm:px-8 flex items-center">
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
              This action will permanently delete your current API keys. All applications using these credentials will
              stop working.
              Are you sure you want to continue?
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
    <div v-if="showToast" class="fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300"
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
import CachedAvatar from '@/components/common/CachedAvatar.vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ProfileView',
  components: {
    Icon,
    CachedAvatar
  },
  setup() {
    const router = useRouter();
    const casdoorUrl = 'https://sso.team695.com';
    const showSecret = ref(false);
    const isGeneratingKeys = ref(false);
    const showResetConfirmModal = ref(false);
    
    // Toast notification
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastType = ref('success');

    // Check if in development mode
    const isDev = import.meta.env.DEV;

    // Use Pinia store
    const userStore = useUserStore();
    
    // Use storeToRefs to maintain reactivity
    const { userInfo, orgData } = storeToRefs(userStore);
    
    // Access other properties directly from the store
    const isLoading = computed(() => userStore.isLoading);
    const error = computed(() => userStore.error);

    // User data computed property
    const userData = computed(() => {
      return userInfo.value || {};
    });

    // Compute Google-related properties
    const googleProperties = computed(() => {
      if (!userData.value.properties) return {};
      
      return Object.entries(userData.value.properties)
        .filter(([key]) => key.startsWith('oauth_Google'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    });
    
    // Compute non-Google properties
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
        displayToast(`Successfully generated new API keys! ${responseData.data?.message || ''}`);
        
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

    // Logout function
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
      showSecret,
      isGeneratingKeys,
      showResetConfirmModal,
      showToast,
      toastMessage,
      toastType,
      formatPropertyKey,
      formatDate,
      toggleSecretVisibility,
      copyToClipboard,
      retryFetchUserInfo,
      logout,
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