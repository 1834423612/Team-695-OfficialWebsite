<template>
    <div class="relative inline-block bg-[#0f4bcb] text-white text-center p-2 w-36 h-[190px] mb-10 ml-2">
        <img
        src="https://www.thebluealliance.com/images/first_icon.svg"
        alt="FRC Logo"
        class="w-[4.8rem] mx-auto mb-2 mt-3"
        />
        <div class="award-name">
            <span class="text-base font-bold italic text-center mb-8">{{ title }}</span>
        </div>
        <div class="award-event mt-1">
            <span class="text-xs font-medium text-center">{{ description }}</span>
        </div>
        <div class="absolute left-0 right-0 top-full border-l-[#0f4bcb] border-r-[#0f4bcb] border-b-[#0000] border-solid border-x-[72px] border-b-[30px]"></div>
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

<style scoped>
.banner {
    /* Use the shadow effect of Tailwind CSS */
    filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.1));
}
</style>
