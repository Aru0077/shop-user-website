// src/store/product.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      getCategoryTree,
      getHomeData as getHomeDataApi,
      getLatestProducts,
      getTopSellingProducts,
      getPromotionProducts,
      getCategoryProducts,
      getProductDetail
} from '@/api/product.api';
import {
      Category,
      HomeData,
      Product,
      ProductDetail,
      ProductListResponse,
      ProductSortType
} from '@/types/product.type';
import storage from '@/utils/storage';

// 商品Store - 使用组合式API写法
export const useProductStore = defineStore('product', () => {
      // 状态
      const categories = ref<Category[]>([]);
      const homeData = ref<HomeData | null>(null);
      const latestProducts = ref<Product[]>([]);
      const topSellingProducts = ref<Product[]>([]);
      const promotionProducts = ref<Product[]>([]);
      const currentCategory = ref<Category | null>(null);
      const categoryProducts = ref<Product[]>([]);
      const currentProduct = ref<ProductDetail | null>(null);

      // 加载状态
      const loading = ref<boolean>(false);

      // 分页信息
      const paginationInfo = ref({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
      });

      // 计算属性
      const getCategories = computed(() => categories.value);
      const getHomeDataValue = computed(() => homeData.value);
      const getCategoryById = computed(() => (id: number) => {
            const findCategory = (cats: Category[], targetId: number): Category | undefined => {
                  for (const cat of cats) {
                        if (cat.id === targetId) return cat;
                        if (cat.children && cat.children.length > 0) {
                              const found = findCategory(cat.children, targetId);
                              if (found) return found;
                        }
                  }
                  return undefined;
            };

            return findCategory(categories.value, id);
      });

      // 方法: 加载分类树
      async function loadCategoryTree() {
            if (categories.value.length > 0) return categories.value;

            try {
                  loading.value = true;
                  const res = await getCategoryTree();
                  categories.value = res.data;
                  return categories.value;
            } catch (error) {
                  console.error('Failed to load category tree:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载首页数据
      async function loadHomeData() {
            try {
                  loading.value = true;
                  const res = await getHomeDataApi();
                  homeData.value = res.data;
                  return homeData.value;
            } catch (error) {
                  console.error('Failed to load home data:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载最新商品
      async function loadLatestProducts(page = 1, limit = 10) {
            try {
                  loading.value = true;
                  const res = await getLatestProducts(page, limit);
                  const data = res.data;

                  latestProducts.value = data.data;
                  updatePaginationInfo(data);

                  return latestProducts.value;
            } catch (error) {
                  console.error('Failed to load latest products:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载销量最高商品
      async function loadTopSellingProducts(page = 1, limit = 10) {
            try {
                  loading.value = true;
                  const res = await getTopSellingProducts(page, limit);
                  const data = res.data;

                  topSellingProducts.value = data.data;
                  updatePaginationInfo(data);

                  return topSellingProducts.value;
            } catch (error) {
                  console.error('Failed to load top selling products:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载促销商品
      async function loadPromotionProducts(page = 1, limit = 10) {
            try {
                  loading.value = true;
                  const res = await getPromotionProducts(page, limit);
                  const data = res.data;

                  promotionProducts.value = data.data;
                  updatePaginationInfo(data);

                  return promotionProducts.value;
            } catch (error) {
                  console.error('Failed to load promotion products:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载分类商品
      async function loadCategoryProducts(
            categoryId: number,
            page = 1,
            limit = 10,
            sort: ProductSortType = ProductSortType.NEWEST
      ) {
            try {
                  loading.value = true;

                  // 设置当前分类
                  const category = getCategoryById.value(categoryId);
                  if (category) {
                        currentCategory.value = category;
                  }

                  const res = await getCategoryProducts(categoryId, page, limit, sort);
                  const data = res.data;

                  categoryProducts.value = data.data;
                  updatePaginationInfo(data);

                  return categoryProducts.value;
            } catch (error) {
                  console.error('Failed to load category products:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载商品详情
      async function loadProductDetail(id: number) {
            try {
                  loading.value = true;
                  const res = await getProductDetail(id);
                  currentProduct.value = res.data;
                  return currentProduct.value;
            } catch (error) {
                  console.error('Failed to load product detail:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      }

      // 辅助方法: 更新分页信息
      function updatePaginationInfo(data: ProductListResponse) {
            paginationInfo.value = {
                  total: data.total,
                  page: data.page,
                  limit: data.limit,
                  totalPages: Math.ceil(data.total / data.limit)
            };
      }

      // 方法: 清除当前商品信息
      function clearCurrentProduct() {
            currentProduct.value = null;
      }

      return {
            // 状态
            categories,
            homeData,
            latestProducts,
            topSellingProducts,
            promotionProducts,
            currentCategory,
            categoryProducts,
            currentProduct,
            loading,
            paginationInfo,

            // 计算属性
            getCategories,
            getHomeDataValue,
            getCategoryById,

            // 方法
            loadCategoryTree,
            loadHomeData,
            loadLatestProducts,
            loadTopSellingProducts,
            loadPromotionProducts,
            loadCategoryProducts,
            loadProductDetail,
            clearCurrentProduct
      };
}, {
      persist: true  // 添加持久化配置
});