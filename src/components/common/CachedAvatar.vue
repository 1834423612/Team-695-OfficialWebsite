<template>
    <div class="avatar-container" :style="containerStyle">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="alt" class="avatar-image"
            :class="{ 'rounded-full': rounded, 'border': border }" @error="handleImageError" v-bind="$attrs"
            @load="handleImageLoaded" />
        <div v-if="!avatarSrc && !loading" class="avatar-fallback" :class="{ 'rounded-full': rounded }" :style="fallbackStyle">
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
import { logger } from '@/utils/logger'; // 导入logger工具

// Helper function for throttling
function throttle(fn: Function, delay: number): (...args: any[]) => void {
    let lastCall = 0;
    let timeoutId: number | null = null;

    return function (...args: any[]) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else if (!timeoutId) {
            // Set a delayed execution to ensure the function eventually gets called
            timeoutId = window.setTimeout(() => {
                fn(...args);
            }, delay - timeSinceLastCall);
        }
    };
}

// Environment detection
// const isDevelopment = process.env.NODE_ENV === 'development';

export default defineComponent({
    name: 'CachedAvatar',
    inheritAttrs: false,
    props: {
        userId: {
            type: String,
            required: false,
            default: '' // 将required改为false，允许不提供userId
        },
        initial: {
            type: String,
            default: '' // 添加新的initial属性
        },
        src: {
            type: String as PropType<string | null | undefined>,
            default: null
        },
        size: {
            type: [Number, String],
            default: 32
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
    setup(props, { expose }) {
        // State
        const avatarSrc = ref<string | null>(null);
        const loading = ref(true);
        const loadFailed = ref(false);

        // Computed styles
        const containerStyle = computed(() => ({
            width: typeof props.size === 'number' ? `${props.size}px` : props.size,
            height: typeof props.size === 'number' ? `${props.size}px` : props.size
        }));

        // 修改有效ID的计算属性，优先使用userId
        const effectiveId = computed(() => {
            // 确保先使用实际的userId作为缓存键，而不是initial
            if (props.userId && props.userId.length > 2) {
                return props.userId;
            }
            // 只有在没有userId的情况下，才使用initial作为备用
            return props.userId || props.initial || 'default';
        });

        const fallbackStyle = computed(() => {
            const style: Record<string, string> = {
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: typeof props.size === 'number' ? `${Math.max(props.size / 2.5, 12)}px` : '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
            };

            if (props.bgColor) {
                style.backgroundColor = props.bgColor;
            } else {
                // Generate background color based on user ID for consistency
                let seed = props.displayName || props.name || props.firstName || props.initial || '';
                if (!seed) {
                    // 如果没有名字相关信息，再回退到userId，确保seed不为undefined
                    seed = props.userId || 'default';
                }
                
                const hash = hashCode(seed);
                const hue = hash % 360;
                style.backgroundColor = `hsl(${hue}, 70%, 75%)`;
                style.color = hue > 210 && hue < 330 ? '#fff' : '#333';
            }

            return style;
        });

        // Optimized initials generation logic, prioritizing firstName and lastName
        const initials = computed(() => {
            // First try using firstName and lastName
            if (props.firstName && props.lastName) {
                return `${props.firstName[0]}${props.lastName[0]}`.toUpperCase();
            }
            
            // Then try using displayName, possibly splitting on whitespace
            if (props.displayName) {
                const parts = props.displayName.trim().split(/\s+/);
                if (parts.length >= 2) {
                    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                }
                return props.displayName.substring(0, 2).toUpperCase();
            }
            
            // Fall back to name if available
            if (props.name) {
                const parts = props.name.trim().split(/\s+/);
                if (parts.length >= 2) {
                    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                }
                return props.name.substring(0, 2).toUpperCase();
            }
            
            // Last resort: use userId (保证不会是undefined)
            return (props.userId || 'XX').substring(0, 2).toUpperCase();
        });

        // 增加：导出获取用户首字母的函数 
        // 这可以被外部组件通过ref调用
        const getUserInitials = (userInfo?: {
            firstName?: string,
            lastName?: string,
            displayName?: string,
            name?: string,
            userId?: string
        }): string => {
            // 首先使用传入的信息
            if (userInfo) {
                // 优先尝试firstName + lastName
                if (userInfo.firstName && userInfo.lastName) {
                    return `${userInfo.firstName[0]}${userInfo.lastName[0]}`.toUpperCase();
                }
                
                // 然后尝试displayName
                if (userInfo.displayName) {
                    const parts = userInfo.displayName.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                    }
                    return userInfo.displayName.substring(0, 2).toUpperCase();
                }
                
                // 然后是name
                if (userInfo.name) {
                    const parts = userInfo.name.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                    }
                    return userInfo.name.substring(0, 2).toUpperCase();
                }
                
                // 最后用userId
                if (userInfo.userId) {
                    return userInfo.userId.substring(0, 2).toUpperCase();
                }
            }
            
            // 如果没有传入信息，使用组件自身的属性
            return initials.value;
        };

        // 修改loadAvatarImpl方法，确保总是返回某种头像
        const loadAvatarImpl = async () => {
            loading.value = true;
            loadFailed.value = false;
            
            try {
                const url = props.src;
                const cacheId = effectiveId.value;
                
                logger.debug(`Loading avatar for ${props.userId ? 'userId: ' + props.userId : 'initial: ' + props.initial}${url ? ` with URL: ${url}` : ' (no URL)'}`);
                
                // 始终尝试获取头像，无论有没有URL
                const cachedAvatar = await avatarCache.getAvatar(
                    cacheId, 
                    url || undefined,
                    {
                        firstName: props.firstName,
                        lastName: props.lastName,
                        displayName: props.displayName,
                        name: props.name,
                        initial: props.initial
                    },
                    !url // 如果没有URL，则使用cacheOnly模式
                );
                
                avatarSrc.value = cachedAvatar;
                loading.value = false;
                
                if (url) {
                    logger.debug(`${cachedAvatar === url ? 'Using original' : 'Using cached'} avatar for ${cacheId}`);
                } else {
                    logger.debug(`Generated default avatar for ${cacheId}`);
                }
            } catch (error) {
                logger.error(`Error loading avatar for ${effectiveId.value}:`, error);
                loadFailed.value = true;
                avatarSrc.value = null;
            } finally {
                loading.value = false;
            }
        };

        // Use throttle wrapper for loading function, limiting to once per 300ms
        const loadAvatar = throttle(loadAvatarImpl, 300);

        // Handle image loading error
        const handleImageError = () => {
            logger.warn(`Avatar image load failed for: ${props.displayName || props.name || props.initial || props.userId || 'unknown'}`);
            loadFailed.value = true;
            avatarSrc.value = null;
            
            // 错误时重新尝试加载默认头像
            if (effectiveId.value) {
                avatarCache.getAvatar(
                    effectiveId.value, 
                    undefined, 
                    {
                        firstName: props.firstName,
                        lastName: props.lastName,
                        displayName: props.displayName,
                        name: props.name,
                        initial: props.initial
                    },
                    true
                ).then(defaultAvatar => {
                    avatarSrc.value = defaultAvatar;
                }).catch(() => {
                    // 如果获取默认头像也失败，保持avatarSrc为null
                });
            }
        };

        // Handle image loaded successfully
        const handleImageLoaded = () => {
            logger.debug(`Avatar loaded successfully for: ${props.displayName || props.name || props.initial || props.userId || 'unknown'}`);
            loading.value = false;
        };

        // Helper function: compute hash code for a string
        const hashCode = (str: string): number => {
            // 防御性编程: 确保str不为undefined或null
            if (!str) {
                return 0; // 返回默认值
            }
            
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash);
        };

        // Watch for property changes, including all props that might affect the avatar
        watch(
            [
                () => effectiveId.value, // 监听计算出的effectiveId
                () => props.src,
                () => props.firstName,
                () => props.lastName,
                () => props.displayName,
                () => props.name,
                () => props.initial
            ],
            () => {
                // 只有当effectiveId存在时才加载头像
                if (effectiveId.value) {
                    loadAvatar();
                }
            },
            { immediate: false }
        );

        // Initialize on component mount
        onMounted(() => {
            // 只有当effectiveId存在时才加载头像
            if (effectiveId.value) {
                loadAvatar();
            }
            
            // 如果有URL，则添加到预加载队列中
            if (props.src) {
                // 使用Image对象预加载
                const img = new Image();
                img.src = props.src;
                img.onload = () => {
                    logger.debug(`Preloaded image: ${props.src}`);
                };
            }
        });

        // 将getUserInitials方法暴露给父组件
        expose({
            getUserInitials,
            // 同时导出当前用户的initials便于快速访问
            initials
        });

        return {
            avatarSrc,
            loading,
            effectiveId, // 导出effectiveId
            containerStyle,
            fallbackStyle,
            initials,
            handleImageError,
            handleImageLoaded,
            hashCode,
            getUserInitials // 也返回给template使用
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
    overflow: hidden; /* 确保内容不超出容器 */
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
