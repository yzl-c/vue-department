<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>部门后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" 
        :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true"
        :default-active="$route.path">
          <!-- 一级菜单 -->
          <el-submenu :index=" '/' + item.code + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i class="el-icon-s-tools"></i>
              <!-- 一级菜单文本 -->
              <span>{{item.name}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-submenu :index="'/' + subItem1.code" v-for="subItem1 in item.subMenus" :key="subItem1.id">
              <template slot="title">
                <!-- 菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 菜单文本 -->
                <span>{{subItem1.name}}</span>
              </template>
              <el-menu-item :index=" '/' + subItem2.code + ''" v-for="subItem2 in subItem1.subMenus" :key="subItem2.id">
                <!-- 三级菜单 -->
                <template slot="title">
                  <i class="el-icon-s-tools"></i>
                  <span>{{subItem2.name}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-submenu>
        </el-menu>  
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList();
  },
  methods: {
    async logout() {
      const { data: res } = await this.$http.post('/logout');
      if (res.meta.status !== 200) {
        return this.$message.error(退出失败);
      }
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('/menu/all');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.menuList = res.data;
      console.log(res);
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
   
  }
  
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>