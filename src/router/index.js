import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

export const constantRoutes = [
	{
		path: '/redirect',
		component: Layout,
		children: [
			{
				path: '/redirect/:path*',
				component: () => import('@/pages/redirect/index')
			}
		]
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('@/pages/auth/Login')
	},
	{
		path: '/auth-redirect',
		component: () => import('@/pages/auth/auth-redirect')
	},
	{
		path: '/404',
		component: () => import('@/pages/error-page/404')
	},
	{
		path: '/401',
		component: () => import('@/pages/error-page/401')
	},
	{
		path: '/',
		name: 'index',
		component: Layout,
		redirect: '/dashboard',
		children: [
			{
				path: 'dashboard',
				component: () => import('@/pages/dashboard/index'),
				name: 'Dashboard',
				meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
			}
		]
	}
]

const createRouter = () => new Router({
	// mode: 'history', // require service support
	// scrollBehavior: () => ({ y: 0 }),
	// base: '/',
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
