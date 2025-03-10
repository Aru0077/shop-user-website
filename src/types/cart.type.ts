import { ApiResponse } from './api.type';
import { Product, ProductStatus } from './product.type';

/**
 * 购物车项接口
 */
export interface CartItem {
      id: number;
      userId: string;
      productId: number;
      skuId: number;
      quantity: number;
      createdAt: string;
      updatedAt: string;
      product?: {
            id: number;
            name: string;
            mainImage: string;
            status: ProductStatus;
      };
      sku?: {
            id: number;
            price: number;
            promotion_price: number | null;
            stock: number;
            skuCode?: string;
            image?: string;
            sku_specs?: Array<{
                  sku_id: number;
                  specId: number;
                  specValueId: number;
                  spec: {
                        id: number;
                        name: string;
                  };
                  specValue: {
                        id: number;
                        specId: number;
                        value: string;
                  };
            }>;
      };
      isAvailable?: boolean;
}

/**
 * 添加购物车请求参数
 */
export interface AddCartItemParams {
      productId: number;
      skuId: number;
      quantity?: number;
}

/**
 * 更新购物车项请求参数
 */
export interface UpdateCartItemParams {
      quantity: number;
}

/**
 * 购物车列表响应数据
 */
export interface CartListResponse {
      total: number;
      page: number;
      limit: number;
      data: CartItem[];
}

/**
 * 订单预览响应数据
 */
export interface OrderPreviewResponse {
      totalAmount: number;          // 总金额
      discountAmount: number;       // 折扣金额
      paymentAmount: number;        // 实际支付金额
      promotion: {
            id: number;
            name: string;
            type: string;           // 类型: 'AMOUNT_OFF' 或 'PERCENT_OFF'
            thresholdAmount: number;
            discountAmount: number;
      } | null;                     // 适用的促销规则
      cartItems: Array<{
            id: number;
            quantity: number;
            skuId: number;
            productId: number;
            unitPrice: number;
      }>;                           // 购物车项详情
}

/**
 * 预览订单请求参数
 */
export interface PreviewOrderParams {
      cartItemIds?: number[];
      productInfo?: {
            productId: number;
            skuId: number;
            quantity: number;
      };
}


// 导出API响应类型，以便于在cart.api.ts中使用
export type { ApiResponse };