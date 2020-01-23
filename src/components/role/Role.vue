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
          <el-input placeholder="请输入内容" v-model="queryInfo.code" clearable @clear = "getRolesList">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加权限</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand"></el-table-column>
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
          @click="deletePermissionById(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      queryInfo: {
        code: '',
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data : res} = await this.$http.get('/sysRole/getRolesList', {
        params: this.queryInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败');
      }

      this.rolesList = res.data.dataList;
    }
  }
}
</script>

<style lang="less" scoped>
  
</style>