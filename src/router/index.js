import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/system/user/User.vue'
import Permission from '../components/system/permission/Permission.vue'
import Role from '../components/system/role/Role.vue'
import Dictionary from '../components/system/dictionary/Dictionary.vue'
import Menu from '../components/system/menu/Menu.vue'
import Department from '../components/system/department/Department.vue'
import Apply_Holiday from '../components/working/apply/Apply_Holiday.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/user_list',
        component: User
      },
      {
        path: '/permission_list',
        component: Permission
      },
      {
        path: '/role_list',
        component: Role
      },
      {
        path: '/dictionary_list',
        component: Dictionary
      },
      {
        path: '/menu_list',
        component: Menu
      },
      {
        path: '/department_list',
        component: Department
      },
      {
        path: '/apply_holiday_list',
        component: Apply_Holiday
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // to(将要访问的路径) and from(从哪个路径跳转来的) are both route objects. must call `next`(next()放行，next('/xx')强制跳转).
  // 如果是登录页面直接放行
  if (to.path == '/login') {
    return next();
  }
  // 非登录页面要判断token是否存在，不存在跳转到登录页
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login');
  }
  next();
})

export default router
