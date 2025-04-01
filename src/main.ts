import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/globals.css';
import { Icon } from '@iconify/vue';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);
app.component('Icon', Icon);
app.mount('#app');
