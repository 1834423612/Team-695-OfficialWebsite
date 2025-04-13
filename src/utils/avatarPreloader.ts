/**
 * 头像预加载工具
 * 
 * 用于在页面加载时预先加载和缓存可能会用到的头像
 * 避免用户滚动到看到头像区域时才开始加载和缓存
 */

import { avatarCache } from '@/services/avatarCache';
import { logger } from '@/utils/logger';

interface AvatarInfo {
    userId: string;
    url: string;
    userName?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    initial?: string;
}

class AvatarPreloader {
    private queue: AvatarInfo[] = [];
    private isProcessing: boolean = false;
    private concurrentLimit: number = 3; // 并发请求数量限制
    private intervalMs: number = 1000; // 请求间隔，避免请求过于频繁
    private logOperations: boolean = false; // 控制是否记录详细日志

    // 构造函数，只在开发环境记录详细日志
    constructor() {
        this.logOperations = process.env.NODE_ENV === 'development';
    }

    /**
     * 添加头像到预加载队列
     */
    public add(info: AvatarInfo): void {
        // 避免重复添加相同的URL
        if (info.url && this.queue.some(item => item.url === info.url)) {
            return;
        }
        
        this.queue.push(info);
        
        if (this.logOperations) {
            logger.debug(`Added avatar to preload queue: ${info.url || '(default)'} (${info.userId})`);
        }
        
        // 如果当前没有处理中的任务，启动处理
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    /**
     * 批量添加头像到预加载队列
     */
    public addBatch(items: AvatarInfo[]): void {
        if (!items || items.length === 0) return;
        
        // 过滤掉重复URL（对于有URL的项）
        const uniqueItems = items.filter(info => 
            !info.url || !this.queue.some(item => item.url === info.url)
        );
        
        this.queue.push(...uniqueItems);
        
        if (this.logOperations) {
            logger.debug(`Added ${uniqueItems.length} avatars to preload queue (${items.length - uniqueItems.length} duplicates skipped)`);
        }
        
        // 如果当前没有处理中的任务，启动处理
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    /**
     * 处理预加载队列
     * 使用批处理和延迟确保不会过载服务器
     */
    private async processQueue(): Promise<void> {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        try {
            // 每次处理并发限制数量的请求
            const batch = this.queue.splice(0, this.concurrentLimit);
            
            // 输出调试信息
            if (this.logOperations) {
                logger.debug(`Preloading ${batch.length} avatars, ${this.queue.length} remaining in queue`);
            }
            
            // 并行处理当前批次
            await Promise.all(batch.map(async info => {
                try {
                    if (info.url) {
                        // 如果有URL，缓存头像
                        await avatarCache.cacheAvatar(
                            info.userId,
                            info.url,
                            {
                                name: info.userName,
                                displayName: info.displayName,
                                initial: info.initial
                            }
                        );
                    } else {
                        // 如果没有URL，生成默认头像
                        await this.preloadDefault(
                            info.userId, 
                            {
                                name: info.userName,
                                displayName: info.displayName,
                                firstName: info.firstName, 
                                lastName: info.lastName,
                                initial: info.initial
                            }
                        );
                    }
                } catch (error) {
                    // 单个头像加载失败不应阻止其他头像继续加载
                    logger.warn(`Failed to preload avatar for ${info.userId}: ${info.url || '(default)'}`, error);
                }
            }));
            
            // 添加延迟，避免请求过于频繁
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), this.intervalMs);
            } else {
                this.isProcessing = false;
                if (this.logOperations) {
                    logger.debug('Avatar preload queue completed');
                }
            }
        } catch (e) {
            logger.error('Error processing avatar preload queue:', e);
            this.isProcessing = false;
            
            // 若出现错误，稍后重试剩余队列
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), this.intervalMs * 3);
            }
        }
    }

    /**
     * 预加载默认头像（无URL）
     * @param userId 用户ID
     * @param userInfo 用户信息
     */
    public preloadDefault(userId: string, userInfo?: any): Promise<string> {
        if (!userId) return Promise.resolve('');
        
        return avatarCache.getAvatar(userId, undefined, userInfo, true)
            .catch(e => {
                logger.warn(`Failed to preload default avatar for ${userId}: ${e}`);
                return '';
            });
    }
    
    /**
     * 预加载用户列表中的头像
     * @param users 用户列表
     */
    public preloadFromUsersList(users: any[]): void {
        if (!users || !Array.isArray(users) || users.length === 0) return;
        
        // 提前准备好队列项数组，包含所有用户
        const queueItems: AvatarInfo[] = users
            .filter(user => user && (user.id || user.userId)) // 只过滤掉没有ID的用户
            .map(user => {
                const userId = user.id || user.userId;
                const hasValidUrl = user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http');
                
                return {
                    userId,
                    url: hasValidUrl ? user.avatar : '', // 如果没有有效URL，则设为空字符串
                    userName: user.name,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    initial: this.getUserInitials(user)
                };
            });
        
        const withUrls = queueItems.filter(item => !!item.url).length;
        const withoutUrls = queueItems.length - withUrls;
        
        if (this.logOperations) {
            logger.info(
                `Preloading ${queueItems.length} avatars from users list ` +
                `(${withUrls} with URLs, ${withoutUrls} requiring default avatar generation)`
            );
        }
        
        // 批量添加到预加载队列
        if (queueItems.length > 0) {
            this.addBatch(queueItems);
        }
    }

    /**
     * 扫描页面并预加载可见的头像
     */
    public scanAndPreload(): void {
        // 查找页面上所有可能是头像的图片
        const avatarImgs = document.querySelectorAll('img[alt*="avatar" i], img[alt*="user" i], [data-avatar-url]');
        
        const toPreload: AvatarInfo[] = [];
        const defaultsToPreload: AvatarInfo[] = [];
        
        // 收集需要预加载的头像信息
        avatarImgs.forEach((elem: Element) => {
            // 处理data-avatar-url属性的元素
            const dataUrl = elem.getAttribute('data-avatar-url');
            if (dataUrl) {
                const userId = elem.getAttribute('data-user-id') || 'unknown';
                toPreload.push({
                    userId,
                    url: dataUrl,
                    userName: elem.getAttribute('data-user-name') || undefined,
                    displayName: elem.getAttribute('data-user-display-name') || undefined
                });
                return;
            }
            
            // 处理img元素
            const img = elem as HTMLImageElement;
            const src = img.getAttribute('src');
            
            // 跳过已经是data URL的头像(已经缓存过的)
            if (src && !src.startsWith('data:')) {
                const imgElement = img as HTMLElement;
                let userId = imgElement.getAttribute('data-user-id') || '';
                
                // 如果图像本身没有用户ID，尝试从父元素或属性获取
                if (!userId) {
                    const parentElement = imgElement.parentElement;
                    userId = parentElement?.getAttribute('data-user-id') || '';
                }
                
                // 如果没有找到用户ID，生成一个基于URL的唯一ID
                if (!userId && src) {
                    userId = `url_${hashCode(src)}`;
                }
                
                // 收集其他可能的用户信息
                const userInfo = {
                    userName: imgElement.getAttribute('data-user-name') || undefined,
                    displayName: imgElement.getAttribute('data-display-name') || undefined,
                    firstName: imgElement.getAttribute('data-first-name') || undefined,
                    lastName: imgElement.getAttribute('data-last-name') || undefined,
                    initial: imgElement.getAttribute('data-initial') || undefined
                };
                
                toPreload.push({
                    userId, 
                    url: src, 
                    ...userInfo
                });
            } else if (!src) {
                // 如果没有src属性但有data-user-id，可能需要生成默认头像
                const imgElement = img as HTMLElement;
                const userId = imgElement.getAttribute('data-user-id') || `default_${Math.random().toString(36).substring(2, 9)}`;
                
                defaultsToPreload.push({
                    userId,
                    url: '',
                    userName: imgElement.getAttribute('data-user-name') || undefined,
                    displayName: imgElement.getAttribute('data-display-name') || undefined,
                    firstName: imgElement.getAttribute('data-first-name') || undefined,
                    lastName: imgElement.getAttribute('data-last-name') || undefined,
                    initial: imgElement.getAttribute('data-initial') || undefined
                });
            }
        });
        
        if (this.logOperations) {
            logger.info(`Scanning found ${toPreload.length} external avatars to preload and ${defaultsToPreload.length} default avatars to generate`);
        }
        
        // 添加到预加载队列
        if (toPreload.length > 0) {
            this.addBatch(toPreload);
        }
        
        if (defaultsToPreload.length > 0) {
            this.addBatch(defaultsToPreload);
        }
    }

    /**
     * 从用户对象获取用户首字母
     * @param user 用户对象
     * @returns 用户首字母
     */
    private getUserInitials(user: any): string {
        if (!user) return '';
            
        // 从各种可能的来源生成初始字母
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        
        if (user.displayName) {
            const parts = user.displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return user.displayName.substring(0, 2).toUpperCase();
        }
        
        if (user.name) {
            const parts = user.name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return user.name.substring(0, 2).toUpperCase();
        }
        
        return (user.id || 'XX').substring(0, 2).toUpperCase();
    }

    /**
     * 切换日志记录
     */
    public setLogging(enabled: boolean): void {
        this.logOperations = enabled;
        logger.debug(`Avatar preloader logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * 设置并发限制和请求间隔
     */
    public setLimits(concurrentLimit: number, intervalMs: number): void {
        this.concurrentLimit = concurrentLimit;
        this.intervalMs = intervalMs;
        
        if (this.logOperations) {
            logger.debug(`Avatar preloader limits set: ${concurrentLimit} concurrent, ${intervalMs}ms interval`);
        }
    }
}

// 辅助函数：计算字符串的哈希码
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // 转换为32位整数
    }
    return Math.abs(hash);
}

// 导出单例
export const avatarPreloader = new AvatarPreloader();

// 添加到window对象方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).avatarPreloader = avatarPreloader;
}
