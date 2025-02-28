import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由元数据类型定义
declare module 'vue-router' {
      interface RouteMeta {
            title?: string
            auth?: boolean
            keepAlive?: boolean,
            navBar?: {
                  show?: boolean
                  leftBtn?: string
                  rightBtn?: string
                  showBackground?: boolean
            },
            tabBar?: {
                  show?: boolean
            }
      }
}

// 路由配置
const routes: Array<RouteRecordRaw> = [
      // 主页路由
      {
            path: '/home',
            name: 'Home',
            component: () => import('@/views/home/Home.vue'),
            meta: {
                  title: 'UniMall - Home',
                  keepAlive: true,
                  navBar: {
                        show: true,
                        leftBtn:'home',
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      {
            path: '/category',
            name: 'Category',
            component: () => import('@/views/category/Category.vue'),
            meta: {
                  title: 'UniMall - Category',
                  keepAlive: true,
                  navBar: {
                        show: false,
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      {
            path: '/cart',
            name: 'Cart',
            component: () => import('@/views/cart/Cart.vue'),
            meta: {
                  title: 'UniMall - Cart',
                  keepAlive: true,
                  navBar: {
                        show: false,
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      {
            path: '/user',
            name: 'User',
            component: () => import('@/views/user/User.vue'),
            meta: {
                  title: 'UniMall - User',
                  keepAlive: true,
                  navBar: {
                        show: false,
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      // 添加根路径重定向
      {
            path: '/',
            redirect: '/home'
      },
      // address
      {
            path: '/address/list',
            name: 'AddressList',
            component: () => import('@/views/address/AddressList.vue'),
            meta: {
                  title: 'UniMall - AddressList',
                  keepAlive: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/address/add',
            name: 'UniMall - AddressAdd',
            component: () => import('@/views/address/AddressAdd.vue'),
            meta: {
                  title: 'AddressAdd',
                  keepAlive: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // auth
      {
            path: '/delete-account',
            name: 'DeleteAccount',
            component: () => import('@/views/auth/DeleteAccount.vue'),
            meta: {
                  title: 'UniMall - DeleteAccount',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/auth/Login.vue'),
            meta: {
                  title: 'UniMall - Login',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // favorite
      {
            path: '/favorite',
            name: 'Favorite',
            component: () => import('@/views/favorite/Favorite.vue'),
            meta: {
                  title: 'UniMall - Favorite',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // legal
      {
            path: '/privacy',
            name: 'privacy',
            component: () => import('@/views/legal/Privacy.vue'),
            meta: {
                  title: 'UniMall - Privacy',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/terms',
            name: 'Terms',
            component: () => import('@/views/legal/Terms.vue'),
            meta: {
                  title: 'UniMall - Terms',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // order
      {
            path: '/order/list',
            name: 'OrderList',
            component: () => import('@/views/order/OrderList.vue'),
            meta: {
                  title: 'UniMall - Order',
                  auth: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/order/detail/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/OrderDetail.vue'),
            meta: {
                  title: 'UniMall - OrderDetail',
                  auth: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // payment
      {
            path: '/payment',
            name: 'Payment',
            component: () => import('@/views/payment/Payment.vue'),
            meta: {
                  title: 'UniMall - Payment',
                  auth: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'none'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      // product
      {
            path: '/product/list',
            name: 'ProductList',
            component: () => import('@/views/product/ProductList.vue'),
            meta: {
                  title: 'UniMall - ProductList',
                  keepAlive: true,
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'search'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/product/detail/:id',
            name: 'ProductDetail',
            component: () => import('@/views/product/ProductDetail.vue'),
            meta: {
                  title: 'UniMall - ProductDetail',
                  navBar: {
                        show: true, 
                        leftBtn: 'back',
                        rightBtn: 'share'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/404.vue'),
            meta: {
                  title: '页面未找到',
                  tabBar: {
                        show: false
                  }
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