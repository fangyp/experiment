import webcore from '@/webcore'

/**
 * 登录
 * @param {*} data
 */
export function login(data) {
	return webcore.admin.Service.request({
		url: '/user/login',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 退出登录
 */
export function logout() {
	return webcore.admin.Service.request({
		url: '/user/logout',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}

/**
 * 从服务端获取当前登录用户的菜单/权限列表
 */
export function getMenus() {
	return webcore.admin.Service.request({
		url: '/menu/list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}

/**
 * 获取当前用户信息
 * @param {*} token 
 */
export function getInfo() {
	return webcore.admin.Service.request({
		url: '/user/info',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}

export default {
	login,
	getInfo,
	logout,
	getMenus,
}