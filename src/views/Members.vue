<template>
  <div>
    <main class="flex-1">
      <TeamSection />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamSection from '@/components/Member/TeamSection.vue';

export default defineComponent({
  components: {
    TeamSection,
  },
});
</script>