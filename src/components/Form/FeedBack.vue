<template>
    <!-- <h1 class="text-2xl font-bold mb-4">Give Some Feedback</h1> -->

    <div class="bg-gray-100 p-4 rounded shadow">
        <form @submit.prevent="submitFeedback">
            <div class="mb-4">
                <label for="nickname" class="block mb-2">Your Name
                    <span class="text-red-500">*</span>
                </label>
                <input v-model="nickname" type="text" id="nickname" class="input-field"
                    placeholder="Nick Name is fine if you want..." required />
            </div>

            <div class="mb-4">
                <label for="contact" class="block mb-2">
                    Contact Info
                    <!-- <span class="text-sm text-gray-500">(Email, Phone, etc.)</span> -->
                    <span class="text-red-500">*</span>
                </label>

                <input v-model="contact" type="text" id="contact" class="input-field"
                    placeholder="Email, Phone Number, etc." required />
            </div>

            <div class="mb-4">
                <label for="category" class="block mb-2">Category
                    <span class="text-red-500">*</span>
                </label>
                <select v-model="category" id="category" class="input-field" @change="handleCategoryChange">
                    <option value="">Please choose a category</option>
                    <option value="bug">Bug Report</option>
                    <option value="general">General Feedback</option>
                </select>
            </div>

            <div class="mb-4">
                <label for="title" class="block mb-2">Title
                    <span class="text-red-500">*</span>
                </label>
                <input v-model="title" type="text" id="title" class="input-field"
                    placeholder="Give a title to your feedback" required />
            </div>

            <div class="mb-4">
                <label for="content" class="block mb-2">Your feedback
                    <span class="text-red-500">*</span>
                </label>

                <textarea v-model="content" id="content" class="input-field" rows="4"
                    placeholder="More detail as you can" required></textarea>
            </div>

            <div v-if="isBug" class="mb-4">
                <section>
                    <div class="flex items-center justify-between gap-x-6 bg-red-600 px-6 py-2.5 sm:pr-3.5 lg:pl-8">
                        <p class="text-sm leading-6 text-white">
                            <strong class="font-semibold">
                                We will collect those device information below
                            </strong>
                            to help us diagnose the issue much faster
                        </p>
                        <button type="button" class="-m-3 flex-none p-3 focus-visible:outline-offset-[-4px]">
                            <span class="sr-only">Dismiss</span>
                        </button>
                    </div>
                </section>
                <DeviceInfoTable :deviceInfo="deviceInfo" :currentTimestamp="currentTimestamp" />
            </div>
            <button type="submit"
                class="btn-primary transition transform hover:bg-blue-700 hover:scale-105 active:scale-95">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import DeviceInfoTable from '@/components/Form/DeviceInfoTable.vue';

export default {
    components: { DeviceInfoTable },
    setup() {
        const nickname = ref('');
        const category = ref('');
        const title = ref('');
        const contact = ref('');
        const content = ref('');
        const currentTimestamp = ref(new Date().toISOString());
        const isBug = ref(false);
        const deviceInfo = ref({
            userAgent: '',
            ip: '',
            timestamp: '',
            screenSize: '',
            language: '',
        });

        const updateTimestamp = () => {
            currentTimestamp.value = new Date().toISOString();
        };
        let intervalId: number;

        onMounted(() => {
            // Update the timestamp every second
            intervalId = window.setInterval(updateTimestamp, 1000);

            // Get device information
            deviceInfo.value = {
                userAgent: navigator.userAgent,
                ip: '',
                timestamp: currentTimestamp.value,
                screenSize: `${window.innerWidth} x ${window.innerHeight}`,
                language: navigator.language,
            };

            // Add an axios request to get the user's IP address
            axios.get('https://api.ipify.org?format=json').then((response: { data: { ip: any; }; }) => {
                deviceInfo.value.ip = response.data.ip;
            });
        });

        // Clear the interval when the component is unmounted
        onBeforeUnmount(() => {
            clearInterval(intervalId);
        });

        // If the category is "bug", set isBug to true
        const handleCategoryChange = () => {
            isBug.value = category.value === 'bug';
        };

        const submitFeedback = async () => {
            const feedbackData = {
                nickname: nickname.value,
                category: category.value,
                title: title.value,
                contact: contact.value,
                content: content.value,
                deviceInfo: {
                    ...deviceInfo.value,
                    timestamp: currentTimestamp.value,
                },
            };

            // Dev Note: Uncomment the code below to submit without posting to the server

            // try {
            //     // Use a mock submission for now
            //     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
            //     const isSuccess = true; // Set to true to simulate successful submission
            //     if (isSuccess) {
            //         alert('Successfully submitted your feedback! We are appreciative that you took the time to help us improve.');
            //     } else {
            //         throw new Error('Failed to submit feedback');
            //     }
            // } catch (error) {
            //     console.error('An error occurred while submitting feedback:', error);
            // }

            try {
                await axios.post('/api/feedback', feedbackData);
                alert('Successfully submitted your feedback! We are appreciative that you took the time to help us improve.');
            } catch (error) {
                console.error('An error occurred while submitting feedback:', error);
            }
        };

        return {
            nickname,
            category,
            title,
            contact,
            content,
            isBug,
            deviceInfo,
            currentTimestamp,
            handleCategoryChange,
            submitFeedback,
        };
    },
};
</script>

<style scoped>
.input-field {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    width: 100%;
}

.btn-primary {
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.375rem;
    cursor: pointer;
}
</style>