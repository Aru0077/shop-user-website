// src/api/product.api.ts
import { get } from '@/utils/request';
import {
      ApiResponse,
      Category,
      HomeData,
      Product,
      ProductDetail,
      ProductListResponse,
      ProductSortType
} from '@/types/product.type';

/**
 * 获取分类树
 */
export function getCategoryTreeApi() {
      return get<ApiResponse<Category[]>>('/products/categories/tree');
}

/**
 * 获取首页数据
 */
export function getHomePageDataApi() {
      return get<ApiResponse<HomeData>>('/products/home-data');
}

/**
 * 获取最新上架商品
 * @param page 页码
 * @param limit 每页数量
 */
export function getLatestProductsApi(page = 1, limit = 10) {
      return get<ApiResponse<ProductListResponse>>('/products/latest', { page, limit });
}

/**
 * 获取销量最高商品
 * @param page 页码
 * @param limit 每页数量
 */
export function getTopSellingProductsApi(page = 1, limit = 10) {
      return get<ApiResponse<ProductListResponse>>('/products/top-selling', { page, limit });
}

/**
 * 获取促销商品
 * @param page 页码
 * @param limit 每页数量
 */
export function getPromotionProductsApi(page = 1, limit = 10) {
      return get<ApiResponse<ProductListResponse>>('/products/promotion', { page, limit });
}

/**
 * 获取分类下的商品列表
 * @param categoryId 分类ID
 * @param page 页码
 * @param limit 每页数量
 * @param sort 排序方式
 */
export function getCategoryProductsApi(
      categoryId: number,
      page = 1,
      limit = 10,
      sort: ProductSortType = ProductSortType.NEWEST
) {
      return get<ApiResponse<ProductListResponse>>(`/products/category/${categoryId}`, {
            page,
            limit,
            sort
      });
}

/**
 * 搜索商品
 * @param keyword 搜索关键词
 * @param page 页码
 * @param limit 每页数量
 */
export function searchProductsApi(keyword: string, page = 1, limit = 10) {
      return get<ApiResponse<ProductListResponse>>('/products/search', {
            keyword,
            page,
            limit
      });
}

/**
 * 获取商品详情
 * @param id 商品ID
 */
export function getProductDetailApi(id: number) {
      return get<ApiResponse<ProductDetail>>(`/products/${id}`);
}