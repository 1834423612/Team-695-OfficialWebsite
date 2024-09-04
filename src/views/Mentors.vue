<template>
  <div>
    <main class="flex-1">
      <section id="mentors" class="py-16 px-6 bg-purple-100">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-3xl font-bold mb-8 text-center">Our Mentors</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MentorCard
              v-for="(mentor, index) in mentors"
              :key="index"
              :src="mentor.avatar"
              :alt="mentor.name"
              :name="mentor.name"
              :role="mentor.role"
              :detailsLink="`/mentors/${mentor.name}`"
              :email="mentor.email"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MentorCard from "@/components/Cards/MentorCard.vue";
import mentorsData from "@/components/Mentor/info.json";

export default defineComponent({
  components: {
    MentorCard,
  },
  data() {
    return {
      mentors: mentorsData,
    };
  },
});
</script>
