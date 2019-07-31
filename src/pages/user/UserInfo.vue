<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入姓名或账号"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleSearchAction"
      />
      <el-select
        v-model="rolekey"
        placeholder="用户角色"
        clearable
        style="margin-left:10px; width: 200px,min-height:90px"
        class="filter-item"
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.key"
          :label="item.vlaue"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px; width: 120px"
        @click="handleSearchAction"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left:10px; width: 120px"
        type="primary"
        icon="el-icon-edit"
        @click="createUserAction"
      >新增用户</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="编号"
        prop="id"
        align="center"
        min-width="60px"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span @click="handleUpdate(row)">{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="90px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" min-width="95px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.datetime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="90px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">{{ row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        min-width="200px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" plain @click="handleUpdate(row)">修改</el-button>
          <el-button size="mini" type="danger" plain @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
      <el-form
        ref="createForm"
        :rules="validations"
        :model="newuser"
        label-position="left"
        label-width="80px"
        style="width: 300px; margin-left:10px;"
      >
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="newuser.username" style="width: 220px;" placeholder="姓名" />
        </el-form-item>

        <el-form-item label="登录账号" prop="account">
          <el-input v-model="newuser.account" style="width: 220px;" placeholder="用户登录账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newuser.password" style="width: 220px;" placeholder="用户登录密码" />
        </el-form-item>
        <el-form-item label="用户角色" prop="role">
          <el-select
            v-model="newuser.role"
            class="filter-item"
            placeholder="请选择角色"
            style="width: 220px;"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态" prop="status">
          <el-select
            v-model="newuser.status"
            class="filter-item"
            placeholder="设置用户状态"
            style="width: 220px;"
          >
            <el-option
              v-for="item in statusOption"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            />
          </el-select>
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
import { createArticle, updateArticle } from '../../api/article'
import waves from '../../directive/waves' // waves directive
import { parseTime } from '../../utils'
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

const List = []

const image_uri =
  'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment',
			username: '小刘刘',
			account: '18168896116',
			role: '实验组长',
			datetime: +Mock.Random.date('T'),
			author: '@first',
			reviewer: '@first',
			title: '@title(5, 10)',
			content_short: 'mock data',
			forecast: '@float(0, 100, 2, 2)',
			importance: '@integer(1, 3)',
			'type|1': ['CN', 'US', 'JP', 'EU'],
			'status|1': ['enable', 'disable'],
			display_time: '@datetime',
			comment_disabled: true,
			pageviews: '@integer(300, 5000)',
			image_uri,
			platforms: ['a-platform']
		})
	)
}

const calendarTypeOptions = [
	{ key: 'CN', display_name: '院长' },
	{ key: 'US', display_name: '实验组长' },
	{ key: 'JP', display_name: '实验人员' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
	acc[cur.key] = cur.display_name
	return acc
}, {})

export default {
	name: 'UserInfo',
	components: { Pagination },
	directives: { waves },
	filters: {
		statusFilter(status) {
			const statusMap = {
				enable: 'success',
				disable: 'danger'
			}
			return statusMap[status]
		},
		typeFilter(type) {
			return calendarTypeKeyValue[type]
		}
	},
	data() {
		return {
			keyword: '' /** 搜索条件 */,
			rolekey: '' /** 搜索条件角色 */,
			roleOptions: [
				{ key: '1', value: '院长' },
				{ key: '2', value: '实验组长' },
				{ key: '3', value: '实验人员' }
			],
			statusOption: [
				{ key: '0', value: '禁用账户' },
				{ key: '1', value: '启用账户' }
			],
			newuser: {
				/** 新建用户模板 */
				username: '',
				account: '',
				password: '',
				role: '',
				status: ''
			},

			validations: {
				username: [
					{ required: true, message: '请填写用户姓名', trigger: 'change' }
				],
				account: [
					{ required: true, message: '请填写用户账户', trigger: 'change' }
				],
				password: [
					{ required: true, message: '密码必须设置', trigger: 'change' }
				],
				role: [
					{ required: true, message: '请选择用户角色', trigger: 'change' }
				],
				status: [
					{ required: true, message: '请设置账户状态', trigger: 'change' }
				]
			},
			createFormVisible: false /** 新建&修改用户信息弹出层的显示或隐藏 */,
			createFormStatus: '' /** create or update 标记是新增用户还是修改用户 */,
			formTitles: {
				update: '修改用户',
				create: '新增用户'
			},

			tableKey: 0,
			list: null,
			total: 0,
			listLoading: true,
			listQuery: {
				page: 1,
				limit: 20,
				importance: undefined,
				name: undefined,
				type: undefined,
				sort: '+id'
			},
			importanceOptions: [1, 2, 3],
			calendarTypeOptions,
			sortOptions: [
				{ label: 'ID Ascending', key: '+id' },
				{ label: 'ID Descending', key: '-id' }
			],
			statusOptions: ['published', 'draft', 'deleted'],
			showReviewer: false,
			temp: {
				id: undefined,
				importance: 1,
				remark: '',
				timestamp: new Date(),
				title: '',
				type: '',
				status: 'published'
			},
			dialogFormVisible: false,
			dialogStatus: '',
			textMap: {
				update: '修改用户',
				create: '新增用户'
			},
			dialogPvVisible: false,
			pvData: [],
			rules: {
				type: [
					{ required: true, message: 'type is required', trigger: 'change' }
				],
				timestamp: [
					{
						type: 'date',
						required: true,
						message: 'timestamp is required',
						trigger: 'change'
					}
				],
				title: [
					{ required: true, message: 'title is required', trigger: 'blur' }
				]
			},
			downloadLoading: false
		}
	},
	created() {
		this.getList()
	},
	methods: {
		/**
     * 搜索
     */
		handleSearchAction() {
			console.log(this.keyword)
			console.log(this.rolekey)
		},
		initUser() {
			this.newuser = {
				/** 新建用户模板 */
				username: '',
				account: '',
				password: '',
				role: '',
				status: ''
			}
		},
		createUserAction() {
			this.initUser()
			this.createFormStatus = 'create'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 删除用户
     */
		deleteUser(row) {
			console.log(row)
		},

		getList() {
			this.listLoading = true
			this.list = List
			this.total = List.length
			setTimeout(() => {
				this.listLoading = false
			}, 1.5 * 1000)
		},
		handleFilter() {
			this.listQuery.page = 1
			this.getList()
		},
		handleModifyStatus(row, status) {
			this.$message({
				message: '操作Success',
				type: 'success'
			})
			row.status = status
		},
		sortChange(data) {
			const { prop, order } = data
			if (prop === 'id') {
				this.sortByID(order)
			}
		},
		sortByID(order) {
			if (order === 'ascending') {
				this.listQuery.sort = '+id'
			} else {
				this.listQuery.sort = '-id'
			}
			this.handleFilter()
		},

		createData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.newuser)
					this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
					this.temp.author = 'vue-element-admin'
					createArticle(this.temp).then(() => {
						this.list.unshift(this.temp)
						this.dialogFormVisible = false
						this.$notify({
							title: 'Success',
							message: 'Created Successfully',
							type: 'success',
							duration: 2000
						})
					})
				}
			})
		},
		handleUpdate(row) {
			this.temp = Object.assign({}, row) // copy obj
			this.temp.timestamp = new Date(this.temp.timestamp)
			this.dialogStatus = 'update'
			this.dialogFormVisible = true
			this.$nextTick(() => {
				this.$refs['dataForm'].clearValidate()
			})
		},
		updateData() {
			console.log('createForm')
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.newuser)
					const tempData = Object.assign({}, this.temp)
					tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
					updateArticle(tempData).then(() => {
						for (const v of this.list) {
							if (v.id === this.temp.id) {
								const index = this.list.indexOf(v)
								this.list.splice(index, 1, this.temp)
								break
							}
						}
						this.dialogFormVisible = false
						this.$notify({
							title: 'Success',
							message: 'Update Successfully',
							type: 'success',
							duration: 2000
						})
					})
				}
			})
		},
		handleDelete(row) {
			this.$notify({
				title: 'Success',
				message: 'Delete Successfully',
				type: 'success',
				duration: 2000
			})
			const index = this.list.indexOf(row)
			this.list.splice(index, 1)
		},

		handleFetchPv(pv) {
			this.pvData = [
				{ key: 'PC', pv: 1024 },
				{ key: 'mobile', pv: 1024 },
				{ key: 'ios', pv: 1024 },
				{ key: 'android', pv: 1024 }
			]
			this.dialogPvVisible = true
		},
		handleDownload() {
			this.downloadLoading = false
			console.log('handleDownload')
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v =>
				filterVal.map(j => {
					if (j === 'timestamp') {
						return parseTime(v[j])
					} else {
						return v[j]
					}
				})
			)
		},
		getSortClass: function(key) {
			const sort = this.listQuery.sort
			return sort === `+${key}`
				? 'ascending'
				: sort === `-${key}`
					? 'descending'
					: ''
		}
	}
}
</script>
