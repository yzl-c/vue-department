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
          <el-button type="primary" @click="showAddDialog">新建申请</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="applysList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="申请人" prop="createUserName"></el-table-column>
      <el-table-column label="申请时间" prop="createTime">
        <template slot-scope="scope">
          {{scope.row.createTime | formatDate}}
        </template>
      </el-table-column>
      <el-table-column label="请假类型" prop="typeName"></el-table-column>
      <el-table-column label="开始日期" prop="beginDate">
        <template slot-scope="scope">
          {{scope.row.beginDate | formatDate}}
        </template>
      </el-table-column>
      <el-table-column label="结束日期" prop="endDate">
        <template slot-scope="scope">
          {{scope.row.endDate | formatDate}}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="statusName"></el-table-column>
      <el-table-column label="结果" prop="resultName"></el-table-column>
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
        <el-form-item label="申请人" >
          <el-input v-model="addForm.createUserName" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="selectedType" placeholder="请选择">
            <el-option v-for="item in holidayTypesList" :key="item.id"
              :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate" label-width="90px">
          <el-date-picker v-model="addForm.beginDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" label-width="90px">
          <el-date-picker v-model="addForm.endDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="申请原因" prop="content"  label-width="90px">
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="addForm.content"></el-input>
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
        <el-form-item label="申请人" >
          <el-input v-model="editForm.createUserName" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="selectedType" placeholder="请选择">
            <el-option v-for="item in holidayTypesList" :key="item.id"
              :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate" label-width="90px">
          <el-date-picker v-model="editForm.beginDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" label-width="90px">
          <el-date-picker v-model="editForm.endDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="申请原因" prop="content"  label-width="90px">
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="editForm.content"></el-input>
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
      holidayTypesList: [],
      selectedType: '',
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
        type: '',
        status: 0,
        createUser: '',
        createUserCode: '',
        createUserName: '',
        content: '',
        beginDate: '',
        endDate: ''
      },
      // 编辑表单数据
      editForm: {},
      // 添加表单验证规则
      addFormRules: {
        type: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        beginDate: [
          { required: true, message: '请选择开始日期', trigger: 'blur' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请填写原因', trigger: 'blur' }
        ]
      },
      editFormRules: {
        type: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        beginDate: [
          { required: true, message: '请选择开始日期', trigger: 'blur' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请填写原因', trigger: 'blur' }
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
      const {data : res} = await this.$http.get('/holidayApply', {
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
    // 添加申请对话框关闭时执行的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedType = '';
    },
    // 编辑申请对话框关闭时执行的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
      this.selectedType = '';
    },
    // 展示新增对话框
    async showAddDialog() {
      const {data : res} = await this.$http.get('/dictype', {
        params: {
          code: 'holiday_type'
        }
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取请假类型信息失败');
      }
      if (res.data.dataList.length > 0) {
        this.holidayTypesList = res.data.dataList[0].dictionarys;
      }
      this.addForm.createUserName = window.sessionStorage.getItem("loginUserName");
      this.addDialogVisible = true;
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data : dictypes} = await this.$http.get('/dictype', {
        params: {
          code: 'holiday_type'
        }
      });
      if (dictypes.meta.status != 200) {
        return this.$message.error('获取请假类型信息失败');
      }
      if (dictypes.data.dataList.length > 0) {
        this.holidayTypesList = dictypes.data.dataList[0].dictionarys;
      }

      const {data : res} = await this.$http.get('/holidayApply/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('获取申请信息失败');
      }
      this.editForm = res.data;
      this.selectedType = this.editForm.type;

      this.editDialogVisible = true;
    },
    addApply() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        if (!this.selectedType) {
          return this.$message.info("请选择请假类型");
        }
        this.addForm.createUser = window.sessionStorage.getItem("loginUserId");
        this.addForm.type = this.selectedType;
        const {data : res} = await this.$http.post('/holidayApply', this.addForm);
        if (res.meta.status != 200) {
          return this.$message.error("添加申请失败");
        }
        this.addDialogVisible = false;
        this.getApplysList();
        this.$message.success("添加申请成功");
      });
    },
    // 编辑申请提交
    editApply() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        this.editForm.type = this.selectedType;
        const {data : res} = await this.$http.put('/holidayApply', this.editForm);
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

      const {data : res} = await this.$http.delete('/holidayApply/' + id);
      if (res.meta.status != 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      this.getApplysList();
    }

  }
}
</script>

<style lang="less" scoped>
  
</style>