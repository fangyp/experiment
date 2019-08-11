<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input
				v-model="keyword"
				placeholder="请输入实验名称"
				style="width: 200px; margin-right:10px;"
				class="filter-item"
				clearable
				@keyup.enter.native="handleSearchAction"
			/>
			<el-select
				v-model="expstatus"
				placeholder="实验状态"
				clearable
				style="margin-right:10px; width: 200px"
				class="filter-item"
			>
				<el-option
					v-for="item in expOptions"
					:key="item.key"
					:label="item.value"
					:value="item.key"
				/>
			</el-select>
			<el-select
				v-show="searchBarOneLine"
				v-model="expteam"
				placeholder="实验小组"
				clearable
				style="margin-right:10px; width: 200px"
				class="filter-item"
			>
				<el-option
					v-for="item in teamOptions"
					:key="item.key"
					:label="item.value"
					:value="item.key"
				/>
			</el-select>
			<el-select
				v-show="searchBarOneLine"
				v-model="tester"
				placeholder="实验员"
				clearable
				style="margin-right:10px;width: 200px"
				class="filter-item"
			>
				<el-option
					v-for="item in testerOptions"
					:key="item.key"
					:label="item.value"
					:value="item.key"
				/>
			</el-select>
			<el-button
				v-waves
				class="filter-item"
				type="primary"
				icon="el-icon-search"
				style="width: 120px"
				@click="handleSearchAction"
			>搜索</el-button>
			<el-button
				class="filter-item"
				style="margin-right:10px; width: 120px"
				type="primary"
				icon="el-icon-edit"
				@click="createAction"
			>新建实验</el-button>
		</div>
		<div v-show="!searchBarOneLine" class="filter-container">
			<el-select
				v-model="expteam"
				placeholder="实验小组"
				clearable
				style="margin-right:10px; width: 200px"
				class="filter-item"
			>
				<el-option
					v-for="item in teamOptions"
					:key="item.key"
					:label="item.value"
					:value="item.key"
				/>
			</el-select>
			<el-select
				v-model="tester"
				placeholder="实验员"
				clearable
				style="margin-right:10px; width: 200px"
				class="filter-item"
			>
				<el-option
					v-for="item in testerOptions"
					:key="item.key"
					:label="item.value"
					:value="item.key"
				/>
			</el-select>
		</div>
		<el-table
			:key="tableKey"
			v-loading="showLoading"
			:data="userList"
			border
			fit
			highlight-current-row
			style="width: 100%;"
		>
			<el-table-column label="编号" prop="id" align="center" min-width="60px">
				<template slot-scope="scope">
					<span>{{ scope.row.id }}</span>
				</template>
			</el-table-column>
			<el-table-column label="实验名称" min-width="160px" align="center">
				<template slot-scope="{row}">
					<span @click="detailAction(row)">{{ row.expname }}</span>
				</template>
			</el-table-column>
			<el-table-column label="实验员" min-width="70px" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.tester }}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" class-name="status-col" min-width="85px">
				<template slot-scope="{row}">
					<el-tag :type="row.expstatus | expStatusFilter">{{ row.expstatus | expStatusText }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="创建日期" min-width="95px" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.createtime | parseTime('{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>

			<el-table-column
				label="操作"
				align="center"
				min-width="200px"
				class-name="small-padding fixed-width"
			>
				<template slot-scope="{row}">
					<el-button type="primary" size="small" plain @click="detailAction(row)">实验详情</el-button>
					<el-dropdown trigger="click" style="margin-left:30px">
						<span class="el-dropdown-link">
							更多
							<i class="el-icon-arrow-down el-icon--right" />
						</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item @click.native="modifyAction(row)">修改</el-dropdown-item>
							<el-dropdown-item @click.native="deleteAction(row)">删除</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</template>
			</el-table-column>
		</el-table>
		<pagination
			v-show="pageMap.total>0"
			:total="pageMap.total"
			:page.sync="pageMap.page"
			:limit.sync="pageMap.limit"
			@pagination="getUserList"
		/>

		<el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
			<el-form
				ref="createForm"
				:rules="rules"
				:model="createTemplate"
				label-position="left"
				label-width="100px"
				style="width: 400px; margin-left:10px;"
			>
				<el-form-item label="实验名称" prop="expname">
					<el-input v-model="createTemplate.expname" style="width: 220px;" placeholder="请输入实验名称" />
				</el-form-item>
				<el-form-item label="温度" prop="temperature">
					<el-input v-model="createTemplate.temperature" style="width: 220px;" placeholder="请输入温度" />
					<span>℃</span>
				</el-form-item>
				<el-form-item label="湿度" prop="humidity">
					<el-input v-model="createTemplate.humidity" style="width: 220px;" placeholder="请输入湿度" />
					<span>%</span>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="medium" @click="createFormVisible = false">取消</el-button>
				<el-button
					size="medium"
					type="primary"
					@click="createFormStatus==='create'?createData():updateData()"
				>确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import poppyjs from 'poppyjs-elem'
import webcore from '../../webcore'
const isEmpty = poppyjs.util.StringUtil.isEmpty
const showConfirm = poppyjs.html.Dialog.showConfirm
// , setUserInfo, removeUserInfo
import { getUserInfo } from '../../utils/auth'
const user = getUserInfo()
console.log(user)

const request = webcore.common.utils.NetUtil.adminRequest
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

/**
 * 实验状态 新建、测试中、待审核、审核中、撤回、驳回、完成、作废
 */
const expOptions = [
	{ key: '1', value: '新建' },
	{ key: '2', value: '测试中' },
	{ key: '3', value: '待审核' },
	{ key: '4', value: '审核中' },
	{ key: '5', value: '撤回' },
	{ key: '6', value: '驳回' },
	{ key: '7', value: '完成' },
	{ key: '8', value: '作废' }
]

/**
 * 实验小组
 */
const teamOptions = [
	{ key: '1', value: '实验一组' },
	{ key: '2', value: '实验二组' },
	{ key: '3', value: '实验三组' }
]

/**
 * 实验员
 */
const testerOptions = [
	{ key: '0', value: '张三三' },
	{ key: '1', value: '李四四' },
	{ key: '2', value: '王五五' },
	{ key: '3', value: '赵六六' },
	{ key: '4', value: '朱七七' },
	{ key: '5', value: '马八八' }
]

/** 新建模板 */
const createTemplate = {
	expname: '', // 实验名称
	temperature: '', // 温度 ˈtemprətʃər
	humidity: '' // 湿度 hjuːˈmɪdəti
}

const List = []

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment', // 用户编号
			expname: '金三胖减肥茶研发',
			temperature: '30℃', // 温度 ˈtemprətʃər
			humidity: '70%', // 湿度 hjuːˈmɪdəti
			tester: '金三胖', // 实验员
			'expstatus|1': expOptions,
			createtime: +Mock.Random.date('T'),
			finishtime: +Mock.Random.date('T')
		})
	)
}

export default {
	name: 'EmpList',
	components: { Pagination },
	directives: { waves },
	filters: {
		// 用户获取状态颜色
		expStatusFilter(status) {
			const stateOption = {
				'1': '',
				'2': 'warning',
				'3': 'warning',
				'4': 'warning',
				'5': 'info',
				'6': 'danger',
				'7': 'success',
				'8': 'info'
			}
			return stateOption[status.key]
		},
		/**
     * 显示文本
     */
		expStatusText(status) {
			console.log(status)
			const stateOption = {
				'1': '新建',
				'2': '测试中',
				'3': '待审核',
				'4': '审核中',
				'5': '撤回',
				'6': '驳回',
				'7': '完成',
				'8': '作废'
			}
			return stateOption[status.key]
		}
	},
	data() {
		return {
			screenWidth: window.innerWidth, // 窗口宽度
			searchBarOneLine: true, // 搜索内容是否在一行显示

			keyword: '' /** 搜索条件 */,
			expstatus: '' /** 搜索条件状态 */,
			expOptions: expOptions, // 实验状态
			expteam: '' /** 搜索条件实验小组 */,
			teamOptions: teamOptions, // 实验小组
			tester: '' /** 搜索条件实验人员 */,
			testerOptions: testerOptions, // 实验人员
			createTemplate: createTemplate /** 新建模板 */,

			rules: {
				expname: [
					{ required: true, message: '请填写实验名称', trigger: 'blur' }
				],
				temperature: [
					{ required: true, message: '请填写实验温度', trigger: 'blur' }
				],
				humidity: [
					{ required: true, message: '请填写实验湿度', trigger: 'blur' }
				]
			},
			createFormVisible: false /** 新建&修改信息弹出层的显示或隐藏 */,
			createFormStatus: '' /** create or update 标记是新增还是修改 */,
			formTitles: {
				update: '修改实验',
				create: '新建实验'
			},

			tableKey: 0,
			userList: [],
			showLoading: true,
			pageMap: {
				page: 0,
				limit: 10,
				total: 0
			}
		}
	},
	watch: {
		screenWidth(val) {
			console.log(val)
			if (val <= 1000) {
				this.searchBarOneLine = false
			} else {
				this.searchBarOneLine = true
			}
		}
	},
	created() {
		this.getUserList()
	},
	mounted() {
		window.onresize = () => {
			return (() => {
				window.screenWidth = window.innerWidth
				if (window.screenWidth <= 1000) {
					this.searchBarOneLine = false
				} else {
					this.searchBarOneLine = true
				}
				console.log(window.screenWidth)
				console.log('window.screenWidth')
			})()
		}
	},
	methods: {
		/**
     * 获取数据列表
     */
		getUserList(pageMap) {
			if (!pageMap) pageMap = this.pageMap
			this.showLoading = true
			this.userList = []
			this.userList = List.slice(
				pageMap.page * pageMap.limit,
				pageMap.page * pageMap.limit + pageMap.limit
			)
			console.log(pageMap.page * pageMap.limit + '----------' + pageMap.limit)
			// console.log( pageMap.page * pageMap.limit +'----------'+(pageMap.page * pageMap.limit + pageMap.page * pageMap.limit));
			this.pageMap.total = List.length
			setTimeout(() => {
				this.showLoading = false
			}, 1000)
		},
		/**
     * 通往详情页面
     */
		detailAction() {
			this.$notify({
				title: '小刘提示',
				message: '点了这个要到实验详情的',
				type: 'success',
				duration: 2000
			})
		},
		/**
     * 搜索
     */
		handleSearchAction() {
			console.log('搜索条件 实验名称 == ' + this.keyword)
			console.log('搜索条件 实验状态 == ' + this.expstatus)
			console.log('搜索条件 实验小组 == ' + this.expteam)
			console.log('搜索条件 实验员 == ' + this.tester)
		},
		/** 新建 */
		createAction() {
			this.createTemplate = createTemplate
			this.createFormStatus = 'create'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 创建用户
     */
		createData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.template)
					if (isEmpty(this.createTemplate.password)) {
						console.log('密码不能为空')
					}
					const options = {
						url: '/user/create',
						method: 'POST',
						params: {
							...this.createTemplate,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '创建用户成功',
						type: 'success',
						duration: 2000
					})
				}
			})
		},

		/**
     * 修改
     */
		modifyAction(row) {
			this.createTemplate = Object.assign({}, row) // copy obj
			this.createFormStatus = 'update'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 确定修改用户消息
     */
		updateData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.createTemplate)
					const options = {
						url: '/user/update',
						method: 'POST',
						params: {
							...this.createTemplate,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '用户消息修改成功',
						type: 'success',
						duration: 2000
					})
				}
			})
		},
		/**
     * 删除
     */
		deleteAction(row) {
			console.log(row)

			const options = {
				title: '删除实验',
				msg: '确定删除这个实验数据吗?',
				yesBtn: '确定',
				noBtn: '取消',
				yesCallback: () => {
					console.log(this.createTemplate)
					const options = {
						url: '/user/delete',
						method: 'POST',
						params: {
							...this.createTemplate,
							token: user.access_token || 'token'
						}
					}
					console.log(options)
					request(options)
						.then(response => {
							console.log(response)
							this.createFormVisible = false
							/** 这里把新用户的数据拼接到用户数据列表内 */
							// this.list.unshift(this.temp);
						})
						.catch(error => {
							console.log(error)
						})
					this.createFormVisible = false
					this.$notify({
						title: '系统提示',
						message: '实验数据删除成功',
						type: 'success',
						duration: 2000
					})
				},
				noCallback: () => {}
			}

			showConfirm(options)
		},

		getList() {
			this.showLoading = true
			this.list = List
			this.total = List.length
			setTimeout(() => {
				this.showLoading = false
			}, 1.5 * 1000)
		},
		/**
     * 改变用户状态
     */
		changeState(row) {
			console.log(row)
		}
	}
}
</script>
<style>
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
