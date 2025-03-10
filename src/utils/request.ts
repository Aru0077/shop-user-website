// src/utils/request.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { showDialog, showLoadingToast, closeToast } from 'vant';
import { useUserStore } from '@/store/user.store';
import { getAccessToken } from '@/utils/tokenManager';
import networkService from '@/utils/networkService';
import { HttpStatus } from '@/types/api.type';

// 扩展AxiosRequestConfig接口
declare module 'axios' {
      interface AxiosRequestConfig {
        loading?: boolean;
        showError?: boolean;
      }
    }

// 队列接口
interface QueueItem {
      config: AxiosRequestConfig;
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
}

// 创建请求队列，存储离线时的请求
const requestQueue: QueueItem[] = [];

// 创建axios实例
const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 15000,
      headers: {
            'Content-Type': 'application/json'
      }
});

// 请求拦截器
instance.interceptors.request.use(
      async (config) => {
            // 检查网络状态
            if (!networkService.isOnline.value) {
                  // 如果请求配置中显式指定了允许离线模式，返回特殊错误
                  if (config.headers?.['Allow-Offline']) {
                        return Promise.reject({
                              config,
                              response: {
                                    status: 0,
                                    statusText: 'offline',
                                    data: { success: false, message: '当前处于离线模式' }
                              }
                        });
                  }

                  // 否则将请求加入队列，等待网络恢复后自动发送
                  return new Promise((resolve, reject) => {
                        requestQueue.push({ config, resolve, reject });

                        // 显示提示信息
                        showDialog({
                              title: '当前处于离线模式',
                              message: '您的请求将在网络恢复后自动发送。',
                              confirmButtonText: '确定'
                        });
                  });
            }

            // 添加token到请求头
            const token = getAccessToken();
            if (token) {
                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${token}`;
            }

            // 显示loading
            if (config.loading !== false) {
                  showLoadingToast({
                        message: '加载中...',
                        forbidClick: true,
                  });
            }

            return config;
      },
      (error) => {
            closeToast();
            return Promise.reject(error);
      }
);

// 响应拦截器
instance.interceptors.response.use(
      (response: AxiosResponse) => {
            closeToast();
            return response.data;
      },
      async (error: AxiosError) => {
            closeToast();

            // 如果是离线状态的错误，特殊处理
            if (error.message === 'Network Error' || !error.response) {
                  networkService.checkNetworkStatus(); // 主动检查网络状态

                  // 对于GET请求，可以尝试从缓存获取数据
                  if (error.config && error.config.method?.toLowerCase() === 'get') {
                        // 这里可以集成缓存逻辑，从本地存储获取数据
                        // ...

                        // 示例：返回离线错误
                        return Promise.reject({
                              status: 0,
                              message: '网络连接失败，请检查网络后重试',
                              offline: true
                        });
                  }

                  return Promise.reject({
                        status: 0,
                        message: '网络连接失败，请检查网络后重试',
                        offline: true
                  });
            }

            const { response } = error;

            // 处理常见的HTTP错误
            switch (response?.status) {
                  case HttpStatus.UNAUTHORIZED:
                        // 401: 未授权，清除用户信息并跳转到登录页
                        const userStore = useUserStore();
                        await userStore.clearUserInfo();

                        showDialog({
                              title: '登录已过期',
                              message: '您的登录状态已过期，请重新登录',
                              confirmButtonText: '重新登录'
                        }).then(() => {
                              window.location.href = '/login';
                        });
                        break;

                  case HttpStatus.FORBIDDEN:
                        // 403: 禁止访问
                        showDialog({
                              title: '访问受限',
                              message: '您没有权限执行此操作',
                              confirmButtonText: '确定'
                        });
                        break;

                  case HttpStatus.NOT_FOUND:
                        // 404: 资源不存在
                        showDialog({
                              title: '资源不存在',
                              message: '请求的资源不存在',
                              confirmButtonText: '确定'
                        });
                        break;

                  case HttpStatus.INTERNAL_SERVER_ERROR:
                        // 500: 服务器错误
                        showDialog({
                              title: '服务器错误',
                              message: '服务器处理请求时发生错误，请稍后重试',
                              confirmButtonText: '确定'
                        });
                        break;

                  default:
                        // 其他错误
                        if (error.config?.showError !== false) {
                              showDialog({
                                    title: '请求失败',
                                    message: (response?.data as any)?.message || '请求处理失败，请稍后重试',
                                    confirmButtonText: '确定'
                              });
                        }
            }

            return Promise.reject(response?.data || { message: '未知错误' });
      }
);

// 处理网络恢复后的请求队列
networkService.addListener((online) => {
      if (online && requestQueue.length > 0) {
            showDialog({
                  title: '网络已恢复',
                  message: `系统检测到网络已恢复连接，是否发送${requestQueue.length}个待处理的请求？`,
                  confirmButtonText: '发送',
                  cancelButtonText: '取消'
            }).then(() => {
                  // 发送队列中的请求
                  const queue = [...requestQueue];
                  requestQueue.length = 0; // 清空队列

                  queue.forEach(({ config, resolve, reject }) => {
                        instance(config)
                              .then(resolve)
                              .catch(reject);
                  });
            }).catch(() => {
                  // 用户取消，清空队列
                  requestQueue.length = 0;
            });
      }
});

// 封装请求方法
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig) {
      return instance.get<T, T>(url, { params, ...config });
}

export function post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
      return instance.post<T, T>(url, data, config);
}

export function put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
      return instance.put<T, T>(url, data, config);
}

export function patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
      return instance.patch<T, T>(url, data, config);
}

export function del<T>(url: string, config?: AxiosRequestConfig) {
      return instance.delete<T, T>(url, config);
}

// 暴露原始axios实例，以便进行自定义配置
export { instance };

// 默认导出常用方法
export default {
      get,
      post,
      put,
      patch,
      del,
      instance
};