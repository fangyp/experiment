<template>
	<div class="app-container">
		<!-- 页面主体 -->
		<el-row>
			<el-col :sm="24" :lg="24" :xl="24">
				<!-- 工具栏 -->
				<el-card shadow="never">
					<el-form ref="baseForm" :inline="true" size="mini" label-width="80px">
						<el-form-item label="实验类型">{{ experiment.experiment_type_formatted }}</el-form-item>
						<el-form-item label="日期">{{ experiment.experiment_date }}</el-form-item>
						<el-form-item style="float:right">
							<el-button type="primary" size="small">提交审核</el-button>
						</el-form-item>
					</el-form>

				</el-card>
			</el-col>
		</el-row>


		<el-tabs type="card" tab-position="top" style="margin-top: 20px;">

			<!-- 基本信息Tab -->
			<el-tab-pane label="基本信息">
				<el-row style="margin-top: 15px;">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm" :inline="true" :model="baseForm" :rules="validationRules" label-position="top" size="mini" label-width="80px">
							<el-form-item label="实验名称" prop="experiment_name">
								<el-input v-model="baseForm.experiment_name" maxlength="20" />
							</el-form-item>
							<el-form-item label="实验编号" prop="experiment_no">
								<el-input v-model="baseForm.experiment_no" />
							</el-form-item>
							<el-form-item label="温度℃" prop="temperature">
								<el-input v-model.number="baseForm.temperature" />
							</el-form-item>
							<el-form-item label="湿度RH%" prop="humidity">
								<el-input v-model.number="baseForm.humidity" />
							</el-form-item>
						</el-form>
					</el-col>
				</el-row>

				<el-divider />
				<el-row :gutter="10">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm" :model="baseForm" :rules="validationRules" label-position="top" size="mini" label-width="80px">
							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="实验目的" prop="purpose">
									<el-input v-model="baseForm.purpose" type="textarea" :rows="4" placeholder="请输入实验目的" />
								</el-form-item>
							</el-col>

							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="R值， NCO残留量" prop="r_nco">
									<el-input v-model="baseForm.r_nco" type="textarea" :rows="4" placeholder="请输入R值， NCO残留量" />
								</el-form-item>
							</el-col>
						</el-form>
					</el-col>
				</el-row>

				<el-divider />


				<el-divider />
				<el-row>
					<el-col :sm="24" :lg="16" :xl="16">
						<el-form ref="baseForm" :model="baseForm" :rules="validationRules" label-position="top" size="mini" label-width="80px">
							<el-form-item label="结果与结论" prop="conclusion">
								<el-input v-model="baseForm.conclusion" type="textarea" :rows="4" placeholder="结果与结论" />
							</el-form-item>
						</el-form>
					</el-col>
				</el-row>
			</el-tab-pane>

			<!-- 实验步骤和参数 Tab -->
			<el-tab-pane label="实验步骤和参数">
				<el-table
					:data="formProcedures"
					style="width: 100%;margin-bottom: 20px;"
					default-expand-all
				>

					<el-table-column prop="procedure_title" label="步骤" width="80%">

						<template slot-scope="procedure">
							<el-form label-position="left" inline class="demo-table-expand">
								<el-table
									:data="procedure.experiment_parameters"
									style="width: 100%;margin-bottom: 20px;"
									border
									default-expand-all
								>
									<el-table-column
										prop="reagent"
										label="试剂"
										width="180"
									/>
									<el-table-column
										prop="theoretical_volum"
										label="理论量/g"
									/>
									<el-table-column
										prop="actual_volum"
										label="实际量/g"
									/>
									<el-table-column
										prop="remark"
										label="备注"
									/>
									<el-table-column align="center">
										<!-- 表行的按钮 -->
										<template slot-scope="scope">
											<el-button type="primary" size="mini" icon="el-icon-plus" circle @click="appendParameter(scope.$index, scope.row)" />
											<el-button type="danger" size="mini" icon="el-icon-delete" circle @click="removeParameter(scope.$index, scope.row)" />
										</template>
									</el-table-column>
								</el-table>

							</el-form>
						</template>

					</el-table-column>

					<el-table-column align="center">
						<!-- 表头按钮 -->
						<template slot="header">
							<el-button type="primary" icon="el-icon-plus" circle @click="appendProcedure" />
						</template>

						<!-- 表行的按钮 -->
						<template slot-scope="scope">
							<el-button type="primary" size="mini" icon="el-icon-plus" circle @click="appendParameter(scope.$index, scope.row)" />
							<el-button type="danger" size="mini" icon="el-icon-delete" circle @click="removeParameter(scope.$index, scope.row)" />
						</template>
					</el-table-column>
				</el-table>

			</el-tab-pane>

			<el-tab-pane label="实验测试" />
		</el-tabs>

		<!-- 页面主体 -->

	</div>
	<!-- /.app-container -->
</template>

<script>
import poppyjs from 'poppyjs-elem'
import waves from '../../directive/waves'
// import webcore from '@/webcore'
import { updateExperiment, getExperiment } from '@/api/experiment'
import { baseRules } from './validation_rules'

export default {
	name: 'ExperimentAdd',
	directives: { waves },
	data() {
		return {
			experimentId: null,
			// 原始数据
			experiment: null,
			procedures: null,
			records: null,
			testings: null,

			baseForm: {
				experiment_name: '',
				experiment_type: '',
				experiment_no: '',
				temperature: 0,
				humidity: 0
			},
			formProcedures: [],
			formRecords: [],
			formTestings: [],

			validationRules: baseRules
		}
	},

	created: function() {
		if (this.$route.params.id !== undefined && !poppyjs.util.StringUtil.isEmpty(this.$route.params.id)) {
			this.experimentId = this.$route.params.id
		}

		if (this.experimentId === null) {
			const self = this
			poppyjs.html.Dialog.showToast('参数错误', function() {
				self.$router.go(-1)
			})
		}

		// 加载实验数据
		getExperiment(this.experimentId).then((resp) => {
			this.experiment = resp.data.experiment
			this.procedures = resp.data.procedures
			this.records = resp.data.records
			this.testings = resp.data.testings
		})
	},

	mounted: function() {
		// 触发自动保存任务
	},

	methods: {

		// 添加一行实验步骤
		appendProcedure(event, procedureId = null) {
			console.log(procedureId)
			// 如果指定 procedureId ，则在该procedureId后边添加一行
			if (procedureId === null) {
				this.formProcedures.push(this.createEmptyProcedure())
			}
			console.log(this.formProcedures)
		},

		// 移除一行实验步骤(提示确认)
		removeProcedure(event) {

		},

		// 创建一个空白步骤数据
		createEmptyProcedure(event) {
			return {
				procedure_title: 'aaaaa',
				experiment_parameters: [this.createEmptyParameter(), this.createEmptyParameter(), this.createEmptyParameter()]
			}
		},

		// 添加一行参数
		appendParameter(index, row) {
			console.log(index)
			console.log(row)
		},

		// 移除一行参数(提示确认)
		removeParameter(event, index, row) {

		},

		// 创建一个空白参数
		createEmptyParameter() {
			return {
				reagent: '',
				theoretical_volum: '',
				actual_volum: '',
				remark: ''
			}
		},


		// 显示编辑保存确认
		showEdit() {
			const self = this
			/*
			this.$nextTick(() => {
				this.$refs["createForm"].clearValidate();
			});
			*/
			poppyjs.html.Dialog.showConfirm({
				msg: '确定保存该实验吗？',
				title: '编辑实验',
				yesCallback: function() {
					self.submitUpdate(false)
				}
			})
		},

		// 提交保存的基本方法
		submitUpdate(auto) {
			const self = this
			this.$refs['baseForm'].validate((valid) => {
				if (!valid) {
					return false
				}

				self.submitUpdate0(auto)
			})
		},

		// 提交保存的底层方法
		submitUpdate0(auto) {
			const self = this
			console.log(self.baseForm)

			const params = {
				experiment_name: self.baseForm.experiment_name.trim(),
				experiment_type: self.baseForm.experiment_type,
				experiment_no: self.baseForm.experiment_no.trim(),
				temperature: self.baseForm.temperature,
				humidity: self.baseForm.humidity
			}
			updateExperiment(self.experimentId, params, true).then(function(resp) {
				// 创建成功后跳转到编辑页面
				self.$router.push('/experiment/edit/' + resp.data.experiment_id)
			})
		}
	}

}
</script>

<style>
.el-tag + .el-tag {
	margin-left: 10px;
}
</style>
