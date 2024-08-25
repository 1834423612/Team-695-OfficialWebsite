<template>
  <div>
    <main class="flex-1">
      <section id="mentors" class="py-16 px-6 bg-green-100">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-3xl font-bold mb-8">Our Mentors</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MentorCard
              v-for="(mentor, index) in mentors"
              :key="index"
              :src="mentor.image"
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

export default defineComponent({
  components: {
    MentorCard,
  },
  data() {
    return {
      mentors: [
        { email: "coach@frc695.com", name: 'John Keyerleber', role: 'Head Coach', image: 'https://image.cleveland.com/home/cleve-media/pgmain/img/plain-dealer/photo/2015/08/11/-84c81f495ef4b095.jpeg' },
        { email: "cjdickey36@gmail.com", name: 'Christopher Dickey', role: 'head of fabrication', image: 'https://lh3.googleusercontent.com/a-/ALV-UjW2_5xxYI9ZZQP55aVd-09BqZI4p9vutKFV0FCUOrgKjxWSrEi7=s2048-p' },
        { email: "matt@keyerleber.com", name: 'Matt Keyerleber', role: 'head of CAD', image: 'https://www.cleveland.com/resizer/45r4t_WZdcdKASkhPZ8u8HcgiCs=/1280x0/smart/cloudfront-us-east-1.images.arcpublishing.com/advancelocal/TWI7QADMBRC5JLLHPHLYQ2R72E.png' },
        { email: "sxs183@gmail.com", name: 'Sameer Shah', role: 'head of scouting and strategy', image: 'https://cf-images.us-east-1.prod.boltdns.net/v1/static/3798483592001/f5ec30db-b867-4a55-bf66-7b0d57637d19/3759745a-b3e9-4926-8b65-8d1469975099/1280x720/match/image.jpg' },
        { email: "unknown", name: 'Destin Tynan "Kyle"', role: 'test mentor', image: 'https://placehold.co/100x100/ff0000/ffffff/' },
      ],
    };
  },
});
</script>
