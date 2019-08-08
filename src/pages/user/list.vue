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
        v-model="roleType"
        placeholder="用户角色"
        clearable
        style="margin-left:10px; width: 240px,min-height:90px"
        class="filter-item"
      >
        <!-- <el-option
          v-for="item in roleOptions"
          :key="item.key"
          :label="item.vlaue"
          :value="item.key"
        />-->
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
        @click="createAction"
      >新增用户</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="showFormLoading"
      element-loading-text="给我一点时间"
      :data="userList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" min-width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="95px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户" min-width="95px" align="center">
        <template slot-scope="{row}">
          <span @click="createAction(row)">{{ row.login_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机" min-width="95px" align="center">
        <template slot-scope="{row}">
          <span @click="createAction(row)">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="75px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role_type_formatted }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" min-width="90px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.reg_time | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="60px">
        <template slot-scope="{row}">
          <el-tag :type="row.user_status | stateColorFilter">{{ row.user_status_formatted }}</el-tag>
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
              <el-dropdown-item @click.native="createAction(row)">修改信息</el-dropdown-item>
              <!-- <el-dropdown-item @click.native="changeState(row)">{{ row.state.key|userStateText }}</el-dropdown-item> -->
              <el-dropdown-item @click.native="deleteUser(row)">删除用户</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="pageMap.total>0"
      :total="pageMap.total"
      :page.sync="pageMap.current_page"
      :limit.sync="pageMap.per_page"
      @pagination="getDataList"
    />

    <el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
      <el-form
        ref="createForm"
        :rules="validation[createFormStatus]"
        :model="user"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:10px;"
      >
        <el-form-item label="用户姓名" prop="user_name">
          <el-input v-model="user.user_name" style="width: 220px;" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item label="登录账号" prop="login_name">
          <el-input v-model="user.login_name" style="width: 220px;" placeholder="设置登录账号" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="user.phone" style="width: 220px;" placeholder="用户手机号码" />
        </el-form-item>
        <el-form-item label="用户角色" prop="role_type">
          <el-select
            v-model="user.role_type"
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
        <el-form-item v-show="createFormStatus==='create'" label="登录密码" prop="password">
          <el-input
            v-model="user.password"
            style="width: 220px;"
            show-password
            placeholder="设置登录密码"
          />
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'"
          label="确认密码"
          prop="password_confirmation"
        >
          <el-input
            v-model="user.password_confirmation"
            style="width: 220px;"
            show-password
            placeholder="确认登录密码"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="createFormVisible = false">取消</el-button>
        <el-button
          size="medium"
          type="primary"
          @click="createFormStatus==='create'?onSaveUserAction():updateUserData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page } from '../../utils/page'

import poppyjs from 'poppyjs-elem'
import webcore from '../../webcore'
const showConfirm = poppyjs.html.Dialog.showConfirm
const showToast = poppyjs.html.Dialog.showMessage

import { getUserInfo } from '../../utils/auth'
const user = getUserInfo()
console.log(user)

const request = webcore.common.utils.NetUtil.adminRequest
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

const List = []

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment', // 用户编号
			account: 'liuxiaoxiao', // 账户
			username: '老刘', // 姓名
			phone: '18168896116', // 手机
			'role|1': [
				{ key: 'dean', value: '院长' },
				{ key: 'team_leader', value: '实验组长' },
				{ key: 'lab_staff', value: '实验员' }
			], // 角色
			'state|1': [
				{ key: 'disable', value: '已禁用' },
				{ key: 'enable', value: '正常' }
			], // 账号状态
			datetime: +Mock.Random.date('T')
		})
	)
}

import { mapState } from 'vuex'

export default {
	name: 'Consumer',
	components: { Pagination },
	directives: { waves },

	filters: {
		// 状态颜色
		stateColorFilter(status) {
			const stateOption = {
				'1': 'success',
				'2': 'warning',
				'3': 'danger'
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
			formTitles: {
				update: '修改用户',
				create: '新增用户'
			},

			tableKey: 0,
			showLoading: true
		}
	},

	computed: {
		...mapState({
			keyword: state => state.consumer.keyword,
			roleType: state => state.consumer.roleType,
			user: state => state.consumer.user,
			validation: state => state.consumer.validation,
			createFormStatus: state => state.consumer.createFormStatus,
			showFormLoading: state => state.consumer.showFormLoading,
			statusOption: state => state.consumer.statusOption,
			roleOptions: state => state.consumer.roleOptions,
			pageMap: state => state.consumer.pageMap,
			userList: state => state.consumer.userList
		}),
		createFormVisible: {
			get() {
				return this.$store.state.consumer.createFormVisible
			},
			set(val) {
				this.$store.state.consumer.createFormVisible = val
			}
		}
	},
	created() {
		this.getDataList()
	},

	methods: {
		// 新建动作
		createAction() {
			this.$store.dispatch('consumer/onCreateAction')
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		// 新建保存
		onSaveUserAction() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					if (this.user.password !== this.user.password_confirmation) {
						return showToast('俩次密码输入不一致')
					} else {
						this.$nextTick(() => {
							this.$refs['createForm'].clearValidate()
						})
						this.$store.dispatch('consumer/onSaveAction')
					}
				}
			})
		},
		/**
     * 获取列表
     */
		getDataList(pageMap = page) {
			console.log(pageMap)
			this.$store.dispatch('consumer/getDataArray', pageMap)
		},

		/**
     * 修改
     */
		modifyInfo(row) {
			this.user = Object.assign({}, row) // copy obj
			this.createFormStatus = 'update'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 搜索
     */
		handleSearchAction() {
			console.log(this.keyword)
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
