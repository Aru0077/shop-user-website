<!-- src/views/address/AddressList.vue -->
<template>
    <div class="pageContent">
        <!-- 顶部标题 -->
        <div class="px-[5px]">
            <div class="text-[25px] font-bold leading-4 text-black">My Addresses</div>
        </div>

        <!-- 占位容器 -->
        <div style="height: 18px;"></div>

        <!-- 加载状态 -->
        <van-loading v-if="loading" type="spinner" size="24px" class="my-4 flex justify-center" />

        <!-- 地址列表 -->
        <template v-else>
            <!-- 登录提示 -->
            <div v-if="!isLoggedIn" class="bg-gray-100 rounded-lg p-4 mb-4 flex flex-col items-center">
                <div class="text-[16px] text-gray-700 mb-2">Please sign in to manage your addresses</div>
                <van-button type="primary" size="small" round @click="navigateToLogin">Sign In</van-button>
            </div>

            <!-- 空状态 -->
            <van-empty v-else-if="addresses.length === 0" description="No addresses yet" />

            <!-- 地址列表 -->
            <div v-else class="space-y-3">
                <div v-for="address in addresses" :key="address.id" class="bg-white rounded-lg shadow-md p-2 relative">
                    <!-- 默认标识 -->
                    <div v-if="address.isDefault === 1"
                        class="absolute top-0 right-0 bg-black text-white text-[10px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                        Default
                    </div>

                    <!-- 主要信息 -->
                    <div class="flex items-start mb-1">
                        <div class="flex-1">
                            <div class="flex items-center">
                                <span class="text-[16px] font-medium">{{ address.receiverName }}</span>
                                <span class="ml-2 text-[14px] text-gray-500">{{ address.receiverPhone }}</span>
                            </div>
                            <div class="text-[14px] text-gray-700 mt-1">
                                {{ formatAddress(address) }}
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="flex justify-end gap-1">
                        <!-- 设为默认 -->
                        <van-button v-if="address.isDefault !== 1" plain type="default" size="mini"
                            @click="setAsDefault(address.id)">
                            Set as Default
                        </van-button>

                        <!-- 编辑 -->
                        <van-button plain type="primary" size="mini" @click="editAddress(address)">
                            Edit
                        </van-button>

                        <!-- 删除 -->
                        <van-button plain type="danger" size="mini" @click="deleteConfirm(address.id)">
                            Delete
                        </van-button>
                    </div>
                </div>
            </div>

            <!-- 添加新地址按钮 -->
            <div class="fixed bottom-20 right-4 z-10">
                <van-button type="primary" round icon="plus" class="shadow-lg" @click="navigateToAddAddress"
                    :disabled="reachedAddressLimit">
                    Add New Address
                </van-button>
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog, showToast, showSuccessToast } from 'vant';
import { useAddressStore } from '@/store/address.store';
import { useUserStore } from '@/store/user.store';
import { Address } from '@/types/address.type';

// 初始化
const router = useRouter();
const addressStore = useAddressStore();
const userStore = useUserStore();

// 状态
const loading = ref(true);
const isPageActive = ref(true);

// 计算属性
const addresses = computed(() => addressStore.getAddresses);
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 格式化地址
const formatAddress = (address: Address): string => {
    return `${address.province}, ${address.city}, ${address.detailAddress}`;
};

// 加载地址列表
const loadAddresses = async () => {
    if (!isLoggedIn.value) {
        loading.value = false;
        return;
    }

    try {
        loading.value = true;
        // 如果本地已有地址数据，直接使用，不再请求网络
        if (addressStore.addresses.length > 0) {
            loading.value = false;
            return;
        }
        // 本地没有数据时才从网络加载
        await addressStore.loadAddresses();
    } catch (error) {
        console.error('Failed to load addresses:', error);
        showToast('Failed to load addresses');
    } finally {
        loading.value = false;
    }
};

// 编辑地址
const editAddress = (address: Address) => {
    router.push({
        path: '/address/add',
        query: { id: address.id.toString() }
    });
};

// 设为默认地址
const setAsDefault = async (id: number) => {
    try {
        showToast({ message: 'Setting as default...', duration: 0 });
        await addressStore.setDefaultAddress(id);
        showSuccessToast('Set as default successfully');
    } catch (error) {
        console.error('Failed to set default address:', error);
        showToast('Failed to set default address');
    }
};

// 删除地址确认
const deleteConfirm = (id: number) => {
    showDialog({
        title: 'Delete Address',
        message: 'Are you sure you want to delete this address?',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#ee0a24',
    }).then(async () => {
        // 确认删除
        try {
            showToast({ message: 'Deleting...', duration: 0 });
            await addressStore.deleteAddress(id);
            showSuccessToast('Deleted successfully');
        } catch (error) {
            console.error('Failed to delete address:', error);
            showToast('Failed to delete address');
        }
    }).catch(() => {
        // 取消删除
    });
};

// 添加一个计算属性，判断是否达到地址上限
const reachedAddressLimit = computed(() => addresses.value.length >= 10);

// 跳转到添加地址页面 
const navigateToAddAddress = () => {
    if (reachedAddressLimit.value) {
        showToast('You can have a maximum of 10 addresses');
        return;
    }
    router.push('/address/add');
};

// 跳转到登录页面
const navigateToLogin = () => {
    router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
    });
};

// 生命周期钩子
onMounted(() => {
    loadAddresses();
});

// 每次页面被激活时刷新数据
onActivated(() => {
    isPageActive.value = true;
    loadAddresses();
});
</script>

<style scoped>
:deep(.van-button--primary) {
    background: linear-gradient(to right, #4f46e5, #6366f1);
    border: none;
}

:deep(.van-button--primary.van-button--plain) {
    color: #4f46e5;
    border-color: #4f46e5;
    background: transparent;
}

:deep(.van-button--danger.van-button--plain) {
    color: #ee0a24;
    border-color: #ee0a24;
    background: transparent;
}

:deep(.van-button--default.van-button--plain) {
    color: #323233;
    border-color: #dcdee0;
    background: transparent;
}
</style>