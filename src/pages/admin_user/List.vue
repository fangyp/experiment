<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入姓名或账号"
        style="width: 240px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleSearchAction"
      />
      <el-select
        v-model="rolekey"
        placeholder="用户角色"
        clearable
        style="margin-left:10px; width: 240px,min-height:90px"
        class="filter-item"
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.key"
          :label="item.vlaue"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px; width: 120px"
        @click="handleSearchAction"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left:10px; width: 120px"
        type="primary"
        icon="el-icon-edit"
        @click="createUserAction"
      >新增用户</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="showLoading"
      :data="userList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" prop="id" align="center" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户" min-width="90px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyUserInfo(row)">{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机" min-width="110px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyUserInfo(row)">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="90px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role.value }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" min-width="95px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.datetime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="90px">
        <template slot-scope="{row}">
          <el-tag :type="row.state.key | userStateFilter">{{ row.state.value }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        min-width="100px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              更多
              <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="modifyUserInfo(row)">修改信息</el-dropdown-item>
              <el-dropdown-item @click.native="changeState(row)">{{ row.state.key|userStateText }}</el-dropdown-item>
              <el-dropdown-item @click.native="deleteUser(row)">删除用户</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="pageMap.total>0"
      :total="pageMap.total"
      :page.sync="pageMap.page"
      :limit.sync="pageMap.limit"
      @pagination="getUserList"
    />

    <el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
      <el-form
        ref="createForm"
        :rules="rules[createFormStatus]"
        :model="user"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:10px;"
      >
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="user.username" style="width: 220px;" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="登录账号" prop="account">
          <el-input v-model="user.account" style="width: 220px;" placeholder="用户登录账号" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="user.phone" style="width: 220px;" placeholder="用户手机号码" />
        </el-form-item>
        <el-form-item label="用户角色" prop="role">
          <el-select
            v-model="user.role.key"
            class="filter-item"
            placeholder="请选择角色"
            style="width: 220px;"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key"
              style="height: 35px;"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="user.password" style="width: 220px;" placeholder="用户登录密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPass">
          <el-input v-model="user.confirmPass" style="width: 220px;" placeholder="用户登录密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="createFormVisible = false">取消</el-button>
        <el-button
          size="medium"
          type="primary"
          @click="createFormStatus==='create'?createUserData():updateUserData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import poppyjs from 'poppyjs-elem'
import webcore from '../../webcore'
const isEmpty = poppyjs.util.StringUtil.isEmpty
const showConfirm = poppyjs.html.Dialog.showConfirm
// , setUserInfo, removeUserInfo
import { getUserInfo } from '../../utils/auth'
const user = getUserInfo()
console.log(user)

const request = webcore.common.utils.NetUtil.adminRequest
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

/**
 * 角色
 */
const roleOptions = [
	{ key: '1', value: '院长' },
	{ key: '2', value: '实验组长' },
	{ key: '3', value: '实验人员' }
]
/**
 * 账号状态
 */
const statusOption = [
	{ key: 'disable', value: '已禁用' },
	{ key: 'enable', value: '正常' }
]

const defaultRole = { key: '3', value: '实验人员' }

/** 新建模板 */
const createTemplate = {
	username: '', // 姓名
	account: '', // 账号
	phone: '', // 手机号码
	password: '', // 密码
	confirmPass: '', // 确认密码
	role: defaultRole
}

const List = []

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment', // 用户编号
			account: 'liuxiaoxiao', // 账户
			username: '老刘', // 姓名
			phone: '18168896116', // 手机
			'role|1': roleOptions, // 角色
			'state|1': statusOption, // 账号状态
			datetime: +Mock.Random.date('T')
		})
	)
}

export default {
	name: 'UserInfo',
	components: { Pagination },
	directives: { waves },
	filters: {
		// 用户账号状态颜色
		userStateFilter(status) {
			const stateOption = {
				enable: 'success',
				disable: 'danger'
			}
			return stateOption[status]
		},
		/**
     * 启动&禁用账户显示文本
     */
		userStateText(status) {
			const option = {
				enable: '禁用账户',
				disable: '启用账户'
			}
			return option[status]
		}
	},
	data() {
		return {
			keyword: '' /** 搜索条件 */,
			rolekey: '' /** 搜索条件角色 */,
			roleOptions: roleOptions, // 角色
			statusOption: statusOption, // 账号状态,
			user: createTemplate /** 新建用户模板 */,

			rules: {
				/** 验证验证*/
				create: {
					username: [
						{ required: true, message: '请填写用户姓名', trigger: 'blur' }
					],
					account: [
						{ required: true, message: '请填写用户账户', trigger: 'blur' }
					],
					phone: [
						{ required: true, message: '请填写手机号码', trigger: 'blur' }
					],
					password: [
						{ required: true, message: '请设置用户密码', trigger: 'blur' }
					],
					confirmPass: [
						{ required: true, message: '请输入确认密码', trigger: 'blur' }
					],
					role: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
				},
				/** 更新验证 */
				update: {
					username: [
						{ required: true, message: '请填写用户姓名', trigger: 'blur' }
					],
					account: [
						{ required: true, message: '请填写用户账户', trigger: 'blur' }
					],
					phone: [
						{ required: true, message: '请填写手机号码', trigger: 'blur' }
					],
					password: [
						{
							required: false,
							min: 6,
							message: '密码至少6个字符',
							trigger: 'blur'
						}
					],
					confirmPass: [
						{
							required: false,
							min: 6,
							message: '密码至少6个字符',
							trigger: 'blur'
						}
					],
					role: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
				}
			},

			createFormVisible: false /** 新建&修改用户信息弹出层的显示或隐藏 */,
			createFormStatus: '' /** create or update 标记是新增用户还是修改用户 */,
			formTitles: {
				update: '修改用户',
				create: '新增用户'
			},

			tableKey: 0,
			userList: [],
			showLoading: true,
			pageMap: {
				page: 0,
				limit: 10,
				total: 0
			}
		}
	},
	created() {
		this.getUserList()
	},

	methods: {
		/**
     * 获取用户列表
     */
		getUserList(pageMap) {
			if (!pageMap) pageMap = this.pageMap
			this.showLoading = true
			this.userList = []
			this.userList = List.slice(
				pageMap.page * pageMap.limit,
				pageMap.page * pageMap.limit + pageMap.limit
			)
			console.log(pageMap.page * pageMap.limit + '----------' + pageMap.limit)
			// console.log( pageMap.page * pageMap.limit +'----------'+(pageMap.page * pageMap.limit + pageMap.page * pageMap.limit));
			this.pageMap.total = List.length
			setTimeout(() => {
				this.showLoading = false
			}, 1000)
		},

		/**
     * 搜索
     */
		handleSearchAction() {
			console.log(this.keyword)
			console.log(this.rolekey)
		},
		/** 新建用户 */
		createUserAction() {
			this.user = createTemplate
			this.createFormStatus = 'create'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 创建用户
     */
		createUserData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.user)
					if (isEmpty(this.user.password)) {
						console.log('密码不能为空')
					}
					const options = {
						url: '/user/create',
						method: 'POST',
						params: {
							...this.user,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '创建用户成功',
						type: 'success',
						duration: 2000
					})
				}
			})
		},

		/**
     * 修改用户
     */
		modifyUserInfo(row) {
			this.user = Object.assign({}, row) // copy obj
			this.createFormStatus = 'update'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 确定修改用户消息
     */
		updateUserData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.user)
					const options = {
						url: '/user/update',
						method: 'POST',
						params: {
							...this.user,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '用户消息修改成功',
						type: 'success',
						duration: 2000
					})
				}
			})
		},
		/**
     * 删除用户
     */
		deleteUser(row) {
			console.log(row)

			const options = {
				title: '删除用户',
				msg: '确定删除此用户吗?',
				yesBtn: '确定',
				noBtn: '取消',
				yesCallback: () => {
					console.log(this.user)
					const options = {
						url: '/user/delete',
						method: 'POST',
						params: {
							...this.user,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '用户删除成功',
						type: 'success',
						duration: 2000
					})
				},
				noCallback: () => {}
			}

			showConfirm(options)
		},

		getList() {
			this.showLoading = true
			this.list = List
			this.total = List.length
			setTimeout(() => {
				this.showLoading = false
			}, 1.5 * 1000)
		},
		/**
     * 改变用户状态
     */
		changeState(row) {
			console.log(row)
		}
	}
}
</script>
<style>
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
