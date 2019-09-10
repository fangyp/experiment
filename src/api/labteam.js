import webcore from '@/webcore'

/**
 * 枚举
 * @param {*} data
 */
export function preloadData(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/lab-team/preload/${id}`,
		showSuccessMsg: false,
		showErrorMsg: false,
		showLoading: false
	})
}

/**
 * 获取数据列表
 * @param {*} token
 */
export function getDataList(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/lab-team/get-list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 保存
 * @param {*} data
 */
export function saveData(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/lab-team/save',
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}

/**
 * 更新
 */
export function updateData(data) {
	const { id = '' } = data
	return webcore.admin.Service.requestAdmin({
		url: `/lab-team/update/${id}`,
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
		url: `/lab-team/team-status/${id}`,
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
		url: `/lab-team/delete/${id}`,
		showSuccessMsg: true,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
