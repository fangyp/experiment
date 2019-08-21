<template>
	<div class="dashboard-editor-container" style="min-height: 800px;">
		<panel-group :summary="summaryData"/>

		<el-row :gutter="8" v-if="null !== auditPendingList">
			<el-col
				:xs="{span: 24}"
				:sm="{span: 24}"
				:md="{span: 24}"
				:lg="{span: 12}"
				:xl="{span: 12}"
				style="padding-right:8px;margin-bottom:30px;"
			>
				<transaction-table :list="auditPendingList"/>
			</el-col>
		</el-row>
	</div>
</template>

<script>
import dashboardApi from "@/api/dashboard";
import PanelGroup from "./components/PanelGroup";
import TransactionTable from "./components/TransactionTable";

export default {
	name: "DashboardAdmin",
	components: {
		PanelGroup,
		TransactionTable
	},
	data() {
		return {
			summaryData: {},
			auditPendingList: null,
		};
	},
	created() {
		dashboardApi.getSummary().then(resp => {
			this.summaryData = resp.data.summary;
			this.auditPendingList = resp.data.audit_pending_list;
			/*
			this.auditPendingList = [
				{experiment_id: 1001, experiment_name: '实验一二三四五六七'},
				{experiment_id: 1002, experiment_name: '实验一二三四五六222七'},
			]
			*/
		})
	}
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
	padding: 32px;
	background-color: rgb(240, 242, 245);
	position: relative;

	.github-corner {
		position: absolute;
		top: 0px;
		border: 0;
		right: 0;
	}

	.chart-wrapper {
		background: #fff;
		padding: 16px 16px 0;
		margin-bottom: 32px;
	}
}

@media (max-width: 1024px) {
	.chart-wrapper {
		padding: 8px;
	}
}
</style>
