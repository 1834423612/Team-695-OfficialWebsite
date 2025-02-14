<template>
    <div class="min-h-screen bg-linear-to-br from-sky-100 to-indigo-200">
        <header class="relative">
            <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg"
                alt="Team Photo" class="w-full h-[40vh] object-cover" />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                <h1 class="text-white text-4xl md:text-6xl font-bold tracking-wider text-center">Team Gallery</h1>
                <!--<p class="text-gray-200 text-xl mt-4 mx-4 text-center max-w-3xl">
                    TestTestTestTestTestTestTestTest
                </p>-->
            </div>
        </header>

        <nav ref="nav" class="bg-white shadow-md py-4 sticky top-0 z-10 transition-max-height duration-300 ease-in-out">
            <div class="container mx-auto px-4">
                <ul class="flex flex-wrap justify-center space-x-4">
                    <li v-for="category in categories" :key="category.name">
                        <button @click="setActiveCategory(category.name)" :class="['px-4 py-2 rounded-full transition-colors duration-200',
                            activeCategory === category.name
                                ? `${category.color} text-white`
                                : `text-gray-700 ${category.hoverColor}`]">
                            {{ category.name }}
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

interface Category {
    name: string;
    color: string;
    hoverColor: string;
}

interface GalleryData {
    category: Category[];
    items: Record<string, Omit<GalleryItem, 'category'>[]>;
}

const items = ref<Record<string, GalleryItem[]>>({});
const categories = ref<Category[]>([]);

// Load data from JSON
const data: GalleryData = galleryData;
categories.value = data.category;

// Add category to each item
for (const category in data.items) {
    items.value[category] = data.items[category].map(item => ({
        ...item,
        category
    }));
}

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
