<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="flex items-center justify-center">
                        <Icon icon="line-md:loading-loop" class="w-12 h-12 text-blue-600" />
                    </div>
                </div>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ message }}</h2>
                <p class="text-gray-600">{{ subMessage }}</p>
                <div v-if="showDebug" class="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
                    <pre>{{ debugInfo }}</pre>
                </div>
                <!-- Only show the button if the user is logged in and in development mode -->
                <div v-if="showManualLogin" class="mt-4">
                    <button @click="handleManualLogin" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { casdoorService } from '@/services/auth';
import Cookies from 'js-cookie';

export default defineComponent({
    name: 'CallbackView',
    setup() {
        const router = useRouter();
        const message = ref('Logging in...');
        const subMessage = ref('Please wait while we process your login request');
        const showDebug = ref(false);
        const debugInfo = ref('');
        const showManualLogin = ref(false);
        const tokenData = ref<any>(null);

        // 调试函数 - 检查令牌状态
        const checkTokenStatus = () => {
            const cookieToken = Cookies.get('casdoor-token');
            const localStorageToken = localStorage.getItem('casdoor-token');
            
            const info = {
                cookieToken: cookieToken ? 'Exists' : 'Does not exist',
                localStorageToken: localStorageToken ? 'Exists' : 'Does not exist',
                isLoggedIn: casdoorService.isLoggedIn() ? 'Yes' : 'No',
                url: window.location.href,
                hasHash: !!window.location.hash,
                hasCode: new URLSearchParams(window.location.search).has('code'),
                userAgent: navigator.userAgent
            };
            
            debugInfo.value = JSON.stringify(info, null, 2);
            return info;
        };

        // 直接从 URL 参数中提取令牌
        const extractTokenFromUrl = () => {
            // 检查 URL 查询参数中是否有 token
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const refreshToken = urlParams.get('refresh_token');
            
            if (token) {
                console.log('Found token in URL query params');
                return {
                    access_token: token,
                    refresh_token: refreshToken || undefined,
                    token_type: 'Bearer',
                    expires_in: 604800, // 默认 7 天
                };
            }
            
            return null;
        };

        // Function to handle manual token storage
        const handleManualTokenStorage = () => {
            try {
                // 首先检查 URL 查询参数
                const queryTokens = extractTokenFromUrl();
                if (queryTokens) {
                    tokenData.value = queryTokens;
                    return true;
                }
                
                // 然后检查 URL hash 参数
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                
                // Check if we have access_token in the URL (implicit flow)
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const idToken = hashParams.get('id_token');
                const tokenType = hashParams.get('token_type') || 'Bearer';
                const expiresIn = parseInt(hashParams.get('expires_in') || '3600', 10);
                
                if (accessToken) {
                    console.log('Found tokens in URL hash, storing manually');
                    
                    // Create token response object
                    tokenData.value = {
                        access_token: accessToken,
                        refresh_token: refreshToken || undefined,
                        id_token: idToken || undefined,
                        token_type: tokenType,
                        expires_in: expiresIn,
                        scope: hashParams.get('scope') || 'profile'
                    };
                    
                    return true;
                }
                
                return false;
            } catch (error) {
                console.error('Error handling manual token storage:', error);
                return false;
            }
        };

        // 手动登录处理
        const handleManualLogin = async () => {
            try {
                if (tokenData.value) {
                    // 直接存储到 localStorage
                    localStorage.setItem('casdoor-token', tokenData.value.access_token);
                    if (tokenData.value.refresh_token) {
                        localStorage.setItem('casdoor-refresh-token', tokenData.value.refresh_token);
                    }
                    
                    // 尝试同时存储到 cookie
                    try {
                        Cookies.set('casdoor-token', tokenData.value.access_token, { 
                            expires: 7,
                            path: '/'
                        });
                        if (tokenData.value.refresh_token) {
                            Cookies.set('casdoor-refresh-token', tokenData.value.refresh_token, {
                                expires: 7,
                                path: '/'
                            });
                        }
                    } catch (e) {
                        console.warn('Failed to set cookies, but tokens are stored in localStorage');
                    }
                    
                    message.value = 'Login successful!';
                    subMessage.value = 'Redirecting to dashboard...';
                    
                    // 重新检查令牌状态
                    checkTokenStatus();
                    
                    // 重定向到仪表板
                    setTimeout(() => {
                        router.push({ path: '/dashboard' });
                    }, 1000);
                } else {
                    // 如果没有令牌数据，尝试从 URL 中获取授权码并交换令牌
                    const urlParams = new URLSearchParams(window.location.search);
                    const code = urlParams.get('code');
                    
                    if (code) {
                        // 使用 SDK 交换令牌
                        await casdoorService.signin();
                        
                        message.value = 'Login successful!';
                        subMessage.value = 'Redirecting to dashboard...';
                        
                        // 重定向到仪表板
                        setTimeout(() => {
                            router.push({ path: '/dashboard' });
                        }, 1000);
                    } else {
                        throw new Error('No authorization code or token found');
                    }
                }
            } catch (error) {
                console.error('Manual login error:', error);
                message.value = 'Failed to log in';
                subMessage.value = 'Please try again or contact the administrator';
                showDebug.value = true;
            }
        };

        onMounted(async () => {
            try {
                // 检查令牌状态
                const tokenStatus = checkTokenStatus();
                console.log('Initial token status:', tokenStatus);
                
                // First try to handle tokens from URL
                const manuallyHandled = handleManualTokenStorage();
                
                if (manuallyHandled && tokenData.value) {
                    // 直接存储到 localStorage
                    localStorage.setItem('casdoor-token', tokenData.value.access_token);
                    if (tokenData.value.refresh_token) {
                        localStorage.setItem('casdoor-refresh-token', tokenData.value.refresh_token);
                    }
                    
                    // 尝试同时存储到 cookie
                    try {
                        Cookies.set('casdoor-token', tokenData.value.access_token, { 
                            expires: 7,
                            path: '/'
                        });
                        if (tokenData.value.refresh_token) {
                            Cookies.set('casdoor-refresh-token', tokenData.value.refresh_token, {
                                expires: 7,
                                path: '/'
                            });
                        }
                    } catch (e) {
                        console.warn('Failed to set cookies, but tokens are stored in localStorage');
                    }
                } else {
                    // If not handled manually, use the SDK to exchange code for token
                    message.value = 'Processing login...';
                    
                    // 检查 URL 中是否有 code 参数
                    const urlParams = new URLSearchParams(window.location.search);
                    const hasCode = urlParams.has('code');
                    
                    if (hasCode) {
                        try {
                            await casdoorService.signin();
                        } catch (error) {
                            console.error('Error during signin:', error);
                            // 显示手动登录按钮
                            showManualLogin.value = true;
                            message.value = 'Authentication failed';
                            subMessage.value = 'Please click the button below to try again.';
                            showDebug.value = true;
                            return;
                        }
                    } else {
                        // 如果没有 code 参数，可能是直接访问了回调页面
                        throw new Error('No authorization code found in URL');
                    }
                }
                
                // 再次检查令牌状态
                const finalTokenStatus = checkTokenStatus();
                console.log('Final token status:', finalTokenStatus);
                
                if (casdoorService.isLoggedIn()) {
                    message.value = 'Login successful!';
                    subMessage.value = 'Redirecting to dashboard...';
                    
                    // Redirect to dashboard after successful login
                    setTimeout(() => {
                        router.push({ path: '/dashboard' });
                    }, 1000);
                } else {
                    message.value = 'Login process completed, but no valid token detected';
                    subMessage.value = 'Please check the debug information below or contact the administrator';
                    showDebug.value = true;
                    showManualLogin.value = true;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                message.value = 'Login failed';
                subMessage.value = 'Please try again or contact the administrator';
                showDebug.value = true;
                showManualLogin.value = true;
                
                // Redirect to login page after delay
                setTimeout(() => {
                    router.push({ path: '/login' });
                }, 5000);
            }
        });

        return {
            message,
            subMessage,
            showDebug,
            debugInfo,
            showManualLogin,
            handleManualLogin
        };
    }
});
</script>