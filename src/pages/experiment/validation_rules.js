// 实验数据基本校验规则
export const baseRules = {
	experiment_name: [
		{ max: 20, message: '最多20个字', trigger: 'blur' }
	],
	experiment_type: [
		{ required: true, message: '请选择实验类型', trigger: 'change' }
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

export const baseRules2 = {
	purpose: [
		{ max: 200, message: '200字以内', trigger: 'blur' }
	],
	r_nco: [
		{ max: 100, message: '100字以内', trigger: 'blur' }
	]
}

export const baseRules3 = {
	conclusion: [
		{ max: 500, message: '500字以内', trigger: 'blur' }
	]
}

export default {
	baseRules,
	baseRules2,
	baseRules3
}
