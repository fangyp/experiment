import Vue from 'vue'
import poppyjs from 'poppyjs-elem'
// import store from '@/store'
import { getToken } from '@/utils/auth'

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
		const self = this
		return new Promise((resolve, reject) => {
			// 这里的getMenus是调用request方法从服务端获得路由菜单数据的Promise，类似getInfo
			options.headers = { 'X-ACCESS-TOKEN': getToken() }
			if (options.autoRefresh) {
				options.headers['X-AUTO-REFRESH'] = 1
			}
			poppyjs.biz.Http.request(options).then(
				(response) => {
					const checkResult = poppyjs.biz.Http.handleNoAuth(response.data, () => {
						poppyjs.html.Dialog.closeLoading()
						poppyjs.html.Dialog.showToast('正在跳转登录页面..', () => {
							// 登录超时，跳转到登录页
							self.redirect('/auth/login')
						})
					})
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
	}

	// 基于全站根路径的页面跳转，例如： /auth/login
	static redirect(uri) {
		poppyjs.util.NetUtil.redirect(Vue.$store.state.app.config.baseUrl + uri)
	}

	// 基于admin板块的跳转，例如： /admin/user/user-info
	static adminRedirect(uri) {
		poppyjs.util.NetUtil.redirect(Vue.$store.state.app.config.adminUrl + uri)
	}
}

export default NetUtil
