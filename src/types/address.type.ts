// src/types/address.type.ts
import { ApiResponse } from './api.type';

/**
 * 收货地址接口
 */
export interface Address {
      id: number;
      userId: string;
      receiverName: string;
      receiverPhone: string;
      province: string;
      city: string;
      detailAddress: string;
      isDefault: number;
      createdAt: string;
      updatedAt: string;
}

/**
 * 创建地址请求参数
 */
export interface CreateAddressParams {
      receiverName: string;
      receiverPhone: string;
      province: string;
      city: string;
      detailAddress: string;
      isDefault?: number;
}

/**
 * 更新地址请求参数
 */
export interface UpdateAddressParams extends CreateAddressParams {
      id: number;
}

/**
 * 地址列表响应数据
 */
export interface AddressListResponse {
      addresses: Address[];
}

// 导出API响应类型重命名，以便于在address.api.ts中使用
export type { ApiResponse };