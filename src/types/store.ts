// src/types/store.ts
import { UserData } from './api';

/**
 * 用户状态接口
 */
export interface UserState {
  token: string;
  userInfo: UserData | null;
  isLoggedIn: boolean;
}

/**
 * 购物车状态接口
 */
export interface CartState {
  items: Array<any>; // 购物车项类型根据后续需求补充
  totalQuantity: number;
  totalAmount: number;
}