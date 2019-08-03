<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入关键字进行搜索"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleSearchAction"
      />
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
        @click="createAction"
      >新增实验组</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="showLoading"
      :data="dataList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="实验组名称" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.empname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验组⻓" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag size="small">{{ row.leaderid | findLeaderName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="实验员" min-width="220px">
        <template slot-scope="scope">
          <el-tag
            v-for="testerid in scope.row.testers"
            :key="testerid"
            type="info"
            size="small"
          >{{ testerid | findTesterName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" plain @click="modifyData(row)">修改</el-button>
          <el-button size="mini" type="danger" plain @click="deleteAction(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="pageMap.total>0"
      :total="pageMap.total"
      :page.sync="pageMap.page"
      :limit.sync="pageMap.limit"
      @pagination="getDataList"
    />

    <el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
      <el-form
        ref="createForm"
        :rules="validations"
        :model="group"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:10px;"
      >
        <el-form-item label="实验组名称" prop="empname">
          <el-input v-model="group.empname" style="width: 220px;" placeholder="实验组名称" />
        </el-form-item>

        <el-form-item label="实验组长" prop="leaderid">
          <el-radio-group v-model="group.leaderid" @change="onLeaderChange">
            <el-radio
              v-for="item in leaderOptions"
              :key="item.id"
              style="padding-right:10px;padding-bottom:15px"
              :label="item.id"
            >{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实验员" prop="testers">
          <el-checkbox-group v-model="group.testers" @change="onTesterChecked">
            <el-checkbox
              v-for="item in testerOptions"
              :key="item.id"
              style="padding-right:10px"
              :label="item.id"
            >{{ item.name }}</el-checkbox>
          </el-checkbox-group>
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
// const isEmpty = poppyjs.util.StringUtil.isEmpty
const showConfirm = poppyjs.html.Dialog.showConfirm
// , setUserInfo, removeUserInfo
import { getUserInfo } from '../../utils/auth'
const user = getUserInfo()
console.log(user)
// const defaultRole = { key: '3', value: '实验人员' }
// const defaultState = { key: 'enable', value: '正常' }

const request = webcore.common.utils.NetUtil.adminRequest
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination
import Mock from 'mockjs'

const List = []

for (let i = 0; i < 100; i++) {
	List.push(
		Mock.mock({
			id: '@increment',
			empname: '我是实验组名称',
			leaderid: '0',
			testers: ['0', '2']
		})
	)
}

const leaderOptions = [
	{ id: '0', name: '张三三' },
	{ id: '1', name: '李四四' },
	{ id: '2', name: '王五五' },
	{ id: '3', name: '赵六六' },
	{ id: '4', name: '朱七七' },
	{ id: '5', name: '马八八' },
	{ id: '6', name: '丁三石' },
	{ id: '7', name: '哈哈哈' }
]
const testerOptions = [
	{ id: '0', name: '张三三' },
	{ id: '1', name: '李四四' },
	{ id: '2', name: '王五五' },
	{ id: '3', name: '赵六六' },
	{ id: '4', name: '朱七七' },
	{ id: '5', name: '马八八' },
	{ id: '6', name: '丁三石' },
	{ id: '7', name: '哈哈哈' }
]

export default {
	name: 'GroupList',
	components: { Pagination },
	directives: { waves },
	filters: {
		findLeaderName(leaderid) {
			for (const item of leaderOptions) {
				const { id = '', name = '' } = item
				if (leaderid === id) {
					return name
				}
			}
		},
		findTesterName(testerid) {
			console.log(testerid)
			for (const item of testerOptions) {
				const { id = '', name = '' } = item
				if (testerid === id) {
					return name
				}
			}
		}
	},
	data() {
		return {
			keyword: '' /** 搜索条件 */,
			leaderOptions: leaderOptions,
			testerOptions: testerOptions,
			group: {
				empname: '',
				leaderid: '', // 选中的组长
				testers: [] // 选中的测试员
			},
			validations: {
				empname: [
					{ required: true, message: '请填写实验组名称', trigger: 'change' }
				],
				leaderid: [{ required: true, message: '请选择一个实验组长' }],
				testers: [{ required: true, message: '请选择测试员' }]
			},
			createFormVisible: false /** 新建&修改用户信息弹出层的显示或隐藏 */,
			createFormStatus: '' /** create or update 标记是新增用户还是修改用户 */,
			formTitles: {
				update: '修改实验组',
				create: '新增实验组'
			},

			tableKey: 0,
			dataList: [],
			showLoading: true,
			pageMap: {
				page: 0,
				limit: 10,
				total: 0
			}
		}
	},
	created() {
		this.getDataList()
	},

	methods: {
		getDataList(pageMap) {
			if (!pageMap) pageMap = this.pageMap
			this.showLoading = true
			this.dataList = []
			this.dataList = List.slice(
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
     * 搜索
     */
		handleSearchAction() {
			console.log(this.keyword)
		},
		initCreate() {
			this.group = {
				empname: '',
				leaderid: '', // 选中的组长
				testers: [] // 选中的测试员
			}
		},
		/** 单选框回调 */
		onLeaderChange(item) {
			// this.group.leaderid = item;
			console.log('item', item)
			console.log(this.group.leaderid)
		},
		/** 多选框回调 */
		onTesterChecked(val) {
			// this.group.leaderid = item;
			console.log(this.group.testers)
		},

		/** 新建 */
		createAction() {
			this.initCreate()
			this.createFormStatus = 'create'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/** 确定新建 */
		createData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.group)
					//   if (isEmpty(this.user.password)) {
					//     console.log("密码不能为空");
					//   }
					const options = {
						url: '/user/create',
						method: 'POST',
						params: {
							...this.user,
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
						message: '创建实验组成功',
						type: 'success',
						duration: 2000
					})
				}
			})
		},

		/**
     * 修改
     */
		modifyData(row) {
			console.log(row)
			this.group = Object.assign({}, row) // copy obj
			console.log(this.group)
			//   for (let option in testerOptions) {
			//     this.$set(this.group.testers, option, [option]);
			//   }

			this.createFormStatus = 'update'
			this.createFormVisible = true
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/**
     * 确定修改
     */
		updateData() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					console.log(this.user)
					const options = {
						url: '/user/update',
						method: 'POST',
						params: {
							...this.user,
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
     * 删除用户
     */
		deleteAction(row) {
			console.log(row)

			const options = {
				title: '删除实验组',
				msg: '删除后实验组内的成员将会解散,确定删除吗？',
				yesBtn: '确定',
				noBtn: '取消',
				yesCallback: () => {
					console.log(this.user)
					const options = {
						url: '/user/delete',
						method: 'POST',
						params: {
							...this.user,
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
						message: '实验组删除成功',
						type: 'success',
						duration: 2000
					})
				},
				noCallback: () => {}
			}

			showConfirm(options)
		}
	}
}
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
