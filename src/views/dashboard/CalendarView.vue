<template>
    <!-- Calendar Header -->
    <div class="px-4 py-6 sm:px-0 mb-6">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
            <div class="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">
                        FRC Open Season Calendar
                    </h2>
                    <p class="mt-2 text-blue-100">
                        Plan and track important dates for the {{ currentSeason }} season
                    </p>
                </div>
                <div class="mt-4 md:mt-0 md:ml-6">
                    <button @click="() => openEventModal()"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Icon icon="mdi:plus" class="h-4 w-4 mr-1" />
                        Add Event
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Calendar Controls -->
    <div class="px-4 sm:px-0 mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-center">
            <div class="flex items-center space-x-4 mb-4 sm:mb-0">
                <button @click="prevMonth"
                    class="p-2 rounded-full bg-white shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Icon icon="mdi:chevron-left" class="h-5 w-5 text-gray-600" />
                </button>
                <h2 class="text-xl font-semibold text-gray-800">
                    {{ currentMonthName }} {{ currentYear }}
                </h2>
                <button @click="nextMonth"
                    class="p-2 rounded-full bg-white shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Icon icon="mdi:chevron-right" class="h-5 w-5 text-gray-600" />
                </button>
            </div>
            <div class="flex space-x-2">
                <button @click="setView('month')" :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    currentView === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                ]">
                    Month
                </button>
                <button @click="setView('week')" :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    currentView === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                ]">
                    Week
                </button>
                <button @click="setView('list')" :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    currentView === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                ]">
                    List
                </button>
            </div>
        </div>
    </div>

    <!-- Calendar Legend -->
    <div class="px-4 sm:px-0 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Event Types</h3>
            <div class="flex flex-wrap gap-4">
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span class="text-sm text-gray-600">Team Meetings</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span class="text-sm text-gray-600">Build Sessions</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                    <span class="text-sm text-gray-600">Competitions</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span class="text-sm text-gray-600">Deadlines</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span class="text-sm text-gray-600">Important Dates</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Month View Calendar -->
    <div v-if="currentView === 'month'" class="px-4 sm:px-0 mb-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <!-- Days of week header -->
            <div class="grid grid-cols-7 gap-px bg-gray-200">
                <div v-for="day in daysOfWeek" :key="day"
                    class="bg-white p-2 text-center text-sm font-medium text-gray-700">
                    {{ day }}
                </div>
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-px bg-gray-200">
                <div v-for="(day, index) in calendarDays" :key="index" :class="[
                    'bg-white min-h-[100px] p-2',
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
                    day.isToday ? 'bg-blue-50' : '',
                    day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-gray-50' : ''
                ]">
                    <div class="flex justify-between">
                        <span :class="[
                            'text-sm font-medium',
                            day.isToday ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center' : ''
                        ]">
                            {{ day.date.getDate() }}
                        </span>
                        <button v-if="day.isCurrentMonth" @click="openEventModal(day.date)"
                            class="text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:plus-circle-outline" class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- Events for this day -->
                    <div class="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                        <div v-for="event in getEventsForDay(day.date)" :key="event.id" :class="[
                            'px-2 py-1 text-xs rounded-md truncate cursor-pointer',
                            `bg-${event.color}-100 text-${event.color}-800`
                        ]" @click="openEventDetails(event)">
                            {{ event.title }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Week View -->
    <div v-if="currentView === 'week'" class="px-4 sm:px-0 mb-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <!-- Days of week header -->
            <div class="grid grid-cols-7 gap-px bg-gray-200">
                <div v-for="(day, index) in currentWeekDays" :key="index" :class="[
                    'bg-white p-2 text-center',
                    day.isToday ? 'bg-blue-50' : ''
                ]">
                    <div class="text-sm font-medium text-gray-700">{{ daysOfWeek[day.date.getDay()] }}</div>
                    <div :class="[
                        'text-sm font-medium mt-1',
                        day.isToday ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto' : ''
                    ]">
                        {{ day.date.getDate() }}
                    </div>
                </div>
            </div>

            <!-- Week events -->
            <div class="grid grid-cols-7 gap-px bg-gray-200">
                <div v-for="(day, index) in currentWeekDays" :key="index" :class="[
                    'bg-white min-h-[300px] p-2',
                    day.isToday ? 'bg-blue-50' : '',
                    day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-gray-50' : ''
                ]">
                    <!-- Events for this day -->
                    <div class="space-y-2">
                        <div v-for="event in getEventsForDay(day.date)" :key="event.id" :class="[
                            'px-3 py-2 text-sm rounded-md cursor-pointer',
                            `bg-${event.color}-100 text-${event.color}-800`
                        ]" @click="openEventDetails(event)">
                            <div class="font-medium">{{ event.title }}</div>
                            <div class="text-xs mt-1">{{ formatTime(event.startTime) }} - {{
                                formatTime(event.endTime) }}</div>
                        </div>

                        <div v-if="getEventsForDay(day.date).length === 0"
                            class="text-center py-4 text-gray-400 text-sm">
                            <div>No events</div>
                            <button @click="openEventModal(day.date)" class="mt-2 text-blue-500 hover:text-blue-700">
                                <Icon icon="mdi:plus-circle" class="h-5 w-5 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- List View -->
    <div v-if="currentView === 'list'" class="px-4 sm:px-0 mb-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="divide-y divide-gray-200">
                <div v-for="(group, date) in groupedEvents" :key="date" class="p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ formatDate(new Date(date)) }}</h3>
                    <ul class="space-y-3">
                        <li v-for="event in group" :key="event.id"
                            class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div class="p-4 flex items-start">
                                <div :class="`w-2 self-stretch bg-${event.color}-500 mr-4`"></div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <h4 class="text-lg font-medium text-gray-900">{{ event.title }}</h4>
                                        <span :class="`text-${event.color}-600 text-sm font-medium`">
                                            {{ formatEventTime(event) }}
                                        </span>
                                    </div>
                                    <p class="mt-1 text-sm text-gray-600">{{ event.description }}</p>
                                    <div class="mt-3 flex items-center text-sm text-gray-500">
                                        <Icon icon="mdi:map-marker" class="h-4 w-4 mr-1" />
                                        <span>{{ event.location || 'No location specified' }}</span>
                                    </div>
                                </div>
                                <button @click="openEventDetails(event)" class="ml-4 text-gray-400 hover:text-gray-600">
                                    <Icon icon="mdi:dots-vertical" class="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>

                <div v-if="Object.keys(groupedEvents).length === 0" class="p-8 text-center">
                    <Icon icon="mdi:calendar-blank" class="h-12 w-12 mx-auto text-gray-300" />
                    <h3 class="mt-2 text-lg font-medium text-gray-900">No events found</h3>
                    <p class="mt-1 text-gray-500">There are no events scheduled for this month.</p>
                    <button @click="openEventModal()"
                        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        <Icon icon="mdi:plus" class="h-4 w-4 mr-1" />
                        Add Event
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Upcoming Events Section -->
    <div class="px-4 sm:px-0 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="event in upcomingEvents" :key="event.id">
                    <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div
                                    :class="`flex-shrink-0 h-10 w-10 rounded-full bg-${event.color}-100 flex items-center justify-center`">
                                    <Icon :icon="getEventIcon(event.type)" :class="`h-5 w-5 text-${event.color}-600`" />
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-blue-600">{{ event.title }}</p>
                                    <p class="text-sm text-gray-500">{{ formatEventDate(event) }}</p>
                                </div>
                            </div>
                            <div class="ml-2 flex-shrink-0 flex">
                                <p
                                    :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${event.color}-100 text-${event.color}-800`">
                                    {{ getDaysUntil(event.date) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </li>
                <li v-if="upcomingEvents.length === 0">
                    <div class="px-4 py-6 sm:px-6 text-center text-gray-500">
                        No upcoming events in the next 30 days
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showEventModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">
                    {{ editingEvent ? 'Edit Event' : 'Add New Event' }}
                </h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
                <form @submit.prevent="saveEvent">
                    <div class="space-y-4">
                        <div>
                            <label for="event-title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="event-title" v-model="eventForm.title" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>

                        <div>
                            <label for="event-type" class="block text-sm font-medium text-gray-700">Event
                                Type</label>
                            <select id="event-type" v-model="eventForm.type"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="meeting">Team Meeting</option>
                                <option value="build">Build Session</option>
                                <option value="competition">Competition</option>
                                <option value="deadline">Deadline</option>
                                <option value="important">Important Date</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="event-date" class="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" id="event-date" v-model="eventForm.date" required
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>

                            <div>
                                <label for="event-time" class="block text-sm font-medium text-gray-700">Time</label>
                                <input type="time" id="event-time" v-model="eventForm.startTime"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="event-end-time" class="block text-sm font-medium text-gray-700">End Time
                                (optional)</label>
                            <input type="time" id="event-end-time" v-model="eventForm.endTime"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>

                        <div>
                            <label for="event-location" class="block text-sm font-medium text-gray-700">Location
                                (optional)</label>
                            <input type="text" id="event-location" v-model="eventForm.location"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>

                        <div>
                            <label for="event-description" class="block text-sm font-medium text-gray-700">Description
                                (optional)</label>
                            <textarea id="event-description" v-model="eventForm.description" rows="3"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                    </div>

                    <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button type="submit"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm">
                            {{ editingEvent ? 'Update' : 'Save' }}
                        </button>
                        <button type="button" @click="closeEventModal"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showEventDetails" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div
                :class="`px-4 py-5 sm:px-6 border-b border-gray-200 ${selectedEvent ? 'bg-' + selectedEvent.color + '-50' : ''}`">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ selectedEvent?.title || 'No Title' }}</h3>
                    <div class="flex space-x-2">
                        <button @click="editEvent" class="text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:pencil" class="h-5 w-5" />
                        </button>
                        <button @click="deleteEvent" class="text-gray-400 hover:text-red-600">
                            <Icon icon="mdi:trash-can" class="h-5 w-5" />
                        </button>
                        <button @click="closeEventDetails" class="text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:close" class="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="px-4 py-5 sm:p-6">
                <div class="space-y-4">
                    <div class="flex items-center">
                        <Icon icon="mdi:calendar" class="h-5 w-5 text-gray-400 mr-2" />
                        <span class="text-sm text-gray-700">{{ selectedEvent ? formatEventDate(selectedEvent) : ''
                            }}</span>
                    </div>

                    <div v-if="selectedEvent && selectedEvent.startTime" class="flex items-center">
                        <Icon icon="mdi:clock-outline" class="h-5 w-5 text-gray-400 mr-2" />
                        <span class="text-sm text-gray-700">
                            {{ formatTime(selectedEvent.startTime) }}
                            {{ selectedEvent.endTime ? `- ${formatTime(selectedEvent.endTime)}` : '' }}
                        </span>
                    </div>

                    <div v-if="selectedEvent && selectedEvent.location" class="flex items-center">
                        <Icon icon="mdi:map-marker" class="h-5 w-5 text-gray-400 mr-2" />
                        <span class="text-sm text-gray-700">{{ selectedEvent.location }}</span>
                    </div>

                    <div v-if="selectedEvent && selectedEvent.description" class="pt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p class="text-sm text-gray-600 whitespace-pre-line">{{ selectedEvent.description }}</p>
                    </div>
                </div>

                <div class="mt-6">
                    <button @click="closeEventDetails"
                        class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
}

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    type: 'meeting' | 'build' | 'competition' | 'deadline' | 'important';
    color: string;
}

export default defineComponent({
    name: 'CalendarView',
    components: {
        Icon
    },
    setup() {
        const router = useRouter();
        
        // Use the Pinia store
        const userStore = useUserStore();
        const { userInfo, orgData } = storeToRefs(userStore);
        
        // Computed property for user data
        const userData = computed(() => {
            return userInfo.value || {};
        });

        // Calendar state
        const currentDate = ref(new Date());
        const currentView = ref<'month' | 'week' | 'list'>('month');
        const events = ref<CalendarEvent[]>([
            {
                id: '1',
                title: 'Kickoff Meeting',
                date: '2025-01-06',
                startTime: '09:00',
                endTime: '12:00',
                description: 'Season kickoff meeting to discuss the new game and strategy',
                location: 'Main Workshop',
                type: 'meeting',
                color: 'blue'
            },
            {
                id: '2',
                title: 'Build Session',
                date: '2025-01-08',
                startTime: '15:00',
                endTime: '18:00',
                description: 'Working on robot prototype',
                location: 'Workshop',
                type: 'build',
                color: 'green'
            },
            {
                id: '3',
                title: 'Regional Competition',
                date: '2025-02-15',
                startTime: '08:00',
                endTime: '17:00',
                description: 'First regional competition of the season',
                location: 'City Convention Center',
                type: 'competition',
                color: 'purple'
            },
            {
                id: '4',
                title: 'Robot Inspection Deadline',
                date: '2025-02-10',
                type: 'deadline',
                color: 'yellow'
            },
            {
                id: '5',
                title: 'Championship Registration',
                date: '2025-03-01',
                type: 'important',
                color: 'red'
            }
        ]);

        // Modal state
        const showEventModal = ref(false);
        const showEventDetails = ref(false);
        const editingEvent = ref(false);
        const selectedEvent = ref<CalendarEvent | null>(null);
        const eventForm = reactive({
            id: '',
            title: '',
            date: '',
            startTime: '',
            endTime: '',
            description: '',
            location: '',
            type: 'meeting' as 'meeting' | 'build' | 'competition' | 'deadline' | 'important'
        });

        // Calendar computed properties
        const currentYear = computed(() => currentDate.value.getFullYear());
        const currentMonth = computed(() => currentDate.value.getMonth());
        const currentMonthName = computed(() => {
            return new Date(currentYear.value, currentMonth.value).toLocaleString('default', { month: 'long' });
        });
        const currentSeason = computed(() => {
            return currentYear.value;
        });

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const calendarDays = computed(() => {
            const year = currentYear.value;
            const month = currentMonth.value;

            // First day of the month
            const firstDay = new Date(year, month, 1);
            // Last day of the month
            const lastDay = new Date(year, month + 1, 0);

            // Get the day of the week for the first day (0-6, where 0 is Sunday)
            const firstDayOfWeek = firstDay.getDay();

            // Calculate days from previous month to show
            const daysFromPrevMonth = firstDayOfWeek;

            // Calculate total days to show (previous month days + current month days + next month days)
            // We want to show a complete grid of 6 weeks (42 days)
            const totalDays = 42;

            const days: CalendarDay[] = [];

            // Add days from previous month
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
                const date = new Date(year, month - 1, prevMonthLastDay - i);
                days.push({
                    date,
                    isCurrentMonth: false,
                    isToday: isSameDay(date, new Date())
                });
            }

            // Add days from current month
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const date = new Date(year, month, i);
                days.push({
                    date,
                    isCurrentMonth: true,
                    isToday: isSameDay(date, new Date())
                });
            }

            // Add days from next month
            const remainingDays = totalDays - days.length;
            for (let i = 1; i <= remainingDays; i++) {
                const date = new Date(year, month + 1, i);
                days.push({
                    date,
                    isCurrentMonth: false,
                    isToday: isSameDay(date, new Date())
                });
            }

            return days;
        });

        const currentWeekDays = computed(() => {
            const date = new Date(currentDate.value);
            const day = date.getDay(); // 0-6, where 0 is Sunday

            // Set to the previous Sunday
            date.setDate(date.getDate() - day);

            const days: CalendarDay[] = [];

            // Get 7 days starting from Sunday
            for (let i = 0; i < 7; i++) {
                const weekDate = new Date(date);
                weekDate.setDate(date.getDate() + i);

                days.push({
                    date: weekDate,
                    isCurrentMonth: weekDate.getMonth() === currentMonth.value,
                    isToday: isSameDay(weekDate, new Date())
                });
            }

            return days;
        });

        const upcomingEvents = computed(() => {
            const today = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(today.getDate() + 30);

            return events.value
                .filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= today && eventDate <= thirtyDaysLater;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5);
        });

        const groupedEvents = computed(() => {
            const grouped: Record<string, CalendarEvent[]> = {};

            // Filter events for the current month
            const filteredEvents = events.value.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === currentMonth.value &&
                    eventDate.getFullYear() === currentYear.value;
            });

            // Group by date
            filteredEvents.forEach(event => {
                if (!grouped[event.date]) {
                    grouped[event.date] = [];
                }
                grouped[event.date].push(event);
            });

            // Sort dates
            return Object.keys(grouped)
                .sort()
                .reduce((obj: Record<string, CalendarEvent[]>, key) => {
                    obj[key] = grouped[key];
                    return obj;
                }, {});
        });

        const logout = () => {
            casdoorService.logout();
            userStore.clearUserInfo(); // Clear user info in the store
            router.push({ name: 'login' }).catch(err => {
                console.error('Failed to navigate to login:', err);
            });
        };

        const prevMonth = () => {
            const date = new Date(currentDate.value);
            date.setMonth(date.getMonth() - 1);
            currentDate.value = date;
        };

        const nextMonth = () => {
            const date = new Date(currentDate.value);
            date.setMonth(date.getMonth() + 1);
            currentDate.value = date;
        };

        const setView = (view: 'month' | 'week' | 'list') => {
            currentView.value = view;
        };

        const getEventsForDay = (date: Date) => {
            const dateString = formatDateToYYYYMMDD(date);
            return events.value.filter(event => event.date === dateString);
        };

        const openEventModal = (date?: Date) => {
            editingEvent.value = false;
            resetEventForm();

            if (date) {
                eventForm.date = formatDateToYYYYMMDD(date);
            }

            showEventModal.value = true;
        };

        const closeEventModal = () => {
            showEventModal.value = false;
            resetEventForm();
        };

        const openEventDetails = (event: CalendarEvent) => {
            selectedEvent.value = event;
            showEventDetails.value = true;
        };

        const closeEventDetails = () => {
            showEventDetails.value = false;
            selectedEvent.value = null;
        };

        const editEvent = () => {
            if (!selectedEvent.value) return;

            editingEvent.value = true;
            eventForm.id = selectedEvent.value.id;
            eventForm.title = selectedEvent.value.title;
            eventForm.date = selectedEvent.value.date;
            eventForm.startTime = selectedEvent.value.startTime || '';
            eventForm.endTime = selectedEvent.value.endTime || '';
            eventForm.description = selectedEvent.value.description || '';
            eventForm.location = selectedEvent.value.location || '';
            eventForm.type = selectedEvent.value.type;

            showEventDetails.value = false;
            showEventModal.value = true;
        };

        const deleteEvent = () => {
            if (!selectedEvent.value) return;

            if (confirm('Are you sure you want to delete this event?')) {
                events.value = events.value.filter(e => e.id !== selectedEvent.value?.id);
                closeEventDetails();
            }
        };

        const saveEvent = () => {
            const eventColor = getEventColor(eventForm.type);

            if (editingEvent.value) {
                // Update existing event
                const index = events.value.findIndex(e => e.id === eventForm.id);
                if (index !== -1) {
                    events.value[index] = {
                        ...eventForm,
                        color: eventColor
                    };
                }
            } else {
                // Create new event
                const newEvent: CalendarEvent = {
                    id: Date.now().toString(),
                    title: eventForm.title,
                    date: eventForm.date,
                    startTime: eventForm.startTime || undefined,
                    endTime: eventForm.endTime || undefined,
                    description: eventForm.description || undefined,
                    location: eventForm.location || undefined,
                    type: eventForm.type,
                    color: eventColor
                };

                events.value.push(newEvent);
            }

            closeEventModal();
        };

        const resetEventForm = () => {
            eventForm.id = '';
            eventForm.title = '';
            eventForm.date = formatDateToYYYYMMDD(new Date());
            eventForm.startTime = '';
            eventForm.endTime = '';
            eventForm.description = '';
            eventForm.location = '';
            eventForm.type = 'meeting';
        };

        const getEventColor = (type: string): string => {
            switch (type) {
                case 'meeting': return 'blue';
                case 'build': return 'green';
                case 'competition': return 'purple';
                case 'deadline': return 'yellow';
                case 'important': return 'red';
                default: return 'blue';
            }
        };

        const getEventIcon = (type: string): string => {
            switch (type) {
                case 'meeting': return 'mdi:account-group';
                case 'build': return 'mdi:tools';
                case 'competition': return 'mdi:trophy';
                case 'deadline': return 'mdi:clock-alert';
                case 'important': return 'mdi:alert-circle';
                default: return 'mdi:calendar';
            }
        };

        const formatDateToYYYYMMDD = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatDate = (date: Date): string => {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const formatEventDate = (event: CalendarEvent): string => {
            const date = new Date(event.date);
            return formatDate(date);
        };

        const formatTime = (time?: string): string => {
            if (!time) return '';

            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;

            return `${hour12}:${minutes} ${ampm}`;
        };

        const formatEventTime = (event: CalendarEvent): string => {
            if (!event.startTime) return 'All day';

            if (event.endTime) {
                return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
            }

            return formatTime(event.startTime);
        };

        const getDaysUntil = (dateString: string): string => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const eventDate = new Date(dateString);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            return `In ${diffDays} days`;
        };

        const isSameDay = (date1: Date, date2: Date): boolean => {
            return date1.getDate() === date2.getDate() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getFullYear() === date2.getFullYear();
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
            logout,
            currentDate,
            currentYear,
            currentMonth,
            currentMonthName,
            currentSeason,
            currentView,
            daysOfWeek,
            calendarDays,
            currentWeekDays,
            events,
            upcomingEvents,
            groupedEvents,
            showEventModal,
            showEventDetails,
            editingEvent,
            selectedEvent,
            eventForm,
            prevMonth,
            nextMonth,
            setView,
            getEventsForDay,
            openEventModal,
            closeEventModal,
            openEventDetails,
            closeEventDetails,
            editEvent,
            deleteEvent,
            saveEvent,
            getEventIcon,
            formatDate,
            formatEventDate,
            formatTime,
            formatEventTime,
            getDaysUntil
        };
    }
});
</script>

<style scoped>
/* Custom scrollbar for event lists */
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
}
</style>