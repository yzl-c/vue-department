<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getPermissionsList">
            <template slot="prepend">名称：</template>
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加权限</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="permissionsList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="权限编码" prop="code"></el-table-column>
      <el-table-column label="权限名称" prop="name"></el-table-column>
      <el-table-column label="权限级别" prop="level">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level === 1" type="info">LEVEL 1</el-tag>
          <el-tag v-else-if="scope.row.level === 2" type="success">LEVEL 2</el-tag>
          <el-tag v-else type="warning">LEVEL 3</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deletePermissionById(scope.row.id)"></el-button>
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

<!-- 添加权限弹出框 -->
    <el-dialog title="添加权限" :visible.sync="dialogVisible" width="40%" 
    @close="addDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="selectedLevel" placeholder="请选择"  @change="changeLevel">
            <el-option v-for="item in levelsList" :key="item.code"
              :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父权限" prop="parentLevel">
          <el-select v-model="selectedParentPermission" placeholder="请选择">
            <el-option v-for="item in selectPermissions" :key="item.id"
              :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addPermission">确 定</el-button>
      </span>
    </el-dialog>

<!-- 编辑权限弹出框 -->
    <el-dialog title="编辑权限" :visible.sync="editDialogVisible" width="40%"
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
        <el-button type="primary" @click="editPermission">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证code的唯一性
    let checkCode = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/permission', {
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
      levelsList: [{
        code: 1,
        name: 'LEVEL 1'
      },{
        code: 2,
        name: 'LEVEL 2'
      },{
        code: 3,
        name: 'LEVEL 3'
      }],
      selectedLevel: '',
      selectPermissions: [],
      selectedParentPermission: '',

      permissionsList: [],
      queryInfo: {
        code: '',
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 添加权限对话框显示状态
      dialogVisible: false,
      // 编辑权限对话框显示状态
      editDialogVisible: false,
      // 添加表单数据
      addForm: {
        code: '',
        name: '',
        level: 0,
        parentId : 0
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
        ],
        parentLevel: [
          { required: true, message: '请选择父权限', trigger: 'blur' },
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
    this.getPermissionsList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getPermissionsList();
    },
    async getPermissionsList() {
      const {data : res} = await this.$http.get('/permission', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取权限列表失败');
      }
      this.permissionsList = res.data.dataList;
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getPermissionsList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getPermissionsList();
    },
    // 添加用户对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedLevel = '';
      this.selectedParentPermission = '';
    },
    // 编辑用户对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : res} = await this.$http.get('/permission/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取用户信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    addPermission() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        this.addForm.parentId = this.selectedParentPermission;
        this.addForm.level = this.selectedLevel;
        const {data : res} = await this.$http.post('/permission', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加权限失败");
        }
        this.dialogVisible = false;
        this.selectedLevel = '';
        this.selectedParentPermission = '';
        this.getPermissionsList();
        this.$message.success("添加权限成功");
      });
    },
    // 编辑用户提交
    editPermission() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/permission', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新权限失败");
        }
        this.editDialogVisible = false;
        this.getPermissionsList();
        this.$message.success("更新权限成功");
      });
    },
    // 删除权限
    async deletePermissionById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该权限，是否继续？',
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

      const {data : res} = await this.$http.delete('permission/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getPermissionsList();
    },
    // 新增权限时权限等级改变事件
    async changeLevel(level) {
      if (level == 1) {
        this.selectPermissions = [{
          id: 0,
          name: '根权限'
        }];
        this.selectedParentPermission = '';
        return;
      }
      this.selectedParentPermission = '';
      const {data : res} = await this.$http.get('/permission', {
        params: {
          level: level - 1
        }
      });
      if (res.meta.status != 200) {
        return this.$message.error("获取权限失败");
      }
      this.selectPermissions = res.data.dataList;

    }
    

  }
}
</script>

<style lang="less" scoped>
  
</style>