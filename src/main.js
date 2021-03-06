import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 全局样式css
import './assets/css/global.css'
// 导入axios
import axios from 'axios'
import Moment from 'moment'

Vue.filter('formatDate', function(value) {
  return Moment(value).format('YYYY-MM-DD HH:mm:ss')
})

// 配置请求根路径
// axios.defaults.baseURL = 'http://47.107.124.163:8081'
axios.defaults.baseURL = 'http://127.0.0.1:8081'
// 配置请求拦截器，请求头设置Authorization字段
axios.interceptors.request.use(config => { 
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
