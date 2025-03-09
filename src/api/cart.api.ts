// src/api/cart.api.ts
import { get, post, put, del } from '@/utils/request';
import {
      ApiResponse,
      CartItem,
      CartListResponse,
      AddCartItemParams,
      UpdateCartItemParams,
      OrderPreviewResponse
} from '@/types/cart.type';
import { AxiosRequestConfig } from 'axios';

/**
 * 添加商品到购物车
 * @param data 添加购物车参数
 */
export function addToCartApi(data: AddCartItemParams, config?: AxiosRequestConfig) {
      // 合并配置，确保loading为false
      return post<ApiResponse<CartItem>>('/cart', data, {
            ...config,
            loading: false
      });
}

/**
 * 更新购物车商品数量
 * @param id 购物车项ID
 * @param data 更新参数
 */
export function updateCartItemApi(id: number, data: UpdateCartItemParams, config?: AxiosRequestConfig) {
      return put<ApiResponse<CartItem>>(`/cart/${id}`, data, {
            ...config,
            loading: false
      });
}

/**
 * 删除购物车商品
 * @param id 购物车项ID
 */
export function deleteCartItemApi(id: number, config?: AxiosRequestConfig) {
      return del<ApiResponse<null>>(`/cart/${id}`, {
            ...config,
            loading: false
      });
}

/**
 * 获取购物车列表
 * @param params 分页参数
 */
export function getCartListApi(params?: {
      page?: number;
      limit?: number;
}, config?: AxiosRequestConfig) {
      return get<ApiResponse<CartListResponse>>('/cart', params, {
            ...config,
            loading: false
      });
}

/**
 * 清空购物车
 */
export function clearCartApi() {
      return del<ApiResponse<null>>('/cart/clear');
}

/**
 * 预览订单金额（包含满减优惠）
 * @param cartItemIds 购物车项ID数组
 */
export function previewOrderAmountApi(cartItemIds: number[]) {
      return post<ApiResponse<OrderPreviewResponse>>('/cart/preview', { cartItemIds });
    }