// src/types.ts
export interface MenuItem {
    name: string;
    link: string;
}

export interface MenuItemProps {
    menuItems: MenuItem[];
    isDesktop: boolean;
}