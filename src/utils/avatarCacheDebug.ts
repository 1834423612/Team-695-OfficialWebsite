import { avatarCache } from '@/services/avatarCache';
import { logger } from '@/utils/logger';

// Cache debugger tool
declare global {
    interface Window {
        avatarDebug?: typeof AvatarCacheDebugger;
    }
}

// Avatar cache debugging tool for development environment
const AvatarCacheDebugger = {
    /**
     * Display all avatar cache entries
     */
    listAllCaches() {
        const result: Record<string, any> = {};
        let count = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                count++;
                
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const entry = JSON.parse(value);
                        result[key] = {
                            userId: key.substring('avatar_cache_'.length),
                            originalUrl: entry.originalUrl?.substring(0, 30) + '...',
                            timestamp: new Date(entry.timestamp).toLocaleTimeString(),
                            dataUrlLength: entry.dataUrl?.length || 0,
                            age: Math.round((Date.now() - entry.timestamp) / 1000 / 60) + ' minutes'
                        };
                    } else {
                        result[key] = '(empty value)';
                    }
                } catch (e) {
                    result[key] = `Error: ${e instanceof Error ? e.message : String(e)}`;
                }
            }
        }
        
        logger.prettyGroup('Avatar Cache Statistics', 'primary', false);
        logger.info(`Found ${count} avatar cache entries`);
        logger.table(result);
        logger.groupEnd();
        
        return result;
    },
    
    /**
     * Manually test caching an avatar for specific user
     */
    async testCache(userId: string, avatarUrl: string) {
        logger.prettyGroup('Test User Avatar Cache', 'info', false);
        logger.pretty('User ID', userId, 'info');
        logger.pretty('Avatar URL', avatarUrl.substring(0, 50) + (avatarUrl.length > 50 ? '...' : ''), 'info');
        
        try {
            // 1. Clear existing cache
            logger.info('Clearing existing cache...');
            avatarCache.clearCache(userId);
            
            // 2. Cache new avatar
            logger.info('Caching new avatar...');
            const result = await avatarCache.cacheAvatar(userId, avatarUrl);
            
            // 3. Verify cache success
            const cacheKey = `avatar_cache_${userId}`;
            const cachedData = localStorage.getItem(cacheKey);
            
            const cacheResult = {
                success: !!result,
                cachedInLocalStorage: !!cachedData,
                dataLength: result?.length || 0,
                localStorageEntryLength: cachedData?.length || 0
            };
            
            logger.table(cacheResult, 'Cache Result');
            logger.pretty('Status', cacheResult.success ? 'Success' : 'Failed', cacheResult.success ? 'success' : 'error');
            logger.groupEnd();
            
            return cacheResult.success;
        } catch (error) {
            logger.error('Cache test failed:', error);
            logger.groupEnd();
            return false;
        }
    },
    
    /**
     * Clear all avatar caches
     */
    clearAll() {
        logger.prettyGroup('Clear All Avatar Caches', 'warn', false);
        avatarCache.clearAllCache();
        
        // Verify clearing
        let remainingCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                remainingCount++;
            }
        }
        
        const result = {
            success: remainingCount === 0,
            remainingCaches: remainingCount
        };
        
        logger.pretty('Result', result.success ? 'All caches cleared' : `${result.remainingCaches} cache items remain`, 
                      result.success ? 'success' : 'warn');
        logger.groupEnd();
        
        return result;
    },
    
    /**
     * Check localStorage space usage
     */
    checkStorageUsage() {
        let totalBytes = 0;
        let avatarCacheBytes = 0;
        const items: Record<string, number> = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key) || '';
                const bytes = new Blob([key, value]).size;
                totalBytes += bytes;
                items[key] = bytes;
                
                if (key.startsWith('avatar_cache_')) {
                    avatarCacheBytes += bytes;
                }
            }
        }
        
        const usageInMB = totalBytes / (1024 * 1024);
        const avatarUsageInMB = avatarCacheBytes / (1024 * 1024);
        
        // Sort to get the largest items
        const sortedItems = Object.entries(items)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Only take top 5
        
        logger.prettyGroup('localStorage Usage Statistics', 'system', false);
        logger.info('Overall storage usage:');
        logger.pretty('Total Space', `${usageInMB.toFixed(2)} MB`, 'info');
        logger.pretty('Avatar Cache', `${avatarUsageInMB.toFixed(2)} MB (${(avatarCacheBytes / totalBytes * 100).toFixed(1)}%)`, 'primary');
        
        logger.prettyGroup('Largest Storage Items (Top 5)', 'secondary', true);
        sortedItems.forEach(([key, size], index) => {
            logger.pretty(`#${index+1}`, `${key}: ${(size / 1024).toFixed(1)} KB`, size > 100000 ? 'warn' : 'info');
        });
        logger.groupEnd(); // Close largest items group
        
        logger.groupEnd(); // Close overall stats group
        
        return {
            totalBytes,
            avatarCacheBytes,
            usageInMB,
            avatarUsageInMB,
            largestItems: sortedItems
        };
    }
};

// Expose to global scope in development environment
if (process.env.NODE_ENV === 'development') {
    (window as any).avatarDebug = AvatarCacheDebugger;
    logger.pretty('Debug Tools', 'Avatar cache debugger available as window.avatarDebug', 'important');
}

export default AvatarCacheDebugger;
