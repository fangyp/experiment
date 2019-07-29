<template>

  <div class="app-container">
    <h1>Hello world! 哈哈哈</h1>
  </div>

</template>

<script>
import poppyjs from 'poppyjs-elem'

export default {
  props: [],
  data: function() {
    return {
      userName: 'hello world!'
    }
  },

  mounted: function() {
    // console.log('>>>>>>>>>>>>>>>>>>> UserInfo mounted.', this.$route)
    // console.log('>>>>>>>>>>>>>>>>>>> UserInfo mounted.', this.$route.fullPath)
    poppyjs.html.Dialog.showToast('您的啊啊哈哈大护法')
  },
  methods: {
  }
}

</script>

<style lang="scss">
</style>

