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
        if (localStorage.getItem(lockKey) === 'true') {
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
 * 设置认证锁
 * @param lockKey 锁的键名
 * @returns 是否成功设置锁
 */
export function setAuthLock(lockKey: string): boolean {
    // 如果锁已存在，返回false
    if (localStorage.getItem(lockKey) === 'true') {
        return false;
    }
    
    // 设置锁和时间戳
    try {
        localStorage.setItem(lockKey, 'true');
        localStorage.setItem(`${lockKey}_time`, Date.now().toString());
        return true;
    } catch (e) {
        console.error(`Failed to set auth lock ${lockKey}:`, e);
        // 尝试清理一些可能的旧缓存，为新锁腾出空间
        try {
            for (const key of Object.values(AUTH_LOCKS)) {
                if (key !== lockKey) {
                    localStorage.removeItem(key);
                    localStorage.removeItem(`${key}_time`);
                }
            }
            // 再次尝试设置锁
            localStorage.setItem(lockKey, 'true');
            localStorage.setItem(`${lockKey}_time`, Date.now().toString());
            return true;
        } catch (e2) {
            console.error(`Still failed to set auth lock after cleanup:`, e2);
            return false;
        }
    }
}

/**
 * 释放认证锁
 * @param lockKey 锁的键名
 */
export function releaseAuthLock(lockKey: string): void {
    try {
        localStorage.removeItem(lockKey);
        localStorage.removeItem(`${lockKey}_time`);
    } catch (e) {
        console.error(`Error releasing auth lock ${lockKey}:`, e);
    }
}

/**
 * 检查锁是否存在且未过期
 * @param lockKey 锁的键名
 * @param maxAge 锁的最大有效期(毫秒)
 */
export function isLockActive(lockKey: string, maxAge: number = 10000): boolean {
    try {
        if (localStorage.getItem(lockKey) !== 'true') {
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
