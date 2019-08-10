import webcore from '@/webcore'

/**
 * 枚举
 * @param {*} data
 */
export function preloadEnum() {
	return webcore.admin.Service.requestAdmin({
		url: '/user/preload',
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
		url: '/user/get-list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 保存用户
 * @param {*} data
 */
export function saveData(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/user/save',
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 更新用户
 */
export function updateData(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/user/update/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 更新状态
 */
export function changeState(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/user/user-status/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
/**
 * 修改密码
 */
export function modifyPassword(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/user/update-password/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
/**
 * 删除用户
 */
export function deleteUser(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/user/delete/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}


export default {
	preloadEnum,
	saveData,
	updateData,
	changeState,
	modifyPassword,
	getDataList
}
