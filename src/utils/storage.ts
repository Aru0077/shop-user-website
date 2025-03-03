/**
 * 封装本地存储操作
 */

// 默认缓存期限为7天
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

/**
 * 创建本地存储对象
 */
// 添加内存缓存以减少频繁的本地存储读取和JSON解析
export const createStorage = ({
      prefixKey = '',
      storage = localStorage,
} = {}) => {
      class Storage {
            private storage = storage;
            private prefixKey?: string = prefixKey;
            private cache = new Map(); // 内存缓存

            private getKey(key: string) {
                  return `${this.prefixKey}${key}`.toUpperCase();
            }

            set(key: string, value: any, expire: number | null = DEFAULT_CACHE_TIME) {
                  const stringKey = this.getKey(key);
                  const data = {
                        value,
                        expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
                  };

                  // 同时更新缓存和存储
                  this.cache.set(stringKey, data);
                  this.storage.setItem(stringKey, JSON.stringify(data));
            }

            get<T = any>(key: string, def: any = null): T {
                  const stringKey = this.getKey(key);

                  // 先查找内存缓存
                  if (this.cache.has(stringKey)) {
                        const cacheData = this.cache.get(stringKey);
                        if (cacheData.expire === null || cacheData.expire >= Date.now()) {
                              return cacheData.value;
                        }
                        // 过期则删除
                        this.remove(key);
                        return def;
                  }

                  // 缓存未命中，从存储获取
                  const item = this.storage.getItem(stringKey);
                  if (!item) return def;

                  try {
                        const data = JSON.parse(item);
                        const { value, expire } = data;

                        // 未过期则加入缓存并返回
                        if (expire === null || expire >= Date.now()) {
                              this.cache.set(stringKey, data);
                              return value;
                        }

                        // 已过期则删除
                        this.remove(key);
                  } catch (e) {
                        // 解析失败也删除
                        this.remove(key);
                  }

                  return def;
            }

            remove(key: string) {
                  const stringKey = this.getKey(key);
                  this.cache.delete(stringKey);
                  this.storage.removeItem(stringKey);
            }

            clear(): void {
                  this.cache.clear();
                  this.storage.clear();
            }
      }

      return new Storage();
};

export const storage = createStorage()

export default storage