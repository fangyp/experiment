<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入用户姓名"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="searchAction"
      />
      <el-select
        v-show="permissionValid().add"
        v-model="role_type"
        placeholder="用户角色"
        clearable
        style="margin-left:10px; width: 240px,min-height:90px"
        class="filter-item"
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.key"
          :label="item.value"
          :value="item.key"
          style="height: 35px;"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px; width: 120px"
        @click="searchAction"
      >搜索</el-button>
      <el-button
        v-show="permissionValid().add"
        class="filter-item"
        style="margin-left:10px; width: 120px"
        type="primary"
        icon="el-icon-edit"
        @click="createAction"
      >新增用户</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="showFormLoading"
      element-loading-text="努力加载中..."
      :data="userList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyInfo(row)">{{ row.user_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="85px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyInfo(row)">{{ row.user_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户" min-width="105px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyInfo(row)">{{ row.login_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机" min-width="105px" align="center">
        <template slot-scope="{row}">
          <span @click="modifyInfo(row)">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="75px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.role_type_formatted }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" min-width="95px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.reg_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="70px">
        <template slot-scope="{row}">
          <el-tag :type="row.user_status | stateColorFilter">{{ row.user_status_formatted }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        min-width="75px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-dropdown trigger="click">
            <span
              v-show="permissionValid().add ||
								permissionValid().update ||
								permissionValid().delete ||
								permissionValid().employ_status ||
								permissionValid().user_status ||
								permissionValid().password
							"
              class="el-dropdown-link"
            >
              更多
              <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <span
              v-show="!permissionValid().add &&
								!permissionValid().update &&
								!permissionValid().delete &&
								!permissionValid().employ_status &&
								!permissionValid().user_status &&
								!permissionValid().password
							"
              class="el-dropdown-normal"
            >更多</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-show="permissionValid().update"
                @click.native="modifyInfo(row)"
              >修改信息</el-dropdown-item>
              <el-dropdown-item
                v-show="(row.can_lock ===1 || row.can_unlock ===1) && permissionValid().user_status"
                @click.native="changeState(row)"
              >{{ row.user_status|stateTextFilter }}</el-dropdown-item>
              <el-dropdown-item
                v-show="row.can_stop ===1 && permissionValid().user_status"
                @click.native="stopAccount(row)"
              >停用账户</el-dropdown-item>
              <el-dropdown-item
                v-show="permissionValid().password"
                @click.native="modifyPassAction(row)"
              >修改密码</el-dropdown-item>
              <el-dropdown-item
                v-show="permissionValid().delete"
                @click.native="deleteUser(row)"
              >删除用户</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="pageMap.total>10"
      :total="pageMap.total"
      :page.sync="pageMap.page"
      :limit.sync="pageMap.page_size"
      @pagination="getDataList"
    />

    <el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
      <el-form
        ref="createForm"
        :rules="validation[createFormStatus]"
        :model="user"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:10px;"
      >
        <el-form-item
          v-show="createFormStatus==='create' || createFormStatus==='update'"
          label="用户姓名"
          prop="user_name"
        >
          <el-input v-model="user.user_name" style="width: 220px;" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item v-show="createFormStatus==='create'" label="登录账号" prop="login_name">
          <el-input v-model="user.login_name" style="width: 220px;" placeholder="设置登录账号" />
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create' || createFormStatus==='update'"
          label="手机号码"
          prop="phone"
        >
          <el-input v-model="user.phone" style="width: 220px;" placeholder="用户手机号码" />
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create' || createFormStatus==='update'"
          label="用户角色"
          prop="role_type"
        >
          <el-select
            v-model="user.role_type"
            class="filter-item"
            placeholder="请选择角色"
            style="width: 220px;"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key"
              style="height: 35px;"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='password'"
          label="登录密码"
          prop="password"
        >
          <el-input
            v-model="user.password"
            style="width: 220px;"
            show-password
            placeholder="设置登录密码"
          />
		  <div class="note-block">温馨提示：密码必须由字母和数字组成，且必须以大写字母开头</div>
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='password'"
          label="确认密码"
          prop="password_confirmation"
        >
          <el-input
            v-model="user.password_confirmation"
            style="width: 220px;"
            show-password
            placeholder="确认登录密码"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="createFormVisible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="onFromAction">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page } from '../../utils/page'
import poppyjs from 'poppyjs-elem'
const showConfirm = poppyjs.html.Dialog.showConfirm
const showToast = poppyjs.html.Dialog.showMessage
import waves from '../../directive/waves' // waves directive
import Pagination from '../../components/Pagination' // secondary package based on el-pagination

import { mapState, mapGetters } from 'vuex'

export default {
  name: 'List',
  components: { Pagination },
  directives: { waves },

  filters: {
    // 状态颜色
    stateColorFilter(status) {
      const stateOption = {
        1: 'success',
        2: 'warning',
        3: 'danger',
      }
      return stateOption[status]
    },
    /**
     * 状态文本
     */
    stateTextFilter(status) {
      const option = {
        1: '禁用账户',
        2: '启用账户',
      }
      return option[status]
    },
  },
  computed: {
    ...mapGetters(['permissions']),
    ...mapState({
      user: state => state.consumer.user,
      validation: state => state.consumer.validation,
      createFormStatus: state => state.consumer.createFormStatus,
      showFormLoading: state => state.consumer.showFormLoading,
      roleOptions: state => state.consumer.roleOptions,
      userList: state => state.consumer.userList,
      formTitles: state => state.consumer.formTitles,
      tableKey: state => state.consumer.tableKey,
    }),
    createFormVisible: {
      get() {
        return this.$store.state.consumer.createFormVisible
      },
      set(val) {
        this.$store.state.consumer.createFormVisible = val
      },
    },
    keyword: {
      get() {
        return this.$store.state.consumer.keyword
      },
      set(val) {
        this.$store.state.consumer.keyword = val
      },
    },
    role_type: {
      get() {
        return this.$store.state.consumer.role_type
      },
      set(val) {
        this.$store.state.consumer.role_type = val
      },
    },
    pageMap: {
      get() {
        return this.$store.state.consumer.pageMap
      },
      set(val) {
        this.$store.state.consumer.pageMap = val
      },
    },
  },
  created() {
    // this.$store.dispatch('consumer/onPreloadAction')
    this.getDataList()
  },
  methods: {
    permissionValid() {
      return {
        add: this.permissions['user.add'], // 新增人员
        update: this.permissions['user.update'], // 修改人员信息
        delete: this.permissions['user.delete'], // 删除人员
        employ_status: this.permissions['user.employ_status'], // 修改人员状态
        user_status: this.permissions['user.user_status'], // 修改人员的用户状态
        password: this.permissions['user.password'], // 修改人员的密码
      }
    },
    /**
     * form 事件
     */
    onFromAction() {
      if (this.createFormStatus === 'create') {
        this.onSaveAction()
      } else if (this.createFormStatus === 'update') {
        this.updateData()
      } else if (this.createFormStatus === 'password') {
        this.onSavePassword()
      }
    },
    /**
     * 获取列表
     */
    getDataList(pageMap = page) {
      this.pageMap = { ...this.pageMap, ...pageMap }
      this.$store.dispatch('consumer/getDataArray', {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size,
      })
    },
    // 新建动作
    createAction() {
      this.$store.dispatch('consumer/onCreateAction')
      this.$nextTick(() => {
        this.$refs['createForm'].clearValidate()
      })
    },
    // 新建保存
    onSaveAction() {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          if (this.user.password !== this.user.password_confirmation) {
            return showToast('俩次密码输入不一致')
          } else {
            this.$nextTick(() => {
              this.$refs['createForm'].clearValidate()
            })
            const payload = {
              finishCallback: () => this.getDataList(this.pageMap),
            }
            this.$store.commit('consumer/onSaveAction', payload)
          }
        }
      })
    },
    /**
     * 修改
     */
    modifyInfo(row) {
      this.$store.dispatch('consumer/onModifyAction', row)
      this.$nextTick(() => {
        this.$refs['createForm'].clearValidate()
      })
    },
    // 修改保存
    updateData() {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          this.$nextTick(() => {
            this.$refs['createForm'].clearValidate()
          })
          const payload = {
            finishCallback: () => this.getDataList(this.pageMap),
          }
          this.$store.commit('consumer/onUpdateAction', payload)
        }
      })
    },
    /**
     * 搜索
     */
    searchAction() {
      this.$store.dispatch('consumer/getDataArray', {
        page: page,
        page_size: this.pageMap.page_size,
      })
    },
    /**
     * 改变状态
     */
    changeState(row) {
      const { user_id = '', user_status = 1 } = row
      let status = 0
      let statuskey = ''
      let formatted = ''
      if (user_status === 1) {
        // 正常账户 要锁定
        status = 2
        formatted = '锁定'
        statuskey = 'locked'
      } else if (user_status === 2) {
        // 锁定账户 要解锁
        status = 1
        formatted = '正常'
        statuskey = 'normal'
      }

      const payload = {
        id: user_id,
        status: status,
        statuskey: statuskey,
        formatted: formatted,
        finishCallback: () => this.getDataList(this.pageMap),
      }

      this.$store.dispatch('consumer/onChangeStateAction', payload)
    },
    /**
     * 停用账号
     */
    stopAccount(row) {
      const options = {
        title: '停用用户',
        msg: '停用后不可恢复,不可登录,您确定要停用此用户吗?',
        yesBtn: '确定',
        noBtn: '取消',
        yesCallback: () => {
          const { user_id = '' } = row
          const payload = {
            id: user_id,
            status: -1,
            statuskey: 'invalid',
            formatted: '停用',
            finishCallback: () => this.getDataList(this.pageMap),
          }
          this.$store.dispatch('consumer/onChangeStateAction', payload)
        },
        noCallback: () => {},
      }
      showConfirm(options)
    },
    /**
     * 修改密码
     */
    modifyPassAction(row) {
      this.$store.dispatch('consumer/onModifyPassAction', row)
      this.$nextTick(() => {
        this.$refs['createForm'].clearValidate()
      })
    },
    /** 更新密码 */
    onSavePassword() {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          this.$store.dispatch('consumer/onUpdatePasword')
          this.$nextTick(() => {
            this.$refs['createForm'].clearValidate()
          })
        }
      })
    },
    /**
     * 删除
     */
    deleteUser(row) {
      const options = {
        title: '删除用户',
        msg: '删除后不可恢复,您确定删除此用户吗?',
        yesBtn: '确定',
        noBtn: '取消',
        yesCallback: () => {
          const { user_id = '' } = row
          const payload = {
            id: user_id,
            finishCallback: () => this.getDataList(this.pageMap),
          }
          this.$store.dispatch('consumer/onDeleteAction', payload)
        },
        noCallback: () => {},
      }
      showConfirm(options)
    },
  },
}
</script>
<style>
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-dropdown-normal {
  cursor: pointer;
  color: #807a7acb;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
