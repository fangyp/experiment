function numericValidator(rule, value, callback) {
	if (!rule.required && (value === null || value === '')) {
		return callback()
	}
	if (/^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/.test(value) || /^-?[1-9]\d*$/.test(value)) {
		return callback()
	}
	const temp = Number(value)
	if (temp < rule.min || temp > rule.max) {
		return callback('')
	}
	return callback()
}

// 实验数据基本校验规则
export const baseRules = {
	experiment_name: [
		{ max: 20, message: '最多20个字', trigger: 'blur' }
	],
	experiment_type: [
		{ required: true, message: '请选择实验类型', trigger: 'change' }
	],
	temperature: { min: -1000, max: 1000, validator: numericValidator, message: '必须为数值，范围 -1000℃ ~ +1000℃', trigger: 'blur' },
	humidity: { min: 0, max: 100, validator: numericValidator, message: '必须为数值，范围 0% ~ 100%', trigger: 'blur' }
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

export const testingRules = {
	testing_date: [
		{ required: true, message: '该项目必须填写', trigger: 'blur' },
		{ length: 10, message: '日期格式不正确', trigger: 'blur' }
	],
	testing_item: [
		{ required: true, message: '该项目必须填写', trigger: 'blur' },
		{ max: 100, message: '最多100字', trigger: 'blur' }
	],
	testing_result: [
		{ max: 200, message: '最多200字', trigger: 'blur' }
	]
}

export default {
	baseRules,
	baseRules2,
	baseRules3,
	testingRules
}
