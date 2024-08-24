<template>
  <div>
    <header class="relative">

      <!-- About Team Banner -->
      <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg" alt="About Team" class="w-full h-[33vh] object-cover" />
      <div class="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
        <h1 class="text-white text-4xl md:text-5xl font-bold">About Team 695</h1>
        <p class="text-gray-200 text-lg mt-2 mx-2 text-center">Learn more about our dedicated team members and their
          contributions.</p>
      </div>
    </header>

    <!-- Content section -->
    <div class="mx-auto mt-12 max-w-7xl px-12">
      <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our mission</h2>
        <div class="mt-6 flex flex-col gap-x-8 gap-y-10 lg:gap-y-20 lg:flex-row">
          <div class="lg:w-full lg:max-w-2xl lg:flex-auto">
            <p class="text-xl leading-8 text-gray-600">Some words.......................</p>
            <div class="mt-10 max-w-xl text-base leading-7 text-gray-700">
              <p>
                We are a FIRST Robotics Competition team dedicated to inspiring the
                next generation of engineers and innovators.
                Through our participation in the annual FIRST Robotics Competition,
                we strive to develop cutting-edge robots, foster teamwork and leadership,
                and make a positive impact on our community.
              </p>
              <p class="mt-10">
                Our team is committed to continuous learning and innovation.
                By engaging in hands-on projects and collaborating with industry professionals,
                we gain invaluable experience in engineering, programming, and project management.
                We also prioritize outreach and education, hosting workshops and events to share
                our passion for robotics with the wider community.
                Join us on our journey as we push the boundaries of technology and inspire the engineers of tomorrow.
              </p>
            </div>
          </div>
          <div class="flex flex-col items-center lg:flex-auto lg:justify-center">
            <dl class="w-64 space-y-3 sm:space-y-4 lg:space-y-5 xl:w-80">
              <div v-for="stat in stats" :key="stat.label" class="flex flex-col-reverse gap-y-1 items-center">
                <dt class="text-base leading-7 text-gray-600">{{ stat.label }}</dt>
                <dd class="text-5xl font-semibold tracking-tight text-gray-900">{{ stat.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sponsors Logo cloud -->
    <section class="bg-white py-6 mt-16">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 class="text-center text-3xl font-semibold leading-8 text-gray-900">Our Sponsors</h2>
        <div
          class="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-2 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <img class="col-span-2 max-h-24 w-full object-contain lg:col-span-1"
            src="https://r2.fastbirdcdn.online/Robotics/Logo/66aed981e62c2-20240804_Beachwood-Schools-LOGO.png"
            alt="Beachwood Schools District" />
          <img class="col-span-2 max-h-24 w-full object-contain lg:col-span-1"
            src="https://r2.fastbirdcdn.online/Robotics/Logo/66aed9821d766-20240804_Beachwood-City-Schools-LOGO.png"
            alt="Beachwood City Schools" />
        </div>
      </div>
    </section>

    <!-- Values section -->
    <div class="mx-auto mt-12 max-w-7xl px-12">
      <div class="mx-auto max-w-2xl lg:mx-0">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our values</h2>
        <!--<p class="mt-6 text-lg leading-8 text-gray-600">Value description here.</p>-->
      </div>
      <dl
        class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        <div v-for="value in values" :key="value.name">
          <dt class="font-semibold text-gray-900">{{ value.name }}</dt>
          <dd class="mt-1 text-gray-600">{{ value.description }}</dd>
        </div>
      </dl>
    </div>

    <!-- Achievements Banner Area (Blue Flag) -->
    <section class="pt-12 px-2 flex justify-between">
      <div class="container mx-auto">
        <h2 class="text-3xl font-medium text-center mb-6">Achievements</h2>
        <div class="grid grid-cols-2 300small:grid-cols-1 300small:items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 mb-3 ml-3">
          <WinnerBanner v-for="(item, index) in WinnerBannerItems" :key="index" :title="item.title"
            :description="item.description" />
        </div>
      </div>
    </section>

    <!-- Mentors Section -->
    <section id="mentors" class="py-8 px-8 bg-green-100">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-3xl text-center font-medium mb-5">Our Mentors</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MentorCard v-for="(mentor, index) in mentors" :key="index" :src="mentor.avatar" :alt="mentor.name"
            :name="mentor.name" :role="mentor.role" :detailsLink="`/mentors/${mentor.name.replace(/ /g, '-')}`"
            :email="mentor.email" />
        </div>
      </div>
    </section>

    <!-- Gallery Area -->
    <section class="py-8 px-3">
      <div class="container mx-auto px-5">
        <h2 class="text-3xl font-medium text-center mb-5">Gallery</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <GalleryCard v-for="(item, index) in galleryItems" :key="index" :image="item.image" :title="item.title"
            :description="item.description" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WinnerBanner from '@/components/Cards/WinnerBanner.vue';
import mentorsData from '@/components/Mentor/info.json';
import MentorCard from '@/components/Cards/MentorCard.vue';
import GalleryCard from '@/components/Cards/GalleryCard.vue';

export default defineComponent({
  name: 'About',
  components: {
    WinnerBanner,
    MentorCard,
    GalleryCard,
  },
  data() {
    return {
      WinnerBannerItems: [
        { title: 'Woodie Flowers Finalist Award', description: '2014 MIDWEST REGIONAL' },
        { title: 'Winner', description: '2022 GREATER PITTSBURGH  REGIONAL' },
        { title: 'Winner', description: '2023 MIAMI VALLEY REGIONAL' },
        { title: 'Woodie Flowers Finalist Award', description: '2023 BUCKEYE REGIONAL' },
        { title: 'Winner', description: '2023 BUCKEYE REGIONAL' },
      ],
      mentors: mentorsData,
      galleryItems: [
        { title: 'Pittsburgh Regional', description: 'Pittsburgh Regional 2024', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg' },
        { title: 'Gold Module', description: 'Gold Module scores a cube', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2313c6e20-20240802_Screenshot%202024-08-01%20200551.png' },
        { title: 'Gold Module', description: 'Gold Module on practice field', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2313c81d8-20240802_Screenshot%202024-08-01%20200559.png' },
        { title: 'Gold Module', description: 'Gold Module showing off an illegal bumper font', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png' },
      ],
      values: [
        {
          name: 'Gracious Professionalism',
          description:
            'Treat everyone with respect and kindness, valuing both competition and cooperation. Strive to make a positive impact while maintaining integrity and humility.',
        },
        {
          name: 'Teamwork',
          description:
          'Collaborate effectively with others to achieve common goals and create a supportive and inclusive environment.'        },
        {
          name: 'Always learning',
          description:
            'Embrace continuous learning and growth.',
        },
        {
          name: 'Be supportive',
          description:
            'Encourage and uplift your teammates.',
        },
        {
          name: 'Take responsibility',
          description:
            'Own your actions and their outcomes.',
        },
        {
          name: 'Enjoy downtime',
          description:
            'Balance hard work with relaxation and fun.',
        },
      ],
      stats: [
        { label: 'Team members', value: '~20' },
        { label: 'Weekly Open Hours During Season', value: '~30 Hrs' },
      ],
    };
  },
});
</script>

<style scoped>
/* Some Style Might need (?) */
</style>