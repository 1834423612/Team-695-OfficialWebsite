/**
 * Navigation configuration for the dashboard
 * This file centralizes all navigation-related configuration
 */

// Type definitions for navigation items
export interface NavItem {
    path: string;
    text: string;
    icon: string;
    section: 'main' | 'scouting' | 'user' | 'external';
    adminOnly?: boolean;
    isExternalLink?: boolean;
    targetBlank?: boolean;
    badge?: {
        text: string;
        color: string;
    };
}

export interface BreadcrumbItem {
    path: string;
    name: string;
    icon: string;
}

// Sidebar navigation items
export const sidebarNavItems: NavItem[] = [
    // Main section
    {
        path: '/Dashboard',
        text: 'Dashboard',
        icon: 'mdi:view-dashboard',
        section: 'main'
    },
    // {
    //     path: '/Dashboard/Calendar',
    //     text: 'Calendar',
    //     icon: 'mdi:calendar',
    //     section: 'main'
    // },

    // Scouting section
    {
        path: '/Dashboard/Pit-Scouting',
        text: 'Pit Scouting',
        icon: 'mdi:clipboard-text',
        section: 'scouting'
    },
    {
        path: '/Dashboard/Assignments',
        text: 'Assignments',
        icon: 'mdi:calendar-check',
        section: 'scouting'
    },
    {
        path: '/Dashboard/Pit-Scouting/Admin',
        text: 'Admin Panel',
        icon: 'mdi:shield-account',
        section: 'scouting',
        adminOnly: true
    },

    // User settings section
    {
        path: '/Dashboard/Profile',
        text: 'Profile',
        icon: 'mdi:account-circle',
        section: 'user'
    },
    {
        path: '/Dashboard/API',
        text: 'API Keys',
        icon: 'mdi:api',
        section: 'user'
    },

    // External links
    {
        path: '/',
        text: 'Main Website',
        icon: 'mdi:home',
        section: 'external',
        isExternalLink: true
    },
    {
        path: 'https://api.team695.com/api-docs/',
        text: 'API Docs',
        icon: 'mdi:book-open-variant',
        section: 'external',
        isExternalLink: true,
        targetBlank: true
    }
];

// Breadcrumb mapping
export const breadcrumbMap: Record<string, BreadcrumbItem> = {
    '/Dashboard/Profile': { name: 'Profile', icon: 'mdi:account-circle', path: '/Dashboard/Profile' },
    '/Dashboard/API': { name: 'API', icon: 'mdi:api', path: '/Dashboard/API' },
    '/Dashboard/Pit-Scouting': { name: 'Pit Scouting', icon: 'mdi:clipboard-text', path: '/Dashboard/Pit-Scouting' },
    '/Dashboard/Pit-Scouting/Admin': { name: 'Pit Scouting Admin', icon: 'mdi:shield-account', path: '/Dashboard/Pit-Scouting/Admin' },
    '/Dashboard/Calendar': { name: 'Calendar', icon: 'mdi:calendar', path: '/Dashboard/Calendar' },
    '/Dashboard/Assignments': { name: 'Assignments', icon: 'mdi:calendar-check', path: '/Dashboard/Assignments' },
};

// Export all configurations
export const navigationConfig = {
    sidebarNavItems,
    breadcrumbMap
};

export default navigationConfig;
