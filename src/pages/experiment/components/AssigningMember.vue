<template>
	<el-dialog
		title="分配实验人员"
		:visible.sync="visible"
		:modal="true"
		width="300px"
		top="6vh"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:destroy-on-close="true"
		:before-close="handleClose"
	>
		<div class="note-block">温馨提示：点击想要分配的人员即可设置</div>
		<el-table :data="userList" style="width: 100%" :show-header="false" empty-text="无可分配人员" @row-click="tapUser">
			<el-table-column prop="user_name"/>
		</el-table>
	</el-dialog>
</template>

<script>
import experimentApi from '@/api/experiment'

export default {
	name: 'AssigningMember',
	props: {
		visible: {
			type: Boolean,
			default: true
		},
		experimentId: {
			type: String,
			default: null
		},
		testing: {
			type: Object,
			default: null
		},
		closeCallback: {
			type: Function,
			default: null
		},
		confirmCallback: {
			type: Function,
			default: null
		}
	},
	data() {
		return {
			userList: []
		}
	},

	watch: {
		visible(newVal, oldVal) {
			if (newVal !== oldVal && newVal === true) {
				this.searchUsers()
			}
		}
	},

	methods: {
		// 查询可用人员
		searchUsers() {
			experimentApi.listaAssignableUsers(this.experimentId).then((resp) => {
				this.userList = resp.data
			})
		},

		handleClose() {
			if (this.closeCallback != null) {
				this.closeCallback(false)
			}
		},

		// 提交保存的基本方法
		tapUser(row, column, event) {
			const self = this

			experimentApi.assign(this.experimentId, row.user_id).then((resp) => {
				if (self.confirmCallback != null) {
					self.confirmCallback(resp.data)
				}
			})
		}
	}
}
</script>

<style lang="scss">
</style>
