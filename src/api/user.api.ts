// src/api/user.ts
import { get, post, del } from '@/utils/request';
import {
      ApiResponse,
      LoginResponseData,
      RegisterParams,
      LoginParams,
      DeleteAccountParams,
      UserInfo
} from '@/types/user.type';

/**
 * 用户注册
 * @param data 注册信息
 */
export function register(data: RegisterParams) {
      return post<ApiResponse<UserInfo>>('/shop/user/register', data);
}

/**
 * 用户登录
 * @param data 登录信息
 */
export function login(data: LoginParams) {
      return post<ApiResponse<LoginResponseData>>('/shop/user/login', data);
}

/**
 * 用户登出
 */
export function logout() {
      return post<ApiResponse<null>>('/shop/user/logout');
}

/**
 * 删除账号
 * @param data 删除账号请求数据（包含密码）
 */
export function deleteAccount(data: DeleteAccountParams) {
      return del<ApiResponse<null>>('/shop/user/account', { data });
}