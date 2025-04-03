<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 pb-32 rounded-b-md md:rounded-b-xl w-full">
      <header class="py-10">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-center text-3xl font-bold tracking-tight text-white">Pit Scouting Form</h1>
        </div>
      </header>
    </div>

    <main class="-mt-32 w-full flex justify-center">
      <div class="mx-auto md:mx-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 w-full">
        <div class="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <!-- Tabs -->
          <div class="mb-6 bg-gray-50 rounded-md p-4 border-2 border-dashed border-amber-500">
            <div class="flex flex-wrap gap-2 mb-2">
              <button v-for="(tab, index) in tabs" :key="index" @click="switchTab(index)"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200" :class="currentTab === index
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                  ">
                {{ tab.name }}
                <Icon icon="mdi:close" class="ml-2 inline-block" @click.stop="confirmRemoveTab(index)" />
              </button>
              <button @click="addTab"
                class="ml-2 px-4 py-2 rounded-md text-sm font-medium border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100 transition-colors duration-200">
                <Icon icon="mdi:plus" class="w-5 h-5 mr-1 inline-block" />
                Add Tab
              </button>
            </div>

            <div class="mt-2">
              <button @click="confirmClearCurrentTab"
                class="px-4 py-2 rounded-md text-sm font-medium border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200">
                <Icon icon="mdi:refresh" class="mr-2 inline-block" />
                Clear Current Tab
              </button>
            </div>
          </div>

          <!-- Debug Tools & Version Control -->
          <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <!-- <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Debug Tools</h2>
              <button @click="showResetModal = true; resetReason = 'manual';"
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center">
                <Icon icon="mdi:refresh" class="mr-2" />
                Reset Form
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600">Use the debug tools to inspect and modify form data.</p> -->
            <div class="flex justify-between items-center space-x-2">
              <!-- Reset Form Button (left side) -->
              <button @click="showResetModal = true; resetReason = 'manual';"
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center">
                <Icon icon="mdi:refresh" class="mr-2" />
                Reset Form
              </button>

              <!-- Form Version Display (center) -->
              <div class="text-center">
                <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  Form Version: {{ FORM_VERSION }}
                </span>
              </div>

              <!-- Debug Tools (right side) -->
              <div class="flex space-x-2">
                <DebugTools />
              </div>
            </div>

            <!-- Reset Confirmation Modal -->
            <Transition name="fade">
              <div v-if="showResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 class="text-xl font-bold mb-4 text-gray-800">
                    {{ resetReason === 'version-change' ? 'Form Version Updated' : 'Reset Form' }}
                  </h3>
                  
                  <p class="mb-6 text-gray-600">
                    {{ resetReason === 'version-change' 
                      ? 'The pit scouting form has been updated to a new version. Your saved form data needs to be cleared to ensure compatibility.' 
                      : 'This will clear all your saved form data. Any unsaved information will be lost. Are you sure you want to continue?' 
                    }}
                  </p>
                  
                  <div class="flex justify-end space-x-3">
                    <button 
                      v-if="resetReason === 'manual'" 
                      @click="cancelReset" 
                      class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    
                    <button 
                      @click="confirmReset" 
                      class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      {{ resetReason === 'version-change' ? 'Clear and Continue' : 'Reset Form' }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Event ID and Form ID -->
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gray-50 p-4 rounded-md border-2 border-dotted border-pink-500">
            <div class="mb-2 sm:mb-0">
              <span class="text-sm font-medium text-gray-500">Event ID:</span>
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">{{ eventId }}</span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Form ID:</span>
              <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">{{ currentFormId }}</span>
            </div>
          </div>

          <!-- User Info Display -->
          <div class="mb-6 bg-indigo-50 p-4 rounded-md border border-indigo-200">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <template v-if="userData.avatar">
                  <img :src="userData.avatar" alt="User Avatar" class="h-10 w-10 rounded-full object-cover" />
                </template>
                <Icon v-else icon="mdi:account" class="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-700">Submitting as:</h3>
                <p class="text-indigo-700 font-medium">{{ userData.displayName || userData.name }}</p>
              </div>
            </div>
          </div>

          <!-- Additional Info Display -->
          <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
            <p class="text-sm text-gray-600">Pit scouting area map is available at 
              <a :href="`https://frc.nexus/en/event/${formatEventId(eventId)}/team/695/map`" target="_blank" class="text-indigo-600 hover:underline">FRC Nexus</a>
              <Icon icon="mdi:link" class="ml-1 inline-block text-indigo-600" />
            </p>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="confirmSubmitForm">
            <div v-for="(field, index) in formFields" :key="index" class="mb-6">
              <label :for="'field-' + index" class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.question }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <p v-if="field.description" class="text-sm text-gray-500 mb-2">{{ field.description }}</p>

              <!-- Team Number Autofill -->
              <div v-if="field.type === 'autocomplete'" class="relative rounded-md shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input :id="'field-' + index" type="text" v-model="field.value" :required="field.required" :class="[
                  'block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
                  field.error ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                ]" placeholder="Search teams..." @input="handleTeamNumberInput" @focus="showTeamSuggestions = true"
                  @blur="hideTeamSuggestions" />
                <div v-if="showTeamSuggestions && filteredTeamSuggestions.length > 0"
                  class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  <div v-for="team in filteredTeamSuggestions" :key="team.team_number"
                    @mousedown.prevent="selectTeam(team)"
                    class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100">
                    <div class="flex items-center">
                      <span class="font-normal truncate">{{ team.team_number }} - {{ team.team_name }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="field.error" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Icon icon="mingcute:alert-fill" class="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              </div>

              <!-- Input fields -->
              <div v-if="field.type === 'text' || field.type === 'number'" class="relative rounded-md shadow-sm">
                <input :id="'field-' + index" :type="field.type" v-model="field.value" :required="field.required"
                  :class="[
                    'block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
                    'px-3',
                    field.error ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                  ]" @input="debouncedSaveFormData()" @blur="validateField(field)" />
                <div v-if="field.error" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Icon icon="mingcute:alert-fill" class="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              </div>

              <!-- Textarea -->
              <textarea v-else-if="field.type === 'textarea'" :id="'field-' + index" v-model="field.value"
                :required="field.required" rows="3" :class="[
                  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
                  field.error ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                ]" @blur="() => { debouncedSaveFormData(); validateField(field); }"></textarea>

              <!-- Radio buttons -->
              <div v-else-if="field.type === 'radio'" class="mt-2">
                <fieldset>
                  <legend class="sr-only">{{ field.question }}</legend>
                  <div class="space-y-4">
                    <div v-for="(option, optionIndex) in field.options" :key="optionIndex" class="flex items-center">
                      <input :id="'field-' + index + '-' + optionIndex" :name="'field-' + index" type="radio"
                        :value="getOptionValue(option)" v-model="field.value" :required="field.required"
                        class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        @blur="debouncedSaveFormData" />
                      <label :for="'field-' + index + '-' + optionIndex"
                        class="ml-3 block text-sm font-medium leading-6 text-gray-900">
                        {{ option }}
                      </label>
                    </div>
                  </div>
                </fieldset>
                <input v-if="field.value === 'Other'" v-model="field.otherValue" type="text"
                  :placeholder="'Specify other ' + field.question.toLowerCase()"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  @blur="debouncedSaveFormData" />
              </div>

              <!-- Checkboxes -->
              <div v-else-if="field.type === 'checkbox'" class="mt-2">
                <fieldset>
                  <legend class="sr-only">{{ field.question }}</legend>
                  <div class="space-y-5">
                    <div v-for="(option, optionIndex) in field.options" :key="optionIndex"
                      class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input :id="'field-' + index + '-' + optionIndex" type="checkbox"
                          :value="getOptionValue(option)" v-model="field.value"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          @change="debouncedSaveFormData" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label :for="'field-' + index + '-' + optionIndex" class="font-medium text-gray-900">{{ option
                          }}</label>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <input v-if="Array.isArray(field.value) && field.value.includes('Other')" v-model="field.otherValue"
                  type="text" :placeholder="'Specify other ' + field.question.toLowerCase()"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  @blur="debouncedSaveFormData" />
              </div>

              <p v-if="field.error" class="mt-2 text-sm text-red-600" :id="'field-' + index + '-error'">
                {{ field.error }}
              </p>
            </div>

            <!-- Image upload sections -->
            <div class="space-y-6">
              <div v-for="(imageType, typeIndex) in ['fullRobot', 'driveTrain']" :key="typeIndex"
                class="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">
                  {{ imageType === 'fullRobot' ? 'Full Robots Images' : 'Drive Train Images' }}
                </h2>
                <div @dragover.prevent @drop.prevent="handleDrop(imageType as 'fullRobot' | 'driveTrain', $event)"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors duration-300"
                  @click="imageRefs[imageType + 'Input']?.click()">
                  <input type="file" accept="image/*"
                    @change="handleFileSelect(imageType as 'fullRobot' | 'driveTrain', $event)" class="hidden"
                    :ref="el => { if (el) imageRefs[imageType + 'Input'] = el as HTMLInputElement }" multiple />
                  <Icon icon="fa6-solid:image" class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <div class="mt-4 flex flex-col text-sm leading-6 text-gray-600 justify-center">
                    <span
                      class="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      Upload a file
                    </span>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-400 md:text-gray-600">PNG, JPG, JPEG, HEIC, GIF up to 50MB each
                  </p>
                </div>
                <div v-if="(imageType === 'fullRobot' ? fullRobotImages : driveTrainImages).length > 0"
                  class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div v-for="(image, index) in (imageType === 'fullRobot' ? fullRobotImages : driveTrainImages)"
                    :key="index" class="relative bg-white p-2 rounded-lg shadow">
                    <img :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded-lg" />
                    <div class="mt-2 text-xs text-gray-600 truncate">{{ image.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(image.size) }}</div>
                    <button @click="confirmRemoveImage(imageType as 'fullRobot' | 'driveTrain', index)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none">
                      <Icon icon="mdi:close" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <button type="submit"
                class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                <Icon icon="mdi:send" class="mr-2 w-4 h-4" />
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { Icon } from "@iconify/vue";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Swal from "sweetalert2";
import DebugTools from "@/components/DebugTools/index.vue"
import { useUserStore } from '@/stores/userStore';
// Import casdoorService
import { casdoorService } from '@/services/auth';
import { storeToRefs } from 'pinia';
// Import the required functions from the PageSpy library
import PageSpy from '@huolala-tech/page-spy-browser';
import DataHarborPlugin from '@huolala-tech/page-spy-plugin-data-harbor';
import RRWebPlugin from '@huolala-tech/page-spy-plugin-rrweb';

declare global {
  interface Window {
    $harbor: any;
    $rrweb: any;
    $pageSpy: any;
  }
}

interface FormField {
  question: string;
  type: string;
  required: boolean;
  value: any;
  options?: string[];
  i?: string;
  w?: string;
  showOtherInput?: boolean;
  otherValue?: string;
  showDescription?: boolean;
  description?: string;
  error?: string;
  // New property to store clean option values without descriptions
  optionValues?: string[];
  // Original index to maintain order
  originalIndex?: number;
}

interface Tab {
  name: string;
  formData: FormField[];
  formId: string;
}

interface ImageData {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface Team {
  team_number: string;
  team_name: string;
}

// Use the Pinia store for user data
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

// Computed property for user data
const userData = computed(() => {
  return userInfo.value || {};
});

// Format event ID for URL
const formatEventId = (id: string): string => {
  return id.replace('_', '').toLowerCase();
};

const tabs = ref<Tab[]>([{ name: "Tab 1", formData: [], formId: uuidv4() }]);
const currentTab = ref(0);
const eventId = ref("");

const currentFormId = computed(() => tabs.value[currentTab.value].formId);

// Form versioning control
const FORM_VERSION = "2025.4.3"; // Update this when you want to force a form reset
const FORM_VERSION_KEY = "pit-scouting-form-version";

// For reset modal
const showResetModal = ref(false);
const resetReason = ref("manual"); // "manual" or "version-change"

// onMounted lifecycle hook to check for form version changes
onMounted(async () => {
  // Check if form version has changed
  const storedVersion = localStorage.getItem(FORM_VERSION_KEY);
  if (storedVersion !== FORM_VERSION) {
    resetReason.value = "version-change";
    showResetModal.value = true;
  }
});

// Function to reset the form
const resetForm = () => {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Filter keys related to the form
  const formKeys = keys.filter(key => 
    key.startsWith('driveTrainImages_') || 
    key.startsWith('formData_') || 
    key.startsWith('fullRobotImages_') || 
    key === 'surveyTabs'
  );
  
  // Remove all form-related items
  formKeys.forEach(key => localStorage.removeItem(key));
  
  // Update the stored version
  localStorage.setItem(FORM_VERSION_KEY, FORM_VERSION);
  
  // Refresh the page
  window.location.reload();
};

// Handle user confirmation
const confirmReset = () => {
  resetForm();
  showResetModal.value = false;
};

// Cancel reset
const cancelReset = () => {
  if (resetReason.value === "version-change") {
    // If it was a version change, we still need to update the version
    localStorage.setItem(FORM_VERSION_KEY, FORM_VERSION);
  }
  showResetModal.value = false;
};

// Form Questions and Fields info
const formFields = ref<FormField[]>([
  {
    question: "Team number",
    type: "autocomplete",
    required: true,
    value: null,
    originalIndex: 0
  },
  {
    i: "https://lh7-us.googleusercontent.com/pUWvHrPDa5IfrQcFalk4lO0e4PhD3sLMP0jyLJU8PTWWGfw5r-Wa4qDQNHhbu0byYLzXScP5lfTSUCsvbNI-FlwDY2L7Ra0-TgYqf5Eabw0INSFE3ah4QCqCqHFrsaPKyCOt8m2Yo-H2ie9E7apzh6c8AO147A",
    w: "50%",
    question: "Type of drive train",
    description: "Select the type of drive train used in your robot design.",
    type: "radio",
    options: [
      'Tank Drive ("skid steer", plates on both sides of wheels)',
      "West Coast Drive (wheels mounted off one side of tube)",
      "Swerve Drive",
      "Other",
    ],
    optionValues: [
      'Tank Drive',
      "West Coast Drive",
      "Swerve Drive",
      "Other",
    ],
    value: null,
    required: true,
    showOtherInput: false,
    otherValue: "",
    showDescription: false,
    originalIndex: 1
  },
  {
    i: "https://lh7-us.googleusercontent.com/PCI7CaG88MiY50L7AM0CVTs9dRd3NQgqW4B2rd64vmjHaNDMEHR0EkWYqv-rzHBnGBC08NzWtr7W97lIk226Q9WVCPuTKuOSZcpb6eyNC5Q3HGmFQwp8005gRcxiS09RjeWUJQJTK-vQGDWd0QAbpSipLSkExw",
    w: "100%",
    question: "Type of wheels used",
    description: "Choose the type of wheels used on your robot.",
    type: "radio",
    options: [
      "Traction",
      "Mecanum (rollers at 45° angle)",
      "Omni (rollers at 90° angle)",
      "Other",
    ],
    optionValues: [
      "Traction",
      "Mecanum",
      "Omni",
      "Other",
    ],
    value: null,
    required: true,
    showOtherInput: false,
    otherValue: "",
    showDescription: false,
    originalIndex: 2
  },
  {
    question: "Intake Use:",
    type: "checkbox",
    options: ["Ground", "Station", "None", "Other"],
    optionValues: ["Ground", "Station", "None", "Other"],
    value: [],
    required: true,
    showOtherInput: false,
    otherValue: "",
    originalIndex: 3
  },
  {
    question: "Scoring Locations:",
    type: "checkbox",
    options: ["L1", "L2", "L3", "L4", "Algae in Processor", "Algae in Net", "Other"],
    optionValues: ["L1", "L2", "L3", "L4", "Algae in Processor", "Algae in Net", "Other"],
    value: [],
    required: true,
    showOtherInput: false,
    otherValue: "",
    originalIndex: 4
  },
  {
    question: "Cage Climbing:",
    type: "checkbox",
    options: ["Deep Climb", "Shallow Climb", "No Climb"],
    optionValues: ["Deep Climb", "Shallow Climb", "No Climb"],
    value: [],
    required: true,
    originalIndex: 5
  },
  {
    question: "Robot Weight",
    description: "Enter the weight of the robot in pounds.",
    type: "number",
    required: true,
    value: null,
    originalIndex: 6
  },
  {
    question: "Robot Length",
    description: "Enter the length of the robot in inches without bumpers(front to back).",
    type: "number",
    required: true,
    value: null,
    originalIndex: 7
  },
  {
    question: "Robot Width",
    description: "Enter the width of the robot in inches without bumpers(left to right).",
    type: "number",
    required: true,
    value: null,
    originalIndex: 8
  },
  {
    question: "Robot Height",
    description: "Enter the height of the robot in inches from the floor to the highest point on the robot at the start of the match.",
    type: "number",
    required: true,
    value: null,
    originalIndex: 9
  },
  {
    question: "Height when fully extended",
    description: "In inches.",
    type: "number",
    required: true,
    value: null,
    originalIndex: 10
  },
  {
    question: "Drive Team Members",
    type: "radio",
    options: [
      "One person driving and operating the robot during a match",
      "Other",
    ],
    optionValues: [
      "One person driving and operating the robot during a match",
      "Other",
    ],
    value: null,
    required: true,
    showOtherInput: false,
    otherValue: "",
    originalIndex: 11
  },
  {
    question: "Hours/Weeks of Practice",
    type: "text",
    required: true,
    value: null,
    originalIndex: 12
  },
  {
    question: "Additional Comments",
    type: "textarea",
    required: false,
    value: null,
    originalIndex: 13
  },
]);

const fullRobotImages = ref<ImageData[]>([]);
const driveTrainImages = ref<ImageData[]>([]);
const imageRefs = ref<{ [key: string]: HTMLInputElement | null }>({});
const teamSuggestions = ref<any[]>([]);
const showTeamSuggestions = ref(false);

onMounted(async () => {
  // Initialize the store to get user data
  userStore.initializeStore();
  
  await loadTeams('');
  await loadEventId();
  const isNewUser = !localStorage.getItem("surveyTabs");
  if (isNewUser) {
    saveToLocalStorage();
  } else {
    loadFromLocalStorage();
  }
});

// Function to extract clean option value without descriptions
const getOptionValue = (option: string): string => {
  // If the option contains parentheses, extract just the main part
  const parenIndex = option.indexOf('(');
  if (parenIndex > 0) {
    // Return the part before the parenthesis, trimmed
    return option.substring(0, parenIndex).trim();
  }
  return option;
};

const handleTeamNumberInput = async (event: Event) => {
  const input = (event.target as HTMLInputElement).value;
  if (input.length >= 2) { // Only search when at least 2 characters are entered
    await loadTeams(input);
  } else {
    teamSuggestions.value = [];
  }
  showTeamSuggestions.value = true;
};

const filteredTeamSuggestions = computed(() => {
  const query = formFields.value[0]?.value?.toLowerCase() || '';
  if (!query) return [];
  return teamSuggestions.value.filter(
    (team) =>
      team.team_number.includes(query) ||
      team.team_name.toLowerCase().includes(query)
  );
});

const loadEventId = async () => {
  try {
    const response = await fetch("https://api.frc695.com/api/event/event-id");
    const data = await response.json();
    eventId.value = data.eventId;
  } catch (error) {
    console.error("Error loading event ID:", error);
  }
};

watch(
  [tabs, currentTab],
  (newValues, oldValues) => {
    if (JSON.stringify(newValues) !== JSON.stringify(oldValues)) {
      saveToLocalStorage();
    }
  },
  { deep: true }
);

const addTab = () => {
  const newTab: Tab = {
    name: `Tab ${tabs.value.length + 1}`,
    formData: JSON.parse(
      JSON.stringify(
        formFields.value.map((field) => ({
          ...field,
          value: field.type === "checkbox" ? [] : null,
          error: undefined,
        }))
      )
    ),
    formId: uuidv4(),
  };
  tabs.value.push(newTab);
  switchTab(tabs.value.length - 1);
  saveToLocalStorage(); // Once the new tab is added, save it to localStorage immediately
};

const confirmRemoveTab = (index: number) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to delete this tab. This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Confirm Deletion",
        text: "Are you absolutely sure you want to delete this tab?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      }).then((secondResult) => {
        if (secondResult.isConfirmed) {
          removeTab(index);
          Swal.fire("Deleted!", "The tab has been deleted.", "success");
        }
      });
    }
  });
};

const removeTab = (index: number) => {
  const removedTab = tabs.value[index];
  tabs.value.splice(index, 1);

  if (tabs.value.length === 0) {
    addTab();
  } else if (currentTab.value >= tabs.value.length) {
    currentTab.value = tabs.value.length - 1;
  }

  switchTab(currentTab.value);

  // Remove localStorage data for the deleted tab
  localStorage.removeItem(`formData_${removedTab.formId}`);
  localStorage.removeItem(`fullRobotImages_${removedTab.formId}`);
  localStorage.removeItem(`driveTrainImages_${removedTab.formId}`);
};

const switchTab = (index: number) => {
  currentTab.value = index;
  formFields.value = JSON.parse(JSON.stringify(tabs.value[index].formData));
  loadImagesFromLocalStorage();
};

const clearCurrentTab = () => {
  tabs.value[currentTab.value].formData = JSON.parse(
    JSON.stringify(
      formFields.value.map((field) => ({
        ...field,
        value: field.type === "checkbox" ? [] : null,
        otherValue: "",
        error: undefined,
      }))
    )
  );
  formFields.value = tabs.value[currentTab.value].formData;
  fullRobotImages.value = [];
  driveTrainImages.value = [];
  saveFormData();
};

const confirmClearCurrentTab = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to clear all data in the current tab. This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, clear it!",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Confirm Clearing",
        text: "Are you absolutely sure you want to clear all data in this tab?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Clear",
        cancelButtonText: "Cancel",
      }).then((secondResult) => {
        if (secondResult.isConfirmed) {
          clearCurrentTab();
          Swal.fire("Cleared!", "The tab data has been cleared.", "success");
        }
      });
    }
  });
};

const selectTeam = (team: Team) => {
  formFields.value[0].value = team.team_number;
  showTeamSuggestions.value = false;
};

const loadTeams = async (query: string) => {
  try {
    const response = await fetch(`https://api.frc695.com/api/team/teams?query=${query}&limit=20`);
    const data = await response.json();
    teamSuggestions.value = data;
  } catch (error) {
    console.error("Error loading teams:", error);
  }
};

const hideTeamSuggestions = () => {
  setTimeout(() => {
    showTeamSuggestions.value = false;
  }, 200);
};

onMounted(() => {
  imageRefs.value = {
    fullRobotInput: document.querySelector('input[ref="fullRobotInput"]') as HTMLInputElement,
    driveTrainInput: document.querySelector('input[ref="driveTrainInput"]') as HTMLInputElement,
  };
});

const handleFileSelect = async (
  type: "fullRobot" | "driveTrain",
  event: Event
) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    for (let i = 0; i < files.length; i++) {
      if (isAllowedImageType(files[i])) {
        await uploadImage(type, files[i]);
      } else {
        Swal.fire(
          "Invalid File Type",
          "Please upload only JPEG, JPG, PNG, HEIC, or GIF images.",
          "error"
        );
      }
    }
  }
};

const handleDrop = async (
  type: "fullRobot" | "driveTrain",
  event: DragEvent
) => {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files) {
    for (let i = 0; i < files.length; i++) {
      if (isAllowedImageType(files[i])) {
        await uploadImage(type, files[i]);
      } else {
        Swal.fire(
          "Invalid File Type",
          "Please upload only JPEG, JPG, PNG, HEIC, or GIF images.",
          "error"
        );
      }
    }
  }
};

const uploadImage = async (type: "fullRobot" | "driveTrain", file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  try {
    const response = await fetch("https://api.frc695.com/api/upload/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    const imageData: ImageData = {
      id: data.id, // Get the image ID from the response
      url: data.url,
      name: file.name,
      size: file.size,
    };
    if (type === "fullRobot") {
      fullRobotImages.value.push(imageData);
    } else {
      driveTrainImages.value.push(imageData);
    }
    saveImagesToLocalStorage();
  } catch (error) {
    console.error("Error uploading image:", error);
    Swal.fire(
      "Upload Error",
      "There was an error uploading the image. Please try again.",
      "error"
    );
  }
};

const confirmRemoveImage = (
  type: "fullRobot" | "driveTrain",
  index: number
) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to delete this image. This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      removeImage(type, index);
      Swal.fire("Deleted!", "The image has been deleted.", "success");
    }
  });
};

const removeImage = async (type: "fullRobot" | "driveTrain", index: number) => {
  try {
    const imageId = type === "fullRobot" ? fullRobotImages.value[index].id : driveTrainImages.value[index].id;
    await axios.delete(`https://api.frc695.com/api/images/${imageId}`);

    if (type === "fullRobot") {
      fullRobotImages.value.splice(index, 1);
    } else {
      driveTrainImages.value.splice(index, 1);
    }
    saveImagesToLocalStorage();
  } catch (error) {
    console.error("Failed to delete image:", error);
    Swal.fire({
      title: "Error!",
      text: "Failed to delete the image from the server. Do you want to remove it locally?",
      icon: "error",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it locally",
    }).then((result) => {
      if (result.isConfirmed) {
        if (type === "fullRobot") {
          fullRobotImages.value.splice(index, 1);
        } else {
          driveTrainImages.value.splice(index, 1);
        }
        saveImagesToLocalStorage();
        Swal.fire("Removed!", "The image has been removed locally.", "success");
      }
    });
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Escape special characters in input values to prevent JSON parsing issues
const escapeInput = (input: string): string => {
  return input
    .replace(/\\/g, "\\\\") // Escape backslash
    .replace(/"/g, '\\"')   // Escape double quotes
    .replace(/'/g, "\\'")   // Escape single quotes
    .replace(/`/g, "\\`")   // Escape backticks
    .replace(/\//g, "\\/")  // Escape forward slash
    .replace(/\$/g, "\\$")  // Escape dollar sign
    .replace(/%/g, "\\%")   // Escape percent sign
    .replace(/\{/g, "\\{")  // Escape left curly brace
    .replace(/\}/g, "\\}")  // Escape right curly brace
    .replace(/\[/g, "\\[")  // Escape left square bracket
    .replace(/\]/g, "\\]")  // Escape right square bracket
    .replace(/</g, "&lt;")  // Escape less-than sign (HTML entity)
    .replace(/>/g, "&gt;")  // Escape greater-than sign (HTML entity)
    .replace(/&/g, "&amp;") // Escape ampersand (HTML entity)
    .replace(/\(/g, "\\(")  // Escape left parenthesis
    .replace(/\)/g, "\\)")  // Escape right parenthesis
    .replace(/\*/g, "\\*")  // Escape asterisk
    .replace(/\+/g, "\\+")  // Escape plus sign
    .replace(/-/g, "\\-")   // Escape minus sign
    .replace(/#/g, "\\#")   // Escape hash symbol
    .replace(/@/g, "\\@")   // Escape at symbol
    .replace(/\^/g, "\\^")  // Escape caret
    .replace(/~/g, "\\~")   // Escape tilde
    .replace(/\|/g, "\\|")  // Escape vertical bar
    .replace(/:/g, "\\:")   // Escape colon
    .replace(/;/g, "\\;")   // Escape semicolon
    .replace(/,/g, "\\,")   // Escape comma
    .replace(/\./g, "\\.")  // Escape period
    .replace(/\?/g, "\\?")  // Escape question mark
    .replace(/!/g, "\\!");  // Escape exclamation mark
};

const saveFormData = () => {
  // Deep copy the formFields to avoid directly modifying the reactive data
  const updatedFields = formFields.value.map(field => {
    // Fix: Escape input values before saving to localStorage
    if (field.type === "text" || field.type === "textarea" || field.type === "autocomplete") {
      field.value = typeof field.value === "string" ? escapeInput(field.value) : field.value;
    }

    // Fix: Ensure checkbox options are saved in the order of the question
    if (field.type === "checkbox" && Array.isArray(field.value)) {
      field.value = field.optionValues?.filter(option => field.value.includes(option)) || [];
    }

    // Won't directly modify the field value, just return a new object with the processed value
    return { ...field, value: processValue(field.value) };
  });

  // Update the current tab's formData with the updated fields
  tabs.value[currentTab.value].formData = updatedFields;

  // Fix: Use the currentFormId to save the form data
  localStorage.setItem(
    `formData_${currentFormId.value}`,
    JSON.stringify(updatedFields)
  );
};

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const debouncedSaveFormData = debounce(saveFormData, 300);

const saveImagesToLocalStorage = () => {
  localStorage.setItem(
    `fullRobotImages_${currentFormId.value}`,
    JSON.stringify(fullRobotImages.value)
  );
  localStorage.setItem(
    `driveTrainImages_${currentFormId.value}`,
    JSON.stringify(driveTrainImages.value)
  );
};

const loadImagesFromLocalStorage = () => {
  const savedFullRobotImages = localStorage.getItem(
    `fullRobotImages_${currentFormId.value}`
  );
  const savedDriveTrainImages = localStorage.getItem(
    `driveTrainImages_${currentFormId.value}`
  );

  if (savedFullRobotImages) {
    fullRobotImages.value = JSON.parse(savedFullRobotImages);
  } else {
    fullRobotImages.value = [];
  }

  if (savedDriveTrainImages) {
    driveTrainImages.value = JSON.parse(savedDriveTrainImages);
  } else {
    driveTrainImages.value = [];
  }
};

const saveToLocalStorage = () => {
  localStorage.setItem("surveyTabs", JSON.stringify(tabs.value));
  localStorage.setItem("currentTab", currentTab.value.toString());
  saveFormData();
  saveImagesToLocalStorage();
};

const loadFromLocalStorage = () => {
  const savedTabs = localStorage.getItem("surveyTabs");
  const savedCurrentTab = localStorage.getItem("currentTab");
  if (savedTabs) {
    tabs.value = JSON.parse(savedTabs);
    currentTab.value = savedCurrentTab ? parseInt(savedCurrentTab) : 0;
    
    // 确保所有表单字段都有otherValue属性
    formFields.value = tabs.value[currentTab.value].formData.map(field => {
      if ((field.type === 'radio' || field.type === 'checkbox') && field.options?.includes('Other')) {
        return {
          ...field,
          otherValue: field.otherValue || ""
        };
      }
      return field;
    });
  }
  loadImagesFromLocalStorage();
};

const isAllowedImageType = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/heic"];
  return allowedTypes.includes(file.type);
};

const validateField = (field: FormField) => {
  if (field.required) {
    if (field.type === "radio" || field.type === "checkbox") {
      if (
        !field.value ||
        (Array.isArray(field.value) && field.value.length === 0)
      ) {
        field.error = "This field is required";
        return false;
      }
      if (
        (field.value === "Other" ||
          (Array.isArray(field.value) && field.value.includes("Other"))) &&
        !field.otherValue
      ) {
        field.error = "Please specify the other option";
        return false;
      }
    } else if (!field.value) {
      field.error = "This field is required";
      return false;
    }
  }
  field.error = undefined;
  return true;
};

const validateForm = (): boolean => {
  let isValid = true;
  formFields.value.forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  return isValid;
};

const deviceInfo = ref({
  userAgent: navigator.userAgent,
  ip: '',
  language: navigator.language,
});

// Function to submit the form
const isSubmitting = ref(false);

const submitForm = async () => {
  try {
    isSubmitting.value = true;
    
    // Get user info including avatar
    let userAvatar = userData.value.avatar || "";
    
    // If avatar is not in userData, try to get it directly from casdoorService
    if (!userAvatar) {
      try {
        const userInfo = await casdoorService.getUserInfo(true); // Force refresh to get latest data
        userAvatar = userInfo.avatar || "";
        console.log("Retrieved avatar from casdoorService:", userAvatar);
      } catch (avatarError) {
        console.error("Error fetching user avatar:", avatarError);
      }
    }
    
    // 按照originalIndex排序表单字段
    const sortedFields = [...formFields.value].sort((a, b) => 
      (a.originalIndex || 0) - (b.originalIndex || 0)
    );
    
    // 创建一个有序的表单数据对象
    const processedFormData = sortedFields.map(field => {
      const processedField = { ...field };
      
      // 处理单选按钮的"Other"选项
      if (field.type === "radio" && field.value === "Other" && field.otherValue) {
        processedField.value = field.otherValue;
      }
      
      // 处理复选框的"Other"选项
      if (field.type === "checkbox" && Array.isArray(field.value)) {
        if (field.value.includes("Other") && field.otherValue) {
          processedField.value = field.value.map(val => 
            val === "Other" ? field.otherValue : val
          );
        }
      }
      
      return processedField;
    });

    // 创建提交对象
    const submissionData = {
      eventId: eventId.value,
      tabs: [
        {
          name: tabs.value[currentTab.value].name,
          formData: processedFormData, // 使用已排序的表单数据
          formId: currentFormId.value
        }
      ],
      images: {
        fullRobotImages: fullRobotImages.value,
        driveTrainImages: driveTrainImages.value
      },
      deviceInfo: deviceInfo.value,
      // Add user information to the submission
      userData: {
        username: userData.value.name,
        displayName: userData.value.displayName,
        userId: userData.value.id,
        avatar: userAvatar,
        email: userData.value.email || "",
      }
    };

    console.log("Submitting with avatar:", userAvatar);

    // 上传日志并获取URL
    const url = await window.$harbor.upload();
    submissionData.tabs[0].formData.push({
      question: "Log URL",
      type: "text",
      required: false,
      value: url,
      originalIndex: processedFormData.length
    });

    const response = await fetch("https://api.frc695.com/api/survey/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Form submitted:", data);

      // 清除本地存储
      localStorage.removeItem(`formData_${currentFormId.value}`);
      localStorage.removeItem(`fullRobotImages_${currentFormId.value}`);
      localStorage.removeItem(`driveTrainImages_${currentFormId.value}`);

      // 显示成功消息，并在用户点击确定后再刷新页面
      Swal.fire({
        title: "Success!",
        text: "Form submitted successfully!",
        icon: "success",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          // 删除当前标签页及其所有内容
          removeTab(currentTab.value);
          
          // 刷新页面以确保没有本地存储缓存
          location.reload();
        }
      });
    } else {
      throw new Error(data.error || "Failed to submit form");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    Swal.fire(
      "Submission Error",
      "There was an error submitting the form. Please try again.",
      "error"
    );
  } finally {
    isSubmitting.value = false;
  }
};

const confirmSubmitForm = () => {
  if (validateForm()) {
    Swal.fire({
      title: "Submit Form",
      text: "Are you sure you want to submit this form?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        submitForm();
      }
    });
  } else {
    Swal.fire(
      "Validation Error",
      "Please fill in all required fields before submitting.",
      "error"
    );
  }
};

onMounted(() => {
  // Get user's IP address
  axios.get('https://api.ipify.org?format=json').then((response) => {
    deviceInfo.value.ip = response.data.ip;
  });

  // Initialize PageSpy
  if (!window.$harbor) {
    window.$harbor = new DataHarborPlugin();
    PageSpy.registerPlugin(window.$harbor);
  }

  if (!window.$rrweb) {
    window.$rrweb = new RRWebPlugin();
    PageSpy.registerPlugin(window.$rrweb);
  }

  window.$pageSpy = new PageSpy({
    lang: 'en',
    api: 'report.makesome.cool',
    clientOrigin: 'https://report.makesome.cool',
    autoRender: false,
    enableSSL: true,
    project: '695_Web',
    title: 'Pit',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cGF0aCBmaWxsPSIjNTM1MzUzIiBkPSJNMyA2YTMgMyAwIDAgMSAzLTNoOGEzIDMgMCAwIDEgMyAzdjIuMDNhNC41IDQuNSAwIDAgMC0xLS4wMDRWN0g0djdhMiAyIDAgMCAwIDIgMmgzLjQ5MmEyLjUgMi41IDAgMCAwLS40NDMgMUg2YTMgMyAwIDAgMS0zLTN6bTEwLjA0NCAzLjU4N2wtMS40NC0xLjQ0YS41LjUgMCAwIDAtLjcwOC43MDdsMS41NzggMS41NzdxLjIzMi0uNDQ3LjU3LS44NDRtLTMuOTQtLjczM2EuNS41IDAgMSAwLS43MDgtLjcwOGwtMi41IDIuNWEuNS41IDAgMCAwIDAgLjcwOGwyLjUgMi41YS41LjUgMCAwIDAgLjcwOC0uNzA4TDYuOTU3IDExem03Ljc4OC4xN2MuMzY2LjA0Mi40NzEuNDguMjEuNzQybC0uOTc1Ljk3NWExLjUwNyAxLjUwNyAwIDEgMCAyLjEzMiAyLjEzMmwuOTc1LS45NzVjLjI2MS0uMjYxLjctLjE1Ni43NDIuMjFhMy41MTggMy41MTggMCAwIDEtNC42NzYgMy43MjNsLTIuNzI2IDIuNzI3YTEuNTA3IDEuNTA3IDAgMSAxLTIuMTMyLTIuMTMybDIuNzI2LTIuNzI2YTMuNTE4IDMuNTE4IDAgMCAxIDMuNzI0LTQuNjc2Ii8+PC9zdmc+',
    logoStyle: {
      width: '10%',
      height: '10%',
    },
  });

  // window.$pageSpy.render();
});

function processValue(value: any): any {
  // 如果需要对值进行特殊处理，可以在这里实现逻辑
  return value; // 默认直接返回原值
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>