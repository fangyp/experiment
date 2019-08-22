<template>
	<div v-if="null === experiment" class="app-container text-center">
		<el-alert v-if="loaded" title="实验不存在！" class="pad-lg" type="error" center show-icon description="您可能查询了错误的实验，或者该实验已被删除" :closable="false"/>
		<el-button v-if="loaded" type="info" plain class="mg-t-md" @click="gotoHome">返回首页</el-button>
	</div>
	<div v-else class="app-container">
		<!-- 工具栏 -->
		<el-row>
			<el-col :sm="24" :lg="24" :xl="24">
				<div class="main-tool-bar">
					<el-button plain @click="goback">返回</el-button>
					<el-button type="primary" plain @click="showSaveAll">保存</el-button>
				</div>
			</el-col>
		</el-row>
		<!-- 基本信息-->
		<el-row :gutter="20" class="mg-t-lg">
			<el-col :span="24">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<div class="box-title">基本信息</div>
						<div class="box-header-tools">
							<el-col :span="12">
								<label>状态：</label>
								<el-tag size="mini" :type="experiment.experiment_status | expStatusFilter">{{ experiment ? experiment.experiment_status_formatted : '' }}</el-tag>
							</el-col>
							<el-col :span="12">
								<label>测试：</label>
								<el-tag :type="experiment.is_testing | testStatusFilter" size="small">{{ experiment && experiment.is_testing ? '已测试': '无测试' }}</el-tag>
							</el-col>
						</div>
					</div>
					<el-row>
						<el-col :sm="24" :lg="24" :xl="24">
							<el-form
								ref="baseForm"
								:inline="true"
								:model="baseForm"
								:rules="baseRules"
								label-position="top"
								size="mini"
								label-width="80px"
								style="display:flex;justify-content:space-between;"
							>
								<el-form-item label="实验名称 :" prop="experiment_name">
									<el-input v-model="baseForm.experiment_name" maxlength="20" style="min-width:200px" :readonly="autoSaveLock"/>
								</el-form-item>
								<el-form-item label="温度℃ :" prop="temperature">
									<el-input v-model.number="baseForm.temperature" type="number" style="min-width:200px" :readonly="autoSaveLock"/>
								</el-form-item>
								<el-form-item label="湿度RH% :" prop="humidity">
									<el-input v-model.number="baseForm.humidity" type="number" style="min-width:200px" :readonly="autoSaveLock"/>
								</el-form-item>
							</el-form>
						</el-col>
					</el-row>
				</el-card>
			</el-col>
		</el-row>

		<el-tabs type="card" tab-position="top" class="mg-t-md">
			<!-- 实验步骤和参数 Tab -->
			<el-tab-pane label="实验步骤">
				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
					<div class="note-block">温馨提示：您可以为每个实验步骤添加多行实验参数，也可以设置关联的实验记录</div>

					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition procedure-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">
							<thead>
								<tr>
									<td style="min-width:20px; width:8%"/>
									<td style="min-width:100px; width:15%">
										<el-button type="primary" icon="el-icon-plus" style="color:#fff;" @click="appendProcedure($event)">增加步骤</el-button>
									</td>
									<td/>
									<td style="min-width:100px; width:14%">试剂</td>
									<td style="min-width:100px; width:14%">理论量/g</td>
									<td style="min-width:100px; width:14%">实际量/g</td>
									<!-- <td>备注</td> -->
									<td style="max-width:55px; width:55px;"/>
									<td style="min-width:100px; width:19%">实验记录</td>
								</tr>
							</thead>

							<tbody>
								<template v-for="(procedure, index) in formProcedures">
									<tr :key="'pro-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
										<!-- 表行的按钮 -->
										<!--
										<td
										:rowspan="procedure.experiment_parameters.length"
										class="seq-col"
										>{{ index + 1 }}</td>-->
										<td :rowspan="procedure.experiment_parameters.length" class="seq-col">
											<el-button type="danger" plain size="mini" icon="el-icon-minus" circle @click="removeProcedure($event, index)"/>
										</td>
										<!-- 步骤列 type="input"-->
										<td :rowspan="procedure.experiment_parameters.length" class="first-col">
											<el-form-item prop="procedure_title" style="vertical-align: middle;">
												<el-input v-model="procedure.procedure_title" type="textarea" maxlength="30" :rows="2" placeholder="步骤名称" :readonly="autoSaveLock"/>
											</el-form-item>
										</td>

										<!-- 一个步骤的首行参数行 -->
										<template :if="procedure.experiment_parameters != null && procedure.experiment_parameters.length > 0">
											<td>
												<div>
													<el-button type="primary" plain size="mini" icon="el-icon-plus" circle @click="appendParameter($event, 0, procedure)"/>
												</div>
											</td>
											<td>
												<el-form-item prop="reagent">
													<el-input v-model="procedure.experiment_parameters[0].reagent" maxlength="50" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="theoretical_volum">
													<el-input v-model.number="procedure.experiment_parameters[0].theoretical_volum" type="number" maxlength="10" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="actual_volum">
													<el-input v-model.number="procedure.experiment_parameters[0].actual_volum" type="number" maxlength="10" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<!-- <td>
												<el-form-item prop="remark">
												<el-input
													v-model="procedure.experiment_parameters[0].remark"
													type="textarea"
													rows="1"
													maxlength="50"
												/>
												</el-form-item>
											</td>-->
											<td>
												<div>
													<el-button
														type="danger"
														plain
														size="mini"
														icon="el-icon-minus"
														circle
														v-if="procedure.experiment_parameters && procedure.experiment_parameters.length > 1"
														@click="removeParameter($event, 0, procedure)"
													/>
												</div>
											</td>
										</template>

										<!-- 实验记录列 -->
										<td :rowspan="procedure.experiment_parameters.length" class="last-col">
											<div>
												<pre v-show="procedure.has_record" style="padding-left:10px;font-size:0.8em;text-align: left;">{{ procedure.record_content }}</pre>
											</div>
											<div>
												<el-button type="info" size="mini" icon="el-icon-edit" plain circle @click="appendRecordToProcedure($event, procedure, index)"/>
											</div>
										</td>
									</tr>

									<!-- 一个步骤的其他参数行 -->
									<template v-for="(parameters, index2) in procedure.experiment_parameters">
										<tr v-if="index2 > 0" :key="'par-' + index + '-' + index2" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
											<td>
												<!-- 表行的按钮 -->
												<div style="margin-bottom:5px;">
													<el-button type="primary" plain size="mini" icon="el-icon-plus" circle @click="appendParameter($event, index2, procedure)"/>
												</div>
											</td>
											<td>
												<el-form-item prop="reagent">
													<el-input v-model="parameters.reagent" maxlength="50" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="theoretical_volum">
													<el-input v-model.number="parameters.theoretical_volum" type="number" maxlength="10" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<td>
												<el-form-item prop="actual_volum">
													<el-input v-model="parameters.actual_volum" type="number" maxlength="10" :readonly="autoSaveLock"/>
												</el-form-item>
											</td>
											<!-- <td>
												<el-form-item prop="remark">
												<el-input
													v-model="parameters.remark"
													type="textarea"
													rows="1"
													maxlength="50"
												/>
												</el-form-item>
											</td>-->
											<td>
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
								<el-button type="primary" size="small" icon="el-icon-plus" @click="appendProcedure"/>
							</el-tooltip>
						</div>
					</div>
				</el-form>
			</el-tab-pane>

			<!-- 更多实验记录 Tab -->
			<el-tab-pane label="实验记录">
				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
					<div class="note-block">温馨提示：你可以添加和实验步骤无关的实验记录内容</div>

					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition record-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">
							<thead>
								<tr>
									<td style="min-width:20px; width:10%" class="text-center">序号</td>
									<td style="min-width:300px;" class="text-left">记录内容</td>
									<td style="max-width:120px; width:120px;" class="text-center"/>
								</tr>
							</thead>

							<tbody>
								<tr v-for="(record, index) in formRecords" :key="'rec-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
									<td>{{ index + 1 }}.</td>
									<td>
										<el-form-item prop="content">
											<el-input v-model="record.content" type="textarea" maxlength="200" rows="2" placeholder="输入实验记录内容" show-word-limit
											:readonly="autoSaveLock"/>
										</el-form-item>
									</td>
									<td>
										<el-button type="primary" size="mini" icon="el-icon-plus" plain @click="appendRecord($event, index)"/>
										<el-button type="danger" size="mini" icon="el-icon-delete" plain @click="removeRecord($event, index)"/>
									</td>
								</tr>
							</tbody>
						</table>

						<div v-if="formRecords.length == 0" style="text-align:center; padding: 15px;">
							<el-tooltip class="item" effect="dark" content="在末尾添加一行实验记录" placement="top-start">
								<el-button type="primary" size="small" icon="el-icon-plus" @click="appendRecord"/>
							</el-tooltip>
						</div>
					</div>
				</el-form>
			</el-tab-pane>
			<!-- 实验记录 Tab -->
		</el-tabs>
		<!-- 页面主体 -->
		<!-- 实验目的 R值、NCO残留量-->
		<el-row :gutter="20" class="mg-t-lg">
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<div class="box-title">实验目的</div>
					</div>
					<el-form
						ref="baseForm2"
						:model="baseForm"
						:rules="baseRules2"
						label-position="top"
						size="mini"
						label-width="80px"
						style="height:100%,width:100%"
					>
						<el-col :sm="24" :lg="24" :xl="24">
							<el-form-item prop="purpose">
								<el-input
									v-model="baseForm.purpose"
									style="height:100%,width:100%"
									type="textarea"
									:rows="4"
									placeholder="请输入实验目的"
									maxlength="200"
									show-word-limit
									:readonly="autoSaveLock"
								/>
							</el-form-item>
						</el-col>
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<span class="box-title">R值、NCO残留量</span>
					</div>
					<el-form
						ref="baseForm3"
						:model="baseForm"
						:rules="baseRules3"
						label-position="top"
						size="mini"
						label-width="80px"
						style="height:100%,width:100%"
					>
						<el-col :sm="24" :lg="24" :xl="24">
							<el-form-item prop="r_nco">
								<el-input
									v-model="baseForm.r_nco"
									style="height:100%,width:100%"
									type="textarea"
									:rows="4"
									placeholder="请输入R值， NCO残留量"
									maxlength="100"
									show-word-limit
									:readonly="autoSaveLock"
								/>
							</el-form-item>
						</el-col>
					</el-form>
				</el-card>
			</el-col>
		</el-row>
		<!-- 结果与讨论-->
		<el-row :gutter="20" class="mg-t-md">
			<el-col :span="24">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<span class="box-title">结果与讨论</span>
					</div>
					<el-input v-model="baseForm.conclusion" type="textarea" :rows="7" placeholder="结果与结论" maxlength="500" show-word-limit :readonly="autoSaveLock"/>
				</el-card>
			</el-col>
		</el-row>
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
import { mapGetters } from 'vuex'
import experimentApi from '@/api/experiment'
import { baseRules, baseRules2, baseRules3 } from './validation_rules'
import experimentService from './experiment_service'
import { BoolEnum, ExperimentStatusEnum } from '@/webcore/common/enums'
// 自动保存间隔时间，单位：秒
const AUTO_SAVE_INTERVAL = 60

export default {
	name: 'ExperimentEdit',
	filters: {
		// 用户获取状态颜色
		expStatusFilter(status) {
			const stateOption = {}
			stateOption[ExperimentStatusEnum.Created] = ''
			stateOption[ExperimentStatusEnum.AuditPending] = 'warning'
			stateOption[ExperimentStatusEnum.Auditing] = 'warning'
			stateOption[ExperimentStatusEnum.AuditRejected] = 'danger'
			stateOption[ExperimentStatusEnum.Finished] = 'success'
			stateOption[ExperimentStatusEnum.Invalid] = 'info'
			return stateOption[status]
		},
		testStatusFilter(status) {
			const stateOption = {}
			stateOption[BoolEnum.No] = 'warning'
			stateOption[BoolEnum.Yes] = 'success'
			return stateOption[status]
		},
	},
	data() {
		return {
			loaded: false,
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
				conclusion: '',
			},
			formProcedures: [],
			formRecords: [],

			// 校验规则
			baseRules,
			baseRules2,
			baseRules3,

			// other var
			recordEditBox: false,
			recordEditIndex: null,
			isAutoSave: true, // 标示是否开启自动保存功能
			autoSaveInerval: null,
			autoSaveLock: false, // true代表处于自动保存中，需要锁定相关输入项
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

	beforeDestroy() {
		this.stopAutoSave()
	},

	beforeRouteLeave(to, from, next) {
		const answer = window.confirm('如果有内容未保存，离开后将丢失，您确定要离开编辑页面吗？')
		if (answer) {
			this.stopAutoSave()
			next()
		} else {
			next(false)
		}
	},

	computed: {
		...mapGetters(['permissions']),

		experimentAbility() {
			return experimentService.getExperimentAbility(this.permissions, this.experiment)
		},
	},

	methods: {
		loadData() {
			// 加载实验数据
			experimentApi.getExperiment(this.experimentId).then(resp => {
				this.setData4Load(resp.data)

				if (!this.experimentAbility.edit) {
					this.isAutoSave = false
					this.$router.push('/experiment/info/' + this.experimentId)
				} else {
					// 触发自动保存任务
					if (this.isAutoSave) {
						this.autoSave()
					}
				}
			})
		},

		setData4Load(data) {
			this.experiment = data.experiment
			this.procedures = data.procedures
			this.records = data.records

			this.initForm()
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
					conclusion: this.experiment.conclusion,
				}
			}

			self.formProcedures = []
			if (this.procedures !== null && this.procedures.length > 0) {
				this.procedures.forEach(item => {
					const tmp = {
						procedure_id: item.procedure_id,
						procedure_title: item.procedure_title,
						experiment_parameters: [],
						record_id: item.record_id,
						record_content: item.record_content,
						has_record: item.record_id != null,
					}

					if (item.experiment_parameters === null || item.experiment_parameters.length === 0) {
						tmp.experiment_parameters.push(self.createEmptyParameter())
					} else {
						item.experiment_parameters.forEach(itemPara => {
							const tmpPara = {
								reagent: itemPara.reagent,
								theoretical_volum: itemPara.theoretical_volum,
								actual_volum: itemPara.actual_volum,
								remark: itemPara.remark,
							}
							tmp.experiment_parameters.push(tmpPara)
						})
					}
					self.formProcedures.push(tmp)
				})
			}

			self.formRecords = []
			if (this.records !== null && this.records.length > 0) {
				this.records.forEach(item => {
					const tmp = {
						id: item.id,
						content: item.content,
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
				},
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
					},
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
				},
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
				record_id: null,
			}
		},

		// 创建一个空白参数
		createEmptyParameter() {
			return {
				reagent: '',
				theoretical_volum: '',
				actual_volum: '',
				remark: '',
			}
		},

		// 创建一个空白实验记录
		createEmptyRecord(event) {
			return {
				record_id: null,
				content: '',
				procedure_id: null,
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
					console.log('yesCallback')
					self.submitUpdate(false)
				},
			})
		},

		// 触发自动保存(只需调用一次)
		autoSave() {
			const self = this
			if (this.autoSaveInerval !== null) {
				clearTimeout(this.autoSaveInerval)
			}

			if (this.isAutoSave) {
				this.autoSaveInerval = setTimeout(() => {
					self.autoSave()
					self.submitUpdate(true)
				}, AUTO_SAVE_INTERVAL * 1000)
			}
		},

		// 停止自动保存
		stopAutoSave() {
			this.isAutoSave = false
			if (this.autoSaveInerval !== null) {
				clearTimeout(this.autoSaveInerval)
				this.autoSaveInerval = null
			}
		},

		// 提交保存的基本方法
		submitUpdate(auto) {
			const self = this
			if (auto && ! this.isAutoSave) {
				return
			}
			if (this.$refs['baseForm']) {
				this.$refs['baseForm'].validate(valid => {
					if (!valid) {
						console.log('baseForm')
						return false
					}

					if (self.$refs['baseForm2']) {
						self.$refs['baseForm2'].validate(valid => {
							if (!valid) {
								console.log('baseForm2')
								return false
							}

							if (self.$refs['baseForm3']) {
								self.$refs['baseForm3'].validate(valid => {
									if (!valid) {
										console.log('baseForm3')
										return false
									}
									try {
										self.autoSaveLock = true
										self.submitUpdate0(auto)
									} catch(e) {
										self.autoSaveLock = false
									}
								})
							}
						})
					}
				})
			}
		},

		// 提交保存的底层方法
		submitUpdate0(auto) {
			const self = this
			const params = {
				oversion: self.experiment.oversion,
				experiment_name: self.baseForm.experiment_name.trim(),
				experiment_type: self.baseForm.experiment_type,
				temperature: self.baseForm.temperature,
				humidity: self.baseForm.humidity,
				purpose: self.baseForm.purpose,
				r_nco: self.baseForm.r_nco,
				conclusion: self.baseForm.conclusion,
			}
			// 解析实验步骤参数
			const procedures = []
			self.formProcedures.forEach(item => {
				const tmp = {
					procedure_id: item.procedure_id,
					procedure_title: item.procedure_title,
					experiment_parameters: [],
					record_content: item.record_content,
					record_id: item.record_id,
				}

				item.experiment_parameters.forEach(itemPara => {
					const tmpPara = {
						reagent: itemPara.reagent,
						theoretical_volum: itemPara.theoretical_volum,
						actual_volum: itemPara.actual_volum,
						remark: itemPara.remark,
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
					content: item.content,
				}

				records.push(tmp)
			})
			params.records = JSON.stringify(records)

			console.log(params)

			experimentApi.updateExperiment(self.experimentId, params, auto).then((resp) => {
				self.setData4Load(resp.data)
				self.autoSaveLock = false
			}).catch(() => {
				self.autoSaveLock = false
			})
		},

		// 返回首页
		gotoHome() {
			this.$router.push('/')
		},

		// 返回上一页
		goback() {
			this.$router.go(-1)
		},
	}
}
</script>

<style lang="scss">
.demo-table-expand {
	font-size: 15px;
}
.demo-table-expand span {
	width: 90px;
}
.demo-table-expand .el-form-item {
	margin-right: 0;
	margin-bottom: 0;
	width: 100%;
}
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
						border-left: 1px solid #dfe6ec;
						padding-left: 2px;
						padding-right: 2px;
						text-align: center;
						color: #909399;
					}
					&.first-col {
						border-left: 1px solid #dfe6ec;
						border-right: 1px solid #dfe6ec;
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
