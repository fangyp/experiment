import Vue from 'vue'
import Login from './Login.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from '@/App'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faUnlock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUser, faUnlock)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = true


Vue.use(ElementUI)

new Vue({
	el: '#app',
	render: (h) => h(Login)
}).$mount(App)
