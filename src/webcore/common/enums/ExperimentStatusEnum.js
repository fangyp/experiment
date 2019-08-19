import poppyjs from 'poppyjs-elem'

class ExperimentStatusEnum extends poppyjs.biz.BaseEnum {

}

ExperimentStatusEnum.Created = 0 // 新建
ExperimentStatusEnum.AuditPending = 2 // 待审核
ExperimentStatusEnum.Auditing = 3 // 审核中
ExperimentStatusEnum.AuditRejected = 5 // 驳回
ExperimentStatusEnum.Finished = 6 // 完成
ExperimentStatusEnum.Invalid = -1 // 作废

export default ExperimentStatusEnum
