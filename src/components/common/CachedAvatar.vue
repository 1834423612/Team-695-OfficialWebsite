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
import { logger } from '@/utils/logger'; // Import the logger utility

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
            default: '' // Set required to false so userId can be omitted
        },
        initial: {
            type: String,
            default: '' // Add the new initial property
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

        // Update the effective-ID computed property to prefer userId
        const effectiveId = computed(() => {
            // Always prefer the real userId as the cache key instead of the initial
            if (props.userId && props.userId.length > 2) {
                return props.userId;
            }
            // Use the initial only as a fallback when no userId is available
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
                    // Fall back to userId when no name information exists so the seed is never undefined
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
            
            // Last resort: use userId (so the result is never undefined)
            return (props.userId || 'XX').substring(0, 2).toUpperCase();
        });

        // Also expose a helper for retrieving user initials 
        // External components can call it through a ref
        const getUserInitials = (userInfo?: {
            firstName?: string,
            lastName?: string,
            displayName?: string,
            name?: string,
            userId?: string
        }): string => {
            // Prefer the passed-in data first
            if (userInfo) {
                // First try firstName + lastName
                if (userInfo.firstName && userInfo.lastName) {
                    return `${userInfo.firstName[0]}${userInfo.lastName[0]}`.toUpperCase();
                }
                
                // Then try displayName
                if (userInfo.displayName) {
                    const parts = userInfo.displayName.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                    }
                    return userInfo.displayName.substring(0, 2).toUpperCase();
                }
                
                // Then try name
                if (userInfo.name) {
                    const parts = userInfo.name.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                    }
                    return userInfo.name.substring(0, 2).toUpperCase();
                }
                
                // Finally fall back to userId
                if (userInfo.userId) {
                    return userInfo.userId.substring(0, 2).toUpperCase();
                }
            }
            
            // If nothing was passed in, use the component's own props
            return initials.value;
        };

        // Update loadAvatarImpl to always return some kind of avatar
        const loadAvatarImpl = async () => {
            loading.value = true;
            loadFailed.value = false;
            
            try {
                const url = props.src;
                const cacheId = effectiveId.value;
                
                logger.debug(`Loading avatar for ${props.userId ? 'userId: ' + props.userId : 'initial: ' + props.initial}${url ? ` with URL: ${url}` : ' (no URL)'}`);
                
                // Always try to fetch an avatar, regardless of whether a URL exists
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
                    !url // Use cacheOnly mode when no URL exists
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
            
            // Retry with the default avatar if an error occurs
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
                    // Leave avatarSrc as null if even the default avatar fails
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
            // Defensive guard: make sure str is not undefined or null
            if (!str) {
                return 0; // Return the default value
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
                () => effectiveId.value, // Watch the computed effectiveId
                () => props.src,
                () => props.firstName,
                () => props.lastName,
                () => props.displayName,
                () => props.name,
                () => props.initial
            ],
            () => {
                // Load the avatar only when effectiveId exists
                if (effectiveId.value) {
                    loadAvatar();
                }
            },
            { immediate: false }
        );

        // Initialize on component mount
        onMounted(() => {
            // Load the avatar only when effectiveId exists
            if (effectiveId.value) {
                loadAvatar();
            }
            
            // Add it to the preload queue when a URL exists
            if (props.src) {
                // Preload it with an Image object
                const img = new Image();
                img.src = props.src;
                img.onload = () => {
                    logger.debug(`Preloaded image: ${props.src}`);
                };
            }
        });

        // Expose getUserInitials to parent components
        expose({
            getUserInitials,
            // Also expose the current user's initials for quick access
            initials
        });

        return {
            avatarSrc,
            loading,
            effectiveId, // Expose effectiveId
            containerStyle,
            fallbackStyle,
            initials,
            handleImageError,
            handleImageLoaded,
            hashCode,
            getUserInitials // Also return it for template usage
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
    overflow: hidden; /* Ensure content does not overflow the container */
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

