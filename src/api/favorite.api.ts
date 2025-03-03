// src/api/favorite.api.ts
import { get, post, del } from '@/utils/request';
import {
    ApiResponse,
    Favorite,
    FavoriteListResponse,
    FavoriteIdsResponse,
    AddFavoriteParams,
    BatchRemoveFavoritesParams
} from '@/types/favorite.type';

/**
 * 添加商品到收藏
 * @param data 收藏参数
 */
export function addFavorite(data: AddFavoriteParams) {
    return post<ApiResponse<null>>('/favorites', data);
}

/**
 * 从收藏中移除商品
 * @param productId 商品ID
 */
export function removeFavorite(productId: number) {
    return del<ApiResponse<null>>(`/favorites/${productId}`);
}

/**
 * 批量从收藏中移除商品
 * @param data 批量移除参数
 */
export function batchRemoveFavorites(data: BatchRemoveFavoritesParams) {
    return post<ApiResponse<null>>('/favorites/batch-remove', data);
}

/**
 * 获取收藏商品列表
 * @param params 分页参数
 */
export function getFavorites(params?: {
    page?: number;
    limit?: number;
}) {
    return get<ApiResponse<FavoriteListResponse>>('/favorites', params);
}

/**
 * 获取收藏商品ID列表
 */
export function getFavoriteIds() {
    return get<ApiResponse<FavoriteIdsResponse>>('/favorites', { idsOnly: true });
}

/**
 * 检查商品是否已收藏
 * 此方法在前端实现，基于已加载的收藏ID列表
 * @param productId 商品ID
 * @param favoriteIds 收藏ID列表
 */
export function isFavorite(productId: number, favoriteIds: number[]): boolean {
    return favoriteIds.includes(productId);
}