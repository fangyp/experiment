<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input
				v-model="keyword"
				placeholder="请输入姓名或账号"
				style="width: 200px;"
				class="filter-item"
				clearable
				@keyup.enter.native="searchAction"
			/>
			<el-button
				v-waves
				class="filter-item"
				type="primary"
				icon="el-icon-search"
				style="margin-left:10px; width: 120px"
				@click="searchAction"
			>搜索</el-button>
		</div>

		<el-table
			:key="tableKey"
			v-loading="showFormLoading"
			:data="dataList"
			border
			fit
			highlight-current-row
			style="width: 100%;"
		>
			<el-table-column label="编号" prop="id" align="center" min-width="40px">
				<template slot-scope="{row}">
					<span>{{ row.user_id }}</span>
				</template>
			</el-table-column>
			<el-table-column label="姓名" min-width="75px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.user_name }}</span>
				</template>
			</el-table-column>
			<el-table-column label="账户" min-width="75px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.login_name }}</span>
				</template>
			</el-table-column>
			<el-table-column label="权限组" min-width="90px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.groups }}</span>
				</template>
			</el-table-column>
			<el-table-column label="最后登录日期" min-width="120px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.last_login_time}}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" class-name="status-col" min-width="70px">
				<template slot-scope="{row}">
					<el-tag :type="row.user_status | stateColorFilter">{{ row.user_status_formatted }}</el-tag>
				</template>
			</el-table-column>

			<el-table-column
				label="操作"
				align="center"
				min-width="75px"
				class-name="small-padding fixed-width"
			>
				<template slot-scope="{row}">
					<el-dropdown trigger="click">
						<span class="el-dropdown-link">
							更多
							<i class="el-icon-arrow-down el-icon--right" />
						</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item
								v-show="row.can_lock"
								@click.native="changeState(row)"
							>{{ row.user_status|stateTextFilter }}</el-dropdown-item>
							<el-dropdown-item v-show="row.can_stop" @click.native="stopAccount(row)">停用管理员</el-dropdown-item>
							<el-dropdown-item @click.native="modifyPassAction(row)">修改密码</el-dropdown-item>
							<el-dropdown-item v-show="row.can_stop" @click.native="deleteData(row)">删除管理员</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</template>
			</el-table-column>
		</el-table>
		<pagination
			v-show="pageMap.total>10"
			:total="pageMap.total"
			:page.sync="pageMap.page"
			:limit.sync="pageMap.page_size"
			@pagination="getDataList"
		/>

		<el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
			<el-form
				ref="createForm"
				:rules="validation[createFormStatus]"
				:model="createNew"
				label-position="left"
				label-width="100px"
				style="width: 400px; margin-left:10px;"
			>
				<el-form-item label="登录密码" prop="password">
					<el-input
						v-model="createNew.password"
						style="width: 220px;"
						show-password
						placeholder="管理员登录密码"
					/>
				</el-form-item>
				<el-form-item label="确认密码" prop="password_confirmation">
					<el-input
						v-model="createNew.password_confirmation"
						show-password
						style="width: 220px;"
						placeholder="管理员登录密码"
					/>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="medium" @click="createFormVisible = false">取消</el-button>
				<el-button size="medium" type="primary" @click="onSavePassword()">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { page } from '../../utils/page'
import poppyjs from 'poppyjs-elem'
const showConfirm = poppyjs.html.Dialog.showConfirm
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination

import { mapState } from 'vuex'

export default {
	name: 'AdminUser',
	components: { Pagination },
	directives: { waves },
	filters: {
		// 状态颜色
		stateColorFilter(status) {
			const stateOption = {
				1: 'success',
				2: 'warning',
				3: 'danger'
			}
			return stateOption[status]
		},
		/**
     * 状态文本
     */
		stateTextFilter(status) {
			const option = {
				1: '禁用管理员',
				2: '启用管理员'
			}
			return option[status]
		}
	},

	computed: {
		...mapState({
			validation: state => state.adminuser.validation,
			createFormStatus: state => state.adminuser.createFormStatus,
			showFormLoading: state => state.adminuser.showFormLoading,
			createNew: state => state.adminuser.createNew,
			dataList: state => state.adminuser.dataList,
			formTitles: state => state.adminuser.formTitles,
			tableKey: state => state.adminuser.tableKey
		}),
		keyword: {
			get() {
				return this.$store.state.adminuser.keyword
			},
			set(val) {
				this.$store.state.adminuser.keyword = val
			}
		},
		createFormVisible: {
			get() {
				return this.$store.state.adminuser.createFormVisible
			},
			set(val) {
				this.$store.state.adminuser.createFormVisible = val
			}
		},
		pageMap: {
			get() {
				return this.$store.state.adminuser.pageMap
			},
			set(val) {
				this.$store.state.adminuser.pageMap = val
			}
		}
	},
	created() {
		this.getDataList()
	},

	methods: {
		/**
     * 获取列表
     */
		getDataList(pageMap = page) {
			this.pageMap = { ...this.pageMap, ...pageMap }
			this.$store.dispatch('adminuser/getDataArray', {
				page: this.pageMap.page,
				page_size: this.pageMap.page_size
			})
		},

		/**
     * 搜索
     */
		searchAction() {
			this.$store.dispatch('adminuser/getDataArray', {
				page: this.pageMap.page,
				page_size: this.pageMap.page_size
			})
		},

		/**
     * 改变状态
     */
		changeState(row) {
			const { user_id = '', user_status = 1 } = row
			let status = 0
			let statuskey = ''
			let formatted = ''
			if (user_status === 1) {
				// 正常账户 要锁定
				status = 2
				formatted = '锁定'
				statuskey = 'locked'
			} else if (user_status === 2) {
				// 锁定账户 要解锁
				status = 1
				formatted = '正常'
				statuskey = 'normal'
			}

			const payload = {
				id: user_id,
				status: status,
				statuskey: statuskey,
				formatted: formatted,
				finishCallback: () => this.getDataList(this.pageMap)
			}

			this.$store.dispatch('adminuser/onChangeStateAction', payload)
		},

		stopAccount(row) {
			const options = {
				title: '停用用户',
				msg: '停用后不可恢复,不可登录,您确定要停用此用户吗?',
				yesBtn: '确定',
				noBtn: '取消',
				yesCallback: () => {
					const { user_id = '' } = row
					const payload = {
						id: user_id,
						status: -1,
						statuskey: 'invalid',
						formatted: '停用',
						finishCallback: () => this.getDataList(this.pageMap)
					}
					this.$store.dispatch('adminuser/onChangeStateAction', payload)
				},
				noCallback: () => {}
			}
			showConfirm(options)
		},

		/**
     * 修改密码
     */
		modifyPassAction(row) {
			this.$store.dispatch('adminuser/onModifyAction', row)
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/** 更新密码 */
		onSavePassword() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					const payload = {
						finishCallback: () => this.logout()
					}
					this.$store.dispatch('adminuser/onUpdateAction', payload)
					this.$nextTick(() => {
						this.$refs['createForm'].clearValidate()
					})
				}
			})
		},
		async logout() {
			await this.$store.dispatch('user/logout')
			this.$router.push(`auth/login?redirect=${this.$route.fullPath}`)
		},
		/**
     * 删除
     */
		deleteData(row) {
			const options = {
				title: '删除管理员',
				msg: '删除后不可恢复,您确定删除此管理员吗?',
				yesBtn: '确定',
				noBtn: '取消',
				yesCallback: () => {
					const { user_id = '' } = row
					const payload = {
						id: user_id,
						finishCallback: () => this.getDataList(this.pageMap)
					}
					this.$store.dispatch('adminuser/onDeleteAction', payload)
				},
				noCallback: () => {}
			}
			showConfirm(options)
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
