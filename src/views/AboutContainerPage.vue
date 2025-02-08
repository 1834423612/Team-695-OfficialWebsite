<template>
    <div class="bg-sky-100 min-h-screen">
        <header class="relative">
            <img src="https://r2.fastbirdcdn.online/Robotics/Robots/66ad276113a1c-20240803_RoboticsTeamPittsburghRegional.jpg"
                alt="About Team" class="w-full h-[40vh] object-cover" />
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <h1 class="text-white text-4xl md:text-6xl font-bold tracking-wider text-center">About Team 695</h1>
                <p class="text-gray-200 text-xl mt-4 mx-4 text-center max-w-3xl">
                    Learn more about our dedicated team members and their contributions.
                </p>
            </div>
        </header>

        <div class="container mx-auto px-4 py-8">
            <!-- Tab Navigation -->
            <nav class="flex justify-center mb-8" aria-label="Tabs">
                <div class="flex flex-wrap justify-center bg-white rounded-2xl md:rounded-full shadow-lg p-1">
                    <button v-for="tab in tabs" :key="tab.name" @click="selectTab(tab)"
                        class="rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-hidden"
                        :class="getTabClasses(tab)" :aria-current="tab.current ? 'page' : undefined">
                        {{ tab.name }}
                    </button>
                </div>
            </nav>

            <!-- Content section -->
            <div class="bg-white shadow-xl rounded-lg p-8">
                <component :is="currentTabComponent"></component>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import About from './About.vue';
// import Members from './Members.vue';
import Achievement from './Achievement.vue';

interface Tab {
    name: string;
    component: any;
    current: boolean;
    color: string;
}

const tabs = ref<Tab[]>([
    { name: 'About', component: markRaw(About), current: true, color: 'blue' },
    // { name: 'Members', component: markRaw(Members), current: false, color: 'green' },
    { name: 'Achievements', component: markRaw(Achievement), current: false, color: 'yellow' },
]);

const getTabClasses = (tab: Tab) => {
    if (tab.current) {
        return {
            'text-white shadow-md': true,
            'bg-blue-500': tab.color === 'blue',
            'bg-green-500': tab.color === 'green',
            'bg-yellow-500': tab.color === 'yellow',
            'bg-red-500': tab.color === 'red',
        };
    } else {
        return {
            'bg-white': true,
            'text-gray-500': true,
            'hover:text-blue-600': tab.color === 'blue',
            'hover:text-green-600': tab.color === 'green',
            'hover:text-yellow-600': tab.color === 'yellow',
            'hover:text-red-600': tab.color === 'red',
        };
    }
};

const currentTabComponent = ref(tabs.value.find(tab => tab.current)?.component);

const route = useRoute();
const router = useRouter();

const selectTab = (selectedTab: Tab) => {
    tabs.value.forEach(tab => tab.current = tab === selectedTab);
    currentTabComponent.value = selectedTab.component;
    router.push(`/${selectedTab.name.toLowerCase()}`);
};

const updateTabFromRoute = () => {
    const path = route.path.replace('/', '');
    const selectedTab = tabs.value.find(tab => tab.name.toLowerCase() === path.toLowerCase());
    if (selectedTab) {
        selectTab(selectedTab);
    } else {
        const aboutTab = tabs.value.find(tab => tab.name === 'about');
        if (aboutTab)
            selectTab(aboutTab);
        router.push('/about');
    }
};

onMounted(() => {
    updateTabFromRoute();
});

watch(route, () => {
    updateTabFromRoute();
});
</script>