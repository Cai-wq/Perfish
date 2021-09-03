<template>
  <div>
    <el-container>
      <el-aside>
        <user-info-view />

        <el-tabs v-model="platform" stretch @tab-click="switchPlatform">
          <el-tab-pane name="Android" :disabled="testing">
            <span slot="label"><svg-icon icon-class="android-logo" /> Android</span>
          </el-tab-pane>
          <el-tab-pane name="iOS" :disabled="testing">
            <span slot="label"><svg-icon icon-class="apple-logo" /> iOS</span>
          </el-tab-pane>
        </el-tabs>

        <el-select v-model="deviceId" placeholder="请选择测试设备" style="width: 100%" :disabled="testing" @change="chooseDevice">
          <el-option
            v-for="item in deviceList"
            :key="item.udid"
            :label="item.name"
            :value="item.udid" />
        </el-select>
        <el-select v-model="app" placeholder="请选择测试应用" style="width: 100%" :disabled="testing">
          <el-option
              v-for="item in appList"
              :key="item.packageName"
              :label="item.version ? item.name + '(' + item.version + ')' : item.name"
              :value="item.packageName" />
        </el-select>

        <el-divider />
        <device-info-view :platform="platform" :device-id="deviceId"/>
      </el-aside>

      <el-main>
        <performance-page :platform="platform" :device-id="deviceId" :package-name="app ? app : undefined" @start="onTesting" @stop="onFinish"/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import UserInfoView from './components/UserInfoView'
  import DeviceInfoView from './components/DeviceInfoView'
  import PerformancePage from '@/views/performance'
  import { getIosDevices, getIosApplications } from '@/utils/iosUtil'
  import { getAndroidDevices, getAndroidApplications } from '@/utils/AndroidUtil'

  export default {
    name: 'MainMenu',
    components: {
      UserInfoView,
      DeviceInfoView,
      PerformancePage
    },
    data() {
      return {
        platform: 'iOS',
        deviceId: undefined,
        device: null,
        app: undefined,
        tab: 'device',
        testing: false
      }
    },
    computed: {
      deviceList() {
        return this.platform === 'Android' ? this.getAndroidDeviceList() : this.getIosDeviceList()
      },
      appList() {
        return this.platform === 'Android' ? this.getAndroidAppList(this.deviceId) : this.getIosAppList(this.deviceId)
      }
    },
    methods: {
      switchPlatform() {
        this.deviceId = undefined
        this.device = null
        this.app = undefined
      },
      chooseDevice() {
        this.app = null
      },
      getIosDeviceList() {
        return getIosDevices()
      },
      getAndroidDeviceList() {
        return getAndroidDevices()
      },
      getIosAppList(deviceId) {
        if (!deviceId || deviceId === '') {
          return []
        }
        return getIosApplications(deviceId)
      },
      getAndroidAppList(deviceId) {
        return getAndroidApplications(deviceId)
      },
      onTesting(val) {
        this.testing = val === true || val === 'true' || val === 1
      },
      onFinish(data) {
        // TODO 测试完成弹出上传报告弹窗
        console.log('收集到性能数据类型:' + Object.keys(data))
      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-aside {
    padding: 0 15px;
  }
  .el-main {
    padding: 0;
  }
</style>
