<template>
    <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Icon icon="mdi:tag-multiple" class="mr-2 h-5 w-5 text-blue-600" />
            Version Information
        </h2>

        <div
            class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-all duration-300">
            <div class="p-4 sm:p-5">
                <!-- Loading State -->
                <div v-if="loading" class="flex items-center space-x-3 py-2">
                    <Icon icon="mdi:loading" class="h-5 w-5 text-blue-600 animate-spin" />
                    <span class="text-sm text-gray-600">Fetching version information...</span>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="flex items-center space-x-3 py-2 text-amber-600">
                    <Icon icon="mdi:alert-circle-outline" class="h-5 w-5" />
                    <span class="text-sm">{{ error }}</span>
                    <button @click="fetchVersionInfo"
                        class="text-xs text-blue-600 hover:text-blue-800 flex items-center ml-2">
                        <Icon icon="mdi:refresh" class="h-3 w-3 mr-1" />
                        Retry
                    </button>
                </div>

                <!-- Version Info -->
                <div v-else-if="versionInfo" class="space-y-4">
                    <!-- Version Number -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div class="flex items-start sm:items-center">
                            <div
                                class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Icon icon="mdi:tag-outline" class="h-5 w-5 text-blue-600" />
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-gray-900 sm:text-base">Current Version</h3>
                                <div class="mt-1 flex flex-col sm:flex-row sm:items-center">
                                    <span
                                        class="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-md inline-block">
                                        {{ versionInfo.version }}
                                    </span>
                                    <span class="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">{{
                                        formatDate(versionInfo.commitDate) }}</span>
                                </div>
                            </div>
                        </div>

                        <a :href="versionInfo.commitUrl" target="_blank"
                            class="mt-3 sm:mt-0 text-xs text-blue-600 hover:text-blue-800 flex items-center self-start sm:self-end">
                            View on GitHub
                            <Icon icon="mdi:open-in-new" class="h-3 w-3 ml-1" />
                        </a>
                    </div>

                    <!-- Commit Info -->
                    <div class="pt-3 border-t border-blue-100">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 mt-1">
                                <img v-if="versionInfo.authorAvatar" :src="versionInfo.authorAvatar"
                                    :alt="versionInfo.author" class="h-8 w-8 rounded-full" />
                                <div v-else class="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Icon icon="mdi:account" class="h-5 w-5 text-indigo-600" />
                                </div>
                            </div>
                            <div class="ml-3 flex-1 min-w-0">
                                <div class="text-sm flex flex-wrap items-center">
                                    <span class="font-medium text-gray-900 mr-2 truncate">{{ versionInfo.author
                                        }}</span>
                                    <span class="text-xs text-gray-500">committed</span>
                                </div>
                                <p class="mt-1 text-sm text-gray-700 break-words line-clamp-3">{{
                                    versionInfo.commitMessage }}</p>
                                <div class="mt-2">
                                    <span class="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                        {{ versionInfo.commitSha.substring(0, 7) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Development Notice -->
                <div class="mt-4 pt-3 border-t border-blue-100">
                    <div class="flex items-start sm:items-center">
                        <Icon icon="mdi:information-outline"
                            class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <p class="ml-2 text-xs sm:text-sm text-gray-600">
                            Features marked with a
                            <Icon icon="mdi:lock-outline" class="inline h-4 w-4 text-gray-600" /> icon are
                            under development.
                        </p>
                    </div>
                </div>

                <!-- View Details Link -->
                <div class="mt-3 text-right">
                    <router-link to="/Dashboard/System/Version"
                        class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
                        View detailed version history
                        <Icon icon="mdi:chevron-right" class="ml-1 h-4 w-4" />
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { githubService, VersionInfo } from '@/services/github';

export default defineComponent({
    name: 'VersionInfoCard',
    components: {
        Icon
    },
    setup() {
        const versionInfo = ref<VersionInfo | null>(null);
        const loading = ref(true);
        const error = ref<string | null>(null);

        const fetchVersionInfo = async () => {
            try {
                loading.value = true;
                error.value = null;

                const info = await githubService.getVersionInfo();

                if (info) {
                    versionInfo.value = info;
                } else {
                    error.value = 'Unable to fetch version info';
                }
            } catch (err) {
                console.error('Error in VersionInfoCard component:', err);
                error.value = 'Error loading version info';
            } finally {
                loading.value = false;
            }
        };

        const formatDate = (dateString: string): string => {
            const date = new Date(dateString);

            // If it's today, show "Today at HH:MM"
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            // If it's yesterday, show "Yesterday at HH:MM"
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            // Otherwise show "MMM DD, YYYY"
            return date.toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        onMounted(() => {
            fetchVersionInfo();
        });

        return {
            versionInfo,
            loading,
            error,
            fetchVersionInfo,
            formatDate
        };
    }
});
</script>