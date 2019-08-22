<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="module_key"
        placeholder="日志模块"
        clearable
        style="margin-left:10px; width: 180px"
        class="filter-item"
      >
        <el-option
          v-for="item in modules"
          :key="item.key"
          :label="item.value"
          :value="item.key"
          style="height: 35px;"
        />
      </el-select>
      <el-date-picker
        v-model="event_time1"
        value-format="yyyy-MM-dd"
        style="margin-left:10px; width: 180px"
        type="date"
        placeholder="选择日期"
        class="filter-item"
      />
      <el-date-picker
        v-model="event_time2"
        style="margin-left:10px; width: 180px"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
        class="filter-item"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px; width: 120px"
        @click="searchAction"
      >搜索</el-button>
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
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item v-for="(item, index) in row.content" :key="index">
              <span>{{ item.key }}: {{ item.value }}</span>
              <br />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="编号" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模块" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.module_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功能" min-width="85px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.action_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" min-width="85px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作日期" min-width="125px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.event_time }}</span>
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
  </div>
</template>


<script>
import { page } from "../../utils/page";
import waves from "../../directive/waves"; // waves directive
import Pagination from "../../components/Pagination"; // secondary package based on el-pagination

import { mapState } from "vuex";
export default {
  name: "AdminLog",
  components: { Pagination },
  directives: { waves },
  filters: {
    // 状态颜色
    stateColorFilter(status) {
      const stateOption = {
        1: "success",
        2: "warning",
        3: "danger"
      };
      return stateOption[status];
    },
    /**
     * 状态文本
     */
    stateTextFilter(status) {
      const option = {
        1: "禁用管理员",
        2: "启用管理员"
      };
      return option[status];
    }
  },

  computed: {
    ...mapState({
      showFormLoading: state => state.adminlog.showFormLoading,
      dataList: state => state.adminlog.dataList,
      modules: state => state.adminlog.modules,
      tableKey: state => state.adminlog.tableKey
    }),
    module_key: {
      get() {
        return this.$store.state.adminlog.module_key;
      },
      set(val) {
        this.$store.state.adminlog.module_key = val;
      }
    },
    event_time1: {
      get() {
        return this.$store.state.adminlog.event_time1;
      },
      set(val) {
        this.$store.state.adminlog.event_time1 = val;
      }
    },
    event_time2: {
      get() {
        return this.$store.state.adminlog.event_time2;
      },
      set(val) {
        this.$store.state.adminlog.event_time2 = val;
      }
    },
    pageMap: {
      get() {
        return this.$store.state.adminlog.pageMap;
      },
      set(val) {
        this.$store.state.adminlog.pageMap = val;
      }
    }
  },
  created() {
    this.$store.dispatch("adminlog/onPreloadAction");
    this.getDataList();
  },

  methods: {
    /**
     * 获取列表
     */
    getDataList(pageMap = page) {
      this.pageMap = { ...this.pageMap, ...pageMap };
      this.$store.dispatch("adminlog/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    },
    /**
     * 搜索
     */
    searchAction() {
      this.$store.dispatch("adminlog/getDataArray", {
        page: this.pageMap.page,
        page_size: this.pageMap.page_size
      });
    }
  }
};
</script>

<style>
.demo-table-expand {
  font-size: 15px;
}
.demo-table-expand span {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
