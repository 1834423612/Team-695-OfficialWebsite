/**
 * Environment-sensitive logging utility
 * Displays detailed logs in development environment, only important logs in production
 * Provides beautified log output format with source tracking
 */

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('192.168.') ||
    window.location.hostname.includes('127.0.0.');

// Log levels
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

// Set log level based on environment
const currentLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

// Log style configuration
const styles = {
    debug: 'color: #6c757d; font-weight: bold;', // Gray
    info: 'color: #0d6efd; font-weight: bold;',  // Blue
    warn: 'color: #ffc107; font-weight: bold;',  // Yellow
    error: 'color: #dc3545; font-weight: bold;', // Red
    important: 'color: #6f42c1; font-weight: bold;', // Purple
    success: 'color: #198754; font-weight: bold;',   // Green
    system: 'color: #20c997; font-weight: bold;',    // Teal
    primary: 'color: #0dcaf0; font-weight: bold;',   // Cyan
    secondary: 'color: #6c757d; font-weight: bold;', // Gray
};

// Helper function to get a formatted timestamp
const getTimeString = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
};

// Helper function to get color based on type
const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'success': return '#198754'; // Green
        case 'error': return '#dc3545';   // Red
        case 'warn': case 'warning': return '#ffc107'; // Yellow
        case 'info': return '#0d6efd';    // Blue
        case 'debug': return '#6c757d';   // Gray
        case 'important': return '#6f42c1'; // Purple
        case 'system': return '#20c997';    // Teal
        case 'primary': return '#0dcaf0';   // Cyan
        case 'secondary': return '#6c757d'; // Gray
        default: 
            // If type is a color value, use it directly
            if (type.startsWith('#') || type.startsWith('rgb')) {
                return type;
            }
            return '#0d6efd'; // Default to blue
    }
};

// Create stack trace extraction helper
const getCallerInfo = (): {file: string, line: number, column: number} => {
    const stackLines = new Error().stack?.split('\n') || [];
    // Skip first two lines (Error and getCallerInfo function)
    // Get the third line which should be the caller
    // We need to skip more lines because of how our wrapper functions work
    // Find the first line that isn't referencing logger.ts
    let callerLine = '';
    for (let i = 2; i < stackLines.length; i++) {
        if (!stackLines[i].includes('logger.ts')) {
            callerLine = stackLines[i];
            break;
        }
    }

    // Extract file path, line, and column
    const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
                  callerLine.match(/at\s+(.*):(\d+):(\d+)/);
    
    if (match) {
        const isSimpleCall = match.length === 4;
        const file = isSimpleCall ? match[1] : match[2];
        const line = parseInt(isSimpleCall ? match[2] : match[3], 10);
        const column = parseInt(isSimpleCall ? match[3] : match[4], 10);
        
        // Extract just the filename without the path
        const filenameParts = file.split('/');
        const filename = filenameParts[filenameParts.length - 1];
        
        return { file: filename, line, column };
    }
    
    return { file: 'unknown', line: 0, column: 0 };
};

// Track group depth for proper group closing
let groupDepth = 0;
// 添加组堆栈追踪
const groupStack: string[] = [];

// Create the logger object
export const logger = {
    debug: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.DEBUG) {
            const timeStr = getTimeString();
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            console.debug(
                `%c[DEBUG]%c ${timeStr} %c${message}%c ${callerInfo}`, 
                styles.debug, '', styles.debug, 'color: #888; font-size: 0.85em;', 
                ...args
            );
        }
    },

    info: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.INFO) {
            const timeStr = getTimeString();
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            console.log(
                `%c[INFO]%c ${timeStr} %c${message}%c ${callerInfo}`, 
                styles.info, '', styles.info, 'color: #888; font-size: 0.85em;', 
                ...args
            );
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.WARN) {
            const timeStr = getTimeString();
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            console.warn(
                `%c[WARN]%c ${timeStr} %c${message}%c ${callerInfo}`, 
                styles.warn, '', styles.warn, 'color: #888; font-size: 0.85em;', 
                ...args
            );
        }
    },

    error: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.ERROR) {
            const timeStr = getTimeString();
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            console.error(
                `%c[ERROR]%c ${timeStr} %c${message}%c ${callerInfo}`, 
                styles.error, '', styles.error, 'color: #888; font-size: 0.85em;', 
                ...args
            );
        }
    },

    // Force display log regardless of environment
    important: (message: string, ...args: any[]) => {
        const timeStr = getTimeString();
        const caller = getCallerInfo();
        const callerInfo = `${caller.file}:${caller.line}`;
        console.log(
            `%c[IMPORTANT]%c ${timeStr} %c${message}%c ${callerInfo}`, 
            styles.important, '', styles.important, 'color: #888; font-size: 0.85em;', 
            ...args
        );
    },

    // Group logs - create a collapsed group
    group: (title: string, collapsed: boolean = true) => {
        if (currentLevel <= LogLevel.DEBUG) {
            groupDepth++;
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            const groupTitle = `[GROUP] ${title} ${callerInfo}`;
            
            // 添加到组堆栈
            groupStack.push(title);
            
            if (collapsed) {
                console.groupCollapsed(groupTitle);
            } else {
                console.group(groupTitle);
            }
        }
    },

    // End group
    groupEnd: () => {
        if (currentLevel <= LogLevel.DEBUG && groupDepth > 0) {
            console.groupEnd();
            groupDepth--;
            // 从堆栈中移除
            if (groupStack.length > 0) {
                groupStack.pop();
            }
        }
    },
    
    // 检查是否有组处于打开状态
    isGroupOpen: (): boolean => {
        return groupDepth > 0;
    },

    // 获取当前组嵌套深度
    getGroupDepth: (): number => {
        return groupDepth;
    },
    
    // 获取当前组堆栈
    getGroupStack: (): string[] => {
        return [...groupStack];
    },
    
    // 重置所有组嵌套 - 用于确保清理所有未关闭的组
    resetGroups: () => {
        while (groupDepth > 0) {
            console.groupEnd();
            groupDepth--;
        }
        groupStack.length = 0; // 清空堆栈
        console.log('[LOGGER] All groups have been reset');
    },

    // 安全关闭组 - 确保关闭特定组及其所有子组
    safeGroupEnd: (title?: string) => {
        if (currentLevel <= LogLevel.DEBUG) {
            if (title) {
                // 查找标题在堆栈中的位置
                const index = groupStack.lastIndexOf(title);
                if (index !== -1) {
                    const closeCount = groupStack.length - index;
                    for (let i = 0; i < closeCount; i++) {
                        console.groupEnd();
                        groupDepth--;
                        groupStack.pop();
                    }
                    console.log(`[LOGGER] Safely closed group "${title}" and ${closeCount-1} nested groups`);
                } else if (groupDepth > 0) {
                    // 如果找不到特定标题，但仍有打开的组，则关闭最近的组
                    console.groupEnd();
                    groupDepth--;
                    console.log(`[LOGGER] Group "${title}" not found, closed the most recent group "${groupStack.pop() || 'unknown'}"`);
                }
            } else if (groupDepth > 0) {
                // 如果没有指定标题，关闭最后一个组
                console.groupEnd();
                groupDepth--;
                console.log(`[LOGGER] Closed the most recent group "${groupStack.pop() || 'unknown'}"`);
            }
        }
    },

    /**
     * Card-style pretty logging
     * @param title Left-side title
     * @param content Right-side content
     * @param type Style type, can be preset value or custom color
     * @param showTime Display timestamp
     */
    pretty: (title: string, content: string, type: string = 'primary', showTime: boolean = false) => {
        // Since pretty outputs are more eye-catching, only filter debug level ones in production
        if (type === 'debug' && currentLevel > LogLevel.DEBUG) return;
        
        const color = getTypeColor(type);
        const timeStr = showTime ? getTimeString() : '';
        const timeLabel = showTime ? `[${timeStr}] ` : '';
        const caller = getCallerInfo();
        const callerInfo = `${caller.file}:${caller.line}`;
        
        console.log(
            `%c ${title} %c ${timeLabel}${content} %c ${callerInfo}`,
            `background:${color};border:1px solid ${color}; padding: 2px 5px; border-radius: 4px 0 0 4px; color: white; font-weight: bold;`,
            `border:1px solid ${color}; padding: 2px 5px; border-radius: 0 4px 4px 0; color: ${color}; font-weight: normal;`,
            'color: #888; font-size: 0.85em; padding-left: 4px;'
        );
    },

    /**
     * Beautified group logs with title
     * @param title Title text
     * @param type Style type
     * @param collapsed Whether the group is collapsed by default
     */
    prettyGroup: (title: string, type: string = 'primary', collapsed: boolean = false) => {
        const color = getTypeColor(type);
        const logStyle = `
            color: white; 
            background: ${color}; 
            padding: 2px 6px; 
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        `;
        
        const caller = getCallerInfo();
        const callerInfo = `${caller.file}:${caller.line}`;
        const groupTitle = `${title} ${callerInfo}`;
        
        groupDepth++;
        // 添加到组堆栈
        groupStack.push(title);
        
        if (collapsed) {
            console.groupCollapsed(`%c${groupTitle}`, logStyle);
        } else {
            console.group(`%c${groupTitle}`, logStyle);
        }
    },
    
    /**
     * Table-style logs for structured data
     * @param data Object or array to display
     * @param title Optional title
     */
    table: (data: any, title?: string) => {
        if (title) {
            const timeStr = getTimeString();
            const caller = getCallerInfo();
            const callerInfo = `${caller.file}:${caller.line}`;
            console.log(
                `%c[TABLE]%c ${timeStr} %c${title}%c ${callerInfo}`, 
                styles.info, '', styles.info, 'color: #888; font-size: 0.85em;'
            );
        }
        console.table(data);
    },
    
    /**
     * Display HTTP request log (beautified version)
     * @param method Request method
     * @param url Request URL
     * @param status Status code
     * @param time Time taken (ms)
     */
    http: (method: string, url: string, status: number = 200, time: number = 0) => {
        // Select color based on status code
        let type = 'info';
        if (status >= 500) type = 'error';
        else if (status >= 400) type = 'warn';
        else if (status >= 300) type = 'secondary';
        else if (status >= 200) type = 'success';
        
        // Only show path part of URL
        let urlPath = url;
        try {
            const urlObj = new URL(url);
            urlPath = urlObj.pathname + urlObj.search;
        } catch (e) { /* Use original value if not a valid URL */ }
        
        // Format status code and time
        const statusText = `${status}`;
        const timeText = time > 0 ? `${time}ms` : '';
        
        // Use pretty method directly to get caller info
        logger.pretty(
            method.toUpperCase(),
            `${urlPath} ${statusText} ${timeText}`, 
            type,
            true
        );
    },
    
    /**
     * Custom level console output
     * @param level Log level
     * @param message Message content
     * @param args Additional parameters
     */
    log: (level: LogLevel, message: string, ...args: any[]) => {
        if (level < currentLevel) return;
        
        const levelMap = {
            [LogLevel.DEBUG]: { method: console.debug, style: styles.debug, label: 'DEBUG' },
            [LogLevel.INFO]: { method: console.log, style: styles.info, label: 'INFO' },
            [LogLevel.WARN]: { method: console.warn, style: styles.warn, label: 'WARN' },
            [LogLevel.ERROR]: { method: console.error, style: styles.error, label: 'ERROR' }
        };
        
        const { method, style, label } = levelMap[level];
        const timeStr = getTimeString();
        const caller = getCallerInfo();
        const callerInfo = `${caller.file}:${caller.line}`;
        method(
            `%c[${label}]%c ${timeStr} %c${message}%c ${callerInfo}`, 
            style, '', style, 'color: #888; font-size: 0.85em;', 
            ...args
        );
    }
};

// Export environment detection value
export { isDev };
