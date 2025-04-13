<template>
  <div>
    <ApiErrorHandler />
    <GlobalNotification />
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
import ApiErrorHandler from '@/components/global/ApiErrorHandler.vue';
import GlobalNotification from '@/components/common/GlobalNotification.vue';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
    ApiErrorHandler,
  },
  setup() {
    const route = useRoute();

    // Check if the current path is /dashboard or /Dashboard or their subpages
    const isDashboardRoute = computed(() => {
      const path = route.path.toLowerCase();
      return path.startsWith('/dashboard');
    });

    return {
      isDashboardRoute,
    };
  },
});
</script>
