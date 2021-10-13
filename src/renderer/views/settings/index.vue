<template>
  <div class="settings-view">
    <h2><em class="el-icon-back" @click="saveSettings"/> 系统设置</h2>
    <el-form ref="settingForm" :model="settingForm" :rules="formRules" label-width="120px" label-position="left">
      <el-form-item label="用户姓名" prop="userName">
        <el-input maxlength="8" show-word-limit v-model="settingForm.userName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'SettingsPage',
    data() {
      return {
        settingForm: {
          userName: null,
          androidHome: null
        },
        formRules: {
          userName: [
            { required: true, message: '请输入姓名', trigger: 'blur' },
            { min: 2, max: 8, message: '姓名长度不能超过8字符', trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
      this.settingForm.userName = this.$store.getters.userInfo.name
    },
    methods: {
      saveSettings() {
        const name = this.settingForm.userName.trim()
        this.$refs.settingForm.validate((valid) => {
          if (valid) {
            this.$store.commit('user/SET_NAME', name)

            this.$router.back()
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style scoped lang="scss">
.settings-view {
  padding: 10px 30px;
}
</style>
