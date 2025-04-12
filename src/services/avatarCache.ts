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

        // 检查内存缓存
        const cacheKey = userId;
        const cachedEntry = this.memoryCache.get(cacheKey);

        // 如果缓存存在且头像URL未变，直接返回缓存的数据URL
        if (cachedEntry && cachedEntry.originalUrl === avatarUrl &&
            Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
            return cachedEntry.dataUrl;
        }

        try {
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
            this.memoryCache.set(cacheKey, entry);

            // 更新localStorage缓存
            localStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));

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
     */
    public async getAvatar(userId: string, avatarUrl?: string): Promise<string> {
        if (!this.initialized) this.init();

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

        // 如果所有尝试都失败，返回原始URL或默认头像
        return avatarUrl || this.getDefaultAvatar(userId);
    }

    /**
     * 清除特定用户的头像缓存
     * @param userId 用户ID
     */
    public clearCache(userId: string): void {
        const cacheKey = userId;
        this.memoryCache.delete(cacheKey);
        localStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
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
     * 获取基于用户ID的默认头像
     * @param userId 用户ID
     */
    private getDefaultAvatar(userId: string): string {
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
            ${userId.substring(0, 2).toUpperCase()}
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
            const response = await fetch(url, { cache: 'force-cache' });
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
}

// 创建并导出单例实例
export const avatarCache = new AvatarCacheService();
