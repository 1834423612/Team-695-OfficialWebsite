<template>
    <div class="bg-sky-100">
        <main class="flex-1">
            <section id="resource" class="py-16 px-6">
                <div class="container mx-auto">
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold mb-1">Resources</h2>
                        <span class="text-gray-500 mb-1">Feel free to request and add more</span>
                    </div>
                    <div class="space-y-12 shadow-md rounded-md border-4 border-violet-400">
                        <div class="container mx-auto bg-violet-100 p-6 rounded-md">
                            <!-- Iterate over each category -->
                            <div v-for="(category, type) in categories" :key="type">
                                <div class="mb-6">
                                    <h3 class="text-2xl font-semibold mb-1">{{ category.title }}</h3>
                                    <span class="text-gray-500 mb-1">Feel free to request and add more</span>
                                </div>
                                <!-- <h3
                                    class="inline-block relative text-gray-800 font-bold text-xl bg-[#5d8dcf99] px-3 py-1 rounded-md shadow-md">
                                    This is a title
                                </h3>
                                <h3 class="marker-title">This is a title</h3> -->
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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
                                            <span
                                                :class="[getIconBackground(type), getIconForeground(type), getIconHover(type)]"
                                                class="inline-flex rounded-lg p-2">
                                                <Icon :icon="getIcon(type)" class="h-6 w-6" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <div class="mt-6">
                                            <h4 class="text-base font-semibold leading-6 text-gray-900">
                                                <!-- Previous code: <a :href="action.link" class="focus:outline-none"> -->
                                                <a :href="action.link" target="_blank" rel="noopener noreferrer"
                                                    class="focus:outline-none">
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
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

// Setup categories and items
const categories = ref([]);
const items = ref([]);

// 动态加载资源列表
const loadResourceList = async () => {
    try {
        const ResourceList = await import('../Data/ResourceList.json');
        const data = ResourceList.default || ResourceList;
        categories.value = data.categories;
        items.value = data.items;
    } catch (error) {
        console.error('Failed to load resource list:', error);
    }
};

// Filter items based on type
const filteredItems = (type) => {
    return items.value.filter(item => item.type === type);
};

// 组件挂载时加载数据
onMounted(async () => {
    await loadResourceList();
});

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

<style scoped>
/* .marker-title {
    background: linear-gradient(135deg, rgba(255, 245, 110, 0.6), rgba(255, 153, 85, 0.6));
    padding: 0.3rem 0.6rem;
    border-radius: 0.25rem;
    display: inline-block;
    position: relative;
    font-weight: bold;
    color: #333;
}

.marker-title::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 253, 150, 0.2);
    filter: blur(5px);
    z-index: -1;
    border-radius: 0.25rem;
} */
</style>
