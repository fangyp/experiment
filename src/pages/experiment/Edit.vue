<template>
	<div class="app-container">
		<!-- 页面主体 -->
		<el-row>
			<el-col :sm="24" :lg="24" :xl="24">
				<!-- 工具栏 -->
				<el-card shadow="never">
					<el-form :inline="true" size="mini" label-width="80px">
						<el-form-item label="实验类型">{{ experiment ? experiment.experiment_type_formatted : '' }}</el-form-item>
						<el-form-item label="实验员">{{ experiment ? experiment.user_name : '' }}</el-form-item>
						<el-form-item label="日期">{{ experiment ? experiment.experiment_date : '' }}</el-form-item>
						<el-form-item label="实验状态"><el-tag type="danger" size="medium">{{ experiment ? experiment.experiment_status_formatted : '' }}</el-tag></el-form-item>

						<el-form-item style="float:right">
							<el-button type="primary" size="medium" @click="showSaveAll"><font-awesome-icon icon="save" /> 保 存 全 部</el-button>
							<el-button plain size="medium" @click="showApplyAudit"><font-awesome-icon icon="user-check" /> 提交审核</el-button>
						</el-form-item>
					</el-form>

				</el-card>
			</el-col>
		</el-row>


		<el-tabs type="card" tab-position="top" class="mg-t-md">

			<!-- 基本信息 Tab -->
			<el-tab-pane label="基本信息">
				<el-row style="margin-top: 15px;">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm" :inline="true" :model="baseForm" :rules="baseRules" label-position="top" size="mini" label-width="80px">
							<el-form-item label="实验名称" prop="experiment_name">
								<el-input v-model="baseForm.experiment_name" maxlength="20" />
							</el-form-item>
							<el-form-item label="温度℃" prop="temperature">
								<el-input v-model.number="baseForm.temperature" type="number" />
							</el-form-item>
							<el-form-item label="湿度RH%" prop="humidity">
								<el-input v-model.number="baseForm.humidity" type="number" />
							</el-form-item>
						</el-form>
					</el-col>
				</el-row>

				<el-divider />
				<el-row :gutter="10">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm2" :model="baseForm" :rules="baseRules2" label-position="top" size="mini" label-width="80px">
							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="实验目的" prop="purpose">
									<el-input v-model="baseForm.purpose" type="textarea" :rows="4" placeholder="请输入实验目的" maxlength="200" show-word-limit />
								</el-form-item>
							</el-col>

							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="R值， NCO残留量" prop="r_nco">
									<el-input v-model="baseForm.r_nco" type="textarea" :rows="4" placeholder="请输入R值， NCO残留量" maxlength="100" show-word-limit />
								</el-form-item>
							</el-col>
						</el-form>
					</el-col>
				</el-row>

				<el-row>
					<el-col :sm="24" :lg="16" :xl="16">
						<el-form ref="baseForm3" :model="baseForm" :rules="baseRules3" label-position="top" size="mini" label-width="80px">
							<el-form-item label="结果与结论" prop="conclusion">
								<el-input v-model="baseForm.conclusion" type="textarea" :rows="7" placeholder="结果与结论" maxlength="500" show-word-limit />
							</el-form-item>
						</el-form>
					</el-col>
				</el-row>
			</el-tab-pane>

			<!-- 实验步骤和参数 Tab -->
			<el-tab-pane label="实验步骤和参数">
				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
					<el-alert
						type="info"
						:closable="false"
						class="small"
						style="margin-bottom: 10px;"
						title="温馨提示：您可以为每个实验步骤添加多行实验参数，也可以设置关联的实验记录"
					/>

					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition procedure-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">

							<thead>
								<tr>
									<td style="min-width:20px; width:3%" />
									<td style="min-width:100px; width:19%" class="first-col">步骤</td>
									<td>试剂</td>
									<td style="min-width:100px; width:14%">理论量/g</td>
									<td style="min-width:100px; width:14%">实际量/g</td>
									<td>备注</td>
									<td style="max-width:55px; width:55px;">
										<!-- 表头按钮 -->
										<!--
										<el-tooltip class="item" effect="dark" content="在末尾添加一个实验步骤" placement="top-start">
											<el-button type="primary" size="small" icon="el-icon-plus" @click="appendProcedure" />
										</el-tooltip>
										-->
									</td>
									<td style="min-width:100px; width:19%">实验记录</td>

								</tr>
							</thead>

							<tbody>
								<template v-for="(procedure, index) in formProcedures">
									<tr :key="'pro-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
										<td :rowspan="procedure.experiment_parameters.length" class="seq-col">{{ index + 1 }}</td>
										<!-- 步骤列 -->
										<td :rowspan="procedure.experiment_parameters.length" class="first-col">
											<el-form-item prop="procedure_title">
												<el-input v-model="procedure.procedure_title" maxlength="15" placeholder="输入步骤名称" />
											</el-form-item>

											<!-- 工具栏 -->
											<div style="position:absolute;padding-left: 15px;width:100%;text-align: right;bottom:5px;right:10px">
												<el-button type="primary" size="mini" icon="el-icon-plus" @click="appendProcedure($event, index)" />
												<el-button type="danger" size="mini" icon="el-icon-delete" @click="removeProcedure($event, index)" />
											</div>
										</td>

										<!-- 一个步骤的首行参数行 -->
										<template :if="procedure.experiment_parameters != null && procedure.experiment_parameters.length > 0">
											<td>
												<el-form-item prop="reagent">
													<el-input v-model="procedure.experiment_parameters[0].reagent" maxlength="50" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="theoretical_volum">
													<el-input v-model.number="procedure.experiment_parameters[0].theoretical_volum" type="number" maxlength="10" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="actual_volum">
													<el-input v-model.number="procedure.experiment_parameters[0].actual_volum" type="number" maxlength="10" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="remark">
													<el-input v-model="procedure.experiment_parameters[0].remark" type="textarea" rows="1" maxlength="50" />
												</el-form-item>
											</td>
											<td>
												<!-- 表行的按钮 -->
												<div style="margin-bottom:5px;">
													<el-button type="primary" plain size="mini" icon="el-icon-plus" circle @click="appendParameter($event, 0, procedure)" />
												</div>
												<div>
													<el-button
														type="danger"
														plain
														size="mini"
														icon="el-icon-minus"
														circle
														:disabled="!procedure.experiment_parameters && procedure.experiment_parameters.length <= 1"
														@click="removeParameter($event, 0, procedure)"
													/>
												</div>
											</td>
										</template>

										<!-- 实验记录列 -->
										<td :rowspan="procedure.experiment_parameters.length" class="last-col">
											<div @click="appendRecordToProcedure($event, procedure, index)">
												<p v-if="procedure.has_record" class="text-ellipsis" style="font-size:0.8em">{{ procedure.record_content }}</p>
												<el-link icon="el-icon-edit" :underline="false" />
											</div>
										</td>
									</tr>

									<!-- 一个步骤的其他参数行 -->
									<template v-for="(parameters, index2) in procedure.experiment_parameters">
										<tr v-if="index2 > 0" :key="'par-' + index + '-' + index2" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
											<td>
												<el-form-item prop="reagent">
													<el-input v-model="parameters.reagent" maxlength="50" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="theoretical_volum">
													<el-input v-model.number="parameters.theoretical_volum" type="number" maxlength="10" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="actual_volum">
													<el-input v-model="parameters.actual_volum" type="number" maxlength="10" />
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="remark">
													<el-input v-model="parameters.remark" type="textarea" rows="1" maxlength="50" />
												</el-form-item>
											</td>
											<td>
												<!-- 表行的按钮 -->
												<div style="margin-bottom:5px;">
													<el-button type="primary" plain size="mini" icon="el-icon-plus" circle @click="appendParameter($event, index2, procedure)" />
												</div>
												<div>
													<el-button
														type="danger"
														plain
														size="mini"
														icon="el-icon-minus"
														circle
														:disabled="!procedure.experiment_parameters && procedure.experiment_parameters.length <= 1"
														@click="removeParameter($event, index2, procedure)"
													/>
												</div>
											</td>
										</tr>
									</template>
								</template>
							</tbody>

						</table>

						<div v-if="formProcedures.length == 0" style="text-align:center; padding: 15px;">
							<el-tooltip class="item" effect="dark" content="在末尾添加一个实验步骤" placement="top-start">
								<el-button type="primary" size="small" icon="el-icon-plus" @click="appendProcedure" />
							</el-tooltip>
						</div>
					</div>


				</el-form>

			</el-tab-pane>

			<!-- 更多实验记录 Tab -->
			<el-tab-pane label="更多实验记录">

				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
					<el-alert type="info" :closable="false" class="small" style="margin-bottom: 10px;" title="温馨提示：你可以添加和实验步骤无关的实验记录内容" />

					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition record-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">

							<thead>
								<tr>
									<td style="min-width:20px; width:10%" class="text-center">序号</td>
									<td style="min-width:300px;%" class="text-center">记录内容</td>
									<td style="max-width:120px; width:120px;" class="text-center" />
								</tr>
							</thead>

							<tbody>
								<tr v-for="(record, index) in formRecords" :key="'rec-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
									<td>{{ index + 1 }}.</td>
									<td>
										<el-form-item prop="content">
											<el-input v-model="record.content" type="textarea" maxlength="200" rows="2" placeholder="输入实验记录内容" show-word-limit />
										</el-form-item>
									</td>
									<td>
										<el-button type="primary" size="mini" icon="el-icon-plus" @click="appendRecord($event, index)" />
										<el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRecord($event, index)" />
									</td>
								</tr>
							</tbody>
						</table>

						<div v-if="formRecords.length == 0" style="text-align:center; padding: 15px;">
							<el-tooltip class="item" effect="dark" content="在末尾添加一行实验记录" placement="top-start">
								<el-button type="primary" size="small" icon="el-icon-plus" @click="appendRecord" />
							</el-tooltip>
						</div>
					</div>

				</el-form>

			</el-tab-pane>
			<!-- 实验记录 Tab -->

		</el-tabs>
		<!-- 页面主体 -->

		<!-- 实验步骤的实验记录编辑框 -->
		<el-drawer
			ref="drawer"
			title="编辑实验记录"
			:visible.sync="recordEditBox"
			direction="rtl"
			:modal="true"
			size="45%"
			:before-close="handleRecordEditBoxClose"
		>
			<div v-if="null !== recordEditIndex && recordEditIndex >= 0" class="record-edit-box">
				<el-form :model="formProcedures[recordEditIndex]">
					<el-form-item prop="record_content">
						<el-input
							v-model="formProcedures[recordEditIndex].record_content"
							type="textarea"
							rows="8"
							placeholder="输入实验记录"
							maxlength="200"
							show-word-limit
						/>
					</el-form-item>
				</el-form>
			</div>
		</el-drawer>

	</div>
	<!-- /.app-container -->
</template>

<script>
import poppyjs from 'poppyjs-elem'
import waves from '../../directive/waves'
// import webcore from '@/webcore'
import { updateExperiment, getExperiment } from '@/api/experiment'
import { baseRules, baseRules2, baseRules3 } from './validation_rules'

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

			// 表单输入
			baseForm: {
				experiment_name: '',
				experiment_type: '',
				temperature: 0,
				humidity: 0,
				purpose: '',
				r_nco: '',
				conclusion: ''
			},
			formProcedures: [],
			formRecords: [],

			// 校验规则
			baseRules,
			baseRules2,
			baseRules3,

			// other var
			recordEditBox: false,
			recordEditIndex: null
		}
	},

	created: function() {
		if (this.$route.params.id !== undefined && !poppyjs.util.StringUtil.isEmpty(this.$route.params.id)) {
			this.experimentId = this.$route.params.id
		}
		// 如果id不存在，则提示错误并返回上个页面
		if (this.experimentId === null) {
			const self = this
			poppyjs.html.Dialog.showToast('参数错误', function() {
				self.$router.go(-1)
			})
		}
		this.loadData()
	},

	mounted: function() {
		// 触发自动保存任务
	},

	methods: {

		loadData() {
			// 加载实验数据
			getExperiment(this.experimentId).then((resp) => {
				this.experiment = resp.data.experiment
				this.procedures = resp.data.procedures
				this.records = resp.data.records

				this.initForm()
			})
		},

		initForm() {
			const self = this
			if (this.experiment !== null) {
				this.baseForm = {
					experiment_name: this.experiment.experiment_name,
					temperature: Number(this.experiment.temperature),
					humidity: Number(this.experiment.humidity),
					purpose: this.experiment.purpose,
					r_nco: this.experiment.r_nco,
					conclusion: this.experiment.conclusion
				}
			}

			if (this.procedures !== null && this.procedures.length > 0) {
				this.procedures.forEach(item => {
					const tmp = {
						procedure_id: item.procedure_id,
						procedure_title: item.procedure_title,
						experiment_parameters: [],
						record_id: item.record_id,
						record_content: item.record_content,
						has_record: (item.record_id != null)
					}

					if (item.experiment_parameters === null || item.experiment_parameters.length === 0) {
						tmp.experiment_parameters.push(self.createEmptyParameter())
					} else {
						item.experiment_parameters.forEach(itemPara => {
							const tmpPara = {
								reagent: itemPara.reagent,
								theoretical_volum: itemPara.theoretical_volum,
								actual_volum: itemPara.actual_volum,
								remark: itemPara.remark
							}
							tmp.experiment_parameters.push(tmpPara)
						})
					}
					self.formProcedures.push(tmp)
				})
			}

			if (this.records !== null && this.records.length > 0) {
				this.records.forEach(item => {
					const tmp = {
						id: item.id,
						content: item.content
					}
					self.formRecords.push(tmp)
				})
			}
		},

		// 添加一行实验步骤
		appendProcedure(event, index = null) {
			// 如果指定 procedureId ，则在该procedureId后边添加一行
			if (index === undefined || index === null) {
				this.formProcedures.push(this.createEmptyProcedure())
			} else {
				this.formProcedures.splice(index + 1, 0, this.createEmptyProcedure())
			}
		},

		// 移除一行实验步骤(提示确认)
		removeProcedure(event, index) {
			const self = this
			poppyjs.html.Dialog.showConfirm({
				msg: '确定移除本行实验步骤吗？',
				title: '移除实验步骤',
				yesBtn: '移除',
				yesCallback: function() {
					self.formProcedures.splice(index, 1)
				}
			})
		},

		// 添加一行参数
		appendParameter(event, index, procedure) {
			procedure.experiment_parameters.push(this.createEmptyParameter())
		},

		// 移除一行参数(提示确认)
		removeParameter(event, index, procedure) {
			if (procedure.experiment_parameters && procedure.experiment_parameters.length > 1) {
				poppyjs.html.Dialog.showConfirm({
					msg: '确定移除本行实验步骤吗？',
					title: '移除实验步骤',
					yesBtn: '移除',
					yesCallback: function() {
						procedure.experiment_parameters.splice(index, 1)
					}
				})
			}
		},

		appendRecordToProcedure($event, procedure, index) {
			this.recordEditBox = true
			this.recordEditIndex = index
		},

		handleRecordEditBoxClose() {
			const procedure = this.formProcedures[this.recordEditIndex]
			if (procedure.record_id == null) {
				if (poppyjs.util.StringUtil.isEmpty(procedure.record_content)) {
					procedure.has_record = false
				} else {
					procedure.has_record = true
				}
			}
			this.recordEditBox = false
			this.recordEditIndex = null
		},

		// 添加一行实验记录
		appendRecord(event, index = null) {
			// 如果指定 index ，则在该 index 后边添加一行
			if (index === undefined || index === null) {
				this.formRecords.push(this.createEmptyRecord())
			} else {
				this.formRecords.splice(index + 1, 0, this.createEmptyRecord())
			}
		},

		// 移除一行实验记录(提示确认)
		removeRecord(event, index) {
			const self = this
			poppyjs.html.Dialog.showConfirm({
				msg: '确定移除本行实验记录吗？',
				title: '移除实验记录',
				yesBtn: '移除',
				yesCallback: function() {
					self.formRecords.splice(index, 1)
				}
			})
		},

		// 创建一个空白步骤数据
		createEmptyProcedure(event) {
			return {
				procedure_id: null,
				procedure_title: '',
				experiment_parameters: [this.createEmptyParameter()], // 默认创建一个参数
				record_content: null,
				has_record: false,
				record_id: null
			}
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

		// 创建一个空白实验记录
		createEmptyRecord(event) {
			return {
				record_id: null,
				content: '',
				procedure_id: null
			}
		},

		// 显示编辑保存确认
		showSaveAll() {
			const self = this
			/*
			this.$nextTick(() => {
				this.$refs["createForm"].clearValidate();
			});
			*/
			poppyjs.html.Dialog.showConfirm({
				msg: '确定保存实验全部数据吗？',
				title: '保存实验',
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

				self.$refs['baseForm2'].validate((valid) => {
					if (!valid) {
						return false
					}

					self.$refs['baseForm3'].validate((valid) => {
						if (!valid) {
							return false
						}
						self.submitUpdate0(auto)
					})
				})
			})
		},

		// 提交保存的底层方法
		submitUpdate0(auto) {
			const self = this
			if (self.experiment === null) {
				return
			}

			const params = {
				oversion: self.experiment.oversion,
				experiment_name: self.baseForm.experiment_name.trim(),
				experiment_type: self.baseForm.experiment_type,
				temperature: self.baseForm.temperature,
				humidity: self.baseForm.humidity,
				purpose: self.baseForm.purpose,
				r_nco: self.baseForm.r_nco,
				conclusion: self.baseForm.conclusion
			}

			// 解析实验步骤参数
			const procedures = []
			self.formProcedures.forEach(item => {
				const tmp = {
					procedure_id: item.procedure_id,
					procedure_title: item.procedure_title,
					experiment_parameters: [],
					record_content: item.record_content,
					record_id: item.record_id
				}

				item.experiment_parameters.forEach(itemPara => {
					const tmpPara = {
						reagent: itemPara.reagent,
						theoretical_volum: itemPara.theoretical_volum,
						actual_volum: itemPara.actual_volum,
						remark: itemPara.remark
					}
					tmp.experiment_parameters.push(tmpPara)
				})

				procedures.push(tmp)
			})
			params.procedures = JSON.stringify(procedures)

			// 解析实验记录
			const records = []
			self.formRecords.forEach(item => {
				const tmp = {
					id: item.id,
					content: item.content
				}

				records.push(tmp)
			})
			params.records = JSON.stringify(records)

			console.log(params)

			updateExperiment(self.experimentId, params, auto).then(function(resp) {
			})
		},

		// 显示提交审核确认
		showApplyAudit() {

		}
	}

}
</script>

<style lang="scss">
.el-table.procedure-table {
	table {
		thead {
			tr {
				td {
					text-align: center;
					&.first-col {
						border-right: 1px solid #dfe6ec;
					}
					&:last-child {
						border-left: 1px solid #dfe6ec;
					}
				}
			}
		}
		tbody {
			tr {
				td {
					text-align: center;
					padding: 6px 4px;
					&.seq-col {
						border-right: 1px solid #dfe6ec;
						padding-left: 2px;
						padding-right: 2px;
						text-align: center;
						color: #909399;
					}
					&.first-col {
						border-right: 1px solid #dfe6ec;
						vertical-align: top;
						min-height: 80px;
						padding-bottom: 28px;
					}
					&.last-col {
						border-left: 1px solid #dfe6ec;
						vertical-align: middle;
					}
				}
			}
		}
	}
}

.el-table.record-table {
	table {
		tbody {
			tr {
				td {
					text-align: center;
					vertical-align: middle;
				}
			}
		}
	}
}

.record-edit-box {
	padding: 15px;
}

</style>
