import poppyjs from 'poppyjs-elem'
import NetUtil from '../common/utils/NetUtil'

class Service {

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
	* }
	*/
	static request(options) {
		// 解析选项
		let url = options.url
		let method = (undefined === options.method || null === options.method) ? 'post': options.method
		let params = (undefined === options.params) ? null: options.params
		let successMsg = (undefined === options.successMsg || null === options.successMsg) ? false: options.successMsg
		let showErrorMsg = (undefined === options.showErrorMsg || null === options.showErrorMsg) ? true: options.showErrorMsg
		let showLoading = (undefined === options.showLoading || null === options.showLoading) ? true: options.showLoading
		// 提示loading
		if (showLoading) {
			poppyjs.html.Dialog.showLoading()
		}
		return new Promise((resolve, reject) => {
			let reqOptions = {url, method, params} = options
			NetUtil.adminRequest(reqOptions).then(
				(resp) => {
					console.log('request success: ', resp)
					poppyjs.html.Dialog.closeLoading()
					if (poppyjs.biz.Http.checkResponse(resp)) {
						if (false !== successMsg) {
							poppyjs.html.Dialog.showInfoMessage(successMsg)
						}
						resolve(resp)
					} else {
						if (showErrorMsg && (resp.errmsg && null !== resp.errmsg)) {
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