// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, deleteAccount as deleteAccountApi } from '@/api/user.api';
import { UserInfo, LoginParams, DeleteAccountParams } from '@/types/user.type';
import storage from '@/utils/storage';

// 本地存储键名定义
const TOKEN_KEY = 'ACCESS_TOKEN';
const USER_INFO_KEY = 'USER_INFO';

// 定义用户Store - 使用组合式API写法
export const useUserStore = defineStore('user', () => {
    // 初始化状态，直接从storage获取初始值
    const token = ref<string>(storage.get(TOKEN_KEY, ''));
    const userInfo = ref<UserInfo | null>(storage.get(USER_INFO_KEY, null));
    const isLoggedIn = ref<boolean>(!!token.value);

    // 计算属性
    const getToken = computed(() => token.value);
    const getUserInfo = computed(() => userInfo.value);
    const getIsLoggedIn = computed(() => isLoggedIn.value);

    // 获取token (供外部API调用使用)
    function getAuthToken(): string {
        return token.value;
    }

    // 设置Token
    function setUserToken(tokenValue: string) {
        token.value = tokenValue;
        storage.set(TOKEN_KEY, tokenValue);
        isLoggedIn.value = true;
    }

    // 设置用户信息
    function setUserData(info: UserInfo) {
        userInfo.value = info;
        storage.set(USER_INFO_KEY, info);
    }

    // 清除用户信息
    function clearUserInfo() {
        token.value = '';
        userInfo.value = null;
        isLoggedIn.value = false;
        storage.remove(TOKEN_KEY);
        storage.remove(USER_INFO_KEY);
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
        getAuthToken,
        login,
        logout,
        deleteAccount,
        setUserToken,
        setUserData,
        clearUserInfo
    };
});