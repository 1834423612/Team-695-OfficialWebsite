/**
 * Avatar Cache Service type definitions
 * Defines the avatar cache service interfaces to resolve type-checking issues
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
 * Avatar cache service interface
 */
export interface AvatarCacheService {
    // Core cache methods
    cacheAvatar(userId: string, url: string, userInfo?: CacheUserInfo): Promise<string | null>;
    getAvatar(userId: string, url: string, userInfo?: CacheUserInfo): Promise<string>;
    clearCache(userId: string): Promise<void>;
    clearAllCache(): void;

    // Statistics and debugging methods
    getCacheStats(): Promise<CacheStats>;
    getRequestStats?(): Promise<RequestStats>;
    dumpAllCaches?(): Promise<Record<string, any>>;
    flushMemoryCache?(): Promise<FlushResult>;
    getMemoryCacheStatus?(): MemoryCacheStatus;
}
