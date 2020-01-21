<template>
  <div>
    <!-- 导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统设置</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容主体 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 用户列表 -->
    <el-table :data="userList">
      <el-table-column label="账号" prop="account"></el-table-column>
      <el-table-column label="姓名" prop="name"></el-table-column>
      <el-table-column label="角色" prop="role.name"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      userList: [],
      total: 0,
    }
  },
  created() {
    this.getUsersList();
  },
  methods: {
    async getUsersList() {
      const { data : res } = await this.$http.get('/sysUser/getUsers', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！');
      }
      this.userList = res.data.dataList;
      this.total = res.data.total;
      console.log(res);
    }
  }
}
</script>

<style lang="less" scoped>
  
</style>