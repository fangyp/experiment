import webcore from '@/webcore'

/**
 * 获取首页汇总数据
 */
export function getSummary() {
	return webcore.admin.Service.requestAdmin({
		url: '/dashboard/summary',
		showSuccessMsg: false,
		showErrorMsg: false,
		showLoading: false
	})
}

export default {
	getSummary
}
