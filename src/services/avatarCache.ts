/**
 * 用户头像缓存服务
 * 用于缓存用户头像到浏览器，避免频繁请求和第三方头像限流问题
 */

// 缓存键名前缀
const CACHE_PREFIX = 'avatar_cache_';
// 缓存有效期（默认7天）
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
// 头像默认尺寸
const DEFAULT_SIZE = 200;

interface CacheEntry {
    dataUrl: string;
    timestamp: number;
    originalUrl: string;
}

class AvatarCacheService {
    // 内存缓存，用于快速访问
    private memoryCache: Map<string, CacheEntry> = new Map();
    // 是否已初始化
    private initialized: boolean = false;

    /**
     * 检查服务是否已初始化
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 初始化缓存服务，加载本地存储的缓存
     */
    public init(): void {
        if (this.initialized) return;

        try {
            // 从localStorage加载现有缓存
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            const entry = JSON.parse(value) as CacheEntry;
                            // 检查缓存是否有效
                            if (Date.now() - entry.timestamp < CACHE_DURATION) {
                                // 提取用户ID作为键
                                const userId = key.substring(CACHE_PREFIX.length);
                                this.memoryCache.set(userId, entry);
                            } else {
                                // 清除过期缓存
                                localStorage.removeItem(key);
                            }
                        } catch (e) {
                            console.warn('Invalid cache entry:', key, e);
                            localStorage.removeItem(key);
                        }
                    }
                }
            }

            this.initialized = true;
            console.log(`Avatar cache initialized with ${this.memoryCache.size} entries`);
        } catch (e) {
            console.error('Failed to initialize avatar cache:', e);
        }
    }

    /**
     * 缓存用户头像
     * @param userId 用户ID
     * @param avatarUrl 头像URL
     */
    public async cacheAvatar(userId: string, avatarUrl: string | null | undefined): Promise<string | null> {
        if (!this.initialized) this.init();
        if (!userId || !avatarUrl) return null;

        // 清除旧版本缓存键（如果有）
        this.clearOldCache(userId);

        try {
            console.log(`Caching avatar for user ${userId}: ${avatarUrl}`);

            // 获取图像并转换为Data URL
            const dataUrl = await this.fetchImageAsDataUrl(avatarUrl);

            if (!dataUrl) return null;

            // 创建缓存条目
            const entry: CacheEntry = {
                dataUrl,
                timestamp: Date.now(),
                originalUrl: avatarUrl
            };

            // 更新内存缓存
            this.memoryCache.set(userId, entry);

            // 更新localStorage缓存 - 确保使用正确的键
            const cacheKey = `${CACHE_PREFIX}${userId}`;

            // 转换为JSON字符串并保存
            const entryJson = JSON.stringify(entry);
            try {
                localStorage.setItem(cacheKey, entryJson);
                console.log(`Avatar cached in localStorage with key: ${cacheKey} (${entryJson.length} bytes)`);

                // 检查是否成功保存
                const saved = localStorage.getItem(cacheKey);
                if (!saved) {
                    console.warn('Failed to verify localStorage save, item not found after setting');
                }
            } catch (storageError) {
                // 检查是否是配额错误
                if (storageError instanceof DOMException &&
                    (storageError.name === 'QuotaExceededError' ||
                        storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    console.warn('localStorage quota exceeded, clearing old caches');
                    this.clearOldestCaches();

                    // 再次尝试保存
                    try {
                        localStorage.setItem(cacheKey, entryJson);
                    } catch (e) {
                        console.error('Still failed to save avatar to localStorage after clearing old caches');
                    }
                } else {
                    console.error('Error saving to localStorage:', storageError);
                }
            }

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
     */
    public async getAvatar(
        userId: string, 
        avatarUrl?: string,
        userInfo?: {
            firstName?: string,
            lastName?: string,
            displayName?: string,
            name?: string
        }
    ): Promise<string> {
        if (!this.initialized) this.init();

        // 检查是否有旧版本缓存键
        this.migrateOldCache(userId);
        
        // 检查内存缓存
        const cacheKey = userId;
        const cachedEntry = this.memoryCache.get(cacheKey);
        
        // 如果有有效缓存，返回缓存的数据URL
        if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
            // 如果提供了新URL且与缓存的不同，异步更新缓存
            if (avatarUrl && cachedEntry.originalUrl !== avatarUrl) {
                this.cacheAvatar(userId, avatarUrl).catch(console.error);
            }
            return cachedEntry.dataUrl;
        }
        
        // 如果没有有效缓存但提供了URL，尝试缓存并返回
        if (avatarUrl) {
            const dataUrl = await this.cacheAvatar(userId, avatarUrl);
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
    public clearCache(userId: string): void {
        const cacheKey = userId;
        this.memoryCache.delete(cacheKey);
        localStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);

        // 清除旧版本缓存键（如果有）
        this.clearOldCache(userId);
    }

    /**
     * 清除所有头像缓存
     */
    public clearAllCache(): void {
        this.memoryCache.clear();

        // 清除所有相关的localStorage项
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
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
                            originalUrl: parsed.originalUrl || ''
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
}

// 创建并导出单例实例
export const avatarCache = new AvatarCacheService();

// 初始化实例
avatarCache.init();

// 导出完成后，手动运行一些调试代码以验证
if (process.env.NODE_ENV === 'development') {
    // 在开发环境中添加全局调试变量
    (window as any).avatarCacheDebug = {
        service: avatarCache,
        testCache: async (userId: string, url: string) => {
            console.log(`Testing cache for ${userId} with ${url}`);
            const result = await avatarCache.cacheAvatar(userId, url);
            console.log('Result:', result ? 'Success' : 'Failed');

            // 验证存储
            const cacheKey = `${CACHE_PREFIX}${userId}`;
            const stored = localStorage.getItem(cacheKey);
            console.log(`Stored in localStorage: ${!!stored}`);

            return result;
        },
        getAllCaches: () => {
            const result: Record<string, any> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    try {
                        const value = localStorage.getItem(key);
                        if (value) {
                            const entry = JSON.parse(value);
                            result[key] = {
                                userId: key.substring(CACHE_PREFIX.length),
                                originalUrl: entry.originalUrl,
                                timestamp: new Date(entry.timestamp).toLocaleString(),
                                dataUrlLength: entry.dataUrl?.length || 0
                            };
                        }
                    } catch (e) {
                        result[key] = 'Error parsing';
                    }
                }
            }
            return result;
        }
    };
}
