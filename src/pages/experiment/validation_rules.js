// 实验数据基本校验规则
export const baseRules = {
	experiment_name: [
		{ max: 20, message: '最多20个字', trigger: 'blur' }
	],
	experiment_type: [
		{ required: true, message: '请选择实验类型', trigger: 'change' }
	],
	experiment_no: [
		{ max: 10, message: '最多10个字', trigger: 'blur' }
	],
	temperature: [
		{ type: 'number', message: '温度必须为数值', trigger: 'blur' },
		{ type: 'number', min: -999999, max: 999999, message: '范围：-999999到999999', trigger: 'blur' }
	],
	humidity: [
		{ type: 'number', message: '湿度必须为数值', trigger: 'blur' },
		{ type: 'number', min: 0, max: 999999, message: '范围：0到999999', trigger: 'blur' }
	]
}

export default {
	baseRules
}
