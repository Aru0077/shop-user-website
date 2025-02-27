<!-- src/components/home/SearchBar.vue -->
<template>
      <div class="flex items-center w-full h-[50px] p-0 box-border">
          <!-- 搜索输入框 -->
          <div class="flex-1 relative h-[50px] flex items-center bg-[rgba(243,244,245,1)] rounded-[30px]">
              <Search class="absolute left-2.5 z-1"/>
              <input 
                  type="text" 
                  class="w-full h-full border-none outline-none bg-transparent pl-6 pr-2.5 text-[15px] text-gray-800" 
                  :placeholder="placeholder" 
                  v-model="searchValue"
                  @keyup.enter="handleSearch" 
              />
              <!-- 清除按钮 -->
              <X 
                  v-if="searchValue && showClearButton" 
                  name="clear" 
                  class="absolute right-2.5 text-gray-500 cursor-pointer" 
                  @click="clearSearch" 
              />
          </div>
          
          <!-- 搜索按钮 -->
          <div 
              class="flex items-center justify-center w-[50px] h-[50px] bg-black rounded-full ml-2 cursor-pointer transition-colors duration-300 hover:bg-gray-900 active:bg-gray-900" 
              @click="handleSearch"
          >
              <Search color="#fff" />
          </div>
      </div>
  </template>
  
  <script setup lang="ts">
  import { ref, defineEmits, defineProps, watch } from 'vue';
  import { Search, X } from 'lucide-vue-next'
  import { Icon } from 'vant';
  
  // 定义属性
  const props = defineProps({
      // 占位符文本
      placeholder: {
          type: String,
          default: '搜索商品'
      },
      // 初始搜索值
      initialValue: {
          type: String,
          default: ''
      },
      // 是否显示清除按钮
      showClearButton: {
          type: Boolean,
          default: true
      }
  });
  
  // 定义事件
  const emit = defineEmits(['search', 'clear', 'update:value']);
  
  // 搜索值
  const searchValue = ref(props.initialValue);
  
  // 监听初始值变化
  watch(() => props.initialValue, (newVal) => {
      searchValue.value = newVal;
  });
  
  // 监听搜索值变化
  watch(searchValue, (newVal) => {
      emit('update:value', newVal);
  });
  
  // 处理搜索事件
  const handleSearch = () => {
      if (searchValue.value.trim()) {
          // 触发搜索事件，将搜索值传递给父组件
          emit('search', searchValue.value.trim());
      }
  };
  
  // 清除搜索
  const clearSearch = () => {
      searchValue.value = '';
      emit('clear');
  };
  </script>