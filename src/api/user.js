import webcore from '@/webcore'

/**
 * 登录
 * @param {*} data
 */
export function login(data) {
	return webcore.admin.Service.requestAuth({
		url: '/login',
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
	return webcore.admin.Service.requestAuth({
		url: '/logout',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}

/**
 * 从服务端获取当前登录用户的菜单/权限列表
 */
export function getPermissions() {
	return webcore.admin.Service.requestAdmin({
		url: '/permission/list',
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
	return webcore.admin.Service.requestAdmin({
		url: '/user/info',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}
/**
 * 获取当前用户信息
 * @param {*} token
 */
export function modifyPassword(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/profile/password/',
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

export default {
	login,
	getInfo,
	logout,
	getPermissions
}
