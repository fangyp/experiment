import Vue from 'vue'
import Router from 'vue-router'
// import UserInfo from '@/pages/user/UserInfo'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [


  {
    path: '/',
    component: Layout,
    // redirect: '/user/user_info',
    hidden: true,
    children: [
      {
        path: 'user/user_info',
        component: () => import('@/pages/user/UserInfo'),
        name: 'UserInfo',
        // meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }


  /*
  { path: '/user/user_info', component: () => import('@/pages/user/UserInfo'), name: 'UserInfo' }
  */

  /*
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  },
  */

]

const createRouter = () => new Router({
  mode: 'history', // require service support
  // scrollBehavior: () => ({ y: 0 }),
  base: '/user/user_info',
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
