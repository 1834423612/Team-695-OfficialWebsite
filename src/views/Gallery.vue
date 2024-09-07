<template>
    <MasonryGallery />
    <!-- Gallery Area -->
    <section class="py-8 px-3">
        <div class="container mx-auto px-5">
            <h2 class="text-3xl font-medium text-center mb-5">Gallery</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <GalleryCard v-for="(item, index) in galleryItems" :key="index" :image="item.image" :title="item.title"
                    :description="item.description" />
            </div>
        </div>
    </section>
</template>

<script>
import MasonryGallery from '@/components/Gallery/MasonryGallery.vue';
import GalleryCard from '@/components/Cards/GalleryCard.vue';

export default {
    name: 'MasonryGallery',
    components: {
        MasonryGallery,
        GalleryCard,
    },
    data() {
        return {
            galleryItems: [
                { title: 'Pittsburgh Regional', description: 'Pittsburgh Regional 2024', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg' },
                { title: 'Gold Module', description: 'Gold Module scores a cube', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2313c6e20-20240802_Screenshot%202024-08-01%20200551.png' },
                { title: 'Gold Module', description: 'Gold Module on practice field', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2313c81d8-20240802_Screenshot%202024-08-01%20200559.png' },
                { title: 'Gold Module', description: 'Gold Module showing off an illegal bumper font', image: 'https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png' },
            ],
        }
    }
};
</script>
