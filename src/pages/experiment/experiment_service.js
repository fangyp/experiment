import poppyjs from 'poppyjs-elem'
import experimentApi from '@/api/experiment'

// 显示开始测试确认
export function showTestingConfirm(experimentId, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '测试开始',
		msg: '开始测试后，可以添加测试数据。确定开始测试吗？',
		yesCallback: () => {
			experimentApi.startExperimentTesting(experimentId).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

// 显示作废确认
export function showInvaidConfirm(experimentId, params, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '数据作废',
		msg: '数据作废后，将不能恢复，确定将实验数据作废吗？',
		yesCallback: () => {
			experimentApi.updateExperimentStatus(experimentId, params).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

// 显示删除确认
export function showDeleteConfirm(experimentId, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '删除实验数据',
		msg: '数据删除后，将不能恢复，确定删除该实验数据吗？',
		yesCallback: () => {
			experimentApi.deleteExperiment({ id: experimentId }).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

// 显示提交审核申请确认
export function showApplyAuditConfirm(experimentId, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '申请审核',
		msg: '确定实验数据已经填写完好，申请审核吗？',
		yesCallback: () => {
			experimentApi.addAudit(experimentId).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

// 显示撤回审核确认
export function showRevokeAuditConfirm(experimentId, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '审核撤回',
		msg: '确定将实验审核申请撤回吗？',
		yesCallback: () => {
			experimentApi.revokeAudit(experimentId).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

// 显示开始审核确认
export function showStartAuditConfirm(experimentId, successCallback) {
	poppyjs.html.Dialog.showConfirm({
		title: '开始审核',
		msg: '将实验审核开始后，申请人将不能撤回。您可以在开始后，通过【完成审核】功能提交审核结果。确定将该实验的审核开始吗？',
		yesCallback: () => {
			experimentApi.startAudit(experimentId).then((resp) => {
				if (undefined !== successCallback && typeof successCallback === 'function') {
					successCallback(resp)
				}
			})
		}
	})
}

export function getExperimentAbility(permissions, experiment) {
	return {
		expAdd: (permissions['experiment.add']),
		edit: (permissions['experiment.update'] && experiment != null && experiment.can_edit),
		invalid: (permissions['experiment.status'] && experiment != null && experiment.can_invalid),
		delete: (permissions['experiment.delete'] && experiment != null && experiment.can_delete),
		testing: (permissions['experiment.testing'] && experiment != null && experiment.can_testing),
		auditAdd: (permissions['experiment.audit_apply'] && experiment != null && experiment.can_apply_audit),
		auditRevoke: (permissions['experiment.audit_revoke'] && experiment != null && experiment.can_revoke_audit),
		auditStart: (permissions['experiment.audit_start'] && experiment != null && experiment.can_start_audit),
		auditAudit: (permissions['experiment.audit_finish'] && experiment != null && experiment.can_finish_audit),
		testingAdd: (permissions['experiment.testing.add'] && experiment !== null && experiment.can_edit && experiment.is_testing),
		testingEdit: (permissions['experiment.testing.update'] && experiment !== null && experiment.can_edit && experiment.is_testing),
		testingDelete: (permissions['experiment.testing.delete'] && experiment !== null && experiment.can_edit && experiment.is_testing)
	}
}

export default {
	showTestingConfirm,
	showInvaidConfirm,
	showDeleteConfirm,
	showApplyAuditConfirm,
	showRevokeAuditConfirm,
	showStartAuditConfirm,
	getExperimentAbility
}
