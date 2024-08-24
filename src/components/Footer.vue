<template>
  <footer class="bg-primary text-primary-foreground py-6 px-6 mt-auto">
    <div class="container mx-auto max-w-6xl flex items-center justify-between">
      <p class="text-sm">&copy; 2024 Bison Robotics. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <router-link to="/" class="hover:underline">Home</router-link>
        <!--<router-link to="/" class="hover:underline">Text 2</router-link>-->
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
