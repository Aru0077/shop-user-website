// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    loginApi,
    logoutApi,
    deleteAccountApi,
    registerApi
} from '@/api/user.api';
import { UserInfo, LoginParams, DeleteAccountParams, RegisterParams } from '@/types/user.type';
import { saveTokens, getAccessToken, clearTokens } from '@/utils/tokenManager';
import storage, { STORAGE_KEYS, DEFAULT_EXPIRY } from '@/utils/storage';
import { useFavoriteStore } from '@/store/favorite.store';
import { useAddressStore } from '@/store/address.store';
import { useCartStore } from '@/store/cart.store';
import { showLoadingToast, showNotify, closeToast } from 'vant';

// 定义用户Store - 使用组合式API写法
export const useUserStore = defineStore('user', () => {
    // 初始化状态，从storage获取用户信息
    const userInfo = ref<UserInfo | null>(storage.get(STORAGE_KEYS.USER, null));
    const isLoggedIn = ref<boolean>(!!getAccessToken());
    const isInitialized = ref<boolean>(false);
    const lastSyncTime = ref<number>(0);

    // 计算属性
    const getUserInfo = computed(() => userInfo.value);
    const getIsLoggedIn = computed(() => isLoggedIn.value);
    const getSyncStatus = computed(() => {
        if (!lastSyncTime.value) return '未同步';
        const now = Date.now();
        const diffMinutes = Math.floor((now - lastSyncTime.value) / (1000 * 60));
        
        if (diffMinutes < 1) return '刚刚同步';
        if (diffMinutes < 60) return `${diffMinutes}分钟前同步`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}小时前同步`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}天前同步`;
    });

    // 获取token (供外部API调用使用)
    function getAuthToken(): string {
        return getAccessToken();
    }

    // 设置用户信息
    function setUserData(info: UserInfo) {
        userInfo.value = info;
        storage.set(STORAGE_KEYS.USER, info, DEFAULT_EXPIRY.USER);
        lastSyncTime.value = Date.now();
    }

    // 清除用户信息
    function clearUserInfo() {
        userInfo.value = null;
        isLoggedIn.value = false;
        isInitialized.value = false;
        lastSyncTime.value = 0;
        storage.remove(STORAGE_KEYS.USER);
        clearTokens();
    }

    // 初始化用户数据
    async function initUserData() {
        if (!isLoggedIn.value || isInitialized.value) return;

        try {
            // 显示加载指示器
            const loadingToast = showLoadingToast({
                message: '正在加载用户数据...',
                forbidClick: true,
            });

            // 同时加载用户相关数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();
            const cartStore = useCartStore();

            await Promise.all([
                favoriteStore.loadFavoriteIds(),
                addressStore.loadAddresses(),
                cartStore.loadCartList(),
            ]);

            closeToast();
            isInitialized.value = true;
            lastSyncTime.value = Date.now();
            console.log('✅ 用户数据初始化完成');
        } catch (error) {
            console.error('初始化用户数据失败:', error);
            // 初始化失败，但不影响主流程，所以不抛出异常
            closeToast();
            showNotify({ type: 'warning', message: '部分用户数据加载失败' });
        }
    }

    // 用户注册
    async function register(registerData: RegisterParams) {
        try {
            const res = await registerApi(registerData);
            return Promise.resolve(res);
        } catch (error) {
            console.error('注册失败:', error);
            return Promise.reject(error);
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
            const cartStore = useCartStore();

            try {
                // 显示加载指示器
                const loadingToast = showLoadingToast({
                    message: '正在加载您的数据...',
                    forbidClick: true,
                });

                // 使用Promise.all并行加载数据，提高效率
                await Promise.all([
                    favoriteStore.loadFavoriteIds(),
                    addressStore.loadAddresses(),
                    cartStore.loadCartList(),
                ]);

                closeToast();
                isInitialized.value = true;
                lastSyncTime.value = Date.now();
                console.log('✅ 用户登录成功，相关数据已加载');
            } catch (loadError) {
                // 数据加载失败不应阻止登录成功
                console.error('登录成功但加载用户数据失败:', loadError);
                closeToast();
                showNotify({ type: 'warning', message: '登录成功，部分数据加载失败' });
            }

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

            // 清空其他Store的数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();
            const cartStore = useCartStore();

            favoriteStore.resetFavorites();
            addressStore.clearAddresses();
            cartStore.resetCart();

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

            // 清空其他Store的数据
            const favoriteStore = useFavoriteStore();
            const addressStore = useAddressStore();
            const cartStore = useCartStore();

            favoriteStore.resetFavorites();
            addressStore.clearAddresses();
            cartStore.resetCart();

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
        lastSyncTime,

        // 计算属性
        getUserInfo,
        getIsLoggedIn,
        getSyncStatus,

        // 方法
        getAuthToken,
        register,
        login,
        logout,
        deleteAccount,
        setUserData,
        clearUserInfo,
        initUserData,
        checkAndInitialize
    };
});