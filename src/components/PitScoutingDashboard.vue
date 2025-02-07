<template>
    <div class="min-h-screen bg-gray-100">
        <header class="bg-blue-600 text-white p-4 shadow-md">
            <h1 class="text-center text-3xl font-bold">Pit Scouting Dashboard</h1>
        </header>

        <main class="container mx-auto p-4 mt-4">
            <form @submit.prevent="performSearch" class="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 class="text-2xl font-semibold mb-6 text-gray-800">Search</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="relative">
                        <select v-model="queryParams.eventId" id="eventId"
                            class="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 bg-transparent appearance-none focus:outline-none focus:border-blue-500">
                            <option value="">Select Event ID</option>
                            <option v-for="eventId in uniqueEventIds" :key="eventId" :value="eventId">{{ eventId }}
                            </option>
                        </select>
                        <label for="eventId"
                            class="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                            Event ID
                        </label>
                    </div>
                    <div class="relative">
                        <input v-model="queryParams.formId" type="text" id="formId"
                            class="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500"
                            placeholder="Form ID" />
                        <label for="formId"
                            class="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                            Form ID
                        </label>
                    </div>
                    <div class="relative">
                        <input v-model="queryParams.teamNumber" type="text" id="teamNumber"
                            class="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500"
                            placeholder="Team Number" />
                        <label for="teamNumber"
                            class="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                            Team Number
                        </label>
                    </div>
                </div>
                <button type="submit"
                    class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105">
                    <Icon icon="mdi:magnify" class="inline-block mr-2" />
                    Search
                </button>
            </form>

            <div v-if="loading" class="text-center py-8">
                <Icon icon="mdi:loading" class="animate-spin text-6xl text-blue-500" />
                <p class="mt-2 text-gray-600">Loading data...</p>
            </div>

            <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
                <p class="font-bold">Error</p>
                <p>{{ error }}</p>
            </div>

            <div v-else-if="filteredSurveyData.length === 0" class="text-center py-8">
                <Icon icon="mdi:robot" class="text-6xl text-gray-400 mb-4" />
                <p class="text-xl text-gray-600">
                    No data available. Try adjusting your search criteria.
                </p>
            </div>

            <div v-else>
                <section v-if="filteredSurveyData.length > 0" class="mb-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Data Visualization</h2>
                    <div class="mb-6 relative">
                        <select v-model="selectedChartType" id="chartType"
                            class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
                            <option value="all">All Charts</option>
                            <option value="driveTrain">Drive Train Types</option>
                            <option value="wheelType">Wheel Types</option>
                            <option value="scoringLocations">Scoring Locations</option>
                        </select>
                        <!-- <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <Icon icon="mdi:chevron-down" class="w-5 h-5" />
                        </div> -->
                    </div>
                    <div v-if="selectedChartType === 'all' || selectedChartType === 'driveTrain'" class="mb-8">
                        <h3 class="text-xl font-semibold mb-2">Drive Train Types</h3>
                        <div class="h-64">
                            <Bar :data="driveTrainChart.data" :options="driveTrainChart.options" />
                        </div>
                    </div>
                    <div v-if="selectedChartType === 'all' || selectedChartType === 'wheelType'" class="mb-8">
                        <h3 class="text-xl font-semibold mb-2">Wheel Types</h3>
                        <div class="h-64">
                            <Bar :data="wheelTypeChart.data" :options="wheelTypeChart.options" />
                        </div>
                    </div>
                    <div v-if="selectedChartType === 'all' || selectedChartType === 'scoringLocations'" class="mb-8">
                        <h3 class="text-xl font-semibold mb-2">Scoring Locations</h3>
                        <div class="h-64">
                            <Bar :data="scoringLocationsChart.data" :options="scoringLocationsChart.options" />
                        </div>
                    </div>
                </section>

                <section v-for="(eventData, eventId) in groupedSurveyData" :key="eventId"
                    class="mb-6 bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-2xl font-semibold mb-4">Event: {{ eventId }}</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th
                                        class="sticky left-0 z-10 bg-blue-100 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Team Number
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Drive Train
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Wheel Type
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Robot Weight (lbs)
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Robot Dimensions (L x W x H)
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Scoring Locations
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Comments
                                    </th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Images
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="(survey, index) in eventData" :key="survey.id"
                                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                                    <td class="sticky left-0 z-10 px-4 py-2"
                                        :class="index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'">
                                        {{ survey.data["Team number"] || "N/A" }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ survey.data["Type of drive train"] || "N/A" }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ survey.data["Type of wheels used"] || "N/A" }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ survey.data["Robot Weight (in pounds)"] || "N/A" }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ formatDimensions(
                                            survey.data['Robot Dimension (Length in Inches) without bumpers - front to back'],
                                            survey.data['Robot Dimension (Width in Inches) without bumpers - left to right'],
                                            survey.data['Robot Dimension (Height in Inches) from floor to highest point on robot at the start of the match']
                                        ) }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ formatArrayData(survey.data["Scoring Locations:"]) }}
                                    </td>
                                    <td class="px-4 py-2">
                                        {{ survey.data["Additional Comments"] || "N/A" }}
                                    </td>
                                    <td class="px-4 py-2">
                                        <div v-if="hasImages(survey)" class="flex justify-center">
                                            <button @click="openImageModal(survey)"
                                                class="text-blue-500 hover:text-blue-700">
                                                <Icon icon="mdi:image" class="text-xl" />
                                            </button>
                                        </div>
                                        <span v-else class="text-gray-400">No images</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>

        <!-- Image Modal -->
        <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click="closeImageModal">
            <div class="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Robot Images</h3>
                    <button @click="closeImageModal" class="text-gray-500 hover:text-gray-700">
                        <Icon icon="mdi:close" class="text-2xl" />
                    </button>
                </div>
                <div v-if="modalImages.length === 1" class="flex flex-col items-center">
                    <img :src="modalImages[0].url" :alt="modalImages[0].name"
                        class="max-w-full max-h-[60vh] object-contain" />
                    <p class="mt-2 text-center text-gray-700">{{ modalImages[0].name }}</p>
                </div>
                <div v-else-if="modalImages.length === 2" class="grid grid-cols-2 gap-4">
                    <div v-for="(image, index) in modalImages" :key="index" class="flex flex-col items-center">
                        <h4 class="font-semibold mb-2">{{ image.category }}</h4>
                        <img :src="image.url" :alt="image.name" class="max-w-full max-h-[50vh] object-contain" />
                        <p class="mt-2 text-center text-gray-700">{{ image.name }}</p>
                    </div>
                </div>
                <div v-else-if="modalImages.length > 2" class="grid grid-cols-2 gap-4">
                    <div v-for="(image, index) in modalImages" :key="index" class="flex flex-col items-center">
                        <h4 class="font-semibold mb-2">{{ image.category }}</h4>
                        <img :src="image.url" :alt="image.name" class="max-w-full max-h-[40vh] object-contain" />
                        <p class="mt-2 text-center text-gray-700">{{ image.name }}</p>
                    </div>
                </div>
                <p v-else class="text-center text-gray-500 my-4">No images available</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import { Icon } from "@iconify/vue";
import { Bar } from "vue-chartjs";
import { debounce } from "lodash";
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

interface SurveyData {
    id: number;
    event_id: string;
    form_id: string;
    data: {
        "Team number": string;
        "Type of drive train": string;
        "Type of wheels used": string;
        "Intake Use:": string[] | null;
        "Scoring Locations:": string[] | null;
        "Robot Weight (in pounds)": number;
        "Robot Dimension (Length in Inches) without bumpers - front to back": number;
        "Robot Dimension (Width in Inches) without bumpers - left to right": number;
        "Robot Dimension (Height in Inches) from floor to highest point on robot at the start of the match": number;
        "Drive Team Members": string;
        Maneuverability: string[] | null;
        "Height when fully extended (in inches)": number;
        "Hours/Weeks of Practice": string;
        "Additional Comments": string;
    };
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

const surveyData = ref<SurveyData[]>([]);
const loading = ref(false);
const error = ref("");
const queryParams = ref({
    eventId: "",
    formId: "",
    teamNumber: "",
});
const selectedChartType = ref("all");
const showImageModal = ref(false);
const modalImages = ref<ModalImage[]>([]);

const fetchData = async () => {
    loading.value = true;
    error.value = "";
    try {
        const response = await axios.get<SurveyData[]>("https://api.frc695.com/api/survey/query");
        surveyData.value = response.data;
    } catch (err) {
        console.error("Error fetching data:", err);
        error.value = "Failed to fetch data. Please try again later.";
        surveyData.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const uniqueEventIds = computed(() => {
    const eventIds = new Set(surveyData.value.map(survey => survey.event_id));
    return Array.from(eventIds);
});

const filteredSurveyData = computed(() => {
    return surveyData.value.filter(survey => {
        const eventIdMatch = !queryParams.value.eventId || survey.event_id === queryParams.value.eventId;
        const formIdMatch = !queryParams.value.formId || survey.form_id === queryParams.value.formId;
        const teamNumberMatch = !queryParams.value.teamNumber || survey.data["Team number"] === queryParams.value.teamNumber;
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

const createChartData = (dataKey: keyof SurveyData['data']) => {
    const dataTypes: Record<string, string[]> = {};
    filteredSurveyData.value.forEach((survey) => {
        let value = survey.data[dataKey];
        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (!dataTypes[v]) dataTypes[v] = [];
                dataTypes[v].push(survey.data["Team number"]);
            });
        } else {
            const key = value?.toString() || "Unknown";
            if (!dataTypes[key]) dataTypes[key] = [];
            dataTypes[key].push(survey.data["Team number"]);
        }
    });

    return {
        labels: Object.keys(dataTypes),
        datasets: [
            {
                label: dataKey as string,
                data: Object.values(dataTypes).map(teams => teams.length),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
        teamNumbers: dataTypes,
    };
};

const createChartOptions = (chartData: ReturnType<typeof createChartData>) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: "Distribution",
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y || 0;
                    const teamNumbers = chartData.teamNumbers[context.label] || [];
                    return [
                        `${label}: ${value}`,
                        'Teams:',
                        ...teamNumbers.map(team => `  ${team}`)
                    ];
                },
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Teams',
            },
            ticks: {
                precision: 0,
            },
        },
        x: {
            title: {
                display: true,
                text: 'Types',
            },
        },
    },
});

const driveTrainChart = computed(() => {
    const data = createChartData("Type of drive train");
    return { data, options: createChartOptions(data) };
});

const wheelTypeChart = computed(() => {
    const data = createChartData("Type of wheels used");
    return { data, options: createChartOptions(data) };
});

const scoringLocationsChart = computed(() => {
    const data = createChartData("Scoring Locations:");
    return { data, options: createChartOptions(data) };
});

const formatArrayData = (data: string[] | null): string => {
    return data && Array.isArray(data) ? data.join(", ") : "N/A";
};

const formatDimensions = (
    length: number,
    width: number,
    height: number
): string => {
    return `${length || "N/A"} x ${width || "N/A"} x ${height || "N/A"}`;
};

const hasImages = (survey: SurveyData): boolean => {
    return (
        (survey.upload?.fullRobotImages && survey.upload.fullRobotImages.length > 0) ||
        (survey.upload?.driveTrainImages && survey.upload.driveTrainImages.length > 0)
    );
};

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

const closeImageModal = () => {
    showImageModal.value = false;
    modalImages.value = [];
};

const performSearch = () => {
    // This function is now empty as filtering is done reactively
};

const debouncedPerformSearch = debounce(performSearch, 800);

watch(queryParams, debouncedPerformSearch, { deep: true });
</script>