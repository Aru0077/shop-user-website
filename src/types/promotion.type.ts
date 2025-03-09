import { ApiResponse } from './api.type';

/**
 * 促销规则类型
 */
export interface Promotion {
      id: number;
      name: string;
      description?: string;
      type: 'AMOUNT_OFF' | 'PERCENT_OFF'; // 满减或折扣
      thresholdAmount: number; // 满足条件的金额阈值
      discountAmount: number; // 优惠金额
      startTime: string;
      endTime: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
}

/**
 * 优惠计算结果
 */
export interface PromotionResult {
      promotion: Promotion | null;
      discountAmount: number;
      finalAmount: number;
}

export type { ApiResponse };