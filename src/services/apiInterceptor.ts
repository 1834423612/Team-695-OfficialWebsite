import { casdoorService } from './auth';

/**
 * API响应拦截器
 * 用于统一检查API响应中的身份验证错误
 */
export const checkAuthInResponse = (response: any): boolean => {
    if (!response) return true;
    
    // 针对标准错误格式进行检查
    if (response.success === true && response.data) {
        const data = response.data;
        
        // 检查特定的错误格式
        if (data.status === 'error' && data.msg) {
            const errorMsg = data.msg;
            
            // 检查与登录态相关的错误消息
            if (errorMsg.includes('token') || 
                errorMsg.includes('Access') || 
                errorMsg.includes('exist') ||
                errorMsg.includes('expired') ||
                errorMsg.includes('invalid')) {
                
                console.warn('API authentication error detected:', errorMsg);
                
                // 触发认证处理
                setTimeout(() => {
                    casdoorService.handleInvalidAuthResponse().catch(console.error);
                }, 0);
                
                return false;
            }
        }
    }
    
    return true;
};

/**
 * 通用的fetch API包装器，添加自动的身份验证和错误处理
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
    try {
        // 确保headers存在
        if (!options.headers) {
            options.headers = {};
        }
        
        // 添加授权头
        const token = casdoorService.getToken();
        if (token) {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
        
        // 发送请求
        const response = await fetch(url, options);
        
        // 检查HTTP状态
        if (!response.ok) {
            // 特殊处理401和403错误
            if (response.status === 401 || response.status === 403) {
                console.warn(`Auth error ${response.status} detected in API response`);
                await casdoorService.handleInvalidAuthResponse();
                throw new Error(`Authentication error: ${response.status}`);
            }
            throw new Error(`API error: ${response.status}`);
        }
        
        // 解析JSON响应
        const data = await response.json();
        
        // 检查认证错误
        checkAuthInResponse(data);
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};
