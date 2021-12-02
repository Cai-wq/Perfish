<template>
  <div
      v-loading="initializing || serverHandling"
      :element-loading-text="initializing ? '环境准备中' : '系统处理中, 请稍后, 不要重复操作'"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)">
    <h3 class="head-title">移动端性能测试</h3>
    <div v-if="running" class="head-operation">
      <span class="elapsed-time">
        {{ elapsedTime }}
      </span>
      <svg class="svg-logo" aria-hidden="true" v-on="$listeners" @click="stopTest">
        <use :xlink:href="`#icon-stop`" />
      </svg>
    </div>
    <div v-else class="head-operation">
      <svg class="svg-logo" aria-hidden="true" v-on="$listeners" @click="startTest">
        <use :xlink:href="`#icon-play`" />
      </svg>
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
  import { PerformanceManager } from '@/performance/PerformanceManager'
  import { formatCurrentElapsedTime } from '@/utils'

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
        serverHandling: false,
        running: false,
        timer: null,
        startTime: null,
        endTime: null,
        elapsedTime: '00:02:33',
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
        this.elapsedTime = '00:00:00'
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

        this.serverHandling = true
        // 启动性能数据采集
        PerformanceManager[this.platform].start(this.deviceId, this.packageName).then(() => {
          console.error('start返回成功')
          this.serverHandling = false
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
            this.getElapsedTime()
          }, 1000)
        }).catch(error => {
          console.error('Start失败, error=', error)
          this.$message.error('Start失败, error=' + error)
        })
      },
      stopTest() {
        console.log('测试结束')
        this.serverHandling = true
        this.endTime = new Date().getTime()
        clearInterval(this.timer)
        this.timer = null
        PerformanceManager[this.platform].stop().then(() => {
          this.serverHandling = false
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
      },
      getElapsedTime() {
        this.elapsedTime = formatCurrentElapsedTime(this.startTime)
      }
    }
  }
</script>

<style lang="scss" scoped>

  .head-title {
    float: left;
  }

  .head-operation {
    float: right;
    display: flex;
    justify-content: space-between;

    .elapsed-time {
      font-size: 24px;
      text-align: center;
      display: block;
      margin-block-start: 12px;
      margin-block-end: 12px;
      font-weight: bold;
    }

    .svg-logo {
      cursor: pointer;
      width: 48px;
      height: 48px;
      padding: 3px 3px;
      margin-top: 5px;
      margin-left: 10px;
      margin-right: 7px;
      /*float: left;*/
      /*padding-right: 1em;*/
      /*vertical-align: -0.15em;*/
      /*fill: currentColor;*/
      /*overflow: hidden;*/
    }
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
