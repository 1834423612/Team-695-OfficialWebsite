<template>
    <div class="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
            <h1 class="text-5xl max-[425px]:text-4xl max-[320px]:text-2xl font-extrabold text-center mb-16 text-emerald-800 tracking-tight">
                Our Achievements
            </h1>

            <div class="relative">
                <!-- Decorative elements -->
                <div
                    class="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob">
                </div>
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000">
                </div>
                <div
                    class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000">
                </div>

                <!-- Achievement grid -->
                <div class="relative flex flex-wrap justify-center gap-4 z-10">
                    <WinnerBanner v-for="(item, index) in WinnerBannerItems" :key="index" :title="item.title"
                        :description="item.description"
                        class="transform transition-all duration-300 hover:scale-105 hover:shadow-lg" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WinnerBanner from '@/components/Cards/WinnerBanner.vue';

export default defineComponent({
    name: 'Achievements',
    components: {
        WinnerBanner,
    },
    data() {
        return {
            WinnerBannerItems: [
                { title: 'Woodie Flowers Finalist Award', description: '2023 Buckeye Regional' },
                { title: 'Winner', description: '2023 Buckeye Regional' },
                { title: 'Winner', description: '2023 Miami Valley Regional' },
                { title: 'Winner', description: '2023 South Florida Regional' },
                { title: 'Winner', description: '2022 Greater Pittsburgh Regional' },
                { title: 'Woodie Flowers Finalist Award', description: '2014 Midwest Regional' },
            ],
        };
    },
});
</script>

<style>
@keyframes blob {
    0% {
        transform: translate(0px, 0px) scale(1);
    }

    33% {
        transform: translate(30px, -50px) scale(1.1);
    }

    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }

    100% {
        transform: translate(0px, 0px) scale(1);
    }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}
</style>