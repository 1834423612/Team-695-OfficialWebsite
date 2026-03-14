import { casdoorService } from './auth';
import { logger } from '@/utils/logger';

/**
 * API interceptor utilities
 * Provides helper functions for checking authentication errors in API responses
 */

/**
 * Check API responses for authentication errors
 * @param response API response object
 * @returns Returns true when no authentication error exists, otherwise false
 */
export function checkAuthInResponse(response: any): boolean {
    logger.prettyGroup('API Auth Check', 'info', true);
    
    try {
        // Check whether the response is empty
        if (!response) {
            logger.pretty('Empty Response', 'No response data', 'error');
            return false;
        }
        
        // Check explicit error messages
        if (response.success === true && response.data && response.data.status === 'error') {
            const errorMsg = response.data.msg;
            
            if (errorMsg && (
                errorMsg.includes('token') || 
                errorMsg.includes('Access') || 
                errorMsg.includes('exist') ||
                errorMsg.includes('auth')
            )) {
                logger.pretty('Auth Error', errorMsg, 'error');
                
                // Trigger authentication error handling
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(error => {
                        logger.error('Error handling invalid auth:', error);
                    });
                }, 0);
                
                return false;
            }
        }
        
        // Check the generic error format
        if (response.status === 'error' && 
            response.msg && (
                response.msg.includes('token') || 
                response.msg.includes('Access') || 
                response.msg.includes('exist') ||
                response.msg.includes('auth')
            )) {
            logger.pretty('Auth Error', response.msg, 'error');
            return false;
        }
        
        // Handle responses that are effectively empty
        if (response.status === 'ok' && 
            (!response.sub || response.sub === '') && 
            (!response.name || response.name === '') && 
            (response.data === true || response.data === null) && 
            response.data2 === null) {
            logger.pretty('Invalid Response Format', 'Response appears to be a token validation error', 'warn');
            return false;
        }
        
        logger.pretty('Check Status', 'Response appears valid', 'success');
        return true;
    } catch (error) {
        logger.error('Error checking auth in response:', error);
        return false;
    } finally {
        // Use the safe group-closing helper
        logger.safeGroupEnd('API Auth Check');
    }
}

/**
 * General-purpose handler for API error responses
 * @param error Captured error object
 * @param handleAuthErrors Whether authentication errors should be handled automatically
 * @returns A formatted error object
 */
export function handleApiError(error: any, handleAuthErrors = true): {message: string, status?: number} {
    logger.prettyGroup('API Error Handler', 'error', true);
    
    try {
        // Default error message
        let message = 'An unexpected error occurred';
        let status: number | undefined = undefined;
        
        // Handle different types of errors
        if (error.response) {
            // The server returned an error response
            status = error.response.status;
            
            // Check for authentication errors
            if ((status === 401 || status === 403) && handleAuthErrors) {
                logger.pretty('Auth Error', `Status code: ${status}`, 'error');
                
                // Trigger authentication error handling
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(console.error);
                }, 0);
                
                message = 'Authentication failed. Please login again.';
            } else if (error.response.data && error.response.data.message) {
                // Use the error message returned by the server
                message = error.response.data.message;
            } else {
                // Use the HTTP status description
                message = `Server error: ${error.response.statusText || status}`;
            }
        } else if (error.request) {
            // The request was sent but no response was received
            message = 'No response received from server. Please check your connection.';
        } else if (error.message) {
            // Error while configuring the request
            message = error.message;
        }
        
        logger.pretty('Error Details', message, 'error');
        
        return { message, status };
    } catch (err) {
        logger.error('Error in handleApiError:', err);
        return { message: 'An unexpected error occurred' };
    } finally {
        // Use the safe group-closing helper
        logger.safeGroupEnd('API Error Handler');
    }
}

export default {
    checkAuthInResponse,
    handleApiError
};
