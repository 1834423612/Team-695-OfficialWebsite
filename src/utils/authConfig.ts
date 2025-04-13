/**
 * 认证系统配置工具
 * 提供用于管理认证状态和标记的统一函数
 */

// 认证标记键名
export const AUTH_FLAGS = {
    AUTH_CALLBACK_TIME: 'auth_callback_completed_time',
    VALIDATION_TIME: 'last_token_validated_time',  
    AUTH_CHECK_TIME: 'last_auth_check_time',
    TOKEN_VERIFIED: 'token_verified',
    TOKEN_TRUSTED: 'token_trusted',
    TOKEN_ABSOLUTE_TRUST: 'token_absolute_trust',
    SKIP_VALIDATION: 'skip_all_token_validation',
    TRUST_EXPIRE_TIME: 'trust_flags_expire_at'
};

/**
 * 检查标记是否存在
 * @param flag 标记键名
 * @returns 是否存在
 */
export function hasAuthFlag(flag: string): boolean {
    return localStorage.getItem(flag) === 'true';
}

/**
 * 设置标记
 * @param flag 标记键名
 * @param value 标记值
 */
export function setAuthFlag(flag: string, value: boolean = true): void {
    if (value) {
        localStorage.setItem(flag, 'true');
    } else {
        localStorage.removeItem(flag);
    }
}

/**
 * 检查是否在近期登录的信任期内
 * @param minutes 登录后的信任分钟数
 * @returns 是否在信任期内
 */
export function isRecentLogin(minutes: number = 10): boolean {
    const authCallbackTime = localStorage.getItem(AUTH_FLAGS.AUTH_CALLBACK_TIME);
    if (!authCallbackTime) return false;
    
    const loginTime = parseInt(authCallbackTime);
    if (isNaN(loginTime)) return false;
    
    // 检查是否在指定分钟数内登录
    return Date.now() - loginTime < minutes * 60 * 1000;
}

/**
 * 检查是否应该跳过所有验证
 * @returns 是否跳过
 */
export function shouldSkipAllValidation(): boolean {
    // 检查绝对信任标记
    if (hasAuthFlag(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST) || hasAuthFlag(AUTH_FLAGS.SKIP_VALIDATION)) {
        return true;
    }
    
    // 检查登录后时间 (10分钟内)
    if (isRecentLogin(10)) {
        return true;
    }
    
    return false;
}

/**
 * 设置绝对信任标记
 * 在初始登录后等特殊场景下使用
 */
export function setAbsoluteTrust(): void {
    localStorage.setItem(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST, 'true');
    localStorage.setItem(AUTH_FLAGS.TOKEN_TRUSTED, 'true');
    localStorage.setItem(AUTH_FLAGS.TOKEN_VERIFIED, 'true');
    
    // 设置信任过期时间 - 10分钟后过期
    const expireTime = Date.now() + 10 * 60 * 1000;
    localStorage.setItem(AUTH_FLAGS.TRUST_EXPIRE_TIME, expireTime.toString());
}

/**
 * 记录验证时间
 */
export function recordValidationTime(): void {
    const now = Date.now().toString();
    localStorage.setItem(AUTH_FLAGS.VALIDATION_TIME, now);
    localStorage.setItem(AUTH_FLAGS.AUTH_CHECK_TIME, now);
}

/**
 * 清除信任标记
 * 在信任期结束后调用
 */
export function clearTrustFlags(): void {
    // 检查是否已过10分钟信任期
    if (!isRecentLogin(10)) {
        localStorage.removeItem(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST);
        localStorage.removeItem(AUTH_FLAGS.SKIP_VALIDATION);
        
        // 检查过期时间 
        const expireTimeStr = localStorage.getItem(AUTH_FLAGS.TRUST_EXPIRE_TIME);
        if (expireTimeStr) {
            const expireTime = parseInt(expireTimeStr);
            if (!isNaN(expireTime) && Date.now() > expireTime) {
                // 过期后还需要清除普通信任标记
                localStorage.removeItem(AUTH_FLAGS.TOKEN_TRUSTED);
                localStorage.removeItem(AUTH_FLAGS.TRUST_EXPIRE_TIME);
            }
        }
    }
}

/**
 * 清除所有认证相关标记
 * 用于登出时
 */
export function clearAllAuthFlags(): void {
    Object.values(AUTH_FLAGS).forEach(key => {
        localStorage.removeItem(key);
    });
}
