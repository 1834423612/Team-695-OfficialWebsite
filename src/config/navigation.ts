/**
 * Navigation configuration for the dashboard
 * This file centralizes all navigation-related configuration
 */

// Type definitions for navigation items
export interface NavItem {
    path: string;  // For parent menus, this value can be an empty string (but the field must still exist)
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
    children?: NavItem[];
    exact?: boolean; // Add an exact-match option to fix child-route highlighting
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
        section: 'main',
        exact: true // Exact match
    },
    // {
    //     path: '/Dashboard/Calendar',
    //     text: 'Calendar',
    //     icon: 'mdi:calendar',
    //     section: 'main'
    // },

    // Scouting section
    {
        path: '/Dashboard/Assignments',
        text: 'Assignments',
        icon: 'mdi:calendar-check',
        section: 'scouting'
    },
    {
        path: '', // Remove the parent menu path to avoid conflicts with child menus
        text: 'Pit Scouting',
        icon: 'mdi:clipboard-text',
        section: 'scouting',
        children: [
            {
                path: '/Dashboard/Pit-Scouting',
                text: 'Pit Scouting Form',
                icon: 'mdi:clipboard-text',
                section: 'scouting',
                exact: true // Keep exact matching to avoid conflicts with the Admin page
            },
            {
                path: '/Dashboard/Pit-Scouting/Admin',
                text: 'Admin Dashboard',
                icon: 'mdi:shield-account',
                section: 'scouting',
                exact: true, // Keep exact matching
                adminOnly: true
            }
        ]
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
        path: '/Dashboard/System/Version',
        text: 'Version Info',
        icon: 'mdi:information-outline',
        section: 'external',
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
    '/Dashboard/Assignments': { name: 'Assignments', icon: 'mdi:calendar-check', path: '/Dashboard/Assignments' },
    '/Dashboard/Pit-Scouting': { name: 'Pit Scouting Form', icon: 'mdi:clipboard-text', path: '/Dashboard/Pit-Scouting' },
    '/Dashboard/Pit-Scouting/Admin': { name: 'Pit Scouting Admin', icon: 'mdi:shield-account', path: '/Dashboard/Pit-Scouting/Admin' },
    '/Dashboard/Calendar': { name: 'Calendar', icon: 'mdi:calendar', path: '/Dashboard/Calendar' },
};

// Export all configurations
export const navigationConfig = {
    sidebarNavItems,
    breadcrumbMap
};

export default navigationConfig;
