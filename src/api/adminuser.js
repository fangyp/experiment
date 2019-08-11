import webcore from '@/webcore'

/**
 * 获取数据列表
 * @param {*} token
 */
export function getDataList(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/admin-user/get-list',
		showSuccessMsg: false,
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
		url: `/admin-user/user-status/${id}`,
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
		url: `/admin-user/update-password/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
/**
 * 删除
 */
export function deleteData(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/admin-user/delete/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
