<template>
  <div class="min-h-screen bg-gray-50">
      <!-- Welcome Banner -->
      <div class="px-4 py-6 sm:px-0 mb-6">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
          <div class="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-white">
                Welcome back, {{ userData.displayName || (userData.name ? userData.name.split('@')[0] : 'User') }}!
              </h2>
              <p class="mt-2 text-blue-100">
                {{ new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day:
                'numeric' }) }}
              </p>
            </div>
            <div class="mt-4 md:mt-0 md:ml-6">
              <router-link to="/profile"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                View Profile
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Tools Section -->
      <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Tools</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Regular User Tools -->
          <a href="#" class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Icon icon="mdi:clipboard-text" class="h-6 w-6 text-blue-600" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Scouting App</h3>
                  <p class="text-sm text-gray-500">Record and analyze match data</p>
                </div>
              </div>
            </div>
          </a>

          <a href="#" class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
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
          </a>

          <!-- Admin Tools (only visible to admins) -->
          <template v-if="userData.isAdmin">
            <a href="#"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <Icon icon="mdi:account-cog" class="h-6 w-6 text-red-600" />
                  </div>
                  <div class="ml-5">
                    <h3 class="text-lg font-medium text-gray-900">User Management</h3>
                    <p class="text-sm text-gray-500">Manage team member accounts</p>
                  </div>
                </div>
              </div>
            </a>

            <a href="#"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-amber-100 rounded-md p-3">
                    <Icon icon="mdi:chart-box" class="h-6 w-6 text-amber-600" />
                  </div>
                  <div class="ml-5">
                    <h3 class="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                    <p class="text-sm text-gray-500">View team performance metrics</p>
                  </div>
                </div>
              </div>
            </a>

            <a href="#"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-teal-100 rounded-md p-3">
                    <Icon icon="mdi:cog" class="h-6 w-6 text-teal-600" />
                  </div>
                  <div class="ml-5">
                    <h3 class="text-lg font-medium text-gray-900">System Settings</h3>
                    <p class="text-sm text-gray-500">Configure application settings</p>
                  </div>
                </div>
              </div>
            </a>
          </template>
        </div>
      </div>

      <!-- External Tools Section -->
      <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Collaboration</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="https://drive.google.com" target="_blank"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-50 rounded-md p-3">
                  <Icon icon="mdi:google-drive" class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Google Drive</h3>
                  <p class="text-sm text-gray-500">Team documents and files</p>
                </div>
              </div>
            </div>
          </a>

          <a href="https://slack.com" target="_blank"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-50 rounded-md p-3">
                  <Icon icon="mdi:slack" class="h-6 w-6 text-purple-500" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">Slack</h3>
                  <p class="text-sm text-gray-500">Team communication</p>
                </div>
              </div>
            </div>
          </a>

          <a href="https://clickup.com" target="_blank"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-50 rounded-md p-3">
                  <Icon icon="mdi:check-circle" class="h-6 w-6 text-green-500" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">ClickUp</h3>
                  <p class="text-sm text-gray-500">Project management</p>
                </div>
              </div>
            </div>
          </a>

          <a href="https://github.com" target="_blank"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-gray-50 rounded-md p-3">
                  <Icon icon="mdi:github" class="h-6 w-6 text-gray-800" />
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-medium text-gray-900">GitHub</h3>
                  <p class="text-sm text-gray-500">Code repository</p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Quick Stats Section -->
      <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Stats</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white overflow-hidden shadow rounded-lg">
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
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li>
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
                    <p
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
                    <p
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
                    <p
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      3 days ago
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    Icon
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref('');
    const userInfo = ref<any>({});
    const casdoorUrl = 'https://695cas.fastbirdcdn.online';

    // Computed properties for user data and organization data
    const userData = computed(() => {
      if (!userInfo.value || !userInfo.value.data) return {};
      return userInfo.value.data;
    });

    const orgData = computed(() => {
      if (!userInfo.value || !userInfo.value.data2) return null;
      return userInfo.value.data2;
    });

    const fetchUserInfo = async () => {
      loading.value = true;
      error.value = '';

      try {
        // Get the token
        const token = casdoorService.getToken();

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user info from the get-account endpoint
        const response = await fetch(`${casdoorUrl}/api/get-account`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        // Parse the response
        const data = await response.json();
        userInfo.value = data;

        loading.value = false;
      } catch (err: any) {
        console.error('Error loading user info:', err);
        error.value = err.message || 'Failed to load user information';
        loading.value = false;

        // Redirect to login if there's an authentication error
        router.push({ name: 'login' });
      }
    };

    const logout = () => {
      casdoorService.logout();
      router.push({ name: 'login' }).catch(err => {
        console.error('Failed to navigate to login:', err);
      });
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
      userData,
      orgData,
      loading,
      error,
      logout
    };
  }
});
</script>