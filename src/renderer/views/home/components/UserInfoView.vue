<template>
  <div>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <p class="user-name">
          <template>
            {{ userName }}
          </template>
        </p>
        <em class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <el-dropdown-item>
          <el-link :underline="false" @click="openPoseidon">海王平台</el-link>
        </el-dropdown-item>
        <router-link class="inlineBlock" to="/settings">
          <el-dropdown-item>
            设置
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided @click.native="logout" disabled>
          <span style="display:block;">退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
  import { shell } from 'electron'

  export default {
    name: 'UserInfoView',
    computed: {
      userName() {
        return this.$store.getters.userInfo.name
      }
    },
    methods: {
      openPoseidon() {
        shell.openExternal('http://poseidon.183me.com')
      },
      async logout() {
        await this.$store.dispatch('user/ssoLogout')
        const backUrl = escape(window.location.href)
        window.location.href = process.env.APP_SSO_SERVER + '/logout?backUrl=' + backUrl
      }
    }
  }
</script>

<style lang="scss" scoped>
  .avatar-container {
    /*margin-right: 30px;*/

    .avatar-wrapper {
      margin-top: 5px;
      position: relative;

      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .user-name {
        cursor: pointer;
        border-radius: 10px;
        font-size: 18px;
      }

      .el-icon-caret-bottom {
        cursor: pointer;
        position: absolute;
        right: -20px;
        top: 5px;
        font-size: 12px;
      }
    }
  }
</style>
