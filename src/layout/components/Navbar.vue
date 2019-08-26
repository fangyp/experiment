<template>
	<div class="navbar">
		<hamburger
			id="hamburger-container"
			:is-active="sidebar.opened"
			class="hamburger-container"
			@toggleClick="toggleSideBar"
		/>

		<el-dialog :title="formTitles[createFormStatus]" :visible.sync="createFormVisible">
			<el-form
				ref="createForm"
				:rules="validation[createFormStatus]"
				:model="createNew"
				label-position="left"
				label-width="100px"
				style="width: 400px; margin-left:10px;"
			>
				<el-form-item label="旧密码" prop="old_password">
					<el-input
						v-model="createNew.old_password"
						style="width: 220px;"
						show-password
						placeholder="请输入旧登录密码"
					/>
				</el-form-item>
				<el-form-item label="新密码" prop="password">
					<el-input
						v-model="createNew.password"
						style="width: 220px;"
						show-password
						placeholder="请设置新密码"
					/>
				</el-form-item>
				<el-form-item label="确认新密码" prop="password_confirmation">
					<el-input
						v-model="createNew.password_confirmation"
						style="width: 220px;"
						show-password
						placeholder="确认登录新密码"
					/>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="medium" @click="createFormVisible = false">取消</el-button>
				<el-button size="medium" type="primary" @click="onSavePassword">确定</el-button>
			</div>
		</el-dialog>

		<breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

		<div class="right-menu">
			<template v-if="device!=='mobile'">
				<error-log class="errLog-container right-menu-item hover-effect" />
				<screenfull id="screenfull" class="right-menu-item hover-effect" />
				<el-tooltip content="Global Size" effect="dark" placement="bottom">
					<size-select id="size-select" class="right-menu-item hover-effect" />
				</el-tooltip>
			</template>

			<el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
				<div class="avatar-wrapper">
					<span class="welcome">欢迎您:</span>
					<span class="name">{{ username }}<span class="role-name">({{roleName}})</span></span>
					<i class="el-icon-caret-bottom" />
				</div>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item>
						<span style="display:block;" @click="modifyPassAction">修改密码</span>
					</el-dropdown-item>
					<el-dropdown-item divided>
						<span style="display:block;" @click="logout">退出登录</span>
					</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import { mapState } from 'vuex'
export default {
	components: {
		Breadcrumb,
		Hamburger,
		ErrorLog,
		Screenfull,
		SizeSelect
	},
	computed: {
		...mapState({
			username: state => state.user.introduction,
			roleName: state => state.user.roleNames[0] || '',
			createNew: state => state.user.createNew,
			validation: state => state.user.validation,
			createFormStatus: state => state.user.createFormStatus,
			showFormLoading: state => state.user.showFormLoading,
			formTitles: state => state.user.formTitles
		}),
		createFormVisible: {
			get() {
				return this.$store.state.user.createFormVisible
			},
			set(val) {
				this.$store.state.user.createFormVisible = val
			}
		},
		...mapGetters(['sidebar', 'avatar', 'device'])
	},
	methods: {
		toggleSideBar() {
			this.$store.dispatch('app/toggleSideBar')
		},
		async logout() {
			await this.$store.dispatch('user/logout')
			this.$router.push(`auth/login?redirect=${this.$route.fullPath}`)
		},
		/**
     * 修改密码
     */
		modifyPassAction() {
			this.$store.dispatch('user/onModifyPassAction')
			this.$nextTick(() => {
				this.$refs['createForm'].clearValidate()
			})
		},
		/** 更新密码 */
		onSavePassword() {
			this.$refs['createForm'].validate(valid => {
				if (valid) {
					const payload = {
						finishCallback: () => this.logout()
					}
					this.$store.dispatch('user/onUpdatePasword', payload)
					this.$nextTick(() => {
						this.$refs['createForm'].clearValidate()
					})
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/styles/my_variables.scss';

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        position: relative;
        .welcome {
          font-size: 15px;
        }
        .name {
          font-size: 25px;
          font-weight: bold;
        }
		.role-name {
			font-size: 14px;
			font-weight: 400;
			color: $text-minor;
		}
        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
