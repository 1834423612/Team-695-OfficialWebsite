<template>
    <div>
        <main class="flex-1">
            <section id="news" class="py-16 px-6">
                <div class="container mx-auto max-w-6xl">
                    <h2 class="text-3xl font-bold mb-8">Resources</h2>
                    <div class="space-y-6">
                        <!-- Resources Card Container -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <!-- Resources Card -->
                            <div v-for="(action, actionIdx) in actions" :key="action.title" :class="[
                                actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                                actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                                actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
                                actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                                'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500',
                                'shadow-lg transition-transform transform hover:scale-105', // Adding hover effect for better UX
                            ]">
                                <div>
                                    <span :class="[action.iconBackground, action.iconForeground, 'inline-flex rounded-lg p-3 ring-4 ring-white']">
                                        <component :is="action.icon" class="h-6 w-6" aria-hidden="true" />
                                    </span>
                                </div>
                                <div class="mt-8">
                                    <h3 class="text-base font-semibold leading-6 text-gray-900">
                                        <a :href="action.href" class="focus:outline-none">
                                            <span class="absolute inset-0" aria-hidden="true" />
                                            {{ action.title }}
                                        </a>
                                    </h3>
                                    <p class="mt-2 text-sm text-gray-500">
                                        Test description for the resource card.
                                    </p>
                                </div>
                                <span class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import {
    AcademicCapIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    ClockIcon,
    ReceiptRefundIcon,
    UsersIcon,
} from '@heroicons/vue/24/outline';

const actions = [
    {
        title: 'Test Resource Card 1',
        href: '#',
        icon: ClockIcon,
        iconForeground: 'text-teal-700',
        iconBackground: 'bg-teal-50',
    },
    {
        title: 'Test Resource Card 2',
        href: '#',
        icon: CheckBadgeIcon,
        iconForeground: 'text-purple-700',
        iconBackground: 'bg-purple-50',
    },
    {
        title: 'Test Resource Card 3',
        href: '#',
        icon: UsersIcon,
        iconForeground: 'text-sky-700',
        iconBackground: 'bg-sky-50',
    },
    {
        title: 'Test Resource Card 4',
        href: '#',
        icon: BanknotesIcon,
        iconForeground: 'text-yellow-700',
        iconBackground: 'bg-yellow-50',
    },
    {
        title: 'Test Resource Card 5',
        href: '#',
        icon: ReceiptRefundIcon,
        iconForeground: 'text-rose-700',
        iconBackground: 'bg-rose-50',
    },
    {
        title: 'Test Resource Card 6',
        href: '#',
        icon: AcademicCapIcon,
        iconForeground: 'text-indigo-700',
        iconBackground: 'bg-indigo-50',
    },
];
</script>
