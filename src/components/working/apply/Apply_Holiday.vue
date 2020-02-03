<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>申请管理</el-breadcrumb-item>
      <el-breadcrumb-item>请假申请列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getApplysList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">新建申请</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="applysList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="申请人" prop="createUserAccount"></el-table-column>
      <el-table-column label="申请时间" prop="createTime"></el-table-column>
      <el-table-column label="请假类型" prop="typeName"></el-table-column>
      <el-table-column label="开始日期" prop="beginDate"></el-table-column>
      <el-table-column label="结束日期" prop="endDate"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteById(scope.row.id)"></el-button>
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

<!-- 添加申请弹出框 -->
    <el-dialog title="添加申请" :visible.sync="addDialogVisible" width="40%" 
    @close="addDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addApply">确 定</el-button>
      </span>
    </el-dialog>

<!-- 编辑申请弹出框 -->
    <el-dialog title="编辑申请" :visible.sync="editDialogVisible" width="40%"
    @close="editDialogClosed">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码">
          <el-input v-model="editForm.code" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editApply">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      applysList: [],
      queryInfo: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 添加申请对话框显示状态
      addDialogVisible: false,
      // 编辑申请对话框显示状态
      editDialogVisible: false,
      // 添加表单数据
      addForm: {
        code: '',
        name: ''
      },
      // 编辑表单数据
      editForm: {},
      // 添加表单验证规则
      addFormRules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          {
            min: 3,
            max: 30,
            message: '编码的长度在3~30个字符之间',
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '名称的长度在3~20个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '名称的长度在3~20个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getApplysList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getApplysList();
    },
    async getApplysList() {
      const {data : res} = await this.$http.get('/holiday', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取请假申请列表失败');
      }
      this.applysList = res.data.dataList;
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getApplysList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getApplysList();
    },
    // 添加用户对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedLevel = '';
      this.selectedParentApply = '';
    },
    // 编辑用户对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : res} = await this.$http.get('/holiday/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取用户信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    addApply() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        console.log(this.selectedParentApply)
        if (!this.selectedParentApply && this.selectedParentApply != 0) {
          return this.$message.warning('请选择父申请');
        }
        this.addForm.parentId = this.selectedParentApply;
        this.addForm.level = this.selectedLevel;
        const {data : res} = await this.$http.post('/holiday', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加申请失败");
        }
        this.addDialogVisible = false;
        this.selectedLevel = '';
        this.selectedParentApply = '';
        this.getApplysList();
        this.$message.success("添加申请成功");
      });
    },
    // 编辑用户提交
    editApply() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/holiday', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新申请失败");
        }
        this.editDialogVisible = false;
        this.getApplysList();
        this.$message.success("更新申请成功");
      });
    },
    // 删除申请
    async deleteById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该申请，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error);

      if (confirmSelect != 'confirm') {
        return this.$message.info('取消删除操作');
      }

      const {data : res} = await this.$http.delete('apply/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getApplysList();
    },
    // 新增申请时申请等级改变事件
    async changeLevel(level) {
      if (level == 1) {
        this.selectApplys = [{
          id: 0,
          name: '根申请'
        }];
        this.selectedParentApply = '';
        return;
      }
      this.selectedParentApply = '';
      const {data : res} = await this.$http.get('/holiday', {
        params: {
          level: level - 1
        }
      });
      if (res.meta.status != 200) {
        return this.$message.error("获取申请失败");
      }
      this.selectApplys = res.data.dataList;
    }

  }
}
</script>

<style lang="less" scoped>
  
</style>