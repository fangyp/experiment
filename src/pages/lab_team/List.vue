<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入关键字进行搜索"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="searchAction"
      />
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
      >新增实验组</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="showFormLoading"
      element-loading-text="努力加载中..."
      :data="dataList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" min-width="50px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.team_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验组名称" min-width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.team_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验组⻓" min-width="90px" align="center">
        <template slot-scope="{row}">
          <el-tag size="small">{{ findLeaderName(row.team_leader_id) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="实验员" min-width="240px">
        <template slot-scope="{row}">
          <el-tag
            v-for="user in row.user_list"
            :key="user.user_id"
            type="info"
            size="small"
          >{{ user.user_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="70px">
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | stateColorFilter">{{ row.enabled | stateTextFilter }}</el-tag>
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
              v-show="permissionValid().add || permissionValid().update || permissionValid().delete || permissionValid().status"
              class="el-dropdown-link"
            >
              更多
              <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <span
              v-show="!permissionValid().add ||
								!permissionValid().update ||
								!permissionValid().delete ||
								!permissionValid().status"
              class="el-dropdown-normal"
            >更多</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-show="permissionValid().update"
                @click.native="modifyInfo(row)"
              >修改信息</el-dropdown-item>
              <el-dropdown-item
                v-show="permissionValid().status"
                @click.native="changeState(row)"
              >{{ row.enabled|stateMenuFilter }}</el-dropdown-item>
              <el-dropdown-item
                v-show="permissionValid().delete"
                @click.native="onDeleteAction(row)"
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
        :model="createNew"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:10px;"
      >
        <el-form-item label="实验组名称" prop="team_name">
          <el-input v-model="createNew.team_name" style="width: 220px;" placeholder="实验组名称" />
        </el-form-item>

        <el-form-item label="实验组长" prop="leader_id">
          <el-select
            v-model="createNew.leader_id"
            class="filter-item"
            placeholder="请选择实验组长"
            style="width: 220px;"
            clearable
          >
            <el-option
              v-for="item in team_leaders"
              :key="item.user_id"
              :label="item.user_name"
              :value="item.user_id"
              style="height: 35px;"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="实验员" prop="lab_staffs">
          <el-select
            v-model="createNew.member_ids"
            style="width: 220px;"
            multiple
            placeholder="请选择实验员"
          >
            <el-option
              v-for="item in lab_staffs"
              :key="item.user_id"
              :label="item.user_name"
              :value="item.user_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="createFormVisible = false">取消</el-button>
        <el-button
          size="medium"
          type="primary"
          @click="createFormStatus==='create'?onSaveAction():updateData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page } from "../../utils/page";
import poppyjs from "poppyjs-elem";
const showConfirm = poppyjs.html.Dialog.showConfirm;
import waves from "../../directive/waves"; // waves directive
import Pagination from "../../components/Pagination"; // secondary package based on el-pagination

import { mapState, mapGetters } from "vuex";

export default {
  name: "LabTeam",
  components: { Pagination },
  directives: { waves },
  filters: {
    // 状态颜色
    stateColorFilter(status) {
      const stateOption = {
        0: "danger",
        1: "success"
      };
      return stateOption[status];
    },
    stateTextFilter(status) {
      const stateOption = {
        0: "停用",
        1: "启用"
      };
      return stateOption[status];
    },
    stateMenuFilter(status) {
      const stateOption = {
        0: "启用实验组",
        1: "停用实验组"
      };
      return stateOption[status];
    }
  },

  computed: {
    ...mapGetters(["permissions"]),
    ...mapState({
      createNew: state => state.labteam.createNew,
      validation: state => state.labteam.validation,
      createFormStatus: state => state.labteam.createFormStatus,
      showFormLoading: state => state.labteam.showFormLoading,
      dataList: state => state.labteam.dataList,
      formTitles: state => state.labteam.formTitles,
      tableKey: state => state.labteam.tableKey,
      team_leaders: state => state.labteam.team_leaders,
      lab_staffs: state => state.labteam.lab_staffs
    }),
    createFormVisible: {
      get() {
        return this.$store.state.labteam.createFormVisible;
      },
      set(val) {
        this.$store.state.labteam.createFormVisible = val;
      }
    },
    keyword: {
      get() {
        return this.$store.state.labteam.keyword;
      },
      set(val) {
        this.$store.state.labteam.keyword = val;
      }
    },
    role_type: {
      get() {
        return this.$store.state.labteam.role_type;
      },
      set(val) {
        this.$store.state.labteam.role_type = val;
      }
    },
    pageMap: {
      get() {
        return this.$store.state.labteam.pageMap;
      },
      set(val) {
        this.$store.state.labteam.pageMap = val;
      }
    }
  },
  created() {
    this.$store.dispatch("labteam/onPreloadAction");
    this.getDataList();
  },

  methods: {
    permissionValid() {
      return {
        add: this.permissions["lab_team.add"],
        update: this.permissions["lab_team.update"],
        delete: this.permissions["lab_team.delete"],
        status: this.permissions["lab_team.status"]
      };
    },
    /**
     * 获取列表
     */
    getDataList(pageMap = page) {
      this.pageMap = { ...this.pageMap, ...pageMap };
      this.$store.dispatch("labteam/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    },
    // 新建动作
    createAction() {
      this.$store.dispatch("labteam/onCreateAction");
      this.$nextTick(() => {
        this.$refs["createForm"].clearValidate();
      });
    },
    // 新建保存
    onSaveAction() {
      this.$refs["createForm"].validate(valid => {
        if (valid) {
          this.$nextTick(() => {
            this.$refs["createForm"].clearValidate();
          });
          const payload = {
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.commit("labteam/onSaveAction", payload);
        }
      });
    },
    // 过滤名字
    findLeaderName(team_leader_id) {
      for (const item of this.team_leaders) {
        const { user_id = "", user_name = "" } = item;
        if (team_leader_id === user_id) {
          return user_name;
        }
      }
    },
    /**
     * 搜索
     */
    searchAction() {
      this.$store.dispatch("labteam/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    },
    /**
     * 修改
     */
    modifyInfo(row) {
      this.$store.dispatch("labteam/onModifyAction", row);
      this.$nextTick(() => {
        this.$refs["createForm"].clearValidate();
      });
    },
    // 修改保存
    updateData() {
      this.$refs["createForm"].validate(valid => {
        if (valid) {
          this.$nextTick(() => {
            this.$refs["createForm"].clearValidate();
          });
          const payload = {
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.commit("labteam/onUpdateAction", payload);
        }
      });
    },
    /**
     * 改变状态
     */
    changeState(row) {
      const { team_id = "", enabled = 0 } = row;
      const status = enabled === 0 ? "open" : "stop";
      const payload = {
        id: team_id,
        status: status,
        finishCallback: () => this.getDataList(this.pageMap)
      };

      this.$store.dispatch("labteam/onChangeStateAction", payload);
    },

    /**
     * 删除
     */
    onDeleteAction(row) {
      const options = {
        title: "删除实验组",
        msg: "删除后不可恢复,您确定删除此实验组吗?",
        yesBtn: "确定",
        noBtn: "取消",
        yesCallback: () => {
          const { team_id = "" } = row;
          const payload = {
            id: team_id,
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.dispatch("labteam/onDeleteAction", payload);
        },
        noCallback: () => {}
      };
      showConfirm(options);
    }
  }
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
