// src/types/user.type.ts
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
export interface UserInfo {
      id: string;
      username: string;
      createdAt?: string;
      facebookId?: string;
      isBlacklist?: number;
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
      username: string;
      password: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
      username: string;
      password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponseData {
      token: string;
      user: UserInfo;
}

/**
 * 删除账号请求参数
 */
export interface DeleteAccountParams {
      password: string;
}

/**
 * 用户状态
 */
export interface UserState {
      token: string;
      userInfo: UserInfo | null;
      isLoggedIn: boolean;
}