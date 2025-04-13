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
        // State
        const avatarSrc = ref<string | null>(null);
        const loading = ref(true);
        const loadFailed = ref(false);

        // Computed styles
        const containerStyle = computed(() => ({
            width: typeof props.size === 'number' ? `${props.size}px` : props.size,
            height: typeof props.size === 'number' ? `${props.size}px` : props.size
        }));

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
                let seed = props.displayName || props.name || props.firstName || '';
                if (!seed) {
                    // 如果没有名字相关信息，再回退到userId
                    seed = props.userId;
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
            
            // Last resort: use userId
            return props.userId.substring(0, 2).toUpperCase();
        });

        // Load avatar
        const loadAvatarImpl = async () => {
            loading.value = true;
            loadFailed.value = false;
            
            try {
                // Always use userId for cache key
                const url = props.src;
                
                // If no src provided or previous load failed, use default
                if (!url || loadFailed.value) {
                    // Use avatar cache to either get cached image or generate default
                    const cachedAvatar = await avatarCache.getAvatar(
                        props.userId, 
                        undefined,
                        {
                            firstName: props.firstName,
                            lastName: props.lastName,
                            displayName: props.displayName,
                            name: props.name
                        },
                        true // Cache only mode - don't fetch new images
                    );
                    
                    avatarSrc.value = cachedAvatar;
                    loading.value = false;
                    return;
                }
                
                // Try to get from cache first, passing user info for better default avatar
                const cachedAvatar = await avatarCache.getAvatar(
                    props.userId, 
                    url,
                    {
                        firstName: props.firstName,
                        lastName: props.lastName,
                        displayName: props.displayName,
                        name: props.name
                    }
                );
                
                avatarSrc.value = cachedAvatar;
            } catch (error) {
                console.error('Error loading avatar:', error);
                loadFailed.value = true;
                // On error, use fallback
                avatarSrc.value = null;
            } finally {
                loading.value = false;
            }
        };

        // Use throttle wrapper for loading function, limiting to once per 300ms
        const loadAvatar = throttle(loadAvatarImpl, 300);

        // Handle image loading error
        const handleImageError = () => {
            console.warn(`Avatar load failed for user: ${props.displayName || props.name || props.userId}`);
            loadFailed.value = true;
            avatarSrc.value = null;
        };

        // Handle image loaded successfully
        const handleImageLoaded = () => {
            loading.value = false;
        };

        // Helper function: compute hash code for a string
        const hashCode = (str: string): number => {
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
                () => props.userId,
                () => props.src,
                () => props.firstName,
                () => props.lastName,
                () => props.displayName,
                () => props.name
            ],
            () => {
                loadAvatar();
            },
            { immediate: false }
        );

        // Initialize on component mount
        onMounted(() => {
            loadAvatar();
        });

        return {
            avatarSrc,
            loading,
            containerStyle,
            fallbackStyle,
            initials,
            handleImageError,
            handleImageLoaded,
            hashCode
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
