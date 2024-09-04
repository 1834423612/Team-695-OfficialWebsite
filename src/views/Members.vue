<template>
  <div class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Mentors Section -->
      <section id="mentors" class="mb-24">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">Our Mentors</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(mentor, index) in mentors" :key="index"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group">
            <div class="p-6 relative">
              <div
                class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity duration-300">
              </div>
              <h3 class="text-2xl font-semibold text-gray-800 mb-2 relative z-10">{{ mentor.name }}</h3>
              <p class="text-gray-600 mb-4 relative z-10">{{ mentor.role }}</p>
              <router-link :to="`/mentors/${mentor.name}`"
                class="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 relative z-10">
                Details
              </router-link>
            </div>
          </div>

          <!-- Single Card for placeholder -->
          <div
            class="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group">
            <div class="p-6 relative">
              <div
                class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity duration-300">
              </div>
              <h3 class="text-2xl font-semibold text-center text-gray-800 mt-2 relative z-10">Thanks to these mentors for their dedication!</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Leads Section -->
      <section id="team-leads">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">Our Team Leads</h2>
        <p class="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Here are our amazing team leaders who work so hard to make this success.
        </p>
        <p class="text-center text-sm text-gray-500 mb-12 max-w-2xl mx-auto italic">
          Disclaimer: listed here are actually last year's team leads merely as a point of contact until appointments
          and/or elections take place for this year.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(member, index) in members" :key="index"
            class="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-gradient-br from-blue-400 to-purple-400">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ member.name }}</h3>
            <p class="text-gray-600">{{ member.role }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import mentorsData from "@/components/Mentor/info.json";

export default defineComponent({
  data() {
    return {
      mentors: mentorsData,
      members: [
        { name: 'Dotan Dana', role: 'Past Scouting & Strategy Lead' },
        { name: 'Alex Rabochii', role: 'Past Scouting & Strategy Lead' },
        { name: 'Shamith Murphy', role: 'Past Software Lead' },
        { name: 'Nate Brodbent', role: 'Past CAD Lead' },
        { name: 'Riley Walker', role: 'Past Fabrication Lead' },
      ],
    };
  },
});
</script>

<style scoped>
.border-gradient-br {
  border-image: linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to)) 1;
}
</style>