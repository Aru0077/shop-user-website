// src/types/favorite.type.ts
import { ApiResponse } from './api.type';
import { ProductStatus } from './product.type'; 

/**
 * 收藏商品接口
 */
export interface Favorite {
    id: number;
    userId: string;
    productId: number;
    createdAt: string;
    product?: FavoriteProduct;
}

/**
 * 收藏商品详情接口
 */
export interface FavoriteProduct {
    id: number;
    name: string;
    mainImage: string;
    status: ProductStatus;
    category?: {
        id: number;
        name: string;
    };
    skus?: Array<{
        id: number;
        price: number;
        promotion_price: number | null;
        stock: number;
    }>;
}

/**
 * 添加收藏请求参数
 */
export interface AddFavoriteParams {
    productId: number;
}

/**
 * 批量删除收藏请求参数
 */
export interface BatchRemoveFavoritesParams {
    productIds: number[];
}

/**
 * 收藏列表响应数据
 */
export interface FavoriteListResponse {
    total: number;
    page: number;
    limit: number;
    data: Favorite[];
}

/**
 * 收藏ID列表响应数据
 */
export interface FavoriteIdsResponse {
    total: number;
    data: number[];
}

/**
 * 收藏状态接口
 */
export interface FavoriteState {
    favoriteIds: number[];
    favorites: Favorite[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
}

// 导出API响应类型，以便于在favorite.api.ts中使用
export type { ApiResponse };