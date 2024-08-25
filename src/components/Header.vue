<template>
  <header class="bg-primary text-primary-foreground py-4 px-4 sm:px-8 flex items-center">
    <div class="container mx-auto flex items-center justify-between">
      <div class="gap-1 space-x-2">
        <router-link to="/" class="hover:no-underline flex flex-row items-center">
          <!-- 
            - `w-10 h-10` sets the width and height of the logo to 40px by default (e.g., tablets and desktops) (Tailwind's `w-10` and `h-10` correspond to 2.5rem, which is 40px).
            - `sm:w-8 sm:h-8` sets the width and height of the logo to 32px on small screens (phones) (`w-8` and `h-8` correspond to 2rem, which is 32px)
          -->
          <img src="@/assets/images/bison-robotics.png" alt="695 Logo"
            class="w-7 h-7 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-full" />
          <h1 class="ml-2 md:ml-3 leading-4 text-size-5 sm:text-xl md:text-2xl font-bold">695 Bison Robotics</h1>
        </router-link>
      </div>

      <!-- Mobile Dropdown Menu v-if="!isDesktop" -->
      <DropdownMenu buttonText="Menu" :menuItems="menuItems" />

      <!-- Desktop Menu v-if="isDesktop" -->
      <DesktopMenu class="hidden md:flex items-center gap-4" :menuItems="menuItems" />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '../components/Header/MobileDropdownMenu.vue';
import DesktopMenu from '../components/Header/DesktopMenu.vue';

interface MenuItem {
  name: string;
  link: string;
}

export default defineComponent({
  name: 'Header',
  components: {
    DropdownMenu,
    DesktopMenu,
  },
  data() {
    return {
      menuItems: [
        { name: 'Home', link: '/' },
        { name: 'About', link: '/about' },
        { name: 'Members', link: '/members' },
        { name: 'Robots', link: '/robots' },
        { name: 'Resources', link: '/resources' },
        { name: 'Feedback', link: '/feedback' },
      ] as MenuItem[], // Cast to MenuItem array
      isDesktop: false,
    };
  },

  // methods: {
  //   checkIfDesktop() {
  //     this.isDesktop = window.innerWidth >= 768; // Depend on screen size
  //     console.log('Desktop Menu is Visible', this.isDesktop)
  //   },
  // },
  // mounted() {
  //   this.checkIfDesktop();
  //   window.addEventListener('resize', this.checkIfDesktop); // Add listener for window resize
  // },
  // beforeDestroy() {
  //   window.removeEventListener('resize', this.checkIfDesktop); // Remove listener when component is destroyed
  // },
});
</script>

<style scoped>
/* Add smooth transition */
nav {
  transition: max-height 0.3s ease-in-out;
}
</style>