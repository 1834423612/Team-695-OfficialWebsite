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
import { AvatarMigrationTool } from '@/utils/avatarMigrationTool';

// Cache debugging tool
const AvatarDebugTools = {
    // Display cache status
    showCache: () => {
        const groupName = 'Avatar Cache Status';
        logger.prettyGroup(groupName, 'primary', false);
        
        try {
            // Show cache information
            let count = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('avatar_cache_')) {
                    count++;
                }
            }
            
            // Get IndexedDB statistics
            avatarCache.getCacheStats().then(stats => {
                logger.pretty('Memory Cache', `${stats.memoryEntries} entries`, 'info');
                logger.pretty('IndexedDB Cache', `${stats.dbEntries} entries`, 'info');
                logger.pretty('Request Records', `${stats.requestEntries} entries`, 'info');
                logger.pretty('LocalStorage', `${count} entries (legacy)`, 'info');
            }).catch(e => {
                logger.pretty('Error', `Failed to get cache stats: ${e}`, 'error');
            });
            
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
        } catch (error) {
            logger.error('Error showing cache:', error);
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    // Check request throttling status
    showThrottling: async () => {
        const groupName = 'Avatar Request Throttling Status';
        logger.prettyGroup(groupName, 'system', false);
        
        try {
            // Use added debug methods
            if ((window as any).avatarCacheDebug && (window as any).avatarCacheDebug.getRequestStats) {
                const result = await (window as any).avatarCacheDebug.getRequestStats();
                if (result.error) {
                    logger.pretty('Error', result.error, 'error');
                } else {
                    logger.pretty('Stats', `${Object.keys(result.requestData).length} URLs tracked`, 'info');
                    
                    const throttledUrls = Object.entries(result.requestData)
                        .filter(([_, data]: [string, any]) => data.throttled === 'Yes')
                        .map(([url, data]: [string, any]) => ({
                            url,
                            lastRequest: data.lastRequest,
                            count: data.count
                        }));
                    
                    if (throttledUrls.length > 0) {
                        logger.pretty('Throttled URLs', `${throttledUrls.length} URLs currently throttled`, 'warn');
                        logger.table(throttledUrls);
                    } else {
                        logger.pretty('Throttled URLs', 'No URLs currently throttled', 'success');
                    }
                }
            } else {
                logger.pretty('Not Available', 'Request stats are not available in this environment', 'warn');
            }
        } catch (e) {
            logger.pretty('Error', `Failed to get throttling status: ${e}`, 'error');
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    // Dump all caches
    dumpAllCache: () => {
        const groupName = 'All Avatar Caches';
        const entries: Record<string, any> = {};
        
        logger.prettyGroup(groupName, 'system', false);
        
        try {
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
                                age: Math.round((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000) * 10) / 10 + ' days',
                                userName: entry.userName || 'unknown',
                                displayName: entry.displayName || 'unknown'
                            };
                        } catch (e) {
                            entries[key] = '[Invalid JSON]';
                        }
                    }
                }
            }
            
            logger.table(entries);
        } catch (error) {
            logger.error('Error dumping cache:', error);
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
        
        // Also get entries from IndexedDB
        if ((window as any).avatarCacheDebug && (window as any).avatarCacheDebug.getAllCaches) {
            const idbGroupName = 'IndexedDB Avatar Caches';
            logger.prettyGroup(idbGroupName, 'system', false);
            
            (window as any).avatarCacheDebug.getAllCaches().then((dbEntries: any) => {
                try {
                    logger.table(dbEntries);
                } catch (error) {
                    logger.error('Error showing IndexedDB entries:', error);
                } finally {
                    // Use safe group closure
                    logger.safeGroupEnd(idbGroupName);
                }
            }).catch((e: any) => {
                logger.pretty('Error', `Failed to get IndexedDB caches: ${e}`, 'error');
                logger.safeGroupEnd(idbGroupName);
            });
        }
        
        return entries;
    },
    
    // Clear all caches
    clearAllCache: () => {
        const groupName = 'Clear Avatar Cache';
        logger.prettyGroup(groupName, 'warn', false);
        
        try {
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
        } catch (error) {
            logger.error('Error clearing cache:', error);
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    // Refresh a specific user's avatar cache
    refreshCache: async (userId: string, avatarUrl: string, userName?: string) => {
        const groupName = `Refresh Avatar Cache: ${userId}`;
        logger.prettyGroup(groupName, 'info', false);
        
        try {
            logger.pretty('URL', avatarUrl, 'info', true);
            
            const result = await avatarCache.cacheAvatar(userId, avatarUrl, { name: userName });
            const success = result !== null;
            logger.pretty('Result', success ? 'Success' : 'Failed', success ? 'success' : 'error');
            return result;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            logger.pretty('Error', errorMsg, 'error');
            return null;
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    // Analyze all avatars currently displayed on the page
    analyzePageAvatars: () => {
        const groupName = 'Page Avatar Analysis';
        logger.prettyGroup(groupName, 'info', false);
        
        try {
            const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i]');
            
            logger.pretty('Found', `${avatarImgs.length} avatar images on page`, 'info');
            
            const results: Record<string, any> = {};
            let uniqueUrls = 0;
            let dataUrlCount = 0;
            let externalUrlCount = 0;
            
            Array.from(avatarImgs).forEach((img, index) => {
                const src = img.getAttribute('src') || '';
                if (!src) return;
                
                if (!results[src]) {
                    uniqueUrls++;
                    results[src] = { count: 0, isDataUrl: src.startsWith('data:') };
                    if (src.startsWith('data:')) {
                        dataUrlCount++;
                    } else {
                        externalUrlCount++;
                    }
                }
                
                results[src].count++;
                
                // Add an index attribute for identification
                img.setAttribute('data-avatar-index', index.toString());
            });
            
            logger.pretty('Summary', `${uniqueUrls} unique URLs (${dataUrlCount} data URLs, ${externalUrlCount} external URLs)`, 'info');
            
            // Show the most common URLs
            const sortedUrls = Object.entries(results)
                .sort(([, a]: [string, any], [, b]: [string, any]) => b.count - a.count)
                .slice(0, 5);
            
            if (sortedUrls.length > 0) {
                logger.info('Most common avatar URLs:');
                sortedUrls.forEach(([url, data]: [string, any]) => {
                    const urlDisplay = url.startsWith('data:') 
                        ? `data:... (${url.length} chars)` 
                        : url.length > 50 ? url.substring(0, 47) + '...' : url;
                    logger.pretty(
                        urlDisplay, 
                        `Used ${data.count} times, ${data.isDataUrl ? 'Cached' : 'External'}`,
                        data.isDataUrl ? 'success' : 'warn'
                    );
                });
            }
            
            return { 
                totalImages: avatarImgs.length, 
                uniqueUrls, 
                dataUrlCount, 
                externalUrlCount 
            };
        } catch (error) {
            logger.error('Error analyzing page avatars:', error);
            return { totalImages: 0, uniqueUrls: 0, dataUrlCount: 0, externalUrlCount: 0 };
        } finally {
            logger.safeGroupEnd(groupName);
        }
    },
    
    // Force cache all avatars currently visible on the page
    cacheAllVisible: async () => {
        const groupName = 'Cache Visible Avatars';
        logger.prettyGroup(groupName, 'system', false);
        
        try {
            const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i]');
            
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
                        // Try to get user ID
                        const imgElement = img as HTMLElement;
                        const parentElement = imgElement.parentElement;
                        let userId = imgElement.getAttribute('data-user-id') || '';
                        
                        // If no user ID on the image, check parent element
                        if (!userId && parentElement) {
                            userId = parentElement.getAttribute('data-user-id') || '';
                        }
                        
                        // If still no ID found, use manual ID
                        if (!userId) {
                            userId = `manual_${index}`;
                        }
                        
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
            
            return results;
        } catch (error) {
            logger.error('Error caching visible avatars:', error);
            return { error: String(error) };
        } finally {
            logger.safeGroupEnd(groupName);
        }
    },

    /**
     * Clean up invalid cache entries
     * Check and clean entries that use initials instead of actual user IDs as keys
     */
    cleanupInvalidKeys: async () => {
        const groupName = 'Cleanup Invalid Avatar Cache Keys';
        logger.prettyGroup(groupName, 'warn', false);
        
        try {
            // First scan all entries in IndexedDB
            if (!(window as any).avatarCacheDebug || !(window as any).avatarCacheDebug.getAllCaches) {
                logger.pretty('Error', 'Debug API not available', 'error');
                return;
            }
            
            const allCaches = await (window as any).avatarCacheDebug.getAllCaches();
            const keys = Object.keys(allCaches);
            
            // Check for short keys (likely initials rather than user IDs)
            const suspiciousKeys = keys.filter(key => key.length <= 2);
            logger.pretty('Found', `${suspiciousKeys.length} suspicious keys that might be initials instead of user IDs`, 'warn');
            
            if (suspiciousKeys.length > 0) {
                logger.info('Suspicious keys:');
                suspiciousKeys.forEach(key => {
                    const entry = allCaches[key];
                    logger.pretty(
                        key, 
                        `${entry.displayName || 'Unknown'} (${entry.originalUrl})`,
                        'warn'
                    );
                });
                
                const confirmClear = confirm(`Found ${suspiciousKeys.length} cache entries with suspicious keys (initials used as IDs). Clear them?`);
                if (confirmClear) {
                    let cleared = 0;
                    for (const key of suspiciousKeys) {
                        try {
                            await avatarCache.clearCache(key);
                            cleared++;
                        } catch (e) {
                            logger.warn(`Failed to clear key ${key}:`, e);
                        }
                    }
                    logger.pretty('Cleared', `${cleared} of ${suspiciousKeys.length} suspicious cache entries`, 'success');
                }
            } else {
                logger.pretty('Status', 'No suspicious keys found', 'success');
            }
        } catch (error) {
            logger.error('Error cleaning up invalid keys:', error);
        } finally {
            logger.safeGroupEnd(groupName);
        }
    },

    /**
     * Migrate old key format
     * Find cache entries using initials as keys and migrate them to use the user ID
     */
    migrateInvalidKeys: async (userIdMap?: Record<string, string>) => {
        const groupName = 'Migrate Invalid Avatar Cache Keys';
        logger.prettyGroup(groupName, 'system', false);
        
        try {
            // Use provided map or get known mappings from AvatarMigrationTool
            const mappingsToUse = userIdMap || AvatarMigrationTool.getAllMappings();
            logger.info('User ID map:', mappingsToUse);
            
            // If no mappings, prompt the user
            if (Object.keys(mappingsToUse).length === 0) {
                logger.pretty('No Mappings', 'No user ID mappings available', 'warn');
                return;
            }
            
            // Ensure service is initialized
            if (!(window as any).avatarCacheDebug || !(window as any).avatarCacheDebug.getAllCaches) {
                logger.pretty('Error', 'Debug API not available', 'error');
                return;
            }
            
            const allCaches = await (window as any).avatarCacheDebug.getAllCaches();
            let migratedCount = 0;
            
            // Check each mapping
            for (const [initial, userId] of Object.entries(mappingsToUse)) {
                if (allCaches[initial]) {
                    const entry = allCaches[initial];
                    logger.info(`Migrating ${initial} -> ${userId} for ${entry.displayName || 'Unknown'}`);
                    
                    // Use original URL and new userId to re-cache
                    if (entry.originalUrl) {
                        await avatarCache.cacheAvatar(userId, entry.originalUrl, {
                            displayName: entry.displayName,
                            name: entry.userName
                        });
                        migratedCount++;
                    }
                    
                    // Clear old key
                    await avatarCache.clearCache(initial);
                }
            }
            
            logger.pretty('Migrated', `${migratedCount} cache entries to correct user IDs`, migratedCount > 0 ? 'success' : 'info');
        } catch (error) {
            logger.error('Error migrating cache:', error);
        } finally {
            logger.safeGroupEnd(groupName);
        }
    },

    /**
     * Run full cache migration in one step
     */
    runFullMigration: async () => {
        const groupName = 'Full Avatar Cache Migration';
        logger.prettyGroup(groupName, 'important', false);
        
        try {
            // 1. Get all known user mappings
            const mappings = AvatarMigrationTool.getAllMappings();
            const mappingCount = Object.keys(mappings).length;
            
            if (mappingCount === 0) {
                logger.pretty('No Mappings', 'No user ID mappings available. Login to register mappings automatically.', 'warn');
                return;
            }
            
            logger.pretty('Mappings', `Found ${mappingCount} user ID mappings`, 'info');
            
            // 2. Clean up invalid keys
            await AvatarDebugTools.cleanupInvalidKeys();
            
            // 3. Migrate known mappings
            await AvatarDebugTools.migrateInvalidKeys(mappings);
            
            logger.pretty('Complete', 'Full migration process completed', 'success');
        } catch (error) {
            logger.error('Error during full migration:', error);
        } finally {
            logger.safeGroupEnd(groupName);
        }
    }
};

// Add to global object for console use
if (typeof window !== 'undefined') {
    (window as any).avatarDebug = AvatarDebugTools;
    logger.pretty('Debug Tools', 'Avatar debug tools loaded (window.avatarDebug)', 'important');
}

export default AvatarDebugTools;
