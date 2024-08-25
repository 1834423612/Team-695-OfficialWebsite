<template>
    <div class="bg-white p-4 rounded shadow mt-4">
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th class="border border-gray-300 px-4 py-2">Information</th>
                        <th class="border border-gray-300 px-4 py-2">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">User Agent</td>
                        <td class="border border-gray-300 px-4 py-2">{{ deviceInfo.userAgent }}</td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">IP Address</td>
                        <td class="border border-gray-300 px-4 py-2">{{ deviceInfo.ip }}</td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">UTC Time</td>
                        <td class="border border-gray-300 px-4 py-2">{{ currentTimestamp }}</td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">
                            Current Device Screen Size
                            <span class="text-sm text-gray-500">(Width &times; Height)</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">{{ deviceInfo.screenSize }}</td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">Current Device Language</td>
                        <td class="border border-gray-300 px-4 py-2">{{ deviceInfo.language }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        deviceInfo: {
            type: Object as PropType<{
                userAgent: string;
                ip: string;
                screenSize: string;
                language: string;
            }>,
            required: true,
        },
        currentTimestamp: {
            type: String,
            required: true,
        },
    },
});
</script>

<style scoped></style>