// src/utils/auth.ts
import storage from './storage';
import { UserInfo } from '@/types/user.type';

// 本地存储键名定义
const TOKEN_KEY = 'ACCESS_TOKEN';
const USER_INFO_KEY = 'USER_INFO';

/**
 * 获取token
 */
export function getAuthToken(): string {
      return storage.get(TOKEN_KEY, '');
}

/**
 * 设置token
 */
export function setToken(token: string): void {
      storage.set(TOKEN_KEY, token);
}

/**
 * 删除token
 */
export function removeToken(): void {
      storage.remove(TOKEN_KEY);
}

/**
 * 获取用户信息
 */
export function getStoredUserInfo(): UserInfo | null {
      return storage.get(USER_INFO_KEY, null);
}

/**
 * 设置用户信息
 */
export function setUserInfo(info: UserInfo): void {
      storage.set(USER_INFO_KEY, info);
}

/**
 * 删除用户信息
 */
export function removeUserInfo(): void {
      storage.remove(USER_INFO_KEY);
}

/**
 * 判断用户是否已登录
 */
export function isLoggedIn(): boolean {
      return !!getAuthToken();
}

/**
 * 清除所有用户相关信息
 */
export function clearAuth(): void {
      removeToken();
      removeUserInfo();
}