<template>
  <div>
    <!-- Show Header when not on /dashboard or its subpages -->
    <Header v-if="!isDashboardRoute" />
    <router-view></router-view>
    <!-- Show Footer when not on /dashboard or its subpages -->
    <Footer v-if="!isDashboardRoute" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
  },
  setup() {
    const route = useRoute();

    // Check if the current path is /dashboard or its subpages
    const isDashboardRoute = computed(() => {
      return route.path.startsWith('/dashboard');
    });

    return {
      isDashboardRoute,
    };
  },
});
</script>
