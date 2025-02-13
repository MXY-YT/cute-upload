import type {AxiosRequestConfig} from "axios";

// 用于存储每个请求的标识和取消函数
const pendingMap = new Map<string, AbortController>();

const getMapKey = (config: AxiosRequestConfig): string => {
    return `mapKey:url:${config.url}:data:${Object.values(config.data).join('')}`;
};

export class AxiosCanceler {
    /**
     * 添加请求
     * @param config 请求配置
     */
    public static addPending(config: AxiosRequestConfig): void {
        this.removePending(config);
        const key = getMapKey(config);
        const controller = new AbortController();
        config.signal = controller.signal;
        if (!pendingMap.has(key)) {
            // 如果当前请求不在等待中，将其添加到等待中
            pendingMap.set(key, controller);
        }
    }

    /**
     * 清除所有等待中的请求
     */
    public static removeAllPending(): void {
        pendingMap.forEach((abortController) => {
            if (abortController) {
                abortController.abort();
            }
        });
        this.reset();
    }

    /**
     * 移除请求
     * @param config 请求配置
     */
    public static removePending(config: AxiosRequestConfig): void {
        const key = getMapKey(config);
        if (pendingMap.has(key)) {
            // 如果当前请求在等待中，取消它并将其从等待中移除
            const abortController = pendingMap.get(key);
            if (abortController) {
                abortController.abort(key);
            }
            pendingMap.delete(key);
        }
    }

    /**
     * 重置
     */
    public static reset(): void {
        pendingMap.clear();
    }
}
