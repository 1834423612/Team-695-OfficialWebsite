<template>
    <div class="masonry-container">
        <div class="masonry-columns" :style="{ columnCount: columnCount }">
            <div v-for="item in items" :key="item.id" class="masonry-item mb-4 break-inside-avoid">
                <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg group">
                    <div class="relative overflow-hidden">
                        <img :src="item.image" :alt="item.title"
                            class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy" @click="emit('view-image', item)" />
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div class="p-4 w-full">
                                <div class="flex justify-between items-center">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                                        {{ item.category }}
                                    </span>
                                    <button @click.stop="downloadImage(item.image, item.title)"
                                        class="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                                        title="Download image">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-medium text-slate-800 line-clamp-1">{{ item.title }}</h3>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ item.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image: string;
    category: string;
    year?: string;
    season?: string;
}

defineProps<{
    items: GalleryItem[];
}>();

const emit = defineEmits<{
    (e: 'view-image', item: GalleryItem): void;
}>();

// Responsive column count
const windowWidth = ref(window.innerWidth);
const columnCount = computed(() => {
    if (windowWidth.value < 640) return 1; // Mobile
    if (windowWidth.value < 1024) return 2; // Tablet
    if (windowWidth.value < 1280) return 3; // Small desktop
    return 4; // Large desktop
});

// Handle window resize
const handleResize = () => {
    windowWidth.value = window.innerWidth;
};

// Download image
const downloadImage = async (imageUrl: string, title: string) => {
    try {
        // 创建新的a标签，直接使用href属性指向图片URL
        const a = document.createElement('a');
        a.href = imageUrl;
        
        // 设置下载属性和文件名
        const filename = title
            ? `${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.jpg`
            : 'team695_image.jpg';
        
        a.download = filename;
        a.target = '_blank'; // 为了兼容性，添加target属性
        a.rel = 'noopener noreferrer'; // 安全考虑
        
        // 模拟点击下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    } catch (error) {
        console.error('Error initiating download:', error);
        alert('Failed to download image. Please try again later.');
    }
};

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.masonry-container {
    width: 100%;
}

.masonry-columns {
    column-gap: 1.5rem;
}

.masonry-item {
    display: inline-block;
    width: 100%;
}

/* Ensure images don't cause layout shifts */
img {
    transition: opacity 0.3s ease;
}

img[loading] {
    opacity: 0;
}

img.loaded {
    opacity: 1;
}
</style>