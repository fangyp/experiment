/**
 * 人员列表的用户
 */
import { addExperiment as saveDataRequest, getDataList as getDataListRequest } from '../../api/experiment'
import { updateExperiment as updateDataRequest, updateExperimentStatus as changeStateRequest } from '../../api/experiment'
import { preloadData as preloadDataRequest, deleteExperiment as deleteDataRequest } from '../../api/experiment'
import { isNumber } from '../../utils/validate'
import { page } from '../../utils/page'

/**
* 实验类型
*/
const typeOptions = [
	{ key: 'application', value: '应用' },
	{ key: 'synthetic', value: '合成' }
]

/** 新建模板 */
const createTemplate = {
	experiment_name: '', // 实验名称
	experiment_type: '', // 实验类型
	temperature: '', // 温度
	humidity: '' // 湿度
}
/**
 * 表单标题
 */
const formTitles = {
	create: '新建实验基本信息',
	update: '修改实验基本信息'
}
/**
 * 验证表单
 */
const validation = {
	/** 新建验证*/
	create: {
		experiment_name: [
			{ required: true, message: '请填写实验名称', trigger: 'blur' }
		],
		experiment_type: [{ required: true, message: '请选择实验类型', trigger: 'blur' }],
		temperature: [
			{ required: true, message: '请填写实验温度', trigger: 'blur' },
			{ validator: isNumber, trigger: 'blur' },
			{ min: -1000, max: 1000, message: '实验温度范围 -1000℃ ~ +1000℃', trigger: 'blur' }
		],
		humidity: [
			{ required: true, message: '请填写实验湿度', trigger: 'blur' },
			{ validator: isNumber, trigger: 'blur' },
			{ min: 0, max: 100, message: '实验温度范围 0% ~ 100%', trigger: 'blur' }
		]
	},
	/** 更新验证 */
	update: {
		experiment_name: [
			{ required: true, message: '请填写实验名称', trigger: 'blur' }
		],
		experiment_type: [{ required: true, message: '请选择实验类型', trigger: 'blur' }],
		temperature: [
			{ required: true, message: '请填写实验温度', trigger: 'blur' },
			{ validator: isNumber, trigger: 'blur' },
			{ min: -1000, max: 1000, message: '实验温度范围 -1000℃ ~ +1000℃', trigger: 'blur' }
		],
		humidity: [
			{ required: true, message: '请填写实验湿度', trigger: 'blur' },
			{ validator: isNumber, trigger: 'blur' },
			{ min: 0, max: 100, message: '实验温度范围 0% ~ 100%', trigger: 'blur' }
		]
	}
}

const explist = {
	namespaced: true,
	state: {
		createFormVisible: false, /** 新建弹出层的显示或隐藏 */
		createFormStatus: '', // form类型 create or update
		typeOptions: typeOptions, // 实验类型
		createNew: { ...createTemplate }, // 新建&修改对象
		validation: validation, // 验证器
		formTitles: formTitles, // 表达标题
		tableKey: 0, // 不知道干嘛的
		pageMap: page, // 分页对象
		experiment_status: '', // 实验状态
		experiment_status_list: [], // 实验状态列表
		team_id: '', // 实验组id
		lab_team_list: [], // 全部实验组列表(包含状态不可用的)
		keyword: '', /** 搜索条件 */
		dataList: [] // 数据列表
	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 获取预加载项目
		onPreloadAction(state, payload = {}) {
			preloadDataRequest()
				.then(response => {
					console.log(response)
					const { experiment_status_list = [], lab_team_list = [] } = response.data || {}
					state.experiment_status_list = experiment_status_list
					state.lab_team_list = lab_team_list
				})
		},
		// 获取数据列表
		getDataArray(state, payload = {}) {
			state.showFormLoading = false
			const params = {
				experiment_name: state.keyword,
				team_id: state.team_id,
				experiment_status: state.experiment_status,
				ordering: 'created_time,desc',
				page: payload.page,
				page_size: payload.page_size
			}
			console.log(params)
			getDataListRequest(params)
				.then(response => {
					const { data = [], total = 0, per_page = 10, current_page = 1 } = response.data || {}
					state.showFormLoading = false
					state.dataList = data
					state.pageMap = {
						total: parseInt(total),
						page_size: parseInt(per_page), // 每页多少显示多少条数据
						page: parseInt(current_page)// 当前第几页
					}
				})
		},

		// 新建动作
		onCreateAction(state) {
			state.createFormVisible = true
			state.createFormStatus = 'create'
			state.createNew = { ...createTemplate }
			console.log('onCreateAction')
		},
		// 新建保存
		onSaveAction(state, payload) {
			const { finishCallback = () => { } } = payload

			const params = state.createNew
			saveDataRequest(params)
				.then(() => {
					finishCallback()
					state.createFormVisible = false
				})
		},
		// 修改动作
		onModifyAction(state, payload) {
			state.createFormVisible = true
			state.createFormStatus = 'update'
			state.user = { ...payload }
			state.user.role_type = state.user.role_type_formatted
		},
		// 修改保存
		onUpdateAction(state, payload) {
			const { finishCallback = () => { } } = payload
			const { user_id = '', role_type = '', user_name = '', phone = '' } = state.user
			const params = {
				id: user_id,
				role_type: role_type,
				user_name: user_name,
				phone: phone
			}
			updateDataRequest(params)
				.then(() => {
					state.createFormVisible = false
					finishCallback()
				})
		},

		// 改变状态
		onChangeStateAction(state, payload) {
			const { id, statuskey, finishCallback = () => { } } = payload
			const params = {
				id: id,
				status: statuskey
			}
			changeStateRequest(params)
				.then(() => {
					finishCallback()
				})
		},
		// 删除用户
		onDeleteAction(state, payload) {
			const { id, finishCallback = () => { } } = payload
			const params = {
				id: id
			}
			deleteDataRequest(params)
				.then(() => {
					finishCallback()
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
		onCreateAction(context, payload = {}) {
			context.commit('onCreateAction', payload)
		},
		onSaveAction(context, payload = {}) {
			context.commit('onSaveAction', payload)
		},
		getDataArray(context, payload = {}) {
			context.commit('getDataArray', payload)
		},
		onModifyAction(context, payload = {}) {
			context.commit('onModifyAction', payload)
		},
		onUpdateAction(context, payload = {}) {
			context.commit('onUpdateAction', payload)
		},
		onChangeStateAction(context, payload = {}) {
			context.commit('onChangeStateAction', payload)
		},
		onDeleteAction(context, payload = {}) {
			context.commit('onDeleteAction', payload)
		}

	}
}


export default explist
