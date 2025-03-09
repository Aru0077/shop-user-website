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
export function registerApi(data: RegisterParams) {
      return post<ApiResponse<UserInfo>>('/user/register', data);
}

/**
 * 用户登录
 * @param data 登录信息
 */
export function loginApi(data: LoginParams) {
      return post<ApiResponse<LoginResponseData>>('/user/login', data);
}

/**
 * 用户登出
 */
export function logoutApi() {
      return post<ApiResponse<null>>('/user/logout');
}

/**
 * 删除账号
 * @param data 删除账号请求数据（包含密码）
 */
export function deleteAccountApi(data: DeleteAccountParams) {
      return del<ApiResponse<null>>('/user/account', { data });
}