<template>
  <div>
<!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据字典</el-breadcrumb-item>
      <el-breadcrumb-item>字典列表</el-breadcrumb-item>
    </el-breadcrumb>

<!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear = "getDictypesList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addTypeDialogVisible = true">添加字典类型</el-button>
        </el-col>
      </el-row>
    </el-card>

<!-- 内容列表 -->
    <el-table :data="dictypesList" border stripe row-key="code"
    :tree-props="{children: 'dictionarys'}">
      <el-table-column label="类别/字典">
        <template slot-scope="scope1">
          <el-tag v-if="scope1.row.dictionarys" type="info">类别</el-tag>
          <el-tag v-else type="success">字典</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="编码" prop="code"></el-table-column>
      <el-table-column align="center" label="名称" prop="name"></el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <!-- 添加字典按钮,为字典类型的行才有此按钮 -->
          <el-tooltip effect="dark" content="添加字典" placement="top" :enterable="false">
            <el-button v-if="scope.row.dictionarys" type="success" icon="el-icon-star-off" size="mini"
            @click="showAddDictionaryDialog(scope.row)"></el-button>
          </el-tooltip>
          <!-- 修改按钮  -->
          <el-button type="primary" icon="el-icon-edit" size="mini"
          @click="showEditDialog(scope.row)"></el-button>
          <!-- 删除按钮  -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="deleteById(scope.row)"></el-button>
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

<!-- 添加字典类型弹出框 -->
    <el-dialog title="添加字典类型" :visible.sync="addTypeDialogVisible" width="40%" 
    @close="addTypeDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addTypeFormRules" ref="addTypeFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTypeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDictype">确 定</el-button>
      </span>
    </el-dialog>
<!-- 添加字典弹出框 -->
    <el-dialog title="添加字典" :visible.sync="addDictionaryDialogVisible" width="40%" 
    @close="addDictionaryDialogClosed">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="addDictionaryFormRules" ref="addDictionaryFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDictionaryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDictionary">确 定</el-button>
      </span>
    </el-dialog>

<!-- 编辑字典类型弹出框 -->
    <el-dialog title="编辑字典类型" :visible.sync="editTypeDialogVisible" width="40%"
    @close="editTypeDialogClosed">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editTypeFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码">
          <el-input v-model="editForm.code" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editTypeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDictype">确 定</el-button>
      </span>
    </el-dialog>
<!-- 编辑字典弹出框 -->
    <el-dialog title="编辑字典" :visible.sync="editDictionaryDialogVisible" width="40%"
    @close="editDictionaryDialogClosed">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editDictionaryFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="编码">
          <el-input v-model="editForm.code" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDictionaryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDictionary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
// 验证code的唯一性
    let checkTypeCode = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/dictype', {
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

      cb(new Error('该类型编码已被使用'));
    }
// 验证code的唯一性
    let checkDictionaryCode = async (rule, value, cb) => {
      const {data : res} = await this.$http.get('/dictionary', {
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

      cb(new Error('该字典编码已被使用'));
    }

    return {
      dictypesList: [],
      queryInfo: {
        code: '',
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 添加类型对话框显示状态
      addTypeDialogVisible: false,
      // 添加字典对话框显示状态
      addDictionaryDialogVisible: false,
      // 编辑类型对话框显示状态
      editTypeDialogVisible: false,
      // 编辑字典对话框显示状态
      editDictionaryDialogVisible: false,
      // 添加表单数据
      addForm: {
        typeId: '',
        code: '',
        name: ''
      },
      // 编辑表单数据
      editForm: {},
      // 添加类型表单验证规则
      addTypeFormRules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          {
            min: 3,
            max: 30,
            message: '编码的长度在3~30个字符之间',
            trigger: 'blur'
          },
          { validator: checkTypeCode, trigger: 'blur' }
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
      // 添加字典表单验证规则
      addDictionaryFormRules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          {
            min: 1,
            max: 20,
            message: '编码的长度在1~20个字符之间',
            trigger: 'blur'
          },
          { validator: checkDictionaryCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '名称的长度在1~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 1,
            max: 20,
            message: '名称的长度在1~20个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getDictypesList();
  },
  methods: {
    // 搜索
    search() {
      this.queryInfo.pageNum = 1;
      this.getDictypesList();
    },
    async getDictypesList() {
      const {data : res} = await this.$http.get('/dictype', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取字典类型列表失败');
      }
      this.dictypesList = res.data.dataList;
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getDictypesList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getDictypesList();
    },

    // 添加类型对话框关闭时执行的操作
    addTypeDialogClosed() {
      this.$refs.addTypeFormRef.resetFields();
    },
    // 添加字典对话框关闭时执行的操作
    addDictionaryDialogClosed() {
      this.$refs.addDictionaryFormRef.resetFields();
    },
    // 编辑类型对话框关闭时执行的操作
    editTypeDialogClosed() {
      this.$refs.addTypeFormRef.resetFields();
    },
    // 编辑字典对话框关闭时执行的操作
    editDictionaryDialogClosed() {
      this.$refs.addDictionaryFormRef.resetFields();
    },

    // 展示添加字典弹出框
    showAddDictionaryDialog(dictype) {
      this.addForm.typeId = dictype.id;
      this.addDictionaryDialogVisible = true;
    },

    // 编辑类型对话框关闭时执行的操作
    editTypeDialogClosed() {
      this.$refs.editTypeFormRef.resetFields();
    },

    // 添加字典类型
    addDictype() {
      // 预校验
      this.$refs.addTypeFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/dictype', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加字典类型失败");
        }
        this.addTypeDialogVisible = false;
        this.getDictypesList();
        this.$message.success("添加字典类型成功");
      });
    },
    // 添加字典
    addDictionary() {
      // 预校验
      this.$refs.addDictionaryFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.post('/dictionary', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加字典失败");
        }
        this.addDictionaryDialogVisible = false;
        this.getDictypesList();
        this.$message.success("添加字典成功");
      });
    },

// 展示编辑对话框
    showEditDialog(type) {
      // 判断是类型还是字典
      if (type.dictionarys) {
        this.showTypeEditDialog(type);
      } else {
        this.showDictionaryEditDialog(type);
      }
    },
    // 展示类型编辑对话框
    async showTypeEditDialog(dictype) {
      const {data : res} = await this.$http.get('/dictype/' + dictype.id);
      if (res.meta.status != 200) {
        return this.$message.error('获取字典类型信息失败');
      }
      this.editForm = res.data;
      this.editTypeDialogVisible = true;
    },
    // 展示字典编辑对话框
    async showDictionaryEditDialog(dictionary) {
      const {data : res} = await this.$http.get('/dictionary/' + dictionary.id);
      if (res.meta.status != 200) {
        return this.$message.error('获取字典信息失败');
      }
      this.editForm = res.data;
      this.editDictionaryDialogVisible = true;
    },
    // 编辑字典类型提交
    editDictype() {
      // 预校验
      this.$refs.editTypeFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/dictype', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新字典类型失败");
        }
        this.editTypeDialogVisible = false;
        this.getDictypesList();
        this.$message.success("更新字典类型成功");
      });
    },
    editDictionary() {
      // 预校验
      this.$refs.editDictionaryFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const {data : res} = await this.$http.put('/dictionary', this.editForm);
        if (res.meta.status != 200) {
          return this.$message.error("更新字典失败");
        }
        this.editDictionaryDialogVisible = false;
        this.getDictypesList();
        this.$message.success("更新字典成功");
      });
    },

    // 删除操作
    deleteById(type) {
      // 判断是类型还是字典
      if (type.dictionarys) {
        this.deleteDictypeById(type);
      } else {
        this.deleteDictionaryById(type);
      }
    },
    // 删除字典类型
    async deleteDictypeById(dictype) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该字典类型，是否继续？',
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

      const {data : res} = await this.$http.delete('/dictype/' + dictype.id);
      if (res.meta.status != 200) {
        return this.$message.error('删除类型失败');
      }
      this.$message.success('删除类型成功');
      this.getDictypesList();
    },
    // 删除字典
    async deleteDictionaryById(dictionary) {
      const confirmSelect = await this.$confirm(
        '此操作将删除该字典，是否继续？',
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

      const {data : res} = await this.$http.delete('/dictionary/' + dictionary.id);
      if (res.meta.status != 200) {
        return this.$message.error('删除字典失败');
      }
      this.$message.success('删除字典成功');
      this.getDictypesList();
    }
  }
}
</script>

<style lang="less" scoped>
</style>