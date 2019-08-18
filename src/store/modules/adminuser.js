/**
 * 人员列表的用户
 */
import { getDataList as getDataListRequest, changeState as changeStateRequest } from '../../api/adminuser'
import { modifyPassword as modifyPasswordRequest, deleteData as deleteDataRequest } from '../../api/adminuser'
import { isPassword } from '../../utils/validate'
import { page } from '../../utils/page'

/** 新建模板 */
const createTemplate = {
	password: '', // 密码
	password_confirmation: '' // 确认密码
}

/**
 * 表单标题
 */
const formTitles = {
	modify: '修改密码'
}
/**
 * 验证表单
 */
const validation = {
	/** 修改密码*/
	modify: {
		password: [
			{ required: true, message: '请设置用户密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		],
		password_confirmation: [
			{ required: true, message: '请输入确认密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		]
	}
}

const labteam = {
	namespaced: true,
	state: {
		keyword: '', /** 搜索条件 */
		createFormVisible: false, /** 新建弹出层的显示或隐藏 */
		createFormStatus: 'modify', // form类型 create or update
		createNew: { ...createTemplate }, // 新建&修改对象
		showFormLoading: false, // 表单加载动画
		validation: validation, // 验证器
		pageMap: page, // 分页对象
		dataList: [], // 数据列表
		formTitles: formTitles, // 表单标题
		tableKey: 0 // 听说管刷新的
	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 获取数据列表
		getDataArray(state, payload = {}) {
			state.showFormLoading = false
			const params = {
				keywrods: state.keyword,
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

		// 修改动作
		onModifyAction(state, payload) {
			state.createFormVisible = true
			state.createNew = { ...createTemplate, ...payload }
		},
		// 修改保存
		onUpdateAction(state, payload) {
			const { finishCallback = () => { } } = payload
			const { user_id = '', password = '', password_confirmation = '' } = state.createNew
			const params = {
				id: user_id,
				password: password,
				password_confirmation: password_confirmation
			}
			modifyPasswordRequest(params)
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
