// src/utils/browser.ts
export const isFacebookBrowser = (): boolean => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1;
};

export const isLowPerformanceDevice = (): boolean => {
      // 检测设备性能
      return (
            navigator.hardwareConcurrency <= 4 ||
            /android 4\./i.test(navigator.userAgent) ||
            /iPhone OS [0-9]_|iPhone OS 10_|iPad.*OS [0-9]_|iPad.*OS 10_/i.test(navigator.userAgent)
      );
};

// 优化级别判断
export const getOptimizationLevel = (): 'high' | 'medium' | 'low' => {
      if (isFacebookBrowser() && isLowPerformanceDevice()) {
            return 'high';
      } else if (isFacebookBrowser() || isLowPerformanceDevice()) {
            return 'medium';
      }
      return 'low';
};