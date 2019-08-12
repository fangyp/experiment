<template>
	<div class="app-container">
		<!-- 页面主体 -->
		<el-row>
			<el-col :sm="22" :lg="12" :xl="12">
				<el-card class="box-card">
					<el-form ref="addForm" :model="addForm" :rules="addRules" label-width="80px">
						<el-form-item label="实验名称" prop="experiment_name">
							<el-input v-model="addForm.experiment_name" maxlength="20" />
						</el-form-item>
						<el-form-item label="实验类型" prop="experiment_type">
							<el-radio v-model="addForm.experiment_type" label="application" border>应用</el-radio>
							<el-radio v-model="addForm.experiment_type" label="synthetic" border>合成</el-radio>
						</el-form-item>
						<el-form-item label="实验编号" prop="experiment_no">
							<el-input v-model="addForm.experiment_no" />
						</el-form-item>
						<el-form-item label="温度" prop="temperature">
							<el-input v-model="baseForm.temperature"><template slot="append">℃</template></el-input>
						</el-form-item>
						<el-form-item label="湿度" prop="humidity">
							<el-input v-model="baseForm.humidity"><template slot="append">RH%</template></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="showAdd">立即创建</el-button>
							<el-button>取消</el-button>
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>
		</el-row>
		<!-- 页面主体 -->

	</div>
	<!-- /.app-container -->
</template>

<script>
import poppyjs from 'poppyjs-elem'
import waves from '../../directive/waves'
// import webcore from '@/webcore'
import { addExperiment } from '@/api/experiment'
import { baseRules } from './validation_rules'

export default {
	name: 'ExperimentAdd',
	directives: { waves },
	data() {
		return {
			addForm: {
				experiment_name: '',
				experiment_type: '',
				experiment_no: '',
				temperature: '',
				humidity: ''
			},
			addRules: baseRules
		}
	},

	mounted: function() {
	},

	methods: {

		// 显示创建确认
		showAdd() {
			const self = this
			/*
			this.$nextTick(() => {
				this.$refs["createForm"].clearValidate();
			});
			*/
			poppyjs.html.Dialog.showConfirm({
				msg: '确定创建该实验吗？',
				title: '创建新实验',
				yesCallback: function() {
					self.submitAdd()
				}
			})
		},

		// 提交保存
		submitAdd() {
			const self = this
			this.$refs['addForm'].validate((valid) => {
				if (!valid) {
					return false
				}
				const params = {
					experiment_name: self.addForm.experiment_name.trim(),
					experiment_type: self.addForm.experiment_type,
					experiment_no: self.addForm.experiment_no.trim(),
					temperature: self.addForm.temperature,
					humidity: self.addForm.humidity
				}
				addExperiment(params).then(function(resp) {
					// 创建成功后跳转到编辑页面
					self.$router.push('/experiment/edit/' + resp.data.experiment_id)
				})
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
