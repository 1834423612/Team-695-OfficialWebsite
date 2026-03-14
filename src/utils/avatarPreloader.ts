/**
 * Avatar preloading utility
 * 
 * Preloads and caches avatars that may be needed during page load
 * Avoids waiting until the user scrolls to avatar sections before loading them
 */

import { avatarCache } from '@/services/avatarCache';
import { logger } from '@/utils/logger';

interface AvatarInfo {
    userId: string;
    url: string;
    userName?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    initial?: string;
}

class AvatarPreloader {
    private queue: AvatarInfo[] = [];
    private isProcessing: boolean = false;
    private concurrentLimit: number = 3; // Maximum number of concurrent requests
    private intervalMs: number = 1000; // Delay between requests to avoid excessive frequency
    private logOperations: boolean = false; // Controls whether detailed logs are recorded

    // Constructor: detailed logging is enabled only in development
    constructor() {
        this.logOperations = process.env.NODE_ENV === 'development';
    }

    /**
     * Add an avatar to the preload queue
     */
    public add(info: AvatarInfo): void {
        // Avoid adding the same URL more than once
        if (info.url && this.queue.some(item => item.url === info.url)) {
            return;
        }
        
        this.queue.push(info);
        
        if (this.logOperations) {
            logger.debug(`Added avatar to preload queue: ${info.url || '(default)'} (${info.userId})`);
        }
        
        // Start processing if nothing is currently running
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    /**
     * Add multiple avatars to the preload queue
     */
    public addBatch(items: AvatarInfo[]): void {
        if (!items || items.length === 0) return;
        
        // Filter out duplicate URLs for entries that have a URL
        const uniqueItems = items.filter(info => 
            !info.url || !this.queue.some(item => item.url === info.url)
        );
        
        this.queue.push(...uniqueItems);
        
        if (this.logOperations) {
            logger.debug(`Added ${uniqueItems.length} avatars to preload queue (${items.length - uniqueItems.length} duplicates skipped)`);
        }
        
        // Start processing if nothing is currently running
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    /**
     * Process the preload queue
     * Uses batching and delays to avoid overloading the server
     */
    private async processQueue(): Promise<void> {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        try {
            // Process up to the concurrency limit in each batch
            const batch = this.queue.splice(0, this.concurrentLimit);
            
            // Output debug information
            if (this.logOperations) {
                logger.debug(`Preloading ${batch.length} avatars, ${this.queue.length} remaining in queue`);
            }
            
            // Process the current batch in parallel
            await Promise.all(batch.map(async info => {
                try {
                    if (info.url) {
                        // Cache the avatar when a URL is available
                        await avatarCache.cacheAvatar(
                            info.userId,
                            info.url,
                            {
                                name: info.userName,
                                displayName: info.displayName,
                                initial: info.initial
                            }
                        );
                    } else {
                        // Generate the default avatar when no URL is available
                        await this.preloadDefault(
                            info.userId, 
                            {
                                name: info.userName,
                                displayName: info.displayName,
                                firstName: info.firstName, 
                                lastName: info.lastName,
                                initial: info.initial
                            }
                        );
                    }
                } catch (error) {
                    // A single avatar failure should not stop the rest of the batch
                    logger.warn(`Failed to preload avatar for ${info.userId}: ${info.url || '(default)'}`, error);
                }
            }));
            
            // Add a delay to avoid sending requests too frequently
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), this.intervalMs);
            } else {
                this.isProcessing = false;
                if (this.logOperations) {
                    logger.debug('Avatar preload queue completed');
                }
            }
        } catch (e) {
            logger.error('Error processing avatar preload queue:', e);
            this.isProcessing = false;
            
            // Retry the remaining queue later if an error occurs
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), this.intervalMs * 3);
            }
        }
    }

    /**
     * Preload the default avatar when no URL exists
     * @param userId User ID
     * @param userInfo User information
     */
    public preloadDefault(userId: string, userInfo?: any): Promise<string> {
        if (!userId) return Promise.resolve('');
        
        return avatarCache.getAvatar(userId, undefined, userInfo, true)
            .catch(e => {
                logger.warn(`Failed to preload default avatar for ${userId}: ${e}`);
                return '';
            });
    }
    
    /**
     * Preload avatars from a user list
     * @param users User list
     */
    public preloadFromUsersList(users: any[]): void {
        if (!users || !Array.isArray(users) || users.length === 0) return;
        
        // Prepare the queue items array in advance for all users
        const queueItems: AvatarInfo[] = users
            .filter(user => user && (user.id || user.userId)) // Filter out only users with no ID
            .map(user => {
                const userId = user.id || user.userId;
                const hasValidUrl = user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http');
                
                return {
                    userId,
                    url: hasValidUrl ? user.avatar : '', // Use an empty string when no valid URL exists
                    userName: user.name,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    initial: this.getUserInitials(user)
                };
            });
        
        const withUrls = queueItems.filter(item => !!item.url).length;
        const withoutUrls = queueItems.length - withUrls;
        
        if (this.logOperations) {
            logger.info(
                `Preloading ${queueItems.length} avatars from users list ` +
                `(${withUrls} with URLs, ${withoutUrls} requiring default avatar generation)`
            );
        }
        
        // Add everything to the preload queue in one batch
        if (queueItems.length > 0) {
            this.addBatch(queueItems);
        }
    }

    /**
     * Scan the page and preload visible avatars
     */
    public scanAndPreload(): void {
        // Find all images on the page that may be avatars
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i], [data-avatar-url]');
        
        const toPreload: AvatarInfo[] = [];
        const defaultsToPreload: AvatarInfo[] = [];
        
        // Collect avatar data that should be preloaded
        avatarImgs.forEach((elem: Element) => {
            // Handle elements with the data-avatar-url attribute
            const dataUrl = elem.getAttribute('data-avatar-url');
            if (dataUrl) {
                const userId = elem.getAttribute('data-user-id') || 'unknown';
                toPreload.push({
                    userId,
                    url: dataUrl,
                    userName: elem.getAttribute('data-user-name') || undefined,
                    displayName: elem.getAttribute('data-user-display-name') || undefined
                });
                return;
            }
            
            // Handle img elements
            const img = elem as HTMLImageElement;
            const src = img.getAttribute('src');
            
            // Skip avatars that are already data URLs because they have already been cached
            if (src && !src.startsWith('data:')) {
                const imgElement = img as HTMLElement;
                let userId = imgElement.getAttribute('data-user-id') || '';
                
                // If the image itself does not contain a user ID, try reading it from a parent element or attribute
                if (!userId) {
                    const parentElement = imgElement.parentElement;
                    userId = parentElement?.getAttribute('data-user-id') || '';
                }
                
                // Generate a unique ID from the URL when no user ID can be found
                if (!userId && src) {
                    userId = `url_${hashCode(src)}`;
                }
                
                // Collect any other user information that may be available
                const userInfo = {
                    userName: imgElement.getAttribute('data-user-name') || undefined,
                    displayName: imgElement.getAttribute('data-display-name') || undefined,
                    firstName: imgElement.getAttribute('data-first-name') || undefined,
                    lastName: imgElement.getAttribute('data-last-name') || undefined,
                    initial: imgElement.getAttribute('data-initial') || undefined
                };
                
                toPreload.push({
                    userId, 
                    url: src, 
                    ...userInfo
                });
            } else if (!src) {
                // If no src exists but data-user-id does, a default avatar may need to be generated
                const imgElement = img as HTMLElement;
                const userId = imgElement.getAttribute('data-user-id') || `default_${Math.random().toString(36).substring(2, 9)}`;
                
                defaultsToPreload.push({
                    userId,
                    url: '',
                    userName: imgElement.getAttribute('data-user-name') || undefined,
                    displayName: imgElement.getAttribute('data-display-name') || undefined,
                    firstName: imgElement.getAttribute('data-first-name') || undefined,
                    lastName: imgElement.getAttribute('data-last-name') || undefined,
                    initial: imgElement.getAttribute('data-initial') || undefined
                });
            }
        });
        
        if (this.logOperations) {
            logger.info(`Scanning found ${toPreload.length} external avatars to preload and ${defaultsToPreload.length} default avatars to generate`);
        }
        
        // Add the collected entries to the preload queue
        if (toPreload.length > 0) {
            this.addBatch(toPreload);
        }
        
        if (defaultsToPreload.length > 0) {
            this.addBatch(defaultsToPreload);
        }
    }

    /**
     * Get user initials from a user object
     * @param user User object
     * @returns User initials
     */
    private getUserInitials(user: any): string {
        if (!user) return '';
            
        // Generate initials from all possible sources
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        
        if (user.displayName) {
            const parts = user.displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return user.displayName.substring(0, 2).toUpperCase();
        }
        
        if (user.name) {
            const parts = user.name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return user.name.substring(0, 2).toUpperCase();
        }
        
        return (user.id || 'XX').substring(0, 2).toUpperCase();
    }

    /**
     * Toggle logging
     */
    public setLogging(enabled: boolean): void {
        this.logOperations = enabled;
        logger.debug(`Avatar preloader logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set the concurrency limit and request interval
     */
    public setLimits(concurrentLimit: number, intervalMs: number): void {
        this.concurrentLimit = concurrentLimit;
        this.intervalMs = intervalMs;
        
        if (this.logOperations) {
            logger.debug(`Avatar preloader limits set: ${concurrentLimit} concurrent, ${intervalMs}ms interval`);
        }
    }
}

// Helper function: compute a string hash code
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to a 32-bit integer
    }
    return Math.abs(hash);
}

// Export a singleton instance
export const avatarPreloader = new AvatarPreloader();

// Add to the window object for easier debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).avatarPreloader = avatarPreloader;
}
