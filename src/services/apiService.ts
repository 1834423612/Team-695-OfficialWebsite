import { casdoorService } from './auth';
import { checkAuthInResponse } from './apiInterceptor';

/**
 * 统一的API调用函数，包含自动的认证和错误处理
 */
export async function callApi<T = any>(
    url: string,
    method: string = 'GET',
    data?: any,
    options: RequestInit = {}
): Promise<T> {
    try {
        // 准备请求选项
        const requestOptions: RequestInit = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 添加请求体
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(data);
        }

        // 添加认证令牌
        const token = casdoorService.getToken();
        if (token) {
            (requestOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        // 发送请求
        const response = await fetch(url, requestOptions);

        // 处理非200响应
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn(`Auth error ${response.status} detected in API response`);
                await casdoorService.handleInvalidAuthResponse();
                throw new Error(`Authentication error: ${response.status}`);
            }

            // 尝试读取错误详情
            let errorText;
            try {
                const errorResponse = await response.json();
                errorText = errorResponse.message || errorResponse.error || response.statusText;
            } catch (e) {
                errorText = response.statusText;
            }

            throw new Error(`API error (${response.status}): ${errorText}`);
        }

        // 解析JSON响应
        const responseData = await response.json();

        // 检查认证错误
        if (!checkAuthInResponse(responseData)) {
            throw new Error('Authentication error detected in API response');
        }

        return responseData as T;
    } catch (error) {
        console.error(`API call to ${url} failed:`, error);
        throw error;
    }
}

/**
 * 便捷的GET请求
 */
export function get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'GET', undefined, options);
}

/**
 * 便捷的POST请求
 */
export function post<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'POST', data, options);
}

/**
 * 便捷的PUT请求
 */
export function put<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'PUT', data, options);
}

/**
 * 便捷的DELETE请求
 */
export function del<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return callApi<T>(url, 'DELETE', undefined, options);
}
