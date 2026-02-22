<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 mt-4 pb-8">
        <!-- Header with enhanced gradient background -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-32 rounded-b-xl md:rounded-b-2xl w-full shadow-2xl">
            <header class="py-12">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 class="text-center text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                        🤖 Pit Scouting Dashboard
                    </h1>
                    <p class="text-center text-blue-100 mt-3 text-lg">Comprehensive robot analysis and team comparison</p>
                </div>
            </header>
        </div>

        <main class="-mt-32 container mx-auto p-4 max-w-7xl">
            <!-- Enhanced Search Panel -->
            <div class="mb-8 bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 border-blue-100">
                <div class="p-8 bg-gradient-to-br from-white to-blue-50">
                    <h2 class="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                        <Icon icon="mdi:magnify" class="mr-3 text-indigo-600 w-8 h-8" />
                        Search Filters
                    </h2>
                    <form @submit.prevent="handleSearch" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Event ID Filter - Required selection -->
                            <div class="relative group">
                                <select v-model="queryParams.eventId" id="eventId" @change="handleEventChange"
                                    class="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium"
                                    :class="{'border-red-500 focus:ring-red-500 focus:border-red-500': showEventRequiredError}">
                                    <option value="">Select an Event</option>
                                    <option v-for="eventId in uniqueEventIds" :key="eventId" :value="eventId">{{ eventId }}</option>
                                </select>
                                <label for="eventId"
                                    class="absolute -top-3 left-3 bg-white px-2 text-sm font-bold rounded"
                                    :class="showEventRequiredError ? 'text-red-600' : 'text-indigo-600'">
                                    Event ID <span class="text-red-500">*</span>
                                </label>
                                <p v-if="showEventRequiredError" class="mt-2 text-xs text-red-600 font-semibold flex items-center">
                                    <Icon icon="mdi:alert" class="mr-1" />
                                    Please select an event to view data
                                </p>
                            </div>

                            <!-- Form ID Filter -->
                            <div class="relative group">
                                <input v-model="queryParams.formId" type="text" id="formId"
                                    class="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                                    placeholder="Enter Form ID" :disabled="!queryParams.eventId" />
                                <label for="formId"
                                    class="absolute -top-3 left-3 bg-white px-2 text-sm font-bold text-indigo-600 rounded">
                                    Form ID
                                </label>
                            </div>

                            <!-- Team Number Filter -->
                            <div class="relative group">
                                <input v-model="queryParams.teamNumber" type="text" id="teamNumber"
                                    class="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                                    placeholder="Enter Team Number" :disabled="!queryParams.eventId" />
                                <label for="teamNumber"
                                    class="absolute -top-3 left-3 bg-white px-2 text-sm font-bold text-indigo-600 rounded">
                                    Team Number
                                </label>
                            </div>
                        </div>

                        <!-- Enhanced Search Button -->
                        <div class="flex justify-end">
                            <button type="submit" :disabled="isSearching || !queryParams.eventId"
                                class="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <Icon :icon="isSearching ? 'mdi:loading' : 'mdi:magnify'"
                                    :class="{ 'animate-spin': isSearching }" class="mr-2 w-5 h-5" />
                                {{ isSearching ? 'Searching...' : 'Search' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Enhanced No Event Selected State -->
            <div v-if="!queryParams.eventId" class="flex flex-col items-center text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-indigo-300">
                <Icon icon="mdi:information-outline" class="text-8xl text-indigo-400 mb-6 animate-pulse" />
                <p class="text-2xl font-bold text-gray-700 mb-3">
                    Please select an event to view data
                </p>
                <p class="text-gray-500 max-w-md text-lg">
                    Selecting an event helps organize the data and improves performance
                </p>
            </div>

            <!-- Enhanced Loading State -->
            <div v-else-if="loading" class="text-center py-16">
                <div class="inline-flex flex-col items-center">
                    <div class="relative">
                        <div class="animate-spin rounded-full h-20 w-20 border-t-4 border-r-4 border-indigo-600 border-b-4 border-l-4 border-transparent"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Icon icon="mdi:robot" class="text-3xl text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <p class="mt-6 text-xl font-semibold text-gray-700">Loading pit scouting data...</p>
                    <p class="mt-2 text-gray-500">Please wait while we fetch the information</p>
                </div>
            </div>

            <!-- Enhanced Error State -->
            <div v-else-if="error"
                class="bg-gradient-to-r from-red-50 to-pink-50 border-l-8 border-red-500 text-red-800 p-8 rounded-xl shadow-lg mb-8" role="alert">
                <div class="flex items-center mb-3">
                    <Icon icon="mdi:alert-circle" class="text-4xl mr-3" />
                    <p class="font-bold text-2xl">Error Occurred</p>
                </div>
                <p class="mt-3 text-lg">{{ error }}</p>
            </div>

            <!-- Enhanced Empty State -->
            <div v-else-if="filteredSurveyData.length === 0"
                class="flex flex-col items-center text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <Icon icon="mdi:robot-confused" class="text-8xl text-gray-400 mb-6" />
                <p class="text-2xl font-bold text-gray-700 mb-3">
                    No data available for the selected event
                </p>
                <p class="text-gray-500 mt-2 text-lg max-w-md">
                    Try adjusting your search criteria or selecting a different event
                </p>
            </div>

            <!-- Data Display -->
            <div v-else>
                <!-- Data Summary Card -->
                <section class="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="mdi:chart-donut" class="mr-2 text-indigo-500" />
                            Event Summary: {{ queryParams.eventId }}
                        </h2>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- Total Teams Card -->
                            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 shadow-sm">
                                <div class="flex items-center">
                                    <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <Icon icon="mdi:account-group" class="text-2xl" />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-blue-600">Total Teams</p>
                                        <p class="text-2xl font-bold text-gray-800">{{ uniqueTeamCount }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Total Forms Card -->
                            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 shadow-sm">
                                <div class="flex items-center">
                                    <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <Icon icon="mdi:clipboard-text" class="text-2xl" />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-purple-600">Total Forms</p>
                                        <p class="text-2xl font-bold text-gray-800">{{ filteredSurveyData.length }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Unique Scouts Card -->
                            <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-100 shadow-sm">
                                <div class="flex items-center">
                                    <div class="p-3 rounded-full bg-green-100 text-green-600">
                                        <Icon icon="mdi:account-check" class="text-2xl" />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-green-600">Unique Scouts</p>
                                        <p class="text-2xl font-bold text-gray-800">{{ submissionUsers.length }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Last Updated Card -->
                            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100 shadow-sm">
                                <div class="flex items-center">
                                    <div class="p-3 rounded-full bg-amber-100 text-amber-600">
                                        <Icon icon="mdi:clock-outline" class="text-2xl" />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-amber-600">Last Updated</p>
                                        <p class="text-lg font-bold text-gray-800">{{ lastUpdatedTime }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Data Visualization Section -->
                <section v-if="filteredSurveyData.length > 0"
                    class="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="mdi:chart-bar" class="mr-2 text-indigo-500" />
                            Data Visualization
                        </h2>

                        <!-- Chart Type Selector -->
                        <div class="mb-6 relative">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Select Charts to Display
                            </label>
                            <div class="relative chart-selector" @click.stop>
                                <button @click.stop="isChartSelectorOpen = !isChartSelectorOpen"
                                    class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-left flex justify-between items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <span class="truncate">
                                        {{ selectedChartTypes.length ? `${selectedChartTypes.length} charts selected` :
                                        'Select charts' }}
                                    </span>
                                    <Icon :icon="isChartSelectorOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
                                </button>

                                <!-- Chart Multi-select Dropdown -->
                                <div v-if="isChartSelectorOpen"
                                    class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                    <div class="p-2">
                                        <div v-for="field in filteredChartFields" :key="field"
                                            class="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                            @click.stop="toggleChartType(field)">
                                            <input type="checkbox" :checked="selectedChartTypes.includes(field)"
                                                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                            <span class="ml-2 truncate" :title="formatFieldName(field)">
                                                {{ formatFieldName(field) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Chart Display with Adaptive Layout -->
                        <div v-if="selectedChartTypes.length > 0" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div v-for="(field, index) in selectedChartTypes" :key="field"
                                    :class="{ 'md:col-span-2': selectedChartTypes.length % 2 !== 0 && index === selectedChartTypes.length - 1 }"
                                    class="bg-gray-50 p-4 rounded-lg shadow-md border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors duration-200">
                                    <h3 class="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                        <span
                                            class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">
                                            {{ index + 1 }}
                                        </span>
                                        {{ formatFieldName(field) }}
                                    </h3>
                                    <div class="h-64">
                                        <Bar :data="generateChartData(field).data"
                                            :options="getChartOptions() as any" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex flex-col items-center text-center py-8 bg-gray-50 rounded-lg">
                            <Icon icon="mdi:chart-line" class="text-4xl text-gray-400 mb-2" />
                            <p class="text-gray-600">Select charts to display visualization</p>
                        </div>
                    </div>
                </section>

                <!-- Submission User Information - Enhanced with CachedAvatar -->
                <section class="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="mdi:account-group" class="mr-2 text-indigo-500" />
                            Submission Users
                            <span class="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-sm">
                                {{ submissionUsers.length }} scouts
                            </span>
                        </h2>

                        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                            <div class="flex items-center">
                                                <Icon icon="mdi:account" class="mr-2 text-indigo-500" />
                                                User Info
                                            </div>
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                            <div class="flex items-center">
                                                <Icon icon="mdi:devices" class="mr-2 text-indigo-500" />
                                                Device Info
                                            </div>
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                            <div class="flex items-center">
                                                <Icon icon="mdi:clipboard-list" class="mr-2 text-indigo-500" />
                                                Team Submissions
                                            </div>
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div class="flex items-center">
                                                <Icon icon="mdi:clock" class="mr-2 text-indigo-500" />
                                                Last Submission
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="user in submissionUsers" :key="user.userId" class="hover:bg-indigo-50/30 transition-all duration-200">
                                        <td class="px-6 py-5 border-r border-gray-100">
                                            <div class="flex items-center">
                                                <!-- Enhanced User Avatar using CachedAvatar -->
                                                <CachedAvatar 
                                                    :userId="user.userId" 
                                                    :initial="getUserInitialsValue(user)" 
                                                    :src="user.avatar"
                                                    :size="48"
                                                    :firstName="user.firstName || ''"
                                                    :lastName="user.lastName || ''"
                                                    :displayName="user.displayName"
                                                    alt="User Avatar"
                                                    class="rounded-full object-cover border-2 border-indigo-200 shadow-sm" />
                                                
                                                <div class="ml-4">
                                                    <div class="text-sm font-semibold text-gray-900">{{ user.displayName }}</div>
                                                    <div class="text-xs text-gray-600 mt-0.5">@{{ user.username }}</div>
                                                    <!-- User ID with copy button -->
                                                    <div class="text-xs text-gray-500 flex items-center mt-1">
                                                        <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{ user.userId.substring(0, 8) }}...</span>
                                                        <button @click="copyToClipboard(user.userId)"
                                                            class="ml-2 p-1 rounded hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 transition-all duration-200"
                                                            :class="{ 'text-green-500 bg-green-50': copiedId === user.userId }"
                                                            title="Copy User ID">
                                                            <Icon
                                                                :icon="copiedId === user.userId ? 'mdi:check-circle' : 'mdi:content-copy'"
                                                                class="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5 border-r border-gray-100">
                                            <div class="space-y-1.5">
                                                <div class="flex items-center text-sm text-gray-900">
                                                    <Icon icon="mdi:laptop" class="mr-2 text-indigo-400" />
                                                    {{ getBrowserInfo(user.userAgent) }}
                                                </div>
                                                <div class="flex items-center text-xs text-gray-600">
                                                    <Icon icon="mdi:cellphone" class="mr-2 text-gray-400" />
                                                    {{ getDeviceType(user.userAgent) }}
                                                </div>
                                                <div class="flex items-center text-xs text-gray-600">
                                                    <Icon icon="mdi:ip-network" class="mr-2 text-gray-400" />
                                                    <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{ user.ip }}</span>
                                                </div>
                                                <div class="flex items-center text-xs text-gray-600">
                                                    <Icon icon="mdi:translate" class="mr-2 text-gray-400" />
                                                    {{ user.language }}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5 border-r border-gray-100">
                                            <div class="space-y-3">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <span class="text-sm font-semibold text-gray-700">Total:</span>
                                                    <span class="px-3 py-1 inline-flex text-sm font-bold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                                                        {{ user.count }}
                                                    </span>
                                                </div>

                                                <!-- Group submissions by event -->
                                                <div v-for="(submissions, eventId) in user.submissionsByEvent"
                                                    :key="eventId" class="space-y-2">
                                                    <div class="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                        <Icon icon="mdi:calendar-event" class="mr-1.5" />
                                                        {{ eventId }} ({{ submissions.length }})
                                                    </div>
                                                    <div class="relative">
                                                        <div class="flex flex-wrap gap-1.5">
                                                            <template v-if="submissions.length <= 4">
                                                                <span v-for="submission in submissions" :key="submission.id"
                                                                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                                                                    :title="`Submitted on ${formatDate(submission.timestamp)}`">
                                                                    Team {{ submission.teamNumber }}
                                                                </span>
                                                            </template>
                                                            <template v-else>
                                                                <span v-for="(submission) in submissions.slice(0, 3)"
                                                                    :key="submission.id"
                                                                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                                                                    :title="`Submitted on ${formatDate(submission.timestamp)}`">
                                                                    Team {{ submission.teamNumber }}
                                                                </span>
                                                                <div class="relative">
                                                                    <button @click.stop="toggleTeamExpand(user.userId, eventId)"
                                                                        class="px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1">
                                                                        <Icon :icon="isTeamExpanded(user.userId, eventId) ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="h-3.5 w-3.5" />
                                                                        <span v-if="isTeamExpanded(user.userId, eventId)">Hide</span>
                                                                        <span v-else>+{{ submissions.length - 3 }}</span>
                                                                    </button>
                                                                </div>
                                                            </template>
                                                        </div>
                                                        <!-- Expanded team numbers -->
                                                        <div v-if="isTeamExpanded(user.userId, eventId)"
                                                            class="mt-2 pt-2 border-t border-indigo-100">
                                                            <div class="flex flex-wrap gap-1.5">
                                                                <span v-for="submission in submissions.slice(3)"
                                                                    :key="submission.id"
                                                                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                                                                    :title="`Submitted on ${formatDate(submission.timestamp)}`">
                                                                    Team {{ submission.teamNumber }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5">
                                            <div class="flex items-center text-sm text-gray-700 font-medium">
                                                <Icon icon="mdi:clock-outline" class="mr-2 text-indigo-400" />
                                                {{ formatDate(user.lastSubmission) }}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- Data Tables Section - Enhanced UI -->
                <section class="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-semibold text-gray-800 flex items-center">
                                <Icon icon="mdi:table" class="mr-2 text-indigo-500" />
                                Form Data: {{ queryParams.eventId }}
                            </h2>
                            <span class="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-sm">
                                {{ filteredSurveyData.length }} forms
                            </span>
                        </div>

                        <!-- Enhanced Toolbar -->
                        <div class="flex flex-wrap gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
                            <button @click="showColumnSelector = !showColumnSelector"
                                class="inline-flex items-center px-4 py-2.5 border-2 border-indigo-300 rounded-lg shadow-sm text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                <Icon icon="mdi:table-column" class="-ml-1 mr-2 h-5 w-5" />
                                Customize Columns
                                <span class="ml-2 bg-indigo-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {{ selectedFields.length }}
                                </span>
                            </button>
                            
                            <!-- Export Button -->
                            <button @click="exportToCSV"
                                class="inline-flex items-center px-4 py-2.5 border-2 border-green-300 rounded-lg shadow-sm text-sm font-semibold text-green-700 bg-white hover:bg-green-50 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200">
                                <Icon icon="mdi:file-export" class="-ml-1 mr-2 h-5 w-5" />
                                Export CSV
                            </button>
                            
                            <!-- Quick Filter -->
                            <div class="relative flex-grow md:max-w-md">
                                <input 
                                    v-model="tableFilter" 
                                    type="text" 
                                    placeholder="🔍 Search team, user, or any field..." 
                                    class="w-full px-4 py-2.5 pl-10 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                />
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" />
                                </div>
                                <div v-if="tableFilter" class="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button @click="tableFilter = ''" class="text-gray-400 hover:text-gray-600">
                                        <Icon icon="mdi:close-circle" class="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Column Selector Modal -->
                        <div v-if="showColumnSelector"
                            class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-start justify-center pt-16 z-50 transition-all duration-300"
                            @click="showColumnSelector = false">
                            <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100 opacity-100"
                                @click.stop>
                                <div
                                    class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl flex justify-between items-center">
                                    <h3 class="text-lg font-bold flex items-center">
                                        <Icon icon="mdi:view-column-outline" class="mr-2 w-5 h-5" />
                                        Customize Columns
                                    </h3>
                                    <button @click="showColumnSelector = false"
                                        class="text-white hover:text-gray-200 transition-colors duration-200 focus:outline-none">
                                        <Icon icon="mdi:close" class="w-6 h-6" />
                                    </button>
                                </div>
                                <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
                                    <div class="space-y-4">
                                        <!-- Available Fields -->
                                        <div class="mb-6">
                                            <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                <Icon icon="mdi:playlist-plus" class="mr-2 w-5 h-5 text-blue-500" />
                                                Available Fields
                                            </h4>
                                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div v-for="field in availableFieldsNotSelected" :key="field"
                                                    class="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all duration-200 group">
                                                    <span class="truncate flex-1 text-gray-800"
                                                        :title="formatFieldName(field)">
                                                        {{ formatFieldName(field) }}
                                                    </span>
                                                    <button @click="addField(field)"
                                                        class="ml-2 p-1.5 rounded-full bg-white text-blue-500 hover:text-white hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105">
                                                        <Icon icon="mdi:plus" class="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="border-t border-gray-200 my-4 opacity-60">
                                        </div>

                                        <!-- Selected Fields with Enhanced Mobile Drag and Drop -->
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                <Icon icon="mdi:sort" class="mr-2 w-5 h-5 text-indigo-500" />
                                                Selected Fields (Drag to reorder)
                                            </h4>
                                            <div class="space-y-2 relative" ref="draggableContainer">
                                                <!-- Placeholder for drag target -->
                                                <div v-if="isDragging"
                                                    class="absolute border-2 border-dashed border-indigo-500 bg-indigo-100 bg-opacity-70 rounded-lg p-3 pointer-events-none transition-all duration-200"
                                                    :style="placeholderStyle">
                                                </div>

                                                <div v-for="(field, index) in selectedFields" :key="field"
                                                    class="flex items-center p-3 rounded-lg transition-all duration-200 select-none"
                                                    :class="[
                                                        draggedItem === index ? 'bg-indigo-200 shadow-lg scale-[1.02] z-10' : 'bg-gray-50',
                                                        dragOverIndex === index ? 'border-2 border-indigo-500' : 'border border-gray-200',
                                                        'hover:bg-gray-100'
                                                    ]" ref="draggableItems"
                                                    @touchstart.passive="touchStart($event, index)"
                                                    @touchmove.prevent="touchMove($event, index)"
                                                    @touchend="touchEnd($event)" @touchcancel="touchEnd($event)"
                                                    draggable="true" @dragstart="dragStart($event, index)"
                                                    @dragover.prevent="dragOver($event, index)"
                                                    @dragenter.prevent="dragEnter($event, index)"
                                                    @dragleave="dragLeave($event, index)"
                                                    @drop="drop($event, index)" @dragend="dragEnd"
                                                    @mousedown="preventMultiSelection">
                                                    <div
                                                        class="p-1.5 mr-2 rounded-md bg-gray-200 text-gray-500 drag-handle">
                                                        <Icon icon="mdi:drag" class="w-4 h-4" />
                                                    </div>
                                                    <span class="truncate flex-1 text-gray-800"
                                                        :title="formatFieldName(field)">
                                                        {{ formatFieldName(field) }}
                                                    </span>
                                                    <span
                                                        class="mx-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                        {{ index + 1 }}
                                                    </span>
                                                    <button @click="removeField(field)"
                                                        class="p-1.5 rounded-full bg-white text-red-400 hover:text-white hover:bg-red-500 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105">
                                                        <Icon icon="mdi:close" class="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-between">
                                    <button @click="resetColumns"
                                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center">
                                        <Icon icon="mdi:refresh" class="mr-2 w-4 h-4" />
                                        Reset to Default
                                    </button>
                                    <button @click="showColumnSelector = false"
                                        class="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-1px] flex items-center">
                                        <Icon icon="mdi:check" class="mr-2 w-4 h-4" />
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Data Table -->
                        <div class="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-lg">
                            <table class="min-w-full divide-y-2 divide-gray-300">
                                <thead class="bg-gradient-to-r from-indigo-600 to-blue-600 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col"
                                            class="sticky left-0 z-20 bg-indigo-600 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider shadow-md border-r-2 border-indigo-500">
                                            <div class="flex items-center gap-2">
                                                <Icon icon="mdi:pound" class="h-4 w-4" />
                                                Team Number
                                                <button @click="sortTable('teamNumber')" class="ml-1 hover:bg-indigo-700 p-1 rounded transition-colors">
                                                    <Icon :icon="getSortIcon('teamNumber')" class="h-4 w-4" />
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r-2 border-indigo-500">
                                            <div class="flex items-center gap-2">
                                                <Icon icon="mdi:account" class="h-4 w-4" />
                                                Submitted By
                                                <button @click="sortTable('submittedBy')" class="ml-1 hover:bg-indigo-700 p-1 rounded transition-colors">
                                                    <Icon :icon="getSortIcon('submittedBy')" class="h-4 w-4" />
                                                </button>
                                            </div>
                                        </th>
                                        <th v-for="field in selectedFields" :key="field" scope="col"
                                            class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-indigo-500">
                                            <div class="flex items-center gap-2">
                                                <Icon icon="mdi:file-document-outline" class="h-4 w-4" />
                                                {{ formatFieldName(field) }}
                                                <button @click="sortTable(field)" class="ml-1 hover:bg-indigo-700 p-1 rounded transition-colors">
                                                    <Icon :icon="getSortIcon(field)" class="h-4 w-4" />
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                            <div class="flex items-center justify-center gap-2">
                                                <Icon icon="mdi:image" class="h-4 w-4" />
                                                Images
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="(survey, index) in paginatedAndFilteredData" :key="survey.id"
                                        class="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                                        :class="index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'">
                                        <td
                                            class="sticky left-0 z-10 px-6 py-4 whitespace-nowrap shadow-md border-r border-gray-200"
                                            :class="index % 2 === 0 ? 'bg-indigo-100' : 'bg-indigo-50'">
                                            <div class="flex items-center gap-2">
                                                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold">
                                                    {{ index + 1 }}
                                                </span>
                                                <span class="text-sm font-bold text-gray-900">
                                                    Team {{ getFieldValue(survey.data, "Team number") || "N/A" }}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                                            <div class="flex items-center">
                                                <!-- Enhanced User Avatar using CachedAvatar -->
                                                <CachedAvatar 
                                                    :userId="survey.user_data?.userId || survey.userData?.userId || ''" 
                                                    :initial="getUserInitialsFromSurvey(survey)" 
                                                    :src="survey.user_data?.avatar || survey.userData?.avatar"
                                                    :size="40"
                                                    :firstName="survey.user_data?.firstName || survey.userData?.firstName || ''"
                                                    :lastName="survey.user_data?.lastName || survey.userData?.lastName || ''"
                                                    :displayName="survey.user_data?.displayName || survey.userData?.displayName || survey.user_data?.username || survey.userData?.username || 'Unknown'"
                                                    alt="User Avatar"
                                                    class="rounded-full object-cover border-2 border-indigo-200 shadow-sm" />
                                                
                                                <div class="ml-3">
                                                    <div class="text-sm font-semibold text-gray-900">
                                                        {{ (survey.user_data?.displayName || survey.userData?.displayName || survey.user_data?.username || survey.userData?.username || "Unknown") }}
                                                    </div>
                                                    <div class="flex items-center text-xs text-gray-500 mt-1">
                                                        <Icon icon="mdi:clock-outline" class="mr-1 h-3 w-3" />
                                                        {{ formatDate(survey.timestamp) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td v-for="field in selectedFields" :key="field"
                                            class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">
                                            <template v-if="isUrl(getFieldValue(survey.data, field))">
                                                <div class="flex items-center gap-2">
                                                    <span class="truncate max-w-[200px] font-medium">{{
                                                        formatUrl(getFieldValue(survey.data, field)) }}</span>
                                                    <a :href="getFieldValue(survey.data, field)" target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="p-1 rounded hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors">
                                                        <Icon icon="mdi:open-in-new" class="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </template>
                                            <template v-else>
                                                <span class="font-medium">{{ formatFieldValue(survey.data, field) }}</span>
                                            </template>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center">
                                            <div v-if="hasImages(survey)" class="flex justify-center">
                                                <button @click="openImageModal(survey)"
                                                    class="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110">
                                                    <Icon icon="mdi:image-multiple" class="text-xl" />
                                                </button>
                                            </div>
                                            <span v-else class="text-gray-400 text-sm">No images</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Enhanced Pagination Controls -->
                        <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
                            <div class="flex items-center gap-2">
                                <Icon icon="mdi:information-outline" class="text-indigo-500 h-5 w-5" />
                                <span class="text-sm font-medium text-gray-700">
                                    Showing <span class="font-bold text-indigo-600">{{ paginationStart }}</span> to 
                                    <span class="font-bold text-indigo-600">{{ paginationEnd }}</span> of 
                                    <span class="font-bold text-indigo-600">{{ filteredTableData.length }}</span> results
                                </span>
                            </div>
                            <div class="flex items-center gap-3">
                                <button 
                                    @click="currentPage = Math.max(1, currentPage - 1)"
                                    :disabled="currentPage === 1"
                                    class="px-4 py-2 rounded-lg border-2 border-indigo-300 bg-white text-indigo-700 font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1">
                                    <Icon icon="mdi:chevron-left" class="h-5 w-5" />
                                    Prev
                                </button>
                                <div class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md">
                                    <span>{{ currentPage }}</span>
                                    <span class="text-indigo-200">/</span>
                                    <span>{{ totalPages }}</span>
                                </div>
                                <button 
                                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                                    :disabled="currentPage === totalPages"
                                    class="px-4 py-2 rounded-lg border-2 border-indigo-300 bg-white text-indigo-700 font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1">
                                    Next
                                    <Icon icon="mdi:chevron-right" class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Enhanced Team Comparison Feature -->
                <section class="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="carbon:compare" class="mr-2 text-indigo-500" />
                            Team Comparison Tool
                        </h2>

                        <!-- Mode Selection -->
                        <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <label class="block text-sm font-bold text-gray-700 mb-3">Comparison Mode:</label>
                            <div class="flex flex-wrap gap-3">
                                <button 
                                    @click="comparisonMode = 'manual'"
                                    :class="comparisonMode === 'manual' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-300'"
                                    class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105">
                                    <Icon icon="mdi:keyboard" class="h-5 w-5" />
                                    Manual Input
                                </button>
                                <button 
                                    @click="comparisonMode = 'select'"
                                    :class="comparisonMode === 'select' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-300'"
                                    class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105">
                                    <Icon icon="mdi:checkbox-marked-circle" class="h-5 w-5" />
                                    Select from Data
                                </button>
                            </div>
                        </div>

                        <!-- Event Selection (Common) -->
                        <div class="mb-6">
                            <label class="flex text-sm font-bold text-gray-700 mb-2 items-center">
                                <Icon icon="mdi:calendar-event" class="mr-2 text-indigo-500" />
                                Select Event to Compare
                                <span class="ml-2 text-red-500">*</span>
                            </label>
                            <select v-model="comparisonEventId"
                                class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all">
                                <option value="">Choose an event...</option>
                                <option v-for="eventId in uniqueEventIds" :key="eventId" :value="eventId">{{ eventId }}</option>
                            </select>
                            <div class="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                <Icon icon="mdi:information-outline" class="text-blue-500" />
                                <span>Need SQL query? </span>
                                <button @click="openSQLModal"
                                    class="text-blue-600 hover:text-blue-800 font-semibold underline">
                                    Click here
                                </button>
                            </div>
                        </div>

                        <!-- Manual Input Mode -->
                        <div v-if="comparisonMode === 'manual'" class="mb-6">
                            <label class="flex text-sm font-bold text-gray-700 mb-2 items-center">
                                <Icon icon="mdi:format-list-numbered" class="mr-2 text-indigo-500" />
                                Enter Team Numbers (one per line or comma-separated)
                            </label>
                            <textarea v-model="teamNumbersInput" rows="6"
                                class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm transition-all"
                                placeholder="Example:&#10;695&#10;1114&#10;254&#10;or: 695, 1114, 254"></textarea>
                        </div>

                        <!-- Select Mode -->
                        <div v-if="comparisonMode === 'select' && comparisonEventId" class="mb-6">
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div class="flex items-center justify-between mb-3">
                                    <label class="text-sm font-bold text-gray-700 flex items-center">
                                        <Icon icon="mdi:checkbox-multiple-marked" class="mr-2 text-indigo-500" />
                                        Select Teams from {{ comparisonEventId }}
                                    </label>
                                    <div class="flex gap-2">
                                        <button @click="selectAllTeams" 
                                            class="px-3 py-1 text-xs font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                                            Select All
                                        </button>
                                        <button @click="selectedTeamsForComparison = []" 
                                            class="px-3 py-1 text-xs font-semibold rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors">
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                                <div class="max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 bg-white rounded border border-gray-200">
                                    <label v-for="team in availableTeamsInEvent" :key="team"
                                        class="flex items-center p-2 rounded hover:bg-indigo-50 cursor-pointer transition-colors border border-transparent hover:border-indigo-300">
                                        <input 
                                            type="checkbox" 
                                            :value="team"
                                            v-model="selectedTeamsForComparison"
                                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                        <span class="ml-2 text-sm font-medium text-gray-700">{{ team }}</span>
                                    </label>
                                </div>
                                <div class="mt-2 text-sm text-gray-600">
                                    <span class="font-semibold">{{ selectedTeamsForComparison.length }}</span> team(s) selected
                                </div>
                            </div>
                        </div>

                        <!-- Compare Button -->
                        <div class="flex justify-end gap-3">
                            <button v-if="comparisonResults.show" @click="comparisonResults.show = false"
                                class="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 font-semibold">
                                <Icon icon="mdi:close" class="h-5 w-5" />
                                Clear Results
                            </button>
                            <button @click="compareTeams"
                                class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                :disabled="!canCompare">
                                <Icon icon="mdi:compare-horizontal" class="h-5 w-5" />
                                Compare Teams
                            </button>
                        </div>

                        <!-- Enhanced Comparison Results - Stock-style Left-Right Layout -->
                        <div v-if="comparisonResults.show" class="mt-6">
                            <div class="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-200 shadow-lg">
                                <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Icon icon="mdi:chart-box" class="mr-2 text-indigo-600" />
                                    Comparison Results
                                </h3>

                                <!-- Stats Summary -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div class="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-sm font-semibold text-green-600">Matched</p>
                                                <p class="text-3xl font-bold text-green-700">{{ comparisonResults.matched.length }}</p>
                                            </div>
                                            <Icon icon="mdi:check-circle" class="h-12 w-12 text-green-400" />
                                        </div>
                                    </div>
                                    <div class="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-sm font-semibold text-amber-600">Missing</p>
                                                <p class="text-3xl font-bold text-amber-700">{{ comparisonResults.missing.length }}</p>
                                            </div>
                                            <Icon icon="mdi:alert-circle" class="h-12 w-12 text-amber-400" />
                                        </div>
                                    </div>
                                    <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-sm font-semibold text-blue-600">Additional</p>
                                                <p class="text-3xl font-bold text-blue-700">{{ comparisonResults.extra.length }}</p>
                                            </div>
                                            <Icon icon="mdi:information" class="h-12 w-12 text-blue-400" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Side-by-Side Comparison -->
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <!-- Left: Input/Expected Teams -->
                                    <div class="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-md">
                                        <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center pb-3 border-b-2 border-gray-200">
                                            <Icon icon="mdi:clipboard-text" class="mr-2 text-indigo-600" />
                                            Your Input ({{ comparisonResults.matched.length + comparisonResults.missing.length }})
                                        </h4>
                                        <div class="space-y-3 max-h-96 overflow-y-auto">
                                            <!-- Matched in Input -->
                                            <div v-if="comparisonResults.matched.length > 0">
                                                <div class="flex items-center justify-between mb-2">
                                                    <p class="text-sm font-semibold text-green-600 flex items-center">
                                                        <Icon icon="mdi:check-circle" class="mr-1" />
                                                        Found ({{ comparisonResults.matched.length }})
                                                    </p>
                                                    <div class="flex gap-1">
                                                        <button @click="copyTeams(comparisonResults.matched, 'line')"
                                                            class="p-1 rounded hover:bg-green-100" title="Copy (one per line)">
                                                            <Icon icon="mdi:content-copy" class="h-4 w-4 text-green-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap gap-2">
                                                    <span v-for="team in comparisonResults.matched" :key="'matched-'+team"
                                                        class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-800 border-2 border-green-300 shadow-sm">
                                                        Team {{ team }}
                                                    </span>
                                                </div>
                                            </div>
                                            <!-- Missing in Input -->
                                            <div v-if="comparisonResults.missing.length > 0" class="pt-3">
                                                <div class="flex items-center justify-between mb-2">
                                                    <p class="text-sm font-semibold text-amber-600 flex items-center">
                                                        <Icon icon="mdi:alert-circle" class="mr-1" />
                                                        Not Found ({{ comparisonResults.missing.length }})
                                                    </p>
                                                    <div class="flex gap-1">
                                                        <button @click="copyTeams(comparisonResults.missing, 'line')"
                                                            class="p-1 rounded hover:bg-amber-100" title="Copy (one per line)">
                                                            <Icon icon="mdi:content-copy" class="h-4 w-4 text-amber-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap gap-2">
                                                    <span v-for="team in comparisonResults.missing" :key="'missing-'+team"
                                                        class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-amber-100 text-amber-800 border-2 border-amber-300 shadow-sm">
                                                        Team {{ team }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Right: Submission Data -->
                                    <div class="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-md">
                                        <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center pb-3 border-b-2 border-gray-200">
                                            <Icon icon="mdi:database" class="mr-2 text-indigo-600" />
                                            Submission Data ({{ comparisonResults.matched.length + comparisonResults.extra.length }})
                                        </h4>
                                        <div class="space-y-3 max-h-96 overflow-y-auto">
                                            <!-- Matched in Submission -->
                                            <div v-if="comparisonResults.matched.length > 0">
                                                <div class="flex items-center justify-between mb-2">
                                                    <p class="text-sm font-semibold text-green-600 flex items-center">
                                                        <Icon icon="mdi:check-circle" class="mr-1" />
                                                        In Your Input ({{ comparisonResults.matched.length }})
                                                    </p>
                                                    <div class="flex gap-1">
                                                        <button @click="copyTeams(comparisonResults.matched, 'line')"
                                                            class="p-1 rounded hover:bg-green-100" title="Copy (one per line)">
                                                            <Icon icon="mdi:content-copy" class="h-4 w-4 text-green-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap gap-2">
                                                    <span v-for="team in comparisonResults.matched" :key="'sub-matched-'+team"
                                                        class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-800 border-2 border-green-300 shadow-sm">
                                                        Team {{ team }}
                                                    </span>
                                                </div>
                                            </div>
                                            <!-- Extra in Submission -->
                                            <div v-if="comparisonResults.extra.length > 0" class="pt-3">
                                                <div class="flex items-center justify-between mb-2">
                                                    <p class="text-sm font-semibold text-blue-600 flex items-center">
                                                        <Icon icon="mdi:information" class="mr-1" />
                                                        Not in Your Input ({{ comparisonResults.extra.length }})
                                                    </p>
                                                    <div class="flex gap-1">
                                                        <button @click="copyTeams(comparisonResults.extra, 'line')"
                                                            class="p-1 rounded hover:bg-blue-100" title="Copy (one per line)">
                                                            <Icon icon="mdi:content-copy" class="h-4 w-4 text-blue-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap gap-2">
                                                    <span v-for="team in comparisonResults.extra" :key="'extra-'+team"
                                                        class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm">
                                                        Team {{ team }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SQL Modal -->
                    <Transition name="fade">
                        <div v-if="showSQLModal"
                            class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" @click.stop>
                                <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center">
                                    <h3 class="text-xl font-bold text-white flex items-center">
                                        <Icon icon="mdi:database" class="mr-2" />
                                        SQL Query for Event Teams
                                    </h3>
                                    <button @click="closeSQLModal"
                                        class="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                                        <Icon icon="mdi:close" class="h-6 w-6" />
                                    </button>
                                </div>
                                <div class="p-6">
                                    <p class="text-sm text-gray-600 mb-4">
                                        Use this SQL query to retrieve all teams for the selected event from your database:
                                    </p>
                                    <div class="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-auto border-2 border-gray-700 font-mono">
                                        <pre class="whitespace-pre-wrap">{{ sqlQuery }}</pre>
                                    </div>
                                    <div class="flex justify-end gap-3 mt-6">
                                        <button @click="closeSQLModal"
                                            class="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition-colors">
                                            Close
                                        </button>
                                        <button @click="copySQLQuery"
                                            class="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md font-semibold transition-all flex items-center gap-2">
                                            <Icon icon="mdi:content-copy" class="h-4 w-4" />
                                            Copy SQL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </section>
            </div>
        </main>
    </div>

    <!-- Image Modal -->
    <Transition name="fade">
        <div v-if="showImageModal"
            class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            @click="closeImageModal">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
                <div class="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-800">Robot Images</h3>
                    <button @click="closeImageModal"
                        class="text-gray-500 hover:text-gray-700 transition-colors duration-150 rounded-full p-1 hover:bg-gray-100">
                        <Icon icon="mdi:close" class="text-2xl" />
                    </button>
                </div>
                <div class="p-6">
                    <div v-if="modalImages.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="(image, index) in modalImages" :key="index"
                            class="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2 text-indigo-700">{{ image.category }}</h4>
                            <img :src="image.url" :alt="image.name"
                                class="max-w-full max-h-[40vh] object-contain rounded-lg shadow-md" />
                            <p class="mt-2 text-center text-gray-700">{{ image.name }}</p>
                            <p class="text-sm text-gray-500">{{ formatFileSize(image.size) }}</p>
                        </div>
                    </div>
                    <p v-else class="text-center text-gray-500 my-4">No images available</p>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Copy Confirmation Modal -->
    <Transition name="fade">
        <div v-if="showCopyModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border-t-4 border-indigo-500">
                <h3 class="text-xl font-bold mb-4 text-indigo-600 flex items-center">
                    <Icon icon="mdi:check-circle" class="mr-2 text-indigo-600" />
                    Copied Teams
                </h3>

                <p class="mb-4 text-gray-600">
                    The following teams have been copied to your clipboard:
                </p>

                <div class="bg-gray-100 p-4 rounded-md text-sm text-gray-800 overflow-auto max-h-40 border border-gray-300">
                    <pre>{{ copiedText }}</pre>
                </div>

                <div class="flex justify-end mt-4">
                    <button @click="closeCopyModal"
                        class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 shadow-md">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Error Modal -->
    <Transition name="fade">
        <div v-if="showErrorModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border-t-4 border-red-500">
                <h3 class="text-xl font-bold mb-4 text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" class="mr-2 text-red-600" />
                    Error
                </h3>

                <p class="mb-4 text-gray-600">
                    {{ errorMessage }}
                </p>

                <div class="flex justify-end">
                    <button @click="closeErrorModal"
                        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-md">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import axios from "axios";
import { Icon } from "@iconify/vue";
import { Bar } from "vue-chartjs";
import { throttle } from "lodash";
import { casdoorService } from "@/services/auth";
import CachedAvatar from "@/components/common/CachedAvatar.vue";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Define interfaces
interface SurveyData {
    [x: string]: any;
    id: number;
    event_id: string;
    form_id: string;
    data: Record<string, any>;
    upload: {
        fullRobotImages: { url: string; name: string; size: number }[];
        driveTrainImages: { url: string; name: string; size: number }[];
    };
    timestamp: string;
    user_data?: {
        username: string;
        displayName: string;
        userId: string;
        avatar: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    userData?: {
        username: string;
        displayName: string;
        userId: string;
        avatar: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    user_agent?: string;
    ip?: string;
    language?: string;
}

interface ModalImage {
    url: string;
    name: string;
    size: number;
    category: string;
}

interface QueryParams {
    eventId: string;
    formId: string;
    teamNumber: string;
}

interface ChartOptions {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
        legend: {
            display: boolean;
            position?: 'top' | 'left' | 'bottom' | 'right' | 'chartArea';
            labels?: {
                usePointStyle?: boolean;
                padding?: number;
                font?: {
                    size?: number;
                };
            };
        };
        tooltip: {
            callbacks: {
                label: (context: any) => string[];
            };
        };
    };
    scales: {
        x: {
            display?: boolean;
            ticks: {
                callback: (value: number, index: number, values: any[]) => string;
                maxRotation: number;
                minRotation: number;
            };
        };
        y: {
            beginAtZero: boolean;
            ticks: {
                precision: number;
            };
        };
    };
}

interface SubmissionUser {
    username: string;
    displayName: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    count: number;
    lastSubmission: string;
    userAgent: string;
    ip: string;
    language: string;
    submissionsByEvent: Record<string, Array<{
        id: number;
        teamNumber: string;
        timestamp: string;
    }>>;
}

// Reactive state
const surveyData = ref<SurveyData[]>([]);
const loading = ref(false);
const error = ref("");
const queryParams = ref<QueryParams>({
    eventId: "",
    formId: "",
    teamNumber: "",
});
const showImageModal = ref(false);
const modalImages = ref<ModalImage[]>([]);
const showEventRequiredError = ref(false);

// Dynamic field selection
const selectedFields = ref<string[]>([
    "Type of drive train",
    "Type of wheels used",
    "Intake Use:",
    "Scoring Locations:",
    "Cage Climbing:",
    "Additional Comments"
]);

// New state variables
const isSearching = ref(false);
const isChartSelectorOpen = ref(false);
const showColumnSelector = ref(false);
const selectedChartTypes = ref<string[]>([]);

// Enhanced drag and drop state
const draggedItem = ref<number>(-1);
const dragOverIndex = ref<number>(-1);
const isDragging = ref(false);
const placeholderStyle = ref({
    top: '0px',
    height: '0px',
    width: '100%',
    zIndex: '-1'
});
const draggableContainer = ref<HTMLElement | null>(null);
// draggableItems is intentionally not declared as it's not used in the current implementation

// Touch drag state for mobile
const touchStartY = ref(0);
const touchStartX = ref(0);
const touchCurrentY = ref(0);
const touchCurrentX = ref(0);
const touchCurrentIndex = ref(-1);
const touchItem = ref<HTMLElement | null>(null);
const touchScrolling = ref(false);
const touchDragging = ref(false);
const touchStartTime = ref(0);

// Table sorting and pagination
const sortField = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const pageSize = ref(10);
const tableFilter = ref('');

// Throttled search function
const handleSearch = throttle(async () => {
    if (isSearching.value) return;
    
    // Check if event is selected
    if (!queryParams.value.eventId) {
        showEventRequiredError.value = true;
        return;
    }
    
    showEventRequiredError.value = false;
    isSearching.value = true;
    try {
        // Refetch data with current filter parameters
        await fetchData();
    } catch (error) {
        console.error("Error during search:", error);
    } finally {
        isSearching.value = false;
    }
}, 1000, { trailing: false });

// Handle event selection change
const handleEventChange = () => {
    // Clear error message when event is selected
    showEventRequiredError.value = false;
    // Reset pagination to first page when changing event
    currentPage.value = 1;
    // Trigger search when event changes
    handleSearch();
};

// Load saved column preferences
const loadSavedPreferences = () => {
    try {
        const savedFields = localStorage.getItem('selectedFields');
        if (savedFields) {
            selectedFields.value = JSON.parse(savedFields);
        }

        const savedCharts = localStorage.getItem('selectedChartTypes');
        if (savedCharts) {
            selectedChartTypes.value = JSON.parse(savedCharts);
        }
    } catch (error) {
        console.error('Error loading saved preferences:', error);
    }
};

// Save column preferences
const savePreferences = () => {
    localStorage.setItem('selectedFields', JSON.stringify(selectedFields.value));
    localStorage.setItem('selectedChartTypes', JSON.stringify(selectedChartTypes.value));
};

// Fetch data from API
const fetchData = async () => {
    loading.value = true;
    error.value = "";
    try {
        // Get access token for authentication
        const token = casdoorService.getToken();
        
        // Add authorization header to request
        const response = await axios.get<any>("https://api.team695.com/survey/query", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Handle response data - API returns { success: true, data: [...], message: "..." }
        console.log("Raw API response:", response.data);
        
        // Extract the data array from the API response structure
        let data: SurveyData[] = [];
        
        if (response.data && typeof response.data === 'object') {
            // If response has a 'data' property, use it (API wrapped format)
            if (Array.isArray(response.data.data)) {
                data = response.data.data;
            } 
            // If response is directly an array, use it
            else if (Array.isArray(response.data)) {
                data = response.data;
            }
            // Otherwise, log the structure and fail gracefully
            else {
                console.warn("Unexpected response structure:", response.data);
                surveyData.value = [];
                error.value = "Invalid response format from server";
                return;
            }
        }
        
        // Ensure we have a valid array
        if (!Array.isArray(data) || data.length === 0) {
            console.warn("No survey data found in response");
            surveyData.value = [];
            error.value = "No survey data available";
            return;
        }
        
        console.log(`Found ${data.length} survey records in API response`);
        
        // Process and normalize the survey data
        surveyData.value = data.map(item => {
            // Parse JSON strings if needed
            if (typeof item.data === 'string') {
                try {
                    item.data = JSON.parse(item.data);
                } catch (e) {
                    console.warn("Failed to parse item.data:", e);
                    item.data = {};
                }
            }
            // Guard against non-object data to avoid runtime crashes
            if (!item.data || typeof item.data !== 'object' || Array.isArray(item.data)) {
                item.data = {};
            }
            
            if (typeof item.upload === 'string') {
                try {
                    item.upload = JSON.parse(item.upload);
                } catch (e) {
                    console.warn("Failed to parse item.upload:", e);
                    item.upload = { fullRobotImages: [], driveTrainImages: [] };
                }
            }
            // Guard against non-object upload to avoid runtime crashes
            if (!item.upload || typeof item.upload !== 'object' || Array.isArray(item.upload)) {
                item.upload = { fullRobotImages: [], driveTrainImages: [] };
            }

            // Map user_data to userData for backward compatibility
            if (item.user_data && !item.userData) {
                item.userData = item.user_data;
            }

            return item;
        });
        
        console.log(`Successfully loaded ${surveyData.value.length} survey records`);
        
        // Extract and log all unique event IDs
        const allEvents = Array.from(new Set(surveyData.value.map(s => s.event_id).filter(Boolean))).sort();
        console.log(`Available events: ${allEvents.join(', ')}`);
        
        // Auto-select first event if available and no event is selected yet
        if (allEvents.length > 0 && !queryParams.value.eventId) {
            queryParams.value.eventId = allEvents[0];
            console.log(`Auto-selected first event: ${allEvents[0]}`);
        }
    } catch (err: any) {
        console.error("Error fetching data:", err);
        // Check for authentication error
        if (err.response && err.response.status === 401) {
            error.value = "Authentication error. Please login again.";
            // Redirect to login if needed
            // window.location.href = '/login';
        } else if (err.response && err.response.status === 304) {
            // 304 Not Modified - data hasn't changed, this is acceptable
            console.log("Data not modified (304). Using cached data if available.");
            if (surveyData.value.length === 0) {
                // No cached data available
                error.value = "No data available. Please refresh the page.";
            }
        } else {
            error.value = err.message || "Failed to fetch data. Please try again later.";
        }
        
        // Only clear data if we haven't already loaded some
        if (surveyData.value.length === 0) {
            surveyData.value = [];
        }
    } finally {
        loading.value = false;
    }
};

// Handle clicks outside of dropdowns
const handleClickOutside = (event: MouseEvent) => {
    if (isChartSelectorOpen.value) {
        const target = event.target as HTMLElement;
        if (!target.closest('.chart-selector')) {
            isChartSelectorOpen.value = false;
        }
    }
};

// Prevent text selection during drag operations
const preventTextSelection = (event: Event) => {
    if (isDragging.value || touchDragging.value) {
        event.preventDefault();
    }
};

// Initialize data on component mount
onMounted(() => {
    loadSavedPreferences();
    // Fetch all data on page load
    fetchData();
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('selectstart', preventTextSelection);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('selectstart', preventTextSelection);
});

// Computed properties
const uniqueEventIds = computed(() => {
    // Extract unique event IDs from survey data and filter out empty ones
    const eventIds = new Set(
        surveyData.value
            .map(survey => survey.event_id)
            .filter((id): id is string => !!id) // Type guard to filter out null/undefined
    );
    // Return sorted array for consistent display
    return Array.from(eventIds).sort();
});

const filteredSurveyData = computed(() => {
    return surveyData.value.filter(survey => {
        const eventIdMatch = !queryParams.value.eventId || survey.event_id === queryParams.value.eventId;
        const formIdMatch = !queryParams.value.formId || survey.form_id === queryParams.value.formId;
        const teamNumberMatch = !queryParams.value.teamNumber ||
            getFieldValue(survey.data, "Team number") === queryParams.value.teamNumber;
        return eventIdMatch && formIdMatch && teamNumberMatch;
    });
});

// Auto-select first event when data loads and no event is selected
watch(uniqueEventIds, (newIds) => {
    if (newIds.length > 0 && !queryParams.value.eventId) {
        queryParams.value.eventId = newIds[0];
        console.log(`Auto-selected event from dropdown: ${newIds[0]}`);
    }
});

// Get unique team count for the selected event
const uniqueTeamCount = computed(() => {
    const teams = new Set();
    filteredSurveyData.value.forEach(survey => {
        const teamNumber = getFieldValue(survey.data, "Team number");
        if (teamNumber) {
            teams.add(teamNumber);
        }
    });
    return teams.size;
});

// Get last updated time
const lastUpdatedTime = computed(() => {
    if (filteredSurveyData.value.length === 0) return 'N/A';
    
    const timestamps = filteredSurveyData.value.map(survey => new Date(survey.timestamp).getTime());
    const latestTimestamp = Math.max(...timestamps);
    return formatDate(new Date(latestTimestamp).toISOString());
});

// Table filtering and sorting
const filteredTableData = computed(() => {
    if (!tableFilter.value.trim()) return filteredSurveyData.value;
    
    const searchTerm = tableFilter.value.toLowerCase();
    return filteredSurveyData.value.filter(survey => {
        // Search in team number
        const teamNumber = getFieldValue(survey.data, "Team number")?.toString().toLowerCase() || '';
        if (teamNumber.includes(searchTerm)) return true;
        
        // Search in user data - Use optional chaining and default values for object property access to avoid type errors
        const userData = (survey.user_data || survey.userData || {}) as {
            username?: string;
            displayName?: string;
        };
        const username = userData.username?.toLowerCase() || '';
        const displayName = userData.displayName?.toLowerCase() || '';
        if (username.includes(searchTerm) || displayName.includes(searchTerm)) return true;
        
        // Search in selected fields
        for (const field of selectedFields.value) {
            const value = formatFieldValue(survey.data, field).toLowerCase();
            if (value.includes(searchTerm)) return true;
        }
        
        return false;
    });
});
// Sort table data
const sortTable = (field: string) => {
    if (sortField.value === field) {
        // Toggle direction if same field
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to ascending
        sortField.value = field;
        sortDirection.value = 'asc';
    }
    
    // Reset to first page when sorting
    currentPage.value = 1;
};

// Get sort icon based on current sort state
const getSortIcon = (field: string) => {
    if (sortField.value !== field) return 'mdi:sort';
    return sortDirection.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending';
};

// Sorted and filtered data
const sortedTableData = computed(() => {
    const data = [...filteredTableData.value];
    
    if (!sortField.value) return data;
    
    return data.sort((a, b) => {
        let valueA, valueB;
        
        if (sortField.value === 'teamNumber') {
            valueA = getFieldValue(a.data, "Team number") || '';
            valueB = getFieldValue(b.data, "Team number") || '';
        } else if (sortField.value === 'submittedBy') {
            // Make sure to use optional chaining and default values for object property access to avoid type errors
            const userDataA = (a.user_data || a.userData || {}) as { displayName?: string; username?: string };
            const userDataB = (b.user_data || b.userData || {}) as { displayName?: string; username?: string };
            
            valueA = userDataA.displayName || userDataA.username || '';
            valueB = userDataB.displayName || userDataB.username || '';
        } else {
            valueA = getFieldValue(a.data, sortField.value) || '';
            valueB = getFieldValue(b.data, sortField.value) || '';
        }
        
        // Process numbers and strings differently
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortDirection.value === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // Transform to string for comparison
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        
        return sortDirection.value === 'asc' 
            ? strA.localeCompare(strB) 
            : strB.localeCompare(strA);
    });
});

// Pagination
const totalPages = computed(() => {
    return Math.max(1, Math.ceil(sortedTableData.value.length / pageSize.value));
});

// Reset page when filter changes
watch(tableFilter, () => {
    currentPage.value = 1;
});

// Paginated data
const paginatedAndFilteredData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return sortedTableData.value.slice(startIndex, startIndex + pageSize.value);
});

// Pagination display values
const paginationStart = computed(() => {
    if (sortedTableData.value.length === 0) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
    if (sortedTableData.value.length === 0) return 0;
    return Math.min(currentPage.value * pageSize.value, sortedTableData.value.length);
});

// Export to CSV
const exportToCSV = () => {
    if (filteredSurveyData.value.length === 0) {
        showError('No data to export');
        return;
    }
    
    try {
        // 创建表头
        const headers = ['Team Number', 'Submitted By', 'Timestamp', ...selectedFields.value];
        
        // 创建数据行
        const rows = filteredSurveyData.value.map(survey => {
            // 使用类型断言确保访问安全
            const userData = (survey.user_data || survey.userData || {}) as {
                displayName?: string;
                username?: string;
            };
            
            const row = [
                getFieldValue(survey.data, "Team number") || 'N/A',
                userData.displayName || userData.username || 'Unknown',
                formatDate(survey.timestamp)
            ];
            
            // 为每个选定的字段添加数据
            selectedFields.value.forEach(field => {
                row.push(formatFieldValue(survey.data, field));
            });
            
            return row;
        });
        
        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${queryParams.value.eventId || 'pit-scouting'}_export_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        showError('Failed to export data');
    }
};

// Get initials for user avatar
const getUserInitialsValue = (user: SubmissionUser): string => {
    if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.displayName) {
        const parts = user.displayName.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return user.displayName.substring(0, 2).toUpperCase();
    }
    
    if (user.username) {
        return user.username.substring(0, 2).toUpperCase();
    }
    
    return user.userId.substring(0, 2).toUpperCase();
};

// Get initials from survey user data
const getUserInitialsFromSurvey = (survey: SurveyData): string => {
    // Make sure userData is a valid object by providing a default value to avoid empty object access issues
    const userData = (survey.user_data || survey.userData || {}) as {
        firstName?: string;
        lastName?: string;
        displayName?: string;
        username?: string;
        userId?: string;
    };
    
    if (userData.firstName && userData.lastName) {
        return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    
    if (userData.displayName) {
        const parts = userData.displayName.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return userData.displayName.substring(0, 2).toUpperCase();
    }
    
    if (userData.username) {
        return userData.username.substring(0, 2).toUpperCase();
    }
    
    return (userData.userId || 'XX').substring(0, 2).toUpperCase();
};

// Add comment to indicate this is intentionally unused variable
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const groupedSurveyData = computed(() => {
    const grouped: Record<string, SurveyData[]> = {};
    filteredSurveyData.value.forEach(survey => {
        if (!grouped[survey.event_id]) {
            grouped[survey.event_id] = [];
        }
        grouped[survey.event_id].push(survey);
    });
    return grouped;
});

// Get all available fields from the data
const availableFields = computed(() => {
    const fields = new Set<string>();
    filteredSurveyData.value.forEach(survey => {
        Object.keys(survey.data).forEach(key => {
            if (key !== "Team number") { // Team number is always shown
                fields.add(key);
            }
        });
    });
    return Array.from(fields);
});

// Fields that are available but not selected
const availableFieldsNotSelected = computed(() => {
    return availableFields.value.filter(field => !selectedFields.value.includes(field));
});

// Fields suitable for charts (arrays or categorical data)
const availableChartFields = computed(() => {
    const chartableFields = new Set<string>();

    filteredSurveyData.value.forEach(survey => {
        Object.entries(survey.data).forEach(([key, value]) => {
            // Include array fields or string fields that aren't too long
            if (Array.isArray(value) ||
                (typeof value === 'string' && value.length < 50) ||
                typeof value === 'number') {
                chartableFields.add(key);
            }
        });
    });

    // Remove fields that aren't suitable for charts
    chartableFields.delete("Team number");
    chartableFields.delete("Additional Comments");

    return Array.from(chartableFields);
});

// Filter out measurement-related fields from charts
const filteredChartFields = computed(() => {
    const measurementRegex = /height|width|weight|length/i;
    return availableChartFields.value.filter(field => !measurementRegex.test(field));
});


// For team number expansion in Submission Users
const expandedTeams = ref<Record<string, string[]>>({});

const toggleTeamExpand = (userId: string, eventId: string) => {
    const key = `${userId}-${eventId}`;
    if (!expandedTeams.value[key]) {
        expandedTeams.value[key] = [];
    }

    if (expandedTeams.value[key].includes(eventId)) {
        expandedTeams.value[key] = expandedTeams.value[key].filter(id => id !== eventId);
    } else {
        expandedTeams.value[key].push(eventId);
    }
};

const isTeamExpanded = (userId: string, eventId: string): boolean => {
    const key = `${userId}-${eventId}`;
    return expandedTeams.value[key]?.includes(eventId) || false;
};


// ------ Data Table Functions ------ //
// For copying user ID
const copiedId = ref('');

// Copy text to clipboard and show checkmark
const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        copiedId.value = text;
        setTimeout(() => {
            copiedId.value = '';
        }, 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

// Check if a string is a URL
const isUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
        // Simple check for http:// or https:// prefix
        return value.startsWith('http://') || value.startsWith('https://');
    } catch (e) {
        return false;
    }
};

// Format URL for display (truncate)
const formatUrl = (url: string): string => {
    if (!url) return '';

    try {
        // Parse the URL
        const parsedUrl = new URL(url);
        // Get the hostname and pathname
        const hostname = parsedUrl.hostname;
        const pathname = parsedUrl.pathname;

        // Truncate the pathname if it's too long
        const maxPathLength = 15;
        const truncatedPath = pathname.length > maxPathLength
            ? pathname.substring(0, maxPathLength) + '...'
            : pathname;

        return `${hostname}${truncatedPath}`;
    } catch (e) {
        // If URL parsing fails, just truncate the string
        return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
};

// Compute submission users from filtered survey data
const submissionUsers = computed(() => {
    const users: Record<string, SubmissionUser> = {};

    filteredSurveyData.value.forEach(survey => {
        // Use either user_data or userData property
        const userData = survey.user_data || survey.userData;
        
        if (userData && userData.userId) {
            const userId = userData.userId;

            if (!users[userId]) {
                users[userId] = {
                    userId,
                    username: userData.username || 'Unknown',
                    displayName: userData.displayName || userData.username || 'Unknown',
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    avatar: userData.avatar || '',
                    count: 0,
                    lastSubmission: survey.timestamp,
                    // Add device info
                    userAgent: survey.user_agent || 'Unknown',
                    ip: survey.ip || 'Unknown',
                    language: survey.language || 'Unknown',
                    // Add submissions grouped by event
                    submissionsByEvent: {}
                };
            }

            users[userId].count++;

            // Group submissions by event ID
            const eventId = survey.event_id;
            if (!users[userId].submissionsByEvent[eventId]) {
                users[userId].submissionsByEvent[eventId] = [];
            }

            // Add team number information to submissions
            const teamNumber = getFieldValue(survey.data, "Team number");
            if (teamNumber) {
                users[userId].submissionsByEvent[eventId].push({
                    id: survey.id,
                    teamNumber: String(teamNumber),
                    timestamp: survey.timestamp
                });
            }

            // Update last submission timestamp if this one is more recent
            if (new Date(survey.timestamp) > new Date(users[userId].lastSubmission)) {
                users[userId].lastSubmission = survey.timestamp;
            }
        }
    });

    // Return sorted by submission count (most active first)
    return Object.values(users).sort((a, b) => b.count - a.count);
});

// Detect browser and OS from user agent
const getBrowserInfo = (userAgent: string): string => {
    let browserInfo = "Unknown";

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
        browserInfo = "Chrome";
    } else if (userAgent.includes("Firefox")) {
        browserInfo = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        browserInfo = "Safari";
    } else if (userAgent.includes("Edg")) {
        browserInfo = "Edge";
    } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
        browserInfo = "Internet Explorer";
    }

    if (userAgent.includes("Windows")) {
        browserInfo += " on Windows";
    } else if (userAgent.includes("Mac")) {
        browserInfo += " on Mac";
    } else if (userAgent.includes("Linux")) {
        browserInfo += " on Linux";
    } else if (userAgent.includes("Android")) {
        browserInfo += " on Android";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        browserInfo += " on iOS";
    }

    return browserInfo;
};

// Get device type from user agent
const getDeviceType = (userAgent: string): string => {
    if (userAgent.includes("Mobile")) {
        return "Mobile";
    } else if (userAgent.includes("Tablet")) {
        return "Tablet";
    } else {
        return "Desktop";
    }
};

// Helper function to safely get field values
const getFieldValue = (data: Record<string, any>, field: string): any => {
    return data[field];
};

// Format field values for display
const formatFieldValue = (data: Record<string, any>, field: string): string => {
    const value = getFieldValue(data, field);

    if (value === null || value === undefined) {
        return "N/A";
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
};

// Format field names for display
const formatFieldName = (field: string): string => {
    // Remove trailing colon if present
    const cleanField = field.endsWith(':') ? field.slice(0, -1) : field;
    return cleanField;
};

// Format date for display
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

// Generate chart data for a given field
const generateChartData = (field: string) => {
    const dataMap: Record<string, string[]> = {};

    filteredSurveyData.value.forEach(survey => {
        const value = getFieldValue(survey.data, field);
        const teamNumber = getFieldValue(survey.data, "Team number");

        if (Array.isArray(value)) {
            value.forEach(item => {
                if (!dataMap[item]) dataMap[item] = [];
                dataMap[item].push(teamNumber);
            });
        } else if (value !== null && value !== undefined) {
            const key = String(value);
            if (!dataMap[key]) dataMap[key] = [];
            dataMap[key].push(teamNumber);
        }
    });

    // Create a dataset for each unique value
    const datasets = Object.entries(dataMap).map(([label, teams], index) => {
        const hue = (index * 137) % 360;
        return {
            label: label, // This will show in the legend
            data: [teams.length], // Single value for this category
            backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
            borderColor: `hsla(${hue}, 70%, 60%, 1)`,
            borderWidth: 1,
            teamNumbers: teams, // Store team numbers for tooltip
        };
    });

    const chartData = {
        labels: [''], // Single empty label since we're using the legend
        datasets: datasets,
    };

    return { data: chartData };
};

// Chart options
const getChartOptions = (): ChartOptions => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        const teamNumbers = context.dataset.teamNumbers || [];

                        return [
                            `${label}: ${value} teams`,
                            'Teams:',
                            ...teamNumbers.map((team: string) => `  ${team}`)
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                display: false, // Hide x-axis since we're using legend
                ticks: {
                    callback: (_: string | number, index: number, values: any[]): string => {
                        const labels = values[index].label || '';
                        return labels.length > 20 ? labels.substring(0, 20) + '...' : labels;
                    },
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };
};

// Check if a survey has images
const hasImages = (survey: SurveyData): boolean => {
    return (
        (survey.upload?.fullRobotImages && survey.upload.fullRobotImages.length > 0) ||
        (survey.upload?.driveTrainImages && survey.upload.driveTrainImages.length > 0)
    );
};

// Open image modal
const openImageModal = (survey: SurveyData) => {
    modalImages.value = [];

    if (survey.upload?.fullRobotImages) {
        modalImages.value.push(...survey.upload.fullRobotImages.map(img => ({ ...img, category: 'Full Robot' })));
    }

    if (survey.upload?.driveTrainImages) {
        modalImages.value.push(...survey.upload.driveTrainImages.map(img => ({ ...img, category: 'Drive Train' })));
    }

    showImageModal.value = true;
};

// Close image modal
const closeImageModal = () => {
    showImageModal.value = false;
    modalImages.value = [];
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Chart selector toggles
const toggleChartType = (field: string) => {
    const index = selectedChartTypes.value.indexOf(field);
    if (index === -1) {
        selectedChartTypes.value.push(field);
    } else {
        selectedChartTypes.value.splice(index, 1);
    }
    savePreferences();
};

// Prevent multi-selection during drag operations
const preventMultiSelection = () => {
    // Clear any existing selection
    window.getSelection()?.removeAllRanges();

    // Prevent default browser behavior that might cause text selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    }, { once: true });
};

// Enhanced HTML5 Drag and Drop functions
const dragStart = (event: DragEvent, index: number) => {
    // Clear any existing selection
    window.getSelection()?.removeAllRanges();

    draggedItem.value = index;
    isDragging.value = true;

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';

        // Set data to ensure drag works across browsers
        event.dataTransfer.setData('text/plain', index.toString());

        // Create a custom drag image
        const element = event.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();

        // Update placeholder style
        placeholderStyle.value = {
            top: `${element.offsetTop}px`,
            height: `${rect.height}px`,
            width: '100%',
            zIndex: '-1'
        };

        // Add a class to the body to indicate dragging state
        document.body.classList.add('dragging-active');
    }
};

const dragOver = (event: DragEvent, index: number) => {
    event.preventDefault();

    // Update the placeholder position
    if (draggedItem.value !== -1 && draggedItem.value !== index) {
        const element = event.currentTarget as HTMLElement;
        placeholderStyle.value = {
            top: `${element.offsetTop}px`,
            height: `${element.offsetHeight}px`,
            width: '100%',
            zIndex: '1'
        };
    }
};

const dragEnter = (event: DragEvent, index: number) => {
    dragOverIndex.value = index;

    // Highlight the drop target
    const element = event.currentTarget as HTMLElement;
    element.classList.add('bg-indigo-100', 'border-2', 'border-indigo-500');
};

const dragLeave = (event: DragEvent, index: number) => {
    if (dragOverIndex.value === index) {
        dragOverIndex.value = -1;
    }

    // Remove highlight from the drop target
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('bg-indigo-100', 'border-2', 'border-indigo-500');
};

const drop = (event: DragEvent, index: number) => {
    event.preventDefault();

    // Remove highlight from the drop target
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('bg-indigo-100', 'border-2', 'border-indigo-500');

    if (draggedItem.value !== -1 && draggedItem.value !== index) {
        // Get the dragged item
        const item = selectedFields.value[draggedItem.value];
        // Remove it from the array
        selectedFields.value.splice(draggedItem.value, 1);
        // Add it at the new position
        selectedFields.value.splice(index, 0, item);
        // Save the new order
        savePreferences();
    }

    // Reset drag state
    dragOverIndex.value = -1;
};

const dragEnd = () => {
    isDragging.value = false;
    draggedItem.value = -1;
    dragOverIndex.value = -1;

    // Remove dragging class from body
    document.body.classList.remove('dragging-active');

    // Remove any lingering highlight classes
    document.querySelectorAll('.bg-indigo-100, .border-indigo-500').forEach(el => {
        el.classList.remove('bg-indigo-100', 'border-2', 'border-indigo-500');
    });
};

// Improved Touch-based drag and drop for mobile devices
const touchStart = (event: TouchEvent, index: number) => {
    // Store the starting position, time, and element
    touchStartY.value = event.touches[0].clientY;
    touchStartX.value = event.touches[0].clientX;
    touchCurrentY.value = touchStartY.value;
    touchCurrentX.value = touchStartX.value;
    touchCurrentIndex.value = index;
    touchItem.value = event.currentTarget as HTMLElement;
    touchStartTime.value = Date.now();
    
    // Don't add visual feedback immediately - wait to see if it's a drag or scroll
    touchScrolling.value = false;
    touchDragging.value = false;

    // Add a delay to distinguish between tap and drag
    setTimeout(() => {
        if (!touchScrolling.value && !touchDragging.value) {
            touchDragging.value = true;
            touchItem.value?.classList.add('bg-indigo-200', 'shadow-lg', 'scale-[1.02]', 'z-10');
            isDragging.value = true;
        }
    }, 200); // Adjust the delay as needed
};

const touchMove = (event: TouchEvent, _index: number) => {
    if (touchItem.value === null || touchCurrentIndex.value === -1) return;

    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const deltaY = currentY - touchStartY.value;
    const deltaX = currentX - touchStartX.value;

    // Update current position
    touchCurrentY.value = currentY;
    touchCurrentX.value = currentX;

    // Determine if this is a scroll or a drag
    // If horizontal movement is greater than vertical, it's likely a scroll
    if (!touchDragging.value && !touchScrolling.value) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            touchScrolling.value = true;
            return; // Allow normal scrolling
        }
    }

    if (!touchDragging.value) return;

    const container = draggableContainer.value;
    if (!container || !container.children) return;

    // Find the element we're currently over
    const elements = Array.from(container.children) as HTMLElement[];
    let targetIndex = -1;

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();

        if (currentY >= rect.top && currentY <= rect.bottom) {
            targetIndex = i;
            break;
        }
    }

    // If we found a valid target and it's different from the current item
    if (targetIndex !== -1 && targetIndex !== touchCurrentIndex.value) {
        // Remove highlight from all items
        elements.forEach(el => {
            el.classList.remove('border-2', 'border-indigo-500');
        });

        // Highlight the target
        elements[targetIndex].classList.add('border-2', 'border-indigo-500');

        // Update placeholder position for visual feedback
        placeholderStyle.value = {
            top: `${elements[targetIndex].offsetTop}px`,
            height: `${elements[targetIndex].offsetHeight}px`,
            width: '100%',
            zIndex: '1'
        };

        dragOverIndex.value = targetIndex;
    }

    // Move the dragged item with the touch
    if (touchDragging.value) {
        // Apply transform to move the element with the finger
        const translateY = currentY - touchStartY.value;
        touchItem.value.style.transform = `translateY(${translateY}px) scale(1.02)`;
        event.preventDefault(); // Prevent scrolling while dragging
    }
};

const touchEnd = (_event: TouchEvent) => {
    if (touchItem.value === null || touchCurrentIndex.value === -1) return;

    // Reset transform
    touchItem.value.style.transform = '';

    // Only process if we were dragging (not scrolling)
    if (touchDragging.value) {
        const container = draggableContainer.value;

        if (container && container.children) {
            // If we have a valid target index different from the current
            if (dragOverIndex.value !== -1 && dragOverIndex.value !== touchCurrentIndex.value) {
                // Get the dragged item
                const item = selectedFields.value[touchCurrentIndex.value];
                // Remove it from the array
                selectedFields.value.splice(touchCurrentIndex.value, 1);
                // Add it at the new position
                selectedFields.value.splice(dragOverIndex.value, 0, item);
                // Save the new order
                savePreferences();
            }

            // Reset all visual states
            Array.from(container.children).forEach(el => {
                (el as HTMLElement).classList.remove('border-2', 'border-indigo-500');
            });
        }
    }

    resetTouchState();
};

const resetTouchState = () => {
    if (touchItem.value) {
        touchItem.value.classList.remove('bg-indigo-200', 'shadow-lg', 'scale-[1.02]', 'z-10');
        touchItem.value.style.transform = '';
    }
    
    touchStartY.value = 0;
    touchStartX.value = 0;
    touchCurrentY.value = 0;
    touchCurrentX.value = 0;
    touchCurrentIndex.value = -1;
    touchItem.value = null;
    touchDragging.value = false;
    touchScrolling.value = false;
    isDragging.value = false;
    dragOverIndex.value = -1;
};

// Column selector functions
const addField = (field: string) => {
    if (!selectedFields.value.includes(field)) {
        selectedFields.value.push(field);
        savePreferences();
    }
};

const removeField = (field: string) => {
    const index = selectedFields.value.indexOf(field);
    if (index !== -1) {
        selectedFields.value.splice(index, 1);
        savePreferences();
    }
};

const resetColumns = () => {
    selectedFields.value = [
        "Type of drive train",
        "Type of wheels used",
        "Intake Use:",
        "Scoring Locations:",
        "Cage Climbing:",
        "Additional Comments"
    ];
    savePreferences();
};

// ----- Team Comparison Functions ------ //
const comparisonEventId = ref('');
const teamNumbersInput = ref('');
const comparisonMode = ref<'manual' | 'select'>('manual');
const selectedTeamsForComparison = ref<string[]>([]);

const comparisonResults = ref({
    show: false,
    matched: [] as string[],
    missing: [] as string[],
    extra: [] as string[]
});

// Get available teams for the selected event
const availableTeamsInEvent = computed(() => {
    if (!comparisonEventId.value) return [];
    
    const teams = new Set<string>();
    surveyData.value
        .filter(survey => survey.event_id === comparisonEventId.value)
        .forEach(survey => {
            const teamNumber = getFieldValue(survey.data, "Team number");
            if (teamNumber) teams.add(String(teamNumber));
        });
    
    return Array.from(teams).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
    });
});

// Select all teams
const selectAllTeams = () => {
    selectedTeamsForComparison.value = [...availableTeamsInEvent.value];
};

// Check if comparison can proceed
const canCompare = computed(() => {
    if (!comparisonEventId.value) return false;
    if (comparisonMode.value === 'manual') {
        return teamNumbersInput.value.trim().length > 0;
    } else {
        return selectedTeamsForComparison.value.length > 0;
    }
});

const compareTeams = () => {
    if (!canCompare.value) return;

    let inputTeams: string[] = [];
    
    // Get input teams based on mode
    if (comparisonMode.value === 'manual') {
        // Parse input team numbers (support both comma-separated and newline-separated)
        inputTeams = teamNumbersInput.value
            .split(/[\n,]+/)
            .map(team => team.trim())
            .filter(team => team !== '');
    } else {
        // Use selected teams
        inputTeams = [...selectedTeamsForComparison.value];
    }
    
    // Sort input teams
    inputTeams = inputTeams.sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
    });

    // Get all team numbers from the selected event (submission data)
    const eventTeams = surveyData.value
        .filter(survey => survey.event_id === comparisonEventId.value)
        .map(survey => getFieldValue(survey.data, "Team number"))
        .filter(team => team !== undefined && team !== null)
        .map(team => String(team))
        .sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
        });

    // Find matches, missing, and extra teams
    const matched = inputTeams.filter(team => eventTeams.includes(team));
    const missing = inputTeams.filter(team => !eventTeams.includes(team));
    const extra = eventTeams.filter(team => !inputTeams.includes(team));

    // Update results
    comparisonResults.value = {
        show: true,
        matched,
        missing,
        extra
    };
};

const showSQLModal = ref(false);
const sqlQuery = computed(() => {
    // Get the year and event code from the comparisonEventId
    // Default to 'your_event_code' if not provided
    const [year, eventCodeRaw] = (comparisonEventId.value || 'your_event_code').split('_');
    const currentYear = parseInt(year) || new Date().getFullYear(); // If year is not valid, use current year
    const eventCode = eventCodeRaw?.toLowerCase() || 'your_event_code'; // Transform to lowercase

    return `SELECT DISTINCT team_master_tm_number FROM game_matchup WHERE frc_season_master_sm_year = ${currentYear} AND competition_master_cm_event_code = '${eventCode}'`;
});

const openSQLModal = () => {
    if (!comparisonEventId.value) {
        showError('Please select an event first.');
        return;
    }
    showSQLModal.value = true;
};

const closeSQLModal = () => {
    showSQLModal.value = false;
};

const copySQLQuery = () => {
    navigator.clipboard.writeText(sqlQuery.value).then(() => {
        showCopyModal.value = true;
        copiedText.value = sqlQuery.value;
    }).catch(() => {
        showError('Failed to copy SQL query.');
    });
};

const showErrorModal = ref(false);
const errorMessage = ref('');
const showCopyModal = ref(false);
const copiedText = ref('');

const showError = (message: string) => {
    errorMessage.value = message;
    showErrorModal.value = true;
};

const closeCopyModal = () => {
    showCopyModal.value = false;
};

const closeErrorModal = () => {
    showErrorModal.value = false;
};

const copyTeams = (teams: string[], format: 'line' | 'comma') => {
    const text = format === 'line' ? teams.join('\n') : teams.join(', ');
    navigator.clipboard.writeText(text).then(() => {
        copiedText.value = text;
        showCopyModal.value = true;
    }).catch((err) => {
        console.error('Failed to copy text:', err);
        showError('Failed to copy teams to clipboard.');
    });
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Enhanced drag and drop styles */
[draggable=true] {
    user-select: none;
    -webkit-user-drag: element;
}

/* Prevent text selection during drag */
.dragging-active {
    cursor: grabbing !important;
    user-select: none;
}

.dragging-active * {
    user-select: none;
}

/* Improved touch handling */
.drag-handle {
    cursor: move;
    cursor: -webkit-grab;
    cursor: grab;
    touch-action: none; /* Prevent scrolling when trying to drag on touch devices */
}

.drag-handle:active {
    cursor: -webkit-grabbing;
    cursor: grabbing;
}
</style>

<style>
/* Add transitions for dropdowns */
.chart-selector-enter-active,
.chart-selector-leave-active {
    transition: all 0.3s ease;
}

.chart-selector-enter-from,
.chart-selector-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>