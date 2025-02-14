<template>
    <div class="flex items-center justify-center min-h-screen bg-linear-to-r from-cyan-100 to-blue-100">
        <div class="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
            <h1 class="text-9xl font-bold text-cyan-500">404</h1>
            <h2 class="text-3xl font-semibold text-gray-800 mt-4">Oops! Page Not Found</h2>
            <p class="text-gray-600 mt-2">We couldn't find the page you're looking for.</p>
            <p class="text-gray-600 mt-2">
                Redirecting to Home Page in 
                <span class="text-xl font-extrabold text-red-500">{{ countdown }}</span> 
                seconds...
            </p>
            <button @click="goHome"
                class="mt-6 px-6 py-3 bg-linear-to-r from-cyan-400 to-blue-400 text-white font-semibold rounded-full shadow-md hover:from-cyan-500 hover:to-blue-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                Go Home Now
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(10)

const goHome = () => {
    router.push('/')
}

onMounted(() => {
    const timer = setInterval(() => {
        countdown.value--
        if (countdown.value === 0) {
            clearInterval(timer)
            goHome()
        }
    }, 1000)
})
</script>
