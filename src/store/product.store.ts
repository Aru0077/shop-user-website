// src/store/product.store.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
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
import storage, { STORAGE_KEYS, DEFAULT_EXPIRY } from '@/utils/storage';
import networkService from '@/utils/networkService';
import { showNotify } from 'vant';

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
    const loading = ref<boolean>(false);
    const lastSyncTime = ref<number>(0);
    const offlineMode = ref<boolean>(false);

    // 分页信息
    const paginationInfo = ref({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    // 初始化时从本地存储加载数据
    const initFromStorage = () => {
        // 加载分类数据
        const storedCategories = storage.get<Category[]>(
            STORAGE_KEYS.CATEGORIES,
            []
        );
        if (storedCategories && storedCategories.length > 0) {
            categories.value = storedCategories;
        }

        // 加载首页数据
        const storedHomeData = storage.get<HomeData>(
            STORAGE_KEYS.HOME_DATA,
            null
        );
        if (storedHomeData) {
            homeData.value = storedHomeData;
        }

        // 检查最后同步时间
        const storedSyncTime = storage.get<number>(
            STORAGE_KEYS.PRODUCTS + '_last_sync',
            0
        );
        if (storedSyncTime) {
            lastSyncTime.value = storedSyncTime;
        }
    };

    // 初始化
    initFromStorage();

    // 监听网络状态变化
    const setupNetworkListeners = () => {
        networkService.addListener((online) => {
            if (online && offlineMode.value) {
                // 网络恢复，尝试刷新数据
                offlineMode.value = false;
                
                // 根据当前页面决定刷新哪些数据
                // 这里简化处理，实际应用中应根据用户当前页面判断
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;
                
                // 如果距离上次同步超过1小时，重新加载核心数据
                if (now - lastSyncTime.value > oneHour) {
                    preloadCoreData(true);
                }
            }
        });
    };

    // 设置网络监听
    setupNetworkListeners();

    // 检测网络状态
    const checkNetworkStatus = () => {
        return networkService.isOnline.value;
    };

    // 保存最后同步时间
    const saveLastSyncTime = () => {
        lastSyncTime.value = Date.now();
        storage.set(
            STORAGE_KEYS.PRODUCTS + '_last_sync',
            lastSyncTime.value
        );
    };

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

    // 同步状态计算属性
    const syncStatus = computed(() => {
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

    // 方法: 加载分类树
    async function loadCategoryTree(force = false) {
        // 已有数据且非强制刷新，直接返回
        if (categories.value.length > 0 && !force) {
            return categories.value;
        }

        // 尝试从缓存获取
        if (!force) {
            const cachedData = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
            if (cachedData && cachedData.length > 0) {
                categories.value = cachedData;
                return cachedData;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地分类数据' 
            });
            return categories.value;
        }

        try {
            loading.value = true;
            const res = await getCategoryTreeApi();
            categories.value = res.data;

            // 存入缓存
            storage.set(STORAGE_KEYS.CATEGORIES, res.data, DEFAULT_EXPIRY.CATEGORIES);
            saveLastSyncTime();

            return categories.value;
        } catch (error) {
            console.error('加载分类树失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地分类数据' 
                });
            }
            
            return categories.value;
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
            const cachedData = storage.get<HomeData>(STORAGE_KEYS.HOME_DATA, null);
            if (cachedData) {
                homeData.value = cachedData;
                return cachedData;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地首页数据' 
            });
            return homeData.value;
        }

        try {
            loading.value = true;
            const res = await getHomePageDataApi();
            homeData.value = res.data;

            // 存入缓存
            storage.set(STORAGE_KEYS.HOME_DATA, res.data, DEFAULT_EXPIRY.HOME_DATA);
            saveLastSyncTime();

            return homeData.value;
        } catch (error) {
            console.error('加载首页数据失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地首页数据' 
                });
            }
            
            return homeData.value;
        } finally {
            loading.value = false;
        }
    }

    // 方法: 加载最新商品
    async function loadLatestProducts(page = 1, limit = 10) {
        // 尝试从缓存获取（仅第一页）
        if (page === 1) {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_latest_${limit}`;
            const cachedData = storage.get<{
                data: Product[];
                pagination: typeof paginationInfo.value;
                timestamp: number;
            }>(cacheKey, null);
            
            if (cachedData && Date.now() - cachedData.timestamp < 30 * 60 * 1000) { // 30分钟有效期
                latestProducts.value = cachedData.data;
                paginationInfo.value = cachedData.pagination;
                return latestProducts.value;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地商品数据' 
            });
            return latestProducts.value;
        }

        try {
            loading.value = true;
            const res = await getLatestProductsApi(page, limit);
            const data = res.data;

            latestProducts.value = data.data;
            updatePaginationInfo(data);
            
            // 存入缓存（仅第一页）
            if (page === 1) {
                const cacheKey = `${STORAGE_KEYS.PRODUCTS}_latest_${limit}`;
                storage.set(cacheKey, {
                    data: latestProducts.value,
                    pagination: paginationInfo.value,
                    timestamp: Date.now()
                }, DEFAULT_EXPIRY.PRODUCTS);
            }

            return latestProducts.value;
        } catch (error) {
            console.error('加载最新商品失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地商品数据' 
                });
            }
            
            return latestProducts.value;
        } finally {
            loading.value = false;
        }
    }

    // 方法: 加载销量最高商品
    async function loadTopSellingProducts(page = 1, limit = 10) {
        // 尝试从缓存获取（仅第一页）
        if (page === 1) {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_topselling_${limit}`;
            const cachedData = storage.get<{
                data: Product[];
                pagination: typeof paginationInfo.value;
                timestamp: number;
            }>(cacheKey, null);
            
            if (cachedData && Date.now() - cachedData.timestamp < 30 * 60 * 1000) { // 30分钟有效期
                topSellingProducts.value = cachedData.data;
                paginationInfo.value = cachedData.pagination;
                return topSellingProducts.value;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地商品数据' 
            });
            return topSellingProducts.value;
        }

        try {
            loading.value = true;
            const res = await getTopSellingProductsApi(page, limit);
            const data = res.data;

            topSellingProducts.value = data.data;
            updatePaginationInfo(data);
            
            // 存入缓存（仅第一页）
            if (page === 1) {
                const cacheKey = `${STORAGE_KEYS.PRODUCTS}_topselling_${limit}`;
                storage.set(cacheKey, {
                    data: topSellingProducts.value,
                    pagination: paginationInfo.value,
                    timestamp: Date.now()
                }, DEFAULT_EXPIRY.PRODUCTS);
            }

            return topSellingProducts.value;
        } catch (error) {
            console.error('加载销量最高商品失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地商品数据' 
                });
            }
            
            return topSellingProducts.value;
        } finally {
            loading.value = false;
        }
    }

    // 方法: 加载促销商品
    async function loadPromotionProducts(page = 1, limit = 10) {
        // 尝试从缓存获取（仅第一页）
        if (page === 1) {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_promotion_${limit}`;
            const cachedData = storage.get<{
                data: Product[];
                pagination: typeof paginationInfo.value;
                timestamp: number;
            }>(cacheKey, null);
            
            if (cachedData && Date.now() - cachedData.timestamp < 30 * 60 * 1000) { // 30分钟有效期
                promotionProducts.value = cachedData.data;
                paginationInfo.value = cachedData.pagination;
                return promotionProducts.value;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地商品数据' 
            });
            return promotionProducts.value;
        }

        try {
            loading.value = true;
            const res = await getPromotionProductsApi(page, limit);
            const data = res.data;

            promotionProducts.value = data.data;
            updatePaginationInfo(data);
            
            // 存入缓存（仅第一页）
            if (page === 1) {
                const cacheKey = `${STORAGE_KEYS.PRODUCTS}_promotion_${limit}`;
                storage.set(cacheKey, {
                    data: promotionProducts.value,
                    pagination: paginationInfo.value,
                    timestamp: Date.now()
                }, DEFAULT_EXPIRY.PRODUCTS);
            }

            return promotionProducts.value;
        } catch (error) {
            console.error('加载促销商品失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地商品数据' 
                });
            }
            
            return promotionProducts.value;
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
        // 尝试从缓存获取（仅第一页）
        if (page === 1) {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_category_${categoryId}_${sort}_${limit}`;
            const cachedData = storage.get<{
                data: Product[];
                pagination: typeof paginationInfo.value;
                timestamp: number;
            }>(cacheKey, null);
            
            if (cachedData && Date.now() - cachedData.timestamp < 15 * 60 * 1000) { // 15分钟有效期
                categoryProducts.value = cachedData.data;
                paginationInfo.value = cachedData.pagination;
                
                // 设置当前分类
                const category = getCategoryById.value(categoryId);
                if (category) {
                    currentCategory.value = category;
                }
                
                return categoryProducts.value;
            }
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，使用本地商品数据' 
            });
            
            // 如果有分类数据，即使离线也更新当前分类
            const category = getCategoryById.value(categoryId);
            if (category) {
                currentCategory.value = category;
            }
            
            return categoryProducts.value;
        }

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
            
            // 存入缓存（仅第一页）
            if (page === 1) {
                const cacheKey = `${STORAGE_KEYS.PRODUCTS}_category_${categoryId}_${sort}_${limit}`;
                storage.set(cacheKey, {
                    data: categoryProducts.value,
                    pagination: paginationInfo.value,
                    timestamp: Date.now()
                }, DEFAULT_EXPIRY.PRODUCTS);
            }

            return categoryProducts.value;
        } catch (error) {
            console.error('加载分类商品失败:', error);
            
            // 如果是离线错误，使用本地数据
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，使用本地商品数据' 
                });
            }
            
            return categoryProducts.value;
        } finally {
            loading.value = false;
        }
    }

    // 方法: 加载商品详情 
    async function loadProductDetail(id: number) {
        const cacheKey = `${STORAGE_KEYS.PRODUCTS}_detail_${id}`;

        // 尝试从缓存获取
        const cachedData = storage.get<{
            data: ProductDetail;
            timestamp: number;
        }>(cacheKey, null);
        
        if (cachedData && Date.now() - cachedData.timestamp < 60 * 60 * 1000) { // 1小时有效期
            currentProduct.value = cachedData.data;
            return cachedData.data;
        }

        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            
            // 如果缓存数据存在但已过期，仍然使用它
            if (cachedData) {
                currentProduct.value = cachedData.data;
                showNotify({ 
                    type: 'warning', 
                    message: '当前处于离线模式，显示缓存商品数据' 
                });
                return cachedData.data;
            }
            
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，无法加载商品详情' 
            });
            return null;
        }

        try {
            loading.value = true;
            const res = await getProductDetailApi(id);

            // 处理后端返回的数据，确保结构匹配
            const productDetail = res.data;

            // 后端返回的商品详情包括商品基本信息、SKU列表、规格矩阵和有效规格组合映射
            currentProduct.value = {
                ...productDetail,
                // 确保规格矩阵正确处理
                specs: productDetail.specs || [],
                // 确保SKU列表正确处理
                skus: productDetail.skus || [],
                // 确保有效规格组合映射正确处理
                validSpecCombinations: productDetail.validSpecCombinations || {}
            };

            // 存入缓存
            storage.set(cacheKey, {
                data: currentProduct.value,
                timestamp: Date.now()
            }, DEFAULT_EXPIRY.PRODUCTS);

            return currentProduct.value;
        } catch (error) {
            console.error('加载商品详情失败:', error);
            
            // 如果是离线错误且缓存存在，使用缓存数据
            if ((error as any).offline && cachedData) {
                currentProduct.value = cachedData.data;
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，显示缓存商品数据' 
                });
                return cachedData.data;
            }
            
            return null;
        } finally {
            loading.value = false;
        }
    }

    // 方法: 搜索商品
    async function searchProducts(keyword: string, page = 1, limit = 10) {
        // 检查网络状态
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ 
                type: 'warning', 
                message: '当前处于离线模式，无法搜索商品' 
            });
            return [];
        }

        try {
            loading.value = true;
            const res = await searchProductsApi(keyword, page, limit);
            const data = res.data;
            
            updatePaginationInfo(data);
            return data.data;
        } catch (error) {
            console.error('搜索商品失败:', error);
            
            // 如果是离线错误，显示提示
            if ((error as any).offline) {
                offlineMode.value = true;
                showNotify({ 
                    type: 'warning', 
                    message: '网络连接失败，无法搜索商品' 
                });
            }
            
            return [];
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

        // 根据类型调用相应的加载方法
        switch (type) {
            case 'category':
                if (params.id) {
                    return loadCategoryProducts(
                        Number(params.id),
                        page,
                        limit,
                        params.sort || ProductSortType.NEWEST
                    );
                }
                break;
                
            case 'latest':
                return loadLatestProducts(page, limit);
                
            case 'topselling':
                return loadTopSellingProducts(page, limit);
                
            case 'promotion':
                return loadPromotionProducts(page, limit);
                
            case 'search':
                if (params.keyword) {
                    return searchProducts(params.keyword, page, limit);
                }
                break;
                
            default:
                return loadLatestProducts(page, limit);
        }
        
        return [];
    }

    // 方法: 清除当前商品信息
    function clearCurrentProduct() {
        currentProduct.value = null;
    }

    // 方法: 预加载核心数据
    async function preloadCoreData(force = false) {
        console.log('预加载商品核心数据...');
        
        try {
            // 并行加载首页数据和分类树
            await Promise.all([
                loadHomeData(force),
                loadCategoryTree(force)
            ]);
            
            saveLastSyncTime();
            return true;
        } catch (error) {
            console.error('预加载商品数据失败:', error);
            return false;
        }
    }

    // 方法: 清除缓存
    function clearCache() {
        // 清除所有商品相关缓存
        storage.remove(STORAGE_KEYS.CATEGORIES);
        storage.remove(STORAGE_KEYS.HOME_DATA);
        storage.remove(STORAGE_KEYS.PRODUCTS + '_last_sync');
        
        // 清除所有以PRODUCTS为前缀的缓存
        const allKeys = storage.getAllKeys();
        allKeys.forEach(key => {
            if (key.startsWith(STORAGE_KEYS.PRODUCTS)) {
                storage.remove(key);
            }
        });
        
        // 重置状态
        lastSyncTime.value = 0;
        offlineMode.value = false;
        
        console.log('已清除所有商品缓存');
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
        lastSyncTime,
        offlineMode,

        // 计算属性
        getCategories,
        getHomeDataValue,
        getCategoryById,
        syncStatus,

        // 方法
        loadCategoryTree,
        loadHomeData,
        loadLatestProducts,
        loadTopSellingProducts,
        loadPromotionProducts,
        loadCategoryProducts,
        loadProductDetail,
        searchProducts,
        clearCurrentProduct,
        loadProductsByType,
        preloadCoreData,
        clearCache,
        checkNetworkStatus
    };
});