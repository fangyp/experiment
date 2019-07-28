<template>

  <div class="app-container">
    <h1>Hello world! 哈哈哈</h1>
  </div>

</template>

<script>

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
  },
  methods: {
    f1: function() {}
  }
}

</script>

<style lang="scss">
</style>

