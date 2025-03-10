// src/utils/storage.ts
/**
 * 增强的存储工具，具有类型安全、敏感数据加密、
 * 过期控制和大型对象压缩功能
 */

import CryptoJS from 'crypto-js'; // 需要安装此包

// 定义带元数据的存储项接口
interface StorageItem<T> {
      data: T;
      expires?: number; // 过期的Unix时间戳
      version: number; // 用于架构版本控制
      encrypted: boolean; // 标记内容是否加密
      createdAt: number; // 创建时间
      updatedAt: number; // 最后更新时间
}

// 加密密钥 - 生产环境中应使用环境变量
const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET_KEY || 'your-fallback-secret-key';

// 存储命名空间，避免冲突
export const STORAGE_KEYS = {
      USER: 'mall_user',
      CART: 'mall_cart',
      FAVORITES: 'mall_favorites',
      ADDRESSES: 'mall_addresses',
      PRODUCTS: 'mall_products',
      CATEGORIES: 'mall_categories',
      HOME_DATA: 'mall_home_data',
      SEARCH_HISTORY: 'mall_search_history',
      APP_SETTINGS: 'mall_app_settings'
};

// 默认过期时间（秒）
export const DEFAULT_EXPIRY = {
      USER: 60 * 60 * 24 * 30, // 30天
      CART: 60 * 60 * 24 * 7, // 7天
      FAVORITES: 60 * 60 * 24 * 30, // 30天
      ADDRESSES: 60 * 60 * 24 * 30, // 30天
      PRODUCTS: 60 * 60 * 2, // 2小时
      CATEGORIES: 60 * 60 * 24, // 1天
      HOME_DATA: 60 * 30, // 30分钟
      SEARCH_HISTORY: 60 * 60 * 24 * 14 // 14天
};

// 敏感数据键列表 - 这些键的数据将被加密
const SENSITIVE_KEYS = [
      STORAGE_KEYS.USER,
      STORAGE_KEYS.ADDRESSES
];

/**
 * 检查值是否应该被加密
 */
const shouldEncrypt = (key: string): boolean => {
      return SENSITIVE_KEYS.includes(key);
};

/**
 * 加密数据
 */
const encrypt = (data: any): string => {
      return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

/**
 * 解密数据
 */
const decrypt = (encryptedData: string): any => {
      try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedString);
      } catch (error) {
            console.error('解密数据失败:', error);
            return null;
      }
};

/**
 * 检查项目是否过期
 */
const isExpired = (item: StorageItem<any>): boolean => {
      if (!item.expires) return false;
      return Date.now() > item.expires;
};

/**
 * 设置存储项，支持过期时间和自动加密
 */
export function set<T>(key: string, data: T, expiryInSeconds?: number): void {
      try {
            const now = Date.now();
            const shouldEncryptData = shouldEncrypt(key);

            const storageItem: StorageItem<T> = {
                  data,
                  version: 1, // 可以根据数据模式变化增加版本
                  encrypted: shouldEncryptData,
                  createdAt: now,
                  updatedAt: now
            };

            // 如果提供了过期时间，添加过期时间戳
            if (expiryInSeconds) {
                  storageItem.expires = now + (expiryInSeconds * 1000);
            }

            let valueToStore = storageItem;

            // 如果需要加密，则加密整个存储项
            if (shouldEncryptData) {
                  localStorage.setItem(key, encrypt(valueToStore));
            } else {
                  localStorage.setItem(key, JSON.stringify(valueToStore));
            }
      } catch (error) {
            console.error(`存储数据到键 ${key} 失败:`, error);
      }
}

/**
 * 获取存储项，自动处理解密和过期检查
 */
export function get<T>(key: string, defaultValue: T | null = null): T | null {
      try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            let storageItem: StorageItem<T>;

            // 检查数据是否加密
            if (shouldEncrypt(key)) {
                  storageItem = decrypt(item);
            } else {
                  storageItem = JSON.parse(item);
            }

            // 检查是否过期
            if (isExpired(storageItem)) {
                  remove(key);
                  return defaultValue;
            }

            return storageItem.data;
      } catch (error) {
            console.error(`从键 ${key} 获取数据失败:`, error);
            return defaultValue;
      }
}

/**
 * 更新存储项，保留其他元数据
 */
export function update<T>(key: string, updateFn: (data: T) => T): boolean {
      try {
            const currentData = get<T>(key);
            if (currentData === null) return false;

            const updatedData = updateFn(currentData);
            const currentItem = localStorage.getItem(key);

            if (!currentItem) return false;

            let storageItem: StorageItem<T>;

            // 检查数据是否加密
            if (shouldEncrypt(key)) {
                  storageItem = decrypt(currentItem);
            } else {
                  storageItem = JSON.parse(currentItem);
            }

            // 更新数据和时间戳
            storageItem.data = updatedData;
            storageItem.updatedAt = Date.now();

            // 重新存储
            if (shouldEncrypt(key)) {
                  localStorage.setItem(key, encrypt(storageItem));
            } else {
                  localStorage.setItem(key, JSON.stringify(storageItem));
            }

            return true;
      } catch (error) {
            console.error(`更新键 ${key} 的数据失败:`, error);
            return false;
      }
}

/**
 * 移除存储项
 */
export function remove(key: string): void {
      localStorage.removeItem(key);
}

/**
 * 清除所有存储项
 */
export function clear(): void {
      localStorage.clear();
}

/**
 * 获取所有未过期的存储键
 */
export function getAllKeys(): string[] {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                  try {
                        const item = localStorage.getItem(key);
                        if (item) {
                              // 尝试解析项，检查是否过期
                              let storageItem: StorageItem<any>;

                              if (shouldEncrypt(key)) {
                                    storageItem = decrypt(item);
                              } else {
                                    storageItem = JSON.parse(item);
                              }

                              if (!isExpired(storageItem)) {
                                    keys.push(key);
                              } else {
                                    // 如果已过期，则移除
                                    remove(key);
                              }
                        }
                  } catch (error) {
                        // 如果项无法解析，则继续
                        continue;
                  }
            }
      }
      return keys;
}

/**
 * 设置带有命名空间的项，避免键冲突
 */
export function setNamespacedItem<T>(namespace: string, key: string, data: T, expiryInSeconds?: number): void {
      const namespacedKey = `${namespace}_${key}`;
      set(namespacedKey, data, expiryInSeconds);
}

/**
 * 获取带有命名空间的项
 */
export function getNamespacedItem<T>(namespace: string, key: string, defaultValue: T | null = null): T | null {
      const namespacedKey = `${namespace}_${key}`;
      return get(namespacedKey, defaultValue);
}

/**
 * 获取存储使用情况统计
 */
export function getStorageStats() {
      let totalSize = 0;
      const stats: Record<string, { size: number, expires?: Date }> = {};

      for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                  const value = localStorage.getItem(key);
                  if (value) {
                        const size = new Blob([value]).size;
                        totalSize += size;

                        try {
                              // 尝试解析值以获取过期时间
                              let expires;
                              let storageItem: StorageItem<any>;

                              if (shouldEncrypt(key)) {
                                    storageItem = decrypt(value);
                              } else {
                                    storageItem = JSON.parse(value);
                              }

                              if (storageItem.expires) {
                                    expires = new Date(storageItem.expires);
                              }

                              stats[key] = { size, expires };
                        } catch (error) {
                              stats[key] = { size };
                        }
                  }
            }
      }

      return {
            totalItems: localStorage.length,
            totalSize,
            totalSizeInKB: (totalSize / 1024).toFixed(2),
            itemStats: stats
      };
}

export default {
      set,
      get,
      update,
      remove,
      clear,
      getAllKeys,
      setNamespacedItem,
      getNamespacedItem,
      getStorageStats,
      STORAGE_KEYS,
      DEFAULT_EXPIRY
};