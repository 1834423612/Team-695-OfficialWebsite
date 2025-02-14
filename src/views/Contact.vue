<template>
    <div class="flex min-h-screen flex-col bg-yellow-50">
        <main class="grow mb-8">
            <div class="relative overflow-hidden bg-yellow-100 py-16">
                <!-- <div class="absolute left-0 top-0 h-1/2 w-1/2 bg-linear-to-br from-yellow-200 to-transparent">
                    <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png" alt=""
                        class="h-full w-full object-cover opacity-30 mix-blend-overlay" />
                </div>
                <div class="absolute bottom-0 right-0 h-1/2 w-1/2 bg-linear-to-tl from-yellow-200 to-transparent">
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
                <div class="">
                    <div class="rounded-lg border-4 border-amber-400 bg-white p-6 shadow-md overflow-x-auto">
                        <h2 class="mb-4 text-2xl font-semibold text-gray-900">Send us a message</h2>
                        <!-- Feedback component -->
                        <FeedBack :deviceInfo="deviceInfo" />
                    </div>

                    <!-- <div class="space-y-6">
                        <div class="rounded-lg border-4 border-blue-400 bg-blue-100 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Contact with us</h2>

                            <div class="rounded-2xl bg-gray-50 py-4 px-6">
                                <h3 class="text-base font-semibold text-gray-900">John Keyerleber</h3>
                                <span class="text-sm font-semibold text-gray-500">Head Coach</span>
                                <dl class="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                                    <div>
                                        <dt class="sr-only">Email</dt>
                                        <a href="mailto:coach@frc695.com" class="flex text-black hover:text-gray-600">
                                            <span class="sr-only">Email</span>
                                            <Icon icon="line-md:email" height="23" width="23" />
                                            <span
                                                class="ml-2 font-semibold text-indigo-600 hover:text-indigo-500 hover:underline hover:decoration-2 hover:underline-offset-4">
                                                coach@frc695.com
                                            </span>
                                        </a>
                                    </div>
                                </dl>
                            </div>

                            <div class="rounded-2xl bg-gray-50 py-4 px-6 mt-4">
                                <h3 class="text-base font-semibold text-gray-900">Find our Project</h3>
                                <span class="text-sm font-semibold text-gray-500">Github Open Source</span>
                                <dl class="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                                    <div>
                                        <dt class="sr-only">Resource</dt>

                                        <router-link to="/resources"
                                            class="flex text-black hover:text-gray-600">
                                            <span class="sr-only">Resource</span>
                                            <Icon icon="bi:github" height="23" width="23" />
                                            <span
                                                class="ml-2 font-semibold text-indigo-600 hover:text-indigo-500 hover:underline hover:decoration-2 hover:underline-offset-4">
                                                Go to the Resources Page to find more 
                                            </span>
                                            <Icon icon="mingcute:arrow-right-line" class="ml-1 mt-1 w-4 h-4" />
                                        </router-link>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <div class="rounded-lg border-4 border-emerald-400 bg-emerald-100 p-6 shadow-xl">
                            <h2 class="mb-4 text-2xl font-semibold text-gray-900">Visit us</h2>
                            <div class="mb-2 flex items-center space-x-2">
                                <Icon icon="ion:location" class="w-5 h-5 text-gray-600" />
                                <p class="text-gray-800">25100 Fairmount Blvd, Beachwood, OH 44122, USA.</p>
                            </div>
                            <div class="aspect-video overflow-hidden rounded-md bg-yellow-100">

                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.936050733924!2d-81.50350832399468!3d41.48398608999798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88310289d7a522f5%3A0x6b21ae2be51d4ca1!2sBeachwood%20High%20School!5e0!3m2!1sen-US!2sus!4v1724974249750!5m2!1sen-US!2sus"
                                    width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        </div>
                    </div> -->

                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FeedBack from '@/components/Form/FeedBack.vue';
import axios from 'axios';

const deviceInfo = ref({
    userAgent: '',
    ip: '',
    screenSize: '',
    language: ''
});

onMounted(() => {
    deviceInfo.value = {
        userAgent: navigator.userAgent,
        ip: '',
        screenSize: `${window.innerWidth} x ${window.innerHeight}`,
        language: navigator.language,
    };

    axios.get('https://api.ipify.org?format=json').then((response) => {
        deviceInfo.value.ip = response.data.ip;
    });
});
</script>
