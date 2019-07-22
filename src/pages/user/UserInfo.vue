<template>

	<div id="app" class="with-weaken-control-label">
<h1>Hello world! 哈哈哈</h1>

	</div> 

</template>

<script>

export default {
	props: [],
    data: function () {
        return {
			userName: 'hello world!'
        };
    },
    methods: {
		f1: function() {}
	},

    mounted: function() {
		console.log('>>>>>>>>>>>>>>>>>>> UserInfo mounted.', this.$route)
		console.log('>>>>>>>>>>>>>>>>>>> UserInfo mounted.', this.$route.fullPath)
		
	}
}

</script>

<style lang="scss">
</style>
