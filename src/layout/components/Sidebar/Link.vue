
<template>
	<!-- eslint-disable vue/require-component-is -->
	<component v-bind="linkProps(to)">
		<slot/>
	</component>
</template>

<script>
//import { isExternal } from "@/utils/validate";

export default {
	props: {
		to: {
			type: String,
			required: true
		},
		isExternal: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	methods: {
		linkProps(url) {
			if (this.isExternal) {
				return {
					is: "a",
					href: url,
					target: "_blank",
					rel: "noopener"
				};
			}
			/*
		return {
			is: "a",
			href: url,
			rel: "noopener"
		};
		*/
			return {
				is: "router-link",
				to: url
			};
		}
	}
};
</script>
