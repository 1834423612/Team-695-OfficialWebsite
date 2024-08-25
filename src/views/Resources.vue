<template>
    <div>
        <main class="flex-1">
            <section id="news" class="py-16 px-6">
                <div class="container mx-auto max-w-6xl">
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold mb-1">Resources</h2>
                        <span class="text-gray-500 mb-1">Feel free to request and add more, or visit the Documentation Website</span>
                    </div>
                    <div class="space-y-12">
                        <!-- Iterate over each category -->
                        <div v-for="(category, type) in categories" :key="type">
                            <h3 class="text-2xl font-semibold mb-4">{{ category.title }}</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <!-- Resources Card Container -->
                                <div v-for="(action, actionIdx) in filteredItems(type)" :key="action.title" :class="[
                                    actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                                    actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                                    actionIdx === filteredItems(type).length - 2 ? 'sm:rounded-bl-lg' : '',
                                    actionIdx === filteredItems(type).length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                                    'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500',
                                    'shadow-lg transition-transform transform hover:scale-105'
                                ]">
                                    <div>
                                        <span :class="[getIconBackground(type), getIconForeground(type), getIconHover(type)]" class="inline-flex rounded-lg p-2" >
                                            <Icon :icon="getIcon(type)" class="h-6 w-6" aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div class="mt-6">
                                        <h4 class="text-base font-semibold leading-6 text-gray-900">
                                            <!-- Previous code: <a :href="action.link" class="focus:outline-none"> -->
                                            <a :href="action.link" target="_blank" rel="noopener noreferrer" class="focus:outline-none">
                                                <span class="absolute inset-0" aria-hidden="true" />
                                                {{ action.title }}
                                            </a>
                                        </h4>
                                        <p class="mt-2 text-sm text-gray-500">
                                            {{ action.description ?? 'Click to visit this resource.' }}
                                        </p>
                                        <span
                                            class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                                            aria-hidden="true">
                                            <Icon icon="ph:arrow-up-right-bold" class="h-6 w-6" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ResourceList from '../Data/ResourceList.json';
import { Icon } from '@iconify/vue';

// Setup categories and items
const categories = ref(ResourceList.categories);
const items = ref(ResourceList.items);

// Filter items based on type
const filteredItems = (type) => {
    return items.value.filter(item => item.type === type);
};

// Map icon names to Iconify icons
const getIcon = (type) => {
    const iconName = categories.value[type]?.icon || "carbon:book"; // Default icon
    return iconName; // Return the icon name for Iconify
};

// Get foreground color class
const getIconForeground = (type) => {
    const iconForeground = categories.value[type]?.iconForeground || 'text-purple-700';
    // console.log('Foreground class for', type, ':', className);
    return iconForeground;
};

// Get background color class
const getIconBackground = (type) => {
    const iconBackground = categories.value[type]?.iconBackground || 'bg-purple-100';
    // console.log('Background class for', type, ':', className);
    return iconBackground;
};

// Get the hover color of the icon
const getIconHover = (type) => {
    const iconHover = categories.value[type]?.iconHover ? `hover:${categories.value[type].iconHover}` : 'hover:bg-purple-400';
    // console.log('Hover class for', type, ':', iconHover);
    return iconHover;
};
</script>