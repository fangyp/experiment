import { Message } from 'element-ui'
import poppyjs from 'poppyjs-elem'
import NetUtil from '../common/utils/NetUtil'
import router from '@/router'

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
	 *   redirectInNoPermission: boolean，可选。 当调用服务端返回无权限错误时，是否跳转到首页。在某些情况，比如弹出页面并不需要跳转，可以设置为false，自己处理。默认：true
	 * }
	 */
	static request(options) {
		if (process.env.NODE_ENV === 'development') {
			console.log('service request options: ', options)
		}
		// 解析选项
		const host = (process.env.NODE_ENV === 'development' ? '' : process.env.VUE_APP_API_HOST)
		const url = host + options.url
		/*
		const method = (undefined === options.method || options.method === null) ? 'post' : options.method
		const params = (undefined === options.params) ? null : options.params
		const successMsg = (undefined === options.successMsg || options.successMsg === null) ? false : options.successMsg
		const showErrorMsg = (undefined === options.showErrorMsg || options.showErrorMsg === null) ? true : options.showErrorMsg
		const showLoading = (undefined === options.showLoading || options.showLoading === null) ? true : options.showLoading
		const autoRefresh = (undefined === options.autoRefresh || options.autoRefresh === null) ? false : options.autoRefresh
		const redirectInNoPermission = (undefined === options.redirectInNoPermission || options.redirectInNoPermission === null) ? true : options.redirectInNoPermission
		*/

		const { method = 'post', params = null, successMsg = false, showErrorMsg = true, showLoading = true, autoRefresh = false, redirectInNoPermission = true } = options

		// 提示loading
		if (showLoading) {
			poppyjs.html.Dialog.showLoading()
		}

		const reqOptions = {
			url: url,
			method: method,
			params: params,
			autoRefresh
		}
		return NetUtil.adminRequest(reqOptions).then((resp) => {
			poppyjs.html.Dialog.closeLoading()

			return new Promise((resolve, reject) => {
				if (poppyjs.biz.Http.checkResponse(resp)) {
					if (successMsg !== false) {
						// poppyjs.html.Dialog.showInfoMessage(successMsg)
						Message.success({
							message: successMsg,
							duration: 5000,
							showClose: true
						})
					}
					resolve(resp)
				} else {
					// 检查权限错误
					const checkResult = poppyjs.biz.Http.handleNoPermission(resp, () => {
						Message.error({
							message: '您没有权限操作该页面',
							duration: 3000,
							showClose: true
						})
						if (redirectInNoPermission) {
							setTimeout(() => {
								router.push('/')
							}, 800)
						}
					})
					if (checkResult) {
						if (showErrorMsg && (resp.errmsg && resp.errmsg !== null)) {
							// poppyjs.html.Dialog.showErrorMessage(resp.errmsg)
							Message.error({
								message: resp.errmsg,
								duration: 5000,
								showClose: true
							})
						}
					}
					reject(resp)
				}
			})
		},
		(resp) => {
			console.log('request error: ', resp)
			poppyjs.html.Dialog.closeLoading()

			return Promise.reject(resp)
		})
	}
}

export default Service
