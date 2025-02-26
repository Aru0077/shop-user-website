import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由元数据类型定义
declare module 'vue-router' {
      interface RouteMeta {
            title?: string
            auth?: boolean
            keepAlive?: boolean
      }
}

// 路由配置
const routes: Array<RouteRecordRaw> = [
      {
            path: '/',
            component: () => import('@/views/layout/MainLayout.vue'),
            redirect: '/placeholder',
            children: [
                  {
                        path: '/placeholder',
                        name: 'Placeholder',
                        component: () => import('@/views/placeholder.vue'),
                        meta: {
                              title: '首页',
                              keepAlive: true,
                        },
                  },
            ],
      },
      {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/placeholder.vue'),
            meta: {
                  title: '登录',
            },
      },
      {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/placeholder.vue'),
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