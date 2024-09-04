<template>
    <div
        class="relative inline-block bg-[#0f4bcb] text-white text-center p-2 w-36 h-[180px] mb-10 rounded-t-lg shadow-md">
        <img src="https://www.thebluealliance.com/images/first_icon.svg" alt="FRC Logo"
            class="w-16 mx-auto mb-2 mt-3" />
        <div class="award-name h-fit flex items-center justify-center">
            <span class="text-sm font-bold italic leading-4 mt-2">{{ title }}</span>
        </div>
        <div class="award-event mt-1">
            <span class="text-xs font-medium tracking-tight">{{ description }}</span>
        </div>
        <div
            class="absolute left-0 right-0 top-full border-l-[#0f4bcb] border-r-[#0f4bcb] border-b-[#0000] border-solid border-x-[72px] border-b-[30px]">
        </div>
        <div class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-t-lg">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'WinnerBanner',
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
});
</script>