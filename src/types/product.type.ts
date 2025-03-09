// src/types/product.type.ts
import { ApiResponse } from './api.type';

/**
 * 商品状态枚举
 */
export enum ProductStatus {
      DRAFT = 'DRAFT',
      ONLINE = 'ONLINE',
      OFFLINE = 'OFFLINE',
      DELETED = 'DELETED'
}


// 商品基础接口
export interface Product {
      id: number;
      categoryId: number;
      name: string;
      content?: string;
      mainImage?: string;
      detailImages?: string[];
      is_promotion?: number;
      status: ProductStatus;
      productCode: string;
      createdAt: string;
      updatedAt: string;
      salesCount?: number;
      category?: Category;
      skus?: Sku[];
}

// 分类接口
export interface Category {
      id: number;
      name: string;
      parentId?: number;
      level?: number;
      children?: Category[];
}

// SKU接口
export interface Sku {
      id: number;
      productId: number;
      price: number;
      stock?: number;
      lockedStock?: number;
      skuCode?: string;
      image?: string;
      promotion_price?: number;
      sku_specs?: SkuSpec[];
}

// SKU规格接口
export interface SkuSpec {
      sku_id: number;
      specId: number;
      specValueId: number;
      spec: Spec;
      specValue: SpecValue;
}

// 规格接口
export interface Spec {
      id: number;
      name: string;
      values?: SpecValue[];
}

// 规格值接口
export interface SpecValue {
      id: number;
      specId: number;
      value: string;
}

// 商品详情接口
export interface ProductDetail extends Product {
      specs: Spec[];
}

// Banner接口
export interface Banner {
      id: number;
      imageUrl: string;
      title: string;
      content?: string;
      createdAt: string;
      updatedAt: string;
}

// 首页数据接口
export interface HomeData {
      latestProducts: Product[];
      topSellingProducts: Product[];
      banner: Banner | null;
}

// 分页商品列表接口
export interface ProductListResponse {
      total: number;
      page: number;
      limit: number;
      data: Product[];
}

// 排序选项枚举
export enum ProductSortType {
      NEWEST = 'newest',
      PRICE_ASC = 'price-asc',
      PRICE_DESC = 'price-desc',
      SALES = 'sales'
}

// 导出API响应类型重命名，以便于在product.api.ts中使用
export type { ApiResponse };