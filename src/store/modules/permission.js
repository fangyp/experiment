import { constantRoutes } from '@/router'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
	if (route.meta && route.meta.roles) {
		return roles.some(role => route.meta.roles.includes(role))
	} else {
		return true
	}
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
	const res = []
	routes.forEach(route => {
		const tmp = { ...route }
		if (hasPermission(roles, tmp)) {
			if (tmp.children) {
				tmp.children = filterAsyncRoutes(tmp.children, roles)
			}
			res.push(tmp)
		}
	})

	return res
}

const state = {
	routes: [],
	addRoutes: []
}

const mutations = {
	SET_ROUTES: (state, routes) => {
		state.addRoutes = routes
		state.routes = constantRoutes.concat(routes)
	}
}

const actions = {
	/*
	generateRoutes({ commit }, roles) {
	  return new Promise(resolve => {
		let accessedRoutes
		if (roles.includes('admin')) {
		  accessedRoutes = asyncRoutes || []
		} else {
		  accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
		}
		commit('SET_ROUTES', accessedRoutes)
		resolve(accessedRoutes)
	  })
	}
	*/
	generateRoutes({ commit, state }, { roles, menus }) {
		return new Promise(resolve => {
			const accessedRoutes = dataArrayToRoutes(parseRouters(menus))
			commit('SET_ROUTES', accessedRoutes)
			resolve(accessedRoutes)
		})
	}
}

function dataArrayToRoutes(data) {
	const res = []
	data.forEach(item => {
		const tmp = { ...item }
		if (tmp.component === 'Layout') {
			tmp.component = Layout
		} else {
			// let sub_view = tmp.component
			// sub_view = sub_view.replace(/^\/*/g, '')
			// //这里很重要，把view动态加载进来，而且似乎我只找到这样的写法，用拼接不行，然后 views 后面没有斜杆也不行
			// tmp.component = () => import(`@/views/${sub_view}`)
		}
		if (tmp.children) {
			tmp.children = dataArrayToRoutes(tmp.children)
		}
		res.push(tmp)
	})
	return res
}

// 将后端发来的菜单权限数据解析为框架的route结构
function parseRouters(menuList) {
	const allRouters = []
	menuList.forEach((value, index, array) => {
		const childrenList = []
		value.sub_menus.forEach((value, index, array) => {
			childrenList.push({
				id: value.menu_id + '',
				path: value.uri,
				// component: () => import('@/views/components-demo/tinymce'),
				name: value.menu_id,
				external: false,
				meta: { title: value.menu_name }
			})
		})

		allRouters.push({
			id: value.menu_id + '',
			path: value.uri,
			component: 'Layout',
			redirect: 'noRedirect',
			name: value.menu_id,
			hidden: (value.main_nav !== 1),
			external: false,
			meta: {
				title: value.menu_name,
				icon: 'component'
			},
			children: childrenList
		})
	})
	return allRouters
}


export default {
	namespaced: true,
	state,
	mutations,
	actions
}
