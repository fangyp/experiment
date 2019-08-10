/**
 * 人员列表的用户
 */
import { preloadData as preloadDataRequest, saveData as saveDataRequest, getDataList as getDataListRequest } from '../../api/consumer'
import { updateData as updateDataRequest, changeState as changeStateRequest } from '../../api/consumer'
import { modifyPassword as modifyPasswordRequest, deleteUser as deleteUserRequest } from '../../api/consumer'
import { validPhone, isPassword } from '../../utils/validate'
import { page } from '../../utils/page'

/**
* 角色
*/
const roleOptions = [
	{ key: 'dean', value: '院长' },
	{ key: 'team_leader', value: '实验组长' },
	{ key: 'lab_staff', value: '实验员' }
]

/** 新建模板 */
const createTemplate = {
	user_name: '', // 用户姓名
	login_name: '', // 登录账号
	phone: '', // 手机号码
	password: '', // 密码
	password_confirmation: '', // 确认密码
	role_type: ''
}
/**
 * 表单标题
 */
const formTitles = {
	update: '修改用户',
	create: '新建用户',
	password: '修改密码'
}
/**
 * 验证表单
 */
const validation = {
	/** 新建验证*/
	create: {
		user_name: [
			{ required: true, message: '请填写用户姓名', trigger: 'blur' }
		],
		login_name: [
			{ required: true, message: '请填写用户账户', trigger: 'blur' }
		],
		phone: [
			{ required: true, message: '请填写手机号码', trigger: 'blur' },
			{ validator: validPhone, trigger: 'blur' }
		],
		password: [
			{ required: true, message: '请设置用户密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		],
		password_confirmation: [
			{ required: true, message: '请输入确认密码', trigger: 'blur' },
			{ min: 6, max: 16, message: '密码长度在6到16位之间', trigger: 'blur' },
			{ validator: isPassword, trigger: 'blur' }
		],
		role_type: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
	},
	/** 更新验证 */
	update: {
		user_name: [
			{ required: true, message: '请填写用户姓名', trigger: 'blur' }
		],
		login_name: [
			{ required: true, message: '请填写用户账户', trigger: 'blur' }
		],
		phone: [
			{ required: true, message: '请填写手机号码', trigger: 'blur' },
			{ validator: validPhone, trigger: 'blur' }
		],
		role_type: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
	},
	/** 修改面膜 */
	password: {
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

const consumer = {
	namespaced: true,
	state: {
		keyword: '', /** 搜索条件 */
		role_type: '', /** 搜索条件角色 */
		createFormVisible: false, /** 新建弹出层的显示或隐藏 */
		createFormStatus: '', // form类型 create or update
		showFormLoading: false, // 表单加载动画
		user: { ...createTemplate }, // 新建&修改用户信息对象
		validation: validation, // 验证器
		roleOptions: roleOptions, // 角色枚举
		pageMap: page, // 分页对象
		userList: [], // 用户列表数据
		formTitles: formTitles, // 表达标题
		tableKey: 0// 听说管刷新的

	},
	/**
  * store的计算属性
  */
	getters: {
		/**
		 * 这里的state是当前类的state
		 * @param {*} state
		 */
		getStateCount: function(state) {
			return 100 + 100
		}
	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 获取预加载项目
		onPreloadAction(state, payload = {}) {
			preloadDataRequest()
				.then(response => {
					// const { data = [] } = response.data || {}
				})
		},
		// 获取数据列表
		getDataArray(state, payload = {}) {
			state.showFormLoading = false
			const params = {
				user_name: state.keyword,
				role_type: state.role_type,
				page: payload.page,
				page_size: payload.page_size
			}
			getDataListRequest(params)
				.then(response => {
					const { data = [], total = 0, per_page = 10, current_page = 1 } = response.data || {}
					state.showFormLoading = false
					state.userList = data
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
			state.user = { ...createTemplate }
		},
		// 新建保存
		onSaveAction(state, payload) {
			const { finishCallback = () => { } } = payload

			const params = state.user
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
		// 修改密码
		onModifyPassAction(state, payload) {
			state.createFormVisible = true
			state.createFormStatus = 'password'
			state.user = { ...payload }
		},
		onUpdatePasword(state) {
			const { user_id = '', password = '', password_confirmation = '' } = state.user
			const params = {
				id: user_id,
				password: password,
				password_confirmation: password_confirmation
			}
			modifyPasswordRequest(params)
				.then(() => {
					state.createFormVisible = false
				})
		},
		// 删除用户
		onDeleteAction(state, payload) {
			const { id, finishCallback = () => { } } = payload
			const params = {
				id: id
			}
			deleteUserRequest(params)
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
		onModifyPassAction(context, payload = {}) {
			context.commit('onModifyPassAction', payload)
		},
		onUpdatePasword(context, payload = {}) {
			context.commit('onUpdatePasword', payload)
		},
		onDeleteAction(context, payload = {}) {
			context.commit('onDeleteAction', payload)
		}

	}
}


export default consumer
