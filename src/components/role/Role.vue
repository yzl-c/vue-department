<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>   

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getRolesList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="rolesList" border stripe>
      <!-- 拓展列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row :class="['vcenter', 'rowbottom', index1 == 0 ? 'rowtop' : '', '']" v-for="(item1, index1) in scope.row.permissions" :key="'item1' + item1.id">
            <el-col :span="6">
              <el-tag >{{item1.name}}</el-tag>
              <!-- closable @close="deletePermissionById(scope.row, item1.id)" -->
              <i class="el-icon-caret-right"></i>
            </el-col>
            <el-col :span="18">
              <el-row :class="['vcenter', index2 == 0 ? '' : 'rowtop']" v-for="(item2, index2) in item1.subPermissions" :key="item1.code + item2.id">
                <el-col :span="8">
                  <el-tag type="success" >{{item2.name}}</el-tag>
                  <!-- closable @close="deletePermissionById(scope.row, item2.id)" -->
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="16">
                  <el-tag type="warning" v-for="(item3) in item2.subPermissions" 
                  :key="item2.code + item3.id">
                    {{item3.name}}
                  </el-tag>
                  <!--  closable @close="deletePermissionById(scope.row, item3.id)" -->
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色编码" prop="code"></el-table-column>
      <el-table-column label="角色名称" prop="name"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteRoleById(scope.row.id)"></el-button>
          <!-- 分配权限按钮 -->
          <el-tooltip effect="dark" content="权限配置" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"
            @click="showSetPermissionDialog(scope.row)"></el-button>
          </el-tooltip>
          <!-- 分配菜单按钮 -->
          <el-tooltip effect="dark" content="菜单配置" placement="top" :enterable="false">
            <el-button type="success" icon="el-icon-setting" size="mini"
            @click="showSetMenuDialog(scope.row)"></el-button>
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

<!-- 添加角色弹出框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户弹出框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%"
    @close="editDialogClosed">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色编码">
          <el-input v-model="editForm.code" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

<!-- 权限配置弹出框 -->
    <el-dialog title="权限配置" :visible.sync="setPermissionDialogVisible" width="50%"
    @close="setPermissionDialogClosed">
      <!-- 内容 -->
      <el-tree :data="permissionsList" :props="permissionTreeProps"
      show-checkbox node-key="id" default-expand-all
      :default-checked-keys="defaultPermissionKeys" ref="permissionTreeRef"></el-tree>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setPermissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setPermissions">确 定</el-button>
      </span>
    </el-dialog>

<!-- 菜单配置弹出框 -->
    <el-dialog title="菜单配置" :visible.sync="setMenuDialogVisible" width="50%"
    @close="setMenuDialogClosed">
      <!-- 内容 -->
      <el-tree :data="menusList" :props="menuTreeProps"
      show-checkbox node-key="id" default-expand-all
      :default-checked-keys="defaultMenuKeys" ref="menuTreeRef"></el-tree>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setMenus">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
// 验证code的唯一性
    let checkCode = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/role', {
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
      queryInfo: {
        code: '',
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      setPermissionDialogVisible: false,
      setMenuDialogVisible: false,
      rolesList: [],
      addForm: {
        code: '',
        name: ''
      },
      editForm: {},
      addFormRules: {
        code: [
          { required: true, message: '请输入角色编码', trigger: 'blur' },
          {
            min: 4,
            max: 10,
            message: '账号的长度在4~10个字符之间',
            trigger: 'blur'
          },
          { validator: checkCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名称的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名称的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 所有权限（树结构）
      permissionsList: [],
      // 权限树属性
      permissionTreeProps: {
        label: 'name',
        children: 'subPermissions'
      },
      // 权限树默认勾选id数组
      defaultPermissionKeys: [],
      // 所有菜单（树结构）
      menusList: [],
      // 菜单树属性
      menuTreeProps: {
        label: 'name',
        children: 'subMenus'
      },
      // 菜单树默认勾选id数组
      defaultMenuKeys: [],
      // 要配置的角色id
      roleId: -1
    }
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getRolesList();
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getRolesList();
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getRolesList();
    },

    // 添加角色对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 编辑角色对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 获取角色列表
    async getRolesList() {
      const {data : res} = await this.$http.get('/role', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.total = res.data.total;
      this.rolesList = res.data.dataList;
    },
    
    // 解除角色绑定的权限
    // async deletePermissionById(role, permissionId) {
    //   const confirmSelect = await this.$confirm(
    //     '此操作将解除该权限绑定，是否继续？', 
    //     '提示',
    //     {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }
    //   ).catch (error => error);
    //   if (confirmSelect != 'confirm') {
    //     return this.$message.info('取消删除权限操作');
    //   }
    //   this.$message.info('确认删除');

    //   const {data : res} = await this.$http.delete(`/sysRolePermission/deleteRelativeById/${role.id}/${permissionId}`);

    //   if (res.meta.status != 200) {
    //     return this.$message.error('解除权限失败');
    //   }

    //   role.permissions = res.data;
    // },

    // 添加角色提交
    addRole() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/role', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加角色失败");
        }
        this.addDialogVisible = false;
        this.getRolesList();
        this.$message.success("添加角色成功");
      });
    },

    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : res} = await this.$http.get('/role/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取角色信息失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    // 编辑角色提交
    editRole() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/role', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新角色失败");
        }
        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("更新角色成功");
      });
    },

    // 删除角色
    async deleteRoleById(id) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该角色，是否继续？',
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

      const {data : res} = await this.$http.delete('/role/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getRolesList();

    },

    // 展示权限配置弹出框
    async showSetPermissionDialog(role) {
      this.roleId = role.id;
      const {data : res} = await this.$http.get('/permission/all');
      if (res.meta.status != 200) {
        return this.$message.error('获取权限列表失败');
      }
      this.permissionsList = res.data;
      // 设置当前角色权限树默认勾选数组的值
      role.permissions.forEach(item => this.getPermissionLeafKeys(item, this.defaultPermissionKeys));
      // 展示权限配置弹出框
      this.setPermissionDialogVisible = true;
    },

    // 获取角色所有最底层权限，保存到权限树默认勾选id数组 defaultPermissionKeys
    getPermissionLeafKeys(permission, keys) {
      // 直到为最底层权限时添加到数组中
      if (!permission.subPermissions || permission.subPermissions.length == 0) {
        return keys.push(permission.id);
      }
      // 否则继续遍历子权限
      permission.subPermissions.forEach(item => this.getPermissionLeafKeys(item, keys));
    },

    // 权限配置框关闭事件
    setPermissionDialogClosed() {
      this.defaultPermissionKeys = [];
    },

    // 设置勾选中的权限节点
    async setPermissions() {
      // 勾选状态节点
      const a = this.$refs.permissionTreeRef.getCheckedKeys();
      // 半勾选状态节点
      const b = this.$refs.permissionTreeRef.getHalfCheckedKeys();
      const keys = [...a, ...b];
      const ids = keys.join(',');
      const {data : res} = await this.$http.post('/sysRolePermission/setRelative',{
        roleId: this.roleId,
        permissionIds: ids
      });

      if (res.meta.status != 200) {
        return this.$message.error('权限分配失败');
      }

      this.$message.success('权限分配成功');
      this.getRolesList();
      this.setPermissionDialogVisible = false;
    },

    // 展示菜单配置弹出框
    async showSetMenuDialog(role) {
      this.roleId = role.id;
      const {data : res} = await this.$http.get('/menu/all');
      if (res.meta.status != 200) {
        return this.$message.error('获取菜单列表失败');
      }
      this.menusList = res.data;
      // 设置当前角色菜单树默认勾选数组的值
      role.menus.forEach(item => this.getMenuLeafKeys(item, this.defaultMenuKeys));
      // 展示菜单配置弹出框
      this.setMenuDialogVisible = true;
    },

    // 获取角色所有最底层菜单，保存到菜单树默认勾选id数组 defaultMenuKeys
    getMenuLeafKeys(menu, keys) {
      // 直到为最底层菜单时添加到数组中
      if (!menu.subMenus || menu.subMenus.length == 0) {
        return keys.push(menu.id);
      }
      // 否则继续遍历子权限
      menu.subMenus.forEach(item => this.getMenuLeafKeys(item, keys));
    },

    // 菜单配置框关闭事件
    setMenuDialogClosed() {
      this.defaultMenuKeys = [];
    },

    // 设置勾选中的权限节点
    async setMenus() {
      // 勾选状态节点
      const a = this.$refs.menuTreeRef.getCheckedKeys();
      // 半勾选状态节点
      const b = this.$refs.menuTreeRef.getHalfCheckedKeys();
      const keys = [...a, ...b];
      const ids = keys.join(',');
      const {data : res} = await this.$http.post('/sysRoleMenu/setRelative',{
        roleId: this.roleId,
        menuIds: ids
      });

      if (res.meta.status != 200) {
        return this.$message.error('菜单配置失败');
      }

      this.$message.success('菜单配置成功成功');
      this.getRolesList();
      this.setMenuDialogVisible = false;
    },


  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .rowtop {
    border-top: 1px solid #eee;
  }

  .rowbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>