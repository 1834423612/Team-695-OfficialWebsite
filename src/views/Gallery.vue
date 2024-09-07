<template>
    <div class="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200">
        <header class="relative">
            <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg"
                alt="Team Photo" class="w-full h-[40vh] object-cover" />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                <h1 class="text-white text-4xl md:text-6xl font-bold tracking-wider text-center">695 Bison Robotics</h1>
                <p class="text-gray-200 text-xl mt-4 mx-4 text-center max-w-3xl">
                    Explore our journey through robotics competitions and achievements.
                </p>
            </div>
        </header>

        <nav ref="nav" class="bg-white shadow-md py-4 sticky top-0 z-10 transition-max-height duration-300 ease-in-out">
            <div class="container mx-auto px-4">
                <ul class="flex justify-center space-x-4">
                    <li v-for="category in categories" :key="category">
                        <button @click="setActiveCategory(category)" :class="['px-4 py-2 rounded-full transition-colors duration-200',
                            activeCategory === category
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-700 hover:bg-indigo-100']">
                            {{ category }}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>

        <main class="container mx-auto px-4 py-8">
            <MasonryGallery :items="filteredItems" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import MasonryGallery from '@/components/Gallery/MasonryGallery.vue';
import galleryData from '@/Data/Gallery-data.json';

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image: string;
    category: string;
}

interface GalleryData {
    [key: string]: Omit<GalleryItem, 'category'>[];
}

const items = ref<Record<string, GalleryItem[]>>({});

// Group items by category
const data: GalleryData = galleryData;
for (const category in data) {
    items.value[category] = data[category].map((item: Omit<GalleryItem, 'category'>) => ({
        ...item,
        category
    }));
}

const categories = computed(() => ['All', ...Object.keys(items.value)]);
const activeCategory = ref('All');

const setActiveCategory = (category: string) => {
    activeCategory.value = category;
};

const filteredItems = computed(() =>
    activeCategory.value === 'All'
        ? Object.values(items.value).flat()
        : items.value[activeCategory.value] || []
);

// Dynamically set the top property of nav to ensure that nav is not covered by the header
const nav = ref<HTMLElement | null>(null);

onMounted(() => {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    if (nav.value) {
        nav.value.style.top = `${headerHeight}px`;
    }
});
</script>
