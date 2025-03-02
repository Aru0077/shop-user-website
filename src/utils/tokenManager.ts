// src/utils/tokenManager.ts
import Cookies from 'js-cookie';

// 令牌相关常量
const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// 设置安全的httpOnly cookie选项（如果使用相同域的API）
const COOKIE_OPTIONS = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      expires: 1 // 1天，与后端保持一致（24小时）
};

// 保存令牌（使用更安全的方式）
export const saveTokens = (token: string) => {
      Cookies.set(ACCESS_TOKEN_KEY, token, COOKIE_OPTIONS);

      // 计算过期时间（24小时）
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

// 获取访问令牌
export const getAccessToken = (): string => {
      return Cookies.get(ACCESS_TOKEN_KEY) || '';
};

// 清除所有令牌
export const clearTokens = () => {
      Cookies.remove(ACCESS_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
};