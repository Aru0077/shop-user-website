// src/store/product.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      getCategoryTreeApi,
      getHomePageDataApi,
      getLatestProductsApi,
      getTopSellingProductsApi,
      getPromotionProductsApi,
      getCategoryProductsApi,
      getProductDetailApi,
      searchProductsApi
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

      // 缓存键
      const CACHE_KEYS = {
            HOME_DATA: 'product_home_data',
            CATEGORY_TREE: 'product_category_tree',
            PRODUCT_LIST: 'product_list_',
            PRODUCT_DETAIL: 'product_detail_'
      };

      // 缓存时间（秒）
      const CACHE_EXPIRY = {
            HOME_DATA: 60 * 30,        // 30分钟
            CATEGORY_TREE: 60 * 60 * 24, // 24小时
            PRODUCT_LIST: 60 * 15,      // 15分钟
            PRODUCT_DETAIL: 60 * 60     // 1小时
      };

      // 状态
      const categories = ref<Category[]>([]);
      const homeData = ref<HomeData | null>(null);
      const latestProducts = ref<Product[]>([]);
      const topSellingProducts = ref<Product[]>([]);
      const promotionProducts = ref<Product[]>([]);
      const currentCategory = ref<Category | null>(null);
      const categoryProducts = ref<Product[]>([]);
      const currentProduct = ref<ProductDetail | null>(null);

      // 添加预加载方法
      async function preloadCoreData() {
            console.log('预加载商品核心数据...');
            try {
                  // 并行加载首页数据和分类树
                  await Promise.all([
                        loadHomeData(false),
                        loadCategoryTree(false)
                  ]);
                  return true;
            } catch (error) {
                  console.error('预加载商品数据失败:', error);
                  return false;
            }
      }



      // 添加请求防抖控制
      let homeDataTimer: NodeJS.Timeout | null = null;

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
      async function loadCategoryTree(force = false) {
            // 已有数据且非强制刷新，直接返回
            if (categories.value.length > 0 && !force) {
                  return categories.value;
            }

            // 尝试从缓存获取
            if (!force) {
                  const cachedData = storage.get(CACHE_KEYS.CATEGORY_TREE);
                  if (cachedData && cachedData.length > 0) {
                        categories.value = cachedData;
                        return cachedData;
                  }
            }

            try {
                  loading.value = true;
                  const res = await getCategoryTreeApi();
                  categories.value = res.data;

                  // 存入缓存
                  storage.set(CACHE_KEYS.CATEGORY_TREE, res.data, CACHE_EXPIRY.CATEGORY_TREE);

                  return categories.value;

            } catch (error) {
                  console.error('Failed to load category tree:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 加载首页数据
      async function loadHomeData(force = false) {
            // 已有数据且非强制刷新，直接返回
            if (homeData.value && !force) {
                  return homeData.value;
            }

            // 尝试从缓存获取
            if (!force) {
                  const cachedData = storage.get(CACHE_KEYS.HOME_DATA);
                  if (cachedData) {
                        homeData.value = cachedData;
                        return cachedData;
                  }
            }

            try {
                  loading.value = true;
                  const res = await getHomePageDataApi();
                  homeData.value = res.data;

                  // 存入缓存
                  storage.set(CACHE_KEYS.HOME_DATA, res.data, CACHE_EXPIRY.HOME_DATA);

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
                  const res = await getLatestProductsApi(page, limit);
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
                  const res = await getTopSellingProductsApi(page, limit);
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
                  const res = await getPromotionProductsApi(page, limit);
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

                  const res = await getCategoryProductsApi(categoryId, page, limit, sort);
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
            const cacheKey = `${CACHE_KEYS.PRODUCT_DETAIL}${id}`;

            // 尝试从缓存获取
            const cachedData = storage.get(cacheKey);
            if (cachedData) {
                  currentProduct.value = cachedData;
                  return cachedData;
            }

            try {
                  loading.value = true;
                  const res = await getProductDetailApi(id);
                  currentProduct.value = res.data;
                  // 存入缓存
                  storage.set(cacheKey, res.data, CACHE_EXPIRY.PRODUCT_DETAIL);
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

      // 方法: 根据类型加载商品
      async function loadProductsByType(
            type: string,
            params: {
                  id?: string | number;
                  keyword?: string;
                  page?: number;
                  limit?: number;
                  sort?: ProductSortType;
            } = {}
      ) {
            // 设置默认分页参数
            const { page = 1, limit = 10 } = params;

            // 仅对第一页尝试使用缓存
            const useCache = page === 1;

            // 构建缓存键
            const cacheKey = `${CACHE_KEYS.PRODUCT_LIST}${type}_${params.id || ''}_${params.keyword || ''}_${params.sort || ''}`;

            // 尝试从缓存获取
            if (useCache) {
                  const cachedData = storage.get(cacheKey);
                  if (cachedData) {
                        return cachedData;
                  }
            }

            try {
                  loading.value = true;
                  let result: Product[] = [];

                  switch (type) {
                        case 'category':
                              if (params.id) {
                                    result = await loadCategoryProducts(
                                          Number(params.id),
                                          page,
                                          limit,
                                    );
                              }
                              break;
                        case 'latest':
                              result = await loadLatestProducts(page, limit);
                              break;
                        case 'topselling':
                              result = await loadTopSellingProducts(page, limit);
                              break;
                        case 'promotion':
                              result = await loadPromotionProducts(page, limit);
                              break;
                        case 'search':
                              if (params.keyword) {
                                    // 使用搜索API（需要提前导入）
                                    const res = await searchProductsApi(params.keyword, page, limit);
                                    const data = res.data;
                                    result = data.data;
                                    updatePaginationInfo(data);
                              }
                              break;
                        default:
                              result = await loadLatestProducts(page, limit);
                              break;
                  }

                  // 仅缓存第一页数据
                  if (useCache && result.length > 0) {
                        storage.set(cacheKey, result, CACHE_EXPIRY.PRODUCT_LIST);
                  }

                  return result;
            } catch (error) {
                  console.error(`Failed to load ${type} products:`, error);
                  return [] as Product[];
            } finally {
                  loading.value = false;
            }
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
            clearCurrentProduct,
            loadProductsByType,
            preloadCoreData
      };
}, {
      persist: true  // 添加持久化配置
});