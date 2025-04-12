/**
 * 认证调试工具
 * 用于在开发环境中监控和调试令牌状态
 */
import { casdoorService } from '@/services/auth';

// 为全局窗口对象添加类型定义
declare global {
    interface Window {
        authDebug?: typeof AuthDebugTools;
    }
}

/**
 * 简单的JWT签名验证工具
 * 注意：这只是一个基本验证，不执行完整的密码学验证
 */
const validateSignature = (token: string): boolean => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }

        // 检查签名是否存在且不为空
        const signature = parts[2];
        if (!signature || signature.trim() === '') {
            return false;
        }

        // 检查签名是否是有效的base64url字符串
        const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
        return base64UrlRegex.test(signature);
    } catch (e) {
        console.error('Error validating signature:', e);
        return false;
    }
};

// 调试工具对象
const AuthDebugTools = {
    // 检查令牌状态
    async checkTokenStatus() {
        const token = casdoorService.getToken();

        if (!token) {
            console.log('No token found');
            return { status: 'missing' };
        }

        try {
            // 解析令牌
            const tokenInfo = casdoorService.parseAccessToken(token);

            if (!tokenInfo || !tokenInfo.payload) {
                console.log('Invalid token format');
                return { status: 'invalid-format' };
            }

            const payload = tokenInfo.payload;
            const expiryTime = payload.exp * 1000;
            const now = Date.now();
            const isExpired = expiryTime <= now;
            const timeRemaining = isExpired ? 0 : Math.round((expiryTime - now) / 1000 / 60);

            console.group('Token Status');
            console.log(`Subject: ${payload.sub}`);
            console.log(`Name: ${payload.name}`);
            console.log(`Expired: ${isExpired ? 'Yes' : 'No'}`);
            console.log(`Time remaining: ${timeRemaining} minutes`);
            console.log(`Issuer: ${payload.iss}`);
            
            // 添加签名验证
            const signatureValid = validateSignature(token);
            console.log(`Signature format valid: ${signatureValid ? 'Yes' : 'No'}`);
            
            console.groupEnd();

            // 验证令牌有效性
            console.log('Validating token with Team API...');
            const validationResult = await casdoorService.validateWithTeamApi();

            console.log('Team API validation result:', validationResult);

            return {
                status: isExpired ? 'expired' : 'valid',
                timeRemaining,
                payload,
                signatureValid,
                teamApiValid: validationResult.valid,
                isAdmin: validationResult.isAdmin
            };
        } catch (error) {
            console.error('Error checking token status:', error);
            return { status: 'error', error };
        }
    },

    // 测试多重验证方法
    async testValidation() {
        const results: Record<string, any> = {};

        try {
            console.log('1. Testing casdoorService.validateToken...');
            results.validateToken = await casdoorService.validateToken();
        } catch (error) {
            results.validateToken = { error: String(error) };
        }

        try {
            console.log('2. Testing casdoorService.isTokenValid...');
            results.isTokenValid = await casdoorService.isTokenValid();
        } catch (error) {
            results.isTokenValid = { error: String(error) };
        }

        try {
            console.log('3. Testing casdoorService.validateWithTeamApi...');
            results.validateWithTeamApi = await casdoorService.validateWithTeamApi();
        } catch (error) {
            results.validateWithTeamApi = { error: String(error) };
        }

        console.table(results);
        return results;
    },

    // 测试令牌刷新
    async testRefresh() {
        try {
            console.log('Attempting to refresh token...');
            const newToken = await casdoorService.refreshAccessToken();
            console.log('Token refreshed successfully');
            return { success: true, tokenLength: newToken.length };
        } catch (error) {
            console.error('Token refresh failed:', error);
            return { success: false, error: String(error) };
        }
    }
};

// 在开发环境中将工具暴露给全局
if (process.env.NODE_ENV === 'development') {
    (window as any).authDebug = AuthDebugTools;
    console.log('Auth debug tools available as window.authDebug');
}

export default AuthDebugTools;
