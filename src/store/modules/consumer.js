/**
 * 人员列表的用户
 */
import { saveData as saveDataRequest, getDataList as getDataListRequest } from '../../api/consumer'
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
	role_type: 'lab_staff'
}
/**
 * 验证新建表单
 */
const validation = {
	/** 验证验证*/
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
	}
}
/**
 * 账号状态
 */
const statusOption = [
	{ key: 'disable', value: '已禁用' },
	{ key: 'enable', value: '正常' }
]

const consumer = {
	namespaced: true,
	state: {
		keyword: '', /** 搜索条件 */
		roleType: '', /** 搜索条件角色 */
		createFormVisible: false, /** 新建弹出层的显示或隐藏 */
		createFormStatus: '', // form类型 create or update
		showFormLoading: false, // 表单加载动画
		user: createTemplate, // 新建&修改用户信息对象
		validation: validation, // 验证器
		roleOptions: roleOptions, // 角色枚举
		statusOption: statusOption, // 账号枚举
		pageMap: page, // 分页对象
		userList: []// 用户列表数据

	},
	/**
     * 更改state的方法
     */
	mutations: {
		// 新建动作
		onCreateAction(state) {
			state.createFormVisible = true
			state.createFormStatus = 'create'
			state.user = createTemplate
		},
		// 新建保存
		onSaveAction(state) {
			const params = state.user
			saveDataRequest(params)
				.then(response => {
					console.log(response)
					state.createFormVisible = false
				})
		},
		// 获取数据列表
		getDataArray(state, payload = {}) {
			console.log(payload)
			state.showFormLoading = false
			const params = {
				user_name: state.keyword,
				login_name: state.keyword,
				phone: state.keyword,
				role_type: state.roleType,
				...payload
			}
			getDataListRequest(params)
				.then(response => {
					console.log(response)
					const { data = [], total = 0, per_page = 10, current_page = 1 } = response.data || {}
					state.showFormLoading = false
					state.userList = data
					state.pageMap = {
						total: total,
						per_page: per_page, // 每页多少显示多少条数据
						current_page: current_page// 当前第几页
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
		onCreateAction(context, payload = {}) {
			context.commit('onCreateAction', payload)
		},
		onSaveAction(context, payload = {}) {
			context.commit('onSaveAction', payload)
		},
		getDataArray(context, payload = {}) {
			context.commit('getDataArray', payload)
		}
	}
}


export default consumer
