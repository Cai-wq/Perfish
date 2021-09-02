<template>
  <div>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <p class="user-name">
          <template>
            {{ userName() }}
          </template>
        </p>
        <em class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <router-link class="inlineBlock" to="/">
          <el-dropdown-item>
            海王平台
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item>
          设置
        </el-dropdown-item>
        <el-dropdown-item divided>
          <span style="display:block;">退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
  export default {
    name: 'UserInfoView',
    methods: {
      userName() {
        return '蔡伟琪'
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
