<template>
  <header class="bg-primary text-primary-foreground py-4 px-4 sm:px-8 flex items-center sticky top-0 z-20">
    <div class="container mx-auto flex items-center justify-between">
      <div class="gap-1 space-x-2">
        <router-link to="/" class="hover:no-underline flex flex-row items-center">
          <img src="@/assets/images/bison-robotics.png" alt="695 Logo"
            class="w-7 h-7 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-full" />
          <h1 class="ml-2 md:ml-3 leading-4 text-size-5 sm:text-xl md:text-2xl font-bold">695 Bison Robotics</h1>
        </router-link>
      </div>

      <!-- Mobile Dropdown Menu v-if="!isDesktop" -->
      <DropdownMenu buttonText="Menu" :menuItems="menuItems" />

      <!-- Desktop Menu v-if="isDesktop" -->
      <DesktopMenu class="hidden md:flex items-center gap-4 transition-max-height duration-300 ease-in-out"
        :menuItems="menuItems" />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { MenuItem } from '@/types';
// import DropdownMenu from '../components/Header/MobileDropdownMenu.vue';
// import DesktopMenu from '../components/Header/DesktopMenu.vue';

const menuItems: Array<MenuItem> = [
  { name: 'Home', link: '/' },
  { name: 'About', link: '/about' },
  { name: 'Gallery', link: '/gallery' },
  { name: 'Resources', link: '/resources' },
  { name: 'Contact', link: '/contact' },
];

export default defineComponent({
  name: 'Header',
  data() {
    return {
      menuItems, // Use the imported menuItems constant
      isDesktop: false,
    };
  },
});
</script>
