<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="w-11/12 max-w-lg p-4">
            <div :class="[
                'bg-white rounded-lg shadow-xl overflow-hidden',
                {
                    'border-t-4 border-blue-500': type === 'info',
                    'border-t-4 border-red-500': type === 'error',
                    'border-t-4 border-green-500': type === 'success',
                    'border-t-4 border-amber-500': type === 'warning'
                }
            ]">
                <div class="p-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 mr-3">
                                <Icon :icon="icon" :class="[
                                    'w-8 h-8',
                                    {
                                        'text-blue-500': type === 'info',
                                        'text-red-500': type === 'error',
                                        'text-green-500': type === 'success',
                                        'text-amber-500': type === 'warning'
                                    }
                                ]" />
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                                <p class="mt-1 text-sm text-gray-600">{{ message }}</p>
                            </div>
                        </div>
                        <button @click="close"
                            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors">
                            <Icon icon="mdi:close" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button @click="handleAction" :class="[
                            'py-2 px-4 rounded font-medium text-white transition-colors',
                            {
                                'bg-blue-600 hover:bg-blue-700': type === 'info',
                                'bg-red-500 hover:bg-red-600': type === 'error',
                                'bg-green-500 hover:bg-green-600': type === 'success',
                                'bg-amber-500 hover:bg-amber-600': type === 'warning'
                            }
                        ]">
                            {{ actionText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

export default defineComponent({
    name: 'GlobalNotification',
    components: {
        Icon
    },
    setup() {
        const show = ref(false);
        const title = ref('');
        const message = ref('');
        const type = ref('info');
        const actionText = ref('OK');
        const actionCallback = ref<(() => void) | null>(null);

        const icon = computed(() => {
            switch (type.value) {
                case 'error': return 'mdi:alert-circle';
                case 'success': return 'mdi:check-circle';
                case 'warning': return 'mdi:alert';
                default: return 'mdi:information';
            }
        });

        // 确保只有一个通知显示
        let notificationQueue: Array<{
            title: string;
            message: string;
            type: string;
            actionText: string;
            callback?: () => void;
        }> = [];
        let isDisplayingNotification = false;

        // 处理通知队列
        const processQueue = () => {
            if (notificationQueue.length > 0 && !isDisplayingNotification) {
                isDisplayingNotification = true;
                const next = notificationQueue.shift()!;

                title.value = next.title;
                message.value = next.message;
                type.value = next.type;
                actionText.value = next.actionText;
                actionCallback.value = next.callback || null;
                show.value = true;
            }
        };

        // 关闭当前通知
        const close = () => {
            show.value = false;
            setTimeout(() => {
                isDisplayingNotification = false;
                processQueue();
            }, 300);
        };

        // 执行操作并关闭
        const handleAction = () => {
            if (actionCallback.value) {
                actionCallback.value();
            }
            close();
        };

        // 添加新通知
        const notify = (
            newTitle: string,
            newMessage: string,
            newType = 'info',
            newActionText = 'OK',
            callback?: () => void
        ) => {
            // 检查队列中是否已有相同消息
            const isDuplicate = notificationQueue.some(item =>
                item.title === newTitle && item.message === newMessage);

            // 如果当前正在显示相同消息，也视为重复
            const isCurrentlyShowing =
                isDisplayingNotification &&
                title.value === newTitle &&
                message.value === newMessage;

            if (isDuplicate || isCurrentlyShowing) {
                return; // 跳过重复消息
            }

            notificationQueue.push({
                title: newTitle,
                message: newMessage,
                type: newType,
                actionText: newActionText,
                callback
            });

            processQueue();
        };

        // 提供全局访问方法
        if (typeof window !== 'undefined') {
            (window as any).$notify = notify;
        }

        return {
            show,
            title,
            message,
            type,
            icon,
            actionText,
            close,
            handleAction
        };
    }
});
</script>
