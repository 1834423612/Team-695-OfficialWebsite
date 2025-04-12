import { createApp } from 'vue';
import pinia, { configureStores } from './stores';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { Icon } from '@iconify/vue';
import { lazyLoad } from './directives/lazyLoad';
import ApiErrorHandler from '@/components/global/ApiErrorHandler.vue';

const app = createApp(App);

// 在开发环境中启用头像缓存调试工具
if (process.env.NODE_ENV === 'development') {
    import('@/utils/avatarDebug');
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

app.component('Icon', Icon);

// 添加全局API错误处理组件
app.component('ApiErrorHandler', ApiErrorHandler);

app.mount('#app');
