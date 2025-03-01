// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, deleteAccount as deleteAccountApi } from '@/api/user.api';
import { UserInfo, LoginParams, DeleteAccountParams, UserState } from '@/types/user.type';
import storage from '@/utils/storage';

// 本地存储键名定义
const TOKEN_KEY = 'ACCESS_TOKEN';
const USER_INFO_KEY = 'USER_INFO';
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7; // 7天缓存期限

// 从auth.ts合并的工具函数
/**
 * 获取token
 */
export function getAuthToken(): string {
    return storage.get(TOKEN_KEY, '');
}

/**
 * 设置token
 */
export function setToken(token: string): void {
    storage.set(TOKEN_KEY, token);
}

/**
 * 获取用户信息
 */
export function getStoredUserInfo(): UserInfo | null {
    return storage.get(USER_INFO_KEY, null);
}

/**
 * 设置用户信息
 */
export function setStoredUserInfo(info: UserInfo): void {
    storage.set(USER_INFO_KEY, info);
}

/**
 * 清除所有用户相关信息
 */
export function clearAuth(): void {
    storage.remove(TOKEN_KEY);
    storage.remove(USER_INFO_KEY);
}

// 定义用户Store - 使用组合式API写法
export const useUserStore = defineStore('user', () => {
    // 状态
    const token = ref<string>(getAuthToken());
    const userInfo = ref<UserInfo | null>(getStoredUserInfo());
    const isLoggedIn = ref<boolean>(!!getAuthToken());

    // 计算属性
    const getToken = computed(() => token.value);
    const getUserInfo = computed(() => userInfo.value);
    const getIsLoggedIn = computed(() => isLoggedIn.value);

    // 操作方法
    // 设置Token
    function setUserToken(tokenValue: string) {
        token.value = tokenValue;
        setToken(tokenValue);
        isLoggedIn.value = true;
    }

    // 设置用户信息
    function setUserData(info: UserInfo) {
        userInfo.value = info;
        setStoredUserInfo(info);
    }

    // 清除用户信息
    function clearUserInfo() {
        token.value = '';
        userInfo.value = null;
        isLoggedIn.value = false;
        clearAuth();
    }

    // 用户登录
    async function login(loginData: LoginParams) {
        try {
            const res = await loginApi(loginData);
            const { token: tokenValue, user } = res.data;

            // 保存令牌和用户信息
            setUserToken(tokenValue);
            setUserData(user);

            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 用户登出
    async function logout() {
        try {
            await logoutApi();
            clearUserInfo();
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 删除账号
    async function deleteAccount(data: DeleteAccountParams) {
        try {
            await deleteAccountApi(data);
            clearUserInfo();
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    return {
        // 状态
        token,
        userInfo,
        isLoggedIn,

        // 计算属性
        getToken,
        getUserInfo,
        getIsLoggedIn,

        // 方法
        login,
        logout,
        deleteAccount,
        setUserToken,
        setUserData,
        clearUserInfo
    };
});