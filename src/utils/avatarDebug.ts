/**
 * 头像缓存调试工具
 * 用于在控制台中查看和管理头像缓存状态
 * 
 * 使用方法:
 * 1. 在浏览器控制台中输入: window.avatarDebug.showCache()
 * 2. 查看所有缓存的头像: window.avatarDebug.dumpAllCache()
 * 3. 清除所有缓存: window.avatarDebug.clearAllCache()
 */
import { avatarCache } from '@/services/avatarCache';

// 缓存调试工具
const AvatarDebugTools = {
    // 显示缓存状态
    showCache: () => {
        console.group('Avatar Cache Status');
        
        // 显示缓存信息
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                count++;
            }
        }
        
        console.log(`Avatar cache entries: ${count}`);
        console.log('Sample entries:');
        
        // 显示最多5个示例
        let shown = 0;
        for (let i = 0; i < localStorage.length && shown < 5; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        const entry = JSON.parse(value);
                        console.log(`${key}:`, {
                            userId: key.substring('avatar_cache_'.length),
                            originalUrl: entry.originalUrl,
                            timestamp: new Date(entry.timestamp).toLocaleString(),
                            expired: Date.now() - entry.timestamp > 7 * 24 * 60 * 60 * 1000,
                            dataUrl: entry.dataUrl.substring(0, 50) + '...'
                        });
                        shown++;
                    } catch (e) {
                        console.log(`${key}: [Invalid JSON]`);
                    }
                }
            }
        }
        
        console.groupEnd();
    },
    
    // 转储所有缓存
    dumpAllCache: () => {
        const entries: Record<string, any> = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('avatar_cache_')) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        const entry = JSON.parse(value);
                        entries[key] = {
                            userId: key.substring('avatar_cache_'.length),
                            originalUrl: entry.originalUrl,
                            timestamp: new Date(entry.timestamp).toLocaleString(),
                            expired: Date.now() - entry.timestamp > 7 * 24 * 60 * 60 * 1000
                        };
                    } catch (e) {
                        entries[key] = '[Invalid JSON]';
                    }
                }
            }
        }
        
        console.table(entries);
        return entries;
    },
    
    // 清除所有缓存
    clearAllCache: () => {
        avatarCache.clearAllCache();
        console.log('All avatar caches cleared');
    },
    
    // 刷新特定用户的头像缓存
    refreshCache: async (userId: string, avatarUrl: string) => {
        try {
            const result = await avatarCache.cacheAvatar(userId, avatarUrl);
            console.log(`Cache refresh for ${userId}: ${result ? 'Success' : 'Failed'}`);
            return result;
        } catch (e) {
            console.error(`Failed to refresh cache for ${userId}:`, e);
            return null;
        }
    },
    
    // 手动强制缓存所有当前页面上显示的头像
    cacheAllVisible: async () => {
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="头像" i]');
        console.log(`Found ${avatarImgs.length} avatar images on page`);
        
        const results: Record<string, any> = {};
        let i = 0;
        
        // 使用 Promise.all 等待所有异步操作完成
        await Promise.all(
            Array.from(avatarImgs).map(async (img) => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                    const index = i++;
                    const userId = `manual_${index}`;
                    try {
                        const result = await avatarCache.cacheAvatar(userId, src);
                        results[src] = { success: !!result, userId };
                    } catch (e) {
                        results[src] = { success: false, error: String(e) };
                    }
                }
            })
        );
        
        console.table(results);
        return results;
    }
};

// 添加到全局对象，以便在控制台中使用
if (typeof window !== 'undefined') {
    (window as any).avatarDebug = AvatarDebugTools;
}

export default AvatarDebugTools;
