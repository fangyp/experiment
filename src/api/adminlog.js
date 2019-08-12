import webcore from '@/webcore'

/**
 * 枚举
 * @param {*} data
 */
export function preloadData() {
	return webcore.admin.Service.requestAdmin({
		url: '/admin-log/preload',
		showSuccessMsg: false,
		showErrorMsg: false,
		showLoading: false
	})
}

/**
 * 获取当前用户列表
 * @param {*} token
 */
export function getDataList(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/admin-log/get-list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}


