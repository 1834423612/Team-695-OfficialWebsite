<template>
    <div class="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">
                <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    System Information
                </span>
            </h1>
            <div class="mt-3 sm:mt-0 flex items-center space-x-2">
                <button @click="refreshAll"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                    :disabled="loading">
                    <Icon :icon="loading ? 'line-md:loading-loop' : 'mdi:refresh'" :class="{ 'animate-spin': loading }"
                        class="h-4 w-4 mr-1.5" />
                    Refresh
                </button>
            </div>
        </div>

        <!-- Global Loading Overlay -->
        <div v-if="loading && !versionInfo"
            class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
                <Icon icon="line-md:loading-twotone-loop" class="h-12 w-12 text-blue-600 mb-4" />
                <p class="text-gray-700">Loading system information...</p>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading && !versionInfo" class="space-y-6">
            <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div class="h-12 bg-gray-100 rounded-t-lg"></div>
                <div class="p-6 space-y-4">
                    <div class="h-6 bg-gray-100 rounded w-1/3"></div>
                    <div class="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Version Information Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div class="flex items-center">
                        <div
                            class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon icon="mdi:tag-multiple" class="h-5 w-5 text-white" />
                        </div>
                        <div class="ml-4">
                            <h2 class="text-lg font-bold text-white">Version Information</h2>
                            <p class="text-blue-100 text-sm">Current build and release details</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <div v-if="error" class="flex items-center p-4 mb-4 text-amber-800 bg-amber-50 rounded-lg">
                        <Icon icon="mdi:alert-circle-outline" class="flex-shrink-0 w-5 h-5" />
                        <div class="ml-3 text-sm font-medium">{{ error }}</div>
                    </div>

                    <div v-if="versionInfo" class="space-y-6">
                        <!-- Current Version -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:tag-outline" class="mr-2 h-5 w-5 text-blue-600" />
                                Current Version
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div>
                                        <span
                                            class="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                                            {{ versionInfo.version }}
                                        </span>
                                        <span class="block mt-2 sm:inline sm:ml-3 text-sm text-gray-500">
                                            {{ formatDate(versionInfo.commitDate, true) }}
                                        </span>
                                    </div>
                                    <a :href="versionInfo.commitUrl" target="_blank"
                                        class="mt-3 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                        View on GitHub
                                        <Icon icon="mdi:open-in-new" class="h-4 w-4 ml-1" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Branch Information -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:source-branch" class="mr-2 h-5 w-5 text-blue-600" />
                                Branch Information
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex items-center">
                                    <span
                                        class="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                                        {{ versionInfo.branch }}
                                    </span>
                                    <span class="ml-3 text-sm text-gray-500">Active branch</span>
                                </div>
                            </div>
                        </div>

                        <!-- Latest Commit -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:source-commit" class="mr-2 h-5 w-5 text-blue-600" />
                                Latest Commit
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex items-start">
                                    <div class="flex-shrink-0 mt-1">
                                        <img v-if="versionInfo.authorAvatar" :src="versionInfo.authorAvatar"
                                            :alt="versionInfo.author" class="h-10 w-10 rounded-full" />
                                        <div v-else
                                            class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <Icon icon="mdi:account" class="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div class="ml-3 flex-1 min-w-0">
                                        <div class="flex items-center justify-between flex-wrap">
                                            <h4 class="text-sm font-medium text-gray-900">{{ versionInfo.author }}</h4>
                                            <span class="text-xs text-gray-500 mt-1 sm:mt-0">
                                                {{ formatDate(versionInfo.commitDate) }}
                                            </span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-700 whitespace-pre-line break-words">{{
                                            versionInfo.commitMessage }}</p>
                                        <div class="mt-2 flex items-center flex-wrap">
                                            <span class="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                {{ versionInfo.commitSha.substring(0, 7) }}
                                            </span>
                                            <span class="ml-2 text-xs text-gray-500 break-all">Full SHA: {{
                                                versionInfo.commitSha }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Project Architecture Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4">
                    <div class="flex items-center">
                        <div
                            class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon icon="mdi:package-variant" class="h-5 w-5 text-white" />
                        </div>
                        <div class="ml-4">
                            <h2 class="text-lg font-bold text-white">Project Architecture</h2>
                            <p class="text-purple-100 text-sm">Framework and dependency information</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Loading State -->
                    <div v-if="loadingPackage && !packageJson" class="flex justify-center items-center py-8">
                        <Icon icon="line-md:loading-twotone-loop" class="h-10 w-10 text-purple-600" />
                    </div>

                    <div v-else-if="packageError"
                        class="flex items-center p-4 mb-4 text-amber-800 bg-amber-50 rounded-lg">
                        <Icon icon="mdi:alert-circle-outline" class="flex-shrink-0 w-5 h-5" />
                        <div class="ml-3 text-sm font-medium">{{ packageError }}</div>
                        <button @click="fetchPackageJson"
                            class="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <Icon icon="mdi:refresh" class="h-3 w-3 mr-1" />
                            Retry
                        </button>
                    </div>

                    <div v-else-if="packageJson">
                        <!-- Framework Information -->
                        <div class="mb-6">
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:language-javascript" class="mr-2 h-5 w-5 text-purple-600" />
                                Framework
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div class="flex items-center" v-if="hasFramework('vue')">
                                        <Icon icon="mdi:vuejs" class="h-6 w-6 text-green-600" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">Vue.js</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('vue') }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center" v-if="hasFramework('typescript')">
                                        <Icon icon="mdi:language-typescript" class="h-6 w-6 text-blue-600" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">TypeScript</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('typescript') }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center" v-if="hasFramework('tailwindcss')">
                                        <Icon icon="mdi:tailwind" class="h-6 w-6 text-cyan-600" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">Tailwind CSS</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('tailwindcss') }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center" v-if="hasFramework('vite')">
                                        <Icon icon="mdi:webpack" class="h-6 w-6 text-blue-500" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">Vite</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('vite') }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center" v-if="hasFramework('vue-router')">
                                        <Icon icon="mdi:routes" class="h-6 w-6 text-green-600" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">Vue Router</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('vue-router') }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center" v-if="hasFramework('pinia')">
                                        <Icon icon="mdi:database" class="h-6 w-6 text-yellow-600" />
                                        <div class="ml-3">
                                            <h4 class="text-sm font-medium text-gray-900">Pinia</h4>
                                            <p class="text-xs text-gray-500">{{ getPackageVersion('pinia') }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Package.json -->
                        <div class="mb-6">
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:nodejs" class="mr-2 h-5 w-5 text-purple-600" />
                                Package.json
                            </h3>
                            <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                <div
                                    class="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                                    <span class="text-sm font-medium text-gray-700">Dependencies</span>
                                    <button @click="showAllDependencies = !showAllDependencies"
                                        class="text-xs text-purple-600 hover:text-purple-800 flex items-center">
                                        {{ showAllDependencies ? 'Show Less' : 'Show All' }}
                                        <Icon :icon="showAllDependencies ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                                            class="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                                <div class="p-4 max-h-80 overflow-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Package</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Version</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            <template v-if="packageJson.dependencies">
                                                <tr v-for="(version, name) in getVisibleDependencies(packageJson.dependencies)"
                                                    :key="`dep-${name}`">
                                                    <td
                                                        class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {{ name }}</td>
                                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{
                                                        version }}</td>
                                                </tr>
                                            </template>

                                            <template v-if="showAllDependencies && packageJson.devDependencies">
                                                <tr class="bg-gray-50">
                                                    <td colspan="2"
                                                        class="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                                                        Dev Dependencies</td>
                                                </tr>
                                                <tr v-for="(version, name) in packageJson.devDependencies"
                                                    :key="`devDep-${name}`">
                                                    <td
                                                        class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {{ name }}</td>
                                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{
                                                        version }}</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Project Structure -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:folder-outline" class="mr-2 h-5 w-5 text-purple-600" />
                                Project Structure
                            </h3>
                            <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                <div
                                    class="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                                    <span class="text-sm font-medium text-gray-700">Directory Structure</span>
                                    <button @click="fetchProjectStructure"
                                        class="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                                        :disabled="loadingStructure">
                                        <Icon :icon="loadingStructure ? 'line-md:loading-twotone-loop' : 'mdi:refresh'"
                                            :class="{ 'animate-spin': loadingStructure }" class="h-4 w-4 mr-1" />
                                        Refresh
                                    </button>
                                </div>
                                <div class="p-4 max-h-80 overflow-auto">
                                    <div v-if="loadingStructure && !projectStructure.length"
                                        class="flex justify-center items-center py-8">
                                        <Icon icon="line-md:loading-twotone-loop" class="h-10 w-10 text-purple-600" />
                                    </div>

                                    <div v-else-if="structureError" class="text-amber-600 text-sm">
                                        {{ structureError }}
                                        <button @click="fetchProjectStructure"
                                            class="ml-2 text-blue-600 hover:text-blue-800 text-xs">
                                            Retry
                                        </button>
                                    </div>

                                    <div v-else class="font-mono text-sm text-gray-700">
                                        <div v-for="item in projectStructure" :key="item.path" class="mb-1">
                                            <div class="flex items-start">
                                                <Icon :icon="item.type === 'directory' ? 'mdi:folder' : 'mdi:file-code'"
                                                    :class="item.type === 'directory' ? 'text-yellow-500' : 'text-blue-500'"
                                                    class="h-4 w-4 mt-0.5 mr-1" />
                                                <span>{{ item.name }}</span>
                                            </div>

                                            <!-- If it's a directory and we have its structure, show it -->
                                            <div v-if="item.type === 'directory' && item.children && item.children.length"
                                                class="ml-5 mt-1">
                                                <div v-for="child in item.children" :key="`${item.path}/${child.name}`"
                                                    class="mb-1">
                                                    <div class="flex items-start">
                                                        <Icon
                                                            :icon="child.type === 'directory' ? 'mdi:folder' : 'mdi:file-code'"
                                                            :class="child.type === 'directory' ? 'text-yellow-500' : 'text-blue-500'"
                                                            class="h-4 w-4 mt-0.5 mr-1" />
                                                        <span>{{ child.name }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Commits Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                <div class="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div
                                class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Icon icon="mdi:history" class="h-5 w-5 text-white" />
                            </div>
                            <div class="ml-4">
                                <h2 class="text-lg font-bold text-white">Recent Commits</h2>
                                <p class="text-teal-100 text-sm">Latest changes to the repository</p>
                            </div>
                        </div>
                        <button @click="fetchRecentCommits" class="text-white hover:text-teal-100 transition-colors"
                            :disabled="loadingCommits">
                            <Icon :icon="loadingCommits ? 'line-md:loading-twotone-loop' : 'mdi:refresh'"
                                :class="{ 'animate-spin': loadingCommits }" class="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <div v-if="loadingCommits && recentCommits.length === 0"
                        class="flex justify-center items-center py-8">
                        <Icon icon="line-md:loading-twotone-loop" class="h-12 w-12 text-teal-600" />
                    </div>

                    <div v-else-if="recentCommits.length === 0" class="text-center py-8">
                        <Icon icon="mdi:source-branch" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 class="text-lg font-medium text-gray-900 mb-1">No commits found</h3>
                        <p class="text-gray-500 mb-4">Unable to retrieve commit history at this time.</p>
                        <button @click="fetchRecentCommits"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            <Icon icon="mdi:refresh" class="h-4 w-4 mr-1.5" />
                            Try Again
                        </button>
                    </div>

                    <div v-else>
                        <ul class="divide-y divide-gray-200">
                            <li v-for="commit in recentCommits" :key="commit.sha" class="py-4 first:pt-0 last:pb-0">
                                <div class="flex items-start">
                                    <div class="flex-shrink-0 mt-1">
                                        <img v-if="commit.author?.avatar_url" :src="commit.author.avatar_url"
                                            :alt="commit.author.login" class="h-10 w-10 rounded-full" />
                                        <div v-else
                                            class="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                                            <Icon icon="mdi:account" class="h-6 w-6 text-teal-600" />
                                        </div>
                                    </div>
                                    <div class="ml-3 flex-1 min-w-0">
                                        <div class="flex items-center justify-between flex-wrap">
                                            <h4 class="text-sm font-medium text-gray-900">
                                                {{ commit.author?.login || commit.commit.author.name }}
                                            </h4>
                                            <span class="text-xs text-gray-500 mt-1 sm:mt-0">
                                                {{ formatDate(commit.commit.committer.date) }}
                                            </span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-700 line-clamp-2 break-words">{{
                                            commit.commit.message }}
                                        </p>
                                        <div class="mt-2 flex items-center flex-wrap">
                                            <span class="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                {{ commit.sha.substring(0, 7) }}
                                            </span>
                                            <a :href="commit.html_url" target="_blank"
                                                class="ml-2 text-xs text-teal-600 hover:text-teal-800 flex items-center">
                                                View on GitHub
                                                <Icon icon="mdi:open-in-new" class="h-3 w-3 ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div class="mt-6 text-center">
                            <a href="https://github.com/1834423612/Team-695-OfficialWebsite/commits/master"
                                target="_blank"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                View All Commits
                                <Icon icon="mdi:open-in-new" class="ml-1.5 h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Build Information Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                    <div class="flex items-center">
                        <div
                            class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon icon="mdi:cog" class="h-5 w-5 text-white" />
                        </div>
                        <div class="ml-4">
                            <h2 class="text-lg font-bold text-white">Build Information</h2>
                            <p class="text-amber-100 text-sm">Environment and deployment details</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <div v-if="loadingRepoInfo" class="flex justify-center items-center py-8">
                        <Icon icon="line-md:loading-twotone-loop" class="h-12 w-12 text-amber-600" />
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Environment -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:server" class="mr-2 h-5 w-5 text-amber-600" />
                                Environment
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <ul class="space-y-3">
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Node.js Version</span>
                                        <span class="text-sm font-medium text-gray-900">{{ getNodeVersion() }}</span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">npm Version</span>
                                        <span class="text-sm font-medium text-gray-900">{{ getNpmVersion() }}</span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Environment</span>
                                        <span class="text-sm font-medium text-green-600">{{ getEnvironment() }}</span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Build Mode</span>
                                        <span class="text-sm font-medium text-gray-900">{{ getBuildMode() }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Scripts -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:script-text" class="mr-2 h-5 w-5 text-amber-600" />
                                Available Scripts
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <ul class="space-y-3">
                                    <li v-for="(script, name) in getScripts()" :key="name" class="flex justify-between">
                                        <span class="text-sm font-mono text-gray-900">{{ name }}</span>
                                        <span class="text-sm text-gray-500 truncate max-w-[180px]" :title="script">{{
                                            script
                                            }}</span>
                                    </li>
                                    <li v-if="!getScripts() || Object.keys(getScripts()).length === 0"
                                        class="text-sm text-gray-500 italic">
                                        No scripts found in package.json
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Repository Stats -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:chart-timeline-variant" class="mr-2 h-5 w-5 text-amber-600" />
                                Repository Stats
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <ul class="space-y-3">
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Repository Size</span>
                                        <span class="text-sm font-medium text-gray-900">{{
                                            formatRepoSize(repoInfo?.size) }}</span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Stars</span>
                                        <span class="text-sm font-medium text-gray-900 flex items-center">
                                            {{ repoInfo?.stargazers_count || 0 }}
                                            <Icon icon="mdi:star" class="h-4 w-4 ml-1 text-amber-500" />
                                        </span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Forks</span>
                                        <span class="text-sm font-medium text-gray-900">{{ repoInfo?.forks_count || 0
                                            }}</span>
                                    </li>
                                    <li class="flex justify-between">
                                        <span class="text-sm text-gray-500">Last Updated</span>
                                        <span class="text-sm font-medium text-gray-900">{{
                                            formatDate(repoInfo?.updated_at || new
                                            Date()) }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Browser Support -->
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                <Icon icon="mdi:web" class="mr-2 h-5 w-5 text-amber-600" />
                                Browser Support
                            </h3>
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <ul class="space-y-3">
                                    <li class="flex items-center">
                                        <Icon icon="mdi:microsoft-edge" class="h-5 w-5 text-blue-600 mr-2" />
                                        <span class="text-sm text-gray-900">Edge</span>
                                        <span
                                            class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Latest</span>
                                    </li>
                                    <li class="flex items-center">
                                        <Icon icon="mdi:firefox" class="h-5 w-5 text-orange-600 mr-2" />
                                        <span class="text-sm text-gray-900">Firefox</span>
                                        <span
                                            class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Latest</span>
                                    </li>
                                    <li class="flex items-center">
                                        <Icon icon="mdi:google-chrome" class="h-5 w-5 text-red-600 mr-2" />
                                        <span class="text-sm text-gray-900">Chrome</span>
                                        <span
                                            class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Latest</span>
                                    </li>
                                    <li class="flex items-center">
                                        <Icon icon="mdi:apple-safari" class="h-5 w-5 text-blue-600 mr-2" />
                                        <span class="text-sm text-gray-900">Safari</span>
                                        <span
                                            class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Latest</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { githubService, VersionInfo, GitHubCommit, PackageJson, ProjectStructure, RepoInfo } from '@/services/github';

export default defineComponent({
    name: 'VersionView',
    components: {
        Icon
    },
    setup() {
        const versionInfo = ref<VersionInfo | null>(null);
        const recentCommits = ref<GitHubCommit[]>([]);
        const packageJson = ref<PackageJson | null>(null);
        const projectStructure = ref<ProjectStructure[]>([]);
        const repoInfo = ref<RepoInfo | null>(null);

        const loading = ref(true);
        const loadingCommits = ref(false);
        const loadingPackage = ref(false);
        const loadingStructure = ref(false);
        const loadingRepoInfo = ref(false);

        const error = ref<string | null>(null);
        const packageError = ref<string | null>(null);
        const structureError = ref<string | null>(null);

        const showAllDependencies = ref(false);

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
                console.error('Error in VersionView component:', err);
                error.value = 'Error loading version info';
            } finally {
                loading.value = false;
            }
        };

        const fetchRecentCommits = async () => {
            try {
                loadingCommits.value = true;
                const commits = await githubService.getRecentCommits('master', 10);
                recentCommits.value = commits;
            } catch (err) {
                console.error('Error fetching recent commits:', err);
            } finally {
                loadingCommits.value = false;
            }
        };

        const fetchPackageJson = async () => {
            try {
                loadingPackage.value = true;
                packageError.value = null;

                const pkg = await githubService.getPackageJson();

                if (pkg) {
                    packageJson.value = pkg;
                } else {
                    packageError.value = 'Unable to fetch package.json';
                }
            } catch (err) {
                console.error('Error fetching package.json:', err);
                packageError.value = 'Error loading package.json';
            } finally {
                loadingPackage.value = false;
            }
        };

        const fetchProjectStructure = async () => {
            try {
                loadingStructure.value = true;
                structureError.value = null;

                const structure = await githubService.getProjectStructure();

                if (structure && structure.length > 0) {
                    // For each directory, fetch its contents
                    for (const item of structure) {
                        if (item.type === 'directory' && ['src', 'public'].includes(item.name)) {
                            const children = await githubService.getProjectStructure(item.path);
                            item.children = children;
                        }
                    }

                    projectStructure.value = structure;
                } else {
                    structureError.value = 'Unable to fetch project structure';
                }
            } catch (err) {
                console.error('Error fetching project structure:', err);
                structureError.value = 'Error loading project structure';
            } finally {
                loadingStructure.value = false;
            }
        };

        const fetchRepoInfo = async () => {
            try {
                loadingRepoInfo.value = true;
                const info = await githubService.getRepoInfo();
                if (info) {
                    repoInfo.value = info;
                }
            } catch (err) {
                console.error('Error fetching repo info:', err);
            } finally {
                loadingRepoInfo.value = false;
            }
        };

        const refreshAll = async () => {
            loading.value = true;
            await Promise.all([
                fetchVersionInfo(),
                fetchRecentCommits(),
                fetchPackageJson(),
                fetchProjectStructure(),
                fetchRepoInfo()
            ]);
            loading.value = false;
        };

        const formatDate = (dateString: string | Date, includeTime = false): string => {
            const date = dateString instanceof Date ? dateString : new Date(dateString);

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

            // Otherwise show "MMM DD, YYYY" or "MMM DD, YYYY at HH:MM" if includeTime is true
            if (includeTime) {
                return `${date.toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            return date.toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        // Format repository size from KB to MB or GB
        const formatRepoSize = (sizeInKB?: number): string => {
            if (!sizeInKB) return 'Unknown';

            if (sizeInKB < 1024) {
                return `${sizeInKB} KB`;
            } else if (sizeInKB < 1024 * 1024) {
                return `${(sizeInKB / 1024).toFixed(2)} MB`;
            } else {
                return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
            }
        };

        // Helper functions for package.json data
        const hasFramework = (name: string): boolean => {
            if (!packageJson.value) return false;

            return (
                (packageJson.value.dependencies && name in packageJson.value.dependencies) ||
                (packageJson.value.devDependencies && name in packageJson.value.devDependencies)
            );
        };

        const getPackageVersion = (name: string): string => {
            if (!packageJson.value) return '';

            if (packageJson.value.dependencies && name in packageJson.value.dependencies) {
                return packageJson.value.dependencies[name];
            }

            if (packageJson.value.devDependencies && name in packageJson.value.devDependencies) {
                return packageJson.value.devDependencies[name];
            }

            return '';
        };

        const getVisibleDependencies = (dependencies: Record<string, string>) => {
            if (showAllDependencies.value) {
                return dependencies;
            }

            // Show only the first 5 dependencies
            const entries = Object.entries(dependencies);
            const visibleEntries = entries.slice(0, 5);
            return Object.fromEntries(visibleEntries);
        };

        // Helper functions for build information
        const getNodeVersion = (): string => {
            // Try to get from package.json engines
            if (packageJson.value && packageJson.value.engines && packageJson.value.engines.node) {
                return packageJson.value.engines.node;
            }

            return 'v22.14.0LTS'; // Default fallback
        };

        const getNpmVersion = (): string => {
            // Try to get from package.json engines
            if (packageJson.value && packageJson.value.engines && packageJson.value.engines.npm) {
                return packageJson.value.engines.npm;
            }

            return 'v9.5.1'; // Default fallback
        };

        const getEnvironment = (): string => {
            return 'Production';
        };

        const getBuildMode = (): string => {
            return 'Modern';
        };

        const getScripts = (): Record<string, string> => {
            if (packageJson.value && packageJson.value.scripts) {
                return packageJson.value.scripts;
            }

            return {};
        };

        const getLicense = (): string => {
            if (repoInfo.value && repoInfo.value.license) {
                return repoInfo.value.license.name || 'MIT';
            }

            if (packageJson.value && packageJson.value.license) {
                return packageJson.value.license;
            }

            return 'MIT';
        };

        onMounted(() => {
            refreshAll();
        });

        return {
            versionInfo,
            recentCommits,
            packageJson,
            projectStructure,
            repoInfo,
            loading,
            loadingCommits,
            loadingPackage,
            loadingStructure,
            loadingRepoInfo,
            error,
            packageError,
            structureError,
            showAllDependencies,
            fetchVersionInfo,
            fetchRecentCommits,
            fetchPackageJson,
            fetchProjectStructure,
            fetchRepoInfo,
            refreshAll,
            formatDate,
            formatRepoSize,
            hasFramework,
            getPackageVersion,
            getVisibleDependencies,
            getNodeVersion,
            getNpmVersion,
            getEnvironment,
            getBuildMode,
            getScripts,
            getLicense
        };
    }
});
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.whitespace-pre-line {
    white-space: pre-line;
}

.break-words {
    word-break: break-word;
}

.break-all {
    word-break: break-all;
}
</style>