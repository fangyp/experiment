import webcore from '@/webcore'

/**
 * 获取一个实验详情
 */
export function getExperiment(experimentId) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/info/' + experimentId,
		successMsg: false
	})
}
/**
 * 枚举
 * @param {*} data
 */
export function preloadData() {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/preload',
		showSuccessMsg: false,
		showErrorMsg: false,
		showLoading: false
	})
}
/**
 * 获取列表数据
 * @param {*} token
 */
export function getDataList(data) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/get-list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true,
		params: data
	})
}
/**
 * 添加一个新实验
 */
export function addExperiment(params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/save',
		params: params,
		successMsg: '添加成功'
	})
}

/**
 * 修改一个实验的数据
 */
export function updateExperiment(experimentId, params, autoSubmit) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/update/' + experimentId,
		params: params,
		successMsg: (autoSubmit ? false : '保存成功'),
		autoRefresh: autoSubmit
	})
}

/**
 * 删除一个实验
 */
export function deleteExperiment(experimentId) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/delete/' + experimentId,
		successMsg: '删除成功'
	})
}

/**
 * 更改一个实验的状态
 */
export function updateExperimentStatus(experimentId, params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/status/' + experimentId,
		params: params,
		successMsg: '状态更改成功'
	})
}

/**
 * 为一个实验添加测试记录(一个测试包含若干测试项目和测试结果)
 */
export function addExperimentTesting(experimentId, params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-testing/save/' + experimentId,
		params: params,
		successMsg: '测试记录已添加'
	})
}

/**
 * 修改实验的一个测试记录
 */
export function updateExperimentTesting(testingId, params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-testing/update/' + testingId,
		params: params,
		successMsg: '测试记录已保存'
	})
}

/**
 * 获取一个实验测试记录
 */
export function getExperimentTesting(testingId) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-tesing/info/' + testingId,
		successMsg: false
	})
}

/**
 * 获取一个实验的测试记录列表
 */
export function listExperimentTesting(experimentId) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-tesing/list/' + experimentId,
		successMsg: false
	})
}

/**
 * 申请审核实验
 */
export function addExperimentAudit(experimentId, params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-audit/save/' + experimentId,
		params: params,
		successMsg: '审核请求已提交'
	})
}

/**
 * 审核一个实验
 */
export function auditExperiment(experimentId, params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment-audit/update/' + experimentId,
		params: params,
		successMsg: '审核结果已提交'
	})
}

export default {
	getExperiment,
	addExperiment,
	updateExperiment,
	deleteExperiment
}
