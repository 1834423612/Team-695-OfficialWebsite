import { createApp } from 'vue';
import pinia, { configureStores } from './stores';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { Icon } from '@iconify/vue';

const app = createApp(App);

app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);

// Configure stores after pinia is installed
configureStores();

app.component('Icon', Icon);
app.mount('#app');
