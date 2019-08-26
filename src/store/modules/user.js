import { login, logout, getPermissions, getInfo, modifyPassword } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { isPassword } from '../../utils/validate'
/**
 * 验证表单
 */
const validation = {
	/** 修改面膜 */
	update: {
		old_password: [
			{ required: true, message: '请输入旧密码', trigger: 'blur' }
		],
		password: [
			{ required: true, message: '请设置新密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		],
		password_confirmation: [
			{ required: true, message: '确认新密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		]
	}
}
/**
 * 表单标题
 */
const formTitles = {
	update: '修改密码'
}

/** 新建模板 */
const createTemplate = {
	old_password: '', // 旧密码
	password: '', // 密码
	password_confirmation: '' // 确认密码
}

const state = {
	token: getToken(),
	name: '',
	avatar: '',
	introduction: '',
	roles: [],
	roleNames: [],
	permissions: {},
	/** 密码修改相关 */
	createFormVisible: false, /** 新建弹出层的显示或隐藏 */
	createFormStatus: 'update', // form类型 create or update
	validation: validation, // 验证器
	formTitles: formTitles, // 表达标题
	createNew: { ...createTemplate } // 新建&修改用户信息对象
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
	SET_ROLE_NAMES: (state, roleNames) => {
		state.roleNames = roleNames
	},
	SET_MENUS: (state, menus) => { // 这里是新增的
		state.menus = menus
	},
	SET_PERMISSIONS: (state, permissions) => { // 这里是新增的
		state.permissions = permissions
	},
	// 修改密码
	onModifyPassAction(state, payload) {
		state.createFormVisible = true
		state.createNew = { ...createTemplate }
	},
	onUpdatePasword(state, payload) {
		const { finishCallback = () => { } } = payload
		const { old_password = '', password = '', password_confirmation = '' } = state.createNew
		const params = {
			old_password: old_password,
			password: password,
			password_confirmation: password_confirmation
		}
		modifyPassword(params)
			.then(() => {
				state.createFormVisible = false
				finishCallback()
			})
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
				const { role_type, user_name, login_name, role_name } = info
				commit('SET_ROLES', [role_type])
				commit('SET_ROLE_NAMES', [role_name])
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

	getPermissions({ commit, state }) { // 这个是新增的action
		return new Promise((resolve, reject) => {
			// 这里的getMenus是调用request方法从服务端获得路由菜单数据的Promise，类似getInfo

			getPermissions().then(response => {
				const { data } = response
				if (!data) {
					reject('Verification failed, please Login again.')
				}

				const menus = data.menus
				const permissions = data.permissions

				// roles must be a non-empty array
				if (!menus) {
					reject('getPermissions: menus must be a non-null array!')
				}

				commit('SET_MENUS', menus)
				commit('SET_PERMISSIONS', permissions)
				resolve(menus)
			}).catch(error => {
				reject(error)
			})
		})
	},

	onModifyPassAction(context, payload = {}) {
		context.commit('onModifyPassAction', payload)
	},
	onUpdatePasword(context, payload = {}) {
		context.commit('onUpdatePasword', payload)
	}

}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
