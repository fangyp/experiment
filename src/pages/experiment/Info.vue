<template>
	<div v-if="null === experiment" class="app-container">
		<el-alert
			title="实验不存在！"
			class="pad-lg"
			type="error"
			description="您可能查询了错误的实验，或者该实验已被删除"
			center
			show-icon
			:closable="false"
		/>
	</div>

	<div v-else class="app-container">
		<!-- 页面主体 -->
		<el-row>
			<el-col :sm="24" :lg="24" :xl="24">
				<!-- 工具栏 -->
				<el-card shadow="never">
					<el-form :inline="true" size="mini" label-width="75px">
						<el-col :sm="24" :lg="10" :xl="10">
							<el-form-item label="实验类型">{{ experiment ? experiment.experiment_type_formatted : '' }}</el-form-item>
							<el-form-item label="实验员">{{ experiment ? experiment.user_name : '' }}</el-form-item>
							<el-form-item label="日期">{{ experiment ? experiment.experiment_date : '' }}</el-form-item>
						</el-col>

						<el-col :sm="24" :lg="14" :xl="14">
							<el-form-item label="状态"><el-tag type="danger" size="small">{{ experiment ? experiment.experiment_status_formatted : '' }}</el-tag></el-form-item>
							<el-form-item label="测试"><el-tag type="danger" size="small">{{ experiment && experiment.is_testing ? '已测试': '无测试' }}</el-tag></el-form-item>

							<el-form-item v-if="moreMenus.length > 0" style="float:right">
								<el-dropdown trigger="click" size="medium" @command="handleMoreMenuClick">
									<span class="el-dropdown-link">
										<i class="el-icon-more text-minor pad-l-sm pad-r-sm" style="vertical-align: bottom;font-size: 18px;" />
									</span>
									<el-dropdown-menu slot="dropdown">
										<el-dropdown-item v-for="(menu, index) in moreMenus" :key="index" :icon="menu.icon" :command="menu.cmd">{{ menu.title }}</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</el-form-item>

							<el-form-item v-if="experimentAbility.auditStart" style="float:right">
								<el-button plain size="medium" @click="showStartAuditConfirm"><font-awesome-icon icon="user-check" /> 开始审核</el-button>
							</el-form-item>
							<el-form-item v-if="experimentAbility.auditAudit" style="float:right">
								<el-button plain size="medium" @click="showAudit"><font-awesome-icon icon="user-check" /> 完成审核</el-button>
							</el-form-item>
							<el-form-item v-if="experimentAbility.auditAdd" style="float:right">
								<el-button plain size="medium" @click="showApplyAuditConfirm"><font-awesome-icon icon="user-check" /> 提交审核</el-button>
							</el-form-item>
							<el-form-item v-if="experimentAbility.auditRevoke" style="float:right">
								<el-button plain size="medium" @click="showRevokeAuditConfirm"><font-awesome-icon icon="user-check" /> 撤回审核</el-button>
							</el-form-item>

							<el-form-item v-if="experimentAbility.edit" style="float:right">
								<el-button plain size="medium" @click="gotoEdit"><font-awesome-icon icon="edit" /> 编 辑</el-button>
							</el-form-item>

							<el-form-item style="float:right">
								<el-button plain size="medium" icon="el-icon-refresh-left" @click="loadData" />
							</el-form-item>
						</el-col>
					</el-form>

				</el-card>
			</el-col>
		</el-row>


		<el-tabs type="card" tab-position="top" style="margin-top: 20px;">

			<!-- 基本信息 Tab -->
			<el-tab-pane label="基本信息">
				<el-row style="margin-top: 15px;">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm" :inline="true" :model="baseForm" :rules="baseRules" label-position="top" size="mini" label-width="80px">
							<el-col :span="6">
								<el-form-item label="实验名称" prop="experiment_name">{{ baseForm.experiment_name }}</el-form-item>
							</el-col>
							<el-col :span="6"><el-form-item label="温度℃" prop="temperature">{{ baseForm.temperature }}</el-form-item></el-col>
							<el-col :span="6"><el-form-item label="湿度RH%" prop="humidity">{{ baseForm.humidity }}</el-form-item></el-col>
						</el-form>
					</el-col>
				</el-row>

				<el-divider />
				<el-row :gutter="10">
					<el-col :sm="24" :lg="24" :xl="24">
						<el-form ref="baseForm2" :model="baseForm" :rules="baseRules2" label-position="top" size="mini" label-width="80px">
							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="实验目的" prop="purpose">
									<pre class="text-box">{{ baseForm.purpose }}</pre>
								</el-form-item>
							</el-col>

							<el-col :sm="12" :lg="12" :xl="12">
								<el-form-item label="R值， NCO残留量" prop="r_nco"><pre class="text-box">{{ baseForm.r_nco }}</pre></el-form-item>
							</el-col>
						</el-form>
					</el-col>
				</el-row>

				<el-row>
					<el-col :sm="24" :lg="16" :xl="16">
						<el-form ref="baseForm3" :model="baseForm" :rules="baseRules3" label-position="top" size="mini" label-width="80px">
							<el-form-item label="结果与结论" prop="conclusion"><pre class="text-box">{{ baseForm.conclusion }}</pre></el-form-item>
						</el-form>
					</el-col>
				</el-row>
			</el-tab-pane>

			<!-- 实验步骤和参数 Tab -->
			<el-tab-pane label="实验步骤和参数">
				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition procedure-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">

							<thead>
								<tr>
									<td style="min-width:20px; width:3%" />
									<td style="min-width:100px; width:19%">步骤</td>
									<td>试剂</td>
									<td style="min-width:100px; width:14%">理论量/g</td>
									<td style="min-width:100px; width:14%">实际量/g</td>
									<td>备注</td>
									<td style="max-width:55px; width:55px;" />
									<td style="min-width:100px; width:19%">实验记录</td>

								</tr>
							</thead>

							<tbody>
								<template v-for="(procedure, index) in formProcedures">
									<tr :key="'pro-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
										<td :rowspan="procedure.experiment_parameters.length" class="seq-col">{{ index + 1 }}</td>
										<!-- 步骤列 -->
										<td :rowspan="procedure.experiment_parameters.length" class="first-col">{{ procedure.procedure_title }}
										</td>

										<!-- 一个步骤的首行参数行 -->
										<template :if="procedure.experiment_parameters != null && procedure.experiment_parameters.length > 0">
											<td>{{ procedure.experiment_parameters[0].reagent }}
											</td>
											<td>{{ procedure.experiment_parameters[0].theoretical_volum }}</td>
											<td>{{ procedure.experiment_parameters[0].actual_volum }}</td>
											<td>{{ procedure.experiment_parameters[0].remark }}</td>
											<td />
										</template>

										<!-- 实验记录列 -->
										<td :rowspan="procedure.experiment_parameters.length" class="last-col">
											<pre class="text-box plain" @click="showProcedureRecord($event, procedure.record_content)">{{ procedure.record_content }}</pre>
										</td>
									</tr>

									<!-- 一个步骤的其他参数行 -->
									<template v-for="(parameters, index2) in procedure.experiment_parameters">
										<tr v-if="index2 > 0" :key="'par-' + index + '-' + index2" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
											<td>{{ parameters.reagent }}</td>
											<td>{{ parameters.theoretical_volum }}</td>
											<td>{{ parameters.actual_volum }}</td>
											<td>{{ parameters.remark }}</td>
											<td />
										</tr>
									</template>
								</template>
							</tbody>

						</table>
					</div>


				</el-form>

			</el-tab-pane>

			<!-- 更多实验记录 Tab -->
			<el-tab-pane label="更多实验记录">

				<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">

					<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition record-table">
						<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">
							<thead>
								<tr>
									<td style="min-width:20px; width:10%" class="text-center">序号</td>
									<td style="min-width:300px;%" class="text-center">记录内容</td>
								</tr>
							</thead>

							<tbody>
								<tr v-for="(record, index) in formRecords" :key="'rec-' + index" :class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')">
									<td class="text-center">{{ index + 1 }}.</td>
									<td><pre class="text-box plain">{{ record.content }}</pre></td>
								</tr>
							</tbody>
						</table>
					</div>

				</el-form>

			</el-tab-pane>
			<!-- 实验记录 Tab -->

			<!-- 实验测试记录 Tab -->
			<el-tab-pane v-if="hasTestingTab" label="实验测试记录">

				<el-form v-model="formTestings" label-position="left" class="demo-table-expand" size="mini">
					<el-button
						v-if="testingAbility.add"
						type="primary"
						size="mini"
						icon="el-icon-plus"
						style="float:right"
						class="mg-b-xs"
						@click="showAddTesting"
					/>
					<el-table :data="formTestings" stripe border fit highlight-current-row size="mini" style="width: 100%;">
						<el-table-column label="No" min-width="45px" align="center" width="45px">
							<template slot-scope="row">{{ row.$index + 1 }}</template>
						</el-table-column>


						<el-table-column label="测试日期" prop="testing_date" width="86px" align="center" />

						<el-table-column label="测试项目" header-align="center" align="left">
							<template slot-scope="{row}"><pre>{{ row.testing_item }}</pre></template>
						</el-table-column>

						<el-table-column label="测试结果" header-align="center" align="left">
							<template slot-scope="{row}"><pre>{{ row.testing_result }}</pre></template>
						</el-table-column>

						<el-table-column label="添加时间" prop="created_at" width="90px" align="center" />

						<el-table-column label="操作" align="center" width="80px" class-name="small-padding fixed-width">
							<template slot-scope="{row}">
								<el-dropdown trigger="click" size="small" @command="handleTestingMenuClick">
									<span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right" /></span>
									<el-dropdown-menu slot="dropdown">
										<el-dropdown-item v-if="testingAbility.edit" :command="{cmd:'edit', row}">修 改</el-dropdown-item>
										<el-dropdown-item v-if="testingAbility.delete" :command="{cmd:'delete', row}">删 除</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</template>
						</el-table-column>
					</el-table>

				</el-form>
			</el-tab-pane>
			<!-- 实验测试 Tab -->

		</el-tabs>
		<!-- 页面主体 -->

		<!-- 实验步骤的实验记录编辑框 -->
		<el-drawer
			ref="drawer"
			title="实验记录"
			:visible.sync="recordBox"
			direction="rtl"
			:modal="true"
			size="50%"
			:before-close="handleProcedureRecordClose"
		>
			<div class="record-edit-box"><pre class="text-box">{{ showRecordContent }}</pre></div>
		</el-drawer>

		<!-- 测试记录新增/编辑弹出框 -->
		<el-dialog
			:title="addTestingFlag?'添加测试记录':'编辑测试记录'"
			:visible.sync="addTestingVisible"
			:modal="true"
			width="700px"
			top="6vh"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			:destroy-on-close="true"
		>
			<el-form ref="addTestingForm" :rules="addTestingFormRules" :model="formTesting" label-position="left" label-width="80px">
				<el-form-item label="测试日期" prop="testing_date">
					<el-col :span="8">
						<el-date-picker
							v-model="formTesting.testing_date"
							type="date"
							placeholder="选择日期"
							:picker-options="pickerOptions"
							format="yyyy-MM-dd"
							value-format="yyyy-MM-dd"
						/>
					</el-col>
				</el-form-item>

				<el-form-item label="测试项目" prop="testing_item">
					<el-input v-model="formTesting.testing_item" type="textarea" rows="4" maxlength="100" show-word-limit />
				</el-form-item>

				<el-form-item label="测试结果" prop="testing_result">
					<el-input v-model="formTesting.testing_result" type="textarea" rows="8" maxlength="200" show-word-limit />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="medium" @click="hideAddTesting">取消</el-button>
				<el-button size="medium" type="primary" @click="submitTestingSave(addTestingFlag)">确定</el-button>
			</div>
		</el-dialog>

		<!-- 实验审核弹框 -->
		<experiment-audit :visible="experimentAuditVisible" :experiment="experiment" :close-callback="handleAuditClose" :confirm-callback="handleAuditConfirm" />
	</div>
	<!-- /.app-container -->
</template>

<script>
import poppyjs from 'poppyjs-elem'
import experimentService from '@/api/experiment'
import { mapGetters } from 'vuex'
import { baseRules, baseRules2, baseRules3, testingRules } from './validation_rules'
import ExperimentAudit from './Audit'

export default {
	name: 'ExperimentInfo',
	components: {
		ExperimentAudit
	},
	data() {
		return {
			experimentId: null,
			// 原始数据
			experiment: null,
			procedures: null,
			records: null,
			testings: null,

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
			formTestings: [],
			formTesting: {
				testing_id: null,
				testing_date: null,
				testing_item: null,
				testing_result: null
			},

			// 校验规则
			baseRules,
			baseRules2,
			baseRules3,

			// 显示实验记录详情
			recordBox: false,
			showRecordContent: null,

			// 添加/编辑测试记录
			addTestingVisible: false,
			addTestingFlag: false,
			addTestingFormRules: testingRules,

			// 实验审核弹框
			experimentAuditVisible: false,

			// Other
			pickerOptions: {
				disabledDate(time) {
					return time.getTime() < Date.now()
				},
				shortcuts: [{
					text: '今天',
					onClick(picker) {
						picker.$emit('pick', new Date())
					}
				}]
			}
		}
	},

	computed: {
		...mapGetters([
			'permissions'
		]),

		experimentAbility() {
			return {
				edit: (this.permissions['experiment.update'] && this.experiment != null && this.experiment.can_edit),
				invalid: (this.permissions['experiment.status'] && this.experiment != null && this.experiment.can_invalid),
				delete: (this.permissions['experiment.delete'] && this.experiment != null && this.experiment.can_delete),
				testing: (this.permissions['experiment.testing'] && this.experiment != null && this.experiment.can_testing),
				auditAdd: (this.permissions['experiment.audit_apply'] && this.experiment != null && this.experiment.can_apply_audit),
				auditRevoke: (this.permissions['experiment.audit_revoke'] && this.experiment != null && this.experiment.can_revoke_audit),
				auditStart: (this.permissions['experiment.audit_start'] && this.experiment != null && this.experiment.can_start_audit),
				auditAudit: (this.permissions['experiment.audit_finish'] && this.experiment != null && this.experiment.can_finish_audit)
			}
		},
		testingAbility() {
			return {
				add: (this.permissions['experiment.testing.add'] && this.experiment !== null && this.experimentAbility.edit && this.experiment.is_testing),
				edit: (this.permissions['experiment.testing.edit'] && this.experiment !== null && this.experimentAbility.edit && this.experiment.is_testing),
				delete: (this.permissions['experiment.testing.delete'] && this.experiment !== null && this.experimentAbility.edit && this.experiment.is_testing)
			}
		},

		// 更多菜单
		moreMenus() {
			const menus = []
			if (this.experimentAbility.testing) {
				menus.push({ cmd: 'testing', title: '开始实验测试', icon: 'el-icon-odometer' })
			}
			if (this.experimentAbility.invalid) {
				menus.push({ cmd: 'invalid', title: '作废实验', icon: 'el-icon-s-release' })
			}
			if (this.experimentAbility.delete) {
				menus.push({ cmd: 'delete', title: '删除实验', icon: 'el-icon-delete' })
			}
			return menus
		},

		// 是否显示实验测试tab页
		hasTestingTab() {
			return this.experiment != null && this.experiment.is_testing
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

	methods: {

		loadData() {
			// 加载实验数据
			experimentService.getExperiment(this.experimentId).then((resp) => {
				this.experiment = resp.data.experiment || null
				this.procedures = resp.data.procedures || null
				this.records = resp.data.records || null
				this.testings = resp.data.testings || null

				this.initForm()
			})
		},

		initForm() {
			const self = this
			this.formProcedures = []
			this.formRecords = []
			this.formTestings = []

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

			if (this.testings !== null && this.testings.length > 0) {
				this.testings.forEach(item => {
					const tmp = {
						testing_id: item.testing_id,
						testing_date: item.testing_date,
						testing_item: item.testing_item,
						testing_result: item.testing_result,
						created_at: item.created_at
					}
					self.formTestings.push(tmp)
				})
			}
		},

		// 跳转到编辑页面
		gotoEdit() {
			this.$router.push('/experiment/edit/' + this.experimentId)
		},

		showProcedureRecord($event, recordContent) {
			this.recordBox = true
			this.showRecordContent = recordContent
		},

		handleProcedureRecordClose() {
			this.recordBox = false
			this.showRecordContent = null
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

		// 处理测试记录列表中操作菜单
		handleTestingMenuClick(item) {
			if (item.cmd === 'edit') {
				this.showEditTesting(item.row)
			} else if (item.cmd === 'delete') {
				this.showDeleteTestingConfirm(item.row)
			}
		},

		// 显示新增测试记录弹框
		showAddTesting(event) {
			this.addTestingFlag = true
			this.addTestingVisible = true
		},

		// 显示编辑测试记录弹框
		showEditTesting(item) {
			this.addTestingFlag = false
			this.formTesting = {
				testing_id: item.testing_id,
				testing_date: item.testing_date,
				testing_item: item.testing_item,
				testing_result: item.testing_result
			}
			this.addTestingVisible = true
		},

		// 显示编辑保存确认
		hideAddTesting(isEdit) {
			this.$nextTick(() => {
				this.$refs['addTestingForm'].clearValidate()
			})
			this.addTestingVisible = false
		},

		// 提交保存的基本方法
		submitTestingSave(flag) {
			const self = this
			this.$refs['addTestingForm'].validate((valid) => {
				if (!valid) {
					return false
				}

				if (self.experiment === null) {
					return
				}

				const params = {
					testing_date: self.formTesting.testing_date,
					testing_item: self.formTesting.testing_item,
					testing_result: self.formTesting.testing_result
				}

				console.log(params)

				if (flag) {
					experimentService.addExperimentTesting(self.experimentId, params).then(function(resp) {
						self.hideAddTesting()
						self.loadData()
					})
				} else {
					experimentService.updateExperimentTesting(self.formTesting.testing_id, params).then(function(resp) {
						self.hideAddTesting()
						self.loadData()
					})
				}
			})
		},

		// 显示删除测试记录确认
		showDeleteTestingConfirm(item) {
			poppyjs.html.Dialog.showConfirm({
				title: '删除测试记录',
				msg: '确定删除测试记录吗？',
				yesCallback: () => {
					experimentService.deleteExperimentTesting(item.testing_id).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 点击更多菜单时
		handleMoreMenuClick(cmd) {
			if (cmd === 'testing') {
				this.showTestingConfirm()
			} else if (cmd === 'invalid') {
				this.showInvaidConfirm()
			} else if (cmd === 'delete') {
				this.showDeleteConfirm()
			}
		},

		// 显示开始测试确认
		showTestingConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '测试开始',
				msg: '开始测试后，可以添加测试数据。确定开始测试吗？',
				yesCallback: () => {
					experimentService.startExperimentTesting(this.experimentId).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 显示作废确认
		showInvaidConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '数据作废',
				msg: '数据作废后，将不能恢复，确定将实验数据作废吗？',
				yesCallback: () => {
					experimentService.updateExperimentStatus(this.experimentId, { status: 'invalid' }).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 显示删除确认
		showDeleteConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '删除实验数据',
				msg: '数据删除后，将不能恢复，确定删除该实验数据吗？',
				yesCallback: () => {
					experimentService.deleteExperiment({ id: this.experimentId }).then((resp) => {
						this.$router.go(-1)
					})
				}
			})
		},

		// 显示提交审核申请确认
		showApplyAuditConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '申请审核',
				msg: '确定实验数据已经填写完好，申请审核吗？',
				yesCallback: () => {
					experimentService.addAudit(this.experimentId).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 显示撤回审核确认
		showRevokeAuditConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '审核撤回',
				msg: '确定将实验审核申请撤回吗？',
				yesCallback: () => {
					experimentService.revokeAudit(this.experimentId).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 显示开始审核确认
		showStartAuditConfirm() {
			poppyjs.html.Dialog.showConfirm({
				title: '开始审核',
				msg: '将实验审核开始后，申请人将不能撤回。您可以在开始后，通过【完成审核】功能提交审核结果。确定将该实验的审核开始吗？',
				yesCallback: () => {
					experimentService.startAudit(this.experimentId).then((resp) => {
						this.loadData()
					})
				}
			})
		},

		// 显示审核结果确认
		showAudit() {
			this.experimentAuditVisible = true
		},
		// 处理完成审核的确认操作
		handleAuditConfirm() {
			this.experimentAuditVisible = false
			this.loadData()
		},
		// 处理完成审核的关闭操作
		handleAuditClose() {
			this.experimentAuditVisible = false
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

					vertical-align: middle;
				}
			}
		}
	}
}

.record-edit-box {
	padding: 15px;
}

pre {
	font-family: inherit;
}

.text-box {
	padding: 5px 15px;
	margin: 0;
	border: 1px solid #e6ebf5;
	border-radius: 4px;
	color: #303133;
	min-height: 100px;

	&.plain {
		padding: 0;
		border: none;
		min-height: 0;
	}
}

</style>
