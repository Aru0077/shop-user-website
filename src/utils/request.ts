import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from '@/utils/tokenManager'
import { showNotify, showLoadingToast, closeToast } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/notify/style'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 15000,
      headers: {
            'Content-Type': 'application/json;charset=utf-8',
      },
})

// 记录正在进行的请求
const pendingRequests = new Map();

// 创建请求唯一键
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
      const { url, method, params, data } = config;
      return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
};


// 添加请求
const addPendingRequest = (config: InternalAxiosRequestConfig) => {
      const requestKey = getRequestKey(config);

      // 如果已有相同请求正在进行，取消它
      if (pendingRequests.has(requestKey)) {
            const controller = pendingRequests.get(requestKey);
            controller.abort();
            pendingRequests.delete(requestKey);
      }

      // 创建新的AbortController
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(requestKey, controller);

      return controller;
};

// 移除请求
const removePendingRequest = (config: InternalAxiosRequestConfig) => {
      const requestKey = getRequestKey(config);
      pendingRequests.delete(requestKey);
};


// 请求拦截器
service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
            // 是否需要显示加载中
            if (config.headers?.loading !== false) {
                  showLoadingToast({
                        message: '加载中...',
                        forbidClick: true,
                        duration: 0,
                  })
            }

            // 添加到正在请求队列
            addPendingRequest(config);

            // 添加令牌
            const token = getAccessToken();
            if (token && config.headers) {
                  config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
      },
      (error) => {
            console.log('请求错误：', error);
            return Promise.reject(error);
      }
);

// 响应拦截器
service.interceptors.response.use(
      (response: AxiosResponse) => {
            // 从队列中移除已完成的请求
            removePendingRequest(response.config);

            // 关闭加载提示
            closeToast();

            const res = response.data;

            // 判断后端的自定义响应格式
            if (res.success === false) {
                  // 处理错误
                  showNotify({
                        type: 'danger',
                        message: res.message || '服务器错误'
                  });

                  // 401: Token 过期或无效
                  if (response.status === 401 || res.message?.includes('登录已过期')) {
                        // 重新登录
                        router.push('/login');
                  }

                  return Promise.reject(new Error(res.message || 'Error'));
            } else {
                  return res;
            }
      },
      (error) => {
            console.log('响应错误：', error);

            // 如果请求被取消，不显示错误
            if (axios.isCancel(error)) {
                  console.log('请求被取消：', error.message);
                  closeToast();
                  return Promise.reject(error);
            }

            // 关闭加载提示
            closeToast();

            // 处理 HTTP 错误状态码
            let message = '连接服务器失败';
            if (error.response) {
                  switch (error.response.status) {
                        case 400:
                              message = '请求错误';
                              break;
                        case 401:
                              message = '未授权，请重新登录';
                              // 清除用户状态
                              router.push('/login');
                              break;
                        case 403:
                              message = '拒绝访问';
                              break;
                        case 404:
                              message = '请求地址错误';
                              break;
                        case 500:
                              message = '服务器内部错误';
                              break;
                        default:
                              message = `连接错误${error.response.status}`;
                  }
            } else {
                  // 处理断网情况
                  if (error.message.includes('Network Error')) {
                        message = '网络异常，请检查您的网络连接';
                  }
                  if (error.message.includes('timeout')) {
                        message = '请求超时，请检查您的网络连接';
                  }
            }

            showNotify({
                  type: 'danger',
                  message
            });

            return Promise.reject(error);
      }
);

// 封装 GET 请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
      return service.get(url, { params, ...config })
}

// 封装 POST 请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return service.post(url, data, config)
}

// 封装 PUT 请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return service.put(url, data, config)
}

// 封装 PATCH 请求
export function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return service.patch(url, data, config)
}

// 封装 DELETE 请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return service.delete(url, config)
}

export default service