<template>
	<div v-if="null === experiment" class="app-container text-center">
		<el-alert
			v-if="loaded"
			title="实验不存在！"
			class="pad-lg"
			type="error"
			description="您可能查询了错误的实验，或者该实验已被删除"
			center
			show-icon
			:closable="false"
		/>
		<!-- 这个有需要吗？ -->
		<el-button v-if="loaded" type="info" plain class="mg-t-md" @click="gotoHome">返回首页</el-button>
	</div>
	<div v-else class="app-container">
		<!-- fangyangping start -->
		<!-- 操作栏 -->
		<div style="display: flex;justify-content:flex-end">
			<el-button v-if="experimentAbility.delete" type="danger" plain @click="showDeleteConfirm">删除</el-button>
			<el-button v-if="experimentAbility.invalid" type="danger" plain @click="showInvaidConfirm">作废</el-button>
			<el-button plain @click="loadData">刷新</el-button>
			<el-button v-if="experimentAbility.testing" plain @click="showTestingConfirm">测试</el-button>
			<el-button v-if="experimentAbility.edit" plain @click="gotoEdit">编辑</el-button>
			<el-button
				v-if="experimentAbility.auditStart"
				type="primary"
				plain
				@click="showStartAuditConfirm"
			>开始审核</el-button>
			<el-button v-if="experimentAbility.auditAudit" type="primary" plain @click="showAudit">完成审核</el-button>
			<el-button
				v-if="experimentAbility.auditAdd"
				type="primary"
				plain
				@click="showApplyAuditConfirm"
			>提交审核</el-button>
			<el-button
				v-if="experimentAbility.auditRevoke"
				type="primary"
				plain
				@click="showRevokeAuditConfirm"
			>撤回审核</el-button>

		</div>
		<!-- 基本信息-->
		<el-row :gutter="20" style="margin-top:20px;">
			<el-col :span="24">
				<el-card shadow="never" class="box-card">
					<div
						slot="header"
						class="clearfix"
						style="display: flex;flex-direction: row;justify-content:space-between;"
					>
						<div class="card-title-text" style="width:50%;">基本信息</div>
						<div style="display: flex;width:50%;flex-direction: row;justify-content:space-between;">
							<div class="card-panel-box">
								状态:
								<el-tag
									size="mini"
									:type="experiment.experiment_status | expStatusFilter"
								>{{ experiment ? experiment.experiment_status_formatted : '' }}</el-tag>
							</div>
							<div class="card-panel-box">
								测试:
								<el-tag
									:type="experiment.is_testing | testStatusFilter"
									size="small"
								>{{ experiment && experiment.is_testing ? '已测试': '无测试' }}</el-tag>
							</div>
						</div>
					</div>

					<div style="display: flex;flex-direction: row;justify-content:space-around">
						<div style="width:50%;display: flex;flex-direction: column">
							<div class="card-panel-box" style="margin-bottom: 8px;">
								实验名称:
								<span class="card-panel-text">{{ experiment.experiment_name }}</span>
							</div>
							<div class="card-panel-box" style="margin-bottom: 8px;">
								实验类型:
								<span class="card-panel-text">{{ experiment.experiment_type_formatted }}</span>
							</div>
							<div class="card-panel-box">
								实验员:
								<span class="card-panel-text">{{ experiment.user_name }}</span>
							</div>
						</div>
						<div style="width:50%;display: flex;flex-direction: column;">
							<div class="card-panel-box" style="margin-bottom: 8px;">
								温度:
								<span class="card-panel-text">{{ experiment.temperature }} ℃</span>
							</div>
							<div class="card-panel-box" style="margin-bottom: 8px;">
								湿度:
								<span class="card-panel-text">{{ experiment.humidity }} RH%</span>
							</div>
							<div class="card-panel-box">
								日期:
								<span class="card-panel-text">{{ experiment.experiment_date }}</span>
							</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 实验步骤-->
		<el-row :gutter="20" style="margin-top:10px;">
			<el-col :span="24">
				<el-tabs type="card" tab-position="top" style="margin-top: 10px;">
					<!-- 实验步骤和参数 Tab -->
					<el-tab-pane label="实验步骤和参数">
						<el-form
							v-model="formProcedures"
							label-position="left"
							class="demo-table-expand"
							size="mini"
						>
							<div
								class="el-table el-table--fit el-table--striped el-table--enable-row-transition procedure-table"
							>
								<table
									cellspacing="0"
									cellpadding="0"
									border="0.1"
									class="el-table__body"
									style="width:100%"
								>
									<thead>
										<tr>
											<td style="min-width:20px; width:60px" class="text-center">序号</td>
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
											<tr
												:key="'pro-' + index"
												style="height:40px ;"
												:class="'el-table__row' + (index%2 ==1 ? 'el-table__row': '')"
											>
												<!-- el-table__row--striped -->
												<td
													:rowspan="procedure.experiment_parameters.length"
													class="seq-col"
												>{{ index + 1 }}</td>
												<!-- 步骤列 -->
												<td
													:rowspan="procedure.experiment_parameters.length"
													class="first-col"
												>{{ procedure.procedure_title }}</td>

												<!-- 一个步骤的首行参数行 -->
												<template
													:if="procedure.experiment_parameters != null && procedure.experiment_parameters.length > 0"
												>
													<td>{{ procedure.experiment_parameters[0].reagent }}</td>
													<td>{{ procedure.experiment_parameters[0].theoretical_volum }}</td>
													<td>{{ procedure.experiment_parameters[0].actual_volum }}</td>
													<td>{{ procedure.experiment_parameters[0].remark }}</td>
													<td />
												</template>

												<!-- 实验记录列 -->
												<td :rowspan="procedure.experiment_parameters.length" class="last-col">
													<pre
														class="text-box plain"
														@click="showProcedureRecord($event, procedure.record_content)"
													>{{ procedure.record_content }}</pre>
												</td>
											</tr>

											<!-- 一个步骤的其他参数行 -->
											<template v-for="(parameters, index2) in procedure.experiment_parameters">
												<tr
													v-if="index2 > 0"
													:key="'par-' + index + '-' + index2"
													style="height:44px"
													:class="'el-table__row' + (index%2 ==1 ? ' el-table__row--striped': '')"
												>
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
						<el-form
							v-model="formProcedures"
							label-position="left"
							class="demo-table-expand"
							size="mini"
						>
							<div
								class="el-table el-table--fit el-table--striped el-table--enable-row-transition record-table"
							>
								<table
									cellspacing="0"
									cellpadding="0"
									border="0"
									class="el-table__body"
									style="width:100%"
								>
									<thead>
										<tr style="height:44px">
											<td style="min-width:20px; width:60px" class="text-center">序号</td>
											<td style="min-width:300px;%" class="text-left">记录内容</td>
										</tr>
									</thead>

									<tbody>
										<tr
											v-for="(record, index) in formRecords"
											:key="'rec-' + index"
											style="height:40px"
											:class="'el-table__row' + (index%2 ==1 ? 'el-table__row': '')"
										>
											<!-- el-table__row--striped -->
											<td class="text-center">{{ index + 1 }}.</td>
											<td>
												<pre class="text-box plain">{{ record.content }}</pre>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</el-form>
					</el-tab-pane>
					<!-- 实验记录 Tab -->

					<!-- 实验测试记录 Tab -->
					<el-tab-pane v-if="hasTestingTab" label="实验测试记录">
						<el-form
							v-model="formTestings"
							label-position="left"
							class="demo-table-expand"
							size="mini"
						>
							<el-button
								v-if="experimentAbility.testingAdd"
								type="primary"
								size="mini"
								icon="el-icon-plus"
								style="float:right"
								class="mg-b-xs"
								@click="showAddTesting"
							/>
							<el-table :data="formTestings" border fit highlight-current-row style="width: 100%;">
								<el-table-column label="No" min-width="45px" align="center" width="45px">
									<template slot-scope="row">{{ row.$index + 1 }}</template>
								</el-table-column>
								<el-table-column label="测试项目" header-align="center" align="left">
									<template slot-scope="{row}">
										<pre style="margin:0 auto;">{{ row.testing_item }}</pre>
									</template>
								</el-table-column>

								<el-table-column label="测试结果" header-align="center" align="left">
									<template slot-scope="{row}">
										<pre style="margin:0 auto;">{{ row.testing_result }}</pre>
									</template>
								</el-table-column>

								<el-table-column label="测试日期" prop="testing_date" min-width="90px" align="center" />

								<el-table-column
									label="操作"
									align="center"
									min-width="80px"
									class-name="small-padding fixed-width"
								>
									<template slot-scope="{row}">
										<el-dropdown trigger="click" size="small" @command="handleTestingMenuClick">
											<span class="el-dropdown-link">
												更多
												<i class="el-icon-arrow-down el-icon--right" />
											</span>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item
													v-if="experimentAbility.testingEdit"
													:command="{cmd:'edit', row}"
												>修 改</el-dropdown-item>
												<el-dropdown-item
													v-if="experimentAbility.testingDelete"
													:command="{cmd:'delete', row}"
												>删 除</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</template>
								</el-table-column>
							</el-table>
						</el-form>
					</el-tab-pane>
					<!-- 实验测试 Tab -->
				</el-tabs>
			</el-col>
		</el-row>
		<!-- 实验目的 R值、NCO残留量-->
		<el-row :gutter="20" style="margin-top:10px;">
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix">
						<span class="card-title-text">实验目的</span>
					</div>
					<div style="display: flex;flex-direction: column;">
						<pre class="card-text-box">{{ experiment.purpose }}</pre>
					</div>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix">
						<span class="card-title-text">R值、NCO残留量</span>
					</div>
					<div style="display: flex;flex-direction: column;">
						<pre class="card-text-box">{{ experiment.r_nco }}</pre>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<!-- 结果与讨论-->
		<el-row :gutter="20" style="margin-top:10px;">
			<el-col :span="24">
				<el-card shadow="never" class="box-card">
					<div slot="header" class="clearfix">
						<span class="card-title-text">结果与讨论</span>
					</div>
					<div style="display: flex;flex-direction: column;">
						<pre class="card-text-box">{{ experiment.conclusion }}</pre>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<!-- fangyangping end -->

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
			<div class="record-edit-box">
				<pre class="text-box">{{ showRecordContent }}</pre>
			</div>
		</el-drawer>

		<!-- 测试记录新增/编辑弹出框 -->
		<el-dialog :title="addTestingFlag?'添加测试记录':'编辑测试记录'" :visible.sync="addTestingVisible">
			<el-form
				ref="addTestingForm"
				:rules="addTestingFormRules"
				:model="formTesting"
				label-position="left"
				label-width="100px"
				style="width: 400px; margin-left:10px;"
			>
				<el-form-item label="测试日期" prop="testing_date">
					<el-col :span="8">
						<el-date-picker
							v-model="formTesting.testing_date"
							type="date"
							placeholder="选择日期"
							:picker-options="pickerOptions"
							format="yyyy-MM-dd"
							value-format="yyyy-MM-dd"
							style="width: 220px;"
						/>
					</el-col>
				</el-form-item>

				<el-form-item label="测试项目" prop="testing_item">
					<el-input
						v-model="formTesting.testing_item"
						type="textarea"
						rows="6"
						style="width: 220px;"
						show-word-limit
					/>
				</el-form-item>

				<el-form-item label="测试结果" prop="testing_result">
					<el-input
						v-model="formTesting.testing_result"
						type="textarea"
						rows="6"
						style="width: 220px;"
						show-word-limit
					/>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="medium" @click="hideAddTesting">取消</el-button>
				<el-button size="medium" type="primary" @click="submitTestingSave(addTestingFlag)">确定</el-button>
			</div>
		</el-dialog>

		<!-- 实验审核弹框 -->
		<experiment-audit
			:visible="experimentAuditVisible"
			:experiment="experiment"
			:close-callback="handleAuditClose"
			:confirm-callback="handleAuditConfirm"
		/>
	</div>
	<!-- /.app-container -->
</template>

<script>
import poppyjs from 'poppyjs-elem'
import experimentApi from '@/api/experiment'
import { mapGetters } from 'vuex'
import {
	baseRules,
	baseRules2,
	baseRules3,
	testingRules
} from './validation_rules'
import experimentService from './experiment_service'
import ExperimentAudit from './Audit'

export default {
	name: 'ExperimentInfo',
	components: {
		ExperimentAudit
	},
	filters: {
		// 用户获取状态颜色
		expStatusFilter(status) {
			const stateOption = {
				'0': '',
				'1': 'warning',
				'2': 'warning',
				'3': 'warning',
				'5': 'danger',
				'6': 'success',
				'-1': 'info'
			}
			return stateOption[status]
		},
		testStatusFilter(status) {
			const stateOption = {
				'0': 'warning',
				'1': 'success'
			}
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
				shortcuts: [
					{
						text: '今天',
						onClick(picker) {
							picker.$emit('pick', new Date())
						}
					}
				]
			}
		}
	},

	computed: {
		...mapGetters(['permissions']),

		experimentAbility() {
			return experimentService.getExperimentAbility(
				this.permissions,
				this.experiment
			)
		},

		// 更多菜单
		moreMenus() {
			const menus = []
			if (this.experimentAbility.testing) {
				menus.push({
					cmd: 'testing',
					title: '开始实验测试',
					icon: 'el-icon-odometer'
				})
			}
			if (this.experimentAbility.invalid) {
				menus.push({
					cmd: 'invalid',
					title: '作废实验',
					icon: 'el-icon-s-release'
				})
			}
			if (this.experimentAbility.delete) {
				menus.push({
					cmd: 'delete',
					title: '删除实验',
					icon: 'el-icon-delete'
				})
			}
			return menus
		},

		// 是否显示实验测试tab页
		hasTestingTab() {
			return this.experiment != null && this.experiment.is_testing
		}
	},

	created: function() {
		if (
			this.$route.params.id !== undefined &&
      !poppyjs.util.StringUtil.isEmpty(this.$route.params.id)
		) {
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
			experimentApi.getExperiment(this.experimentId).then(resp => {
				console.log(resp)
				this.loaded = true
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
						has_record: item.record_id != null
					}

					if (
						item.experiment_parameters === null ||
            item.experiment_parameters.length === 0
					) {
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

		gotoHome() {
			this.$router.push('/')
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
			this.$refs['addTestingForm'].validate(valid => {
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
					experimentApi
						.addExperimentTesting(self.experimentId, params)
						.then(function(resp) {
							self.hideAddTesting()
							self.loadData()
						})
				} else {
					experimentApi
						.updateExperimentTesting(self.formTesting.testing_id, params)
						.then(function(resp) {
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
					experimentApi.deleteExperimentTesting(item.testing_id).then(resp => {
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
			experimentService.showTestingConfirm(
				this.experimentId,
				{ status: 'invalid' },
				resp => {
					this.loadData()
				}
			)
		},

		// 显示作废确认
		showInvaidConfirm() {
			experimentService.showInvaidConfirm(
				this.experimentId,
				{ status: 'invalid' },
				resp => {
					this.loadData()
				}
			)
		},

		// 显示删除确认
		showDeleteConfirm() {
			experimentService.showDeleteConfirm(this.experimentId, resp => {
				this.$router.go(-1)
			})
		},

		// 显示提交审核申请确认
		showApplyAuditConfirm() {
			experimentService.showApplyAuditConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},

		// 显示撤回审核确认
		showRevokeAuditConfirm() {
			experimentService.showRevokeAuditConfirm(this.experimentId, resp => {
				this.loadData()
			})
		},

		// 显示开始审核确认
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
		}
	}
}
</script>

<style lang="scss">
.card-title-text {
  line-height: 16px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  font-weight: bold;
}
.card-panel-box {
  line-height: 16px;
  color: rgba(0, 0, 0, 0.5);
  font-size: 15px;
}
.card-panel-text {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.8);
}

.card-text-box {
  margin: 0;
  color: #303133;
  min-height: 100px;
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
