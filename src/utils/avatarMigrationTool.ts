/**
 * Avatar cache migration utility
 * Fixes legacy cache entries that used initials instead of real user IDs
 */

import { logger } from '@/utils/logger';

export class AvatarMigrationTool {
    // Mapping from known user initials to IDs
    private static knownUserMap: Record<string, string> = {};
    
    /**
     * Register a user mapping
     * @param initial User initials
     * @param userId Real user ID
     */
    public static registerUserIdMapping(initial: string, userId: string): void {
        if (!initial || !userId) return;
        
        this.knownUserMap[initial] = userId;
        logger.debug(`Registered user mapping: ${initial} -> ${userId}`);
    }
    
    /**
     * Register multiple user mappings
     * @param mappings Mapping object
     */
    public static registerUserMappings(mappings: Record<string, string>): void {
        Object.assign(this.knownUserMap, mappings);
    }
    
    /**
     * Automatically register a mapping when a user logs in
     * @param user User object
     */
    public static registerUserOnLogin(user: any): void {
        if (!user || !user.id) return;
        
        // Compute the user's initials
        let initial = '';
        
        if (user.firstName && user.lastName) {
            initial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        } else if (user.displayName) {
            const parts = user.displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                initial = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            } else {
                initial = user.displayName.substring(0, 2).toUpperCase();
            }
        } else if (user.name) {
            initial = user.name.substring(0, 2).toUpperCase();
        }
        
        if (initial && user.id) {
            logger.debug(`Auto-registering user mapping from login: ${initial} -> ${user.id}`);
            this.registerUserIdMapping(initial, user.id);
        }
    }
    
    /**
     * Get a mapped user ID
     * @param initial User initials
     * @returns The mapped user ID, or undefined
     */
    public static getUserIdByInitial(initial: string): string | undefined {
        return this.knownUserMap[initial];
    }
    
    /**
     * Get all known mappings
     */
    public static getAllMappings(): Record<string, string> {
        return { ...this.knownUserMap };
    }
}

// Add to the global object for easier debugging
if (typeof window !== 'undefined') {
    (window as any).avatarMigration = AvatarMigrationTool;
}

export default AvatarMigrationTool;
