<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="请输入实验名称"
        style="width: 180px; margin-right:10px;"
        class="filter-item"
        clearable
        @keyup.enter.native="searchAction"
      />
      <el-select
        v-model="experiment_status"
        placeholder="实验状态"
        clearable
        style="margin-right:10px; width: 180px"
        class="filter-item"
      >
        <el-option
          v-for="item in experiment_status_list"
          :key="item.key"
          :label="item.value"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-show="lab_team_list.length >0"
        v-model="team_id"
        placeholder="实验小组"
        clearable
        style="margin-right:10px; width: 180px"
        class="filter-item"
      >
        <el-option
          v-for="item in lab_team_list"
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
        @click="searchAction"
      >搜索</el-button>
      <el-button
        v-show="experimentAbility().expAdd"
        class="filter-item"
        style="margin-right:10px; width: 120px"
        type="primary"
        icon="el-icon-edit"
        @click="createAction"
      >新建实验</el-button>
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
      <el-table-column label="编号" prop="id" align="center" min-width="55px">
        <template slot-scope="{row}">
          <span>{{ row.experiment_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验名称" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.experiment_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验组" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.team_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验员" min-width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.user_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="85px">
        <template slot-scope="{row}">
          <el-tag
            :type="row.experiment_status | expStatusFilter"
          >{{ row.experiment_status_formatted }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日期" min-width="95px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        min-width="160px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="text" plain @click="detailAction(row)">实验详情</el-button>
          <el-dropdown trigger="click" style="margin-left:5px">
            <span
              v-show="experimentAbility(row).invalid && experimentAbility(row).delete"
              class="el-dropdown-link"
            >
              更多
              <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-show="experimentAbility(row).invalid"
                @click.native="auditAction(row)"
              >作废实验</el-dropdown-item>
              <el-dropdown-item
                v-show="experimentAbility(row).delete"
                @click.native="onDeleteAction(row)"
              >删除实验</el-dropdown-item>
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
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='update'"
          label="实验名称"
          prop="experiment_name"
        >
          <el-input
            v-model="createNew.experiment_name"
            style="width: 220px;"
            placeholder="请输入实验名称"
          />
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='update'"
          label="实验类型"
          prop="experiment_type"
        >
          <el-select
            v-model="createNew.experiment_type"
            class="filter-item"
            placeholder="请选择实验类型"
            style="width: 220px;"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key"
              style="height: 35px;"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="createFormStatus==='audit'" label="审核状态" prop="audit_status">
          <el-select
            v-model="createNew.audit_status"
            class="filter-item"
            placeholder="请选择审核状态"
            style="width: 220px;"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key"
              style="height: 35px;"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='update'"
          label="温度"
          prop="temperature"
        >
          <el-input v-model="createNew.temperature" style="width: 220px;" placeholder="请输入温度">
            <template slot="append">℃</template>
          </el-input>
        </el-form-item>
        <el-form-item
          v-show="createFormStatus==='create'|| createFormStatus==='update'"
          label="湿度"
          prop="humidity"
        >
          <el-input v-model="createNew.humidity" style="width: 220px;" placeholder="请输入湿度">
            <template slot="append">%</template>
          </el-input>
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
import poppyjs from "poppyjs-elem";
const showConfirm = poppyjs.html.Dialog.showConfirm;
import waves from "../../directive/waves"; // waves directive
import Pagination from "../../components/Pagination"; // secondary package based on el-pagination
import { mapState, mapGetters } from "vuex";
import { page } from "../../utils/page";
import experimentService from "./experiment_service";

export default {
  name: "EmpList",
  components: { Pagination },
  directives: { waves },
  filters: {
    // 用户获取状态颜色
    expStatusFilter(status) {
      const stateOption = {
        "0": "",
        "1": "warning",
        "2": "warning",
        "3": "warning",
        "5": "danger",
        "6": "success",
        "-1": "info"
      };
      return stateOption[status];
    }
  },
  computed: {
    ...mapGetters(["permissions"]),
    ...mapState({
      createFormStatus: state => state.explist.createFormStatus,
      typeOptions: state => state.explist.typeOptions, // 实验类型
      showFormLoading: state => state.explist.showFormLoading,
      createNew: state => state.explist.createNew,
      validation: state => state.explist.validation,
      formTitles: state => state.explist.formTitles,
      tableKey: state => state.explist.tableKey,
      dataList: state => state.explist.dataList,
      experiment_status_list: state => state.explist.experiment_status_list,
      lab_team_list: state => state.explist.lab_team_list,
      statusOptions: state => state.explist.statusOptions
    }),
    keyword: {
      get() {
        return this.$store.state.explist.keyword;
      },
      set(val) {
        this.$store.state.explist.keyword = val;
      }
    },
    createFormVisible: {
      get() {
        return this.$store.state.explist.createFormVisible;
      },
      set(val) {
        this.$store.state.explist.createFormVisible = val;
      }
    },
    pageMap: {
      get() {
        return this.$store.state.explist.pageMap;
      },
      set(val) {
        this.$store.state.explist.pageMap = val;
      }
    },
    experiment_status: {
      get() {
        return this.$store.state.explist.experiment_status;
      },
      set(val) {
        this.$store.state.explist.experiment_status = val;
      }
    },
    team_id: {
      get() {
        return this.$store.state.explist.team_id;
      },
      set(val) {
        this.$store.state.explist.team_id = val;
      }
    }
  },
  created() {
    this.$store.dispatch("explist/onPreloadAction");
    this.getDataList();
  },
  methods: {
    /**
     * 权限
     */
    experimentAbility(experiment = {}) {
      return experimentService.getExperimentAbility(
        this.permissions,
        experiment
      );
    },
    /**
     * form 事件
     */
    onFromAction() {
      if (this.createFormStatus === "create") {
        this.onSaveAction();
      } else if (this.createFormStatus === "update") {
        this.onUpdateAction();
      } else if (this.createFormStatus === "audit") {
        this.onSaveAudit();
      }
    },
    /**
     * 获取列表
     */
    getDataList(pageMap = page) {
      this.pageMap = { ...this.pageMap, ...pageMap };
      this.$store.dispatch("explist/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    },
    // 新建动作
    createAction() {
      this.$store.dispatch("explist/onCreateAction");
      this.$nextTick(() => {
        this.$refs["createForm"].clearValidate();
      });
    },
    // 新建保存
    onSaveAction() {
      this.$refs["createForm"].validate(valid => {
        if (valid) {
          const payload = {
            finishCallback: (experiment_id) => {
              this.getDataList(this.pageMap);
              this.$router.push(`/experiment/info/${experiment_id}`);
            }
          };
          this.$store.commit("explist/onSaveAction", payload);
        }
      });
    },

    /**
     * 搜索
     */
    searchAction() {
      this.$store.dispatch("explist/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    },
    /**
     * 通往详情页面
     */
    detailAction(row) {
      const { experiment_id = "" } = row;
      this.$router.push(`/experiment/info/${experiment_id}`);
    },
    /**
     * 修改
     */
    modifyAction(row) {
      this.$store.dispatch("explist/onModifyAction", row);
      this.$nextTick(() => {
        this.$refs["createForm"].clearValidate();
      });
    },
    /**
     * 确定修改用户消息
     */
    onUpdateAction() {
      this.$refs["createForm"].validate(valid => {
        if (valid) {
          this.$nextTick(() => {
            this.$refs["createForm"].clearValidate();
          });
          const payload = {
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.commit("explist/onUpdateAction", payload);
        }
      });
    },
    /**
     * 删除
     */
    onDeleteAction(row) {
      const options = {
        title: "删除实验",
        msg: "删除后不可恢复,您确定删除此实验吗?",
        yesBtn: "确定",
        noBtn: "取消",
        yesCallback: () => {
          const { experiment_id = "" } = row;
          const payload = {
            id: experiment_id,
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.dispatch("explist/onDeleteAction", payload);
        },
        noCallback: () => {}
      };
      showConfirm(options);
    },
    /**
     * 作废实验
     */
    auditAction(row) {
      const options = {
        title: "作废实验",
        msg: "作废后不可恢复,您确定作废此实验吗?",
        yesBtn: "确定",
        noBtn: "取消",
        yesCallback: () => {
          const { experiment_id = "" } = row;
          const payload = {
            id: experiment_id,
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.dispatch(
            "explist/onUpdateExperimentStatusAction",
            payload
          );
        },
        noCallback: () => {}
      };
      showConfirm(options);
    },
    /**
     * 审核实验
     */
    onSaveAudit(row) {
      this.$refs["createForm"].validate(valid => {
        if (valid) {
          this.$nextTick(() => {
            this.$refs["createForm"].clearValidate();
          });
          const payload = {
            finishCallback: () => this.getDataList(this.pageMap)
          };
          this.$store.commit("explist/onSaveAuditResult", payload);
        }
      });
    }
  }
};
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
