import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由元数据类型定义
declare module 'vue-router' {
      interface RouteMeta {
            title?: string
            auth?: boolean
            keepAlive?: boolean,
            navBar?: {
                  show?: boolean
                  title?: string
                  leftBtn?: string
                  rightBtn?: string
                  showBackground?: boolean
            }
      }
}

// 路由配置
const routes: Array<RouteRecordRaw> = [
      {
            path: '/',
            component: () => import('@/views/layout/MainLayout.vue'),
            redirect: '/home',
            children: [
                  {
                        path: '/home',
                        name: 'Home',
                        component: () => import('@/views/home/Home.vue'),
                        meta: {
                              title: 'Home',
                              keepAlive: true,
                              navBar: {
                                    show: true,
                                    title: '首页',
                                    leftBtn: 'none',
                                    rightBtn: 'none'
                              }
                        },
                  },
                  {
                        path: '/category',
                        name: 'Category',
                        component: () => import('@/views/category/Category.vue'),
                        meta: {
                              title: 'Category',
                              keepAlive: true,
                              navBar: {
                                    show: true,
                                    title: 'Category',
                                    leftBtn: 'none',
                                    rightBtn: 'none'
                              }
                        },
                  },
                  {
                        path: '/cart',
                        name: 'Cart',
                        component: () => import('@/views/cart/Cart.vue'),
                        meta: {
                              title: 'Cart',
                              keepAlive: true,
                              navBar: {
                                    show: true,
                                    title: '首页',
                                    leftBtn: 'none',
                                    rightBtn: 'none'
                              }
                        },
                  },
                  {
                        path: '/user',
                        name: 'User',
                        component: () => import('@/views/user/User.vue'),
                        meta: {
                              title: 'User',
                              keepAlive: true,
                              navBar: {
                                    show: true,
                                    title: '首页',
                                    leftBtn: 'none',
                                    rightBtn: 'none'
                              }
                        },
                  },
            ],
      },
      // address
      {
            path: '/address/list',
            name: 'AddressList',
            component: () => import('@/views/address/AddressList.vue'),
            meta: {
                  title: 'AddressList',
                  keepAlive: true,
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      {
            path: '/address/add',
            name: 'AddressAdd',
            component: () => import('@/views/address/AddressAdd.vue'),
            meta: {
                  title: 'AddressAdd',
                  keepAlive: true,
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      // auth
      {
            path: '/delete-account',
            name: 'DeleteAccount',
            component: () => import('@/views/auth/DeleteAccount.vue'),
            meta: {
                  title: 'DeleteAccount',
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/auth/Login.vue'),
            meta: {
                  title: 'Login',
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      // favorite
      {
            path: '/favorite',
            name: 'Favorite',
            component: () => import('@/views/favorite/Favorite.vue'),
            meta: {
                  title: 'Favorite',
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      // legal
      {
            path: '/privacy',
            name: 'privacy',
            component: () => import('@/views/legal/Privacy.vue'),
            meta: {
                  title: 'privacy',
                  navBar: {
                        show: true,
                        title: '首页',
                        leftBtn: 'none',
                        rightBtn: 'none'
                  }
            },
      },
      {
            path: '/terms',
            name: 'Terms',
            component: () => import('@/views/legal/Terms.vue'),
            meta: {
                  title: '服务条款',
                  navBar: {
                        show: true,
                        title: '服务条款',
                        leftBtn: 'back',
                        rightBtn: 'none'
                  }
            },
      },
      // order
      {
            path: '/order/list',
            name: 'OrderList',
            component: () => import('@/views/order/OrderList.vue'),
            meta: {
                  title: '我的订单',
                  auth: true,
                  navBar: {
                        show: true,
                        title: '我的订单',
                        leftBtn: 'back',
                        rightBtn: 'none'
                  }
            },
      },
      {
            path: '/order/detail/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/OrderDetail.vue'),
            meta: {
                  title: '订单详情',
                  auth: true,
                  navBar: {
                        show: true,
                        title: '订单详情',
                        leftBtn: 'back',
                        rightBtn: 'none'
                  }
            },
      },
      // payment
      {
            path: '/payment',
            name: 'Payment',
            component: () => import('@/views/payment/Payment.vue'),
            meta: {
                  title: '支付',
                  auth: true,
                  navBar: {
                        show: true,
                        title: '支付',
                        leftBtn: 'back',
                        rightBtn: 'none'
                  }
            },
      },
      // product
      {
            path: '/product/list',
            name: 'ProductList',
            component: () => import('@/views/product/ProductList.vue'),
            meta: {
                  title: '商品列表',
                  keepAlive: true,
                  navBar: {
                        show: true,
                        title: '商品列表',
                        leftBtn: 'back',
                        rightBtn: 'search'
                  }
            },
      },
      {
            path: '/product/detail/:id',
            name: 'ProductDetail',
            component: () => import('@/views/product/ProductDetail.vue'),
            meta: {
                  title: '商品详情',
                  navBar: {
                        show: true,
                        title: '商品详情',
                        leftBtn: 'back',
                        rightBtn: 'share'
                  }
            },
      },




      {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/404.vue'),
            meta: {
                  title: '页面未找到',
            },
      },
]

const router = createRouter({
      history: createWebHistory(),
      routes,
      // 滚动行为
      scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                  return savedPosition
            } else {
                  return { top: 0 }
            }
      },
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
      // 设置页面标题
      document.title = `${to.meta.title || '购物商城'}`

      // 判断是否需要登录权限
      if (to.meta.auth) {
            // 这里编写登录验证逻辑
            const isLoggedIn = localStorage.getItem('token')
            if (!isLoggedIn) {
                  next({
                        path: '/login',
                        query: { redirect: to.fullPath },
                  })
                  return
            }
      }
      next()
})

// 路由后置守卫
router.afterEach(() => {
      // 路由加载完成后的处理
      window.scrollTo(0, 0)
})

export default router