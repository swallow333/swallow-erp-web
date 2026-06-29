import { createRouter, createWebHistory } from 'vue-router' // 引入路由

// 路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 路由映射表
  routes: [
    // 1. 根路径 → 重定向到登录页
    {
      path: '/',
      redirect: '/login',
    },
    // 2. 登录页（不需要登录）
    {
      path: '/login', // 路由路径
      name: 'Login', // 路由名称
      component: () => import('@/views/login/Login.vue'),
    },
    // 3. 主布局（需要登录）
    {
      path: '/dashboard',
      component: () => import('@/components/layout/AppLayout.vue'),
      redirect: '/dashboard/index',
      // 嵌套路由
      children: [
        {
          path: 'index',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'UserList',
          component: () => import('@/views/system/user/UserList.vue'),
        },
        {
          path: 'products',
          name: 'ProductList',
          component: () => import('@/views/product/ProductList.vue'),
        },
        {
          path: 'categories',
          name: 'CategoryList',
          component: () => import('@/views/product/CategoryList.vue'),
        },
        // 其他页面...
      ],
    },
    // 4. 404 兜底
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

// 路由守卫：未登录跳转登录
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    next()
    return
  }
  if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router // 导出路由
