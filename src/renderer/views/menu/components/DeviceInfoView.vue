<template>
  <div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="label" label="Info" />
      <el-table-column prop="value" label="Value" />
    </el-table>
  </div>
</template>

<script>
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
        // TODO 根据udid获取设备信息
        if (!deviceId || deviceId === '') {
          console.log('请选择测试设备')
          this.deviceInfo = {}
          return
        }
        this.deviceInfo = platform === 'Android' ? {
          Brand: 'HUAWEI',
          Product: 'INE-TL00',
          OS: '9',
          UDID: 'LSP233333333',
          CpuABI: 'arm64-v8a',
          CpuCoreNum: 4,
          RAM: '4GB'
        } : {
          DeviceName: 'iPhone X',
          ProductType: 'iPhone10,3',
          OS: '11.1.1',
          UDID: '55555555555555',
          Cpu: 'Apple A11 Bionic',
          CpuCoreNum: 6
        }
      }
    }
  }
</script>

<style scoped>

</style>
