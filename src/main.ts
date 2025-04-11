import { createApp } from 'vue';
import pinia, { configureStores } from './stores';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { Icon } from '@iconify/vue';
import { lazyLoad } from './directives/lazyLoad';

const app = createApp(App);

// Register global directives
app.directive('lazyLoad', lazyLoad);

app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);

// Configure stores after pinia is installed
configureStores();

app.component('Icon', Icon);
app.mount('#app');
