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
                        <div class="rounded-lg border-4 border-blue-400 bg-blue-100 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Chat with us</h2>

                            <div class="rounded-2xl bg-gray-50 p-10">
                                <h3 class="text-base font-semibold leading-7 text-gray-900">Coach John</h3>
                                <dl class="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                                    <div>
                                        <dt class="sr-only">Email</dt>
                                        <dd><a class="font-semibold text-indigo-600"
                                                href="mailto:asasasa@example.com">coach@frc695.com</a></dd>
                                                <a href="mailto:coach@frc695.com" class="text-black hover:text-gray-600">
                                            <span class="sr-only">Email</span>
                                            <Icon icon="line-md:email" height="23" width="23" />
                                        </a>
                                    </div>
                                    <!-- <div class="mt-1">
                                        <dt class="sr-only">Phone number</dt>
                                        <dd>+1 (555) 555-5555</dd>
                                    </div> -->
                                </dl>
                            </div>

                            <!-- <div class="mb-4 flex items-center space-x-4">
                                <img alt="Team Coach" class="rounded-full" height="64"
                                    src="https://placehold.co/64x64/3b82f6/white"
                                    style="aspect-ratio: 64/64; object-fit: cover;" width="64" />
                                <div>
                                    <h3 class="font-semibold text-gray-800">Coach John</h3>
                                    <p class="text-sm text-gray-600">Head Coach</p>

                                    Icons
                                    <div class="flex space-x-4 mt-1 text-black hover:text-gray-400">
                                        <a href="mailto:coach@frc695.com" class="text-black hover:text-gray-600">
                                            <span class="sr-only">Email</span>
                                            <Icon icon="line-md:email" height="23" width="23" />
                                        </a>
                                    </div>
                                </div>
                            </div> -->

                            <!-- Chat Button(Only uncomment this when using) -->
                            <!-- <button @click="startChat"
                                class="w-full rounded border border-gray-800 px-4 py-2 font-bold text-gray-800 hover:bg-gray-100">Start
                                Chat
                            </button> -->
                        </div>
                        <div class="rounded-lg border-4 border-emerald-400 bg-emerald-100 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Visit us</h2>
                            <div class="mb-2 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd" />
                                </svg>
                                <p class="text-gray-800">24601 Fairmount Blvd, Cleveland, OH 44122, USA.</p>
                            </div>
                            <div class="aspect-video overflow-hidden rounded-md bg-yellow-100">
                                <!-- <img alt="Map" src="https://placehold.co/300x400/3b82f6/white"
                                    class="h-full w-full object-cover" /> -->

                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.936050733924!2d-81.50350832399468!3d41.48398608999798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88310289d7a522f5%3A0x6b21ae2be51d4ca1!2sBeachwood%20High%20School!5e0!3m2!1sen-US!2sus!4v1724974249750!5m2!1sen-US!2sus"
                                    width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade"></iframe>
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