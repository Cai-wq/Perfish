<template>
  <div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="label" label="Info" />
      <el-table-column prop="value" label="Value" />
    </el-table>
  </div>
</template>

<script>
  import { getIosDeviceInfo } from '@/utils/iosUtil'
  import { getAndroidDeviceInfo } from '@/utils/AndroidUtil'

  export default {
    name: 'DeviceInfoView',
    props: {
      platform: {
        type: String,
        required: true,
        default: function() {
          return 'Android'
        }
      },
      deviceId: {
        type: String,
        required: true,
        default: function() {
          return ''
        }
      }
    },
    data() {
      return {
        deviceInfo: null
      }
    },
    computed: {
      tableData() {
        if (!this.deviceInfo || Object.keys(this.deviceInfo).length === 0) {
          return []
        }
        return Object.keys(this.deviceInfo).map((key) => {
          return {
            label: key,
            value: this.deviceInfo[key]
          }
        })
      }
    },
    watch: {
      deviceId: {
        handler(val) {
          this.getDeviceInfo(this.platform, val)
        }
      }
    },
    methods: {
      getDeviceInfo(platform, deviceId) {
        if (!deviceId || deviceId === '') {
          console.log('请选择测试设备')
          this.deviceInfo = {}
          return
        }
        this.deviceInfo = platform === 'Android' ? getAndroidDeviceInfo(deviceId) : getIosDeviceInfo(deviceId)
      }
    }
  }
</script>

<style scoped>

</style>
