/**
 * 人员列表的用户
 */
import { preloadData as preloadDataRequest, saveData as saveDataRequest } from '../../api/labteam'
import { updateData as updateDataRequest, getDataList as getDataListRequest } from '../../api/labteam'
import { changeState as changeStateRequest, deleteData as deleteDataRequest } from '../../api/labteam'
import { page } from '../../utils/page'

/** 新建模板 */
const createTemplate = {
	team_name: '', // 实验组名称
	leader_id: '', // 组长的用户ID
	member_ids: [] // 其他小组成员的用户ID
}
/**
 * 表单标题
 */
const formTitles = {
	update: '修改实验组',
	create: '新建实验组'
}
/**
 * 验证表单
 */
const validation = {
	/** 新建验证*/
	create: {
		team_name: [
			{ required: true, message: '请填写实验组名称', trigger: 'blur' },
			{ min: 3, max: 15, message: '名称长度在3到15位之间', trigger: 'blur' }
		]
	},
	/** 更新验证 */
	update: {
		user_name: [
			{ required: true, message: '请填写实验组名称', trigger: 'blur' },
			{ min: 3, max: 15, message: '名称长度在3到15位之间', trigger: 'blur' }
		]
	}
}
const labteam = {
	namespaced: true,
	state: {
		keyword: '', /** 搜索条件 */
		createFormVisible: false, /** 新建弹出层的显示或隐藏 */
		createFormStatus: '', // form类型 create or update
		showFormLoading: false, // 表单加载动画
		createNew: { ...createTemplate }, // 新建&修改对象
		validation: validation, // 验证器
		pageMap: page, // 分页对象
		dataList: [], // 数据列表
		formTitles: formTitles, // 表单标题
		tableKey: 0, // 听说管刷新的

		team_leaders: [], // 当前所有角色为"实验组长"的用户列表
		lab_staffs: []// 当前所有角色为“实验员”的用户列表

	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 获取预加载项目
		onPreloadAction(state, payload = {}) {
			preloadDataRequest()
				.then(response => {
					const { lab_staffs = [], team_leaders = [] } = response.data || {}
					state.lab_staffs = lab_staffs
					state.team_leaders = team_leaders
				})
		},
		// 获取数据列表
		getDataArray(state, payload = {}) {
			state.showFormLoading = false
			const params = {
				team_name: state.keyword,
				page: payload.page,
				page_size: payload.page_size
			}
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
		},
		// 新建保存
		onSaveAction(state, payload) {
			const { finishCallback = () => { } } = payload

			const params = { ...state.createNew, member_ids: state.createNew.member_ids.join(',') }
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
			const { team_id = 0, team_name = '', team_leader_id = 0, user_list = [] } = payload
			const member_ids = []

			for (const user of user_list) {
				const { user_id = 0 } = user
				member_ids.push(user_id)
			}
			state.createNew = {
				id: team_id,
				team_name: team_name,
				leader_id: team_leader_id,
				member_ids: member_ids
			}
		},
		// 修改保存
		onUpdateAction(state, payload) {
			const { finishCallback = () => { } } = payload
			const { id = '', team_name = '', leader_id = '', member_ids = [] } = state.createNew
			const params = {
				id: id,
				team_name: team_name,
				leader_id: leader_id,
				member_ids: member_ids.join(',')
			}
			updateDataRequest(params)
				.then(() => {
					state.createFormVisible = false
					finishCallback()
				})
		},

		// 改变状态
		onChangeStateAction(state, payload) {
			const { id, status, finishCallback = () => { } } = payload
			const params = {
				id: id,
				status: status
			}
			changeStateRequest(params)
				.then(() => {
					finishCallback()
				})
		},

		// 删除
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


export default labteam
