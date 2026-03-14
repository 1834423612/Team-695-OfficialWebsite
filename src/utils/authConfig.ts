/**
 * Authentication system configuration utilities
 * Provides unified helpers for managing authentication state and flags
 */

// Authentication flag keys
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
 * Check whether a flag exists
 * @param flag Flag key
 * @returns Whether the flag exists
 */
export function hasAuthFlag(flag: string): boolean {
    return localStorage.getItem(flag) === 'true';
}

/**
 * Set a flag
 * @param flag Flag key
 * @param value Flag value
 */
export function setAuthFlag(flag: string, value: boolean = true): void {
    if (value) {
        localStorage.setItem(flag, 'true');
    } else {
        localStorage.removeItem(flag);
    }
}

/**
 * Check whether the recent-login trust window is still active
 * @param minutes Trust period length after login, in minutes
 * @returns Whether the trust window is still active
 */
export function isRecentLogin(minutes: number = 10): boolean {
    const authCallbackTime = localStorage.getItem(AUTH_FLAGS.AUTH_CALLBACK_TIME);
    if (!authCallbackTime) return false;
    
    const loginTime = parseInt(authCallbackTime);
    if (isNaN(loginTime)) return false;
    
    // Check whether the login happened within the specified number of minutes
    return Date.now() - loginTime < minutes * 60 * 1000;
}

/**
 * Check whether all validation should be skipped
 * @returns Whether validation should be skipped
 */
export function shouldSkipAllValidation(): boolean {
    // Check the absolute-trust flag
    if (hasAuthFlag(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST) || hasAuthFlag(AUTH_FLAGS.SKIP_VALIDATION)) {
        return true;
    }
    
    // Check whether the login happened within the last 10 minutes
    if (isRecentLogin(10)) {
        return true;
    }
    
    return false;
}

/**
 * Set the absolute-trust flags
 * Used in special cases such as immediately after the initial login
 */
export function setAbsoluteTrust(): void {
    localStorage.setItem(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST, 'true');
    localStorage.setItem(AUTH_FLAGS.TOKEN_TRUSTED, 'true');
    localStorage.setItem(AUTH_FLAGS.TOKEN_VERIFIED, 'true');
    
    // Set the trust expiration time to 10 minutes from now
    const expireTime = Date.now() + 10 * 60 * 1000;
    localStorage.setItem(AUTH_FLAGS.TRUST_EXPIRE_TIME, expireTime.toString());
}

/**
 * Record the validation timestamp
 */
export function recordValidationTime(): void {
    const now = Date.now().toString();
    localStorage.setItem(AUTH_FLAGS.VALIDATION_TIME, now);
    localStorage.setItem(AUTH_FLAGS.AUTH_CHECK_TIME, now);
}

/**
 * Clear trust-related flags
 * Called after the trust window ends
 */
export function clearTrustFlags(): void {
    // Check whether the 10-minute trust window has passed
    if (!isRecentLogin(10)) {
        localStorage.removeItem(AUTH_FLAGS.TOKEN_ABSOLUTE_TRUST);
        localStorage.removeItem(AUTH_FLAGS.SKIP_VALIDATION);
        
        // Check the expiration time
        const expireTimeStr = localStorage.getItem(AUTH_FLAGS.TRUST_EXPIRE_TIME);
        if (expireTimeStr) {
            const expireTime = parseInt(expireTimeStr);
            if (!isNaN(expireTime) && Date.now() > expireTime) {
                // Clear regular trust flags after expiration as well
                localStorage.removeItem(AUTH_FLAGS.TOKEN_TRUSTED);
                localStorage.removeItem(AUTH_FLAGS.TRUST_EXPIRE_TIME);
            }
        }
    }
}

/**
 * Clear all authentication-related flags
 * Used during logout
 */
export function clearAllAuthFlags(): void {
    Object.values(AUTH_FLAGS).forEach(key => {
        localStorage.removeItem(key);
    });
}
