<template>
    <div>
        <nav class="hidden md:flex items-center gap-6">
            <router-link 
                v-for="(item, index) in menuItems" 
                :key="index"
                :to="item.link" 
                class="hover:underline"
            >
                {{ item.name }}
            </router-link>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';

// Define the MenuItem interface
interface MenuItem {
    name: string;
    link: string;
}

export default defineComponent({
    name: 'DesktopMenu',
    components: {
        RouterLink,
    },
    props: {
        menuItems: {
            type: Array as () => MenuItem[], // Use type assertion to define the type of the menuItems prop
            required: true,
        },
    },
});
</script>