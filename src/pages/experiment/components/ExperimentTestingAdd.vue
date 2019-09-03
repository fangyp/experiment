<template>
	<!-- 测试记录新增/编辑弹出框 -->
	<el-dialog
		:title="null == testing?'添加测试记录':'编辑测试记录'"
		:visible.sync="visible"
		:modal="true"
		width="700px"
		top="6vh"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:destroy-on-close="true"
		:before-close="handleClose"
		v-el-drag-dialog
	>
		<el-form
			ref="form"
			:rules="rules"
			:model="formData"
			label-position="left"
			label-width="100px"
			class="pad-l-lg pad-r-lg"
		>
			<el-form-item label="测试日期" prop="testing_date">
				<el-col :sm="8" :lg="6">
					<el-date-picker
						v-model="formData.testing_date"
						type="date"
						placeholder="选择日期"
						:picker-options="pickerOptions"
						format="yyyy-MM-dd"
						value-format="yyyy-MM-dd"
					/>
				</el-col>
			</el-form-item>

			<el-form-item label="测试项目" prop="testing_item">
				<el-input v-model="formData.testing_item" type="textarea" rows="5" show-word-limit />
			</el-form-item>

			<el-form-item label="测试结果" prop="testing_result">
				<el-input v-model="formData.testing_result" type="textarea" rows="6" show-word-limit />
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button size="medium" @click="handleClose">取消</el-button>
			<el-button size="medium" type="primary" @click="handleConfirm">确定</el-button>
		</div>
	</el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import experimentApi from '@/api/experiment'
import { testingRules } from '../validation_rules'

export default {
	name: 'ExperimentTesting',
	directives: { elDragDialog },
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
			formData: {
				testing_date: null,
				testing_item: null,
				testing_result: null
			},
			rules: testingRules,
			// 日期picker的配置
			pickerOptions: {
				shortcuts: [{
					text: '今天',
					onClick(picker) {
						picker.$emit('pick', new Date())
					}
				}]
			}
		}
	},

	watch: {
		testing() {
			if (this.testing !== null) {
				this.formData = {
					testing_date: this.testing.testing_date,
					testing_item: this.testing.testing_item,
					testing_result: this.testing.testing_result
				}
			}
		}
	},

	methods: {
		handleClose() {
			this.cleanup()
			if (this.closeCallback != null) {
				this.closeCallback(false)
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
		handleConfirm() {
			const self = this
			this.$refs['form'].validate(valid => {
				if (!valid) {
					return false
				}

				const params = {
					testing_date: self.formData.testing_date,
					testing_item: self.formData.testing_item,
					testing_result: self.formData.testing_result
				}

				console.log(params)

				if (this.testing === null) {
					experimentApi.addExperimentTesting(self.experimentId, params).then(function(resp) {
						self.cleanup()
						if (self.confirmCallback != null) {
							self.confirmCallback()
						}
					})
				} else {
					experimentApi.updateExperimentTesting(self.testing.testing_id, params).then(function(resp) {
						self.cleanup()
						if (self.confirmCallback != null) {
							self.confirmCallback()
						}
					})
				}
			})
		}
	}
}
</script>

<style lang="scss">
</style>
