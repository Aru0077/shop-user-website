// src/api/cart.api.ts
import { get, post, put, del } from '@/utils/request';
import {
      ApiResponse,
      CartItem,
      CartListResponse,
      AddCartItemParams,
      UpdateCartItemParams
} from '@/types/cart.type';

/**
 * 添加商品到购物车
 * @param data 添加购物车参数
 */
export function addToCart(data: AddCartItemParams) {
      return post<ApiResponse<CartItem>>('/cart', data);
}

/**
 * 更新购物车商品数量
 * @param id 购物车项ID
 * @param data 更新参数
 */
export function updateCartItem(id: number, data: UpdateCartItemParams) {
      return put<ApiResponse<CartItem>>(`/cart/${id}`, data);
}

/**
 * 删除购物车商品
 * @param id 购物车项ID
 */
export function deleteCartItem(id: number) {
      return del<ApiResponse<null>>(`/cart/${id}`);
}

/**
 * 获取购物车列表
 * @param params 分页参数
 */
export function getCartList(params?: {
      page?: number;
      limit?: number;
}) {
      return get<ApiResponse<CartListResponse>>('/cart', params);
}

/**
 * 清空购物车
 */
export function clearCart() {
      return del<ApiResponse<null>>('/cart/clear');
}