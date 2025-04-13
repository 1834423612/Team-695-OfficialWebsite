import { casdoorService } from './auth';
import { checkAuthInResponse } from './apiInterceptor';
import { logger } from '@/utils/logger';

/**
 * Unified API call function with automatic authentication and error handling
 */
export async function callApi<T = any>(
    url: string,
    method: string = 'GET',
    data?: any,
    options: RequestInit = {}
): Promise<T> {
    const startTime = Date.now();
    try {
        // Prepare request options
        const requestOptions: RequestInit = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add request body
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(data);
        }

        // Add auth token
        const token = casdoorService.getToken();
        if (token) {
            (requestOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        logger.prettyGroup(`API Request: ${method} ${getDisplayUrl(url)}`, 'info', true);
        if (data) {
            logger.info('Request data:', data);
        }

        // Send request
        const response = await fetch(url, requestOptions);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Handle non-200 responses
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                logger.pretty('Auth Error', `Request returned status code ${response.status}`, 'error');
                logger.groupEnd();
                await casdoorService.handleInvalidAuthResponse();
                throw new Error(`Authentication error: ${response.status}`);
            }

            // Try to read error details
            let errorText;
            try {
                const errorResponse = await response.json();
                errorText = errorResponse.message || errorResponse.error || response.statusText;
            } catch (e) {
                errorText = response.statusText;
            }

            logger.http(method, url, response.status, duration);
            logger.pretty('Request Failed', errorText, 'error');
            logger.groupEnd();
            throw new Error(`API error (${response.status}): ${errorText}`);
        }

        // Parse JSON response
        const responseData = await response.json();
        logger.http(method, url, response.status, duration);
        
        // Show brief response summary
        const responsePreview = getResponsePreview(responseData);
        logger.info('Response data:', responsePreview);

        // Check for auth errors
        if (!checkAuthInResponse(responseData)) {
            logger.pretty('Auth Error', 'Authentication issue detected in API response', 'error');
            logger.groupEnd();
            throw new Error('Authentication error detected in API response');
        }

        logger.groupEnd();
        return responseData as T;
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.http(method, url, 500, duration); // Use 500 to indicate request failure
        logger.pretty('Request Exception', error instanceof Error ? error.message : String(error), 'error');
        if (logger.isGroupOpen()) {
            logger.groupEnd();
        }
        throw error;
    }
}

/**
 * Convenient GET request
 */
export function get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'GET', undefined, options);
}

/**
 * Convenient POST request
 */
export function post<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'POST', data, options);
}

/**
 * Convenient PUT request
 */
export function put<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'PUT', data, options);
}

/**
 * Convenient DELETE request
 */
export function del<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'DELETE', undefined, options);
}

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

// Add to logger to check if groups are open
if (typeof logger.isGroupOpen !== 'function') {
    let groupDepth = 0;
    
    const originalGroup = logger.prettyGroup;
    const originalGroupEnd = logger.groupEnd;
    
    logger.prettyGroup = function(...args) {
        groupDepth++;
        return originalGroup.apply(this, args);
    };
    
    logger.groupEnd = function() {
        if (groupDepth > 0) {
            groupDepth--;
        }
        return originalGroupEnd.apply(this);
    };
    
    logger.isGroupOpen = function() {
        return groupDepth > 0;
    };
}
