<template>
    <div class="bg-gray-100 p-4 rounded-sm shadow-sm overflow-x-auto">
        <form @submit.prevent="submitFeedback">
            <div class="mb-4">
                <label for="nickname" class="block mb-2">Your Name
                    <span class="text-red-500">*</span>
                </label>
                <input v-model="nickname" type="text" id="nickname" class="input-field"
                    placeholder="Please input your name here" required />
            </div>

            <div class="mb-4">
                <label for="contact" class="block mb-2">
                    Contact Info
                    <span class="text-red-500">*</span>
                </label>
                <input v-model="contact" type="email" id="contact" class="input-field"
                    placeholder="Please put your Email here" required />
            </div>

            <div class="mb-4">
                <label for="title" class="block mb-2">Title
                    <span class="text-red-500">*</span>
                </label>
                <input v-model="title" type="text" id="title" class="input-field"
                    placeholder="Give a title to your feedback" required />
            </div>

            <div class="mb-4">
                <label for="content" class="block mb-2">Your message
                    <span class="text-red-500">*</span>
                </label>
                <textarea v-model="content" id="content" class="input-field" rows="4"
                    placeholder="More detail as you can" required></textarea>
            </div>

            <button type="submit"
                class="btn-primary transition transform hover:bg-blue-700 hover:scale-105 active:scale-95">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios';

export default {
    props: {
        deviceInfo: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const nickname = ref('');
        const title = ref('');
        const contact = ref('');
        const content = ref('');

        const submitFeedback = async () => {
            const feedbackData = {
                nickname: nickname.value,
                category: 'general',  // 默认值
                title: title.value,
                contact: contact.value,
                content: content.value,
                deviceInfo: props.deviceInfo
            };

            try {
                await axios.post('https://api.frc695.com/api/feedback', feedbackData);
                alert('Successfully submitted your feedback! We are appreciative that you took the time to help us improve.');
                window.location.reload();  // 刷新页面
            } catch (error) {
                console.error('An error occurred while submitting feedback:', error);
            }
        };

        return {
            nickname,
            title,
            contact,
            content,
            submitFeedback
        };
    }
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