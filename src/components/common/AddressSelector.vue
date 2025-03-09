<!-- src/components/AddressSelector.vue -->
<template>
      <div>
            <!-- 地址选择器 - 显示当前选择的地址 -->
            <div class="flex gap-1 items-center h-[70px] px-1 box-border bg-blue-50" @click="showAddressPopup">
                  <!-- 有地址时显示地址信息 -->
                  <template v-if="selectedAddress">
                        <MapPin />
                        <div class="flex flex-col justify-start">
                              <div class="text-[15px]">{{ selectedAddress.receiverName }}, {{
                                    selectedAddress.receiverPhone }}</div>
                              <div class="text-[12px]">{{ selectedAddress.province }}, {{ selectedAddress.city }}, {{
                                    selectedAddress.detailAddress }}</div>
                        </div>
                  </template>

                  <!-- 无地址时显示添加地址按钮 -->
                  <template v-else>
                        <MapPin />
                        <div class="text-[15px]">Add New Address</div>
                  </template>
            </div>

            <!-- 地址选择弹出层 -->
            <van-popup v-model:show="showPopup" position="bottom" :style="{ height: '60%' }" round closeable>

                  <div class="p-2 overflow-hidden flex flex-col h-full box-border">
                        <div class="flex-1">
                              <div class="text-[18px] font-bold mb-2">Select Address</div>

                              <!-- 地址列表 -->
                              <div class="overflow-y-auto h-full">
                                    <template v-if="addresses.length > 0">
                                          <!-- 地址项 -->
                                          <div v-for="address in addresses" :key="address.id"
                                                class="address-item mb-2 p-2 border rounded-lg"
                                                :class="{ 'border-blue-500 bg-blue-50': isAddressSelected(address) }"
                                                @click="selectAddress(address)">
                                                <div class="flex justify-between items-start">
                                                      <div class="flex-1">
                                                            <div class="flex items-center">
                                                                  <span class="text-[16px] font-medium">{{
                                                                        address.receiverName }}</span>
                                                                  <span class="text-[14px] ml-2">{{
                                                                        address.receiverPhone
                                                                  }}</span>
                                                                  <span v-if="address.isDefault === 1"
                                                                        class="ml-2 px-1 text-[12px] bg-black text-white rounded">Default</span>
                                                            </div>
                                                            <div class="text-[14px] mt-1 text-gray-600">
                                                                  {{ address.province }}, {{ address.city }}, {{
                                                                        address.detailAddress }}
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </template>

                                    <!-- 无地址提示 -->
                                    <div v-else class="text-center py-8 text-gray-500">
                                          暂无收货地址
                                    </div>
                              </div>
                        </div>


                        <!-- 底部按钮 -->
                        <div class="mt-4 sticky bottom-0 bg-white pt-2 h-[40px]">
                              <div class="bg-black text-white flex justify-center items-center text-[20px] h-[40px] rounded "
                                    @click="goToAddAddress">
                                    Add New Address 
                              </div>
                        </div>
                  </div>

            </van-popup>
      </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { MapPin } from 'lucide-vue-next';
import { useAddressStore } from '@/store/address.store';
import { Address } from '@/types/address.type';
import { useRouter } from 'vue-router';

// 定义props和emits
const props = defineProps({
      modelValue: {
            type: Object as () => Address | null,
            default: null
      }
});

const emit = defineEmits(['update:modelValue']);

// 引入地址store
const addressStore = useAddressStore();
const router = useRouter();

// 控制弹出层
const showPopup = ref(false);

// 计算属性：获取地址列表
const addresses = computed(() => addressStore.getAddresses);

// 选中的地址
const selectedAddress = computed({
      get: () => props.modelValue || addressStore.getDefaultAddress || null,
      set: (value) => {
            emit('update:modelValue', value);
      }
});

// 初始化：加载地址列表
onMounted(async () => {
      await addressStore.loadAddresses();
});

// 方法：显示地址选择弹窗
const showAddressPopup = () => {
      if (addresses.value.length === 0) {
            // 如果没有地址，直接跳转到添加地址页面
            goToAddAddress();
      } else {
            showPopup.value = true;
      }
};

// 方法：选择地址
const selectAddress = (address: Address) => {
      selectedAddress.value = address;
      showPopup.value = false;
};

// 方法：判断地址是否被选中
const isAddressSelected = (address: Address): boolean => {
      return selectedAddress.value?.id === address.id;
};

// 方法：设置为默认地址
const setAsDefault = async (address: Address) => {
      if (address.isDefault !== 1) {
            await addressStore.setDefaultAddress(address.id);
      }
};

// 方法：跳转到添加地址页面
const goToAddAddress = () => {
      showPopup.value = false;
      // 假设有一个地址管理页面
      router.push('/address/add');
};

// 监听地址变化
watch(() => addressStore.getDefaultAddress, (newVal) => {
      if (!props.modelValue && newVal) {
            selectedAddress.value = newVal;
      }
}, { immediate: true });
</script>

<style scoped>
.address-item {
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
}

.address-item:hover {
      border-color: #dbeafe;
      background-color: #f8fafc;
}
</style>