// src/types/api.ts
/**
 * 基础响应接口
 */
export interface BaseResponse<T = any> {
      success: boolean;
      message: string;
      data: T;
}

/**
 * 用户数据接口
 */
export interface UserData {
      id: string;
      username: string;
      createdAt?: string;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
      token: string;
      user: UserData;
}

/**
 * 注册请求接口
 */
export interface RegisterRequest {
      username: string;
      password: string;
}

/**
 * 登录请求接口
 */
export interface LoginRequest {
      username: string;
      password: string;
}

/**
 * 删除账号请求接口
 */
export interface DeleteAccountRequest {
      password: string;
}