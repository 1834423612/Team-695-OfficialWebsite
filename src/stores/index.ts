import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useUserStore, type UserStoreState } from './userStore';

// Create the Pinia instance
const pinia = createPinia();

// Add the persistence plugin
pinia.use(piniaPluginPersistedstate);

// Export the pinia instance
export default pinia;

// Configure persistence for the user store
export const configureStores: () => { userStore: UserStoreState } = () => {
    const userStore = useUserStore();

    // You can add any additional store configuration here

    return {
        userStore
    };
};