// src/utils/appInitializer.ts
import { useUserStore } from '@/store/user.store';
import { useProductStore } from '@/store/product.store';
import { useCartStore } from '@/store/cart.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { showToast, showNotify } from 'vant';
import storage, { STORAGE_KEYS } from '@/utils/storage';

/**
 * 应用初始化状态
 */
interface InitStatus {
      lastInitTime: number;
      appVersion: string;
      userInitialized: boolean;
      coreDataLoaded: boolean;
}

/**
 * 应用初始化器
 * 负责应用启动时加载必要数据
 */
export class AppInitializer {
      private static readonly INIT_STATUS_KEY = 'app_init_status';
      private static readonly APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
      private static readonly INIT_INTERVAL = 60 * 60 * 1000; // 1小时重新初始化

      private static _instance: AppInitializer;
      private _isInitializing = false;
      private _status: InitStatus;

      // 单例模式
      public static getInstance() {
            if (!this._instance) {
                  this._instance = new AppInitializer();
            }
            return this._instance;
      }

      private constructor() {
            // 读取初始化状态
            const storedStatus = storage.get<InitStatus>(AppInitializer.INIT_STATUS_KEY, null);

            this._status = storedStatus || {
                  lastInitTime: 0,
                  appVersion: AppInitializer.APP_VERSION,
                  userInitialized: false,
                  coreDataLoaded: false
            };
      }

      /**
       * 保存初始化状态
       */
      private saveStatus() {
            storage.set(AppInitializer.INIT_STATUS_KEY, this._status);
      }

      /**
       * 检查是否需要初始化
       */
      private needsInit() {
            const now = Date.now();

            // 如果版本号不同，强制重新初始化
            if (this._status.appVersion !== AppInitializer.APP_VERSION) {
                  return true;
            }

            // 检查上次初始化时间，超过设定间隔则重新初始化
            if (now - this._status.lastInitTime > AppInitializer.INIT_INTERVAL) {
                  return true;
            }

            // 如果核心数据未加载，需要初始化
            if (!this._status.coreDataLoaded) {
                  return true;
            }

            return false;
      }

      /**
       * 检查网络状态
       */
      private isOnline() {
            return navigator.onLine;
      }

      /**
       * 加载核心数据
       */
      private async loadCoreData(silent = false) {
            try {
                  const productStore = useProductStore();

                  // 如果是静默加载，则不显示加载提示
                  if (!silent) {
                        showToast({
                              message: '正在加载基础数据...',
                              position: 'bottom',
                              duration: 1000
                        });
                  }

                  // 预加载商品核心数据（分类和首页数据）
                  await productStore.preloadCoreData();

                  // 更新状态
                  this._status.coreDataLoaded = true;
                  this._status.lastInitTime = Date.now();
                  this._status.appVersion = AppInitializer.APP_VERSION;
                  this.saveStatus();

                  return true;
            } catch (error) {
                  console.error('加载核心数据失败:', error);
                  if (!silent) {
                        showNotify({ type: 'warning', message: '部分数据加载失败，可能影响浏览体验' });
                  }
                  return false;
            }
      }

      /**
       * 同步离线数据
       */
      private async syncOfflineData() {
            try {
                  const cartStore = useCartStore();
                  const favoriteStore = useFavoriteStore();

                  // 检查购物车和收藏是否有离线更改
                  const cartHasOfflineChanges = cartStore.hasOfflineChanges;
                  const favoriteHasOfflineChanges = favoriteStore.hasOfflineChanges;

                  // 如果有离线更改且在线，尝试同步
                  if ((cartHasOfflineChanges || favoriteHasOfflineChanges) && this.isOnline()) {
                        showToast({
                              message: '正在同步离线数据...',
                              position: 'bottom',
                              duration: 1000
                        });

                        const syncPromises: Promise<void>[] = [];

                        if (cartHasOfflineChanges) {
                              syncPromises.push(cartStore.syncOfflineChanges());
                        }

                        if (favoriteHasOfflineChanges) {
                              syncPromises.push(favoriteStore.syncOfflineChanges());
                        }

                        await Promise.allSettled(syncPromises);
                  }

                  return true;
            } catch (error) {
                  console.error('同步离线数据失败:', error);
                  return false;
            }
      }

      /**
       * 加载用户相关数据
       */
      private async loadUserData(silent = false) {
            try {
                  const userStore = useUserStore();

                  // 如果用户已登录但未初始化
                  if (userStore.isLoggedIn && !userStore.isInitialized) {
                        // 如果是静默加载，则不显示加载提示
                        if (!silent) {
                              showToast({
                                    message: '正在加载用户数据...',
                                    position: 'bottom',
                                    duration: 1000
                              });
                        }

                        await userStore.initUserData();

                        // 更新状态
                        this._status.userInitialized = true;
                        this.saveStatus();
                  }

                  return true;
            } catch (error) {
                  console.error('加载用户数据失败:', error);
                  if (!silent) {
                        showNotify({ type: 'warning', message: '用户数据加载失败，请尝试重新登录' });
                  }
                  return false;
            }
      }

      /**
       * 检查存储限额
       */
      private checkStorageQuota() {
            try {
                  const stats = storage.getStorageStats();
                  console.log('存储使用情况:', stats);

                  // 如果存储使用超过4.5MB（接近5MB限制），清理最旧的数据
                  if (stats.totalSize > 4.5 * 1024 * 1024) {
                        console.warn('存储空间接近上限，正在清理旧数据...');

                        // 清理产品详情缓存（通常较大）
                        const keysToRemove = Object.keys(stats.itemStats)
                              .filter(key => key.startsWith(STORAGE_KEYS.PRODUCTS))
                              .sort((a, b) => {
                                    const itemA = stats.itemStats[a];
                                    const itemB = stats.itemStats[b];
                                    if (itemA.expires && itemB.expires) {
                                          return itemA.expires.getTime() - itemB.expires.getTime();
                                    }
                                    return 0;
                              })
                              .slice(0, 10); // 删除最旧的10项

                        keysToRemove.forEach(key => storage.remove(key));
                        console.log(`已清理 ${keysToRemove.length} 项旧数据`);
                  }
            } catch (error) {
                  console.error('检查存储限额失败:', error);
            }
      }

      /**
       * 初始化应用
       * @param force 是否强制初始化
       */
      public async initialize(force = false) {
            // 避免重复初始化
            if (this._isInitializing) return false;

            // 检查是否需要初始化
            if (!force && !this.needsInit()) return true;

            this._isInitializing = true;
            console.log('开始初始化应用...');

            try {
                  // 检查存储限额
                  this.checkStorageQuota();

                  // 加载核心数据
                  await this.loadCoreData();

                  // 加载用户数据
                  await this.loadUserData();

                  // 同步离线数据
                  await this.syncOfflineData();

                  console.log('应用初始化成功');
                  this._isInitializing = false;
                  return true;
            } catch (error) {
                  console.error('应用初始化失败:', error);
                  this._isInitializing = false;
                  return false;
            }
      }

      /**
       * 后台静默初始化
       * 用于应用运行时的后台刷新
       */
      public async silentInitialize() {
            try {
                  // 检查是否需要初始化
                  if (!this.needsInit()) return true;

                  // 避免重复初始化
                  if (this._isInitializing) return false;

                  this._isInitializing = true;
                  console.log('开始后台静默初始化...');

                  // 检查存储限额
                  this.checkStorageQuota();

                  // 静默加载核心数据
                  await this.loadCoreData(true);

                  // 静默加载用户数据
                  await this.loadUserData(true);

                  console.log('后台静默初始化成功');
                  this._isInitializing = false;
                  return true;
            } catch (error) {
                  console.error('后台静默初始化失败:', error);
                  this._isInitializing = false;
                  return false;
            }
      }

      /**
       * 监听网络状态变化
       * 网络恢复时尝试同步离线数据
       */
      public setupNetworkListeners() {
            window.addEventListener('online', () => {
                  console.log('网络已恢复，尝试同步离线数据...');
                  this.syncOfflineData();
            });

            window.addEventListener('offline', () => {
                  console.log('网络已断开，切换到离线模式');
                  showNotify({
                        type: 'warning',
                        message: '网络已断开，已切换到离线模式'
                  });
            });
      }

      /**
       * 获取初始化状态
       */
      public getStatus() {
            return { ...this._status };
      }

      /**
       * 重置初始化状态
       */
      public reset() {
            this._status = {
                  lastInitTime: 0,
                  appVersion: AppInitializer.APP_VERSION,
                  userInitialized: false,
                  coreDataLoaded: false
            };
            this.saveStatus();
      }
}

// 导出单例
export const appInitializer = AppInitializer.getInstance();

// 默认导出
export default appInitializer;