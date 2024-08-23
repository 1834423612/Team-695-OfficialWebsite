<template>
    <div>
        <main class="flex-1">
            <section class="text-gray-600 body-font">
                <div class="container px-5 pb-24 pt-16 mx-auto flex flex-col">
                    <div class="lg:w-5/6 h-full mx-auto">
                        <div class="rounded-lg h-96 overflow-hidden">
                            <img
                                alt="resources"
                                class="object-cover object-center h-full w-full"
                                src="https://placehold.co/800x400"
                            />
                        </div>
                        <div class="flex flex-col sm:flex-row mt-10">
                            <div class="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                                <div class="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                                    <img src="https://images.unsplash.com/photo-1612838056804-3b3b3f1b3b3b" alt="resources" class="w-20 h-20 rounded-full" />
                                </div>
                                <div class="flex flex-col items-center text-center justify-center">
                                    <h2 class="font-medium title-font mt-4 text-gray-900 text-lg">Resources</h2>
                                    <div class="w-12 h-1 bg-blue-500 rounded mt-2 mb-4"></div>
                                    <p class="text-base">Resources for learning and development</p>
                                </div>
                            </div>
                            <div class="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                                <p class="leading-relaxed text-lg mb-4">Here are some resources that you can use to learn and develop your skills.</p>
                                <p class="text-base">Email:</p>
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
        resources: {
            type: Object,
            required: true
        }
    }
});
</script>