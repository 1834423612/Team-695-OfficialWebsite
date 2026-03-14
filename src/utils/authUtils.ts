/**
 * Authentication utility functions
 * Provides global lock helpers and token-management utilities
 */

// Global lock keys
export const AUTH_LOCKS = {
    SIGNIN: 'casdoor_signin_in_progress',
    REFRESH: 'token_refresh_in_progress',
    VALIDATION: 'auth_validation_in_progress',
    USER_REFRESH: 'refreshing_user_info_lock',
    TEAM_API_VALIDATION: 'team_api_validation_in_progress'
};

/**
 * Clean up all stale locks
 * @param timeouts Lock timeout configuration
 */
export function cleanupStaleLocks(timeouts: Record<string, number>): void {
    const now = Date.now();
    
    // Check each lock
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
                // If a lock exists without a timestamp, treat it as invalid and clear it
                releaseAuthLock(lockKey);
            }
        }
    });
}

/**
 * Generate a unique lock ID
 * Uses crypto.randomUUID() when available, otherwise falls back to a backup method
 */
function generateLockId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback random ID generator
    return 'lock_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Set an authentication lock
 * @param lockKey Lock key
 * @returns An object containing the lock ID, or null if locking fails
 */
export function setAuthLock(lockKey: string): { success: boolean; lockId?: string } {
    // Return false if the lock already exists
    if (localStorage.getItem(lockKey) && localStorage.getItem(lockKey) !== 'false') {
        return { success: false };
    }
    
    // Generate a unique lock ID
    const lockId = generateLockId();
    
    // Set the lock and its timestamp
    try {
        localStorage.setItem(lockKey, lockId);
        localStorage.setItem(`${lockKey}_time`, Date.now().toString());
        localStorage.setItem(`${lockKey}_owner`, lockId);
        return { success: true, lockId };
    } catch (e) {
        console.error(`Failed to set auth lock ${lockKey}:`, e);
        // Try clearing potentially stale cached data to make room for the new lock
        try {
            for (const key of Object.values(AUTH_LOCKS)) {
                if (key !== lockKey) {
                    localStorage.removeItem(key);
                    localStorage.removeItem(`${key}_time`);
                    localStorage.removeItem(`${key}_owner`);
                }
            }
            // Try setting the lock again
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
 * Release an authentication lock
 * @param lockKey Lock key
 * @param lockId Optional lock ID; when provided, the lock is released only if it matches
 * @returns Whether the lock was released successfully
 */
export function releaseAuthLock(lockKey: string, lockId?: string): boolean {
    try {
        // If a lockId is provided, release the lock only when the ID matches
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
 * Check whether a lock exists and has not expired
 * @param lockKey Lock key
 * @param maxAge Maximum valid age of the lock, in milliseconds
 * @param lockId Optional lock ID; when provided, the lock is valid only if it matches
 */
export function isLockActive(lockKey: string, maxAge: number = 10000, lockId?: string): boolean {
    try {
        const currentLockValue = localStorage.getItem(lockKey);
        
        // If the lock does not exist or is explicitly set to false, treat it as inactive
        if (!currentLockValue || currentLockValue === 'false') {
            return false;
        }
        
        // Perform an ID match check when a lockId is provided
        if (lockId && currentLockValue !== lockId) {
            return false;
        }
        
        const lockTime = localStorage.getItem(`${lockKey}_time`);
        if (!lockTime) {
            // If the lock exists without a timestamp, treat it as active and add a timestamp
            try {
                localStorage.setItem(`${lockKey}_time`, Date.now().toString());
            } catch (e) {
                // Ignore errors; this is only to repair a missing timestamp
                console.warn(`Failed to add timestamp for lock ${lockKey}:`, e);
            }
            return true;
        }
        
        try {
            const lockTimestamp = parseInt(lockTime);
            if (isNaN(lockTimestamp)) {
                console.warn(`Invalid lock timestamp for ${lockKey}`);
                // Try to repair the timestamp
                localStorage.setItem(`${lockKey}_time`, Date.now().toString());
                return true;
            }
            return Date.now() - lockTimestamp < maxAge;
        } catch (e) {
            // If parsing the timestamp fails, clear the lock and return false
            console.warn(`Error checking lock timestamp for ${lockKey}, clearing lock:`, e);
            try {
                releaseAuthLock(lockKey);
            } catch (e2) {
                // Ignore cleanup errors
            }
            return false;
        }
    } catch (e) {
        console.error(`Error checking auth lock ${lockKey}:`, e);
        return false; // Assume the lock is inactive when an error occurs
    }
}

/**
 * Get the current lock ID
 * @param lockKey Lock key
 * @returns The lock ID, or null if the lock does not exist
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
 * Initialize authentication locks
 * - Clears stale locks
 * - Sets up a visibility-change listener
 */
export function initAuthLocks() {
    // Clean up all stale locks
    cleanupStaleLocks({
        [AUTH_LOCKS.SIGNIN]: 20000,      // 20 seconds
        [AUTH_LOCKS.REFRESH]: 10000,     // 10 seconds
        [AUTH_LOCKS.VALIDATION]: 15000,  // 15 seconds
        [AUTH_LOCKS.USER_REFRESH]: 10000, // 10 seconds
        [AUTH_LOCKS.TEAM_API_VALIDATION]: 10000 // 10 seconds
    });
    
    // Listen for visibility changes and recheck locks when the tab becomes active again
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                cleanupStaleLocks({
                    [AUTH_LOCKS.SIGNIN]: 20000,       // 20 seconds
                    [AUTH_LOCKS.REFRESH]: 10000,      // 10 seconds
                    [AUTH_LOCKS.VALIDATION]: 15000,   // 15 seconds
                    [AUTH_LOCKS.USER_REFRESH]: 10000, // 10 seconds
                    [AUTH_LOCKS.TEAM_API_VALIDATION]: 10000 // 10 seconds
                });
            }
        });
    }
}

// Run during application initialization
initAuthLocks();
