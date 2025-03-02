// src/utils/navigation.ts
import { Router } from 'vue-router';

// 统一的导航方法
export const navigateToProductList = (router: Router, params: {
      type: string;
      id?: number | string;
      keyword?: string;
      sort?: string;
}) => {
      router.push({
            path: '/product/list',
            query: {
                  type: params.type,
                  ...(params.id ? { id: params.id.toString() } : {}),
                  ...(params.keyword ? { keyword: params.keyword } : {}),
                  ...(params.sort ? { sort: params.sort } : {})
            }
      });
};

export const navigateToProductDetail = (router: Router, productId: number | string) => {
      router.push(`/product/detail/${productId}`);
};


// router.push({ 
//     path: '/product/list', 
//     query: { type: 'search', keyword: searchValue } 
// });

// // 从分类页跳转
// router.push({ 
//     path: '/product/list', 
//     query: { type: 'category', id: category.id } 
// });

// // 从新品点击更多跳转
// router.push({ path: '/product/list', query: { type: 'latest' } });

// // 从热卖点击更多跳转
// router.push({ path: '/product/list', query: { type: 'topselling' } });

// // 从促销banner跳转
// router.push({ path: '/product/list', query: { type: 'promotion' } });