/**
 * 人员列表的用户
 */
import { preloadData as preloadDataRequest, getDataList as getDataListRequest } from '../../api/adminlog'
import { page } from '../../utils/page'
const { entries } = Object
const adminlog = {
	namespaced: true,
	state: {
		module_key: '', /** 搜索条件 */
		event_time1: '', /** 搜索条件 */
		event_time2: '', /** 搜索条件 */
		showFormLoading: false, // 表单加载动画
		pageMap: page, // 分页对象
		dataList: [], // 数据列表
		tableKey: 0, // 听说管刷新的
		modules: [] // 功能模块列表
	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 获取预加载项目
		onPreloadAction(state, payload = {}) {
			preloadDataRequest()
				.then(response => {
					const { modules = {}} = response.data || {}
					const modulesTemp = []
					for (const [key, value] of entries(modules)) {
						const model = {
							key: key,
							value: value
						}
						modulesTemp.push(model)
					}
					state.modules = modulesTemp
				})
		},
		// 获取数据列表
		getDataArray(state, payload = {}) {
			state.showFormLoading = false
			const params = {
				module_key: state.module_key,
				event_time1: state.event_time1,
				event_time2: state.event_time2,
				page: payload.page,
				page_size: payload.page_size
			}

			getDataListRequest(params)
				.then(response => {
					const { data = [], total = 0, per_page = 10, current_page = 1 } = response.data || {}
					state.showFormLoading = false

					const dataArray = []
					for (const item of data) {
						const { content = '{}' } = item
						const contentObject = JSON.parse(content)
						if (contentObject.constructor === Array) {
							const itemTemp = { ...item, content: contentObject }
							dataArray.push(itemTemp)
						} else {
							const modulesTemp = []
							for (const [key, value] of entries(contentObject)) {
								const model = {
									key: key,
									value: value
								}
								modulesTemp.push(model)
							}
							const itemTemp = { ...item, content: modulesTemp }
							dataArray.push(itemTemp)
						}
					}
					state.dataList = dataArray
					state.pageMap = {
						total: parseInt(total),
						page_size: parseInt(per_page), // 每页多少显示多少条数据
						page: parseInt(current_page)// 当前第几页
					}
				})
		}
	},
	/**
    * 更改状态发送的事件
    * 正规方式 : this.$store.dispatch(); 这会调用下面的actions中的方法 actions中支持异步
    * 不正规方式:this.$store.commit(); 这会调用上面的 mutations中的方法 mutations是同步的
    */
	actions: {
		onPreloadAction(context, payload = {}) {
			context.commit('onPreloadAction', payload)
		},
		getDataArray(context, payload = {}) {
			context.commit('getDataArray', payload)
		}
	}
}


export default adminlog
