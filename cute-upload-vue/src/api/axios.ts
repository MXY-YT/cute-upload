import { AxiosCanceler } from "/@/utils/axiosCanceler.ts";
import axios from 'axios';
import { ElMessage } from "element-plus";

const request = axios.create({
    baseURL: '/api',
    timeout: 300000,
    withCredentials: false
});

// 请求拦截器
request.interceptors.request.use(
    (req: any) => {
        AxiosCanceler.addPending(req); // 添加请求到待处理队列
        return req;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (res) => {
        AxiosCanceler.removePending(res.config); // 移除请求
        return res?.data || res;
    },
    async error => {
        if (!axios.isCancel(error)) {
            ElMessage.error(error.message);
        }
        return Promise.reject({ message: error.message });
    }
);

export default request;
