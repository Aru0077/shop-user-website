// src/store/address.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      getAddressesApi,
      createAddressApi,
      updateAddressApi,
      deleteAddressApi,
      setDefaultAddressApi
} from '@/api/address.api';
import { Address, CreateAddressParams, UpdateAddressParams } from '@/types/address.type';
import { useUserStore } from './user.store';

export const useAddressStore = defineStore('address', () => {
      // 状态
      const addresses = ref<Address[]>([]);
      const loading = ref<boolean>(false);

      // 计算属性
      const getAddresses = computed(() => addresses.value);
      const getDefaultAddress = computed(() =>
            addresses.value.find(address => address.isDefault === 1)
      );
      const addressCount = computed(() => addresses.value.length);

      // 方法: 加载地址列表
      async function loadAddresses() {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return [];

            try {
                  loading.value = true;
                  const res = await getAddressesApi();
                  addresses.value = res.data;
                  return addresses.value;
            } catch (error) {
                  console.error('加载地址列表失败:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 创建地址
      async function createAddress(data: CreateAddressParams) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return null;

            try {
                  loading.value = true;
                  const res = await createAddressApi(data);
                  // 如果创建的是默认地址，更新其他地址状态
                  if (data.isDefault === 1) {
                        addresses.value = addresses.value.map(addr => ({
                              ...addr,
                              isDefault: 0
                        }));
                  }
                  // 添加新地址到列表
                  addresses.value.push(res.data);
                  return res.data;
            } catch (error) {
                  console.error('创建地址失败:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 更新地址
      async function updateAddress(id: number, data: UpdateAddressParams) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return null;

            try {
                  loading.value = true;
                  const res = await updateAddressApi(id, data);
                  // 如果设为默认地址，更新其他地址状态
                  if (data.isDefault === 1) {
                        addresses.value = addresses.value.map(addr => ({
                              ...addr,
                              isDefault: addr.id === id ? 1 : 0
                        }));
                  } else {
                        // 正常更新地址
                        addresses.value = addresses.value.map(addr =>
                              addr.id === id ? res.data : addr
                        );
                  }
                  return res.data;
            } catch (error) {
                  console.error('更新地址失败:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 删除地址
      async function deleteAddress(id: number) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            try {
                  loading.value = true;
                  await deleteAddressApi(id);
                  // 从列表中移除
                  const deletedAddress = addresses.value.find(addr => addr.id === id);
                  addresses.value = addresses.value.filter(addr => addr.id !== id);

                  // 如果删除的是默认地址且还有其他地址，自动将第一个地址设为默认
                  if (deletedAddress?.isDefault === 1 && addresses.value.length > 0) {
                        const newDefaultId = addresses.value[0].id;
                        await setDefaultAddressApi(newDefaultId);
                        addresses.value = addresses.value.map(addr => ({
                              ...addr,
                              isDefault: addr.id === newDefaultId ? 1 : 0
                        }));
                  }

                  return true;
            } catch (error) {
                  console.error('删除地址失败:', error);
                  return false;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 设置默认地址
      async function setDefaultAddress(id: number) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            try {
                  loading.value = true;
                  const res = await setDefaultAddressApi(id);
                  // 更新所有地址的默认状态
                  addresses.value = addresses.value.map(addr => ({
                        ...addr,
                        isDefault: addr.id === id ? 1 : 0
                  }));
                  return true;
            } catch (error) {
                  console.error('设置默认地址失败:', error);
                  return false;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 清空地址数据（用户登出时调用）
      function clearAddresses() {
            addresses.value = [];
      }

      return {
            // 状态
            addresses,
            loading,

            // 计算属性
            getAddresses,
            getDefaultAddress,
            addressCount,

            // 方法
            loadAddresses,
            createAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            clearAddresses
      };
}, {
      persist: true // 添加持久化配置
});