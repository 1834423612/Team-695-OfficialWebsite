<template>
    <div>
        <main class="flex-1">
            <section class="text-gray-600 body-font">
                <div class="container px-5 pb-24 pt-16 mx-auto flex flex-col">
                    <div class="lg:w-5/6 h-full mx-auto">
                        
                        <nav class="flex" aria-label="Breadcrumb">
                            <ol role="list"
                                class="flex flex-wrap py-2 space-x-2 rounded-md bg-white px-4 lg:px-6 shadow">
                                <li>
                                    <div>
                                        <a href="/" class="text-gray-400 hover:text-gray-500 flex items-center">
                                            <Icon icon="ic:round-home" class="h-5 w-5 flex-shrink-0"
                                                aria-hidden="true" />
                                            <span class="sr-only">Home</span>
                                        </a>
                                    </div>
                                </li>
                                <li v-for="page in pages" :key="page.name">
                                    <div class="flex items-center">
                                        <Icon icon="iconamoon:arrow-right-2-duotone"
                                            class="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                                        <a :href="page.href" class="ml-2 text-sm font-medium hover:text-gray-700"
                                            :class="page.current ? 'text-indigo-600 hover:text-indigo-400 hover:underline hover:decoration-2 hover:underline-offset-4' : 'text-gray-500'"
                                            :aria-current="page.current ? 'page' : undefined">
                                            {{ page.name }}
                                        </a>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        <!--<div class="rounded-lg h-96 overflow-hidden">
                            <img
                                :alt="mentor.name"
                                class="object-cover object-center h-full w-full"
                                :src="mentor.headimage"
                            />
                        </div>-->
                        <div class="flex flex-col sm:flex-row mt-10">
                            <div class="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                                <!--<div class="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                                    <svg fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2" class="w-10 h-10" viewBox="0 0 24 24">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <img :src="mentor.avatar" :alt="mentor.name" class="w-20 h-20 rounded-full" />
                                </div>-->
                                <div class="flex flex-col items-center text-center justify-center">
                                    <h2 class="font-medium title-font mt-4 text-gray-900 text-lg">{{ mentor.name }}</h2>
                                    <div class="w-12 h-1 bg-blue-500 rounded mt-2 mb-4"></div>
                                    <p class="text-base">{{ mentor.role }}</p>
                                    <a :href="'mailto:' + mentor.email" class="flex mt-3 hover:text-gray-600">
                                        <i-line-md:email-twotone class="text-xl" />
                                        <span
                                            class="ml-2 font-base text-indigo-600 hover:text-indigo-500 hover:underline hover:decoration-2 hover:underline-offset-4">
                                            {{ mentor.email }}
                                        </span>
                                    </a>
                                </div>
                            </div>
                            <div
                                class="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                                <p class="leading-relaxed text-lg mb-4">{{ mentor.description }}</p>
                                <!-- <p class="text-base">Email: {{ mentor.email }}</p> -->
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
import { Icon } from '@iconify/vue';

export default defineComponent({
    components: {
        Icon
    },
    props: {
        mentor: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            pages: [
                // { name: 'Home', href: '/', current: false },
                { name: 'Members', href: '/members', current: false },
                { name: this.mentor.name, href: '#', current: true },
            ]
        };
    },
});
</script>