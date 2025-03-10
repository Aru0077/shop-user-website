// src/utils/tokenManager.ts
import CryptoJS from 'crypto-js';

// 令牌相关的本地存储键
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// 加密密钥 - 生产环境中应使用环境变量
const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET_KEY || 'your-fallback-secret-key';

/**
 * 加密数据
 * @param data 要加密的数据
 * @returns 加密后的字符串
 */
const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

/**
 * 解密数据
 * @param encryptedData 加密的字符串
 * @returns 解密后的数据，解密失败返回null
 */
const decrypt = (encryptedData: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密令牌失败:', error);
    return null;
  }
};

/**
 * 保存令牌到本地存储
 * @param token 身份验证令牌
 */
export function saveTokens(token: string): void {
  try {
    // 加密后存储
    localStorage.setItem(TOKEN_KEY, encrypt(token));
    
    // 设置过期时间（例如7天后）
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    
    console.log('认证令牌已保存');
  } catch (error) {
    console.error('保存令牌失败:', error);
  }
}

/**
 * 获取访问令牌
 * @returns 访问令牌，如果不存在或已过期则返回空字符串
 */
export function getAccessToken(): string {
  try {
    // 检查令牌是否过期
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return '';
    
    const expiry = parseInt(expiryStr);
    if (Date.now() > expiry) {
      // 令牌已过期，清除存储
      clearTokens();
      return '';
    }
    
    // 获取并解密令牌
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    if (!encryptedToken) return '';
    
    const token = decrypt(encryptedToken);
    return token || '';
  } catch (error) {
    console.error('获取访问令牌失败:', error);
    return '';
  }
}

/**
 * 检查令牌是否即将过期（例如1天内）
 * @returns 如果令牌将在1天内过期，返回true
 */
export function isTokenExpiringSoon(): boolean {
  try {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    
    const expiry = parseInt(expiryStr);
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // 如果令牌将在1天内过期，返回true
    return (expiry - Date.now()) < oneDayMs;
  } catch (error) {
    console.error('检查令牌过期失败:', error);
    return true;
  }
}

/**
 * 更新令牌过期时间
 * @param days 过期天数，默认7天
 */
export function extendTokenExpiry(days = 7): void {
  try {
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    console.log(`令牌过期时间已延长${days}天`);
  } catch (error) {
    console.error('延长令牌过期时间失败:', error);
  }
}

/**
 * 清除所有令牌相关存储
 */
export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    console.log('令牌已清除');
  } catch (error) {
    console.error('清除令牌失败:', error);
  }
}

/**
 * 检查用户是否已登录
 * @returns 如果用户已登录且令牌有效，返回true
 */
export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export default {
  saveTokens,
  getAccessToken,
  isTokenExpiringSoon,
  extendTokenExpiry,
  clearTokens,
  isLoggedIn
};