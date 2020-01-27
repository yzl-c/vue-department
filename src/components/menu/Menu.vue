<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
      <el-breadcrumb-item>菜单列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.code" clearable @clear = "getMenusList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddRootDialog">添加菜单</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="menusList" border stripe row-key="code" align="center"
    :tree-props="{children: 'subMenus'}" default-expand-all>
      <el-table-column align="center" type="index"></el-table-column>
      <el-table-column align="center" label="菜单等级">
        <template slot-scope="scope">
          <el-tag type="success">{{scope.row.level + 1}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="菜单编码" prop="code"></el-table-column>
      <el-table-column align="center" label="菜单名称" prop="name"></el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <!-- 添加子菜单按钮 -->
            <el-button v-if="scope.row.parentId == 0" type="success" icon="el-icon-star-off" size="mini"
            @click="showAddDialog(scope.row)"></el-button>
          <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteMenuById(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>

<!-- 添加菜单弹出框 -->
    <el-dialog title="添加菜单" :visible.sync="dialogVisible" width="40%" 
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
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenu">确 定</el-button>
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
        <el-button type="primary" @click="editMenu">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menusList: [],
      queryInfo: {
        code: ''
        // pageNum: 1,
        // pageSize: 10
      },
      // total: 0,
      // 添加菜单对话框显示状态
      dialogVisible: false,
      // 编辑菜单对话框显示状态
      editDialogVisible: false,
      // 添加表单数据
      addForm: {
        parentId: 0,
        level: 0,
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
            max: 15,
            message: '编码的长度在3~15个字符之间',
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '名称的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '名称的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getMenusList();
  },
  methods: {
    // 搜索
    search() {
      // this.queryInfo.pageNum = 1;
      this.getMenusList();
    },
    async getMenusList() {
      const {data : res} = await this.$http.get('/sysMenu/getMenusList', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取菜单列表失败');
      }
      this.menusList = res.data;
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
      const {data : res} = await this.$http.get('/sysMenu/getMenuById/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取用户信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 添加根菜单
    showAddRootDialog() {
      this.dialogVisible = true;
    },
    // 添加子菜单
    showAddDialog(menu) {
      this.addForm.parentId = menu.id;
      this.addForm.level = menu.level + 1;
      this.dialogVisible = true;
    },
    addMenu() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/sysMenu/create', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加菜单失败");
        }
        this.dialogVisible = false;
        this.getMenusList();
        this.$message.success("添加菜单成功");
      });
    },
    // 编辑用户提交
    editMenu() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/sysMenu/update', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新菜单失败");
        }
        this.editDialogVisible = false;
        this.getMenusList();
        this.$message.success("更新菜单成功");
      });
    },
    // 删除菜单
    async deleteMenuById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该菜单，是否继续？',
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

      const {data : res} = await this.$http.delete('/sysMenu/logicDeleteById/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getMenusList();

    }
  }
}
</script>

<style lang="less" scoped>
  
</style>