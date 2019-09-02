<template>
	<el-table :data="list" fit style="width: 100%;" empty-text="没有审核记录">
		<el-table-column label="审核时间" prop="auditted_time" min-width="100px" align="center" width="100">
			<template slot-scope="{row}">
				<pre>{{ row.auditted_time | formatDate }}</pre>
			</template>
		</el-table-column>
		<el-table-column label="审核状态" align="center" prop="audit_status_formatted" min-width="100px" width="100"/>
		<el-table-column label="审核人" align="center" prop="auditor_name" min-width="100px">
			<template slot-scope="{row}">
				<pre>{{ row.auditor_name | formatAuditorName }}</pre>
			</template>
		</el-table-column>
		<el-table-column label="审核说明" header-align="center" align="left" prop="audit_desc"/>
	</el-table>
</template>

<script>
import experimentApi from '@/api/experiment'

export default {
	name: 'AuditList',
	props: {
		experimentId: {
			type: String,
			default: null
		}
	},
	data() {
		return {
			list: []
		}
	},
	filters: {
		formatDate: function(value) {
			if (!value) {
				return '-'
			}
			return value.substr(0, 10)
		},
		formatAuditorName: function(value) {
			if (!value) {
				return '-'
			}
			return value
		},
	},
	mounted() {
		this.loadData()
	},
	methods: {
		loadData() {
			experimentApi.listAudits(this.experimentId).then(resp => {
				this.list = resp.data
			})
		}
	}
}
</script>

<style lang="scss">
</style>
