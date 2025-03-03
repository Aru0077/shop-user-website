// src/api/address.api.ts
import { get, post, put, patch, del } from '@/utils/request';
import {
      ApiResponse,
      Address,
      CreateAddressParams,
      UpdateAddressParams
} from '@/types/address.type';

/**
 * 获取收货地址列表
 */
export function getAddresses() {
      return get<ApiResponse<Address[]>>('/addresses');
}

/**
 * 创建收货地址
 * @param data 地址信息
 */
export function createAddress(data: CreateAddressParams) {
      return post<ApiResponse<Address>>('/addresses', data);
}

/**
 * 更新收货地址
 * @param id 地址ID
 * @param data 地址信息
 */
export function updateAddress(id: number, data: CreateAddressParams) {
      return put<ApiResponse<Address>>(`/addresses/${id}`, data);
}

/**
 * 删除收货地址
 * @param id 地址ID
 */
export function deleteAddress(id: number) {
      return del<ApiResponse<null>>(`/addresses/${id}`);
}

/**
 * 设置默认收货地址
 * @param id 地址ID
 */
export function setDefaultAddress(id: number) {
      return patch<ApiResponse<Address>>(`/addresses/${id}/default`);
}