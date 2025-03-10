// src/utils/networkService.ts
import { ref, computed } from 'vue';
import { showNotify } from 'vant';

// 网络检测间隔（毫秒）
const NETWORK_CHECK_INTERVAL = 30000; // 30秒

// 检测端点地址
const PING_ENDPOINT = '/api/health';

/**
 * 网络服务类
 * 提供网络状态监测和管理
 */
class NetworkService {
  private static _instance: NetworkService;
  
  // 网络状态
  private _online = ref<boolean>(navigator.onLine);
  private _lastPingTime = ref<number>(0);
  private _activeCheckTimer: number | null = null;
  private _listeners: Array<(online: boolean) => void> = [];
  
  // 单例模式
  public static getInstance() {
    if (!this._instance) {
      this._instance = new NetworkService();
    }
    return this._instance;
  }
  
  private constructor() {
    this.setupListeners();
  }
  
  /**
   * 设置网络状态监听器
   */
  private setupListeners() {
    // 监听浏览器的在线状态变化
    window.addEventListener('online', () => this.handleOnlineStatusChange(true));
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    
    // 初始检测
    this.checkNetworkStatus();
  }
  
  /**
   * 处理在线状态变化
   */
  private handleOnlineStatusChange(online: boolean) {
    const wasOffline = !this._online.value;
    this._online.value = online;
    
    // 如果从离线变为在线，显示通知
    if (online && wasOffline) {
      showNotify({ 
        type: 'success', 
        message: '网络已恢复连接' 
      });
      
      // 触发网络恢复事件
      this.notifyListeners(true);
      
      // 恢复连接时主动检查一次
      this.checkNetworkStatus();
    } 
    // 如果从在线变为离线，显示通知
    else if (!online && !wasOffline) {
      showNotify({ 
        type: 'warning', 
        message: '网络连接已断开，进入离线模式' 
      });
      
      // 触发网络断开事件
      this.notifyListeners(false);
    }
  }
  
  /**
   * 通知所有监听器
   */
  private notifyListeners(online: boolean) {
    this._listeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('网络状态监听器执行失败:', error);
      }
    });
  }
  
  /**
   * 主动检测网络状态
   * 除了依赖浏览器的navigator.onLine，还通过发送轻量级请求确认实际连接状态
   */
  public async checkNetworkStatus(): Promise<boolean> {
    try {
      const browserOnline = navigator.onLine;
      
      // 如果浏览器报告离线，无需进一步检查
      if (!browserOnline) {
        this._online.value = false;
        return false;
      }
      
      // 发送轻量级请求检查实际连接
      const response = await fetch(PING_ENDPOINT, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const isOnline = response.ok;
      
      // 只有当状态变化时才通知
      if (isOnline !== this._online.value) {
        this.handleOnlineStatusChange(isOnline);
      } else {
        this._online.value = isOnline;
      }
      
      this._lastPingTime.value = Date.now();
      return isOnline;
    } catch (error) {
      // 请求失败表示可能离线
      if (this._online.value) {
        this.handleOnlineStatusChange(false);
      }
      return false;
    }
  }
  
  /**
   * 开始自动检测网络状态
   */
  public startActiveChecking() {
    // 避免重复启动
    if (this._activeCheckTimer !== null) {
      this.stopActiveChecking();
    }
    
    // 设置定时检测
    this._activeCheckTimer = window.setInterval(() => {
      this.checkNetworkStatus();
    }, NETWORK_CHECK_INTERVAL);
    
    // 立即执行一次检测
    this.checkNetworkStatus();
  }
  
  /**
   * 停止自动检测网络状态
   */
  public stopActiveChecking() {
    if (this._activeCheckTimer !== null) {
      clearInterval(this._activeCheckTimer);
      this._activeCheckTimer = null;
    }
  }
  
  /**
   * 添加网络状态变化监听器
   */
  public addListener(callback: (online: boolean) => void) {
    this._listeners.push(callback);
  }
  
  /**
   * 移除网络状态变化监听器
   */
  public removeListener(callback: (online: boolean) => void) {
    const index = this._listeners.indexOf(callback);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  
  /**
   * 判断是否在线
   */
  public get isOnline() {
    return computed(() => this._online.value);
  }
  
  /**
   * 获取最后一次检测时间
   */
  public get lastPingTime() {
    return computed(() => this._lastPingTime.value);
  }
}

// 导出单例
export const networkService = NetworkService.getInstance();

// 默认导出
export default networkService;