import { avatarCache } from '@/services/avatarCache';
import { logger } from '@/utils/logger';

// Cache debugger tool
declare global {
    interface Window {
        avatarCacheDebug?: typeof AvatarCacheDebugger;
    }
}

// Avatar cache debugging tool for development environment
const AvatarCacheDebugger = {
    /**
     * Display all avatar cache entries
     */
    listAllCaches() {
        const groupName = 'Avatar Cache Statistics';
        const result: Record<string, any> = {};
        let count = 0;
        
        logger.prettyGroup(groupName, 'primary', false);
        
        try {
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
            
            logger.info(`Found ${count} avatar cache entries`);
            logger.table(result);
        } catch (error) {
            logger.error('Error listing caches:', error);
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
        
        return result;
    },
    
    /**
     * Manually test caching an avatar for specific user
     */
    async testCache(userId: string, avatarUrl: string) {
        const groupName = 'Test User Avatar Cache';
        logger.prettyGroup(groupName, 'info', false);
        
        try {
            logger.pretty('User ID', userId, 'info');
            logger.pretty('Avatar URL', avatarUrl.substring(0, 50) + (avatarUrl.length > 50 ? '...' : ''), 'info');
            
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
            
            return cacheResult.success;
        } catch (error) {
            logger.error('Cache test failed:', error);
            return false;
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Clear all avatar caches
     */
    clearAll() {
        const groupName = 'Clear All Avatar Caches';
        logger.prettyGroup(groupName, 'warn', false);
        
        try {
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
            
            logger.pretty('Result', result.success ? 'All caches cleared' : `${remainingCount} caches remain`, 
                result.success ? 'success' : 'warn');
                
            return result;
        } catch (error) {
            logger.error('Failed to clear caches:', error);
            return { success: false, error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Get request throttling stats for debugging
     */
    async getRequestStats() {
        const groupName = 'Avatar Request Stats';
        logger.prettyGroup(groupName, 'info', false);
        
        try {
            // 检查是否实现了该方法
            if (typeof (avatarCache as any).getRequestStats !== 'function') {
                logger.warn('getRequestStats method is not implemented in avatarCache');
                return { error: 'Method not implemented' };
            }
            
            const requestData = await (avatarCache as any).getRequestStats();
            logger.table(requestData);
            return { requestData };
        } catch (error) {
            logger.error('Failed to get request stats:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Get all cached avatars from IndexedDB
     */
    async getAllCaches() {
        const groupName = 'All IndexedDB Avatar Caches';
        logger.prettyGroup(groupName, 'system', false);
        
        try {
            // 检查是否实现了该方法
            if (typeof (avatarCache as any).dumpAllCaches !== 'function') {
                logger.warn('dumpAllCaches method is not implemented in avatarCache');
                return { error: 'Method not implemented' };
            }
            
            const caches = await (avatarCache as any).dumpAllCaches();
            logger.info(`Retrieved ${Object.keys(caches).length} cached entries from IndexedDB`);
            return caches;
        } catch (error) {
            logger.error('Failed to get IndexedDB caches:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Display avatar cache statistics
     */
    async getCacheStats() {
        const groupName = 'Avatar Cache Statistics';
        logger.prettyGroup(groupName, 'primary', false);
        
        try {
            // 检查方法是否存在
            if (typeof avatarCache.getCacheStats !== 'function') {
                logger.warn('avatarCache.getCacheStats is not implemented');
                return { error: 'Method not implemented' };
            }
            
            const stats = await avatarCache.getCacheStats();
            logger.table(stats);
            logger.pretty('Summary', `${stats.dbEntries} indexed DB entries, ${stats.memoryEntries} memory cache entries`, 'info');
            return stats;
        } catch (error) {
            logger.error('Failed to get cache statistics:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Force memory cache flush to IndexedDB
     */
    async flushMemoryCache() {
        const groupName = 'Flush Memory Cache';
        logger.prettyGroup(groupName, 'system', false);
        
        try {
            // 检查是否实现了该方法
            if (typeof (avatarCache as any).flushMemoryCache !== 'function') {
                logger.warn('flushMemoryCache method is not implemented in avatarCache');
                return { error: 'Method not implemented' };
            }
            
            const result = await (avatarCache as any).flushMemoryCache();
            logger.pretty('Result', `Flushed ${result.flushed} entries to IndexedDB`, 'success');
            return result;
        } catch (error) {
            logger.error('Failed to flush memory cache:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Debug memory cache status - Replaced with type-safe implementation
     */
    checkMemoryCache() {
        const groupName = 'Memory Cache Status';
        logger.prettyGroup(groupName, 'info', false);
        
        try {
            // 创建一个备用状态对象
            const fallbackStatus = {
                entriesCount: 0,
                implementation: 'Memory cache status not available',
                lastAccessed: new Date().toISOString(),
                hitRate: 'N/A'
            };
            
            // 检查是否实现了该方法
            if (typeof (avatarCache as any).getMemoryCacheStatus !== 'function') {
                logger.warn('getMemoryCacheStatus method is not implemented in avatarCache');
                logger.table(fallbackStatus);
                return fallbackStatus;
            }
            
            // 如果实现了，则使用实现的方法
            const status = (avatarCache as any).getMemoryCacheStatus();
            logger.table(status);
            return status;
        } catch (error) {
            logger.error('Failed to check memory cache:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Check for stale avatar caches
     */
    async checkStaleCaches(maxAgeDays = 30) {
        const groupName = 'Stale Avatar Cache Check';
        logger.prettyGroup(groupName, 'warn', false);
        
        try {
            const now = Date.now();
            const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
            const cutoffDate = now - maxAgeMs;
            
            // 检查是否实现了该方法
            if (typeof (avatarCache as any).dumpAllCaches !== 'function') {
                logger.warn('dumpAllCaches method is not implemented in avatarCache');
                return { count: 0, entries: {}, error: 'Method not implemented' };
            }
            
            const caches = await (avatarCache as any).dumpAllCaches();
            const staleEntries: Record<string, any> = {};
            let staleCount = 0;
            
            Object.entries(caches).forEach(([userId, cacheData]: [string, any]) => {
                if (cacheData.timestamp < cutoffDate) {
                    staleEntries[userId] = {
                        userId,
                        timestamp: new Date(cacheData.timestamp).toLocaleDateString(),
                        age: Math.round((now - cacheData.timestamp) / (24 * 60 * 60 * 1000)) + ' days',
                        displayName: cacheData.displayName || 'unknown'
                    };
                    staleCount++;
                }
            });
            
            logger.pretty('Summary', `Found ${staleCount} stale caches older than ${maxAgeDays} days`, 
                staleCount > 0 ? 'warn' : 'success');
                
            if (staleCount > 0) {
                logger.table(staleEntries);
            }
            
            return { count: staleCount, entries: staleEntries };
        } catch (error) {
            logger.error('Failed to check stale caches:', error);
            return { count: 0, entries: {}, error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    },
    
    /**
     * Purge stale caches older than specified days
     */
    async purgeOldCaches(maxAgeDays = 30) {
        const groupName = 'Purge Old Caches';
        logger.prettyGroup(groupName, 'warn', false);
        
        try {
            // 检查是否实现了方法
            if (typeof this.checkStaleCaches !== 'function') {
                logger.warn('checkStaleCaches is not implemented');
                return { error: 'Method not implemented' };
            }
            
            const { count, entries, error } = await this.checkStaleCaches(maxAgeDays);
            
            // 如果有错误，直接返回
            if (error) {
                return { error };
            }
            
            if (count > 0) {
                logger.pretty('Purging', `Found ${count} old caches to purge`, 'warn');
                
                // Ask for confirmation
                const confirmPurge = confirm(`Are you sure you want to purge ${count} stale avatar caches?`);
                
                if (confirmPurge) {
                    // Purge each stale entry
                    let purgeCount = 0;
                    
                    // 检查方法是否存在
                    if (typeof avatarCache.clearCache !== 'function') {
                        logger.warn('avatarCache.clearCache is not implemented');
                        return { error: 'Clear cache method not implemented' };
                    }
                    
                    for (const userId of Object.keys(entries)) {
                        try {
                            await avatarCache.clearCache(userId);
                            purgeCount++;
                        } catch (e) {
                            logger.warn(`Failed to purge cache for ${userId}:`, e);
                        }
                    }
                    
                    logger.pretty('Purge Complete', `Successfully purged ${purgeCount} of ${count} caches`, 'success');
                    return { purged: purgeCount, total: count };
                } else {
                    logger.pretty('Cancelled', 'Purge operation cancelled by user', 'info');
                    return { purged: 0, total: count, cancelled: true };
                }
            } else {
                logger.pretty('No Action', 'No stale caches found to purge', 'success');
                return { purged: 0, total: 0 };
            }
        } catch (error) {
            logger.error('Purge operation failed:', error);
            return { error: String(error) };
        } finally {
            // Use safe group closure
            logger.safeGroupEnd(groupName);
        }
    }
};

// Register the debug tool on the window object for console access
if (typeof window !== 'undefined') {
    (window as any).avatarCacheDebug = AvatarCacheDebugger;
    console.log('Avatar cache debug tools loaded. Use window.avatarCacheDebug to access them.');
}

export default AvatarCacheDebugger;
