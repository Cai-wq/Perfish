<template>
  <div>
    <h2 class="performance-title"><em class="el-icon-back" @click="clickBack"/>{{ title }}</h2>
    <el-card class="info-card" body-style="padding: 5px 10px">
      <div slot="header">
        <el-row class="info-content" type="flex" justify="center" :gutter="26">
          <el-col :span="4">
            <div class="package-info">
              <h3 v-if="platform.toLowerCase() === 'android'"><svg-icon icon-class="android-logo" /> {{ packageInfo.applicationName }}</h3>
              <h3 v-else><svg-icon icon-class="apple-logo" /> {{ packageInfo.applicationName }}</h3>
              <p>版本号: {{ packageInfo.version }}</p>
              <p>Build号: {{ packageInfo.buildNum }}</p>
              <p>{{ packageInfo.packageName }}</p>
            </div>
          </el-col>
          <el-col :span="1">
            <el-divider direction="vertical" />
          </el-col>
          <el-col :span="8">
            <div class="device-info">
              <svg class="svg-logo" aria-hidden="true" v-on="$listeners">
                <use :xlink:href="`#icon-mobile-phone`" />
              </svg>
              <div>
                <p>{{ deviceInfo.devices[0].deviceName }}</p>
                <p v-if="deviceInfo.devices[0].devicePlatform === 'IOS'">iOS {{ deviceInfo.devices[0].osVersion }}</p>
                <p v-else>Android {{ deviceInfo.devices[0].osVersion }}</p>
                <p>UDID: {{ deviceInfo.devices[0].udid }}</p>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="device-info">
              <svg class="svg-logo" aria-hidden="true" style="float: left;" v-on="$listeners">
                <use :xlink:href="`#icon-avatar`" />
              </svg>
              <div>
                <h3>创建者</h3>
                <p>{{ author }}</p>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="device-info">
              <svg class="svg-logo" aria-hidden="true" style="float: left;" v-on="$listeners">
                <use :xlink:href="`#icon-timing`" />
              </svg>
              <div>
                <h3>时长</h3>
                <p>{{ getElapsedTime }}</p>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="device-info">
              <svg class="svg-logo" aria-hidden="true" style="float: left;" v-on="$listeners">
                <use :xlink:href="`#icon-clock`" />
              </svg>
              <div>
                <h3>上报时间</h3>
                <p>{{ createTime }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="remark-content">
        <span>备注：</span>
        <el-input v-model="description" type="text" maxlength="200" show-word-limit placeholder="填写备注信息，不超过200字符" @change="submitDescription" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PerformanceTaskInfo',
  props: {
    platform: {
      type: String,
      required: true
    },
    perfId: {
      type: Number,
      required: false
    },
    title: {
      type: String,
      required: true,
      default: ''
    },
    packageInfo: {
      type: Object,
      required: true,
      default() {
        return {
          applicationName: 'UNKNOWN',
          packageName: '',
          version: '',
          buildNum: '',
          androidMainActivity: null
        }
      }
    },
    deviceInfo: {
      type: Object,
      required: false,
      default() {
        return {
          devices: [{
            devicePlatform: 'ANDROID',
            deviceName: 'UNKNOWN',
            osVersion: '',
            udid: ''
          }]
        }
      }
    },
    author: {
      type: String,
      required: false,
      default: null
    },
    createTime: {
      type: String,
      required: false,
      default: null
    },
    startTime: {
      type: Number,
      required: false,
      default: null
    },
    endTime: {
      type: Number,
      required: false,
      default: null
    },
    description: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    getElapsedTime() {
      if (!this.startTime || !this.endTime) {
        return 'UNKNOWN'
      }
      const start = new Date(this.startTime).getTime()
      const end = new Date(this.endTime).getTime()
      const dateDiff = end - start
      const leave1 = dateDiff % (24 * 3600 * 1000)
      const hours = Math.floor(leave1 / (3600 * 1000))
      const leave2 = leave1 % (3600 * 1000)
      const minutes = Math.floor(leave2 / (60 * 1000))
      const leave3 = leave2 % (60 * 1000)
      const seconds = Math.round(leave3 / 1000)
      return hours + 'h ' + minutes + 'm ' + seconds + 's'
    }
  },
  methods: {
    clickBack() {
      this.$router.back()
    },
    submitDescription() {
      try {
        this.$db.get(this.platform.toLowerCase())
          .find({ perfId: this.perfId })
          .assign({ description: this.description })
          .write()
        this.$message.success('更新成功')
      } catch (e) {
        console.error('更新备注失败, error=', e)
        this.$message.error('更新备注失败, error=' + e)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .performance-title {
    margin: 0;
  }
  .info-card {
    background-image: linear-gradient(to bottom right, #95B4A9, #00B0E2);
    /*background-image: linear-gradient(to right, #99a9bf, #00A3E4, #99a9bf);*/
    /*background-image: linear-gradient(to right, #95B4A9, #00B0E2);*/
    /*background-image: linear-gradient(to right, #4062E0, #807CD2);*/
  }
  .svg-logo {
    width: 6em;
    height: 5em;
    float: left;
    padding-right: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  .info-content {
    color: white;
  }
  .package-info {
    h4 {
      margin: 0 0;
    }
    p {
      margin: 0 0;
    }
  }
  /*.device-info {*/
  /*  p {*/
  /*    margin: 0 0;*/
  /*  }*/
  /*}*/
  .el-divider--vertical {
    height: 100%;
    margin-left: 20px;
  }
  .remark-content {
    color: white;
    .el-input {
      width: 96%;
    }
  }
</style>
