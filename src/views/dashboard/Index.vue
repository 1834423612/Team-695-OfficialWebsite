<template>
    <DashboardLayout>
        <!-- Add authentication manager component -->
        <AuthManager />

        <!-- Main content is handled by router-view -->
        <router-view></router-view>
    </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AuthManager from '@/components/global/AuthManager.vue';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'DashboardIndexView'
});
</script>