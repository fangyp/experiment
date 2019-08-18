
import {
	setToken,
	removeToken,
	getUserInfo,
	setUserInfo,
	removeUserInfo
} from '../../utils/auth'
import { login as loginUrl } from '../../api/user'
const user = getUserInfo()
const login = {
	namespaced: true,
	state: {
		account: user.account || '',
		password: user.password || '',
		checked: user.checked || false, // 记住密码
		loading: user.loading || false// 提交动画
	},
	/**
   * store的计算属性
   */
	getters: {
		/**
     * 这里的state是当前类的state
     * @param {*} state
     */
		getStateCount: function(state) {
			return 100 + 100
		}
	},
	/**
   * 本来以为是action 原来是action的下一步
   */
	mutations: {
		setAccount(state, account) {
			state.account = account
		},
		setPassword(state, password) {
			state.password = password
		},
		setChecked(state, isChecked) {
			state.checked = isChecked
		},
		showLoading(state, loading) {
			state.loading = loading
		}
	},
	/**
   * 更改状态发送的事件
   * 正规方式 : this.$store.dispatch(); 这会调用下面的actions中的方法 actions中支持异步
   * 不正规方式:this.$store.commit(); 这会调用上面的 mutations中的方法 mutations是同步的
   */
	actions: {

		setAccount(context, account) {
			context.commit('setAccount', account)
		},
		setPassword(context, pssword) {
			context.commit('setPassword', pssword)
		},
		setChecked(context, isChecked) {
			context.commit('setChecked', isChecked)
		},
		showLoading(context, loading) {
			context.commit('showLoading', loading)
		},
		submitLogin(context, payload = {}) {
			return new Promise((resolve, reject) => {
				context.commit('showLoading', false)
				const params = {
					login_name: payload.account,
					password: payload.password
				}

				loginUrl(params)
					.then(response => {
						const { access_token = '' } = response.data || {}
						setToken(access_token)
						const saveUser = {
							account: payload.account || '',
							password: payload.password || '',
							checked: payload.checked || false, // 记住密码
							token: access_token || ''
						}
						if (payload.checked) {
							setUserInfo(saveUser)
						} else {
							removeUserInfo()
						}
						resolve()
					})
					.catch(error => {
						removeUserInfo()
						removeToken()
						reject(error)
					})
			})
		}
	}

}

export default login
