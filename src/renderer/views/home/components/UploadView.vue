<template>
  <el-dialog
      title="上传至海王平台"
      :visible.sync="show"
      @opened="afterOpen"
      @close="beforeClose">
    <div
        class="app-container"
        v-loading="uploading"
        element-loading-text="上传中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.5)">
      <el-form ref="uploadForm" :model="uploadForm" :rules="formRules" label-width="80px" label-position="left">
        <el-form-item label="平台" prop="platform">
          <el-radio-group v-model="platform">
            <el-radio-button label="Android" :disabled="platform !== 'Android'"></el-radio-button>
            <el-radio-button label="iOS" :disabled="platform !== 'iOS'"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="deviceInfo.UDID" disabled />
        </el-form-item>
        <el-form-item label="测试APP" prop="packageName">
          <el-input v-model="packageInfo.packageName" disabled />
        </el-form-item>
        <el-form-item label="性能数据" prop="classify">
          <el-checkbox-group v-model="uploadForm.classify" :min="3" :max="3">
            <el-checkbox
                v-for="item in performanceData.data ? Object.keys(performanceData.data) : {}"
                :label="item"
                :key="item" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input maxlength="200" show-word-limit v-model="uploadForm.title" />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input type="textarea" maxlength="255" show-word-limit :autosize="{ minRows: 3, maxRows: 6}" v-model="uploadForm.description" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUpload">立即上传</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
  import { uploadPerformanceInfo } from '@/api/poseidon'
  import { getAppBuildVersion as androidBuildVersion } from '@/utils/AndroidUtil'

  export default {
    name: 'UploadView',
    props: {
      show: {
        type: Boolean,
        required: true,
        default: function() {
          return false
        }
      },
      platform: {
        type: String,
        required: true
      },
      performanceData: {
        type: Object,
        required: true,
        default: function() {
          return {}
        }
      },
      deviceInfo: {
        type: Object,
        required: true,
        default: function() {
          return {
            name: null,
            udid: null
          }
        }
      },
      packageInfo: {
        type: Object,
        required: true,
        default: function() {
          return {
            name: null,
            packageName: null,
            version: null
          }
        }
      }
    },
    data() {
      return {
        showUploadDialog: false,
        uploading: false,
        uploadForm: {
          classify: [],
          title: null,
          description: null
        },
        formRules: {
          title: [
            { required: true, message: '请输入报告标题', trigger: 'blur' },
            { min: 3, max: 200, message: '标题长度限制3~200字符', trigger: 'blur' }
          ],
          description: [
            { max: 255, message: '备注长度不能超过255字符', trigger: 'blur' }
          ]
        }
      }
    },
    watch: {
      performanceData: {
        handler(val) {
          this.uploadForm.classify = Object.keys(val.data)
          console.log('收集到性能数据分类：', this.uploadForm.classify)
        }
      }
    },
    methods: {
      getAppBuildVersion(deviceId, packageName) {
        return this.platform === 'Android' ? androidBuildVersion(deviceId, packageName) : this.packageInfo.buildNum
      },
      submitUpload() {
        this.$refs.uploadForm.validate((valid) => {
          if (valid) {
            this.uploading = true
            const deviceId = this.deviceInfo.UDID
            const data = {
              platform: this.platform.toLowerCase(),
              title: this.uploadForm.title.trim(),
              description: this.uploadForm.description,
              deviceId: deviceId,
              deviceInfo: {
                devices: [{
                  devicePlatform: this.platform.toLowerCase(),
                  deviceName: this.deviceInfo.DeviceName,
                  udid: deviceId,
                  osVersion: this.deviceInfo.OSVersion
                }]
              },
              packageName: this.packageInfo.packageName,
              packageInfo: {
                applicationName: this.packageInfo.name,
                packageName: this.packageInfo.packageName,
                version: this.packageInfo.version,
                buildNum: this.getAppBuildVersion(deviceId, this.packageInfo.packageName)
              },
              performanceData: this.performanceData.data,
              author: this.$store.getters.userInfo.name,
              startTime: this.performanceData.startTime,
              endTime: this.performanceData.endTime
            }
            uploadPerformanceInfo(data).then(res => {
              if (res.code === 200) {
                this.$message.success('上传成功')
                this.$emit('success')
              }
            }).catch(e => {
              console.error('上传失败, error=', e)
              this.$message.error('上传失败, error=' + e)
            }).finally(() => {
              this.uploading = false
            })
          } else {
            return false
          }
        })
      },
      afterOpen() {
        if (this.performanceData && this.performanceData.data) {
          this.uploadForm.classify = Object.keys(this.performanceData.data)
        }
      },
      beforeClose() {
        this.uploadForm = {
          title: undefined,
          description: undefined
        }
        this.$emit('closed')
      }
    }
  }
</script>

<style scoped>

</style>
