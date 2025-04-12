<template>
    <div class="login-container">
        <div class="login-card-wrapper">
            <div class="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                <div>
                    <div class="flex justify-center">
                        <div class="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                            <Icon icon="mdi:shield-account" class="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                        </div>
                    </div>
                    <h2 class="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Welcome to Team 695
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Sign in to access your account
                    </p>
                </div>

                <div class="mt-8 space-y-6">
                    <div class="rounded-md shadow-sm space-y-4">
                        <button @click="handleSignIn"
                            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg">
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Icon icon="mdi:login" class="h-5 w-5 text-white" />
                            </span>
                            Sign in with Casdoor
                        </button>

                        <button @click="handleRegister"
                            class="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Icon icon="mdi:account-plus" class="h-5 w-5 text-blue-500" />
                            </span>
                            Register a New Account
                        </button>
                    </div>
                </div>

                <div class="px-4 py-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <Icon icon="mdi:shield-check" class="h-6 w-6 text-blue-500" />
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-gray-900">Secure Authentication</h3>
                            <div class="mt-1 text-sm text-gray-600">
                                <p>
                                    Your data is protected with industry-standard encryption and security protocols.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center text-xs text-gray-500">
                    <p class="mt-1">© {{ new Date().getFullYear() }} Team695. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { casdoorService } from '@/services/auth';
import { Icon } from '@iconify/vue';

export default defineComponent({
    name: 'CasdoorLogin',
    components: {
        Icon
    },
    setup() {
        const handleSignIn = () => {
            // Start the PKCE login flow
            casdoorService.startLogin();
        };

        const handleRegister = () => {
            // Redirect to the registration page
            window.location.href = 'https://sso.team695.com/signup/695_website';
        };

        return {
            handleSignIn,
            handleRegister
        };
    }
});
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
    --tw-gradient-from: #38bdf8;
    --tw-gradient-via: #60a5fa;
    --tw-gradient-to: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to);
    padding: 1rem;
}

.login-card-wrapper {
    width: 100%;
    max-width: 28rem;
    display: flex;
    justify-content: center;
}

/* 针对较小设备的优化 */
@media (max-height: 700px) {
    .login-container {
        padding-top: 0;
        padding-bottom: 0;
        align-items: flex-start;
    }
    
    .login-card-wrapper {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
}
</style>