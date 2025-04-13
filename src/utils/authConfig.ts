/**
 * 认证配置工具，提供统一的身份验证状态管理
 * 集中所有涉及认证状态的标记，避免各组件各自实现
 */

// 信任标记名称
export const AUTH_FLAGS = {
    ABSOLUTE_TRUST: 'token_absolute_trust',    // 绝对信任标记
    TRUSTED: 'token_trusted',                  // 常规信任标记
    VERIFIED: 'token_verified',                // 验证通过标记
    AUTH_CALLBACK_TIME: 'auth_callback_completed_time', // 认证回调完成时间
    VALIDATION_TIME: 'last_token_validated_time', // 上次验证时间
    AUTH_CHECK_TIME: 'last_auth_check_time',   // 上次检查时间
    SKIP_ALL_VALIDATION: 'skip_all_token_validation', // 跳过所有验证
    IS_ADMIN_VALIDATED: 'is_admin_validated'   // 管理员身份已验证
};

// 检查标记是否存在
export function hasAuthFlag(flag: string): boolean {
    return localStorage.getItem(flag) === 'true';
}

// 设置标记
export function setAuthFlag(flag: string, value: boolean = true): void {
    if (value) {
        localStorage.setItem(flag, 'true');
    } else {
        localStorage.removeItem(flag);
    }
}

// 清除所有认证标记
export function clearAllAuthFlags(): void {
    Object.values(AUTH_FLAGS).forEach(flag => {
        if (flag !== AUTH_FLAGS.AUTH_CALLBACK_TIME && 
            flag !== AUTH_FLAGS.VALIDATION_TIME &&
            flag !== AUTH_FLAGS.AUTH_CHECK_TIME) {
            localStorage.removeItem(flag);
        }
    });
}

// 检查是否在登录回调后的短时间内 (10分钟)
export function isRecentLogin(minutes: number = 10): boolean {
    const callbackTime = localStorage.getItem(AUTH_FLAGS.AUTH_CALLBACK_TIME);
    if (!callbackTime) return false;
    
    const timestamp = parseInt(callbackTime);
    return !isNaN(timestamp) && (Date.now() - timestamp < minutes * 60 * 1000);
}

// 检查是否应该跳过所有验证
export function shouldSkipAllValidation(): boolean {
    // 检查绝对信任标记
    if (hasAuthFlag(AUTH_FLAGS.ABSOLUTE_TRUST) || hasAuthFlag(AUTH_FLAGS.SKIP_ALL_VALIDATION)) {
        return true;
    }
    
    // 检查登录后时间 (10分钟内)
    if (isRecentLogin(10)) {
        return true;
    }
    
    return false;
}

// 设置为绝对信任模式
export function setAbsoluteTrust(): void {
    localStorage.setItem(AUTH_FLAGS.ABSOLUTE_TRUST, 'true');
    localStorage.setItem(AUTH_FLAGS.TRUSTED, 'true');
    localStorage.setItem(AUTH_FLAGS.VERIFIED, 'true');
    localStorage.setItem(AUTH_FLAGS.AUTH_CALLBACK_TIME, Date.now().toString());
}

// 记录验证时间
export function recordValidationTime(): void {
    localStorage.setItem(AUTH_FLAGS.VALIDATION_TIME, Date.now().toString());
    localStorage.setItem(AUTH_FLAGS.AUTH_CHECK_TIME, Date.now().toString());
}

// 清除信任标记（10分钟后）
export function clearTrustFlags(): void {
    if (!isRecentLogin(10)) {
        localStorage.removeItem(AUTH_FLAGS.ABSOLUTE_TRUST);
        localStorage.removeItem(AUTH_FLAGS.SKIP_ALL_VALIDATION);
        // 保留基本的验证标记
        setAuthFlag(AUTH_FLAGS.VERIFIED);
    }
}
