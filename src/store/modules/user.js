import { login, logout, getMenus, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
	token: getToken(),
	name: '',
	avatar: '',
	introduction: '',
	roles: []
}

const mutations = {
	SET_TOKEN: (state, token) => {
		state.token = token
	},
	SET_INTRODUCTION: (state, introduction) => {
		state.introduction = introduction
	},
	SET_NAME: (state, name) => {
		state.name = name
	},
	SET_AVATAR: (state, avatar) => {
		state.avatar = avatar
	},
	SET_ROLES: (state, roles) => {
		state.roles = roles
	},
	SET_MENUS: (state, menus) => { // 这里是新增的
		state.menus = menus
	}
}

const actions = {
	// user login
	login({ commit }, userInfo) {
		const { login_name, password } = userInfo
		return new Promise((resolve, reject) => {
			login({ login_name: login_name.trim(), password: password }).then(response => {
				const { data } = response
				commit('SET_TOKEN', data.access_token)
				setToken(data.access_token)
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	},

	// get user info
	getInfo({ commit, state }) {
		return new Promise((resolve, reject) => {
			getInfo(state.token).then(response => {
				const { data } = response

				if (!data) {
					reject('Verification failed, please Login again.')
				}

				const { info } = data
				const { role_type_name, user_name, login_name } = info

				commit('SET_ROLES', [role_type_name])
				commit('SET_NAME', login_name)
				// commit('SET_AVATAR', avatar) // 没有头像
				commit('SET_INTRODUCTION', user_name)
				resolve(data)
			}).catch(error => {
				reject(error)
			})
		})
	},

	// user logout
	logout({ commit, state }) {
		return new Promise((resolve, reject) => {
			logout(state.token).then(() => {
				commit('SET_TOKEN', '')
				commit('SET_ROLES', [])
				removeToken()
				resetRouter()
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	},

	// remove token
	resetToken({ commit }) {
		return new Promise(resolve => {
			commit('SET_TOKEN', '')
			commit('SET_ROLES', [])
			removeToken()
			resolve()
		})
	},

	// dynamically modify permissions
	changeRoles({ commit, dispatch }, role) {
		return new Promise(async resolve => {
			const token = role + '-token'

			commit('SET_TOKEN', token)
			setToken(token)

			const { roles } = await dispatch('getInfo')

			resetRouter()

			// generate accessible routes map based on roles
			const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

			// dynamically add accessible routes
			router.addRoutes(accessRoutes)

			// reset visited views and cached views
			dispatch('tagsView/delAllViews', null, { root: true })

			resolve()
		})
	},

	getMenus({ commit, state }) { // 这个是新增的action
		return new Promise((resolve, reject) => {
			// 这里的getMenus是调用request方法从服务端获得路由菜单数据的Promise，类似getInfo

			getMenus().then(response => {
				const { data } = response
				if (!data) {
					reject('Verification failed, please Login again.')
				}

				const menus = data

				// roles must be a non-empty array
				if (!menus || menus.length <= 0) {
					reject('getMenus: menus must be a non-null array!')
				}

				commit('SET_MENUS', menus)
				resolve(menus)
			}).catch(error => {
				reject(error)
			})
		})
	}

}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
