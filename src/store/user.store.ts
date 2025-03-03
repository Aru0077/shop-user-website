// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, deleteAccount as deleteAccountApi } from '@/api/user.api';
import { UserInfo, LoginParams, DeleteAccountParams } from '@/types/user.type';
import { saveTokens, getAccessToken, clearTokens } from '@/utils/tokenManager';
import storage from '@/utils/storage';
import { useFavoriteStore } from '@/store/favorite.store';
import { useAddressStore } from '@/store/address.store';

// 本地存储键名定义
const USER_INFO_KEY = 'USER_INFO';

// 定义用户Store - 使用组合式API写法
export const useUserStore = defineStore('user', () => {
    // 初始化状态，从storage获取用户信息
    const userInfo = ref<UserInfo | null>(storage.get(USER_INFO_KEY, null));
    const isLoggedIn = ref<boolean>(!!getAccessToken());
    const isInitialized = ref<boolean>(false);

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

    // 初始化用户数据
    async function initUserData() {
        if (!isLoggedIn.value || isInitialized.value) return;

        try {
            // 同时加载用户相关数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();

            await Promise.all([
                favoriteStore.loadFavoriteIds(),
                addressStore.loadAddresses()
            ]);

            isInitialized.value = true;
            console.log('✅ 用户数据初始化完成');
        } catch (error) {
            console.error('初始化用户数据失败:', error);
            // 初始化失败，但不影响主流程，所以不抛出异常
        }
    }

    // 用户登录
    async function login(loginData: LoginParams) {
        try {
            const res = await loginApi(loginData);
            const { token, user } = res.data;

            // 保存令牌
            saveTokens(token);

            // 保存用户信息到本地
            setUserData(user);
            isLoggedIn.value = true;

            // 登录成功后加载用户相关数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();

            // 使用Promise.all并行加载数据，提高效率
            await Promise.all([
                favoriteStore.loadFavoriteIds(),
                addressStore.loadAddresses()
            ]);

            isInitialized.value = true;
            console.log('✅ 用户登录成功，相关数据已加载');

            return Promise.resolve(res);
        } catch (error) {
            console.error('登录失败:', error);
            return Promise.reject(error);
        }
    }

    // 用户登出
    async function logout() {
        try {
            await logoutApi();

            // 清空用户信息
            clearUserInfo();
            isInitialized.value = false;

            // 清空其他Store的数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();

            favoriteStore.resetFavorites();
            addressStore.clearAddresses();

            console.log('✅ 用户已登出，所有数据已清除');
            return Promise.resolve(true);
        } catch (error) {
            // 即使API调用失败，也清除本地信息
            clearUserInfo();
            console.error('登出过程中出错，但本地数据已清除:', error);
            return Promise.reject(error);
        }
    }

    // 删除账号
    async function deleteAccount(data: DeleteAccountParams) {
        try {
            await deleteAccountApi(data);

            // 清空用户信息
            clearUserInfo();
            isInitialized.value = false;

            // 清空其他Store的数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();

            favoriteStore.resetFavorites();
            addressStore.clearAddresses();

            console.log('✅ 账号已删除，所有数据已清除');
            return Promise.resolve(true);
        } catch (error) {
            console.error('删除账号失败:', error);
            return Promise.reject(error);
        }
    }

    // 检查并初始化已登录用户的数据
    function checkAndInitialize() {
        if (isLoggedIn.value && !isInitialized.value) {
            initUserData();
        }
    }

    // 应用启动时自动初始化
    checkAndInitialize();

    return {
        // 状态
        userInfo,
        isLoggedIn,
        isInitialized,

        // 计算属性
        getUserInfo,
        getIsLoggedIn,

        // 方法
        getAuthToken,
        login,
        logout,
        deleteAccount,
        setUserData,
        clearUserInfo,
        initUserData,
        checkAndInitialize
    };
}, {
    persist: true
});