<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.account" clearable @clear = "getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

<!-- 用户列表 -->
    <el-table :data="userList">
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="账号" prop="account"></el-table-column>
      <el-table-column label="姓名" prop="name"></el-table-column>
      <el-table-column label="角色" prop="role.name"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteUserById(scope.row.id)"></el-button>
          <!-- 分配角色按钮 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
          </el-tooltip>
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

<!-- 添加用户弹出框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="40%" 
    @close="addDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="账号" prop="account">
          <el-input v-model="addForm.account"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

<!-- 编辑用户弹出框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="40%"
    @close="editDialogClosed">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="账号">
          <el-input v-model="editForm.account" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

<!-- 分配角色对话框 -->
    <el-dialog title="提示" :visible.sync="setRoleDialogVisible" width="40%">
      <div>
        <p>用户账号：{{userInfo.account}}</p>
        <p>当前角色：{{userInfo.role ? userInfo.role.name : ''}}</p>
        <p>分配角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id"
              :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
// 验证code的唯一性
    let checkAccount = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/sysUser/checkAccountUnique/' + value);

      if (res.meta.status != 200) {
        return cb(new Error('请求校验失败'));
      }
      if (res.data.length == 0) {
        return cb();
      }

      cb(new Error('该账号已被使用'));
    }

    return {
      queryInfo: {
        account: '',
        pageNum: 1,
        pageSize: 10
      },
      userList: [],
      total: 0,
      // 添加用户对话框显示状态
      dialogVisible: false,
      // 编辑用户对话框显示状态
      editDialogVisible: false,
      // 分配角色对话框显示状态
      setRoleDialogVisible: false,
      // 将要配置角色的用户信息
      userInfo: {},
      // 所有角色列表
      rolesList: [1,2],
      // 分配角色时已选中的角色id值
      selectedRoleId: '',
      // 添加表单数据
      addForm: {
        account: '',
        name: '',
        password: ''
      },
      // 编辑用户信息数据
      editForm: {},
      // 添加表单验证规则
      addFormRules: {
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          {
            min: 5,
            max: 10,
            message: '账号的长度在5~10个字符之间',
            trigger: 'blur'
          },
          { validator: checkAccount, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 5,
            max: 15,
            message: '密码的长度在5~15个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 5,
            max: 15,
            message: '密码的长度在5~15个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUsersList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getUsersList();
    },
    async getUsersList() {
      const { data : res } = await this.$http.get('/sysUser/getUsers', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！');
      }
      this.userList = res.data.dataList;
      this.total = res.data.total;
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getUsersList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getUsersList();
    },
    // 添加用户对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 编辑用户对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 添加用户提交
    addUser() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/sysUser/create', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加用户失败");
        }
        this.dialogVisible = false;
        this.getUsersList();
        this.$message.success("添加用户成功");
      });
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : res} = await this.$http.get('/sysUser/getUserById/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取用户信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 编辑用户提交
    editUser() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/sysUser/update', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新用户失败");
        }
        this.editDialogVisible = false;
        this.getUsersList();
        this.$message.success("更新用户成功");
      });
    },
    // 删除用户
    async deleteUserById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该用户，是否继续？',
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

      const {data : res} = await this.$http.delete('/sysUser/logicDeleteById/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getUsersList();

    },
    // 展示权限分配对话框
    async showSetRoleDialog(userInfo) {
      console.log(this.userInfo)
      this.userInfo = userInfo;
      this.selectedRoleId = '';
      const {data : res} = await this.$http.get('/sysRole/getRolesList');
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.rolesList = res.data.dataList;
      this.setRoleDialogVisible = true;
    },
    // 设置角色
    async setRole() {
      if (!this.selectedRoleId) {
        return this.$message.warning('请选择要分配的角色');
      }
      const {data : res} = await this.$http.put(`/sysUserRole/setRelative`,{
        userId: this.userInfo.id,
        roleId: this.selectedRoleId
      });

      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }

      this.$message.success('更新角色成功')
      this.getUsersList()
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  
</style>