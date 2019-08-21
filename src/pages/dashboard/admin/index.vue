<template>
	<div class="dashboard-editor-container" style="min-height: 700px;">
		<panel-group :summary="summaryData"/>

		<el-row :gutter="8" v-if="this.roles.includes('team_leader')">
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
import { mapGetters } from 'vuex'

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
			this.summaryData = resp.data.summary
			this.auditPendingList = resp.data.audit_pending_list
		})
	},
	computed: {
		...mapGetters(['roles'])
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
