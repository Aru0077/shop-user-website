<!-- src/views/address/AddressAdd.vue -->
<template>
    <div class="pageContent">
        <div class="px-[5px]">
            <div class="text-[20px] font-bold leading-4 text-black">
                {{ isEditMode ? 'Edit Address' : 'Add New Address' }}
            </div>
        </div>

        <div class="mt-4 shadow-2xl p-2 rounded-xl border-1 border-gray-500">
            <!-- 表单内容 -->
            <van-form @submit="onSubmit">
                <!-- 收件人姓名 -->
                <van-field v-model="formData.receiverName" name="receiverName" label="Full Name"
                    placeholder="Enter recipient's name" :rules="rules.receiverName" class="mb-2" />

                <!-- 收件人电话 -->
                <van-field v-model="formData.receiverPhone" name="receiverPhone" label="Phone Number"
                    placeholder="Enter contact phone number" :rules="rules.receiverPhone" type="tel" class="mb-2" />

                <!-- 省份/城市（不可编辑） -->
                <van-field v-model="formData.province" name="province" label="Province" readonly :rules="rules.province"
                    class="mb-2" />

                <!-- 城市选择器（使用Popover） -->
                <van-field v-model="formData.city" name="city" label="City" placeholder="Select city"
                    :rules="rules.city" readonly class="mb-2" @click="showPopover = true">
                    <template #right-icon>
                        <van-icon name="arrow-down" />
                    </template>
                </van-field>

                <!-- 城市选择Popover -->
                <van-popup v-model:show="showPopover" position="bottom" round>
                    <div class="city-selector px-2 py-3">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-[22px] font-bold">Select City</h3>
                            <van-icon name="cross" @click="showPopover = false" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <van-button v-for="city in cities" :key="city.id"
                                :class="['city-btn', formData.city === city.name ? 'city-btn-active' : '']" size="small"
                                @click="selectCity(city.name)">
                                {{ city.name }}
                            </van-button>
                        </div>
                    </div>
                </van-popup>

                <!-- 详细地址 -->
                <van-field v-model="formData.detailAddress" name="detailAddress" label="Detailed Address"
                    placeholder="Enter street address, apartment, etc." :rules="rules.detailAddress" type="textarea"
                    rows="2" autosize class="mb-4" />

                <!-- 默认地址选项 -->
                <van-checkbox :model-value="formData.isDefault === 1"
                    @update:model-value="(val) => formData.isDefault = val ? 1 : 0" shape="square" class="mb-6">
                    Set as default shipping address
                </van-checkbox>

                <!-- 提交按钮 -->
                <div class="mt-6 flex flex-col gap-1">
                    <van-button type="primary" block round native-type="submit" size="normal" :loading="loading">
                        Save Address
                    </van-button>

                    <!-- 取消按钮 -->
                    <van-button block round native-type="button" size="normal" @click="goBack">
                        Cancel
                    </van-button>
                </div>
            </van-form>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { useAddressStore } from '@/store/address.store';
import { useUserStore } from '@/store/user.store';
import type { CreateAddressParams } from '@/types/address.type';

// 城市数据
const cities = [
    { id: 1, provinceId: 1, name: 'Baynzurh' },
    { id: 2, provinceId: 1, name: 'Baganuur' },
    { id: 3, provinceId: 1, name: 'Songinokhairhan' },
    { id: 4, provinceId: 1, name: 'Chingeltei' },
    { id: 5, provinceId: 1, name: 'KhanUul' },
    { id: 6, provinceId: 1, name: 'Sukhbaatar' },
    { id: 7, provinceId: 1, name: 'Bagakhangai' },
    { id: 8, provinceId: 1, name: 'Nalaih' },
    { id: 9, provinceId: 1, name: 'Bayangol' },
];

// 初始化
const router = useRouter();
const route = useRoute();
const addressStore = useAddressStore();
const userStore = useUserStore();

// 状态
const loading = ref(false);
const showPopover = ref(false);
const isEditMode = ref(false); // 添加编辑模式标志
const addressId = ref<number | null>(null); // 添加地址ID

// 检查登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 表单数据
const formData = reactive({
    receiverName: '',
    receiverPhone: '',
    province: 'Ulaanbaatar', // 固定值，显示在表单中但不可编辑
    city: '',
    detailAddress: '',
    isDefault: 0
});

// 选择城市
const selectCity = (cityName: string) => {
    formData.city = cityName;
    showPopover.value = false;
};

// 表单验证规则
const rules = {
    receiverName: [
        { required: true, message: 'Please enter recipient name' },
        { max: 50, message: 'Name cannot exceed 50 characters' }
    ],
    receiverPhone: [
        { required: true, message: 'Please enter phone number' },
        { pattern: /^[0-9+\-\s]{5,20}$/, message: 'Please enter a valid phone number' }
    ],
    province: [
        { required: true, message: 'Please enter province/state' }
    ],
    city: [
        { required: true, message: 'Please select a city' }
    ],
    detailAddress: [
        { required: true, message: 'Please enter detailed address' },
        { max: 200, message: 'Address cannot exceed 200 characters' }
    ]
};

// 提交表单 
const onSubmit = async () => {
    // 检查登录状态
    if (!isLoggedIn.value) {
        showToast('Please sign in first');
        router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
        });
        return;
    }

    try {
        loading.value = true;

        // 准备提交数据
        const submitData: CreateAddressParams = {
            receiverName: formData.receiverName,
            receiverPhone: formData.receiverPhone,
            province: formData.province,
            city: formData.city,
            detailAddress: formData.detailAddress,
            isDefault: formData.isDefault
        };

        let result;

        if (isEditMode.value && addressId.value) {
            // 编辑模式：更新地址
            result = await addressStore.updateAddress(addressId.value, submitData);
            if (result) {
                showSuccessToast('Address updated successfully');
            } else {
                showToast('Failed to update address');
            }
        } else {
            // 新增模式：创建地址
            // 检查地址数量限制
            if (addressStore.addresses.length >= 10) {
                showToast('You can have a maximum of 10 addresses');
                loading.value = false;
                return;
            }

            result = await addressStore.createAddress(submitData);
            if (result) {
                showSuccessToast('Address added successfully');
            } else {
                showToast('Failed to add address');
            }
        }

        if (result) {
            router.back();
        }
    } catch (error) {
        console.error('Add address error:', error);
        showToast('An error occurred while adding the address');
    } finally {
        loading.value = false;
    }
};

// 添加以下函数，用于加载要编辑的地址
const loadAddressForEdit = () => {
    // 获取路由参数中的地址ID
    const id = route.query.id ? Number(route.query.id) : null;

    if (id) {
        isEditMode.value = true;
        addressId.value = id;

        // 从store中查找此地址
        const address = addressStore.addresses.find(addr => addr.id === id);

        if (address) {
            // 填充表单数据
            formData.receiverName = address.receiverName;
            formData.receiverPhone = address.receiverPhone;
            formData.province = address.province;
            formData.city = address.city;
            formData.detailAddress = address.detailAddress;
            formData.isDefault = address.isDefault;
        } else {
            showToast('Address not found');
            router.back();
        }
    }
};

// 添加生命周期钩子，用于加载编辑数据
onMounted(() => {
    loadAddressForEdit();
});

// 返回上一页
const goBack = () => {
    router.back();
};
</script>

<style scoped>
.page-content {
    padding: 16px;
}

:deep(.van-field__label) {
    width: 7em;
    color: #333;
    font-weight: 500;
}

:deep(.van-field__control) {
    color: #333;
}

:deep(.van-checkbox__label) {
    color: #333;
    font-size: 14px;
}

:deep(.van-button--primary) {
    background: #4f46e5;
    border: none;
}

/* 城市选择器样式 */
.city-btn {
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 8px 12px;
    border: none;
    color: #333;
}

.city-btn-active {
    background-color: #4f46e5;
    color: white;
}

/* 表单间距调整 */
:deep(.van-field) {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

:deep(.van-field:last-child) {
    border-bottom: none;
}
</style>