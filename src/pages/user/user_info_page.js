import Vue from 'vue'
import '@/common'
import router from '@/router'
import store from '@/store'
import Layout from '@/layout'
import UserInfo from './UserInfo'

Vue.component('main-content', UserInfo)

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(Layout)
})

/*
new Vue({
  el: '#app',
  components: { Layout },
  store,
  router,
  //template: '<UserInfo/>'
})
*/
