<template>
  <div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="label" label="Info" />
      <el-table-column prop="value" label="Value" />
    </el-table>
  </div>
</template>

<script>
  import { getIosDeviceInfo } from '@/performance/iOSService'
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
      async getDeviceInfo(platform, deviceId) {
        if (!deviceId || deviceId === '') {
          console.log('请选择测试设备')
          this.deviceInfo = {}
          return
        }
        if (this.platform === 'Android') {
          this.deviceInfo = getAndroidDeviceInfo(deviceId)
        } else {
          await getIosDeviceInfo(deviceId).then(result => {
            this.deviceInfo = result
          }).catch(e => {
            this.deviceInfo = {}
          })
        }
        this.$emit('update', this.deviceInfo)
      }
    }
  }
</script>

<style scoped>

</style>
