<template>
	<div :class="{'has-logo':showLogo}">
		<logo v-if="showLogo" :collapse="isCollapse" />
		<el-scrollbar wrap-class="scrollbar-wrapper">
			<el-menu
				:default-active="activeMenu"
				:collapse="isCollapse"
				:background-color="variables.menuBg"
				:text-color="variables.menuText"
				:unique-opened="false"
				:active-text-color="variables.menuActiveText"
				:collapse-transition="false"
				mode="vertical"
			>
				<!-- 首页菜单项 -->
				<app-link :to="'/'">
					<el-menu-item :index="'0'">
						<item :icon="'dashboard'" :title="'首页'" />
					</el-menu-item>
				</app-link>
				<sidebar-item
					v-for="route in permission_routes"
					:key="route.name"
					:item="route"
					:base-path="basePath"
				/>
			</el-menu>
		</el-scrollbar>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import Item from './Item'
import AppLink from './Link'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
	components: { Item, AppLink, SidebarItem, Logo },
	computed: {
		...mapGetters(['permission_routes', 'sidebar']),
		activeMenu() {
			const route = this.$route
			const { meta, path } = route
			// if set path, the sidebar will highlight the path you set
			if (meta.activeMenu) {
				return meta.activeMenu
			}
			return path
		},
		showLogo() {
			return this.$store.state.settings.sidebarLogo
		},
		variables() {
			return variables
		},
		isCollapse() {
			return !this.sidebar.opened
		},
		basePath() {
			return this.$store.state.app.config.baseUrl
		}
	}
}
</script>
