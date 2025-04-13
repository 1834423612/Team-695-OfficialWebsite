/**
 * Avatar Cache Debug Tool
 * For viewing and managing avatar cache status in the console
 * 
 * Usage:
 * 1. In browser console, enter: window.avatarDebug.showCache()
 * 2. View all cached avatars: window.avatarDebug.dumpAllCache()
 * 3. Clear all caches: window.avatarDebug.clearAllCache()
 */
import { avatarCache } from '@/services/avatarCache';
import { logger } from '@/utils/logger';

// Cache debugging tool
const AvatarDebugTools = {
    // Display cache status
    showCache: () => {
        logger.prettyGroup('Avatar Cache Status', 'primary', false);
        
        // Show cache information
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                count++;
            }
        }
        
        logger.pretty('Total', `${count} avatar cache entries`, 'info');
        logger.info('Example cache items:');
        
        // Show up to 5 examples
        let shown = 0;
        for (let i = 0; i < localStorage.length && shown < 5; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        const entry = JSON.parse(value);
                        const userId = key.substring('avatar_cache_'.length);
                        const expireDays = Math.round((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000) * 10) / 10;
                        const expired = expireDays > 7;
                        
                        logger.pretty(
                            userId, 
                            `${new Date(entry.timestamp).toLocaleString()} (${expireDays} days)`, 
                            expired ? 'warn' : 'info'
                        );
                        shown++;
                    } catch (e) {
                        logger.pretty(key, '[Invalid JSON data]', 'error');
                    }
                }
            }
        }
        
        logger.groupEnd();
    },
    
    // Dump all caches
    dumpAllCache: () => {
        const entries: Record<string, any> = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        const entry = JSON.parse(value);
                        const expired = Date.now() - entry.timestamp > 7 * 24 * 60 * 60 * 1000;
                        entries[key] = {
                            userId: key.substring('avatar_cache_'.length),
                            originalUrl: entry.originalUrl,
                            timestamp: new Date(entry.timestamp).toLocaleString(),
                            expired: expired ? 'Yes' : 'No',
                            age: Math.round((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000) * 10) / 10 + ' days'
                        };
                    } catch (e) {
                        entries[key] = '[Invalid JSON]';
                    }
                }
            }
        }
        
        logger.prettyGroup('All Avatar Caches', 'system', false);
        logger.table(entries);
        logger.groupEnd();
        
        return entries;
    },
    
    // Clear all caches
    clearAllCache: () => {
        logger.prettyGroup('Clear Avatar Cache', 'warn', false);
        
        let beforeCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                beforeCount++;
            }
        }
        
        logger.info(`Starting clearance, current cache count: ${beforeCount}`);
        avatarCache.clearAllCache();
        logger.pretty('Status', 'All avatar caches cleared', 'success');
        logger.groupEnd();
    },
    
    // Refresh a specific user's avatar cache
    refreshCache: async (userId: string, avatarUrl: string) => {
        logger.prettyGroup(`Refresh Avatar Cache: ${userId}`, 'info', false);
        logger.pretty('URL', avatarUrl, 'info', true);
        
        try {
            const result = await avatarCache.cacheAvatar(userId, avatarUrl);
            const success = result !== null;
            logger.pretty('Result', success ? 'Success' : 'Failed', success ? 'success' : 'error');
            logger.groupEnd();
            return result;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            logger.pretty('Error', errorMsg, 'error');
            logger.groupEnd();
            return null;
        }
    },
    
    // Manually force cache all avatars currently visible on the page
    cacheAllVisible: async () => {
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="avatar" i]');
        
        logger.prettyGroup('Cache Visible Avatars', 'system', false);
        logger.pretty('Found', `${avatarImgs.length} avatar images`, 'info');
        
        const results: Record<string, any> = {};
        let i = 0;
        let successCount = 0;
        let failCount = 0;
        
        // Use Promise.all to wait for all async operations to complete
        await Promise.all(
            Array.from(avatarImgs).map(async (img) => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                    const index = i++;
                    const userId = `manual_${index}`;
                    try {
                        const result = await avatarCache.cacheAvatar(userId, src);
                        results[src] = { success: !!result, userId };
                        if (result) successCount++;
                        else failCount++;
                    } catch (e) {
                        results[src] = { success: false, error: String(e) };
                        failCount++;
                    }
                }
            })
        );
        
        logger.pretty('Results', `Success: ${successCount}, Failed: ${failCount}`, successCount > 0 ? 'success' : 'warn');
        logger.table(results);
        logger.groupEnd();
        
        return results;
    }
};

// Add to global object for console use
if (typeof window !== 'undefined') {
    (window as any).avatarDebug = AvatarDebugTools;
    logger.pretty('Debug Tools', 'Avatar debug tools loaded (window.avatarDebug)', 'important');
}

export default AvatarDebugTools;
