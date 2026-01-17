declare module '@/config/navigation' {
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

    export const sidebarNavItems: NavItem[];
    export const breadcrumbMap: Record<string, BreadcrumbItem>;
    export const navigationConfig: {
        sidebarNavItems: NavItem[];
        breadcrumbMap: Record<string, BreadcrumbItem>;
    };

    export default navigationConfig;
}
