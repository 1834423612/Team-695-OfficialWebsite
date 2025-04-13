/**
 * 环境敏感的日志工具
 * 在开发环境显示详细日志，在生产环境只显示重要日志
 * 并提供美化的日志输出格式
 */

// 判断当前是否为开发环境
const isDev = process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('192.168.') ||
    window.location.hostname.includes('127.0.0.');

// 日志级别
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

// 基于环境设置日志级别
const currentLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

// 日志样式配置
const styles = {
    debug: 'color: #6c757d; font-weight: bold;', // 灰色
    info: 'color: #0d6efd; font-weight: bold;',  // 蓝色
    warn: 'color: #fd7e14; font-weight: bold;',  // 橙色
    error: 'color: #dc3545; font-weight: bold;', // 红色
    important: 'color: #198754; font-weight: bold; font-size: 1.05em;', // 绿色，稍大
    reset: ''
};

// 卡片样式的颜色映射
const cardColors = {
    debug: '#6c757d',    // 灰色
    info: '#0d6efd',     // 蓝色
    warn: '#fd7e14',     // 橙色
    error: '#dc3545',    // 红色
    success: '#198754',  // 绿色
    primary: '#0d6efd',  // 主色调(蓝)
    secondary: '#6c757d', // 次要色调(灰)
    important: '#7209b7', // 紫色(重要)
    system: '#3a0ca3',   // 深紫色(系统)
};

// 获取时间戳字符串
const getTimeString = (): string => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0]; // 仅获取时:分:秒部分
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
};

// 获取样式颜色
const getTypeColor = (type: string): string => {
    if (type in cardColors) {
        return cardColors[type as keyof typeof cardColors];
    }
    // 如果提供的是自定义颜色值，直接返回
    if (type.startsWith('#') || type.startsWith('rgb') || type.startsWith('hsl')) {
        return type;
    }
    // 默认返回主色调
    return cardColors.primary;
};

// 创建日志记录对象
export const logger = {
    debug: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.DEBUG) {
            const timeStr = getTimeString();
            console.debug(`%c[DEBUG]%c ${timeStr} %c${message}`, styles.debug, '', styles.debug, ...args);
        }
    },

    info: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.INFO) {
            const timeStr = getTimeString();
            console.log(`%c[INFO]%c ${timeStr} %c${message}`, styles.info, '', styles.info, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.WARN) {
            const timeStr = getTimeString();
            console.warn(`%c[WARN]%c ${timeStr} %c${message}`, styles.warn, '', styles.warn, ...args);
        }
    },

    error: (message: string, ...args: any[]) => {
        if (currentLevel <= LogLevel.ERROR) {
            const timeStr = getTimeString();
            console.error(`%c[ERROR]%c ${timeStr} %c${message}`, styles.error, '', styles.error, ...args);
        }
    },

    // 强制显示的日志，无论在什么环境
    important: (message: string, ...args: any[]) => {
        const timeStr = getTimeString();
        console.log(`%c[IMPORTANT]%c ${timeStr} %c${message}`, styles.important, '', styles.important, ...args);
    },

    // 分组日志 - 创建一个折叠的组
    group: (title: string, collapsed: boolean = true) => {
        if (currentLevel <= LogLevel.DEBUG) {
            if (collapsed) {
                console.groupCollapsed(`%c[GROUP] %c${title}`, styles.info, styles.info);
            } else {
                console.group(`%c[GROUP] %c${title}`, styles.info, styles.info);
            }
        }
    },

    // 结束分组
    groupEnd: () => {
        if (currentLevel <= LogLevel.DEBUG) {
            console.groupEnd();
        }
    },

    /**
     * 漂亮的卡片式日志输出
     * @param title 左侧标题
     * @param content 右侧内容
     * @param type 样式类型，可以是预设值或自定义颜色
     * @param showTime 是否显示时间戳
     */
    pretty: (title: string, content: string, type: string = 'primary', showTime: boolean = false) => {
        // 由于卡片式输出更醒目，所以在生产环境仅过滤DEBUG级别的输出
        if (type === 'debug' && currentLevel > LogLevel.DEBUG) return;
        
        const color = getTypeColor(type);
        const timeStr = showTime ? getTimeString() : '';
        const timeLabel = showTime ? `[${timeStr}] ` : '';
        
        console.log(
            `%c ${title} %c ${timeLabel}${content} %c`,
            `background:${color};border:1px solid ${color}; padding: 2px 5px; border-radius: 4px 0 0 4px; color: white; font-weight: bold;`,
            `border:1px solid ${color}; padding: 2px 5px; border-radius: 0 4px 4px 0; color: ${color}; font-weight: normal;`,
            'background:transparent'
        );
    },

    /**
     * 带有大标题的分组日志 - 适合重要信息分组展示
     * @param title 标题文本
     * @param type 样式类型
     * @param collapsed 是否默认折叠
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
        
        if (collapsed) {
            console.groupCollapsed(`%c${title}`, logStyle);
        } else {
            console.group(`%c${title}`, logStyle);
        }
    },
    
    /**
     * 带有表格样式的日志，用于展示结构化数据
     * @param data 要展示的数据对象或数组
     * @param title 可选的标题
     */
    table: (data: any, title?: string) => {
        if (title) {
            const timeStr = getTimeString();
            console.log(`%c[TABLE]%c ${timeStr} %c${title}`, styles.info, '', styles.info);
        }
        console.table(data);
    },
    
    /**
     * 显示HTTP请求日志(美化版)
     * @param method 请求方法
     * @param url 请求URL
     * @param status 状态码
     * @param time 耗时(ms)
     */
    http: (method: string, url: string, status: number = 200, time: number = 0) => {
        // 根据状态码选择颜色
        let type = 'info';
        if (status >= 500) type = 'error';
        else if (status >= 400) type = 'warn';
        else if (status >= 300) type = 'secondary';
        else if (status >= 200) type = 'success';
        
        // 仅展示URL的路径部分
        let urlPath = url;
        try {
            const urlObj = new URL(url);
            urlPath = urlObj.pathname + urlObj.search;
        } catch (e) { /* 如果不是有效的URL，使用原始值 */ }
        
        // 格式化状态码和耗时
        const statusText = `${status}`;
        const timeText = time > 0 ? `${time}ms` : '';
        
        logger.pretty(
            method.toUpperCase(),
            `${urlPath} ${statusText} ${timeText}`, 
            type,
            true
        );
    },
    
    /**
     * 自定义级别的控制台输出
     * @param level 日志级别
     * @param message 消息内容
     * @param args 附加参数
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
        method(`%c[${label}]%c ${timeStr} %c${message}`, style, '', style, ...args);
    }
};

// 导出环境判断值
export { isDev };
