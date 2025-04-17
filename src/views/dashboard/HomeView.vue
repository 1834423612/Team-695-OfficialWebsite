<template>
    <div class="px-2 py-2 md:px-6 min-h-screen bg-gray-50">
        <!-- Welcome Banner -->
        <div class="px-2 py-6 sm:px-0 mb-6">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
                <div class="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">
                            Welcome back, {{ userData.firstName || (userData.displayName ?
                            userData.displayName.split(' ')[0] : userData.name) }}!
                        </h2>
                        <p class="mt-2 text-blue-100">
                            {{ new Date().toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day:
                            'numeric'
                            }) }}
                        </p>
                    </div>
                    <div class="mt-4 md:mt-0 md:ml-6">
                        <router-link to="/Dashboard/profile"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View Profile
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Information Section -->
        <!-- <div class="px-4 sm:px-0 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Version Info</h2>
            <div
                class="bg-rose-50 border-rose-200 border-2 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                <div class="p-5 flex items-start sm:items-center"> -->
        <!-- Icon -->
        <!-- <div class="flex-shrink-0 sm:p-2">
                        <Icon icon="line-md:bell-filled" class="h-6 w-6 text-rose-500 sm:h-8 sm:w-8" />
                    </div> -->
        <!-- Text Content -->
        <!-- <div class="flex flex-col">
                        <div class="ml-3 flex-1">
                            <h3 class="text-sm font-medium text-gray-900 sm:text-lg">
                                <span class="block text-md sm:text-lg font-semibold">Current Version:</span>
                                <span
                                    class="ml-0 mt-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md inline-block">
                                    Beta_feat-DB_PR_0.4.102
                                </span>
                            </h3>
                        </div>
                        <p class="ml-3 text-xs sm:text-sm sm:font-medium text-gray-500 mt-2">
                            Features marked with a
                            <Icon icon="ic:round-lock" class="inline h-4 w-4 text-gray-600 sm:h-5 sm:w-5" /> icon are
                            under development.
                        </p>
                    </div>
                </div>
            </div>
        </div> -->
        <VersionInfo />

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

                <router-link to="/Dashboard/Pit-Scouting"
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

                <a href="https://sso.team695.com"
                    class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div class="p-5 flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-pink-100 rounded-md p-3">
                                <Icon icon="mdi:security-lock" class="h-6 w-6 text-pink-500" />
                            </div>
                            <div class="ml-5">
                                <h3 class="text-lg font-medium text-gray-900">695 SSO Auth</h3>
                                <p class="text-sm text-gray-500">Unified user authentication platform</p>
                            </div>
                        </div>
                        <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
                    </div>
                </a>

                <router-link to="/Dashboard/assignments"
                    class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div class="p-5 flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                                <Icon icon="mdi:clipboard-list" class="h-6 w-6 text-green-600" />
                            </div>
                            <div class="ml-5">
                                <h3 class="text-lg font-medium text-gray-900">Assignments</h3>
                                <p class="text-sm text-gray-500">View and manage your tasks</p>
                            </div>
                        </div>
                    </div>
                </router-link>

                <!-- FRC Divisions.co -->
                <a href="https://frc.divisions.co/" target="_blank"
                    class="relative bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                    <!-- Ribbon Tag -->
                    <div
                        class="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-md z-10">
                        Third-Party
                    </div>
                    <div class="p-5 pt-6 flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                <Icon icon="mdi:bug-check" class="h-6 w-6 text-indigo-600" />
                            </div>
                            <div class="ml-5">
                                <h3 class="text-lg font-medium text-gray-900">FRC Divisions.co</h3>
                                <p class="text-sm text-gray-500">Check teams and divisions</p>
                            </div>
                        </div>
                        <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
                    </div>
                </a>

                <!-- <a href="#"
                    class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
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
                    <router-link to="/Dashboard/Pit-Scouting/Admin"
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

                    <!-- Umami Website Analytics -->
                    <a href="https://tj.fastbirdcdn.online/teams/54dfd432-60e1-4c64-99f9-d46094f5998e/dashboard"
                        target="_blank"
                        class="relative bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                        <!-- Ribbon Tag -->
                        <div
                            class="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-md z-10">
                            Third-Party
                        </div>
                        <div class="p-5 pt-6 flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                    <Icon icon="mdi:chart-bar" class="h-6 w-6 text-amber-500" />
                                </div>
                                <div class="ml-5">
                                    <h3 class="text-lg font-medium text-gray-900">Umami Website Analytics</h3>
                                    <p class="text-sm text-gray-500">View website traffic and usage stats</p>
                                </div>
                            </div>
                            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
                        </div>
                    </a>

                    <!-- KJCH Server Status -->
                    <a href="https://status.fastbirdcdn.online" target="_blank"
                        class="relative bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                        <!-- Ribbon Tag -->
                        <div
                            class="absolute top-0 right-0 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-bl-md z-10">
                            Third-Party
                        </div>
                        <div class="p-5 pt-6 flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 bg-gray-100 rounded-md p-3">
                                    <Icon icon="mdi:server" class="h-6 w-6 text-gray-800" />
                                </div>
                                <div class="ml-5">
                                    <h3 class="text-lg font-medium text-gray-900">KJCH Server Status</h3>
                                    <p class="text-sm text-gray-500">Check server uptime and performance</p>
                                </div>
                            </div>
                            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
                        </div>
                    </a>

                    <!-- KJCH Website PageSpy -->
                    <a href="https://report.fastbirdcdn.online" target="_blank"
                        class="relative bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                        <!-- Ribbon Tag -->
                        <div
                            class="absolute top-0 right-0 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-md z-10">
                            Third-Party
                        </div>
                        <div class="p-5 pt-6 flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 bg-rose-100 rounded-md p-3">
                                    <Icon icon="mdi:bug-check" class="h-6 w-6 text-rose-600" />
                                </div>
                                <div class="ml-5">
                                    <h3 class="text-lg font-medium text-gray-900">KJCH PageSpy Debug</h3>
                                    <p class="text-sm text-gray-500">Track user interactions logs</p>
                                </div>
                            </div>
                            <Icon icon="mdi:arrow-top-right" class="h-5 w-5 text-gray-400" />
                        </div>
                    </a>

                    <!-- Disabled Admin Tools -->
                    <a href="#"
                        class="relative bg-gray-100 overflow-hidden shadow rounded-lg transition-shadow duration-300 cursor-not-allowed pointer-events-none">
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

                    <a href="#"
                        class="relative bg-gray-100 overflow-hidden shadow rounded-lg transition-shadow duration-300 cursor-not-allowed pointer-events-none">
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
        <!-- <div class="px-4 sm:px-0 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Team Stats</h2>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"> -->

                <!-- Disabled Placeholder -->
                <!-- <div
                    class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-50 border border-gray-300 shadow-lg rounded-lg flex items-center justify-center p-8">
                    <div class="flex flex-col justify-center items-center text-center">
                        <Icon icon="fa6-solid:code" class="h-12 w-12 text-gray-500 mb-4" />
                        <h3 class="text-xl font-semibold text-gray-600">This section is under construction</h3>
                        <p class="text-sm text-gray-500 mt-2">Will be available soon!</p>
                    </div>
                </div> -->

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
            <!-- </div>
        </div> -->

        <!-- Recent Activity Section -->
        <!-- <div class="px-4 sm:px-0 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" class="divide-y divide-gray-200"> -->

                    <!-- Disabled Placeholder -->
                    <!-- <div
                        class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-50 border border-gray-300 shadow-lg rounded-lg flex items-center justify-center p-8">
                        <div class="flex flex-col justify-center items-center text-center">
                            <Icon icon="fa6-solid:code" class="h-12 w-12 text-gray-500 mb-4" />
                            <h3 class="text-xl font-semibold text-gray-600">This section is under construction</h3>
                            <p class="text-sm text-gray-500 mt-2">Will be available soon!</p>
                        </div>
                    </div> -->

                    <!-- Example Activity Items List -->
                    <!-- <li>
                        <div class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div
                                        class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                                    <div
                                        class="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
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
                                    <div
                                        class="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
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
        </div> --->

        <!-- Notifications Section -->
        <div class="px-4 sm:px-0 mb-8 pt-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800">Important Notifications</h2>
                <button @click="markAllAsRead" class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    v-if="unreadNotificationsCount > 0">
                    <Icon icon="mdi:check-all" class="mr-1 h-5 w-5" />
                    Mark all as read
                </button>
            </div>

            <div v-if="notifications.length === 0" class="bg-white rounded-lg shadow-md p-6 text-center">
                <Icon icon="mdi:bell-off" class="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p class="text-gray-500">No notifications at this time</p>
            </div>

            <div v-else class="space-y-4">
                <TransitionGroup name="notification-fade">
                    <div v-for="notification in notifications" :key="notification.id"
                        class="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300"
                        :class="{ 'border-l-4 border-indigo-500': !notification.read }">
                        <div class="p-5">
                            <div class="flex items-start">
                                <!-- Notification Icon -->
                                <div class="flex-shrink-0" :class="getNotificationIconClass(notification.type).bgColor">
                                    <Icon :icon="getNotificationIconClass(notification.type).icon"
                                        :class="getNotificationIconClass(notification.type).textColor + ' h-6 w-6'" />
                                </div>

                                <!-- Notification Content -->
                                <div class="ml-4 flex-1">
                                    <div class="flex justify-between items-start">
                                        <h3 class="text-lg font-medium text-gray-900 flex items-center">
                                            {{ notification.title }}
                                            <span v-if="!notification.read"
                                                class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                New
                                            </span>
                                        </h3>
                                        <div class="flex space-x-2">
                                            <span class="text-sm text-gray-500">{{ formatDate(notification.date)
                                                }}</span>
                                            <button @click="markAsRead(notification.id)" v-if="!notification.read"
                                                class="text-gray-400 hover:text-indigo-600">
                                                <Icon icon="mdi:check" class="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>

                                    <!-- Attachments Section -->
                                    <div v-if="notification.attachments && notification.attachments.length > 0"
                                        class="mt-3 flex flex-wrap gap-2">
                                        <div v-for="(attachment, index) in notification.attachments" :key="index"
                                            class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                            @click="openAttachment(attachment)">
                                            <Icon :icon="getFileIcon(attachment.type)" class="mr-1 h-4 w-4" />
                                            {{ attachment.name }}
                                        </div>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div v-if="notification.actions && notification.actions.length > 0"
                                        class="mt-4 flex flex-wrap gap-2">
                                        <button v-for="(action, index) in notification.actions" :key="index"
                                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm"
                                            :class="action.primary ?
                                                'text-white bg-indigo-600 hover:bg-indigo-700' :
                                                'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'"
                                            @click="handleAction(action, notification.id)">
                                            <Icon v-if="action.icon" :icon="action.icon" class="mr-1 h-4 w-4" />
                                            {{ action.label }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>
    </div>

    <!-- File Preview Modal -->
    <Teleport to="body">
        <div v-if="showPreviewModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay -->
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closePreviewModal">
                </div>

                <!-- Modal panel -->
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {{ currentAttachment?.name || 'File Preview' }}
                                    </h3>
                                    <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-500">
                                        <Icon icon="mdi:close" class="h-6 w-6" />
                                    </button>
                                </div>

                                <!-- PDF Preview -->
                                <div v-if="currentAttachment?.type === 'pdf'" class="w-full h-[70vh] overflow-hidden">
                                    <iframe :src="currentAttachment.url" class="w-full h-full" frameborder="0"></iframe>
                                </div>

                                <!-- Image Preview -->
                                <div v-else-if="currentAttachment?.type === 'image'" class="w-full flex justify-center">
                                    <img :src="currentAttachment.url" :alt="currentAttachment.name"
                                        class="max-h-[70vh] object-contain" />
                                </div>

                                <!-- Text/HTML Preview -->
                                <div v-else-if="currentAttachment?.type === 'text' || currentAttachment?.type === 'html'"
                                    class="w-full h-[70vh] overflow-auto bg-gray-50 p-4 rounded">
                                    <div v-html="currentAttachment.content"></div>
                                </div>

                                <!-- Unsupported File Type -->
                                <div v-else class="text-center py-10">
                                    <Icon icon="mdi:file-question" class="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <p class="text-gray-500">Preview not available for this file type</p>
                                    <a :href="currentAttachment?.url" download
                                        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <Icon icon="mdi:download" class="mr-2 h-5 w-5" />
                                        Download File
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="closePreviewModal" type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Close
                        </button>
                        <a v-if="currentAttachment?.url" :href="currentAttachment.url" download
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                            <Icon icon="mdi:download" class="mr-2 h-5 w-5" />
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import VersionInfo from '@/components/common/VersionInfo.vue';

// Define types for notifications
interface NotificationAttachment {
    name: string;
    type: 'pdf' | 'image' | 'text' | 'html' | 'link' | 'other';
    url: string;
    content?: string;
}

interface NotificationAction {
    label: string;
    url?: string;
    primary?: boolean;
    icon?: string;
    callback?: string;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'event' | 'schedule' | 'robot' | 'competition' | 'announcement' | 'warning';
    date: string;
    read: boolean;
    attachments?: NotificationAttachment[];
    actions?: NotificationAction[];
}

export default defineComponent({
    name: 'HomeView',
    components: {
        Icon,
        VersionInfo
    },
    setup() {
        // 使用 Pinia 存储
        const userStore = useUserStore();

        // 使用 storeToRefs 来保持响应性
        const { userInfo, orgData } = storeToRefs(userStore);

        // 直接从存储访问其他属性
        const storeIsLoading = computed(() => userStore.isLoading);
        const storeError = computed(() => userStore.error);

        // 用户数据计算属性
        const userData = computed(() => {
            return userInfo.value || {};
        });

        // Notifications data (static for now, would be fetched from API in production)
        const notificationsData = reactive<Notification[]>([
            // {
            //     id: 1,
            //     title: "Competition Schedule Updated",
            //     message: "The schedule for the upcoming regional competition has been updated. Please check the new match times.",
            //     type: "schedule",
            //     date: "2024-04-15T14:30:00",
            //     read: false,
            //     attachments: [
            //         {
            //             name: "Competition_Schedule.pdf",
            //             type: "pdf",
            //             url: "https://www.firstinspires.org/sites/default/files/uploads/resource_library/frc/game-and-season-info/competition-manual/2023/2023-schedule-examples.pdf"
            //         }
            //     ],
            //     actions: [
            //         {
            //             label: "View Schedule",
            //             primary: true,
            //             icon: "mdi:calendar-check"
            //         },
            //         {
            //             label: "Add to Calendar",
            //             icon: "mdi:calendar-plus"
            //         }
            //     ]
            // },
            {
                id: 1,
                title: "Championship Information",
                message: "The FIRST Championship event guide and addendum have been released. Please review the documents for important information.",
                type: "announcement",
                date: "2025-04-16T01:15:00",
                read: true,
                attachments: [
                    {
                        name: "Championship Information",
                        type: "link",
                        url: "https://www.firstinspires.org/resource-library/frc/championship-information"
                    },
                    {
                        name: "Championship Event Guide",
                        type: "link",
                        url: "https://www.firstchampionship.org/for-teams"
                    },
                    {
                        name: "2025-FIRST-Championship-Event-Guide.pdf",
                        type: "pdf",
                        url: "https://r2.fastbirdcdn.online/Robotics/CAS/resource/Team695/kjch/2025-FIRST-Championship-Event-Guide.pdf"
                        
                    },
                    {
                        name: "2025-FIRST-Robotics-Competition-Addendum.pdf",
                        type: "pdf",
                        url: "https://r2.fastbirdcdn.online/Robotics/CAS/resource/Team695/kjch/2025-FIRST-Robotics-Competition-Addendum.pdf"
                    },
                    {
                        name: "2025-FIRST-Championship-Practice-Fields.pdf",
                        type: "pdf",
                        url: "https://r2.fastbirdcdn.online/Robotics/CAS/resource/Team695/kjch/2025-frc-cmp-practice-fields.pdf"
                    },
                    {
                        name: "Resource Origional Links",
                        type: "text",
                        url: "",
                        content: "<h1>Resource Link:</h1><ul><li><a style='color:red;font-weight:bold;decoration:dash;' href='https://www.firstchampionship.org/for-teams'>FIRST Championship Event Guide</a></li></ul>"
                    }
                ]
            },
            {
                id: 2,
                title: "Team Update No.21",
                message: "Team Update No.21 has been released. Please review the update for important information regarding the competition.",
                type: "announcement",
                date: "2025-04-15T10:00:00",
                read: true,
                attachments: [
                    {
                        name: "Team Update No.21",
                        type: "pdf",
                        url: "https://r2.fastbirdcdn.online/Robotics/CAS/resource/Team695/kjch/TeamUpdate21.pdf"
                    }
                ],
            },
            {
                id: 3,
                title: "2025 FRC World Championship Public Pre-Scouting Database",
                message: "A public pre-scouting sheet for the 2025 FRC World Championship",
                type: "robot",
                date: "2025-04-15T10:00:00",
                read: true,
                attachments: [
                    {
                        name: "Google Sheet",
                        type: "link",
                        url: "https://docs.google.com/spreadsheets/d/1HtiINWykF4Fr7QdcvXdq2G6txlU_2EFPs5OP1MBT0_g/edit?usp=sharing"
                    }
                ],
            }
        ]);

        // Notifications state
        const notifications = ref<Notification[]>(notificationsData);
        const showPreviewModal = ref(false);
        const currentAttachment = ref<NotificationAttachment | null>(null);

        // Computed properties for notifications
        const unreadNotificationsCount = computed(() => {
            return notifications.value.filter(n => !n.read).length;
        });

        // Methods for notifications
        const markAsRead = (id: number) => {
            const notification = notifications.value.find(n => n.id === id);
            if (notification) {
                notification.read = true;
            }
        };

        const markAllAsRead = () => {
            notifications.value.forEach(notification => {
                notification.read = true;
            });
        };

        const openAttachment = (attachment: NotificationAttachment) => {
            // 如果是链接类型，直接在新标签页打开
            if (attachment.type === 'link') {
                window.open(attachment.url, '_blank');
                return;
            }
            
            // 其他类型则显示预览模态框
            currentAttachment.value = attachment;
            showPreviewModal.value = true;
        };

        const closePreviewModal = () => {
            showPreviewModal.value = false;
            currentAttachment.value = null;
        };

        const handleAction = (action: NotificationAction, notificationId: number) => {
            // Mark notification as read when an action is taken
            markAsRead(notificationId);

            // Handle different action types
            if (action.url) {
                window.open(action.url, '_blank');
            } else if (action.callback) {
                // This would call a function based on the callback name
                console.log(`Action callback: ${action.callback}`);
            }
        };

        // Helper functions
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Today - show time
                return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else if (diffDays === 1) {
                // Yesterday
                return 'Yesterday';
            } else if (diffDays < 7) {
                // Within a week
                return `${diffDays} days ago`;
            } else {
                // More than a week
                return date.toLocaleDateString();
            }
        };

        const getNotificationIconClass = (type: string) => {
            switch (type) {
                case 'event':
                    return {
                        icon: 'mdi:calendar-check',
                        bgColor: 'bg-blue-100 rounded-md p-3',
                        textColor: 'text-blue-600'
                    };
                case 'schedule':
                    return {
                        icon: 'mdi:calendar-clock',
                        bgColor: 'bg-purple-100 rounded-md p-3',
                        textColor: 'text-purple-600'
                    };
                case 'robot':
                    return {
                        icon: 'mdi:robot',
                        bgColor: 'bg-green-100 rounded-md p-3',
                        textColor: 'text-green-600'
                    };
                case 'competition':
                    return {
                        icon: 'mdi:trophy',
                        bgColor: 'bg-amber-100 rounded-md p-3',
                        textColor: 'text-amber-600'
                    };
                case 'warning':
                    return {
                        icon: 'mdi:alert',
                        bgColor: 'bg-red-100 rounded-md p-3',
                        textColor: 'text-red-600'
                    };
                case 'announcement':
                default:
                    return {
                        icon: 'mdi:bullhorn',
                        bgColor: 'bg-indigo-100 rounded-md p-3',
                        textColor: 'text-indigo-600'
                    };
            }
        };

        const getFileIcon = (type: string) => {
            switch (type) {
                case 'pdf':
                    return 'mdi:file-pdf-box';
                case 'image':
                    return 'mdi:file-image';
                case 'text':
                    return 'mdi:file-document';
                case 'html':
                    return 'mdi:language-html5';
                case 'link':
                    return 'mdi:link-variant';
                default:
                    return 'mdi:file';
            }
        };

        const logout = () => {
            userStore.clearUserInfo(); // 清除存储中的用户信息
        };

        return {
            userData,
            orgData,
            isLoading: storeIsLoading,
            error: storeError,
            logout,
            // Notifications
            notifications,
            unreadNotificationsCount,
            markAsRead,
            markAllAsRead,
            openAttachment,
            closePreviewModal,
            handleAction,
            formatDate,
            getNotificationIconClass,
            getFileIcon,
            showPreviewModal,
            currentAttachment
        };
    }
});
</script>

<style scoped>
/* Notification animations */
.notification-fade-enter-active,
.notification-fade-leave-active {
    transition: all 0.3s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>