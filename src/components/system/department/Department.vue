<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>部门管理</el-breadcrumb-item>
      <el-breadcrumb-item>部门列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getDepartmentsList">
            <template slot="prepend">名称：</template>
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加部门</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="departmentsList" border stripe row-key="code" align="center">
      <el-table-column align="center" type="index"></el-table-column>
      <el-table-column align="center" label="部门编码" prop="code"></el-table-column>
      <el-table-column align="center" label="部门名称" prop="name"></el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini"
          @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteDepartmentById(scope.row.id)"></el-button>
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

<!-- 添加菜单弹出框 -->
    <el-dialog title="添加菜单" :visible.sync="addDialogVisible" width="40%" 
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
        <el-button type="primary" @click="addDepartment">确 定</el-button>
      </span>
    </el-dialog>

<!-- 编辑菜单弹出框 -->
    <el-dialog title="编辑菜单" :visible.sync="editDialogVisible" width="40%"
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
        <el-button type="primary" @click="editDepartment">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证code的唯一性
    let checkCode = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/department', {
        params: {
          code: value
        }
      });

      if (res.meta.status != 200) {
        return cb(new Error('请求校验失败'));
      }
      if (res.data.dataList.length == 0) {
        return cb();
      }

      cb(new Error('该编码已被使用'));
    }

    return {
      departmentsList: [],
      queryInfo: {
        code: '',
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 添加部门对话框显示状态
      addDialogVisible: false,
      // 编辑部门对话框显示状态
      editDialogVisible: false,
      // 添加表单数据
      addForm: {
        code: '',
        name: '',
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
          },
          { validator: checkCode, trigger: 'blur' }
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
    this.getDepartmentsList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getDepartmentsList();
    },
    async getDepartmentsList() {
      const {data : res} = await this.$http.get('/department', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取部门列表失败');
      }
      this.departmentsList = res.data.dataList;
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getDepartmentsList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getDepartmentsList();
    },
    // 添加用户对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 编辑用户对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : res} = await this.$http.get('/department/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取用户信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    addDepartment() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/department', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加部门失败");
        }
        this.addDialogVisible = false;
        this.getDepartmentsList();
        this.$message.success("添加部门成功");
      });
    },
    // 编辑用户提交
    editDepartment() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/department', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新部门失败");
        }
        this.editDialogVisible = false;
        this.getDepartmentsList();
        this.$message.success("更新部门成功");
      });
    },
    // 删除部门
    async deleteDepartmentById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该部门，是否继续？',
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

      const {data : res} = await this.$http.delete('department/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getDepartmentsList();
    }
  }
}
</script>

<style lang="less" scoped>
  
</style>