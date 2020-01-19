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
// 配置请求根路径
axios.defaults.baseURL = 'http://localhost:8081'
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
