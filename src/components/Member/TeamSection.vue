<template>
    <section class="text-gray-600 body-font">
        <div class="container px-5 py-24 mx-auto">
            <div class="flex flex-col text-center w-full mb-20">
                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Our Team Leads</h1>
                <p class="lg:w-2/3 mx-auto leading-relaxed text-base">
                    Here are our amazing team leaders who work so hard to make this success.
                    <br>
                    <br>
                    Disclaimer: listed here are actually last year's team leads merely as a point of contact until apointments and/or elections take place for this year.
                </p>
            </div>
            <div class="flex flex-wrap -m-2">
                <TeamMember v-for="(member, index) in members" :key="index" :member="member" />
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamMember from './TeamMember.vue';

export default defineComponent({
    components: {
        TeamMember,
    },
    data() {
        return {
            members: [
                { name: 'Dotan Dana', role: 'Past Scouting & Strategy Lead' },
                { name: 'Alex Rabochii', role: 'Past Scouting & Strategy Lead' },
                { name: 'Shamith Murphy', role: 'Past Software Lead' },
                { name: 'Nate Brodbent', role: 'Past CAD Lead' },
                { name: 'Riley Walker', role: 'Past Fabrication Lead' },
            ],
        };
    },
});
</script>