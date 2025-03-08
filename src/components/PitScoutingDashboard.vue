<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header with gradient background -->
        <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg">
            <div class="container mx-auto px-4">
                <h1 class="text-center text-3xl font-bold tracking-tight">Pit Scouting Dashboard</h1>
            </div>
        </header>

        <main class="container mx-auto p-4 mt-6">
            <!-- Search Panel -->
            <div class="mb-8 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                        <Icon icon="mdi:magnify" class="mr-2 text-indigo-500" />
                        Search Filters
                    </h2>
                    <form @submit.prevent="handleSearch" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Event ID Filter -->
                            <div class="relative">
                                <select v-model="queryParams.eventId" id="eventId"
                                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white">
                                    <option value="">All Events</option>
                                    <option v-for="eventId in uniqueEventIds" :key="eventId" :value="eventId">{{ eventId
                                    }}</option>
                                </select>
                                <label for="eventId"
                                    class="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-indigo-600">
                                    Event ID
                                </label>
                            </div>

                            <!-- Form ID Filter -->
                            <div class="relative">
                                <input v-model="queryParams.formId" type="text" id="formId"
                                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    placeholder="Enter Form ID" />
                                <label for="formId"
                                    class="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-indigo-600">
                                    Form ID
                                </label>
                            </div>

                            <!-- Team Number Filter -->
                            <div class="relative">
                                <input v-model="queryParams.teamNumber" type="text" id="teamNumber"
                                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    placeholder="Enter Team Number" />
                                <label for="teamNumber"
                                    class="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-indigo-600">
                                    Team Number
                                </label>
                            </div>
                        </div>

                        <!-- Modified Search Button with Loading State -->
                        <div class="flex justify-end">
                            <button type="submit" :disabled="isSearching"
                                class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                <Icon :icon="isSearching ? 'mdi:loading' : 'mdi:magnify'"
                                    :class="{ 'animate-spin': isSearching }" class="mr-2" />
                                {{ isSearching ? 'Searching...' : 'Search' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
                <div
                    class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-r-4 border-indigo-600 border-b-4 border-l-4 border-transparent">
                </div>
                <p class="mt-4 text-lg text-gray-600">Loading data...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error"
                class="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-8" role="alert">
                <div class="flex items-center">
                    <Icon icon="mdi:alert-circle" class="text-2xl mr-2" />
                    <p class="font-bold">Error</p>
                </div>
                <p class="mt-2">{{ error }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredSurveyData.length === 0" class="text-center py-12 bg-white rounded-xl shadow-md">
                <Icon icon="mdi:robot-confused" class="text-6xl text-gray-400 mb-4" />
                <p class="text-xl text-gray-600">
                    No data available. Try adjusting your search criteria.
                </p>
            </div>

            <!-- Data Display -->
            <div v-else>
                <!-- Data Visualization Section -->
                <section v-if="filteredSurveyData.length > 0"
                    class="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="mdi:chart-bar" class="mr-2 text-indigo-500" />
                            Data Visualization
                        </h2>

                        <!-- Modified Chart Type Selector -->
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

                        <!-- Modified Chart Display -->
                        <div v-if="selectedChartTypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div v-for="field in selectedChartTypes" :key="field"
                                class="bg-gray-50 p-4 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4 text-gray-800">{{ formatFieldName(field) }}</h3>
                                <div class="h-64">
                                    <Bar :data="generateChartData(field).data" :options="getChartOptions() as any" />
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
                            <Icon icon="mdi:chart-line" class="text-4xl text-gray-400 mb-2" />
                            <p class="text-gray-600">Select charts to display visualization</p>
                        </div>
                    </div>
                </section>

                <!-- Data Tables Section -->
                <section v-for="(eventData, eventId) in groupedSurveyData" :key="eventId"
                    class="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Icon icon="mdi:calendar-check" class="mr-2 text-indigo-500" />
                            Event: {{ eventId }}
                        </h2>

                        <!-- Modified Column Selector -->
                        <div class="relative mb-4">
                            <button @click="showColumnSelector = !showColumnSelector"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Icon icon="mdi:table-column" class="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                                Customize Columns
                                <span class="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                                    {{ selectedFields.length }}
                                </span>
                            </button>

                            <!-- Column Selector Modal -->
                            <div v-if="showColumnSelector"
                                class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
                                @click="showColumnSelector = false">
                                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" @click.stop>
                                    <div class="px-6 py-4 border-b border-gray-200">
                                        <h3 class="text-lg font-medium text-gray-900">Customize Columns</h3>
                                    </div>
                                    <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
                                        <div class="space-y-2">
                                            <!-- Available Fields -->
                                            <div class="mb-4">
                                                <h4 class="text-sm font-medium text-gray-700 mb-2">Available Fields</h4>
                                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div v-for="field in availableFieldsNotSelected" :key="field"
                                                        class="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                                                        <span class="truncate flex-1" :title="formatFieldName(field)">
                                                            {{ formatFieldName(field) }}
                                                        </span>
                                                        <button @click="addField(field)"
                                                            class="ml-2 text-gray-400 hover:text-green-500">
                                                            <Icon icon="mdi:plus" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Selected Fields with Enhanced HTML5 Drag and Drop -->
                                            <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Fields (Drag to
                                                reorder)</h4>
                                            <div class="space-y-2 relative" ref="draggableContainer">
                                                <!-- Placeholder for drag target -->
                                                <div v-if="isDragging"
                                                    class="absolute border-2 border-dashed border-indigo-500 bg-indigo-100 bg-opacity-50 rounded-md p-2 pointer-events-none transition-all duration-200"
                                                    :style="placeholderStyle">
                                                </div>

                                                <div v-for="(field, index) in selectedFields" :key="field"
                                                    class="flex items-center p-2 rounded-md cursor-move hover:bg-gray-100"
                                                    :class="[
                                                        draggedItem === index ? 'bg-indigo-200 shadow-lg' : 'bg-gray-50',
                                                        dragOverIndex === index ? 'border border-indigo-500' : ''
                                                    ]" draggable="true" @dragstart="dragStart($event, index)"
                                                    @dragover.prevent="dragOver($event, index)"
                                                    @dragenter.prevent="dragEnter($event, index)"
                                                    @dragleave="dragLeave($event, index)" @drop="drop($event, index)"
                                                    @dragend="dragEnd" @mousedown="preventMultiSelection">
                                                    <Icon icon="mdi:drag" class="mr-2 text-gray-400" />
                                                    <span class="truncate flex-1 select-none"
                                                        :title="formatFieldName(field)">
                                                        {{ formatFieldName(field) }}
                                                    </span>
                                                    <span class="ml-2 text-xs font-medium text-gray-500">
                                                        {{ index + 1 }}
                                                    </span>
                                                    <button @click="removeField(field)"
                                                        class="ml-2 text-gray-400 hover:text-red-500">
                                                        <Icon icon="mdi:close" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between">
                                        <button @click="resetColumns" class="text-gray-700 hover:text-gray-900">
                                            Reset to Default
                                        </button>
                                        <button @click="showColumnSelector = false"
                                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Data Table -->
                        <div class="overflow-x-auto rounded-lg border border-gray-200">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="sticky left-0 z-10 bg-indigo-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Team Number
                                        </th>
                                        <th v-for="field in selectedFields" :key="field" scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            {{ formatFieldName(field) }}
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Images
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="survey in eventData" :key="survey.id"
                                        class="hover:bg-gray-50 transition-colors duration-150">
                                        <td
                                            class="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-indigo-50">
                                            {{ getFieldValue(survey.data, "Team number") || "N/A" }}
                                        </td>
                                        <td v-for="field in selectedFields" :key="field"
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ formatFieldValue(survey.data, field) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div v-if="hasImages(survey)" class="flex justify-center">
                                                <button @click="openImageModal(survey)"
                                                    class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150">
                                                    <Icon icon="mdi:image" class="text-xl" />
                                                </button>
                                            </div>
                                            <span v-else class="text-gray-400">No images</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <!-- Image Modal -->
        <Transition name="fade">
            <div v-if="showImageModal"
                class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                @click="closeImageModal">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
                    <div class="flex justify-between items-center p-4 border-b">
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import axios from "axios";
import { Icon } from "@iconify/vue";
import { Bar } from "vue-chartjs";
import { throttle } from "lodash";
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
    id: number;
    event_id: string;
    form_id: string;
    data: Record<string, any>;
    upload: {
        fullRobotImages: { url: string; name: string; size: number }[];
        driveTrainImages: { url: string; name: string; size: number }[];
    };
    timestamp: string;
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
            display?: boolean; // Add display property
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
        const response = await axios.get<SurveyData[]>("https://api.frc695.com/api/survey/query");
        surveyData.value = response.data.map(item => {
            // Parse JSON strings if needed
            if (typeof item.data === 'string') {
                item.data = JSON.parse(item.data);
            }
            if (typeof item.upload === 'string') {
                item.upload = JSON.parse(item.upload);
            }
            return item;
        });
    } catch (err: any) {
        console.error("Error fetching data:", err);
        error.value = err.message || "Failed to fetch data. Please try again later.";
        surveyData.value = [];
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
    if (isDragging.value) {
        event.preventDefault();
    }
};

// Initialize data on component mount
onMounted(() => {
    fetchData();
    loadSavedPreferences();
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('selectstart', preventTextSelection);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('selectstart', preventTextSelection);
});

// Computed properties
const uniqueEventIds = computed(() => {
    const eventIds = new Set(surveyData.value.map(survey => survey.event_id));
    return Array.from(eventIds);
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

// Throttled search function
const handleSearch = throttle(async () => {
    if (isSearching.value) return;

    isSearching.value = true;
    try {
        await fetchData();
    } finally {
        isSearching.value = false;
    }
}, 1000, { trailing: false });

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
    element.classList.add('bg-indigo-100', 'border', 'border-indigo-500');
};

const dragLeave = (event: DragEvent, index: number) => {
    if (dragOverIndex.value === index) {
        dragOverIndex.value = -1;
    }

    // Remove highlight from the drop target
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('bg-indigo-100', 'border', 'border-indigo-500');
};

const drop = (event: DragEvent, index: number) => {
    event.preventDefault();

    // Remove highlight from the drop target
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('bg-indigo-100', 'border', 'border-indigo-500');

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
        if (el.classList.contains('bg-gray-50')) {
            el.classList.remove('bg-indigo-100', 'border', 'border-indigo-500');
        }
    });
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