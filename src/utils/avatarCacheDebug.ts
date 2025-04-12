import { avatarCache } from '@/services/avatarCache';

// 为开发环境提供头像缓存调试工具
const AvatarCacheDebugger = {
    /**
     * 显示所有头像缓存项
     */
    listAllCaches() {
        const result: Record<string, any> = {};
        let count = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('avatar_cache_')) {
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
        
        console.log(`Found ${count} avatar cache entries`);
        console.table(result);
        return result;
    },
    
    /**
     * 手动测试缓存特定用户的头像
     */
    async testCache(userId: string, avatarUrl: string) {
        console.log(`Testing cache for user ${userId} with URL: ${avatarUrl}`);
        
        try {
            // 1. 清除现有缓存
            console.log('Clearing existing cache...');
            avatarCache.clearCache(userId);
            
            // 2. 缓存新头像
            console.log('Caching new avatar...');
            const result = await avatarCache.cacheAvatar(userId, avatarUrl);
            
            // 3. 验证缓存是否成功
            const cacheKey = `avatar_cache_${userId}`;
            const cachedData = localStorage.getItem(cacheKey);
            
            console.log('Cache result:', {
                success: !!result,
                cachedInLocalStorage: !!cachedData,
                dataLength: result?.length || 0,
                localStorageEntryLength: cachedData?.length || 0
            });
            
            return !!result && !!cachedData;
        } catch (error) {
            console.error('Test cache failed:', error);
            return false;
        }
    },
    
    /**
     * 清除所有头像缓存
     */
    clearAll() {
        avatarCache.clearAllCache();
        console.log('All avatar caches cleared');
        
        // 验证清除
        let remainingCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('avatar_cache_')) {
                remainingCount++;
            }
        }
        
        return {
            success: remainingCount === 0,
            remainingCaches: remainingCount
        };
    },
    
    /**
     * 检查localStorage空间使用情况
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
        
        // 排序得到最大的项
        const sortedItems = Object.entries(items)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // 只取前5个
            
        console.log('localStorage usage:', {
            totalMB: usageInMB.toFixed(2) + ' MB',
            avatarCacheMB: avatarUsageInMB.toFixed(2) + ' MB',
            avatarCachePercentage: (avatarCacheBytes / totalBytes * 100).toFixed(1) + '%',
            largestItems: Object.fromEntries(
                sortedItems.map(([key, size]) => [key, (size / 1024).toFixed(1) + ' KB'])
            )
        });
        
        return {
            totalBytes,
            avatarCacheBytes,
            usageInMB,
            avatarUsageInMB,
            largestItems: sortedItems
        };
    }
};

// 在开发环境中暴露给全局
if (process.env.NODE_ENV === 'development') {
    (window as any).avatarDebug = AvatarCacheDebugger;
    console.log('Avatar cache debugger available as window.avatarDebug');
}

export default AvatarCacheDebugger;
