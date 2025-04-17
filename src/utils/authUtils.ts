/**
 * 认证工具函数
 * 提供全局锁机制和令牌管理助手函数
 */

// 全局锁键
export const AUTH_LOCKS = {
    SIGNIN: 'casdoor_signin_in_progress',
    REFRESH: 'token_refresh_in_progress',
    VALIDATION: 'auth_validation_in_progress',
    USER_REFRESH: 'refreshing_user_info_lock',
    TEAM_API_VALIDATION: 'team_api_validation_in_progress'
};

/**
 * 清理所有过期的锁
 * @param timeouts 锁超时配置
 */
export function cleanupStaleLocks(timeouts: Record<string, number>): void {
    const now = Date.now();
    
    // 检查每个锁
    Object.keys(timeouts).forEach(lockKey => {
        const lockValue = localStorage.getItem(lockKey);
        if (lockValue && lockValue !== 'false') {
            const lockTime = localStorage.getItem(`${lockKey}_time`);
            if (lockTime) {
                const lockTimestamp = parseInt(lockTime);
                if (now - lockTimestamp > timeouts[lockKey]) {
                    console.warn(`Cleaning up stale auth lock: ${lockKey}`);
                    releaseAuthLock(lockKey);
                }
            } else {
                // 如果有锁但没有时间戳，假定为无效锁，清理它
                releaseAuthLock(lockKey);
            }
        }
    });
}

/**
 * 生成唯一的锁ID
 * 使用crypto.randomUUID()如果可用，否则使用备用方法
 */
function generateLockId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // 备用随机ID生成方法
    return 'lock_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * 设置认证锁
 * @param lockKey 锁的键名
 * @returns 包含锁ID的对象，或者null如果加锁失败
 */
export function setAuthLock(lockKey: string): { success: boolean; lockId?: string } {
    // 如果锁已存在，返回false
    if (localStorage.getItem(lockKey) && localStorage.getItem(lockKey) !== 'false') {
        return { success: false };
    }
    
    // 生成唯一的锁ID
    const lockId = generateLockId();
    
    // 设置锁和时间戳
    try {
        localStorage.setItem(lockKey, lockId);
        localStorage.setItem(`${lockKey}_time`, Date.now().toString());
        localStorage.setItem(`${lockKey}_owner`, lockId);
        return { success: true, lockId };
    } catch (e) {
        console.error(`Failed to set auth lock ${lockKey}:`, e);
        // 尝试清理一些可能的旧缓存，为新锁腾出空间
        try {
            for (const key of Object.values(AUTH_LOCKS)) {
                if (key !== lockKey) {
                    localStorage.removeItem(key);
                    localStorage.removeItem(`${key}_time`);
                    localStorage.removeItem(`${key}_owner`);
                }
            }
            // 再次尝试设置锁
            localStorage.setItem(lockKey, lockId);
            localStorage.setItem(`${lockKey}_time`, Date.now().toString());
            localStorage.setItem(`${lockKey}_owner`, lockId);
            return { success: true, lockId };
        } catch (e2) {
            console.error(`Still failed to set auth lock after cleanup:`, e2);
            return { success: false };
        }
    }
}

/**
 * 释放认证锁
 * @param lockKey 锁的键名
 * @param lockId 可选的锁ID，如果提供则只有匹配时才释放锁
 * @returns 是否成功释放锁
 */
export function releaseAuthLock(lockKey: string, lockId?: string): boolean {
    try {
        // 如果指定了lockId，则只有当当前锁的ID匹配时才释放
        if (lockId) {
            const currentLockId = localStorage.getItem(lockKey);
            if (currentLockId && currentLockId !== lockId) {
                console.warn(`Cannot release lock ${lockKey}: lock ID mismatch`);
                return false;
            }
        }
        
        localStorage.removeItem(lockKey);
        localStorage.removeItem(`${lockKey}_time`);
        localStorage.removeItem(`${lockKey}_owner`);
        return true;
    } catch (e) {
        console.error(`Error releasing auth lock ${lockKey}:`, e);
        return false;
    }
}

/**
 * 检查锁是否存在且未过期
 * @param lockKey 锁的键名
 * @param maxAge 锁的最大有效期(毫秒)
 * @param lockId 可选的锁ID，如果提供则只有匹配时才认为锁有效
 */
export function isLockActive(lockKey: string, maxAge: number = 10000, lockId?: string): boolean {
    try {
        const currentLockValue = localStorage.getItem(lockKey);
        
        // 如果锁不存在或已显式设置为false，则表示未激活
        if (!currentLockValue || currentLockValue === 'false') {
            return false;
        }
        
        // 如果指定了lockId，则进行匹配检查
        if (lockId && currentLockValue !== lockId) {
            return false;
        }
        
        const lockTime = localStorage.getItem(`${lockKey}_time`);
        if (!lockTime) {
            // 如果找不到时间戳但锁存在，我们认为锁是活动的，但同时添加一个时间戳
            try {
                localStorage.setItem(`${lockKey}_time`, Date.now().toString());
            } catch (e) {
                // 忽略错误，这只是为了修复缺失的时间戳
                console.warn(`Failed to add timestamp for lock ${lockKey}:`, e);
            }
            return true;
        }
        
        try {
            const lockTimestamp = parseInt(lockTime);
            if (isNaN(lockTimestamp)) {
                console.warn(`Invalid lock timestamp for ${lockKey}`);
                // 尝试修复
                localStorage.setItem(`${lockKey}_time`, Date.now().toString());
                return true;
            }
            return Date.now() - lockTimestamp < maxAge;
        } catch (e) {
            // 如果时间戳解析出错，清除锁并返回false
            console.warn(`Error checking lock timestamp for ${lockKey}, clearing lock:`, e);
            try {
                releaseAuthLock(lockKey);
            } catch (e2) {
                // 忽略清理错误
            }
            return false;
        }
    } catch (e) {
        console.error(`Error checking auth lock ${lockKey}:`, e);
        return false; // 出错时假设锁未激活
    }
}

/**
 * 获取当前锁的ID
 * @param lockKey 锁的键名
 * @returns 锁ID或null如果锁不存在
 */
export function getLockId(lockKey: string): string | null {
    try {
        return localStorage.getItem(lockKey);
    } catch (e) {
        console.error(`Error getting lock ID for ${lockKey}:`, e);
        return null;
    }
}

/**
 * 初始化认证锁
 * - 清理过期锁
 * - 设置可见性变化监听
 */
export function initAuthLocks() {
    // 清理所有过期的锁
    cleanupStaleLocks({
        [AUTH_LOCKS.SIGNIN]: 20000,      // 20秒
        [AUTH_LOCKS.REFRESH]: 10000,     // 10秒
        [AUTH_LOCKS.VALIDATION]: 15000,  // 15秒
        [AUTH_LOCKS.USER_REFRESH]: 10000, // 10秒
        [AUTH_LOCKS.TEAM_API_VALIDATION]: 10000 // 10秒
    });
    
    // 添加屏幕可见性变化监听，在标签页重新激活时检查锁
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                cleanupStaleLocks({
                    [AUTH_LOCKS.SIGNIN]: 20000,       // 20秒
                    [AUTH_LOCKS.REFRESH]: 10000,      // 10秒
                    [AUTH_LOCKS.VALIDATION]: 15000,   // 15秒
                    [AUTH_LOCKS.USER_REFRESH]: 10000, // 10秒
                    [AUTH_LOCKS.TEAM_API_VALIDATION]: 10000 // 10秒
                });
            }
        });
    }
}

// 应用初始化时执行
initAuthLocks();
