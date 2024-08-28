<template>
    <div class="flex min-h-screen flex-col bg-yellow-50">
        <main class="flex-grow mb-8">
            <div class="relative overflow-hidden bg-yellow-100 py-16">
                <!-- <div class="absolute left-0 top-0 h-1/2 w-1/2 bg-gradient-to-br from-yellow-200 to-transparent">
                    <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png" alt=""
                        class="h-full w-full object-cover opacity-30 mix-blend-overlay" />
                </div>
                <div class="absolute bottom-0 right-0 h-1/2 w-1/2 bg-gradient-to-tl from-yellow-200 to-transparent">
                    <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png" alt=""
                        class="h-full w-full object-cover opacity-30 mix-blend-overlay" />
                </div> -->
                <div class="container relative z-10 mx-auto px-4 text-center">
                    <h1 class="mb-4 text-4xl font-bold text-gray-900">Contact our team</h1>
                    <p class="mx-auto max-w-2xl text-lg text-gray-800">Have questions about our FRC team or want to get
                        involved? We're here to help! Reach out to us anytime and we'll get back to you as soon as
                        possible.</p>
                </div>
            </div>
            <div class="container mx-auto mt-8 p-4">
                <div class="grid gap-8 md:grid-cols-2">
                    <div class="rounded-lg border-4 border-amber-400 bg-white p-6 shadow-md overflow-x-auto">
                        <h2 class="mb-4 text-2xl font-semibold text-gray-900">Send us a message</h2>
                        <!-- Feedback component -->
                        <FeedBack />
                    </div>
                    <div class="space-y-6">
                        <div class="rounded-lg border-4 border-blue-400 bg-yellow-50 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Chat with us</h2>
                            <div class="mb-4 flex items-center space-x-4">
                                <img alt="Team Coach" class="rounded-full" height="64"
                                    src="https://placehold.co/64x64/3b82f6/white"
                                    style="aspect-ratio: 64/64; object-fit: cover;" width="64" />
                                <div>
                                    <h3 class="font-semibold text-gray-800">Coach Name</h3>
                                    <p class="text-sm text-gray-600">Head Coach</p>

                                    <!-- Icons -->
                                    <div class="flex space-x-4 mt-1 text-black hover:text-gray-400">
                                        <a href="mailto:coach@frc695.com" class="text-black hover:text-gray-600">
                                            <span class="sr-only">Email</span>
                                            <Icon icon="line-md:email" height="23" width="23" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Chat Button(Only uncomment this when using) -->
                            <!-- <button @click="startChat"
                                class="w-full rounded border border-gray-800 px-4 py-2 font-bold text-gray-800 hover:bg-gray-100">Start
                                Chat
                            </button> -->
                        </div>
                        <div class="rounded-lg border-4 border-emerald-400 bg-yellow-50 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Visit us</h2>
                            <div class="mb-2 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd" />
                                </svg>
                                <p class="text-gray-800">123 Village, Nice City, AB 12345</p>
                            </div>
                            <div class="aspect-video overflow-hidden rounded-md bg-yellow-100">
                                <img alt="Map" src="https://placehold.co/300x400/3b82f6/white"
                                    class="h-full w-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import FeedBack from '@/components/Form/FeedBack.vue';
import { Icon } from '@iconify/vue';

// const form = ref({
//     name: '',
//     email: '',
//     category: 'General Inquiry',
//     message: ''
// })

// const submitForm = () => {
//     // Handle form submission
//     console.log('Form submitted:', form.value)
// }

// const startChat = () => {
//     // Handle chat initiation
//     console.log('Chat started')
// }
</script>

<style scoped>
/* Add any component-specific styles here */
</style>