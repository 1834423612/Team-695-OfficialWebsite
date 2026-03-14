/**
 * Authentication debugging tools
 * Used to monitor and debug token state in development
 */
import { casdoorService } from '@/services/auth';

// Add type definitions to the global window object
declare global {
    interface Window {
        authDebug?: typeof AuthDebugTools;
    }
}

/**
 * Simple JWT signature validation helper
 * Note: this is only a basic check and does not perform full cryptographic validation
 */
const validateSignature = (token: string): boolean => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }

        // Check that the signature exists and is not empty
        const signature = parts[2];
        if (!signature || signature.trim() === '') {
            return false;
        }

        // Check that the signature is a valid base64url string
        const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
        return base64UrlRegex.test(signature);
    } catch (e) {
        console.error('Error validating signature:', e);
        return false;
    }
};

// Debug tool object
const AuthDebugTools = {
    // Check token status
    async checkTokenStatus() {
        const token = casdoorService.getToken();

        if (!token) {
            console.log('No token found');
            return { status: 'missing' };
        }

        try {
            // Parse the token
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
            
            // Add signature validation
            const signatureValid = validateSignature(token);
            console.log(`Signature format valid: ${signatureValid ? 'Yes' : 'No'}`);
            
            console.groupEnd();

            // Validate token validity
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

    // Test multiple validation methods
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

    // Test token refresh
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

// Expose the tool globally in development
if (process.env.NODE_ENV === 'development') {
    (window as any).authDebug = AuthDebugTools;
    console.log('Auth debug tools available as window.authDebug');
}

export default AuthDebugTools;
