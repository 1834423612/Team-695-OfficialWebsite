<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100">
        <!-- Header Banner -->
        <header class="relative">
            <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg"
                alt="Team Photo" class="w-full h-[40vh] object-cover" @load="imageLoaded" />
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <h1 class="text-white text-4xl md:text-6xl font-bold tracking-wider text-center">Team Gallery</h1>
                <p class="text-gray-200 text-lg mt-4 mx-4 text-center max-w-3xl">
                    Explore our team's journey through robotics competitions and events
                </p>
            </div>
        </header>

        <!-- Category Navigation - Improved -->
        <nav ref="nav" class="bg-white shadow-md py-2 z-10 transition-all duration-300 ease-in-out" :class="{'nav-fixed': isSticky}">
            <div class="container mx-auto px-2">
                <!-- Mobile Category Dropdown -->
                <div class="md:hidden relative">
                    <button @click="toggleMobileMenu" 
                        class="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div class="flex items-center gap-2">
                            <Icon v-if="getCategoryIcon(activeCategory)" :icon="getCategoryIcon(activeCategory)" class="h-4 w-4" />
                            <span>{{ activeCategory }}</span>
                            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {{ getCategoryCount(activeCategory) }}
                            </span>
                        </div>
                        <Icon icon="mdi:chevron-down" class="h-5 w-5" :class="{ 'rotate-180': mobileMenuOpen }" />
                    </button>
                    
                    <!-- Mobile Dropdown Menu -->
                    <div v-if="mobileMenuOpen" 
                        class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                        <button v-for="category in categories" :key="category.name"
                            @click="setActiveCategoryMobile(category.name)"
                            class="w-full flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <div class="flex items-center gap-2">
                                <Icon v-if="getCategoryIcon(category.name)" :icon="getCategoryIcon(category.name)" class="h-4 w-4" />
                                <span>{{ category.name }}</span>
                            </div>
                            <span v-if="activeCategory === category.name" class="ml-auto">
                                <Icon icon="mdi:check" class="h-4 w-4 text-green-500" />
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex flex-wrap justify-between items-center">
                    <div class="flex-1 flex flex-wrap justify-center gap-1 md:gap-2">
                        <button v-for="category in categories" :key="category.name"
                            @click="setActiveCategory(category.name)" :class="[
                                'px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 text-sm md:text-base',
                                activeCategory === category.name
                                    ? `${category.color} text-white shadow-md`
                                    : `text-gray-700 bg-gray-100 ${category.hoverColor}`
                            ]">
                            <Icon v-if="getCategoryIcon(category.name)" :icon="getCategoryIcon(category.name)"
                                class="h-4 w-4" />
                            {{ category.name }}
                            <span v-if="activeCategory === category.name"
                                class="text-xs bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
                                {{ getCategoryCount(category.name) }}
                            </span>
                        </button>
                    </div>

                    <!-- View Mode Toggle Buttons -->
                    <div class="flex items-center gap-1 mt-0">
                        <button @click="viewMode = 'masonry'"
                            :class="['p-1.5 rounded-md transition-colors', viewMode === 'masonry' ? 'bg-sky-100 text-sky-700' : 'text-gray-500']">
                            <Icon icon="mdi:view-quilt" class="h-5 w-5" />
                        </button>
                        <button @click="viewMode = 'grid'"
                            :class="['p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-sky-100 text-sky-700' : 'text-gray-500']">
                            <Icon icon="mdi:view-grid" class="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <!-- Mobile View Toggle Buttons -->
                <div class="flex justify-center mt-2 md:hidden">
                    <div class="flex items-center gap-4 bg-gray-100 p-1 rounded-full">
                        <button @click="viewMode = 'masonry'"
                            :class="['p-1.5 rounded-full transition-colors flex items-center gap-1', 
                                viewMode === 'masonry' ? 'bg-white shadow text-sky-700' : 'text-gray-500']">
                            <Icon icon="mdi:view-quilt" class="h-4 w-4" />
                            <span class="text-xs">Masonry</span>
                        </button>
                        <button @click="viewMode = 'grid'"
                            :class="['p-1.5 rounded-full transition-colors flex items-center gap-1', 
                                viewMode === 'grid' ? 'bg-white shadow text-sky-700' : 'text-gray-500']">
                            <Icon icon="mdi:view-grid" class="h-4 w-4" />
                            <span class="text-xs">Grid</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content Area -->
        <main class="container mx-auto px-4 py-8">
            <div v-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-20">
                <Icon icon="mdi:image-off" class="h-16 w-16 text-gray-400" />
                <h3 class="mt-4 text-xl font-medium text-gray-700">No images found</h3>
                <p class="mt-2 text-gray-500">There are no images in this category yet.</p>
            </div>

            <div v-else>
                <!-- Masonry Layout -->
                <div v-if="viewMode === 'masonry'" class="masonry-gallery">
                    <div v-for="item in filteredItems" :key="item.id"
                        class="masonry-item mb-4 overflow-hidden rounded-lg shadow-md bg-white transition-all duration-300 hover:shadow-xl">
                        <div class="relative group">
                            <img :src="item.image" :alt="item.title" @click="openLightbox(item)"
                                @load="imageLoaded" @error="imageError(item)"
                                :class="['w-full h-auto object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105', loadedImages.has(item.id) ? 'loaded' : '']" />

                            <!-- Hover Action Buttons -->
                            <div
                                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button @click.stop="openLightbox(item)"
                                    class="p-2 bg-white rounded-full mx-1 text-gray-800 hover:text-sky-600 transition-colors">
                                    <Icon icon="mdi:magnify-plus" class="h-6 w-6" />
                                </button>
                                <button @click.stop="downloadImage(item)"
                                    class="p-2 bg-white rounded-full mx-1 text-gray-800 hover:text-emerald-600 transition-colors">
                                    <Icon icon="mdi:download" class="h-6 w-6" />
                                </button>
                            </div>

                            <!-- Category Tag -->
                            <div class="absolute top-2 left-2">
                                <span
                                    class="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-80 text-gray-800">
                                    {{ item.category }}
                                </span>
                            </div>
                        </div>

                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-800 line-clamp-1">{{ item.title }}</h3>
                            <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ item.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Grid Layout -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div v-for="item in filteredItems" :key="item.id"
                        class="overflow-hidden rounded-lg shadow-md bg-white transition-all duration-300 hover:shadow-xl">
                        <div class="relative group aspect-w-4 aspect-h-3">
                            <img :src="item.image" :alt="item.title" @click="openLightbox(item)"
                                @load="imageLoaded" @error="imageError(item)"
                                :class="['w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105', loadedImages.has(item.id) ? 'loaded' : '']" />

                            <!-- Hover Action Buttons -->
                            <div
                                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button @click.stop="openLightbox(item)"
                                    class="p-2 bg-white rounded-full mx-1 text-gray-800 hover:text-sky-600 transition-colors">
                                    <Icon icon="mdi:magnify-plus" class="h-6 w-6" />
                                </button>
                                <button @click.stop="downloadImage(item)"
                                    class="p-2 bg-white rounded-full mx-1 text-gray-800 hover:text-emerald-600 transition-colors">
                                    <Icon icon="mdi:download" class="h-6 w-6" />
                                </button>
                            </div>

                            <!-- Category Tag -->
                            <div class="absolute top-2 left-2">
                                <span
                                    class="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-80 text-gray-800">
                                    {{ item.category }}
                                </span>
                            </div>
                        </div>

                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-800 line-clamp-1">{{ item.title }}</h3>
                            <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Lightbox Modal -->
        <div v-if="lightboxOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300">
            <div class="relative max-w-6xl w-full mx-4 overflow-hidden">
                <!-- Close Button -->
                <button @click="closeLightbox"
                    class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
                    <Icon icon="mdi:close" class="h-6 w-6" />
                </button>

                <!-- Navigation Buttons -->
                <button v-if="lightboxIndex > 0" @click="prevImage"
                    class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
                    <Icon icon="mdi:chevron-left" class="h-8 w-8" />
                </button>
                <button v-if="lightboxIndex < filteredItems.length - 1" @click="nextImage"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
                    <Icon icon="mdi:chevron-right" class="h-8 w-8" />
                </button>

                <!-- Image -->
                <img :src="currentLightboxItem?.image" :alt="currentLightboxItem?.title"
                    @load="lightboxImageLoaded = true" 
                    :class="['max-h-[80vh] max-w-full mx-auto object-contain', lightboxImageLoaded ? 'loaded' : '']" />

                <!-- Loading Indicator -->
                <div v-if="!lightboxImageLoaded" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <!-- Image Info -->
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold">{{ currentLightboxItem?.title }}</h3>
                            <p class="mt-1 text-gray-300">{{ currentLightboxItem?.description }}</p>
                        </div>
                        <button @click="downloadImage(currentLightboxItem)"
                            class="p-2 bg-emerald-600 rounded-full text-white hover:bg-emerald-700 transition-colors">
                            <Icon icon="mdi:download" class="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Icon } from '@iconify/vue';

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image: string;
    category: string;
}

// 动态导入Gallery数据
const galleryData = ref<any>({ items: [] });
const loadGalleryData = async () => {
    try {
        const data = await import('@/Data/Gallery-data.json');
        galleryData.value = data.default || data;
        
        // 初始化categories和items
        if (galleryData.value.category) {
            categories.value = galleryData.value.category;
        }
        if (galleryData.value.items) {
            // 转换items格式
            const transformedItems: Record<string, GalleryItem[]> = {};
            Object.keys(galleryData.value.items).forEach(categoryKey => {
                transformedItems[categoryKey] = galleryData.value.items[categoryKey].map((item: any) => ({
                    ...item,
                    category: categoryKey
                }));
            });
            items.value = transformedItems;
        }
    } catch (error) {
        console.error('Failed to load gallery data:', error);
    }
};

interface Category {
    name: string;
    color: string;
    hoverColor: string;
}

// Data Initialization
const items = ref<Record<string, GalleryItem[]>>({});
const categories = ref<Category[]>([]);
const activeCategory = ref('All');
const viewMode = ref<'masonry' | 'grid'>('masonry');
const nav = ref<HTMLElement | null>(null);

// Lightbox State
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const currentLightboxItem = computed(() =>
    lightboxIndex.value >= 0 && lightboxIndex.value < filteredItems.value.length
        ? filteredItems.value[lightboxIndex.value]
        : null
);

// Image Load State Management
const loadedImages = ref(new Set<number>());
const loadingErrors = ref(new Set<number>());
const lightboxImageLoaded = ref(false);

// Image Load Success Handler
const imageLoaded = (event: Event) => {
    const target = event.target as HTMLImageElement;
    // Add loaded class
    if (target) {
        target.classList.add('loaded');
        
        // If the image is in the list, find its ID
        const item = filteredItems.value.find(
            item => item.image === target.src
        );
        if (item) {
            loadedImages.value.add(item.id);
        }
    }
};

// Image Load Error Handler
const imageError = (item: GalleryItem) => {
    console.error(`Failed to load image: ${item.image}`);
    loadingErrors.value.add(item.id);
    // You can set a default image or display an error message
};

// Reset Lightbox Image Load State
watch(lightboxIndex, () => {
    lightboxImageLoaded.value = false;
});

// Set Active Category
const setActiveCategory = (category: string) => {
    activeCategory.value = category;
    // Close Lightbox
    lightboxOpen.value = false;
};

// Get Category Icon
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'All': return 'mdi:view-dashboard';
        case 'Robots': return 'mdi:robot';
        case 'Team Photos': return 'mdi:account-group';
        case '2024 Season': return 'mdi:calendar';
        case '2023 Season': return 'mdi:calendar';
        case '2022 Season': return 'mdi:calendar';
        default: return '';
    }
};

// Get Category Count
const getCategoryCount = (category: string) => {
    if (category === 'All') {
        return Object.values(items.value).flat().length;
    }
    return items.value[category]?.length || 0;
};

// Filter Items
const filteredItems = computed(() =>
    activeCategory.value === 'All'
        ? Object.values(items.value).flat()
        : items.value[activeCategory.value] || []
);

// Lightbox Functionality
const openLightbox = (item: GalleryItem) => {
    const index = filteredItems.value.findIndex(i => i.id === item.id);
    if (index !== -1) {
        lightboxIndex.value = index;
        lightboxOpen.value = true;
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
    }
};

const closeLightbox = () => {
    lightboxOpen.value = false;
    // Enable background scrolling
    document.body.style.overflow = '';
};

const prevImage = () => {
    if (lightboxIndex.value > 0) {
        lightboxIndex.value--;
    }
};

const nextImage = () => {
    if (lightboxIndex.value < filteredItems.value.length - 1) {
        lightboxIndex.value++;
    }
};

// Download Image Functionality
const downloadImage = async (item: GalleryItem | null) => {
    if (!item) return;

    try {
        // Create a download status indicator
        const downloadStatus = document.createElement('div');
        downloadStatus.className = 'fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center';
        downloadStatus.innerHTML = `
            <div class="animate-spin w-4 h-4 border-2 border-slate-100 border-t-transparent rounded-full mr-2"></div>
            <span>Downloading...</span>
        `;
        document.body.appendChild(downloadStatus);

        // Create an image element to fetch the image
        const img = new Image();
        img.crossOrigin = 'anonymous';  // Try to request the image anonymously
        
        // Use random query parameters to bypass cache and reduce CORS issues
        const timestamp = new Date().getTime();
        const imgUrl = item.image.includes('?') 
            ? `${item.image}&nocache=${timestamp}` 
            : `${item.image}?nocache=${timestamp}`;
        
        img.onload = function() {
            try {
                // Create a canvas and draw the image onto it
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Unable to create canvas context');
                }
                
                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0);
                
                // Get the data URL from the canvas
                canvas.toBlob(function(blob) {
                    if (!blob) {
                        throw new Error('Unable to create Blob object');
                    }
                    
                    // Create a download link
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    
                    // Set the file name
                    const fileName = item.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'image';
                    a.download = `${fileName}.jpg`;
                    
                    // Trigger the download
                    document.body.appendChild(a);
                    a.click();
                    
                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        document.body.removeChild(downloadStatus);
                    }, 100);
                }, 'image/jpeg', 0.95); // JPEG format, 95% quality
                
            } catch (error) {
                document.body.removeChild(downloadStatus);
                fallbackDownload(item);
                console.error('Canvas image processing failed:', error);
            }
        };
        
        img.onerror = function() {
            document.body.removeChild(downloadStatus);
            fallbackDownload(item);
            console.error('Image loading failed, trying fallback method');
        };
        
        // Set the image source
        img.src = imgUrl;
        
        // If the image is already cached, onload may not trigger
        if (img.complete) {
            img.onload(new Event('load'));
        }
        
    } catch (error) {
        console.error('Download image failed:', error);
        fallbackDownload(item);
    }
};

// Fallback Download Method
const fallbackDownload = (item: GalleryItem) => {
    try {
        // Try to download using an iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const fileName = item.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'image';
        
        // Check if the browser supports the download attribute
        const isSupportDownload = 'download' in document.createElement('a');
        
        if (isSupportDownload) {
            // Modern browser method
            const a = document.createElement('a');
            a.href = item.image;
            a.download = `${fileName}.jpg`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
            }, 100);
        } else {
            // Old browser method using iframe
            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(`<a href="${item.image}" download="${fileName}.jpg"></a>`);
                doc.close();
                const anchorElem = doc.querySelector('a');
                if (anchorElem) {
                    anchorElem.click();
                }
            }
        }
        
        // Clean up the iframe
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
        
    } catch (error) {
        console.error('Fallback download method failed:', error);
        alert('Unable to download image. Please try right-clicking the image and select "Save Image As"');
    }
};

// Keyboard Navigation
const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return;

    switch (e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
};

// 移动菜单状态
const mobileMenuOpen = ref(false);

// 切换移动菜单
const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 移动端选择分类
const setActiveCategoryMobile = (category: string) => {
    setActiveCategory(category);
    mobileMenuOpen.value = false;
};

// 点击外部关闭移动菜单
const closeMenuOnOutsideClick = (event: MouseEvent) => {
    if (mobileMenuOpen.value) {
        const target = event.target as HTMLElement;
        const dropdown = document.querySelector('.md\\:hidden .relative');
        if (dropdown && !dropdown.contains(target)) {
            mobileMenuOpen.value = false;
        }
    }
};

// 滚动处理
let headerHeight = 0;
let navHeight = 0;
let mainHeaderHeight = 0;

// 更新导航栏状态
const updateNavStatus = () => {
    if (!nav.value) return;
    
    const scrollPosition = window.scrollY;
    const isMobile = window.innerWidth < 768;
    const headerElement = document.querySelector('.min-h-screen > header') as HTMLElement;
    const mainHeader = document.querySelector('header.sticky.top-0') as HTMLElement;
    
    if (headerElement && mainHeader) {
        // 计算各元素高度
        headerHeight = headerElement.offsetHeight;
        mainHeaderHeight = mainHeader.offsetHeight;
        
        if (isMobile) {
            // 移动端逻辑
            if (scrollPosition >= headerHeight - mainHeaderHeight) {
                // 导航栏应吸附在顶部导航栏下方
                nav.value.style.position = 'fixed';
                nav.value.style.top = `${mainHeaderHeight}px`;
                nav.value.style.left = '0';
                nav.value.style.right = '0';
                document.body.style.paddingTop = `${navHeight}px`;
                isSticky.value = true;
            } else {
                // 导航栏回到正常位置
                nav.value.style.position = 'static';
                document.body.style.paddingTop = '0';
                isSticky.value = false;
            }
        } else {
            // 桌面端逻辑
            if (scrollPosition >= headerHeight) {
                // 导航栏应吸附在顶部
                nav.value.style.position = 'sticky';
                nav.value.style.top = '0';
                isSticky.value = true;
            } else {
                // 导航栏回到正常位置
                nav.value.style.position = 'static';
                isSticky.value = false;
            }
        }
    }
};
// 监听事件并设置导航栏
onMounted(async () => {
    // 首先加载数据
    await loadGalleryData();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', closeMenuOnOutsideClick);
    window.addEventListener('scroll', updateNavStatus);
    window.addEventListener('resize', () => {
        // 窗口大小改变时重新计算
        if (nav.value) {
            navHeight = nav.value.offsetHeight;
        }
        updateNavStatus();
    });
    
    // 初始化导航栏高度
    setTimeout(() => {
        if (nav.value) {
            navHeight = nav.value.offsetHeight;
        }
        updateNavStatus();
        
        // 为所有已经缓存的图片添加loaded类
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    }, 100);
    
    // 检查是否为移动端视图
    const isMobileView = window.innerWidth < 768; // md breakpoint is typically 768px
    
    // 仅为移动端设置导航栏位置，电脑版使用默认的 top-0
    if (isMobileView && nav.value) {
        // 在移动端，设置nav紧贴在母header下方
        const mainHeader = document.querySelector('header.sticky.top-0');
        if (mainHeader) {
            const mainHeaderHeight = mainHeader.getBoundingClientRect().height;
            nav.value.style.top = `${mainHeaderHeight}px`;
        }
    }
    
    // 监听窗口大小变化，仅在移动端更新导航栏位置
    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile && nav.value) {
            const mainHeader = document.querySelector('header.sticky.top-0');
            if (mainHeader) {
                const mainHeaderHeight = mainHeader.getBoundingClientRect().height;
                nav.value.style.top = `${mainHeaderHeight}px`;
            }
        } else if (nav.value) {
            // 在桌面端恢复默认行为
            nav.value.style.top = '0';
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 添加一个 MutationObserver 以检测DOM变化后的主header高度变化
    const observer = new MutationObserver(() => {
        if (window.innerWidth < 768 && nav.value) {
            const mainHeader = document.querySelector('header.sticky.top-0');
            if (mainHeader) {
                const mainHeaderHeight = mainHeader.getBoundingClientRect().height;
                nav.value.style.top = `${mainHeaderHeight}px`;
            }
        }
    });
    
    const mainHeader = document.querySelector('header.sticky.top-0');
    if (mainHeader) {
        observer.observe(mainHeader, { attributes: true, childList: true, subtree: true });
    }
    
    // 在组件卸载时清理
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', closeMenuOnOutsideClick);
        window.removeEventListener('scroll', updateNavStatus);
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
    });
});

// 导航栏状态
const isSticky = ref(false);
let navOffset = ref(0); // 用于平滑动画的偏移量


// 监听事件并设置导航栏
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', closeMenuOnOutsideClick);
    window.addEventListener('scroll', updateNavStatus);
    
    // 获取关键元素高度
    setTimeout(() => {
        if (nav.value) {
            navHeight = nav.value.offsetHeight;
            updateNavStatus(); // 初始计算一次
        }
        
        // 为所有已经缓存的图片添加loaded类
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    }, 100);
    
    // 监听窗口大小变化，重新计算高度和状态
    const handleResize = () => {
        if (nav.value) {
            navHeight = nav.value.offsetHeight;
        }
        updateNavStatus();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 卸载时清理
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', closeMenuOnOutsideClick);
        window.removeEventListener('scroll', updateNavStatus);
        window.removeEventListener('resize', handleResize);
    });
});

</script>

<style scoped>
.masonry-gallery {
    column-count: 1;
    column-gap: 1rem;
}

@media (min-width: 640px) {
    .masonry-gallery {
        column-count: 2;
    }
}

@media (min-width: 768px) {
    .masonry-gallery {
        column-count: 3;
    }
}

@media (min-width: 1024px) {
    .masonry-gallery {
        column-count: 4;
    }
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
}

/* Add Image Load Animation */
img {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    min-height: 100px; /* Reserve space for unloaded images */
}

img.loaded {
    opacity: 1;
}

/* Add Responsive Aspect Ratio */
.aspect-w-4 {
    position: relative;
    padding-bottom: 75%;
    /* 4:3 Aspect Ratio */
}

.aspect-w-4>img {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    object-fit: cover;
}

/* Add Placeholder Styles */
.masonry-item, .grid-item {
    position: relative;
    background-color: #f5f5f5;
    min-height: 200px;
}

/* Nav 过渡动画 */
.rotate-180 {
    transform: rotate(180deg);
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.md\:hidden .absolute {
    animation: slideDown 0.2s ease-out;
}

/* 为导航栏添加过渡效果 */
nav {
    transition: top 0.3s ease-in-out, position 0.3s ease-in-out;
}

/* 避免内容跳动 */
body.has-sticky-nav {
    transition: padding-top 0.3s ease;
}

/* 导航栏样式增强 */
.nav-fixed {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 10;
    transform: translateY(v-bind('navOffset + "px"'));
    transition: transform 0.3s ease;
}

@media (min-width: 768px) {
    .nav-fixed {
        position: sticky;
        top: 0;
        transform: none;
    }
}

/* 确保内容不会因导航栏固定而跳动 */
body.has-padding-top {
    transition: padding-top 0.3s ease;
}

</style>