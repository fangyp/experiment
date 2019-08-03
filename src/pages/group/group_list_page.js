
import Vue from 'vue'
import '@/common'
import router from '@/router'
import store from '@/store'
import Layout from '@/layout'
import GroupList from './GroupList'

Vue.component('main-content', GroupList)

new Vue({
	el: '#app',
	store,
	router,
	render: h => h(Layout)
})
