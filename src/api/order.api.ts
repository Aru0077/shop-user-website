// src/api/order.api.ts
import { get, post } from '@/utils/request';
import {
      ApiResponse,
      Order,
      OrderListResponse,
      CreateOrderParams,
      PayOrderParams
} from '@/types/order.type';

/**
 * 创建订单
 * @param data 订单参数
 */
export function createOrder(data: CreateOrderParams) {
      return post<ApiResponse<Order>>('/orders', data);
}

/**
 * 获取订单列表
 * @param params 查询参数
 */
export function getOrderList(params?: {
      page?: number;
      limit?: number;
      status?: number;
}) {
      return get<ApiResponse<OrderListResponse>>('/orders', params);
}

/**
 * 获取订单详情
 * @param id 订单ID
 */
export function getOrderDetail(id: string) {
      return get<ApiResponse<Order>>(`/orders/${id}`);
}

/**
 * 支付订单
 * @param id 订单ID
 * @param data 支付参数
 */
export function payOrder(id: string, data: PayOrderParams) {
      return post<ApiResponse<{ orderId: string }>>(`/orders/${id}/pay`, data);
}