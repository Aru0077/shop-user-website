/**
 * 封装本地存储操作
 */

// 默认缓存期限为7天
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

/**
 * 创建本地存储对象
 */
export const createStorage = ({
      prefixKey = '',
      storage = localStorage,
} = {}) => {
      /**
       * 本地存储类
       */
      class Storage {
            private storage = storage
            private prefixKey?: string = prefixKey

            private getKey(key: string) {
                  return `${this.prefixKey}${key}`.toUpperCase()
            }

            /**
             * 设置缓存
             * @param key 缓存键
             * @param value 缓存值
             * @param expire 过期时间
             */
            set(key: string, value: any, expire: number | null = DEFAULT_CACHE_TIME) {
                  const stringData = JSON.stringify({
                        value,
                        expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
                  })
                  this.storage.setItem(this.getKey(key), stringData)
            }

            /**
             * 获取缓存
             * @param key 缓存键
             * @param def 默认值
             */
            get<T = any>(key: string, def: any = null): T {
                  const item = this.storage.getItem(this.getKey(key))
                  if (item) {
                        try {
                              const data = JSON.parse(item)
                              const { value, expire } = data
                              // 在有效期内直接返回
                              if (expire === null || expire >= Date.now()) {
                                    return value
                              }
                              this.remove(key)
                        } catch (e) {
                              return def
                        }
                  }
                  return def
            }

            /**
             * 移除缓存
             * @param key 缓存键
             */
            remove(key: string) {
                  this.storage.removeItem(this.getKey(key))
            }

            /**
             * 清空所有缓存
             */
            clear(): void {
                  this.storage.clear()
            }
      }

      return new Storage()
}

export const storage = createStorage()

export default storage