<template>
    <div class="avatar-container" :style="containerStyle">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="alt" class="avatar-image"
            :class="{ 'rounded-full': rounded, 'border': border }" @error="handleImageError" v-bind="$attrs"
            @load="handleImageLoaded" />
        <div v-else class="avatar-fallback" :class="{ 'rounded-full': rounded }" :style="fallbackStyle">
            <span>{{ initials }}</span>
        </div>
        <div v-if="loading" class="avatar-loading">
            <div class="spinner"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, onMounted, watch } from 'vue';
import { avatarCache } from '@/services/avatarCache';

export default defineComponent({
    name: 'CachedAvatar',
    inheritAttrs: false,
    props: {
        userId: {
            type: String,
            required: true
        },
        src: {
            type: String as PropType<string | null | undefined>,
            default: null
        },
        size: {
            type: [Number, String],
            default: 40
        },
        alt: {
            type: String,
            default: 'User Avatar'
        },
        name: {
            type: String,
            default: ''
        },
        firstName: {
            type: String,
            default: ''
        },
        lastName: {
            type: String,
            default: ''
        },
        displayName: {
            type: String,
            default: ''
        },
        rounded: {
            type: Boolean,
            default: true
        },
        border: {
            type: Boolean,
            default: false
        },
        bgColor: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        // 状态
        const avatarSrc = ref<string | null>(null);
        const loading = ref(true);
        const loadFailed = ref(false);

        // 计算样式
        const containerStyle = computed(() => ({
            width: typeof props.size === 'number' ? `${props.size}px` : props.size,
            height: typeof props.size === 'number' ? `${props.size}px` : props.size
        }));

        const fallbackStyle = computed(() => {
            const style: Record<string, string> = {
                width: typeof props.size === 'number' ? `${props.size}px` : props.size,
                height: typeof props.size === 'number' ? `${props.size}px` : props.size,
                fontSize: typeof props.size === 'number' ? `${Math.floor(Number(props.size) / 2.5)}px` : '16px'
            };

            if (props.bgColor) {
                style.backgroundColor = props.bgColor;
            } else {
                // 根据用户ID生成颜色
                const hash = Math.abs(hashCode(props.userId));
                const hue = hash % 360;
                style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
            }

            return style;
        });

        // 优化的首字母生成逻辑，优先使用firstName和lastName
        const initials = computed(() => {
            // 如果有firstName和lastName，使用两者首字母
            if (props.firstName && props.lastName) {
                return (props.firstName.charAt(0) + props.lastName.charAt(0)).toUpperCase();
            }
            
            // 如果只有displayName，尝试拆分并使用首尾词的首字母
            if (props.displayName) {
                const parts = props.displayName.trim().split(/\s+/);
                if (parts.length >= 2) {
                    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                }
                return props.displayName.substring(0, 2).toUpperCase();
            }
            
            // 如果有name属性，使用name的前两个字母
            if (props.name) {
                const parts = props.name.trim().split(/\s+/);
                if (parts.length >= 2) {
                    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                }
                return props.name.substring(0, 2).toUpperCase();
            }

            // 如果都没有，使用用户ID前两个字符（降级方案）
            return props.userId.substring(0, 2).toUpperCase();
        });

        // 加载头像
        const loadAvatar = async () => {
            loading.value = true;
            loadFailed.value = false;

            if (!props.userId) {
                loading.value = false;
                return;
            }

            try {
                // 构建用户信息对象，用于生成默认头像
                const userInfo = {
                    firstName: props.firstName,
                    lastName: props.lastName,
                    displayName: props.displayName,
                    name: props.name
                };

                console.log(`Loading avatar for ${props.userId} with src: ${props.src || 'none'}`);
                
                // 如果提供了src，优先使用
                if (props.src) {
                    // 显示日志以便调试
                    console.log(`Avatar URL provided: ${props.src}`);
                    
                    try {
                        // 将用户信息传递给getAvatar以便生成默认头像
                        const cachedSrc = await avatarCache.getAvatar(props.userId, props.src, userInfo);
                        avatarSrc.value = cachedSrc;
                        loading.value = false;
                        console.log(`Avatar loaded from source: ${props.src.substring(0, 30)}...`);
                    } catch (error) {
                        console.error('Failed to load avatar from source:', error);
                        loadFailed.value = true;
                        // 如果从源加载失败，尝试使用默认头像
                        const cachedFallback = await avatarCache.getAvatar(props.userId, undefined, userInfo);
                        avatarSrc.value = cachedFallback;
                        loading.value = false;
                    }
                } else {
                    // 没有提供URL，使用用户信息生成默认头像
                    console.log(`No avatar URL provided, generating default for ${props.userId}`);
                    const defaultSrc = await avatarCache.getAvatar(props.userId, undefined, userInfo);
                    avatarSrc.value = defaultSrc;
                    loading.value = false;
                }
            } catch (error) {
                console.error('Failed to load avatar:', error);
                loadFailed.value = true;
                avatarSrc.value = null;
                loading.value = false;
            }
        };

        // 处理图片加载错误
        const handleImageError = () => {
            console.warn(`Avatar image failed to load for user: ${props.userId}`);
            loadFailed.value = true;
            avatarSrc.value = null;
            
            // 当图片加载失败时，使用默认头像
            const userInfo = {
                firstName: props.firstName,
                lastName: props.lastName,
                displayName: props.displayName,
                name: props.name
            };
            
            // 获取默认头像并显示
            avatarCache.getAvatar(props.userId, undefined, userInfo).then(defaultSrc => {
                avatarSrc.value = defaultSrc;
                loading.value = false;
            }).catch(error => {
                console.error('Failed to generate default avatar:', error);
                loading.value = false;
            });
        };

        // 处理图片加载完成
        const handleImageLoaded = () => {
            loading.value = false;
        };

        // 辅助函数：计算字符串的哈希值
        const hashCode = (str: string): number => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return hash;
        };

        // 监听属性变化，包括所有可能影响头像的属性
        watch(
            () => [props.userId, props.src, props.firstName, props.lastName, props.displayName, props.name],
            () => {
                console.log(`Avatar props changed for ${props.userId}`);
                loadAvatar();
            }
        );

        // 组件挂载时初始化
        onMounted(() => {
            console.log(`CachedAvatar mounted for ${props.userId}`);
            
            // 确保缓存服务已初始化
            if (!avatarCache.isInitialized()) {
                avatarCache.init();
            }
            
            loadAvatar();
        });

        return {
            avatarSrc,
            loading,
            containerStyle,
            fallbackStyle,
            initials,
            handleImageError,
            handleImageLoaded
        };
    }
});
</script>

<style scoped>
.avatar-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-image.border {
    border: 2px solid #f0f0f0;
}

.avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #6b7280;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
}

.avatar-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.7);
}

.spinner {
    width: 60%;
    height: 60%;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.rounded-full {
    border-radius: 9999px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
