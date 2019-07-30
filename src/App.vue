<template>
  <div id="app">
    <transition name="fade">
      <router-view />
    </transition>
  </div>
</template>
<script>
export default {
  name: 'App'
}
</script>
<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  min-width: 768px;
  min-height: 768px;
}
</style>
