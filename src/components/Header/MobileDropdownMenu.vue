<template>
    <!-- Mobile Dropdown Menu --> <!-- class "md:hidden" needed to hide on desktop -->
    <Menu as="div" class="relative md:hidden">
        <div>
            <MenuButton
                class="inline-flex justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/75">
                {{ buttonText }}
                <Icon class="ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" icon="mingcute:menu-fill" aria-hidden="true" />
                <!-- <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" /> -->
            </MenuButton>
        </div>

        <!-- Dropdown Menu Items -->
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 z-20 mt-2 w-28 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5 focus:outline-hidden overflow-hidden">
                <div>
                    <MenuItem v-for="(item, index) in menuItems" :key="index">
                        <router-link :to="item.link"
                            class="block px-4 py-2 text-sm text-gray-900 hover:bg-violet-500 hover:text-white transition-colors"
                            :class="{ 'font-bold bg-violet-500 text-white': currentRoute === item.link }"
                            @click="closeMenu">
                            {{ item.name }}
                        </router-link>
                    </MenuItem>
                    <!-- Horizontal Line -->
                    <!-- <hr class="border-t border-gray-300" /> -->
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
// import { ChevronDownIcon } from '@heroicons/vue/solid';
import { Icon } from '@iconify/vue';

export interface MenuItemProps {
    name: string;
    link: string;
}

export default defineComponent({
    name: 'DropdownMenu',
    components: { 
        Menu, 
        MenuButton, 
        MenuItems, 
        MenuItem, 
        // ChevronDownIcon,
        Icon,
    },
    props: {
        buttonText: {
            type: String,
            required: true,
        },
        menuItems: {
            type: Array as () => MenuItemProps[], // Define the type of the menuItems prop
            required: true,
        },
    },
    data() {
        return {
            isMenuOpen: false, // Track the menu open state
            currentRoute: '', // Track the current route
        };
    },
    methods: {
        closeMenu() {
            this.isMenuOpen = false; // Set the menu open state to false
        },
    },
    mounted() {
        const route = useRoute();

        // Watch for route changes and close the menu
        watch(route, () => {
            this.closeMenu();
            this.currentRoute = route.path;
        });

        // Set the initial route
        this.currentRoute = route.path;
    },
});
</script>

<style scoped>
/* Add smooth transition */
nav {
    transition: max-height 0.3s ease-in-out;
}
</style>