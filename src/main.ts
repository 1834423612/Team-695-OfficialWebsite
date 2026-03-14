import { createApp } from 'vue';
import pinia, { configureStores } from './stores';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { lazyLoad } from './directives/lazyLoad';

const app = createApp(App);

// Enable the avatar cache debugging tool in development
if (process.env.NODE_ENV === 'development') {
    import('@/utils/avatarDebug').catch(e => {
        console.warn('Failed to load avatar debug tool:', e);
    });
}

// Load the avatar cache debugging tool in development
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

// Delay global component registration to avoid blocking the initial load
// The Icon component is imported on demand instead of being registered globally
// Global components are now imported locally where they are used

app.mount('#app');

// Remove the loading screen
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}, 100);
