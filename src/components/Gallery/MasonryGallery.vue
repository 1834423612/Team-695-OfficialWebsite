<template>
    <div class="min-h-screen bg-gradient-to-br from-teal-100 to-blue-200 p-4 sm:p-6 md:p-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-center text-teal-800 mb-6 sm:mb-8">Gallery</h1>
        <masonry-wall 
            :items="items" 
            :ssr-columns="4" 
            :column-width="200" 
            :gap="32"
            :cols="5"
        >
            <template #default="{ item }">
                <div
                    class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                    <img :src="item.image" :alt="item.title" class="w-full h-auto object-cover">
                    <div class="p-4">
                        <h2 class="text-xl font-semibold text-teal-700 mb-2">{{ item.title }}</h2>
                        <p class="text-gray-600">{{ item.description }}</p>
                    </div>
                </div>
            </template>
        </masonry-wall>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MasonryWall from '@yeger/vue-masonry-wall';
import galleryData from '@/Data/Gallery-data.json';

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image: string;
}

const items = ref<GalleryItem[]>([]);

// Fetch data from local JSON file
const fetchData = async () => {
    try {
        items.value = galleryData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(() => {
    fetchData();
});

</script>

<style scoped>
/* Optional: Additional styling can be added here */
</style>