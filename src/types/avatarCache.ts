/**
 * Avatar Cache Service 类型定义
 * 定义头像缓存服务的接口，用于解决类型检查问题
 */

export interface CacheUserInfo {
    name?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    [key: string]: any;
}

export interface CacheEntry {
    userId: string;
    dataUrl: string;
    originalUrl: string;
    timestamp: number;
    userName?: string;
    displayName?: string;
}

export interface CacheStats {
    memoryEntries: number;
    dbEntries: number;
    requestEntries: number;
}

export interface MemoryCacheStatus {
    entriesCount: number;
    implementation: string;
    lastAccessed: string;
    hitRate: string | number;
}

export interface FlushResult {
    flushed: number;
    errors: number;
}

export interface RequestStats {
    [url: string]: {
        count: number;
        lastRequest: string;
        throttled: 'Yes' | 'No';
    };
}

/**
 * 头像缓存服务接口
 */
export interface AvatarCacheService {
    // 核心缓存方法
    cacheAvatar(userId: string, url: string, userInfo?: CacheUserInfo): Promise<string | null>;
    getAvatar(userId: string, url: string, userInfo?: CacheUserInfo): Promise<string>;
    clearCache(userId: string): Promise<void>;
    clearAllCache(): void;

    // 统计和调试方法
    getCacheStats(): Promise<CacheStats>;
    getRequestStats?(): Promise<RequestStats>;
    dumpAllCaches?(): Promise<Record<string, any>>;
    flushMemoryCache?(): Promise<FlushResult>;
    getMemoryCacheStatus?(): MemoryCacheStatus;
}
