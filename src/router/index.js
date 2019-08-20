import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

const base = `${process.env.VUE_APP_BASE_URL}`

export const constantRoutes = [
	{
		path: `${base}/redirect`,
		component: Layout,
		children: [
			{
				path: '/redirect/:path*',
				component: () => import('@/pages/redirect/index')
			}
		]
	},
	{
		path: `${base}/login`,
		name: 'login',
		component: () => import('@/pages/auth/Login')
	},
	{
		path: `${base}/auth-redirect`,
		component: () => import('@/pages/auth/auth-redirect')
	},
	{
		path: `${base}/404`,
		component: () => import('@/pages/error-page/404')
	},
	{
		path: `${base}/401`,
		component: () => import('@/pages/error-page/401')
	},
	{
		path: '/',
		name: 'index',
		component: Layout,
		redirect: `${base}/dashboard`,
		children: [
			{
				path: `${base}/dashboard`,
				component: () => import('@/pages/dashboard/index'),
				name: 'Dashboard',
				meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
			}
		]
	}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
	// 404 page must be placed at the end !!!
	{ path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
	mode: 'history', // require service support
	// scrollBehavior: () => ({ y: 0 }),
	// base: `${process.env.VUE_APP_BASE_URL}/`,
	scrollBehavior: () => ({ y: 0 }),
	routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
	const newRouter = createRouter()
	router.matcher = newRouter.matcher // reset router
}

export default router
