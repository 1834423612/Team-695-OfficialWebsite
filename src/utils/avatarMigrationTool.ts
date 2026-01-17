/**
 * 头像缓存迁移工具
 * 用于修复使用initial代替真实用户ID的历史缓存问题
 */

import { logger } from '@/utils/logger';

export class AvatarMigrationTool {
    // 已知用户的initial到ID的映射
    private static knownUserMap: Record<string, string> = {};
    
    /**
     * 注册用户映射
     * @param initial 用户初始字母
     * @param userId 用户真实ID
     */
    public static registerUserIdMapping(initial: string, userId: string): void {
        if (!initial || !userId) return;
        
        this.knownUserMap[initial] = userId;
        logger.debug(`Registered user mapping: ${initial} -> ${userId}`);
    }
    
    /**
     * 批量注册用户映射
     * @param mappings 映射对象
     */
    public static registerUserMappings(mappings: Record<string, string>): void {
        Object.assign(this.knownUserMap, mappings);
    }
    
    /**
     * 在用户登录时自动注册映射
     * @param user 用户对象
     */
    public static registerUserOnLogin(user: any): void {
        if (!user || !user.id) return;
        
        // 计算用户的initial
        let initial = '';
        
        if (user.firstName && user.lastName) {
            initial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        } else if (user.displayName) {
            const parts = user.displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                initial = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            } else {
                initial = user.displayName.substring(0, 2).toUpperCase();
            }
        } else if (user.name) {
            initial = user.name.substring(0, 2).toUpperCase();
        }
        
        if (initial && user.id) {
            logger.debug(`Auto-registering user mapping from login: ${initial} -> ${user.id}`);
            this.registerUserIdMapping(initial, user.id);
        }
    }
    
    /**
     * 获取用户ID映射
     * @param initial 用户初始字母
     * @returns 映射的用户ID或undefined
     */
    public static getUserIdByInitial(initial: string): string | undefined {
        return this.knownUserMap[initial];
    }
    
    /**
     * 获取所有已知映射
     */
    public static getAllMappings(): Record<string, string> {
        return { ...this.knownUserMap };
    }
}

// 为了方便调试，添加到全局对象
if (typeof window !== 'undefined') {
    (window as any).avatarMigration = AvatarMigrationTool;
}

export default AvatarMigrationTool;
