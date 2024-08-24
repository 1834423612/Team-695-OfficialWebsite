<template>
    <div class="rounded overflow-hidden shadow-lg">
        <img class="w-full" :src="image" alt="Gallery Image" />
        <div class="p-4">
            <h3 class="font-bold text-lg">{{ title }}</h3>
            <p class="text-gray-700">{{ description }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'GalleryCard',
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
    },
});
</script>