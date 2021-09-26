<template>
  <div
      v-loading="initializing"
      element-loading-text="环境准备中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)">
    <h3 style="float: left">移动端性能测试</h3>
    <div style="float: right; cursor: pointer;">
      <svg v-if="!running" class="svg-logo" aria-hidden="true" v-on="$listeners" @click="startTest">
        <use :xlink:href="`#icon-play`" />
      </svg>
      <!--      <svg class="svg-logo" aria-hidden="true" v-on="$listeners">-->
      <!--        <use :xlink:href="`#icon-play2`" />-->
      <!--      </svg>-->
      <svg v-else class="svg-logo" aria-hidden="true" v-on="$listeners" @click="stopTest">
        <use :xlink:href="`#icon-stop`" />
      </svg>
      <!--      <svg class="svg-logo" aria-hidden="true" v-on="$listeners">-->
      <!--        <use :xlink:href="`#icon-stop3`" />-->
      <!--      </svg>-->
    </div>

    <div class="perf-chart-view">
      <h3 class="title">CPU</h3>
      <el-card class="chart">
        <performance-chart :chart-data="cpuData"/>
      </el-card>
    </div>
    <div class="perf-chart-view">
      <h3 class="title">FPS</h3>
      <el-card class="chart">
        <performance-chart :chart-data="fpsData"/>
      </el-card>
    </div>
    <div class="perf-chart-view">
      <h3 class="title">Memory</h3>
      <el-card class="chart">
        <performance-chart :chart-data="memoryData"/>
      </el-card>
    </div>
  </div>
</template>

<script>
  import PerformanceChart from './components/PerformanceChart'
  import { PerformanceManager } from './service/PerformanceManager'

  export default {
    name: 'PerformancePage',
    components: {
      PerformanceChart
    },
    props: {
      initializing: {
        type: Boolean,
        required: true,
        default: function() {
          return true
        }
      },
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
      },
      packageName: {
        type: String,
        required: true,
        default: function() {
          return ''
        }
      }
    },
    data() {
      return {
        running: false,
        timer: null,
        startTime: null,
        endTime: null,
        cpuData: {},
        memoryData: {},
        fpsData: {}
      }
    },
    beforeDestroy() {
      this.stopTest()
    },
    methods: {
      startTest() {
        this.resetDataMap()
        if (!this.deviceId || this.deviceId === '') {
          this.$message.error('请先选择测试设备及应用')
          console.error('请先选择测试设备及应用')
          return
        }
        if (!this.packageName || this.packageName === '') {
          this.$message.error('请先选择测试应用')
          console.error('请先选择测试应用')
          return
        }
        console.log('开始性能采集! deviceId=' + this.deviceId + ', packageName=' + this.packageName)
        this.setRunning(true)

        // 启动性能数据采集
        PerformanceManager[this.platform].start(this.deviceId, this.packageName).then(() => {
          console.error('start返回成功')
          this.startTime = new Date().getTime()
          // 定时每秒dump一次数据
          this.timer = setInterval(() => {
            // console.log('定时每秒dump一次数据')
            PerformanceManager[this.platform].dump().then(res => {
              // console.log('返回啦===' + JSON.stringify(res))
              Object.keys(res.CPU.detail).forEach((key) => {
                if (!this.cpuData.detail.hasOwnProperty(key)) {
                  this.cpuData.detail[key] = {
                    unit: '',
                    data: []
                  }
                }
                const item = res.CPU.detail[key]
                this.cpuData.detail[key].unit = item.unit
                this.cpuData.detail[key].data.push(item.data)
              })
              Object.keys(res.FPS.detail).forEach((key) => {
                if (!this.fpsData.detail.hasOwnProperty(key)) {
                  this.fpsData.detail[key] = {
                    unit: '',
                    data: []
                  }
                }
                const item = res.FPS.detail[key]
                this.fpsData.detail[key].unit = item.unit
                this.fpsData.detail[key].data.push(item.data)
              })
              Object.keys(res.Memory.detail).forEach((key) => {
                if (!this.memoryData.detail.hasOwnProperty(key)) {
                  this.memoryData.detail[key] = {
                    unit: '',
                    data: []
                  }
                }
                const item = res.Memory.detail[key]
                this.memoryData.detail[key].unit = item.unit
                this.memoryData.detail[key].data.push(item.data)
              })
            })
          }, 1000)
        })
      },
      stopTest() {
        console.log('测试结束')
        this.endTime = new Date().getTime()
        clearInterval(this.timer)
        this.timer = null
        PerformanceManager[this.platform].stop().then(() => {
          this.setRunning(false)
        })
      },
      setRunning(val) {
        this.running = val
        if (val) {
          this.$emit('start', val)
        } else {
          this.$emit('stop', { CPU: this.cpuData, FPS: this.fpsData, Memory: this.memoryData }, this.startTime, this.endTime)
          this.startTime = null
          this.endTime = null
        }
      },
      resetDataMap() {
        this.cpuData = {
          detail: {
            AppAllCpu: {
              unit: '%',
              data: []
            }
          }
        }
        this.fpsData = {
          detail: {
            FPS: {
              unit: '帧/秒',
              data: []
            }
          }
        }
        this.memoryData = this.platform === 'Android' ? {
          detail: {
            PSS: {
              unit: 'MB',
              data: []
            }
          }
        } : {
          detail: {
            VirtualMemory: {
              unit: 'MB',
              data: []
            }
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .svg-logo {
    width: 48px;
    height: 48px;
    padding: 3px 3px;
    margin-top: 5px;
    margin-right: 7px;
    /*float: left;*/
    /*padding-right: 1em;*/
    /*vertical-align: -0.15em;*/
    /*fill: currentColor;*/
    /*overflow: hidden;*/
  }

  .perf-chart-view {
    display: flex;
    width: 100%;
    /*margin-bottom: 10px;*/

    .title {
      margin: auto;
      writing-mode: vertical-rl;
    }

    .chart {
      flex: 1;
    }
  }
</style>
