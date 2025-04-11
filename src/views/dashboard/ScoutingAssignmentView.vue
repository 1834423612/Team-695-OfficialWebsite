<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Page Header -->
        <div class="px-4 py-6 sm:px-0 mb-6">
            <div class="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg shadow-lg overflow-hidden">
                <div class="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">
                            Scouting Assignments
                        </h2>
                        <p class="mt-2 text-teal-100">
                            Manage and track team scouting tasks for FRC competitions
                        </p>
                    </div>
                    <div v-if="isAdmin" class="mt-4 md:mt-0 md:ml-6">
                        <button @click="openCreateModal"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
                            <Icon icon="mdi:plus" class="mr-2 h-5 w-5" />
                            Create Assignment
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Event Selection -->
        <div class="px-4 sm:px-0 mb-6">
            <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 sm:mb-0">Select Event</h3>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative">
                            <select v-model="selectedEvent" @change="loadAssignments"
                                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                <option v-for="event in events" :key="event.key" :value="event.key">
                                    {{ event.name }} ({{ event.key }})
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <Icon icon="mdi:chevron-down" class="h-5 w-5" />
                            </div>
                        </div>
                        <button @click="refreshData"
                            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
                            <Icon icon="mdi:refresh" class="mr-2 h-5 w-5" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="px-4 sm:px-0 mb-6">
            <div class="bg-white rounded-lg shadow p-8 flex justify-center">
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    <p class="mt-4 text-gray-600">Loading assignments...</p>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-4 sm:px-0 mb-6">
            <div class="bg-red-50 rounded-lg shadow p-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <Icon icon="mdi:alert-circle" class="h-6 w-6 text-red-500" />
                    </div>
                    <div class="ml-3">
                        <h3 class="text-lg font-medium text-red-800">Error loading assignments</h3>
                        <div class="mt-2 text-red-700">
                            <p>{{ error }}</p>
                        </div>
                        <div class="mt-4">
                            <button @click="refreshData"
                                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!assignments.length" class="px-4 sm:px-0 mb-6">
            <div class="bg-white rounded-lg shadow p-8 text-center">
                <Icon icon="mdi:clipboard-text-outline" class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
                <p class="mt-1 text-gray-500">
                    {{ isAdmin ? 'Create a new assignment to get started.' : 'You have no assignments for this event.'
                    }}
                </p>
                <div v-if="isAdmin" class="mt-6">
                    <button @click="openCreateModal"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <Icon icon="mdi:plus" class="mr-2 h-5 w-5" />
                        Create Assignment
                    </button>
                </div>
            </div>
        </div>

        <!-- Assignments Tabs -->
        <div v-else class="px-4 sm:px-0 mb-6">
            <div class="bg-white rounded-lg shadow">
                <!-- Tab Navigation -->
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px" aria-label="Tabs">
                        <button @click="activeTab = 'all'"
                            class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
                            :class="activeTab === 'all' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                            <Icon :icon="activeTab === 'all' ? 'mdi:view-dashboard' : 'mdi:view-dashboard-outline'"
                                class="h-5 w-5 inline-block mr-2" />
                            All Assignments
                        </button>
                        <button @click="activeTab = 'my'"
                            class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
                            :class="activeTab === 'my' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                            <Icon :icon="activeTab === 'my' ? 'mdi:account-check' : 'mdi:account-check-outline'"
                                class="h-5 w-5 inline-block mr-2" />
                            My Assignments
                        </button>
                    </nav>
                </div>

                <!-- Assignments List -->
                <div class="overflow-hidden">
                    <div class="px-4 py-5 sm:p-6">
                        <!-- Filter Controls -->
                        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div class="flex items-center">
                                <span class="mr-3 text-sm font-medium text-gray-700">Filter by:</span>
                                <div class="flex flex-wrap gap-2">
                                    <button @click="filterType = 'all'"
                                        class="px-3 py-1 rounded-full text-xs font-medium"
                                        :class="filterType === 'all' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">
                                        All Types
                                    </button>
                                    <button @click="filterType = 'scouting'"
                                        class="px-3 py-1 rounded-full text-xs font-medium"
                                        :class="filterType === 'scouting' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">
                                        Match Scouting
                                    </button>
                                    <button @click="filterType = 'pit-scouting'"
                                        class="px-3 py-1 rounded-full text-xs font-medium"
                                        :class="filterType === 'pit-scouting' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">
                                        Pit Scouting
                                    </button>
                                </div>
                            </div>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" />
                                </div>
                                <input v-model="searchQuery" type="text" placeholder="Search assignments..."
                                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                            </div>
                        </div>

                        <!-- Assignments Grid -->
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div v-for="assignment in filteredAssignments" :key="assignment.id"
                                class="bg-white overflow-hidden shadow rounded-lg border hover:shadow-md transition-shadow duration-300"
                                :class="{
                                    'border-blue-200': assignment.task_type === 'scouting',
                                    'border-purple-200': assignment.task_type === 'pit-scouting'
                                }">
                                <div class="px-4 py-5 sm:p-6">
                                    <!-- Assignment Header -->
                                    <div class="flex justify-between items-start">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 rounded-md p-2" :class="{
                                                'bg-blue-100': assignment.task_type === 'scouting',
                                                'bg-purple-100': assignment.task_type === 'pit-scouting'
                                            }">
                                                <Icon
                                                    :icon="assignment.task_type === 'scouting' ? 'mdi:clipboard-text' : 'mdi:robot'"
                                                    class="h-6 w-6" :class="{
                                                        'text-blue-600': assignment.task_type === 'scouting',
                                                        'text-purple-600': assignment.task_type === 'pit-scouting'
                                                    }" />
                                            </div>
                                            <div class="ml-3">
                                                <h3 class="text-lg font-medium text-gray-900">
                                                    {{ assignment.task_type === 'scouting' ? 'Match Scouting' : 'Pit Scouting' }}
                                                </h3>
                                                <p class="text-sm text-gray-500">ID: {{ assignment.id }}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                :class="{
                                                    'bg-yellow-100 text-yellow-800': assignment.status === 'pending',
                                                    'bg-blue-100 text-blue-800': assignment.status === 'in_progress',
                                                    'bg-green-100 text-green-800': assignment.status === 'completed',
                                                    'bg-gray-100 text-gray-800': assignment.status === 'canceled'
                                                }">
                                                {{ formatStatus(assignment.status) }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Assignment Details -->
                                    <div class="mt-4 space-y-3">
                                        <!-- Assigned Teams (for pit-scouting) -->
                                        <div
                                            v-if="assignment.task_type === 'pit-scouting' && assignment.assigned_team_numbers?.length">
                                            <h4 class="text-sm font-medium text-gray-500">Assigned Teams:</h4>
                                            <div class="mt-1 flex flex-wrap gap-2">
                                                <span v-for="team in assignment.assigned_team_numbers" :key="team"
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                                    Team {{ team }}
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Assigned Alliance & Matches (for match scouting) -->
                                        <div v-if="assignment.task_type === 'scouting'">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <h4 class="text-sm font-medium text-gray-500">Alliance:</h4>
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium mt-1"
                                                        :class="assignment.assigned_alliance === 'red' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                                                        {{ assignment.assigned_alliance === 'red' ? 'Red Alliance' :
                                                        'Blue Alliance' }}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 class="text-sm font-medium text-gray-500">Matches:</h4>
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 mt-1">
                                                        {{ assignment.assigned_matches || 'Not specified' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Assignees - Updated to show multiple users -->
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-500">Assigned To:</h4>
                                            <div class="mt-1 space-y-2">
                                                <div v-for="(assignee, idx) in getAssigneesList(assignment)" :key="idx"
                                                    class="flex items-center">
                                                    <div class="flex-shrink-0">
                                                        <img v-if="assignee.avatar" :src="assignee.avatar"
                                                            alt="Assignee Avatar"
                                                            class="h-8 w-8 rounded-full object-cover" />
                                                        <div v-else
                                                            class="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                            <Icon icon="mdi:account" class="h-5 w-5 text-teal-600" />
                                                        </div>
                                                    </div>
                                                    <div class="ml-3">
                                                        <div class="flex items-center">
                                                            <p class="text-sm font-medium text-gray-900 flex items-center flex-wrap">
                                                                <span>{{ assignee.displayName || formatUsername(assignee.name) || 'Unknown' }}</span>
                                                                <span v-if="assignee.id === userData.id" class="text-xs text-teal-600 ml-1">(You)</span>
                                                                <span v-if="getUserGroups(assignee).length > 0" class="ml-1 flex gap-1 flex-wrap">
                                                                    <span v-for="(group, index) in getUserGroups(assignee)" 
                                                                          :key="index" 
                                                                          class="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700">
                                                                        {{ capitalizeFirstLetter(group) }}
                                                                    </span>
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div class="text-xs text-gray-500">
                                                            {{ formatUsername(assignee.name) }} · {{
                                                            assignee.email || 'No email' }}
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Show count if there are more than 2 users -->
                                                <div v-if="getAssigneesList(assignment).length > 2"
                                                    class="text-xs text-gray-500">
                                                    + {{ getAssigneesList(assignment).length - 2 }} more users
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Notes -->
                                        <div v-if="assignment.notes">
                                            <h4 class="text-sm font-medium text-gray-500">Notes:</h4>
                                            <p class="mt-1 text-sm text-gray-700 line-clamp-2">{{ assignment.notes }}
                                            </p>
                                        </div>

                                        <!-- Timestamps -->
                                        <div class="flex justify-between text-xs text-gray-500">
                                            <span>Created: {{ formatDate(assignment.created_at) }}</span>
                                            <span>Updated: {{ formatDate(assignment.updated_at) }}</span>
                                        </div>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="mt-5 flex justify-between">
                                        <button v-if="isUserInAssignment(assignment, userData.id)"
                                            @click="updateAssignmentStatus(assignment)"
                                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                            :class="{
                                                'bg-yellow-600 hover:bg-yellow-700': assignment.status === 'pending',
                                                'bg-blue-600 hover:bg-blue-700': assignment.status === 'in_progress',
                                                'bg-green-600 hover:bg-green-700': assignment.status === 'completed',
                                                'bg-gray-400 cursor-not-allowed': assignment.status === 'canceled'
                                            }" :disabled="assignment.status === 'canceled'">
                                            {{ getNextStatusButtonText(assignment.status) }}
                                        </button>
                                        <div v-if="isAdmin" class="flex space-x-2">
                                            <button @click="editAssignment(assignment)"
                                                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                                <Icon icon="mdi:pencil" class="h-4 w-4" />
                                            </button>
                                            <button @click="confirmDeleteAssignment(assignment)"
                                                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                                <Icon icon="mdi:delete" class="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Assignment Modal -->
        <Transition name="fade">
            <div v-if="showModal" class="modal-container">
                <!-- Fixed position backdrop that covers the entire viewport -->
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"></div>

                <!-- Modal content -->
                <div class="fixed inset-0 z-50 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4">
                        <div class="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl overflow-visible">
                            <!-- Close button in top-right corner -->
                            <button @click="showModal = false"
                                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10">
                                <Icon icon="mdi:close" class="h-6 w-6" />
                            </button>

                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div
                                        class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Icon :icon="editingAssignment ? 'mdi:pencil' : 'mdi:plus'"
                                            class="h-6 w-6 text-teal-600" />
                                    </div>
                                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {{ editingAssignment ? 'Edit Assignment' : 'Create New Assignment' }}
                                        </h3>
                                        <div class="mt-4 space-y-4">
                                            <!-- Event Key (disabled when editing) -->
                                            <div>
                                                <label for="event_key"
                                                    class="block text-sm font-medium text-gray-700">Event</label>
                                                <select id="event_key" v-model="formData.event_key"
                                                    :disabled="!!editingAssignment"
                                                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                                                    :class="{ 'bg-gray-100': !!editingAssignment }">
                                                    <option v-for="event in events" :key="event.key" :value="event.key">
                                                        {{ event.name }} ({{ event.key }})
                                                    </option>
                                                </select>
                                            </div>

                                            <!-- Task Type -->
                                            <div>
                                                <label for="task_type"
                                                    class="block text-sm font-medium text-gray-700">Task Type</label>
                                                <select id="task_type" v-model="formData.task_type"
                                                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                                    <option value="scouting">Match Scouting</option>
                                                    <option value="pit-scouting">Pit Scouting</option>
                                                </select>
                                            </div>

                                            <!-- Assigned Teams (for pit-scouting) -->
                                            <div v-if="formData.task_type === 'pit-scouting'">
                                                <label for="assigned_team_numbers"
                                                    class="block text-sm font-medium text-gray-700">Assigned
                                                    Teams</label>
                                                <div class="mt-1">
                                                    <input id="assigned_team_numbers" v-model="teamNumbersInput"
                                                        type="text"
                                                        placeholder="Enter team numbers separated by commas (e.g., 695, 254, 1114)"
                                                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                                </div>
                                                <p class="mt-1 text-xs text-gray-500">Current teams: {{
                                                    formData.assigned_team_numbers?.join(', ') || 'None' }}</p>
                                            </div>

                                            <!-- Alliance & Matches (for match scouting) -->
                                            <div v-if="formData.task_type === 'scouting'"
                                                class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label for="assigned_alliance"
                                                        class="block text-sm font-medium text-gray-700">Alliance</label>
                                                    <select id="assigned_alliance" v-model="formData.assigned_alliance"
                                                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                                        <option value="red">Red Alliance</option>
                                                        <option value="blue">Blue Alliance</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="assigned_matches"
                                                        class="block text-sm font-medium text-gray-700">Match
                                                        Range</label>
                                                    <input id="assigned_matches" v-model="formData.assigned_matches"
                                                        type="text" placeholder="e.g., Q3-Q12"
                                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                                </div>
                                            </div>

                                            <!-- Assignees - Updated for multiple selection -->
                                            <div class="relative">
                                                <label for="assignee-search"
                                                    class="block text-sm font-medium text-gray-700">Assign To</label>

                                                <!-- Selected users display -->
                                                <div v-if="selectedAssignees.length > 0"
                                                    class="mt-2 flex flex-wrap gap-2">
                                                    <div v-for="(assignee, idx) in selectedAssignees" :key="idx"
                                                        class="inline-flex items-center bg-gray-100 rounded-full pl-2 pr-1 py-1">
                                                        <div class="flex-shrink-0 mr-1">
                                                            <img v-if="assignee.avatar" :src="assignee.avatar"
                                                                alt="User Avatar"
                                                                class="h-6 w-6 rounded-full object-cover" />
                                                            <div v-else
                                                                class="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
                                                                <Icon icon="mdi:account"
                                                                    class="h-4 w-4 text-teal-600" />
                                                            </div>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-800">
                                                            {{ assignee.displayName || formatUsername(assignee.name) }}
                                                        </span>
                                                        <button @click="removeSelectedAssignee(assignee)"
                                                            class="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                                                            <Icon icon="mdi:close" class="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div class="relative mt-2">
                                                    <!-- Search input -->
                                                    <div class="relative">
                                                        <input id="assignee-search" type="text"
                                                            v-model="userSearchQuery" @focus="showUserDropdown = true"
                                                            @input="showUserDropdown = true" @click.stop
                                                            placeholder="Search to add more users..."
                                                            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                                        <div
                                                            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <button v-if="userSearchQuery"
                                                            @click.stop="userSearchQuery = ''; showUserDropdown = true"
                                                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <Icon icon="mdi:close"
                                                                class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                        </button>
                                                    </div>

                                                    <!-- User dropdown - Fixed positioning to prevent cutoff -->
                                                    <div v-if="showUserDropdown && filteredUnselectedUsers.length > 0"
                                                        class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                                                        style="max-height: 300px;" @click.stop>
                                                        <div v-for="user in filteredUnselectedUsers" :key="user.id"
                                                            @mousedown.prevent="addSelectedAssignee(user)"
                                                            class="cursor-pointer hover:bg-gray-100 px-4 py-2">
                                                            <div class="flex items-center">
                                                                <div class="flex-shrink-0">
                                                                    <img v-if="user.avatar" :src="user.avatar"
                                                                        alt="User Avatar"
                                                                        class="h-8 w-8 rounded-full object-cover" />
                                                                    <div v-else
                                                                        class="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                                        <Icon icon="mdi:account"
                                                                            class="h-5 w-5 text-teal-600" />
                                                                    </div>
                                                                </div>
                                                                <div class="ml-3">
                                                                    <div class="flex items-center">
                                                                        <p class="text-sm font-medium text-gray-900">
                                                                            <span v-if="getUserGroups(user).length > 0"
                                                                                class="flex gap-1 flex-wrap">
                                                                                {{ user.displayName ||
                                                                                formatUsername(user.name) }}
                                                                                <span v-if="user.id === userData.id"
                                                                                    class="text-xs text-teal-600">(You)</span>
                                                                                <span
                                                                                    v-if="getUserGroups(user).length > 0"
                                                                                    class="ml-1 flex gap-1 flex-wrap">
                                                                                    <span
                                                                                        v-for="(group, index) in getUserGroups(user)"
                                                                                        :key="index"
                                                                                        class="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700">{{
                                                                                        capitalizeFirstLetter(group)
                                                                                        }}</span>
                                                                                </span>
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    <div class="text-xs text-gray-500">
                                                                        {{ formatUsername(user.name || '') }} · {{
                                                                        user.email || 'No email' }}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- No results message -->
                                            <div v-if="showUserDropdown && userSearchQuery && filteredUnselectedUsers.length === 0"
                                                class="mt-1 w-full bg-white shadow-lg rounded-md py-4 px-4 text-center text-base ring-1 ring-black ring-opacity-5 sm:text-sm">
                                                <p class="text-gray-500">No users found matching "{{ userSearchQuery }}"
                                                </p>
                                            </div>

                                            <!-- Status (only for editing) -->
                                            <div v-if="editingAssignment">
                                                <label for="status"
                                                    class="block text-sm font-medium text-gray-700">Status</label>
                                                <select id="status" v-model="formData.status"
                                                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="canceled">Canceled</option>
                                                </select>
                                            </div>

                                            <!-- Notes -->
                                            <div>
                                                <label for="notes"
                                                    class="block text-sm font-medium text-gray-700">Notes</label>
                                                <textarea id="notes" v-model="formData.notes" rows="3"
                                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                    placeholder="Add any additional instructions or notes"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button @click="submitForm" type="button"
                                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    :disabled="!selectedAssignees.length">
                                    {{ editingAssignment ? 'Update' : 'Create' }}
                                </button>
                                <button @click="showModal = false" type="button"
                                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
        <div v-if="showDeleteModal" class="modal-container">
            <!-- Fixed position backdrop that covers the entire viewport -->
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"></div>

            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl overflow-hidden">
                        <!-- Close button in top-right corner -->
                        <button @click="showDeleteModal = false"
                            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:close" class="h-6 w-6" />
                        </button>

                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div
                                    class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <Icon icon="mdi:alert" class="h-6 w-6 text-red-600" />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Delete Assignment
                                    </h3>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500">
                                            Are you sure you want to delete this assignment? This action cannot be
                                            undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button @click="deleteAssignment" type="button"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Delete
                            </button>
                            <button @click="showDeleteModal = false" type="button"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { casdoorService } from '@/services/auth';
import Swal from 'sweetalert2';

export default defineComponent({
    name: 'ScoutingAssignments',
    components: {
        Icon
    },
    setup() {
        // User store
        const userStore = useUserStore();
        const { userInfo } = storeToRefs(userStore);

        // User data
        const userData = computed(() => userInfo.value || {});

        // Check if user is admin
        const isAdmin = computed(() => {
            if (userData.value.isAdmin) return true;
            if (userData.value.groups && Array.isArray(userData.value.groups)) {
                return userData.value.groups.includes('admin');
            }
            return false;
        });

        // State variables
        const loading = ref(false);
        const error = ref('');
        const assignments = ref<any[]>([]);
        const events = ref([
            { key: '2025ohcl', name: '2025 Buckeye Regional' },
        ]);
        const selectedEvent = ref('2025ohcl');
        const activeTab = ref('all');
        const filterType = ref('all');
        const searchQuery = ref('');

        // Modal state
        const showModal = ref(false);
        const showDeleteModal = ref(false);
        const editingAssignment = ref<any>(null);
        const assignmentToDelete = ref<any>(null);

        // Team members
        const teamMembers = ref<any[]>([]);

        // Form data - Updated for multiple assignees
        const formData = ref({
            event_key: '2025ohcl',
            task_type: 'scouting',
            assigned_team_numbers: [] as number[],
            assigned_alliance: 'red',
            assigned_matches: '',
            assignees_data: [] as any[], // Changed from single assignee_data to array
            notes: '',
            status: 'pending'
        });

        // For multiple assignees selection
        const selectedAssignees = ref<any[]>([]);

        // For team numbers input
        const teamNumbersInput = ref('');

        // Filtered assignments
        const filteredAssignments = computed(() => {
            let filtered = assignments.value;

            // Filter by tab
            if (activeTab.value === 'my') {
                filtered = filtered.filter(a =>
                    isUserInAssignment(a, userData.value.id)
                );
            }

            // Filter by type
            if (filterType.value !== 'all') {
                filtered = filtered.filter(a => a.task_type === filterType.value);
            }

            // Filter by search query
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase();
                filtered = filtered.filter(a => {
                    // Check if any assignee matches the search
                    const assigneesMatch = getAssigneesList(a).some((assignee: { displayName: string; name: string; email: string; }) => 
                        (assignee.displayName?.toLowerCase().includes(query)) ||
                        (assignee.name?.toLowerCase().includes(query)) ||
                        (assignee.email?.toLowerCase().includes(query))
                    );
                    
                    return assigneesMatch || 
                        (a.notes && a.notes.toLowerCase().includes(query)) ||
                        (a.assigned_team_numbers && a.assigned_team_numbers.some((t: number) => t.toString().includes(query))) ||
                        (a.assigned_matches && a.assigned_matches.toLowerCase().includes(query));
                });
            }

            return filtered;
        });

        // Format username
        const formatUsername = (username: string) => {
            if (!username) return 'Unknown User';
            const parts = username.split('/');
            return parts.length > 1 ? parts[1] : username;
        };

        // Get user groups - remove Team695/ prefix
        const getUserGroups = (user: any) => {
            if (!user || !user.groups) return [];
            return Array.isArray(user.groups) ? user.groups.map((group: string) => group.replace('Team695/', '')) : [];
        };
        // const getUserGroups = (user: any) => {
        //     if (!user || !user.groups) return [];
        //     return Array.isArray(user.groups) ? user.groups : [];
        // };
        
        // Get assignees list - handles both legacy single assignee and new multiple assignees
        const getAssigneesList = (assignment: any) => {
            if (assignment.assignees_data && Array.isArray(assignment.assignees_data)) {
                return assignment.assignees_data;
            } else if (assignment.assignee_data) {
                // Legacy support for single assignee
                return [assignment.assignee_data];
            }
            return [];
        };

        // Capitalize first letter of a string
        const capitalizeFirstLetter = (string: string) => {
            if (!string) return '';
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        
        // Check if user is in assignment assignees
        const isUserInAssignment = (assignment: any, userId: string) => {
            if (!assignment || !userId) return false;
            
            const assigneesList = getAssigneesList(assignment);
            return assigneesList.some((assignee: { id: string; }) => assignee.id === userId);
        };

        // Load assignments
        const loadAssignments = async () => {
            loading.value = true;
            error.value = '';

            try {
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Determine which endpoint to use based on user role
                const endpoint = isAdmin.value
                    ? `https://api.team695.com/api/assignments/events/${selectedEvent.value}`
                    : `https://api.team695.com/api/assignments/user/${selectedEvent.value}`;

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load assignments: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success) {
                    assignments.value = data.data || [];
                } else {
                    throw new Error(data.message || 'Failed to load assignments');
                }
            } catch (err: any) {
                console.error('Error loading assignments:', err);
                error.value = err.message || 'Failed to load assignments. Please try again.';
            } finally {
                loading.value = false;
            }
        };

        // Load team members (admin only)
        const loadTeamMembers = async () => {
            if (!isAdmin.value) return;

            try {
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await fetch('https://api.team695.com/api/auth/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load team members: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success && data.data && data.data.data) {
                    teamMembers.value = data.data.data;
                } else {
                    throw new Error(data.message || 'Failed to load team members');
                }
            } catch (err: any) {
                console.error('Error loading team members:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to load team members. You may not be able to create new assignments.',
                    icon: 'error'
                });
            }
        };

        // Refresh data
        const refreshData = () => {
            loadAssignments();
            if (isAdmin.value) {
                loadTeamMembers();
            }
        };

        // Format date
        const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Format status
        const formatStatus = (status: string) => {
            switch (status) {
                case 'pending': return 'Pending';
                case 'in_progress': return 'In Progress';
                case 'completed': return 'Completed';
                case 'canceled': return 'Canceled';
                default: return status;
            }
        };

        // Get next status button text
        const getNextStatusButtonText = (status: string) => {
            switch (status) {
                case 'pending': return 'Start Assignment';
                case 'in_progress': return 'Mark Complete';
                case 'completed': return 'Reopen';
                case 'canceled': return 'Canceled';
                default: return 'Update Status';
            }
        };

        // Update assignment status
        const updateAssignmentStatus = async (assignment: any) => {
            let newStatus;
            switch (assignment.status) {
                case 'pending': newStatus = 'in_progress'; break;
                case 'in_progress': newStatus = 'completed'; break;
                case 'completed': newStatus = 'in_progress'; break;
                default: return;
            }

            try {
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await fetch(`https://api.team695.com/api/assignments/${assignment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    throw new Error(`Failed to update assignment: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success) {
                    // Update the assignment in the local array
                    const index = assignments.value.findIndex((a: any) => a.id === assignment.id);
                    if (index !== -1) {
                        assignments.value[index] = data.data;
                    }

                    Swal.fire({
                        title: 'Success',
                        text: `Assignment status updated to ${formatStatus(newStatus)}`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(data.message || 'Failed to update assignment');
                }
            } catch (err: any) {
                console.error('Error updating assignment status:', err);
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'Failed to update assignment status. Please try again.',
                    icon: 'error'
                });
            }
        };

        // For enhanced user selection
        const userSearchQuery = ref('');
        const showUserDropdown = ref(false);
        
        // Filtered users that haven't been selected yet
        const filteredUnselectedUsers = computed(() => {
            // Get all user IDs that are already selected
            const selectedUserIds = new Set(selectedAssignees.value.map(user => user.id));
            
            // Filter users that aren't already selected
            let availableUsers = teamMembers.value.filter(user => !selectedUserIds.has(user.id));
            
            // Apply search query if present
            if (userSearchQuery.value) {
                const query = userSearchQuery.value.toLowerCase();
                availableUsers = availableUsers.filter(user =>
                    (user.name && user.name.toLowerCase().includes(query)) ||
                    (user.displayName && user.displayName.toLowerCase().includes(query)) ||
                    (user.email && user.email.toLowerCase().includes(query))
                );
            }
            
            return availableUsers;
        });

        // Add a user to selected assignees
        const addSelectedAssignee = (user: any) => {
            selectedAssignees.value.push(user);
            userSearchQuery.value = '';
            
            // Update form data
            formData.value.assignees_data = selectedAssignees.value.map(assignee => ({
                id: assignee.id,
                name: assignee.name,
                displayName: assignee.displayName,
                avatar: assignee.avatar,
                email: assignee.email,
                groups: assignee.groups
            }));
        };

        // Remove a user from selected assignees
        const removeSelectedAssignee = (user: any) => {
            selectedAssignees.value = selectedAssignees.value.filter(u => u.id !== user.id);
            
            // Update form data
            formData.value.assignees_data = selectedAssignees.value.map(assignee => ({
                id: assignee.id,
                name: assignee.name,
                displayName: assignee.displayName,
                avatar: assignee.avatar,
                email: assignee.email,
                groups: assignee.groups
            }));
        };

        // Open create modal
        const openCreateModal = () => {
            editingAssignment.value = null;
            formData.value = {
                event_key: selectedEvent.value,
                task_type: 'scouting',
                assigned_team_numbers: [],
                assigned_alliance: 'red',
                assigned_matches: '',
                assignees_data: [],
                notes: '',
                status: 'pending'
            };
            teamNumbersInput.value = '';
            selectedAssignees.value = [];
            userSearchQuery.value = '';
            showModal.value = true;
        };

        // Edit assignment
        const editAssignment = (assignment: any) => {
            editingAssignment.value = assignment;
            formData.value = {
                event_key: assignment.event_key,
                task_type: assignment.task_type,
                assigned_team_numbers: assignment.assigned_team_numbers || [],
                assigned_alliance: assignment.assigned_alliance || 'red',
                assigned_matches: assignment.assigned_matches || '',
                assignees_data: [],
                notes: assignment.notes || '',
                status: assignment.status
            };
            teamNumbersInput.value = assignment.assigned_team_numbers ? assignment.assigned_team_numbers.join(', ') : '';
            
            // Set the selected assignees for the enhanced UI
            if (assignment.assignees_data && Array.isArray(assignment.assignees_data)) {
                selectedAssignees.value = [...assignment.assignees_data];
                formData.value.assignees_data = [...assignment.assignees_data];
            } else if (assignment.assignee_data) {
                // Legacy support for single assignee
                selectedAssignees.value = [assignment.assignee_data];
                formData.value.assignees_data = [assignment.assignee_data];
            } else {
                selectedAssignees.value = [];
            }

            showModal.value = true;
        };

        // Confirm delete assignment
        const confirmDeleteAssignment = (assignment: any) => {
            assignmentToDelete.value = assignment;
            showDeleteModal.value = true;
        };

        // Delete assignment
        const deleteAssignment = async () => {
            if (!assignmentToDelete.value) return;

            try {
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await fetch(`https://api.team695.com/api/assignments/${assignmentToDelete.value.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete assignment: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success) {
                    // Remove the assignment from the local array
                    assignments.value = assignments.value.filter((a: any) => a.id !== assignmentToDelete.value.id);

                    showDeleteModal.value = false;
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The assignment has been deleted.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(data.message || 'Failed to delete assignment');
                }
            } catch (err: any) {
                console.error('Error deleting assignment:', err);
                showDeleteModal.value = false;
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'Failed to delete assignment. Please try again.',
                    icon: 'error'
                });
            }
        };

        // Submit form
        const submitForm = async () => {
            // Process team numbers input
            if (formData.value.task_type === 'pit-scouting' && teamNumbersInput.value) {
                formData.value.assigned_team_numbers = teamNumbersInput.value
                    .split(',')
                    .map(num => parseInt(num.trim()))
                    .filter(num => !isNaN(num));
            }

            // Validate that at least one assignee is selected
            if (!formData.value.assignees_data.length) {
                Swal.fire({
                    title: 'Error',
                    text: 'Please select at least one user to assign this task to',
                    icon: 'error'
                });
                return;
            }

            try {
                const token = casdoorService.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Add assigner data (current user)
                const assignerData = {
                    id: userData.value.id,
                    name: userData.value.name,
                    displayName: userData.value.displayName,
                    avatar: userData.value.avatar,
                    email: userData.value.email,
                    groups: userData.value.groups
                };

                if (editingAssignment.value) {
                    // Update existing assignment
                    const response = await fetch(`https://api.team695.com/api/assignments/${editingAssignment.value.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            assigned_team_numbers: formData.value.assigned_team_numbers,
                            assigned_alliance: formData.value.assigned_alliance,
                            assigned_matches: formData.value.assigned_matches,
                            status: formData.value.status,
                            notes: formData.value.notes,
                            assignees_data: formData.value.assignees_data
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update assignment: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.success) {
                        // Update the assignment in the local array
                        const index = assignments.value.findIndex((a: any) => a.id === editingAssignment.value.id);
                        if (index !== -1) {
                            assignments.value[index] = data.data;
                        }

                        showModal.value = false;
                        Swal.fire({
                            title: 'Success',
                            text: 'Assignment updated successfully',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        throw new Error(data.message || 'Failed to update assignment');
                    }
                } else {
                    // Create new assignment with assigner data
                    const postData = {
                        ...formData.value,
                        assigner_data: assignerData
                    };
                    
                    const response = await fetch('https://api.team695.com/api/assignments', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to create assignment: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.success) {
                        // Add the new assignment to the local array
                        assignments.value.push(data.data);

                        showModal.value = false;
                        Swal.fire({
                            title: 'Success',
                            text: 'Assignment created successfully',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        throw new Error(data.message || 'Failed to create assignment');
                    }
                }
            } catch (err: any) {
                console.error('Error submitting form:', err);
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'Failed to save assignment. Please try again.',
                    icon: 'error'
                });
            }
        };

        // Watch for event changes
        watch(selectedEvent, () => {
            loadAssignments();
        });

        // Load data on mount
        onMounted(() => {
            // Initialize the store to get user data
            userStore.initializeStore();

            // Load assignments and team members
            loadAssignments();
            if (isAdmin.value) {
                loadTeamMembers();
            }

            // Add event listener for clicks outside dropdown
            document.addEventListener('click', (e) => {
                // Only close dropdown if it's open and the click isn't on the dropdown or search input
                if (showUserDropdown.value) {
                    const target = e.target as HTMLElement;
                    const dropdown = document.querySelector('.user-dropdown');
                    const searchInput = document.getElementById('assignee-search');

                    // Check if click is outside dropdown and search input
                    if (!dropdown?.contains(target) && target !== searchInput) {
                        showUserDropdown.value = false;
                    }
                }
            });
        });

        return {
            userData,
            isAdmin,
            loading,
            error,
            assignments,
            events,
            selectedEvent,
            activeTab,
            filterType,
            searchQuery,
            filteredAssignments,
            showModal,
            showDeleteModal,
            editingAssignment,
            formData,
            teamMembers,
            teamNumbersInput,
            loadAssignments,
            refreshData,
            formatDate,
            formatStatus,
            formatUsername,
            getUserGroups,
            getAssigneesList,
            capitalizeFirstLetter,
            isUserInAssignment,
            getNextStatusButtonText,
            updateAssignmentStatus,
            openCreateModal,
            editAssignment,
            confirmDeleteAssignment,
            deleteAssignment,
            submitForm,
            userSearchQuery,
            showUserDropdown,
            selectedAssignees,
            filteredUnselectedUsers,
            addSelectedAssignee,
            removeSelectedAssignee
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Modal container styles */
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
}

/* Ensure modals are centered and properly layered */
.fixed.inset-0.z-40,
.fixed.inset-0.z-50 {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

/* Make sure the modal content is visible */
.overflow-visible {
    overflow: visible !important;
}

/* Add a class for the user dropdown to target it in event handlers */
.user-dropdown {
    position: relative;
    z-index: 60;
}
</style>