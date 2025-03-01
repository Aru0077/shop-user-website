// src/types/user.type.ts
import { ApiResponse } from './api.type';

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
 * 用户状态接口 (从store.ts合并)
 */
export interface UserState {
    token: string;
    userInfo: UserInfo | null;
    isLoggedIn: boolean;
}

/**
 * 购物车状态接口 (从store.ts合并)
 */
export interface CartState {
    items: Array<any>; // 购物车项类型根据后续需求补充
    totalQuantity: number;
    totalAmount: number;
}

// 导出API响应类型重命名，以便于在user.ts中使用
export type { ApiResponse };