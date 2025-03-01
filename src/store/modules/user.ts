// src/store/modules/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, deleteAccount as deleteAccountApi } from '@/api/modules/user';
import { UserInfo, LoginParams, DeleteAccountParams } from '@/types/user.type';
import { getAuthToken, setToken, getStoredUserInfo, setUserInfo, clearAuth } from '@/utils/auth';

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
            setUserInfo(info);
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