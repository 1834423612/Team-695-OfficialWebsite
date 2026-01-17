import { createApp } from 'vue';
import pinia, { configureStores } from './stores';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { lazyLoad } from './directives/lazyLoad';

const app = createApp(App);

// 在开发环境中启用头像缓存调试工具
if (process.env.NODE_ENV === 'development') {
    import('@/utils/avatarDebug').catch(e => {
        console.warn('Failed to load avatar debug tool:', e);
    });
}

// 在开发环境中加载头像缓存调试工具
if (process.env.NODE_ENV === 'development') {
    import('./utils/avatarCacheDebug').catch(e => {
        console.warn('Failed to load avatar cache debugger:', e);
    });
}

// Register global directives
app.directive('lazyLoad', lazyLoad);

app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);

// Configure stores after pinia is installed
configureStores();

// 延迟注册全局组件，避免阻塞初始加载
// Icon组件按需导入，不再全局注册
// 全局组件改为在各自使用的地方局部导入

app.mount('#app');

// 移除加载屏幕
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}, 100);
