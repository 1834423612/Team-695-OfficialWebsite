import { casdoorService } from './auth';
import { logger } from '@/utils/logger';

/**
 * API Response Interceptor
 * For uniformly checking authentication errors in API responses
 */
export const checkAuthInResponse = (response: any): boolean => {
    if (!response) return true;
    
    // Check standard error format
    if (response.success === true && response.data) {
        const data = response.data;
        
        // Check specific error format
        if (data.status === 'error' && data.msg) {
            const errorMsg = data.msg;
            
            // Check for login-related error messages
            if (errorMsg.includes('token') || 
                errorMsg.includes('Access') || 
                errorMsg.includes('exist') ||
                errorMsg.includes('expired') ||
                errorMsg.includes('invalid')) {
                
                logger.pretty('Auth Error', errorMsg, 'error');
                
                // Trigger auth handling
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(error => 
                        logger.error('Failed to handle invalid auth response:', error)
                    );
                }, 0);
                
                return false;
            }
        }
    }
    
    return true;
};

/**
 * Common fetch API wrapper with automatic authentication and error handling
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
    const startTime = Date.now();
    let method = options.method || 'GET';
    
    try {
        // Ensure headers exist
        if (!options.headers) {
            options.headers = {};
        }
        
        // Add authorization header
        const token = casdoorService.getToken();
        if (token) {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
        
        logger.prettyGroup(`API Request: ${method} ${getDisplayUrl(url)}`, 'info', true);
        if (options.body && typeof options.body === 'string') {
            try {
                const bodyData = JSON.parse(options.body);
                logger.info('Request data:', bodyData);
            } catch (e) {
                // Ignore if not JSON
            }
        }
        
        // Send request
        const response = await fetch(url, options);
        const duration = Date.now() - startTime;
        
        // Check HTTP status
        if (!response.ok) {
            // Special handling for 401 and 403 errors
            if (response.status === 401 || response.status === 403) {
                logger.pretty('Auth Error', `${response.status} ${response.statusText}`, 'error');
                logger.http(method, url, response.status, duration);
                
                await casdoorService.handleInvalidAuthResponse();
                logger.groupEnd();
                throw new Error(`Authentication error: ${response.status}`);
            }
            
            logger.http(method, url, response.status, duration);
            logger.pretty('Request Failed', `${response.status} ${response.statusText}`, 'error');
            logger.groupEnd();
            throw new Error(`API error: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        logger.http(method, url, response.status, duration);
        
        // Show brief response summary
        const responsePreview = getResponsePreview(data);
        logger.info('Response data:', responsePreview);
        
        // Check for auth errors
        const isAuthValid = checkAuthInResponse(data);
        if (!isAuthValid) {
            logger.pretty('Auth Error', 'Authentication issue detected in response', 'error');
        }
        
        logger.groupEnd();
        return data;
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.http(method, url, 500, duration); // Use 500 to indicate request failure
        logger.pretty('Request Exception', error instanceof Error ? error.message : String(error), 'error');
        
        if (logger.isGroupOpen()) {
            logger.groupEnd();
        }
        throw error;
    }
};

/**
 * Helper function: Get URL for display (removes domain)
 */
function getDisplayUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
    } catch (e) {
        return url;
    }
}

/**
 * Helper function: Get preview of response data
 */
function getResponsePreview(data: any): any {
    if (!data) return data;
    
    // If array, return length and first few items
    if (Array.isArray(data)) {
        return {
            length: data.length,
            preview: data.slice(0, 3),
            ...(data.length > 3 ? { more: `...and ${data.length - 3} more items` } : {})
        };
    }
    
    // If object, return summary version
    if (typeof data === 'object') {
        // Create a summary version to avoid console lag with large objects
        const keys = Object.keys(data);
        if (keys.length > 10) {
            const preview: Record<string, any> = {};
            keys.slice(0, 10).forEach(key => {
                preview[key] = data[key];
            });
            return {
                ...preview,
                _summary: `[Object with ${keys.length} keys]`
            };
        }
    }
    
    return data;
}

// Add isGroupOpen method
if (typeof logger.isGroupOpen !== 'function') {
    logger.isGroupOpen = () => true;  // Default assume group is open to ensure safe closing
}
