import Vue from 'vue'
import poppyjs from 'poppyjs-elem'
// import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'
import { removeToken } from '@/utils/auth' // get token from cookie

class NetUtil {
	/**
	 * 发送一个admin请求，该方法针对admin的业务做了些处理，比如对服务端返回的认证失败等处理。
	 * 只针对已登录用户请求admin板块接口。
	 * @param {*} options {
	 *   url: 必需。请求地址，相对地址
	 *   method: 可选。动词，默认post
	 *   params: 可选。参数对象
	 *   autoRefresh: boolean，可选。是否是自动刷新提交的请求。默认：false。
	 * }
	 */
	static adminRequest(options) {
		// 这里的getMenus是调用request方法从服务端获得路由菜单数据的Promise，类似getInfo
		options.headers = { 'X-ACCESS-TOKEN': getToken() }
		if (options.autoRefresh) {
			options.headers['X-AUTO-REFRESH'] = 1
		}

		return poppyjs.biz.Http.request(options).then((response) => {
			let checkResult = poppyjs.biz.Http.handleNoAuth(response.data, () => {
				poppyjs.html.Dialog.closeLoading()
				poppyjs.html.Dialog.showToast('未登录认证，正在跳转登录页面', () => {
					// 登录超时，跳转到登录页
					removeToken()
					setTimeout(() => {
						router.push('/auth/login')
					}, 600)
				})
			})
			if (checkResult) {
				checkResult = poppyjs.biz.Http.handleNoPermission(response.data, () => {
					poppyjs.html.Dialog.closeLoading()
					poppyjs.html.Dialog.showToast('您没有权限操作该页面', () => {
						// 权限错误，跳转到首页
						setTimeout(() => {
							router.push('/')
						}, 600)
					})
				})
			}

			return new Promise((resolve, reject) => {
				if (checkResult) {
					resolve(response.data)
				} else {
					reject(response.data)
				}
			})
		}, (response) => {
			// poppyjs.html.Dialog.showNetError()
			return Promise.reject(response.data)
		})

		/*
		return new Promise((resolve, reject) => {
			// 这里的getMenus是调用request方法从服务端获得路由菜单数据的Promise，类似getInfo
			options.headers = { 'X-ACCESS-TOKEN': getToken() }
			if (options.autoRefresh) {
				options.headers['X-AUTO-REFRESH'] = 1
			}
			poppyjs.biz.Http.request(options).then(
				(response) => {
					let checkResult = poppyjs.biz.Http.handleNoAuth(response.data, () => {
						poppyjs.html.Dialog.closeLoading()
						poppyjs.html.Dialog.showToast('正在跳转登录页面..', () => {
							// 登录超时，跳转到登录页
							removeToken()
							router.push('/auth/login')
						})
					})
					if (checkResult) {
						checkResult = poppyjs.biz.Http.handleNoPermission(response.data, () => {
							poppyjs.html.Dialog.closeLoading()
							poppyjs.html.Dialog.showToast('正在跳转登录页面..', () => {
								// 权限错误，跳转到首页
								router.push('/')
							})
						})
					}

					if (checkResult) {
						resolve(response.data)
					} else {
						reject(response.data)
					}
				},
				(response) => {
					poppyjs.html.Dialog.showNetError()
					reject(response.data)
				}
			)
		}) // Promise
		*/
	}

	// 基于全站根路径的页面跳转，例如： /auth/login
	static redirect(uri) {
	}

	// 基于admin板块的跳转，例如： /admin/user/user-info
	static adminRedirect(uri) {
	}
}

export default NetUtil
