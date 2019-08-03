import Vue from 'vue'
import '@/common'
import router from '@/router'
import store from '@/store'
import Layout from '@/layout'
import Test from './Test'

Vue.component('main-content', Test)

new Vue({
	el: '#app',
	store,
	router,
	render: h => h(Layout)
})
