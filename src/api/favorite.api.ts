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
import { AxiosRequestConfig } from 'axios';

/**
 * 添加商品到收藏
 * @param data 收藏参数
 */
export function addFavoriteApi(data: AddFavoriteParams, config?: AxiosRequestConfig) {
    return post<ApiResponse<null>>('/favorites', data, {
        ...config,
        loading: false
    });
}

/**
 * 从收藏中移除商品
 * @param productId 商品ID
 */
export function removeFavoriteApi(productId: number, config?: AxiosRequestConfig) {
    return del<ApiResponse<null>>(`/favorites/${productId}`, {
        ...config,
        loading: false
    });
}

/**
 * 批量从收藏中移除商品
 * @param data 批量移除参数
 */
export function batchRemoveFavoritesApi(data: BatchRemoveFavoritesParams) {
    return post<ApiResponse<null>>('/favorites/batch-remove', data);
}

/**
 * 获取收藏商品列表
 * @param params 分页参数
 */
export function getFavoritesApi(params?: {
    page?: number;
    limit?: number;
}) {
    return get<ApiResponse<FavoriteListResponse>>('/favorites', params);
}

/**
 * 获取收藏商品ID列表
 */
export function getFavoriteIdsApi() {
    return get<ApiResponse<{
        total: number;
        data: number[];
    }>>('/favorites', { idsOnly: true });
}
/**
 * 检查商品是否已收藏
 * 此方法在前端实现，基于已加载的收藏ID列表
 * @param productId 商品ID
 * @param favoriteIds 收藏ID列表
 */
export function isFavoriteApi(productId: number, favoriteIds: number[]): boolean {
    return favoriteIds.includes(productId);
}

// 切换商品收藏状态
export async function toggleFavoriteApi(productId: number, config?: AxiosRequestConfig) {
    const res = await getFavoriteIdsApi();
    const favoriteIds = res.data.data;
    if (favoriteIds.includes(productId)) {
        return removeFavoriteApi(productId, config);
    } else {
        return addFavoriteApi({ productId }, config);
    }
}