import { ApiResponse } from './api.type';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
      PENDING_PAYMENT = 1,
      PENDING_SHIPMENT = 2,
      SHIPPED = 3,
      COMPLETED = 4,
      CANCELLED = 5,
      REFUNDING = 6,
      REFUNDED = 7
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
      UNPAID = 0,
      PAID = 1,
      REFUNDED = 2
}

/**
 * 订单接口
 */
export interface Order {
      id: string;
      orderNo: string;
      userId: string;
      orderStatus: OrderStatus;
      paymentStatus: PaymentStatus;
      shippingAddress: {
            receiverName: string;
            receiverPhone: string;
            province: string;
            city: string;
            detailAddress: string;
      };
      totalAmount: number;
      paymentAmount: number;
      createdAt: string;
      updatedAt: string;
      orderItems: OrderItem[];
      paymentLogs?: PaymentLog[];
      timeoutSeconds?: number | null;
}

/**
 * 订单项接口
 */
export interface OrderItem {
      id: number;
      orderId: string;
      skuId: number;
      productName: string;
      mainImage: string;
      skuSpecs: { specName: string; specValue: string }[];
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      createdAt: string;
      sku?: {
            id: number;
            skuCode?: string;
            sku_specs?: Array<{
                  spec: {
                        id: number;
                        name: string;
                  };
                  specValue: {
                        id: number;
                        value: string;
                  };
            }>;
      };
}

/**
 * 支付记录接口
 */
export interface PaymentLog {
      id: number;
      orderId: string;
      amount: number;
      paymentType: string;
      transactionId?: string;
      status: number;
      createdAt: string;
}

/**
 * 创建订单请求参数
 */
export interface CreateOrderParams {
      addressId: number;
      cartItemIds: number[];
      remark?: string;
}

/**
 * 支付订单请求参数
 */
export interface PayOrderParams {
      paymentType: string;
      transactionId?: string;
}

/**
 * 订单列表响应数据
 */
export interface OrderListResponse {
      total: number;
      page: number;
      limit: number;
      data: Order[];
}

// 导出API响应类型，以便于在order.api.ts中使用
export type { ApiResponse };