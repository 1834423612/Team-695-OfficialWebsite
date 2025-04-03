<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Welcome Banner -->
    <div class="px-4 py-6 sm:px-0 mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">
              Welcome back, {{ userData.firstName || userData.displayName || (userData.name ?
              userData.name.split('@')[0] : 'User') }}!
            </h2>
            <p class="mt-2 text-blue-100">
              {{ new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day:
              'numeric' }) }}
            </p>
          </div>
          <div class="mt-4 md:mt-0 md:ml-6">
            <router-link to="/dashboard/profile"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              View Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Section -->
    <div class="px-4 sm:px-0 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Version Info</h2>
      <div class="bg-rose-50 border-rose-200 border-2 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div class="p-5 flex items-start sm:items-center">
          <!-- Icon -->
          <div class="flex-shrink-0 sm:p-2">
            <Icon icon="line-md:bell-filled" class="h-6 w-6 text-rose-500 sm:h-8 sm:w-8" />
          </div>
          <!-- Text Content -->
          <div class="flex flex-col">
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-gray-900 sm:text-lg">
                <span class="block text-md sm:text-lg font-semibold">Current Version:</span>
                <span class="ml-0 mt-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md inline-block">
                  Beta_PR_feat-DB_0.3.15
                </span>
              </h3>
            </div>
            <p class="ml-3 text-xs sm:text-sm sm:font-medium text-gray-500 mt-2">
              Features marked with a <Icon icon="ic:round-lock" class="inline h-4 w-4 text-gray-600 sm:h-5 sm:w-5" /> icon are under development.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Tools Section -->
    <div class="px-4 sm:px-0 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Tools</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Regular User Tools -->
        <a href="https://scoutify.team695.com"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Icon icon="mdi:robot" class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">Scouting App</h3>
                <p class="text-sm text-gray-500">Record and analyze match data</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
          </div>
        </a>

        <router-link to="/dashboard/Pit-Scouting"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Icon icon="mdi:clipboard-text" class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">Pit Scouting</h3>
                <p class="text-sm text-gray-500">Record other teams' robot data</p>
              </div>
            </div>
          </div>
        </router-link>

        <!-- <a href="#" class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Icon icon="mdi:calendar-check" class="h-6 w-6 text-green-600" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Event Schedule</h3>
                  <p class="text-sm text-gray-500">View upcoming competitions and meetings</p>
                </div>
              </div>
            </div>
          </a>

          <a href="#" class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <Icon icon="mdi:robot" class="h-6 w-6 text-purple-600" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Robot Status</h3>
                  <p class="text-sm text-gray-500">Check build and maintenance status</p>
                </div>
              </div>
            </div>
          </a> -->
      </div>
    </div>

    <!-- Admin Tools Section (only visible to admins) -->
    <template v-if="userData.isAdmin">
      <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Admin Tools</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Pit Scouting Dashboard -->
          <router-link to="/dashboard/Pit-Scouting/Admin"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Icon icon="mingcute:list-search-fill" class="h-6 w-6 text-green-600" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Pit Scouting Dashboard</h3>
                  <p class="text-sm text-gray-500">Manage and view pit scouting data</p>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Disabled Admin Tools -->
          <a href="#" class="relative bg-gray-100 overflow-hidden shadow rounded-lg transition-shadow duration-300 cursor-not-allowed pointer-events-none">
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-red-50 rounded-md p-3">
                  <Icon icon="mdi:account-cog" class="h-6 w-6 text-red-300" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-400">User Management</h3>
                  <p class="text-sm text-gray-400">This feature is currently disabled</p>
                </div>
              </div>
              <Icon icon="ic:round-lock" class="h-5 w-5 text-gray-400" />
            </div>
            <!-- Overlay for tooltip -->
            <div
              class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-center text-white text-sm font-medium opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
              This feature is disabled
            </div>
          </a>
          
          <a href="#" class="relative bg-gray-100 overflow-hidden shadow rounded-lg transition-shadow duration-300 cursor-not-allowed pointer-events-none">
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-amber-50 rounded-md p-3">
                  <Icon icon="mdi:chart-box" class="h-6 w-6 text-amber-300" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-400">Analytics Dashboard</h3>
                  <p class="text-sm text-gray-400">This feature is currently disabled</p>
                </div>
              </div>
              <Icon icon="ic:round-lock" class="h-5 w-5 text-gray-400" />
            </div>
            <!-- Overlay for tooltip -->
            <div
              class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-center text-white text-sm font-medium opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
              This feature is disabled
            </div>
          </a>
          
          <a href="#" class="relative bg-gray-100 overflow-hidden shadow rounded-lg transition-shadow duration-300 cursor-not-allowed pointer-events-none">
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-teal-50 rounded-md p-3">
                  <Icon icon="mdi:cog" class="h-6 w-6 text-teal-300" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-400">System Settings</h3>
                  <p class="text-sm text-gray-400">This feature is currently disabled</p>
                </div>
              </div>
              <Icon icon="ic:round-lock" class="h-5 w-5 text-gray-400" />
            </div>
            <!-- Overlay for tooltip -->
            <div
              class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-center text-white text-sm font-medium opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
              This feature is disabled
            </div>
          </a>
        </div>
      </div>
    </template>

    <!-- External Tools Section -->
    <div class="px-4 sm:px-0 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Collaboration</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a href="https://drive.google.com/drive/folders/1Ehs5S7caHxQLihE2vXQyYMsLqS4g5mDp" target="_blank"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-50 rounded-md p-3">
                <Icon icon="mdi:google-drive" class="h-6 w-6 text-blue-500" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">Google Drive</h3>
                <p class="text-sm text-gray-500">Team documents and files</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
          </div>
        </a>

        <a href="https://team695.slack.com" target="_blank"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-50 rounded-md p-3">
                <Icon icon="mdi:slack" class="h-6 w-6 text-purple-500" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">Slack</h3>
                <p class="text-sm text-gray-500">Team communication</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
          </div>
        </a>

        <a href="https://clickup.com" target="_blank"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-orange-50 rounded-md p-3">
                <Icon icon="lineicons:clickup" class="h-6 w-6 text-orange-500" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">ClickUp</h3>
                <p class="text-sm text-gray-500">TODO/Task management</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
          </div>
        </a>

        <a href="https://github.com" target="_blank"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-gray-50 rounded-md p-3">
                <Icon icon="mdi:github" class="h-6 w-6 text-gray-800" />
              </div>
              <div class="ml-5">
                <h3 class="text-lg font-medium text-gray-900">GitHub</h3>
                <p class="text-sm text-gray-500">Code repository</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
          </div>
        </a>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="px-4 sm:px-0 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Stats</h2>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Disabled Placeholder -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-50 border border-gray-300 shadow-lg rounded-lg flex items-center justify-center p-8">
          <div class="flex flex-col justify-center items-center text-center">
            <Icon icon="fa6-solid:code" class="h-12 w-12 text-gray-500 mb-4" />
            <h3 class="text-xl font-semibold text-gray-600">This section is under construction</h3>
            <p class="text-sm text-gray-500 mt-2">Will be available soon!</p>
          </div>
        </div>

        <!-- Example Stats Cards -->
        <!-- <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Icon icon="mdi:calendar" class="h-6 w-6 text-indigo-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">3</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Icon icon="mdi:account-group" class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">42</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Icon icon="mdi:trophy" class="h-6 w-6 text-yellow-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Season Rank</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">#12</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
                <Icon icon="mdi:clock" class="h-6 w-6 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Days Until Competition</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">18</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="px-4 sm:px-0 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">

          <!-- Disabled Placeholder -->
          <div class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-50 border border-gray-300 shadow-lg rounded-lg flex items-center justify-center p-8">
            <div class="flex flex-col justify-center items-center text-center">
              <Icon icon="fa6-solid:code" class="h-12 w-12 text-gray-500 mb-4" />
              <h3 class="text-xl font-semibold text-gray-600">This section is under construction</h3>
              <p class="text-sm text-gray-500 mt-2">Will be available soon!</p>
            </div>
          </div>

          <!-- Example Activity Items List -->
          <!-- <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon icon="mdi:file-document" class="h-5 w-5 text-blue-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-blue-600">New scouting report submitted</p>
                    <p class="text-sm text-gray-500">Match #42 - Team 254 vs Team 1114</p>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    2 hours ago
                  </p>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Icon icon="mdi:calendar-plus" class="h-5 w-5 text-purple-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-blue-600">Team meeting scheduled</p>
                    <p class="text-sm text-gray-500">Strategy session - Tomorrow at 4:00 PM</p>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Yesterday
                  </p>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon icon="mdi:robot" class="h-5 w-5 text-green-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-blue-600">Robot maintenance completed</p>
                    <p class="text-sm text-gray-500">Drivetrain and shooter mechanisms updated</p>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    3 days ago
                  </p>
                </div>
              </div>
            </div>
          </li> -->
        </ul>
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
name: 'HomeView',
components: {
  Icon
},
setup() {
  const router = useRouter();
  
  // Use the Pinia store
  const userStore = useUserStore();
  
  // Use storeToRefs to maintain reactivity
  // Only destructure what we need to avoid TypeScript errors
  const { userInfo, orgData } = storeToRefs(userStore);
  
  // Access other properties directly from the store
  const storeIsLoading = computed(() => userStore.isLoading);
  const storeError = computed(() => userStore.error);

  // Computed property for user data
  const userData = computed(() => {
    return userInfo.value || {};
  });

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

    // Initialize the store only if not already initialized
    // This prevents redundant API calls during navigation
    userStore.initializeStore();
  });

  return {
    userData,
    orgData,
    isLoading: storeIsLoading,
    error: storeError,
    logout
  };
}
});
</script>