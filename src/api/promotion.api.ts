// src/api/promotion.api.ts
import { get } from '@/utils/request';
import { ApiResponse, Promotion, PromotionResult } from '@/types/promotion.type';

/**
 * 获取当前可用的满减规则
 */
export function getAvailablePromotionsApi() {
      return get<ApiResponse<Promotion[]>>('/promotions');
}

/**
 * 检查特定金额可用的满减规则
 * @param amount 订单金额
 */
export function checkEligiblePromotionApi(amount: number) {
      return get<ApiResponse<PromotionResult>>('/promotions/check', { amount });
}