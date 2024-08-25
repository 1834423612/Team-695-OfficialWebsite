<template>
    <!-- Mobile Dropdown Menu --> <!-- class "md:hidden" needed to hide on desktop -->
    <Menu as="div" class="relative md:hidden">
        <div>
            <MenuButton
                class="inline-flex justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                {{ buttonText }}
                <Bars3Icon class="ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
                <!-- <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" /> -->
            </MenuButton>
        </div>

        <!-- Dropdown Menu Items -->
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 z-20 mt-2 w-28 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                <div>
                    <MenuItem v-for="(item, index) in menuItems" :key="index">
                        <router-link :to="item.link"
                            class="block px-4 py-2 text-sm text-gray-900 hover:bg-violet-500 hover:text-white transition-colors"
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
import { defineComponent } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
// import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { Bars3Icon } from "@heroicons/vue/20/solid";

interface MenuItemProps {
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
        Bars3Icon,
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
    methods: {
        closeMenu() {
            // Function to close the mobile menu
        },
    },
});
</script>

<style scoped>
/* Add smooth transition */
nav {
    transition: max-height 0.3s ease-in-out;
}
</style>