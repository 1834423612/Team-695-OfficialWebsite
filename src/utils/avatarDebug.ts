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
        logger.prettyGroup('Avatar Cache Status', 'primary', false);
        
        // Show cache information
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                count++;
            }
        }
        
        // 获取IndexedDB统计数据
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
        
        logger.groupEnd();
    },
    
    // 查看请求限流状态
    showThrottling: async () => {
        logger.prettyGroup('Avatar Request Throttling Status', 'system', false);
        
        try {
            // 使用添加的新调试方法
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
        
        logger.prettyGroup('All Avatar Caches', 'system', false);
        logger.table(entries);
        logger.groupEnd();
        
        // 也获取IndexedDB中的条目
        if ((window as any).avatarCacheDebug && (window as any).avatarCacheDebug.getAllCaches) {
            (window as any).avatarCacheDebug.getAllCaches().then((dbEntries: any) => {
                logger.prettyGroup('IndexedDB Avatar Caches', 'system', false);
                logger.table(dbEntries);
                logger.groupEnd();
            }).catch((e: any) => {
                logger.pretty('Error', `Failed to get IndexedDB caches: ${e}`, 'error');
            });
        }
        
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
    refreshCache: async (userId: string, avatarUrl: string, userName?: string) => {
        logger.prettyGroup(`Refresh Avatar Cache: ${userId}`, 'info', false);
        logger.pretty('URL', avatarUrl, 'info', true);
        
        try {
            const result = await avatarCache.cacheAvatar(userId, avatarUrl, { name: userName });
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
    
    // 分析页面上显示的所有头像
    analyzePageAvatars: () => {
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i]');
        
        logger.prettyGroup('Page Avatar Analysis', 'info', false);
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
            
            // 为这个图像添加索引以便于识别
            img.setAttribute('data-avatar-index', index.toString());
        });
        
        logger.pretty('Summary', `${uniqueUrls} unique URLs (${dataUrlCount} data URLs, ${externalUrlCount} external URLs)`, 'info');
        
        // 显示最常见的几个URL
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
        
        logger.groupEnd();
        return { 
            totalImages: avatarImgs.length, 
            uniqueUrls, 
            dataUrlCount, 
            externalUrlCount 
        };
    },
    
    // Manually force cache all avatars currently visible on the page
    cacheAllVisible: async () => {
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i]');
        
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
                    // 尝试获取用户ID
                    const imgElement = img as HTMLElement;
                    const parentElement = imgElement.parentElement;
                    let userId = imgElement.getAttribute('data-user-id') || '';
                    
                    // 如果图像本身没有用户ID，尝试从父元素获取
                    if (!userId && parentElement) {
                        userId = parentElement.getAttribute('data-user-id') || '';
                    }
                    
                    // 如果仍然没有找到，使用手动ID
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
        logger.groupEnd();
        
        return results;
    },

    /**
     * 清理错误的缓存项
     * 检查并清理使用initial而不是用户真实ID作为键的缓存项
     */
    cleanupInvalidKeys: async () => {
        logger.prettyGroup('Cleanup Invalid Avatar Cache Keys', 'warn', false);
        
        // 首先扫描IndexedDB中的所有条目
        try {
            // 确保服务已初始化
            if (!(window as any).avatarCacheDebug || !(window as any).avatarCacheDebug.getAllCaches) {
                logger.pretty('Error', 'Debug API not available', 'error');
                logger.groupEnd();
                return;
            }
            
            const allCaches = await (window as any).avatarCacheDebug.getAllCaches();
            const keys = Object.keys(allCaches);
            
            // 检查短键（可能是initial而不是userId）
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
        } catch (e) {
            logger.pretty('Error', `Failed to scan cache: ${e}`, 'error');
        }
        
        logger.groupEnd();
    },

    /**
     * 迁移旧键格式
     * 尝试找出使用initial作为键的缓存项，并将其迁移到使用用户ID作为键
     */
    migrateInvalidKeys: async (userIdMap?: Record<string, string>) => {
        logger.prettyGroup('Migrate Invalid Avatar Cache Keys', 'system', false);
        
        // 使用提供的映射或从AvatarMigrationTool获取已知映射
        const mappingsToUse = userIdMap || AvatarMigrationTool.getAllMappings();
        logger.info('User ID map:', mappingsToUse);
        
        // 如果没有映射，提示用户
        if (Object.keys(mappingsToUse).length === 0) {
            logger.pretty('No Mappings', 'No user ID mappings available', 'warn');
            logger.groupEnd();
            return;
        }
        
        try {
            // 确保服务已初始化
            if (!(window as any).avatarCacheDebug || !(window as any).avatarCacheDebug.getAllCaches) {
                logger.pretty('Error', 'Debug API not available', 'error');
                logger.groupEnd();
                return;
            }
            
            const allCaches = await (window as any).avatarCacheDebug.getAllCaches();
            let migratedCount = 0;
            
            // 检查每个提供的映射
            for (const [initial, userId] of Object.entries(mappingsToUse)) {
                if (allCaches[initial]) {
                    const entry = allCaches[initial];
                    logger.info(`Migrating ${initial} -> ${userId} for ${entry.displayName || 'Unknown'}`);
                    
                    // 使用原始URL和新的userId重新缓存
                    if (entry.originalUrl) {
                        await avatarCache.cacheAvatar(userId, entry.originalUrl, {
                            displayName: entry.displayName,
                            name: entry.userName
                        });
                        migratedCount++;
                    }
                    
                    // 清除旧键
                    await avatarCache.clearCache(initial);
                }
            }
            
            logger.pretty('Migrated', `${migratedCount} cache entries to correct user IDs`, migratedCount > 0 ? 'success' : 'info');
        } catch (e) {
            logger.pretty('Error', `Failed to migrate cache: ${e}`, 'error');
        }
        
        logger.groupEnd();
    },

    // 新增：一键执行缓存迁移
    runFullMigration: async () => {
        logger.prettyGroup('Full Avatar Cache Migration', 'important', false);
        
        try {
            // 1. 获取所有已知用户映射
            const mappings = AvatarMigrationTool.getAllMappings();
            const mappingCount = Object.keys(mappings).length;
            
            if (mappingCount === 0) {
                logger.pretty('No Mappings', 'No user ID mappings available. Login to register mappings automatically.', 'warn');
                logger.groupEnd();
                return;
            }
            
            logger.pretty('Mappings', `Found ${mappingCount} user ID mappings`, 'info');
            
            // 2. 清理无效键
            await AvatarDebugTools.cleanupInvalidKeys();
            
            // 3. 迁移已知映射
            await AvatarDebugTools.migrateInvalidKeys(mappings);
            
            logger.pretty('Complete', 'Full migration process completed', 'success');
        } catch (e) {
            logger.pretty('Error', `Migration failed: ${e}`, 'error');
        }
        
        logger.groupEnd();
    }
};

// Add to global object for console use
if (typeof window !== 'undefined') {
    (window as any).avatarDebug = AvatarDebugTools;
    logger.pretty('Debug Tools', 'Avatar debug tools loaded (window.avatarDebug)', 'important');
}

export default AvatarDebugTools;
