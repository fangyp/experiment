<template>
	<el-card shadow="never" class="box-card">
		<div slot="header" class="clearfix box-header">
			<div class="box-title">待审核实验</div>
		</div>
		<el-table :data="list" style="width: 100%;" :show-header="false">
			<el-table-column label="实验编号" prop="experiment_id" min-width="100" width="100" />
			<el-table-column label="实验名称" prop="experiment_name" min-with="300" align="left" />
			<el-table-column width="100" align="center">
				<template slot-scope="scope">
					<el-button type="success" plain @click="showInfo($event, scope.row.experiment_id)">处 理</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-card>
</template>

<script>
export default {
	props: {
		list: {
			type: Array,
			default: null
		},
	},
	watch: {
		list: function() {
			console.log(this.data)
		}
	},
	methods: {
		showInfo(event, id) {
			this.$router.push('/experiment/info/' + id)
		}
	}
};
</script>

<style lang="scss" scoped>

</style>
