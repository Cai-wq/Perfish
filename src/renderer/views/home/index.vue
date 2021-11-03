<template>
  <div
      v-loading="initializing"
      element-loading-text="初始化服务..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)">
    <el-container>
      <!-- 左边菜单 -->
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

        <el-select v-model="device" value-key="udid" placeholder="请选择测试设备" style="width: 100%" :disabled="testing" @visible-change="updateDeviceList" @change="chooseDevice">
          <el-option
            v-for="item in deviceList"
            :key="item.udid"
            :label="item.name"
            :value="item">
            <span><strong>{{ item.name }}</strong> ({{ item.udid }})</span>
          </el-option>
        </el-select>
        <el-select v-model="app" value-key="packageName" placeholder="请选择测试应用" filterable default-first-option
                   style="width: 100%" :disabled="testing || !device || !device.udid" @visible-change="updateAppList" @change="chooseApp">
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

      <!-- 主界面 -->
      <el-main>
        <performance-page :platform="platform" :device-id="device ? device.udid : undefined"
                          :package-name="app ? app.packageName : undefined" :initializing="false"
                          @start="onTesting" @stop="onFinish"/>
      </el-main>

      <!-- 上传弹窗 -->
      <upload-view :platform="platform" :device-info="deviceInfo" :package-info="app ? app : undefined" :performance-data="performanceData"
                   :show="showUploadDialog" @success="showUploadDialog = false" @closed="showUploadDialog = false"/>
    </el-container>
  </div>
</template>

<script>
  import UserInfoView from './components/UserInfoView'
  import DeviceInfoView from './components/DeviceInfoView'
  import UploadView from './components/UploadView'
  import PerformancePage from '@/views/performance'
  import { getIosDeviceList, getIosAppList } from '@/performance/iOSService'
  import { checkIosDepend } from '@/utils/iosUtil'
  import { checkAndroidDepend, getAndroidDevices, getAndroidApplications, getAndroidAppName } from '@/utils/AndroidUtil'
  import { PerformanceManager } from '@/performance/PerformanceManager'
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
        appList: [],
        app: undefined,
        initializing: true,
        performanceData: {
          data: {}
        },
        testing: false,
        showUploadDialog: false
      }
    },
    mounted() {
      // 检查环境
      if (!checkIosDepend()) {
        this.$alert('请先安装 XCode及Command Line Tools', '缺乏必要依赖', {
          confirmButtonText: '退出',
          type: 'error'
        }).finally(() => {
          ipcRenderer.send('SafeExit', 'iOS依赖缺失')
        })
      } else if (!checkAndroidDepend()) {
        this.$alert('请先安装 Android SDK', '缺乏必要依赖', {
          confirmButtonText: '退出',
          type: 'error'
        }).finally(() => {
          ipcRenderer.send('SafeExit', 'Android依赖缺失')
        })
      } else {
        this.platform = this.$store.getters.platform
        this.initPerformanceService()
      }
    },
    beforeDestroy() {
      PerformanceManager.clear()
    },
    methods: {
      switchPlatform() {
        this.deviceList = []
        this.device = undefined
        this.appList = []
        this.app = undefined
        this.showUploadDialog = false
        this.initializing = true
        this.initPerformanceService()
        this.$store.dispatch('performance/setPlatform', this.platform)
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
          if (this.platform === 'Android') {
            this.deviceList = getAndroidDevices()
          } else {
            getIosDeviceList().then(result => {
              this.deviceList = result
            }).catch(e => {
              this.deviceList = []
            })
          }
        } else {
          if (this.device && this.deviceList.indexOf(this.device) < 0) {
            this.device = undefined
          }
        }
      },
      chooseDevice() {
        this.app = null
        this.updateAppList()
      },
      updateDeviceInfo(val) {
        this.deviceInfo = val
      },
      updateAppList() {
        if (!this.device || !this.device.udid) {
          return []
        }
        if (this.platform === 'Android') {
          this.appList = getAndroidApplications(this.device.udid)
        } else {
          getIosAppList(this.device.udid).then(result => {
            this.appList = result
          }).catch(e => {
            this.appList = []
          })
        }
      },
      chooseApp(app) {
        if (!app || !app.packageName || !app.name) {
          return
        }
        this.$store.dispatch('performance/setCacheApp', { platform: this.platform, packageName: app.packageName })
        if (this.platform === 'Android' && app.packageName === app.name) {
          const appName = getAndroidAppName(this.device.udid, app.packageName)
          if (appName && appName !== app.packageName) {
            app.name = appName
            this.$store.dispatch('performance/addApplicationMap', { packageName: app.packageName, appName: appName })
          }
        }
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
