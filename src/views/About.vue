<template>
  <div class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Mission Section -->
      <section class="mb-24">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">Our Mission</h2>
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row gap-12">
          <div class="flex items-center md:w-2/3">
            <p class="text-gray-700 mb-6 leading-relaxed indent-8">
              At Team 695 Bison Robotics, our mission is to cultivate a dynamic, technically challenging environment
              where students can develop essential life skills while working on real-world engineering challenges. We
              strive to not only build high-performing robots but also foster an inclusive and supportive community
              where every member can grow, learn, and contribute. Through commitment and teamwork, we aim to inspire the
              next generation of leaders in STEM.
            </p>
          </div>
          <div class="md:w-1/3 flex flex-col justify-center">
            <div v-for="stat in stats" :key="stat.label"
              class="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-6 transform transition-all duration-300 hover:scale-105">
              <dt class="text-lg font-medium text-gray-600 mb-2">{{ stat.label }}</dt>
              <dd class="text-4xl font-bold text-gray-800">{{ stat.value }}</dd>
            </div>
          </div>
        </div>
      </section>

      <!-- Sponsors Section -->
      <section class="mb-24">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">Our Sponsors</h2>
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div v-for="sponsor in sponsors" :key="sponsor.name"
              class="flex justify-center items-center p-6 bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md">
              <img :src="sponsor.logo" :alt="sponsor.name" class="max-h-24 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section>
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">Our Values</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="value in values" :key="value.name"
            class="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ value.name }}</h3>
            <p class="text-gray-600">{{ value.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'About',
  data() {
    return {
      stats: [
        { label: 'Team members', value: '~40' },
        { label: 'Weekly Open Hours During Season', value: '~30 Hrs' },
      ],
      sponsors: [
        {
          name: 'Beachwood Schools District',
          logo: 'https://r2.fastbirdcdn.online/Robotics/Logo/66aed981e62c2-20240804_Beachwood-Schools-LOGO.png'
        },
        {
          name: 'Beachwood City Schools',
          logo: 'https://r2.fastbirdcdn.online/Robotics/Logo/66aed9821d766-20240804_Beachwood-City-Schools-LOGO.png'
        },
      ],
      values: [
        {
          name: 'Innovation',
          description: 'Approach every challenge with creativity and persistence, always seeking new ways to solve problems.',
        },
        {
          name: 'Teamwork',
          description: 'Success is a collective effort. We believe in the strength of collaboration and working together to achieve our goals.',
        },
        {
          name: 'Growth',
          description: 'Embrace every experience as an opportunity to learn and develop new skills, from engineering to leadership.',
        },
        {
          name: 'Gracious Professionalism',
          description: 'Compete fiercely while maintaining kindness, respect, and empathy toward others, fostering a positive and ethical environment.',
        },
        {
          name: 'Community Engagement',
          description: 'Commit to making a positive impact on the Beachwood community and beyond, through outreach and mentorship.',
        },
      ],
    };
  },
});
</script>