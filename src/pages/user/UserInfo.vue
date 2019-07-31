<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入姓名或账号"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleSearchAction"
      />
      <el-select
        v-model="rolekey"
        placeholder="用户角色"
        clearable
        style="margin-left:10px; width: 200px,min-height:90px"
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
      <el-table-column label="账户" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyUserInfo(row)">{{ row.account }}</span>
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
        min-width="200px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" plain @click="modifyUserInfo(row)">修改</el-button>
          <el-button size="mini" type="danger" plain @click="deleteUser(row)">删除</el-button>
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
        :rules="validations"
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
        <el-form-item label="密码" prop="password">
          <el-input v-model="user.password" style="width: 220px;" placeholder="用户登录密码" />
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
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态" prop="status">
          <el-select
            v-model="user.state.key"
            class="filter-item"
            placeholder="设置用户状态"
            style="width: 220px;"
          >
            <el-option
              v-for="item in statusOption"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            />
          </el-select>
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

const key = 'e7e4e52e7b878f64076873dc495eead9'
const userString = localStorage.getItem(key) || '{}'
const user = JSON.parse(userString) || {}

const defaultRole = { key: '3', value: '实验人员' }
const defaultState = { key: 'enable', value: '正常' }

const request = webcore.common.utils.NetUtil.adminRequest
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

const List = []

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment',
			username: '小刘刘',
			account: '18168896116',
			'role|1': [
				{ key: '1', value: '院长' },
				{ key: '2', value: '实验组长' },
				{ key: '3', value: '实验人员' }
			],
			'state|1': [
				{ key: 'disable', value: '已禁用' },
				{ key: 'enable', value: '正常' }
			],
			datetime: +Mock.Random.date('T'),
			author: '@first',
			reviewer: '@first',
			title: '@title(5, 10)',
			content_short: 'mock data',
			forecast: '@float(0, 100, 2, 2)',
			importance: '@integer(1, 3)',
			'type|1': ['CN', 'US', 'JP', 'EU'],

			display_time: '@datetime',
			comment_disabled: true,
			pageviews: '@integer(300, 5000)',
			platforms: ['a-platform']
		})
	)
}

export default {
	name: 'UserInfo',
	components: { Pagination },
	directives: { waves },
	filters: {
		userStateFilter(status) {
			// 用户账号状态颜色
			const stateOption = {
				enable: 'success',
				disable: 'danger'
			}
			return stateOption[status]
		}
	},
	data() {
		return {
			keyword: '' /** 搜索条件 */,
			rolekey: '' /** 搜索条件角色 */,
			roleOptions: [
				{ key: '1', value: '院长' },
				{ key: '2', value: '实验组长' },
				{ key: '3', value: '实验人员' }
			],
			statusOption: [
				{ key: 'disable', value: '禁用账户' },
				{ key: 'enable', value: '启用账户' }
			],
			user: {
				/** 新建用户模板 */
				username: '',
				account: '',
				password: '',
				role: defaultRole,
				state: defaultState
			},

			validations: {
				username: [
					{ required: true, message: '请填写用户姓名', trigger: 'change' }
				],
				account: [
					{ required: true, message: '请填写用户账户', trigger: 'change' }
				],
				role: [
					{ required: true, message: '请选择用户角色', trigger: 'change' }
				],
				state: [
					{ required: true, message: '请设置账户状态', trigger: 'change' }
				]
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
		initUser() {
			this.user = {
				/** 新建用户模板 */
				username: '',
				account: '',
				password: '',
				role: defaultRole,
				state: defaultState
			}
		},
		/** 新建用户 */
		createUserAction() {
			this.initUser()
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
		handleFilter() {
			this.listQuery.page = 1
			this.getList()
		}
	}
}
</script>
