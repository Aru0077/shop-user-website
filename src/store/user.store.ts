// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, deleteAccount as deleteAccountApi } from '@/api/user.api';
import { UserInfo, LoginParams, DeleteAccountParams } from '@/types/user.type';
import { saveTokens, getAccessToken, clearTokens } from '@/utils/tokenManager';
import storage from '@/utils/storage';

// 本地存储键名定义
const USER_INFO_KEY = 'USER_INFO';

// 定义用户Store - 使用组合式API写法
export const useUserStore = defineStore('user', () => {
    // 初始化状态，从storage获取用户信息
    const userInfo = ref<UserInfo | null>(storage.get(USER_INFO_KEY, null));
    const isLoggedIn = ref<boolean>(!!getAccessToken());

    // 计算属性
    const getUserInfo = computed(() => userInfo.value);
    const getIsLoggedIn = computed(() => isLoggedIn.value);

    // 获取token (供外部API调用使用)
    function getAuthToken(): string {
        return getAccessToken();
    }

    // 设置用户信息
    function setUserData(info: UserInfo) {
        userInfo.value = info;
        storage.set(USER_INFO_KEY, info);
    }

    // 清除用户信息
    function clearUserInfo() {
        userInfo.value = null;
        isLoggedIn.value = false;
        storage.remove(USER_INFO_KEY);
        clearTokens();
    }

    // 用户登录
    async function login(loginData: LoginParams) {
        try {
            const res = await loginApi(loginData);
            const { token, user } = res.data;

            // 简化为单令牌存储
            saveTokens(token);
            setUserData(user);
            isLoggedIn.value = true;

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
            // 即使API调用失败，也清除本地信息
            clearUserInfo();
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
        userInfo,
        isLoggedIn,

        // 计算属性
        getUserInfo,
        getIsLoggedIn,

        // 方法
        getAuthToken,
        login,
        logout,
        deleteAccount,
        setUserData,
        clearUserInfo
    };
}, {
    persist: true
});