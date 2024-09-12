<template>
    <masonry-wall :items="items" :ssr-columns="3" :column-width="300" :gap="24" :rtl="false">
        <template #default="{ item }">
            <div
                class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <img :src="item.image" :alt="item.title" class="w-full h-auto object-cover">
                <div class="p-4">
                    <h2 class="text-xl font-semibold text-indigo-700 mb-2">{{ item.title }}</h2>
                    <p class="text-gray-600 text-sm">{{ item.description }}</p>
                    <span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mt-2">
                        {{ item.category }}
                    </span>
                </div>
            </div>
        </template>
    </masonry-wall>
</template>

<script setup lang="ts">
import MasonryWall from '@yeger/vue-masonry-wall';

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image: string;
    category: string;
}

defineProps<{
    items: GalleryItem[]
}>();
</script>
