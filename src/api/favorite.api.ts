// src/api/favorite.api.ts
import { get, post, del } from '@/utils/request';
import { ApiResponse, ProductListResponse } from '@/types/product.type';

/**
 * 收藏商品
 * @param productId 商品ID
 */
export function addFavorite(productId: number) {
      return post<ApiResponse<null>>('/favorites', { productId });
}

/**
 * 取消收藏
 * @param productId 商品ID
 */
export function removeFavorite(productId: number) {
      return del<ApiResponse<null>>(`/favorites/${productId}`);
}

/**
 * 批量取消收藏
 * @param productIds 商品ID数组
 */
export function batchRemoveFavorites(productIds: number[]) {
      return post<ApiResponse<null>>('/favorites/batch-remove', { productIds });
}

/**
 * 获取收藏列表
 * @param page 页码
 * @param limit 每页数量
 */
export function getFavorites(page = 1, limit = 10) {
      return get<ApiResponse<ProductListResponse>>('/favorites', { page, limit });
}