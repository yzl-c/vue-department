<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>流程管理</el-breadcrumb-item>
      <el-breadcrumb-item>请假流程列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getProcesssList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="processsList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="申请人" prop="applyUserName"></el-table-column>
      <el-table-column label="申请时间">
        <template slot-scope="scope">
          {{scope.row.applyTime | formatDate}}
        </template>
      </el-table-column>
      <el-table-column label="审核人" prop="approveUserName"></el-table-column>
      <el-table-column label="审核时间">
        <template slot-scope="scope">
          {{scope.row.approveTime | formatDate}}
        </template>
      </el-table-column>
      <el-table-column label="审核结果" prop="resultName"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
            <el-button type="primary" size="mini" @click="showApproveDialog(scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

<!-- 分页栏 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

<!-- 审核弹出框 -->
    <el-dialog title="审核" :visible.sync="approveDialogVisible" width="40%"
    @close="approveDialogClosed">
      <!-- 内容 -->
      <el-form :model="applyForm" ref="approveFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="申请人" >
          <el-input v-model="applyForm.createUserName" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="类型" >
          <el-input v-model="applyForm.typeName" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate" label-width="90px">
          <el-date-picker v-model="applyForm.beginDate" type="date" placeholder="选择日期" disabled=""></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" label-width="90px">
          <el-date-picker v-model="applyForm.endDate" type="date" placeholder="选择日期" disabled=""></el-date-picker>
        </el-form-item>
        <el-form-item label="申请原因" prop="content"  label-width="90px">
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="applyForm.content" disabled=""></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="approveProcess('1')">驳 回</el-button>
        <el-button type="primary" @click="approveProcess('0')">通 过</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      processsList: [],
      queryInfo: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 审核申请对话框显示状态
      approveDialogVisible: false,
      // 流程数据
      processForm: {
        id: '',
        applyId: '',
        result: '',
        approveUser: ''
      },
      // 审核申请表单数据
      applyForm: {}
    }
  },
  created() {
    this.getProcesssList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getProcesssList();
    },
    async getProcesssList() {
      const {data : res} = await this.$http.get('/holidayProcess', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取请假审核列表失败');
      }
      this.processsList = res.data.dataList;
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getProcesssList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getProcesssList();
    },
    // 审核对话框关闭时执行的操作
    approveDialogClosed() {
      this.$refs.approveFormRef.resetFields();
    },
    // 展示审核对话框
    async showApproveDialog(process) {
      const {data : res} = await this.$http.get('/holidayApply/' + process.applyId);
      if (res.meta.status != 200) {
        return this.$message.error('获取请假申请数据失败');
      }
      this.applyForm = res.data;
      this.processForm.id = process.id;
      this.processForm.applyId = process.applyId;
      this.approveDialogVisible = true;
    },
    // 审核提交
    async approveProcess(result) {
      // 预校验
      this.processForm.result = result;
      this.processForm.approveUser = window.sessionStorage.getItem('loginUserId');
      const {data : res} = await this.$http.put('/holidayProcess', this.processForm);
      if (res.meta.status != 200) {
        return this.$message.error("审核失败");
      }
      this.approveDialogVisible = false;
      this.getProcesssList();
      this.$message.success("审核成功");
    }

  }
}
</script>

<style lang="less" scoped>
  
</style>