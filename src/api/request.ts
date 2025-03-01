import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getAuthToken } from '@/utils/auth'
import { showNotify, showLoadingToast, closeToast } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/notify/style'

// 创建 axios 实例
const service = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 15000,
      headers: {
            'Content-Type': 'application/json;charset=utf-8',
      },
})

// 请求拦截器
service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
            // 是否需要显示加载中
            if (config.headers?.loading !== false) {
                  showLoadingToast({
                        message: '加载中...',
                        forbidClick: true,
                        duration: 0,
                  })
            }

            // 添加 token
            const token = getAuthToken()
            if (token && config.headers) {
                  config.headers.Authorization = `Bearer ${token}`
            }

            return config
      },
      (error) => {
            console.log('请求错误：', error)
            return Promise.reject(error)
      }
)

// 响应拦截器
service.interceptors.response.use(
      (response: AxiosResponse) => {
            // 关闭加载提示
            closeToast()

            const res = response.data

            // 判断后端的自定义响应格式
            if (res.success === false) {
                  // 处理错误
                  showNotify({
                        type: 'danger',
                        message: res.message || '服务器错误'
                  })

                  // 401: Token 过期
                  if (response.status === 401 || res.message?.includes('登录已过期')) {
                        // 重新登录
                        localStorage.removeItem('ACCESS_TOKEN')
                        localStorage.removeItem('USER_INFO')
                        setTimeout(() => {
                              window.location.href = '/login'
                        }, 1500)
                  }

                  return Promise.reject(new Error(res.message || 'Error'))
            } else {
                  return res
            }
      },
      (error) => {
            console.log('响应错误：', error)
            // 关闭加载提示
            closeToast()

            // 处理 HTTP 错误状态码
            let message = '连接服务器失败'
            if (error.response) {
                  switch (error.response.status) {
                        case 400:
                              message = '请求错误'
                              break
                        case 401:
                              message = '未授权，请重新登录'
                              localStorage.removeItem('ACCESS_TOKEN')
                              localStorage.removeItem('USER_INFO')
                              setTimeout(() => {
                                    window.location.href = '/login'
                              }, 1500)
                              break
                        case 403:
                              message = '拒绝访问'
                              break
                        case 404:
                              message = '请求地址错误'
                              break
                        case 500:
                              message = '服务器内部错误'
                              break
                        default:
                              message = `连接错误${error.response.status}`
                  }
            } else {
                  // 处理断网情况
                  if (error.message.includes('Network Error')) {
                        message = '网络异常，请检查您的网络连接'
                  }
                  if (error.message.includes('timeout')) {
                        message = '请求超时，请检查您的网络连接'
                  }
            }

            showNotify({
                  type: 'danger',
                  message
            })

            return Promise.reject(error)
      }
)

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

// 封装 DELETE 请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return service.delete(url, config)
}

export default service