<template>
	<div v-if="null === experiment" class="app-container text-center">
		<el-alert v-if="loaded" title="实验不存在！" class="pad-lg" type="error" center show-icon
			description="您可能查询了错误的实验，或者该实验已被删除" :closable="false"/>
		<el-button v-if="loaded" type="info" plain class="mg-t-md" @click="gotoHome">返回首页</el-button>
	</div>
	<div v-else class="app-container">
		<el-row>
			<el-col :sm="24" :lg="24" :xl="24">
				<!-- 工具栏 -->
				<div class="main-tool-bar">
					<el-button plain @click="goback">返回</el-button>
					<el-button plain @click="loadData">刷新</el-button>
					<el-button v-if="experimentAbility.testing" plain @click="showTestingConfirm">测试</el-button>
					<el-button v-if="experimentAbility.edit" plain @click="gotoEdit">编辑</el-button>
					<el-button v-if="experimentAbility.auditStart" type="primary" plain @click="showStartAuditConfirm">开始审核</el-button>
					<el-button v-if="experimentAbility.auditAudit" type="primary" plain @click="showAudit">完成审核</el-button>
					<el-button v-if="experimentAbility.auditAdd" type="primary" plain @click="showApplyAuditConfirm">提交审核</el-button>
					<el-button v-if="experimentAbility.auditRevoke" type="primary" plain @click="showRevokeAuditConfirm">撤回审核</el-button>

					<el-dropdown trigger="click" size="medium" @command="handleMoreMenuClick">
						<span class="el-dropdown-link">
							<i class="el-icon-more-outline el-icon--right text-placeholder pad-l-sm pad-r-sm" style="font-size: 28px;" />
						</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item v-for="(menu, index) in moreMenus" :key="index" :icon="menu.icon"
							:command="menu.cmd">{{ menu.title }}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
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
								<el-tag size="mini" :type="experiment.experiment_status | expStatusFilter"
								>{{ experiment ? experiment.experiment_status_formatted : '' }}</el-tag>
							</el-col>
							<el-col :span="12">
								<label>测试：</label>
								<el-tag :type="experiment.is_testing | testStatusFilter" size="small"
								>{{ experiment && experiment.is_testing ? '已测试': '无测试' }}</el-tag>
							</el-col>
						</div>
					</div>

					<el-row :gutter="20">
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>实验名称：</label><span class="card-panel-text">{{ experiment.experiment_name }}</span>
							</div>
						</el-col>
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>实验类型：</label><span class="card-panel-text">{{ experiment.experiment_type_formatted }}</span>
							</div>
						</el-col>
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>温度：</label><span class="field-value">{{ experiment.temperature }} ℃</span>
							</div>
						</el-col>
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>湿度：</label><span class="card-panel-text">{{ experiment.humidity }} RH%</span>
							</div>
						</el-col>
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>实验员：</label>
								<!-- 已分配了人员时 -->
								<span class="card-panel-text" v-if="experiment.user_id > 0">{{ experiment.user_name }}
									<el-button type="text" @click="unassignMember"><i class="el-icon-close text-danger" /></el-button>
								</span>
								<!-- 未分配人员时 -->
								<span class="card-panel-text text-placeholder" v-else>
									<font-awesome-icon icon="user-plus" v-if="experimentAbility.assign" @click="showAssignMember" />
									<font-awesome-icon icon="user" v-else />
								</span>
							</div>
						</el-col>
						<el-col :sm="12" :lg="8">
							<div class="field-item">
								<label>日期：</label><span class="card-panel-text">{{ experiment.experiment_date }}</span>
							</div>
						</el-col>
					</el-row>
				</el-card>
			</el-col>
		</el-row>

		<!-- 实验步骤-->
		<el-row :gutter="20" class="mg-t-lg">
			<el-col :span="24">
				<el-tabs type="card" tab-position="top">
					<!-- 实验步骤和参数 Tab -->
					<el-tab-pane label="实验步骤">
						<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
							<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition procedure-table">
								<table cellspacing="0" cellpadding="0" class="el-table__body" style="width:100%">
									<thead>
										<tr>
											<td style="min-width:20px; width:60px" class="text-center">序号</td>
											<td style="min-width:100px; width:19%">步骤</td>
											<td>试剂</td>
											<td style="min-width:100px; width:14%">理论量/g</td>
											<td style="min-width:100px; width:14%">实际量/g</td>
											<td style="min-width:100px; width:19%">实验记录</td>
										</tr>
									</thead>

									<tbody>
										<template v-for="(procedure, index) in formProcedures">
											<tr :key="'pro-' + index" style="height:40px ;" :class="'el-table__row' + (index%2 ==1 ? '--striped': '')">
												<td :rowspan="procedure.experiment_parameters.length" class="seq-col">{{ index + 1 }}</td>
												<!-- 步骤列 -->
												<td :rowspan="procedure.experiment_parameters.length" class="first-col">{{ procedure.procedure_title }}</td>

												<!-- 一个步骤的首行参数行 -->
												<template :if="procedure.experiment_parameters != null && procedure.experiment_parameters.length > 0">
													<td>{{ procedure.experiment_parameters[0].reagent }}</td>
													<td>{{ procedure.experiment_parameters[0].theoretical_volum }}</td>
													<td>{{ procedure.experiment_parameters[0].actual_volum }}</td>
												</template>

												<!-- 实验记录列 -->
												<td :rowspan="procedure.experiment_parameters.length" class="last-col">
													<pre class="text-box plain"
													@click="showProcedureRecord($event, index)" >{{ procedure.record_content }}</pre>
												</td>
											</tr>

											<!-- 一个步骤的其他参数行 -->
											<template v-for="(parameters, index2) in procedure.experiment_parameters">
												<tr v-if="index2 > 0" :key="'par-' + index + '-' + index2" style="height:44px"
													:class="'el-table__row' + (index%2 ==1 ? '--striped': '')">
													<td>{{ parameters.reagent }}</td>
													<td>{{ parameters.theoretical_volum }}</td>
													<td>{{ parameters.actual_volum }}</td>
												</tr>
											</template>
										</template>
									</tbody>
								</table>
								<div v-if="procedures.length == 0" class="pad-md text-center text-placeholder">没有实验步骤</div>
							</div>
							<!-- /.el-table -->
						</el-form>
					</el-tab-pane>

					<!-- 更多实验记录 Tab -->
					<el-tab-pane label="实验记录">
						<el-form v-model="formProcedures" label-position="left" class="demo-table-expand" size="mini">
							<div class="el-table el-table--fit el-table--striped el-table--enable-row-transition record-table">
								<table cellspacing="0" cellpadding="0" border="0" class="el-table__body" style="width:100%">
									<thead>
										<tr>
											<td style="min-width:20px; width:60px" class="text-center">序号</td>
											<td style="min-width:300px;" class="text-left">记录内容</td>
											<td style="width:60px;">结构式</td>
										</tr>
									</thead>

									<tbody>
										<tr v-for="(record, index) in formRecords" :key="'rec-' + index" style="height:40px" 
										:class="'el-table__row' + (index%2 ==1 ? '--striped': '')">
											<td class="text-center">{{ index + 1 }}.</td>
											<td class="text-left"><pre class="text-box plain" style="min-height:20px;">{{ record.content }}</pre></td>
											<td>
												<el-link v-if="record.chem_xml" @click="showChem(false, index)"><font-awesome-icon icon="atom"/></el-link>
											</td>
										</tr>
									</tbody>
								</table>
								<div class="el-table__empty-block" v-if="null === formRecords || formRecords.length == 0">
									<span class="el-table__empty-text">没有实验记录</span>
								</div>
							</div>
						</el-form>
					</el-tab-pane>
					<!-- 实验记录 Tab -->

					<!-- 实验测试记录 Tab -->
					<el-tab-pane v-if="hasTestingTab" label="测试记录">
						<el-form v-model="formTestings" label-position="left" class="demo-table-expand" size="mini">
							
							<el-table :data="formTestings" border fit style="width: 100%;">
								<el-table-column label="No" min-width="45px" align="center" width="45px">
									<template slot-scope="row">{{ row.$index + 1 }}</template>
								</el-table-column>
								<el-table-column label="测试项目" header-align="center" align="left">
									<template slot-scope="{row}"><pre>{{ row.testing_item }}</pre></template>
								</el-table-column>
								<el-table-column label="测试结果" header-align="center" align="left">
									<template slot-scope="{row}"><pre>{{ row.testing_result }}</pre></template>
								</el-table-column>
								<el-table-column label="测试日期" prop="testing_date" min-width="100px" align="center" width="100px" />
								<el-table-column label="操作" align="center" min-width="80px" class-name="small-padding" width="80px">
									<template slot="header">
     									<el-button v-if="experimentAbility.testingAdd" type="primary" size="mini" icon="el-icon-plus"
										 class="mg-b-xs" @click="showAddTesting" plain>添加</el-button>
     								 </template>
									<template slot-scope="{row}">
										<el-dropdown trigger="click" size="small" @command="handleTestingMenuClick">
											<span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right" /></span>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item v-if="experimentAbility.testingEdit" :command="{cmd:'edit', row}">修 改</el-dropdown-item>
												<el-dropdown-item v-if="experimentAbility.testingDelete" :command="{cmd:'delete', row}">删 除</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</template>
								</el-table-column>
							</el-table>
						</el-form>
					</el-tab-pane>
					<!-- 实验测试 Tab -->

					<!-- 审核记录 Tab -->
					<el-tab-pane label="审核记录">
						<audit-list :experiment-id="experimentId" ref="auditList"/>
					</el-tab-pane>

				</el-tabs>
			</el-col>
		</el-row>
		<!-- 实验步骤 -->

		<!-- 实验目的 R值、NCO残留量-->
		<el-row :gutter="20" class="mg-t-lg">
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<div class="box-title">实验目的</div>
					</div>
					<pre class="text-box plain">{{ experiment.purpose }}</pre>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix box-header">
						<span class="box-title">R值、NCO残留量</span>
					</div>
					<pre class="text-box plain">{{ experiment.r_nco }}</pre>
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
					<pre class="text-box plain">{{ experiment.conclusion }}</pre>
				</el-card>
			</el-col>
		</el-row>

		<!-- 实验步骤的实验记录编辑框 -->
		<el-drawer ref="drawer" title="实验记录" :visible.sync="recordBox" direction="rtl" :modal="true" size="55%"
		:before-close="handleProcedureRecordClose">
			<div class="pad-md">
				<pre class="text-box" style="min-height: 300px;">{{ showRecordContent }}</pre>
				<div id="procedureChemViewer" style="min-width:400px;min-height:200px;width:100%;height:340px;border:1px solid #dfe4ed;" class="mg-t-sm"
				@click="showChem(true)" data-widget="Kekule.ChemWidget.Viewer"></div>
			</div>
		</el-drawer>

		<!-- 实验审核弹框 -->
		<experiment-audit :visible="experimentAuditVisible" :experiment="experiment" :close-callback="handleAuditClose" :confirm-callback="handleAuditConfirm"/>

		<!-- 测试记录新增/编辑弹出框 -->
		<experiment-testing-add :visible="addTestingVisible" :experiment-id="experimentId" :testing="currentEditTesting"
		:close-callback="handleTestingAddClose" :confirm-callback="handleTestingAddConfirm"/>

		<!-- 分配人员弹框 -->
		<assigning-member :visible="assigningMemberVisible" :experiment-id="experimentId" 
		:close-callback="handleAssignMemberClose" :confirm-callback="handleAssignMemberConfirm"/>

		<!-- 化学结构式 -->
		<el-dialog title="结构式" v-if="chemViewerVisible" :visible.sync="chemViewerVisible" :modal="true" :destroy-on-close="true"
		width="80%" top="4vh" v-el-drag-dialog>
			<div id="chemViewer" style="width:100%;min-height:400px;height:550px" data-widget="Kekule.ChemWidget.Viewer"></div>
		</el-dialog>
	</div>
	<!-- /.app-container -->
</template>

<script>
import Kekule from 'kekule'
import elDragDialog from '@/directive/el-drag-dialog'
import poppyjs from 'poppyjs-elem'
import { mapGetters } from 'vuex'
import experimentApi from '@/api/experiment'
import { BoolEnum, ExperimentStatusEnum } from '@/webcore/common/enums'
import { baseRules, baseRules2,	baseRules3, testingRules } from './validation_rules'
import experimentService from './experiment_service'
import ExperimentAudit from './components/ExperimentAudit'
import ExperimentTestingAdd from './components/ExperimentTestingAdd'
import AuditList from './components/AuditList'
import AssigningMember from './components/AssigningMember'

export default {
	name: 'ExperimentInfo',
	components: {
		ExperimentAudit,
		ExperimentTestingAdd,
		AuditList,
		AssigningMember,
	},
	directives: { elDragDialog },
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
		}
	},
	data() {
		return {
			tableKey: 0,
			loaded: false,
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
			// 临时缓存要编辑的测试记录数据
			currentEditTesting: null,

			// 校验规则
			baseRules,
			baseRules2,
			baseRules3,

			// 显示实验记录详情
			recordBox: false,
			showRecordContent: null,
			chemViewerVisible: false,
			chemViewerIndex: null,

			// 添加/编辑测试记录
			addTestingVisible: false,
			addTestingFlag: false,
			addTestingFormRules: testingRules,

			// 实验审核弹框
			experimentAuditVisible: false,

			// 分配实验人员
			assigningMemberVisible: false,

			// Other
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

	computed: {
		...mapGetters(['permissions']),

		experimentAbility() {
			return experimentService.getExperimentAbility(this.permissions, this.experiment)
		},

		// 更多菜单
		moreMenus(event) {
			const menus = []
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
			experimentApi.getExperiment(this.experimentId).then(resp => {
				this.loaded = true
				this.experiment = resp.data.experiment || null
				this.procedures = resp.data.procedures || null
				this.records = resp.data.records || null
				this.testings = resp.data.testings || null
				this.initForm()

				if (this.$refs.auditList) {
					this.$refs.auditList.loadData()
				}
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
						chem_xml: item.chem_xml,
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
						content: item.content,
						chem_xml: item.chem_xml
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

		// 返回首页
		gotoHome() {
			this.$router.push('/')
		},

		// 返回上一页
		goback() {
			this.$router.go(-1)
		},

		// 跳转到编辑页面
		gotoEdit() {
			this.$router.push('/experiment/edit/' + this.experimentId)
		},

		// 显示一个实验步骤关联的实验记录内容
		showProcedureRecord($event, index) {
			const self= this
			if (!poppyjs.util.StringUtil.isEmpty(this.formProcedures[index].record_content) ||
			!poppyjs.util.StringUtil.isEmpty(this.formProcedures[index].chen_xml)) {
				this.recordBox = true
				this.showRecordContent = this.formProcedures[index].record_content
				this.chemViewerIndex = index

				this.$nextTick(() => {
					this.loadChemViewer('procedureChemViewer', (chemViewer) => {
						const chemObj = self.loadChemMainData(self.formProcedures[index])
						if (chemObj !== null) {
							chemViewer.setChemObj(chemObj)
						}
					})
				})
			}
		},
		// 处理：实验步骤关联的实验记录内容弹框的关闭
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

		// 显示删除测试记录确认
		showDeleteTestingConfirm(item) {
			poppyjs.html.Dialog.showConfirm({
				title: '删除测试记录',
				msg: '确定删除测试记录吗？',
				yesCallback: () => {
					experimentApi.deleteExperimentTesting(item.testing_id).then(resp => {
						this.loadData()
					})
				}
			})
		},

		// 显示新增测试记录弹框
		showAddTesting() {
			this.currentEditTesting = null
			this.addTestingVisible = true
		},
		// 显示编辑测试记录弹框
		showEditTesting(item) {
			this.currentEditTesting = item
			this.addTestingVisible = true
		},
		// 处理完测试记录新增/编辑的确认操作
		handleTestingAddConfirm() {
			this.addTestingVisible = false
			this.loadData()
		},
		// 处理测试记录新增/编辑的关闭操作
		handleTestingAddClose() {
			this.addTestingVisible = false
			this.currentEditTesting = null
		},

		// 点击更多菜单时
		handleMoreMenuClick(cmd) {
			if (cmd === 'invalid') {
				this.showInvaidConfirm()
			} else if (cmd === 'delete') {
				this.showDeleteConfirm()
			}
		},

		// 显示实验的开始测试确认
		showTestingConfirm() {
			experimentService.showTestingConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},

		// 显示实验的作废确认
		showInvaidConfirm() {
			experimentService.showInvaidConfirm(this.experimentId, { status: 'invalid' }, resp => {
				this.loadData()
			})
		},

		// 显示实验的删除确认
		showDeleteConfirm() {
			experimentService.showDeleteConfirm(this.experimentId, resp => {
				this.$router.go(-1)
			})
		},

		// 显示实验的提交审核申请确认
		showApplyAuditConfirm() {
			experimentService.showApplyAuditConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},

		// 显示实验的撤回审核确认
		showRevokeAuditConfirm() {
			experimentService.showRevokeAuditConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},

		// 显示实验的开始审核确认
		showStartAuditConfirm() {
			experimentService.showStartAuditConfirm(this.experimentId, resp => {
				this.loadData()
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
		},

		// 显示分配实验负责人
		showAssignMember() {
			this.assigningMemberVisible = true
		},
		// 解除实验负责人
		unassignMember() {
			experimentService.showUnsignMemberConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},
		// 分配实验负责人完成后的操作
		handleAssignMemberConfirm(user) {
			this.assigningMemberVisible = false
			this.loadData()
		},
		handleAssignMemberClose() {
			this.assigningMemberVisible = false
		},

		// 显示化学结构式
		showChem(isProcedure, index = null) {
			const self = this
			if (!isProcedure) {
				this.chemViewerIndex = index
			}
			this.chemViewerVisible = true

			this.$nextTick(() => {
				this.loadChemViewer('chemViewer', (chemViewer) => {
					let chemObj = null
					if (isProcedure) {
						chemObj = self.loadChemMainData(self.formProcedures[self.chemViewerIndex])
					} else {
						chemObj = self.loadChemMainData(self.formRecords[self.chemViewerIndex])
					}
					if (chemObj !== null) {
						chemViewer.setChemObj(chemObj)
					}
				})
			})
		},
		// 加载一个Kekule viewer 对象
		loadChemViewer(id, callback) {
			Kekule.X.domReady(() => {
				const chemViewer = new Kekule.ChemWidget.Viewer(document.getElementById(id))
				chemViewer
				.setEnableDirectInteraction(true)
				.setEnableEdit(false)
				if (id !== 'procedureChemViewer') {
					chemViewer.setEnableToolbar(true).
					setToolButtons(['zoomIn', 'zoomOut', 'rotateLeft', 'rotateRight', 'rotateX', 'rotateY', 'rotateZ'])
				} else {
					chemViewer.setEnableToolbar(false)
				}

				callback(chemViewer)
			})
		},
		loadChemMainData(sourceObj) {
			if (sourceObj.chem_xml !== undefined && sourceObj.chem_xml !== null) {
				return Kekule.IO.loadFormatData(sourceObj.chem_xml, 'Kekule-XML')
			}
			return null
		},

	}
}
</script>

<style lang="scss">
@import '@/styles/my_variables.scss';

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

pre {
	margin: 0;
	font-family: inherit;
	word-break: break-word;
}

.text-box {
	padding: 5px 15px;
	margin: 0;
	border: 1px solid #e6ebf5;
	border-radius: 4px;
	color: $text-major;
	min-height: 32px;

	&.plain {
		padding: 0;
		border: none;
	}
}
</style>
