<template>
    <div>
        <main class="flex-1">
            <section class="text-gray-600 body-font">
                <div class="container px-5 pb-24 pt-16 mx-auto flex flex-col">
                    <div class="lg:w-5/6 h-full mx-auto">
                        <div class="rounded-lg h-96 overflow-hidden">
                            <img
                                :alt="mentor.name"
                                class="object-cover object-center h-full w-full"
                                :src="mentor.headimage"
                            />
                        </div>
                        <div class="flex flex-col sm:flex-row mt-10">
                            <div class="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                                <div class="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                                    <!-- <svg fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2" class="w-10 h-10" viewBox="0 0 24 24">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg> -->
                                    <img :src="mentor.avatar" :alt="mentor.name" class="w-20 h-20 rounded-full" />
                                </div>
                                <div class="flex flex-col items-center text-center justify-center">
                                    <h2 class="font-medium title-font mt-4 text-gray-900 text-lg">{{ mentor.name }}</h2>
                                    <div class="w-12 h-1 bg-blue-500 rounded mt-2 mb-4"></div>
                                    <p class="text-base">{{ mentor.role }}</p>
                                    <a :href="'mailto:' + mentor.email" class="mt-3">
                                        <i-line-md:email-twotone class="text-xl" />
                                    </a>
                                </div>
                            </div>
                            <div class="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                                <p class="leading-relaxed text-lg mb-4">{{ mentor.description }}</p>
                                <p class="text-base">Email: {{ mentor.email }}</p>
                                <!-- <a class="text-indigo-500 inline-flex items-center">Learn More
                                    <svg fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2"
                                        viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                                    </svg>
                                </a> -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        mentor: {
            type: Object,
            required: true
        }
    }
});
</script>