/**
 * 用户头像缓存服务
 * 用于缓存用户头像到浏览器，避免频繁请求和第三方头像限流问题
 * 
 * 使用 IndexedDB 作为主要存储，提供更大的存储空间和更好的性能
 * 同时保留内存缓存，以便快速访问常用头像
 */

// 缓存键名前缀
const CACHE_PREFIX = 'avatar_cache_';
// 缓存有效期（默认7天）
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
// 头像默认尺寸
const DEFAULT_SIZE = 200;
// 数据库名称和版本
const DB_NAME = 'avatar_cache_db';
const DB_VERSION = 2; // 提高版本号，以支持新的索引和存储结构
const STORE_NAME = 'avatars';
// 请求控制 - 同一URL的最小请求间隔（24小时）
const REQUEST_THROTTLE = 24 * 60 * 60 * 1000;
// 最近请求记录存储
const REQUEST_STORE = 'avatar_requests';

interface CacheEntry {
    dataUrl: string;
    timestamp: number;
    originalUrl: string;
    userId: string; // 添加明确的用户ID关联
    userName?: string; // 可选：存储用户名以便于调试和识别
    displayName?: string; // 可选：存储显示名以便于调试和识别
}

interface RequestRecord {
    url: string;
    timestamp: number;
    count: number; // 计数器，记录请求次数
}

class AvatarCacheService {
    // 内存缓存，用于快速访问
    private memoryCache: Map<string, CacheEntry> = new Map();
    // 请求记录，用于控制请求频率
    private requestCache: Map<string, RequestRecord> = new Map();
    // 数据库连接
    private dbPromise: Promise<IDBDatabase> | null = null;
    // 是否已初始化
    private initialized: boolean = false;
    // 初始化Promise，用于跟踪初始化过程
    private initPromise: Promise<void> | null = null;

    constructor() {
        // 构造函数中自动启动初始化过程
        this.initPromise = this.init();
    }

    /**
     * 检查服务是否已初始化
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 初始化缓存服务
     * - 打开IndexedDB连接
     * - 加载关键头像到内存缓存
     * - 初始化请求控制系统
     * 
     * 多次调用是安全的，会返回相同的Promise
     */
    public async init(): Promise<void> {
        // 如果已经有初始化过程在进行，直接返回该Promise
        if (this.initPromise) {
            return this.initPromise;
        }

        // 如果已初始化完成，直接返回
        if (this.initialized) {
            return Promise.resolve();
        }

        console.log('Initializing avatar cache service...');
        
        try {
            // 打开数据库连接
            this.dbPromise = this.openDatabase();
            await this.dbPromise;
            
            // 迁移旧的localStorage数据到IndexedDB
            await this.migrateFromLocalStorage();
            
            // 从IndexedDB预加载最近的头像到内存缓存
            await this.preloadRecentAvatars();
            
            // 加载请求记录到内存
            await this.loadRequestRecords();
            
            this.initialized = true;
            console.log(`Avatar cache initialized with ${this.memoryCache.size} entries in memory cache`);
        } catch (e) {
            console.error('Failed to initialize avatar cache:', e);
            // 重置初始化状态，允许重试
            this.initPromise = null;
            throw e;
        }
    }

    /**
     * 缓存用户头像
     * @param userId 用户ID
     * @param avatarUrl 头像URL
     * @param userInfo 可选的用户信息，帮助识别头像所属用户
     */
    public async cacheAvatar(
        userId: string, 
        avatarUrl: string | null | undefined,
        userInfo?: {
            name?: string,
            displayName?: string
        }
    ): Promise<string | null> {
        // 确保服务已初始化
        if (!this.initialized) {
            await this.init();
        }

        if (!userId || !avatarUrl) return null;

        try {
            // 检查请求频率限制
            if (this.shouldThrottleRequest(avatarUrl)) {
                console.log(`Request throttled for URL: ${avatarUrl}`);
                
                // 如果有缓存，返回缓存
                const cachedEntry = this.memoryCache.get(userId);
                if (cachedEntry) {
                    return cachedEntry.dataUrl;
                }
                
                // 尝试从DB获取
                const dbEntry = await this.getFromDb(userId);
                if (dbEntry) {
                    // 更新内存缓存
                    this.memoryCache.set(userId, dbEntry);
                    return dbEntry.dataUrl;
                }
                
                // 如果没有缓存，返回null让调用者使用默认头像
                return null;
            }
            
            console.log(`Caching avatar for user ${userId}: ${avatarUrl}`);

            // 记录请求以控制频率
            this.recordRequest(avatarUrl);

            // 获取图像并转换为Data URL
            const dataUrl = await this.fetchImageAsDataUrl(avatarUrl);

            if (!dataUrl) return null;

            // 创建缓存条目，包含用户信息
            const entry: CacheEntry = {
                dataUrl,
                timestamp: Date.now(),
                originalUrl: avatarUrl,
                userId: userId,
                userName: userInfo?.name,
                displayName: userInfo?.displayName
            };

            // 更新内存缓存
            this.memoryCache.set(userId, entry);

            // 保存到IndexedDB
            await this.saveToDb(userId, entry);

            return dataUrl;
        } catch (e) {
            console.error(`Failed to cache avatar for user ${userId}:`, e);
            return null;
        }
    }

    /**
     * 获取缓存的头像
     * @param userId 用户ID
     * @param avatarUrl 原始头像URL（如果缓存不存在或过期）
     * @param userInfo 用户信息对象（用于生成更准确的默认头像）
     * @param cacheOnly 是否只使用缓存（不获取新头像）
     */
    public async getAvatar(
        userId: string, 
        avatarUrl?: string,
        userInfo?: {
            firstName?: string,
            lastName?: string,
            displayName?: string,
            name?: string
        },
        cacheOnly: boolean = false
    ): Promise<string> {
        // 确保服务已初始化
        if (!this.initialized) {
            await this.init();
        }
        
        // 检查内存缓存
        const cachedEntry = this.memoryCache.get(userId);
        
        // 如果有有效缓存，返回缓存的数据URL
        if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
            // 如果提供了新URL且与缓存的不同，异步更新缓存（但需要检查频率限制）
            if (avatarUrl && cachedEntry.originalUrl !== avatarUrl && !cacheOnly && !this.shouldThrottleRequest(avatarUrl)) {
                this.cacheAvatar(userId, avatarUrl, {
                    name: userInfo?.name,
                    displayName: userInfo?.displayName
                }).catch(console.error);
            }
            return cachedEntry.dataUrl;
        }
        
        // 如果内存缓存中没有，尝试从IndexedDB获取
        try {
            const entry = await this.getFromDb(userId);
            if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
                // 将找到的条目放入内存缓存
                this.memoryCache.set(userId, entry);
                
                // 如果提供了新URL且与缓存的不同，异步更新缓存（但需要检查频率限制）
                if (avatarUrl && entry.originalUrl !== avatarUrl && !cacheOnly && !this.shouldThrottleRequest(avatarUrl)) {
                    this.cacheAvatar(userId, avatarUrl, {
                        name: userInfo?.name,
                        displayName: userInfo?.displayName
                    }).catch(console.error);
                }
                
                return entry.dataUrl;
            }
        } catch (e) {
            console.warn(`Failed to get avatar from DB for ${userId}:`, e);
        }
        
        // 检查并迁移旧缓存
        this.migrateOldCache(userId);
        
        // 如果没有有效缓存但提供了URL且不是只使用缓存模式，尝试缓存并返回
        if (avatarUrl && !cacheOnly && !this.shouldThrottleRequest(avatarUrl)) {
            const dataUrl = await this.cacheAvatar(userId, avatarUrl, {
                name: userInfo?.name,
                displayName: userInfo?.displayName
            });
            if (dataUrl) return dataUrl;
        }
        
        // 如果所有尝试都失败，返回默认头像
        return this.getDefaultAvatar(
            userId,
            userInfo?.firstName,
            userInfo?.lastName,
            userInfo?.displayName,
            userInfo?.name
        );
    }

    /**
     * 清除特定用户的头像缓存
     * @param userId 用户ID
     */
    public async clearCache(userId: string): Promise<void> {
        // 确保服务已初始化
        if (!this.initialized) {
            await this.init();
        }

        // 从内存缓存移除
        this.memoryCache.delete(userId);
        
        // 从IndexedDB移除
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await promisifyRequest(store.delete(userId));
        } catch (e) {
            console.error(`Failed to delete avatar for ${userId} from DB:`, e);
        }
        
        // 清除旧版本localStorage缓存（兼容性）
        localStorage.removeItem(`${CACHE_PREFIX}${userId}`);
        this.clearOldCache(userId);
    }

    /**
     * 清除所有头像缓存
     */
    public async clearAllCache(): Promise<void> {
        // 确保服务已初始化
        if (!this.initialized) {
            await this.init();
        }

        // 清除内存缓存
        this.memoryCache.clear();
        
        // 清除IndexedDB
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await promisifyRequest(store.clear());
        } catch (e) {
            console.error('Failed to clear avatar database:', e);
        }
        
        // 清除localStorage中的旧缓存（兼容性）
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        }
        
        // 也清除请求记录
        this.requestCache.clear();
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            if (db.objectStoreNames.contains(REQUEST_STORE)) {
                const transaction = db.transaction([REQUEST_STORE], 'readwrite');
                const store = transaction.objectStore(REQUEST_STORE);
                await promisifyRequest(store.clear());
            }
        } catch (e) {
            console.error('Failed to clear request records:', e);
        }
    }

    /**
     * 检查是否应该限制请求
     * @param url 请求的URL
     * @returns 是否应该限制请求
     */
    private shouldThrottleRequest(url: string): boolean {
        const record = this.requestCache.get(url);
        if (!record) return false;
        
        const timeSinceLastRequest = Date.now() - record.timestamp;
        
        // 根据频率计算限流策略
        // 如果请求计数较高且时间较短，进行更严格的限制
        let throttleTime = REQUEST_THROTTLE;
        
        if (record.count > 10) {
            // 请求超过10次，限流时间加倍
            throttleTime = REQUEST_THROTTLE * 2;
        } else if (record.count > 5) {
            // 请求超过5次，限流时间增加50%
            throttleTime = REQUEST_THROTTLE * 1.5;
        }
        
        return timeSinceLastRequest < throttleTime;
    }

    /**
     * 记录请求以控制频率
     * @param url 请求的URL
     */
    private recordRequest(url: string): void {
        const now = Date.now();
        const existingRecord = this.requestCache.get(url);
        
        if (existingRecord) {
            // 如果记录比较旧（超过限制时间），重置计数器
            if (now - existingRecord.timestamp > REQUEST_THROTTLE) {
                this.requestCache.set(url, {
                    url,
                    timestamp: now,
                    count: 1
                });
            } else {
                // 否则增加计数器
                this.requestCache.set(url, {
                    url,
                    timestamp: now,
                    count: existingRecord.count + 1
                });
            }
        } else {
            // 新URL，创建新记录
            this.requestCache.set(url, {
                url,
                timestamp: now,
                count: 1
            });
        }
        
        // 保存到IndexedDB
        this.saveRequestRecord(url, this.requestCache.get(url)!).catch(e => {
            console.warn('Failed to save request record:', e);
        });
    }

    /**
     * 保存请求记录到IndexedDB
     */
    private async saveRequestRecord(url: string, record: RequestRecord): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readwrite');
            const store = transaction.objectStore(REQUEST_STORE);
            await promisifyRequest(store.put(record, url));
        } catch (e) {
            console.error(`Failed to save request record for ${url}:`, e);
        }
    }

    /**
     * 从IndexedDB加载请求记录
     */
    private async loadRequestRecords(): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readonly');
            const store = transaction.objectStore(REQUEST_STORE);
            const records = await promisifyRequest<RequestRecord[]>(store.getAll());
            const urls = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
            
            // 加载到内存
            for (let i = 0; i < urls.length; i++) {
                if (i < records.length) {
                    this.requestCache.set(String(urls[i]), records[i]);
                }
            }
            
            console.log(`Loaded ${this.requestCache.size} request records`);
            
            // 清理过期的请求记录
            this.cleanupRequestRecords();
        } catch (e) {
            console.error('Failed to load request records:', e);
        }
    }

    /**
     * 清理过期的请求记录
     */
    private async cleanupRequestRecords(): Promise<void> {
        const now = Date.now();
        const expiredUrls: string[] = [];
        
        // 查找过期记录
        this.requestCache.forEach((record, url) => {
            if (now - record.timestamp > REQUEST_THROTTLE * 3) {
                expiredUrls.push(url);
            }
        });
        
        // 从内存缓存中删除
        for (const url of expiredUrls) {
            this.requestCache.delete(url);
        }
        
        // 从IndexedDB删除
        try {
            if (expiredUrls.length === 0) return;
            
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readwrite');
            const store = transaction.objectStore(REQUEST_STORE);
            
            for (const url of expiredUrls) {
                promisifyRequest(store.delete(url)).catch(e => {
                    console.warn(`Failed to delete expired request record for ${url}:`, e);
                });
            }
            
            console.log(`Cleaned up ${expiredUrls.length} expired request records`);
        } catch (e) {
            console.error('Failed to cleanup expired request records:', e);
        }
    }

    /**
     * 获取基于用户信息的默认头像
     * @param userId 用户ID
     * @param firstName 名字
     * @param lastName 姓氏 
     * @param displayName 显示名称
     * @param name 用户名
     */
    private getDefaultAvatar(
        userId: string,
        firstName?: string,
        lastName?: string,
        displayName?: string,
        name?: string
    ): string {
        // 生成首字母
        let initials: string;

        // 优先使用firstName和lastName
        if (firstName && lastName) {
            initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        }
        // 其次使用displayName并尝试拆分
        else if (displayName) {
            const parts = displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            } else {
                initials = displayName.substring(0, 2).toUpperCase();
            }
        }
        // 再次使用name
        else if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            } else {
                initials = name.substring(0, 2).toUpperCase();
            }
        }
        // 最后使用userId
        else {
            initials = userId.substring(0, 2).toUpperCase();
        }

        // 根据用户ID生成一致的颜色
        const hash = this.hashCode(userId);
        const hue = hash % 360;
        const saturation = 75;
        const lightness = 65;

        // 创建一个简单的SVG作为默认头像
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${DEFAULT_SIZE}" height="${DEFAULT_SIZE}" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
            <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
                ${initials}
            </text>
        </svg>
        `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * 从URL获取图像并转换为Data URL
     * @param url 图像URL
     */
    private async fetchImageAsDataUrl(url: string): Promise<string | null> {
        try {
            const response = await fetch(url, {
                cache: 'force-cache',
                mode: 'cors',
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const blob = await response.blob();
            return await this.blobToDataUrl(blob);
        } catch (e) {
            console.warn(`Failed to fetch image from ${url}:`, e);
            return null;
        }
    }

    /**
     * 将Blob转换为Data URL
     * @param blob 图像Blob
     */
    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * 计算字符串的哈希码（用于生成默认头像颜色）
     * @param str 输入字符串
     */
    private hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    /**
     * 清除旧版本的缓存键
     * @param userId 用户ID
     */
    private clearOldCache(userId: string): void {
        // 这里可以添加清除旧版本缓存键的逻辑
        const oldKeys = [
            `avatar_${userId}`,
            `user_avatar_${userId}`
        ];

        for (const key of oldKeys) {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * 迁移旧版本的缓存键
     * @param userId 用户ID
     */
    private migrateOldCache(userId: string): void {
        const oldKeys = [
            `avatar_${userId}`,
            `user_avatar_${userId}`
        ];

        for (const key of oldKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    // 尝试解析旧缓存
                    const parsed = JSON.parse(value);
                    if (parsed && parsed.dataUrl) {
                        // 创建新的缓存条目
                        const entry: CacheEntry = {
                            dataUrl: parsed.dataUrl,
                            timestamp: parsed.timestamp || Date.now(),
                            originalUrl: parsed.originalUrl || '',
                            userId: userId
                        };

                        // 保存到新缓存
                        this.memoryCache.set(userId, entry);
                        localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(entry));

                        // 删除旧缓存
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    console.warn(`Failed to migrate old cache for ${key}:`, e);
                }
            }
        }
    }

    /**
     * 清除最旧的缓存以释放空间
     * 当localStorage空间不足时调用
     */
    private clearOldestCaches(): void {
        try {
            // 收集所有头像缓存项
            const cacheEntries: { key: string, timestamp: number }[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            const entry = JSON.parse(value) as CacheEntry;
                            cacheEntries.push({
                                key,
                                timestamp: entry.timestamp
                            });
                        } catch (e) {
                            // 如果解析失败，将其视为最旧的缓存
                            cacheEntries.push({
                                key,
                                timestamp: 0
                            });
                        }
                    }
                }
            }

            // 按时间戳升序排序（最旧的在前）
            cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

            // 删除前1/3的缓存项
            const removeCount = Math.ceil(cacheEntries.length / 3);
            console.log(`Clearing ${removeCount} oldest avatar caches`);

            for (let i = 0; i < removeCount && i < cacheEntries.length; i++) {
                const key = cacheEntries[i].key;
                const userId = key.substring(CACHE_PREFIX.length);
                this.memoryCache.delete(userId);
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error('Error clearing oldest caches:', e);
        }
    }

    /**
     * 打开IndexedDB数据库连接
     */
    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported in this browser'));
                return;
            }
            
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                reject(new Error(`Failed to open IndexedDB: ${(event.target as any).errorCode}`));
            };
            
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // 创建头像存储
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
                
                // 创建请求记录存储
                if (!db.objectStoreNames.contains(REQUEST_STORE)) {
                    const requestStore = db.createObjectStore(REQUEST_STORE);
                    // 为请求记录添加时间戳索引，方便清理过期记录
                    requestStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    /**
     * 将缓存条目保存到IndexedDB
     */
    private async saveToDb(userId: string, entry: CacheEntry): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            try {
                await promisifyRequest(store.put(entry, userId));
            } catch (storageError) {
                console.warn('Storage error, attempting to clear space:', storageError);
                // 存储遇到问题时清理空间
                await this.ensureStorageSpace();
                // 再次尝试保存
                const newTransaction = db.transaction([STORE_NAME], 'readwrite');
                const newStore = newTransaction.objectStore(STORE_NAME);
                await promisifyRequest(newStore.put(entry, userId));
            }
        } catch (e) {
            console.error(`Failed to save avatar to IndexedDB for ${userId}:`, e);
            throw e;
        }
    }
    
    /**
     * 从IndexedDB获取缓存条目
     */
    private async getFromDb(userId: string): Promise<CacheEntry | undefined> {
        try {
            const db = await this.dbPromise;
            if (!db) return undefined;
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const result = await promisifyRequest<CacheEntry | undefined>(store.get(userId));
            return result;
        } catch (e) {
            console.error(`Failed to get avatar from IndexedDB for ${userId}:`, e);
            throw e;
        }
    }
    
    /**
     * 从IndexedDB获取所有缓存条目
     */
    private async getAllFromDb(): Promise<Array<[string, CacheEntry]>> {
        try {
            const db = await this.dbPromise;
            if (!db) return [];
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const values = await promisifyRequest<CacheEntry[]>(store.getAll());
            const keys = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
            
            // 修复类型错误，确保正确构建[string, CacheEntry][]数组
            const result: Array<[string, CacheEntry]> = [];
            
            for (let i = 0; i < keys.length; i++) {
                if (i < values.length) {
                    result.push([String(keys[i]), values[i]]);
                }
            }
            
            return result;
        } catch (e) {
            console.error('Failed to get all avatars from IndexedDB:', e);
            throw e;
        }
    }
    
    /**
     * 迁移旧的localStorage数据到IndexedDB
     */
    private async migrateFromLocalStorage(): Promise<void> {
        try {
            const migratedKeys: string[] = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    const userId = key.substring(CACHE_PREFIX.length);
                    const value = localStorage.getItem(key);
                    
                    if (value) {
                        try {
                            const entry = JSON.parse(value) as CacheEntry;
                            
                            // 迁移到IndexedDB
                            await this.saveToDb(userId, entry);
                            migratedKeys.push(key);
                        } catch (e) {
                            console.warn(`Failed to parse localStorage entry for ${key}:`, e);
                        }
                    }
                }
            }
            
            // 迁移成功后清除localStorage条目
            for (const key of migratedKeys) {
                localStorage.removeItem(key);
            }
            
            if (migratedKeys.length > 0) {
                console.log(`Migrated ${migratedKeys.length} avatar entries from localStorage to IndexedDB`);
            }
        } catch (e) {
            console.error('Failed to migrate from localStorage:', e);
        }
    }
    
    /**
     * 从IndexedDB预加载最近的头像到内存缓存
     */
    private async preloadRecentAvatars(limit: number = 20): Promise<void> {
        try {
            const allEntries = await this.getAllFromDb();
            
            // 按时间戳排序，只加载最近的
            allEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            
            // 限制加载数量
            const recentEntries = allEntries.slice(0, limit);
            
            // 加载到内存缓存
            for (const [userId, entry] of recentEntries) {
                this.memoryCache.set(userId, entry);
            }
            
            console.log(`Preloaded ${recentEntries.length} recent avatars into memory cache`);
        } catch (e) {
            console.error('Failed to preload recent avatars:', e);
        }
    }

    /**
     * 保存到IndexedDB时遇到存储问题时清理缓存空间
     */
    private async ensureStorageSpace(): Promise<void> {
        try {
            // 在保存遇到存储问题时调用 clearOldestCaches
            await this.clearOldestCaches();
            console.log('Storage space cleared for new avatars');
        } catch (e) {
            console.error('Failed to ensure storage space:', e);
        }
    }
    
    /**
     * 获取缓存信息统计
     * 用于调试和监控
     */
    public async getCacheStats(): Promise<{
        memoryEntries: number,
        requestEntries: number,
        dbEntries: number
    }> {
        try {
            // 确保已初始化
            if (!this.initialized) {
                await this.init();
            }
            
            let dbEntries = 0;
            try {
                const allEntries = await this.getAllFromDb();
                dbEntries = allEntries.length;
            } catch (e) {
                console.error('Failed to get DB entries count:', e);
            }
            
            return {
                memoryEntries: this.memoryCache.size,
                requestEntries: this.requestCache.size,
                dbEntries
            };
        } catch (e) {
            console.error('Failed to get cache stats:', e);
            return {
                memoryEntries: this.memoryCache.size,
                requestEntries: this.requestCache.size,
                dbEntries: 0
            };
        }
    }
}

/**
 * 将IndexedDB请求转换为Promise
 */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 创建并导出单例实例
export const avatarCache = new AvatarCacheService();

// 在导出完成后，在开发环境中添加调试功能
if (process.env.NODE_ENV === 'development') {
    // 在开发环境中添加全局调试变量
    (window as any).avatarCacheDebug = {
        service: avatarCache,
        testCache: async (userId: string, url: string, userName?: string) => {
            console.log(`Testing cache for ${userId} with ${url}`);
            const result = await avatarCache.cacheAvatar(userId, url, {name: userName});
            console.log('Result:', result ? 'Success' : 'Failed');
            return result;
        },
        getAllCaches: async () => {
            try {
                // 确保服务已初始化
                if (!avatarCache.isInitialized()) {
                    await avatarCache.init();
                }
                
                const db = await (avatarCache as any).dbPromise;
                if (!db) return {};
                
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const keys = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
                const values = await promisifyRequest<CacheEntry[]>(store.getAll());
                
                const result: Record<string, any> = {};
                
                for (let i = 0; i < keys.length; i++) {
                    const userId = String(keys[i]);
                    const entry = values[i];
                    
                    result[userId] = {
                        originalUrl: entry.originalUrl,
                        timestamp: new Date(entry.timestamp).toLocaleString(),
                        userName: entry.userName || 'unknown',
                        displayName: entry.displayName || 'unknown',
                        dataUrlLength: entry.dataUrl?.length || 0
                    };
                }
                
                return result;
            } catch (e) {
                console.error('Error getting all caches:', e);
                return { error: String(e) };
            }
        },
        getRequestStats: async () => {
            try {
                // 确保服务已初始化
                if (!avatarCache.isInitialized()) {
                    await avatarCache.init();
                }
                
                const stats = await avatarCache.getCacheStats();
                console.table(stats);
                
                // 获取请求记录详情
                const requestData: Record<string, any> = {};
                (avatarCache as any).requestCache.forEach((record: RequestRecord, url: string) => {
                    requestData[url] = {
                        lastRequest: new Date(record.timestamp).toLocaleString(),
                        count: record.count,
                        throttled: (avatarCache as any).shouldThrottleRequest(url) ? 'Yes' : 'No'
                    };
                });
                
                console.table(requestData);
                return { stats, requestData };
            } catch (e) {
                console.error('Error getting request stats:', e);
                return { error: String(e) };
            }
        }
    };
}
