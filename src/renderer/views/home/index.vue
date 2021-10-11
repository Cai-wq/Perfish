<template>
  <div>
    <el-container>
      <el-aside>
        <user-info-view />

        <el-tabs v-model="platform" stretch @tab-click="switchPlatform">
          <el-tab-pane name="Android" :disabled="testing || true">
            <!-- FIXME 安卓暂不开放 -->
            <span slot="label"><svg-icon icon-class="android-logo" /> Android</span>
          </el-tab-pane>
          <el-tab-pane name="iOS" :disabled="testing">
            <span slot="label"><svg-icon icon-class="apple-logo" /> iOS</span>
          </el-tab-pane>
        </el-tabs>

        <el-select v-model="device" value-key="udid" placeholder="请选择测试设备" style="width: 100%" :disabled="testing" @visible-change="updateDeviceList" @change="chooseDevice">
          <el-option
            v-for="item in deviceList"
            :key="item.udid"
            :label="item.name"
            :value="item">
            <span><strong>{{ item.name }}</strong> ({{ item.udid }})</span>
          </el-option>
        </el-select>
        <el-select v-model="app" value-key="packageName" placeholder="请选择测试应用" filterable default-first-option style="width: 100%" :disabled="testing">
          <el-option
              v-for="item in appList"
              :key="item.packageName"
              :label="item.name"
              :value="item">
            <span><strong>{{ item.name }}</strong></span>
            <span v-if="item.name !== item.packageName"> ({{ item.packageName }})</span>
          </el-option>
        </el-select>

        <el-divider />
        <device-info-view ref="deviceInfoView" :platform="platform" :device-id="device ? device.udid : undefined" @update="updateDeviceInfo"/>
      </el-aside>

      <el-main>
        <performance-page :platform="platform" :device-id="device ? device.udid : undefined"
                          :package-name="app ? app.packageName : undefined" :initializing="initializing"
                          @start="onTesting" @stop="onFinish"/>
      </el-main>

      <upload-view :platform="platform" :device-info="deviceInfo" :package-info="app ? app : undefined" :performance-data="performanceData"
                   :show="showUploadDialog" @success="showUploadDialog = false"/>
    </el-container>
  </div>
</template>

<script>
  import UserInfoView from './components/UserInfoView'
  import DeviceInfoView from './components/DeviceInfoView'
  import UploadView from './components/UploadView'
  import PerformancePage from '@/views/performance'
  import { checkIosDepend, getIosDevices, getIosApplications } from '@/utils/iosUtil'
  import { getAndroidDevices, getAndroidApplications } from '@/utils/AndroidUtil'
  import { PerformanceManager } from '@/views/performance/service/PerformanceManager'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'HomePage',
    components: {
      UserInfoView,
      DeviceInfoView,
      UploadView,
      PerformancePage
    },
    data() {
      return {
        platform: 'iOS',
        deviceList: [],
        device: {
          udid: undefined,
          name: undefined
        },
        deviceInfo: {},
        app: undefined,
        initializing: true,
        performanceData: {
          data: {}
        },
        testing: false,
        showUploadDialog: false
      }
    },
    computed: {
      appList() {
        if (!this.device || !this.device.udid) {
          return []
        }
        return this.platform === 'Android' ? this.getAndroidAppList(this.device.udid) : this.getIosAppList(this.device.udid)
      }
    },
    mounted() {
      // 检查环境
      if (!checkIosDepend()) {
        this.$alert('请先安装 TiDevice 和 libimobiledevice', '缺乏必要依赖', {
          confirmButtonText: '退出',
          type: 'error'
        }).finally(() => {
          ipcRenderer.send('SafeExit', 'iOS依赖缺失')
        })
      // } else if (!checkAndroidDepend()) {
      //   this.$alert('请先安装 Android SDK', '缺乏必要依赖', {
      //     confirmButtonText: '退出',
      //     type: 'error'
      //   }).finally(() => {
      //     ipcRenderer.send('SafeExit', 'Android依赖缺失')
      //   })
      } else {
        this.initPerformanceService()
      }
    },
    beforeDestroy() {
      PerformanceManager.clear()
    },
    methods: {
      switchPlatform() {
        this.device = undefined
        this.app = undefined
        this.showUploadDialog = false
        this.initializing = true
        this.initPerformanceService()
      },
      initPerformanceService() {
        PerformanceManager[this.platform].init().then(() => {
          this.initializing = false
        }).catch(err => {
          console.error('初始化' + this.platform + '性能服务失败, error=', err)
          this.initializing = true
        })
      },
      updateDeviceList(show) {
        if (show) {
          this.deviceList = this.platform === 'Android' ? this.getAndroidDeviceList() : this.getIosDeviceList()
        }
        if (this.device && this.deviceList.indexOf(this.device) < 0) {
          this.device = undefined
        }
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
      updateDeviceInfo(val) {
        this.deviceInfo = val
      },
      getIosAppList(deviceId) {
        if (!deviceId || deviceId === '') {
          return []
        }
        return getIosApplications(deviceId)
      },
      getAndroidAppList(deviceId) {
        if (!deviceId || deviceId === '') {
          return []
        }
        return getAndroidApplications(deviceId)
      },
      onTesting(val) {
        this.testing = val === true || val === 'true' || val === 1
      },
      onFinish(data, startTime, endTime) {
        this.testing = false
        console.log('收集到性能数据类型:' + Object.keys(data))
        this.performanceData = {
          data: data,
          startTime: startTime,
          endTime: endTime
        }
        this.showUploadDialog = true
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
