<template>
  <div class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <div class="flex flex-col items-center py-8">
      <img :src="src" :alt="alt" class="w-24 h-24 mb-3 rounded-full shadow-lg" />
      <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
        {{ name }}
      </h5>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ role }}</span>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ email }}</span>
      <div class="flex mt-4 md:mt-6">
        <!-- <a
          :href="detailsLink"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >Details</a
        > -->
        <a 
          :href="detailsLink"
          class="text-blue-500 hover:text-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 inline-flex items-center"
        >Learn More
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MentorCard",
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    detailsLink: {
      type: String,
      default: "#",
    },
    email: {
      type: String,
    }
  },
});
</script>

