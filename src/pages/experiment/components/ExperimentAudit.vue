<template>
	<el-dialog
		title="审核实验"
		:visible.sync="visible"
		:modal="true"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:destroy-on-close="true"
		:before-close="handleClose"
	>
		<el-form ref="form" :rules="rules" :model="formData" label-position="left" label-width="80px">
			<el-form-item label="审核结果" prop="result">
				<el-radio-group v-model="formData.result">
					<el-radio label="passed">审核通过</el-radio>
					<el-radio label="reject">审核驳回</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="审核说明" prop="desc">
				<el-input v-model="formData.desc" type="textarea" rows="4" maxlength="100" show-word-limit />
			</el-form-item>

			<div class="note-block">温馨提示：实验审核通过后，实验数据会变更为“完成”状态，数据内容不允许再修改。</div>
			<el-col v-if="undefined !== formData.result && formData.result !== null" :span="24" class="mg-t-sm">
				<el-alert v-if="formData.result === 'passed'" title="审核通过" type="success" center />
				<el-alert v-else title="审核驳回" type="error" center />
			</el-col>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button size="medium" @click="handleClose">取消</el-button>
			<el-button size="medium" type="primary" @click="handleConfirm">确定</el-button>
		</div>
	</el-dialog>
</template>

<script>
import experimentApi from '@/api/experiment'

export default {
	name: 'ExperimentAudit',
	props: {
		visible: {
			type: Boolean,
			default: true
		},
		experiment: {
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
			isSelfVisible: false,
			formData: {
				result: null,
				desc: ''
			},

			rules: {
				result: [
					{ required: true, message: '请选择审核结果', trigger: 'blur' },
					{
						type: 'enum',
						enum: ['passed', 'reject'],
						message: '审核结果选择不正确',
						trigger: 'blur'
					}
				],
				desc: [{ max: 100, message: '100字以内', trigger: 'blur' }]
			}
		}
	},

	methods: {
		// 显示新增测试记录弹框
		handleConfirm(event) {
			this.submit()
		},

		handleClose() {
			this.cleanup()
			if (this.closeCallback != null) {
				this.closeCallback()
			}
		},

		// 善后处理
		cleanup() {
			this.formData = {}
			this.$nextTick(() => {
				this.$refs['form'].clearValidate()
			})
		},

		// 提交保存的基本方法
		submit() {
			const self = this
			this.$refs['form'].validate(valid => {
				if (!valid) {
					return false
				}
				if (self.experiment === null) {
					return
				}

				const params = {
					status: self.formData.result,
					desc: self.formData.desc
				}

				experimentApi.audit(self.experiment.experiment_id, params).then(function(resp) {
					self.cleanup()
					if (self.confirmCallback != null) {
						self.confirmCallback()
					}
				})
			})
		}
	}
}
</script>

<style lang="scss">
</style>
