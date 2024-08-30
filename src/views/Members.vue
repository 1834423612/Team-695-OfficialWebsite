<template>
  <div>
    <main class="flex-1">
      <Mentors />
      <TeamSection />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamSection from '@/components/Member/TeamSection.vue';
import Mentors from './Mentors.vue';

export default defineComponent({
  components: {
    TeamSection,
    Mentors,
  },
});
</script>