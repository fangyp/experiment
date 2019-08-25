<template>
	<div id="login" class="login-container">
		<div class="title-container">
			<img src="../../icons/logo/logotbf.png">
			<span>{{this.$store.state.settings.title}}</span>
		</div>
		<el-form class="login-form">
			<el-form-item prop="username">
				<span class="svg-container">
					<font-awesome-icon icon="user" />
				</span>
				<!-- <el-input type="password" style="position:fixed;bottom:-8000px" /> -->
				<el-input type="text" placeholder="请输入用户名" :value="account" @input="setAccount" />
			</el-form-item>
			<el-form-item>
				<span class="svg-container">
					<font-awesome-icon icon="unlock" />
				</span>
				<!-- <el-input type="password" style="position:fixed;bottom:-9000px" /> -->
				<el-input placeholder="请输入您的密码" :value="password" show-password @input="setPassword" />
			</el-form-item>
			<!-- <el-checkbox :checked="checked" @change="setChecked">记住密码</el-checkbox> -->
			<el-button
				type="primary"
				style="margin-top:15px; height:40px; width:100%;margin-bottom:60px;"
				@click="submitLogin"
			>登录</el-button>
		</el-form>
	</div>
</template>
<script>
import poppyjs from 'poppyjs-elem'
const isEmpty = poppyjs.util.StringUtil.isEmpty
const showToast = poppyjs.html.Dialog.showMessage

import { mapState } from 'vuex'
export default {
	computed: {
		/**
     * state
     * */
		...mapState({
			account: state => state.login.account,
			password: state => state.login.password,
			checked: state => state.login.checked,
			loading: state => state.login.loading
		})
		/**
     * 计算属性
     * */
		// ...mapGetters({ account: "setAccount", password: "setPassword" })
	},
	methods: {
		setAccount(text) {
			this.$store.dispatch('login/setAccount', text.trim())
		},
		setPassword(text) {
			this.$store.dispatch('login/setPassword', text.trim())
		},
		setChecked(isCheck) {
			console.log('isCheck = ' + isCheck)
			this.$store.dispatch('login/setChecked', isCheck)
		},
		submitLogin() {
			if (isEmpty(this.$store.state.login.account)) {
				return showToast('请输入您的登录账号')
			}
			if (isEmpty(this.$store.state.login.password)) {
				return showToast('请输入登录密码')
			}
			const params = {
				account: this.$store.state.login.account,
				password: this.$store.state.login.password
			}
			this.$store.dispatch('login/showLoading', true)
			this.$store.dispatch('login/submitLogin', params).then(() => {
				this.$router.push('/')
			})
		}
	}
}
</script>
<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: rgba(0, 0, 0, 0.85);
      height: 47px;
      caret-color: rgba(0, 0, 0, 0.85);
      vertical-align: middle;
      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px #fff inset !important;
        -webkit-text-fill-color: rgba(0, 0, 0, 0.85) !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    border-radius: 5px;
    color: #454545;
  }
}
</style>
<style lang="scss" scoped>
.login-container {
  min-width: 768;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  background-image: linear-gradient(
    135deg,
    rgba(34, 166, 241, 1),
    #667eea
  ) !important;
  .title-container {
    width: 100%;
    text-align: center;
    margin-top: 140px;
    margin-bottom: 50px;
    height: 120px;
    span {
      color: #fff;
      font-weight: 600;
      font-size: 30px;
      vertical-align: middle;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    }
    img {
      height: 120px;
      margin-right: 16px;
      vertical-align: middle;
    }
  }
  .login-form {
    // background-color: rgba(231, 241, 250, 1);
    background-color: #fff;
    border-radius: 5px;
    width: 500px;
    max-width: 100%;
    margin: 0px auto;
    overflow: hidden;
    padding: 60px 35px 0px 35px;
    box-shadow: 0px 0px 10px rgba(231, 241, 250, 1);
    .svg-container {
      padding: 5px 5px 6px 15px;
      display: inline-block;
      word-wrap: 30px;
      vertical-align: middle;
      color: #889aa4;
      font-size: 20px;
    }
  }
}
</style>
