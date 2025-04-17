import { casdoorService } from './auth';
import { logger } from '@/utils/logger';

/**
 * API 拦截器工具
 * 提供用于检查API响应中的认证错误的工具函数
 */

/**
 * 检查API响应中的认证错误
 * @param response API响应对象
 * @returns 如果不存在认证错误返回true，否则返回false
 */
export function checkAuthInResponse(response: any): boolean {
    logger.prettyGroup('API Auth Check', 'info', true);
    
    try {
        // 检查响应是否为空
        if (!response) {
            logger.pretty('Empty Response', 'No response data', 'error');
            return false;
        }
        
        // 检查明确的错误信息
        if (response.success === true && response.data && response.data.status === 'error') {
            const errorMsg = response.data.msg;
            
            if (errorMsg && (
                errorMsg.includes('token') || 
                errorMsg.includes('Access') || 
                errorMsg.includes('exist') ||
                errorMsg.includes('auth')
            )) {
                logger.pretty('Auth Error', errorMsg, 'error');
                
                // 触发认证错误处理
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(error => {
                        logger.error('Error handling invalid auth:', error);
                    });
                }, 0);
                
                return false;
            }
        }
        
        // 检查通用错误格式
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
        
        // 如果本质上是空响应
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
        // 使用安全的组关闭方法
        logger.safeGroupEnd('API Auth Check');
    }
}

/**
 * 处理API错误响应的通用方法
 * @param error 捕获的错误对象
 * @param handleAuthErrors 是否自动处理认证错误
 * @returns 格式化的错误对象
 */
export function handleApiError(error: any, handleAuthErrors = true): {message: string, status?: number} {
    logger.prettyGroup('API Error Handler', 'error', true);
    
    try {
        // 默认错误消息
        let message = 'An unexpected error occurred';
        let status: number | undefined = undefined;
        
        // 处理不同类型的错误
        if (error.response) {
            // 服务器返回错误响应
            status = error.response.status;
            
            // 检查认证错误
            if ((status === 401 || status === 403) && handleAuthErrors) {
                logger.pretty('Auth Error', `Status code: ${status}`, 'error');
                
                // 触发认证错误处理
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(console.error);
                }, 0);
                
                message = 'Authentication failed. Please login again.';
            } else if (error.response.data && error.response.data.message) {
                // 使用服务器返回的错误消息
                message = error.response.data.message;
            } else {
                // 使用HTTP状态描述
                message = `Server error: ${error.response.statusText || status}`;
            }
        } else if (error.request) {
            // 请求发送但未收到响应
            message = 'No response received from server. Please check your connection.';
        } else if (error.message) {
            // 请求设置过程中的错误
            message = error.message;
        }
        
        logger.pretty('Error Details', message, 'error');
        
        return { message, status };
    } catch (err) {
        logger.error('Error in handleApiError:', err);
        return { message: 'An unexpected error occurred' };
    } finally {
        // 使用安全的组关闭方法
        logger.safeGroupEnd('API Error Handler');
    }
}

export default {
    checkAuthInResponse,
    handleApiError
};
