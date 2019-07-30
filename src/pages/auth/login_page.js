import Vue from 'vue'
import Login from './Login.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from '@/App'
Vue.config.productionTip = true

Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: (h) => h(Login)
}).$mount(App)
