import webcore from '@/webcore'

/**
 * 添加一个新实验
 */
export function addExperiment(params) {
	return webcore.admin.Service.requestAdmin({
		url: '/experiment/save',
		params: params,
		showSuccessMsg: true
	})
}

export default {
	addExperiment
}
