import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user.store'

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
            component: () => import(/* webpackChunkName: "home" */ '@/views/home/Home.vue'),
            meta: {
                  title: 'UniMall - Home',
                  keepAlive: true,
                  navBar: {
                        show: true,
                        leftBtn: 'logo',
                        rightBtn: 'cart'
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
                        show: true,
                        leftBtn: 'logo',
                        rightBtn: 'cart'
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      {
            path: '/favorite',
            name: 'Favorite',
            component: () => import('@/views/favorite/Favorite.vue'),
            meta: {
                  title: 'UniMall - Favorite',
                  auth: true, // 收藏需要登录
                  navBar: {
                        show: true,
                        leftBtn: 'logo',
                        rightBtn: 'cart'
                  },
                  tabBar: {
                        show: true
                  }
            },
      },
      {
            path: '/user',
            name: 'User',
            component: () => import(/* webpackChunkName: "user" */ '@/views/user/User.vue'),
            meta: {
                  title: 'UniMall - User',
                  auth: true, // 用户中心需要登录
                  keepAlive: true,
                  navBar: {
                        show: true,
                        leftBtn: 'logo',
                        rightBtn: 'cart'
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
                  auth: true, // 地址管理需要登录
                  keepAlive: true,
                  navBar: {
                        show: true,
                        leftBtn: 'back',
                        rightBtn: 'add'
                  },
                  tabBar: {
                        show: false
                  }
            },
      },
      {
            path: '/address/add',
            name: 'AddressAdd',
            component: () => import('@/views/address/AddressAdd.vue'),
            meta: {
                  title: 'UniMall - AddressAdd',
                  auth: true, // 添加地址需要登录
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
                  auth: true, // 删除账号需要登录
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
      {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/auth/Register.vue'),
            meta: {
                  title: 'UniMall - Register',
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
      // cart
      {
            path: '/cart',
            name: 'Cart',
            component: () => import('@/views/cart/Cart.vue'),
            meta: {
                  title: 'UniMall - Cart',
                  auth: true, // 购物车需要登录 
                  keepAlive: true,
                  navBar: {
                        show: true,
                        leftBtn: 'back',
                  },
                  tabBar: {
                        show: false
                  }
            },
      }, 
      // legal
      {
            path: '/privacy',
            name: 'Privacy',
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
            path: '/order/comfirm',
            name: 'ConfirmOrder',
            component: () => import('@/views/order/ConfirmOrder.vue'),
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
            path: '/payment/:id',
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
                        show: false,
                        leftBtn: 'back',
                        rightBtn: 'share',
                        showBackground:false,
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

// 不需要重定向的白名单路由
const whiteList = ['/login', '/register', '/home', '/category', '/product/list', '/product/detail', '/privacy', '/terms']

// 路由前置守卫 
router.beforeEach((to, from, next) => {
      // 设置页面标题
      document.title = `${to.meta.title || '购物商城'}`;

      // 使用 Pinia store 检查登录状态
      const userStore = useUserStore();
      const isLoggedIn = userStore.getIsLoggedIn;

      

      // 简化登录判断逻辑
      if (whiteList.some(path => to.path.startsWith(path))) {
            // 白名单路径直接放行
            next();
      } else if (to.meta.auth && !isLoggedIn) {
            // 需要登录但未登录，重定向到登录页
            next({
                  path: '/login',
                  query: { redirect: to.fullPath },
            });
      } else if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
            // 已登录用户访问登录/注册页，重定向
            const redirect = from.query.redirect as string || '/home';
            next({ path: redirect });
      } else {
            // 其他情况
            isLoggedIn ? next() : next({
                  path: '/login',
                  query: { redirect: to.fullPath },
            });
      }
});

// 路由后置守卫
router.afterEach(() => {
      // 路由加载完成后的处理
      window.scrollTo(0, 0)
})

export default router