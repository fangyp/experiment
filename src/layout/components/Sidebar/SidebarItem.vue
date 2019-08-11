<template>
	<div v-if="item.isMenu" class="menu-wrapper">
		<template v-if="hasOneShowingChild(item)">
			<app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild)">
				<el-menu-item :index="onlyOneChild.id" :class="{'submenu-title-noDropdown':!isNest}">
					<item
						:icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)"
						:title="onlyOneChild.meta.title"
					/>
				</el-menu-item>
			</app-link>
		</template>

		<el-submenu v-else ref="subMenu" :index="item.id" popper-append-to-body>
			<template slot="title">
				<item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
			</template>
			<sidebar-item
				v-for="child in item.children"
				:key="child.path"
				:is-nest="true"
				:item="child"
				:base-path="basePath"
				class="nest-menu"
			/>
		</el-submenu>
	</div>
</template>

<script>
import path from 'path'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
	name: 'SidebarItem',
	components: { Item, AppLink },
	mixins: [FixiOSBug],
	props: {
		// route object
		item: {
			type: Object,
			required: true
		},
		isNest: {
			type: Boolean,
			default: false
		},
		basePath: {
			type: String,
			default: ''
		}
	},
	data() {
		// To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
		// TODO: refactor with render function
		this.onlyOneChild = null
		return {}
	},
	methods: {
		hasOneShowingChild(parent) {
			let showingChildren = null
			if (parent.children) {
				showingChildren = parent.children.filter(item => {
					if (item.isMenu) {
						return true
					} else {
						return false
					}
				})
			}

			// Show parent if there are no child router to display
			if (!showingChildren) {
				this.onlyOneChild = { ...parent, noShowingChildren: true }
				return true
			}

			return false
		},
		resolvePath(route) {
			if (route.external) {
				return route.path
			}
			if (this.basePath.startsWith('/')) {
				return path.resolve(route.path)
			}
			return this.basePath + path.resolve(route.path)
		}
	}
}
</script>
