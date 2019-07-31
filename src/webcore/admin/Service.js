import poppyjs from 'poppyjs-elem'
import NetUtil from '../common/utils/NetUtil'

class Service {
	/**
	 * 请求admin 的相关接口
	 * @param {*} options 参数详见 request() 方法
	 */
	static requestAdmin(options) {
		options.url = process.env.VUE_APP_ADMIN_API + options.url
		return this.request(options)
	}

	/**
	 * 请求auth相关接口
	 * @param {*} options 参数详见 request() 方法
	 */
	static requestAuth(options) {
		options.url = process.env.VUE_APP_AUTH_API + options.url
		return this.request(options)
	}

	/**
	 * 实现请求服务端web服务的通用方法。本方法内部对请求的结果是否成功做了判断。
	 *
	 * @param {*} options {
	 *   url: string, 必需。请求的url相对路径，注意前面要加上"/"，比如："/user/info"。
	 *   method: string, 可选。支持get、post、delete、update等。 默认为post。
	 *   params: object, 可选。请求参数列表，值对形式。
	 *   successMsg: string | boolean, 可选。显示的成功信息，如果设置为false，则不显示成功消息弹框。默认：false。
	 *   showErrorMsg: boolean, 可选。当发生错误时是否显示错误信息框，比如服务端返回业务错误。默认：true。
	 *   showLoading: boolean, 可选。是否显示加载提示，比如请求数据时显示的loading。 默认：true。
	 *   autoRefresh: boolean，可选。是否是自动刷新提交的请求。默认：false。
	 * }
	 */
	static request(options) {
		// 解析选项
		const url = options.url
		const method = (undefined === options.method || options.method === null) ? 'post' : options.method
		const params = (undefined === options.params) ? null : options.params
		const successMsg = (undefined === options.successMsg || options.successMsg === null) ? false : options.successMsg
		const showErrorMsg = (undefined === options.showErrorMsg || options.showErrorMsg === null) ? true : options.showErrorMsg
		const showLoading = (undefined === options.showLoading || options.showLoading === null) ? true : options.showLoading
		// 提示loading
		if (showLoading) {
			poppyjs.html.Dialog.showLoading()
		}
		return new Promise((resolve, reject) => {
			const reqOptions = {
				url: url,
				method: method,
				params: params
			}
			NetUtil.adminRequest(reqOptions).then(
				(resp) => {
					console.log('request success: ', resp)
					poppyjs.html.Dialog.closeLoading()
					if (poppyjs.biz.Http.checkResponse(resp)) {
						if (successMsg !== false) {
							poppyjs.html.Dialog.showInfoMessage(successMsg)
						}
						resolve(resp)
					} else {
						if (showErrorMsg && (resp.errmsg && resp.errmsg !== null)) {
							poppyjs.html.Dialog.showErrorMessage(resp.errmsg)
						}
						reject(resp)
					}
				},
				(resp) => {
					console.log('request error: ', resp)
					poppyjs.html.Dialog.closeLoading()
					reject(resp)
				}
			)
		}) // Promise
	}
}

export default Service
