<template>
  <div class="app-container">
    <h1>这是一个测试页面！</h1>
  </div>
</template>

<script>
export default {
	name: 'Test',
	data() {
		return {}
	},
	mounted: function() {
		console.log('================ Test')
		/*
	  poppyjs.html.Dialog.showConfirm({
		  msg: '确认删除用户吗？',
		  title: '删除用户',
		  yesCallback: function() {
			  poppyjs.html.Dialog.showToast('已经删除')
		  }
	  })
	  */
	},
	methods: {}
}
</script>
