<template>
  <div>
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
  import zerorpc from 'zerorpc'
  // import path from 'path'

  const ANDROID_PORT = 14242
  const IOS_PORT = 24242
  export default {
    name: 'PerformancePage',
    components: {
      PerformanceChart
    },
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
        pythonProcess: null,
        rpcClient: null,
        running: false,
        timer: null,
        cpuData: {},
        memoryData: {},
        fpsData: {}
      }
    },
    computed: {
      serverPort() {
        return this.platform === 'Android' ? ANDROID_PORT : IOS_PORT
      }
    },
    mounted() {
      console.log('---进入界面' + process.versions.modules)
      this.rpcClient = new zerorpc.Client()
      // this.createPyProc()
    },
    beforeDestroy() {
      this.stopTest()
      // this.exitPyProc()
    },
    methods: {
      createPyProc() {
        console.log('creating python server...')
        const port = '4242'
        // if (NODE_ENV === 'development') {
        //   let script = path.join(__dirname, 'py', 'InstrumentsServer.py')
        //   let pypath = path.join(__dirname, 'py', '.env', 'scripts', 'python.exe')
        //   pythonProcess = require('child_process').spawn(pypath, [script, port])
        // } else {
        //   let exePath = path.join(__dirname, 'pydist', 'InstrumentsServer')
        const exePath = '/Users/cai/Code/性能/perfect-performance/pydist/InstrumentsServer'
        console.log('py文件=' + exePath)
        this.pythonProcess = require('child_process').execFile(exePath, [port])
        // pythonProcess = require('child_process').execSync('python3 py/InstrumentsServer', [port])
        // }
        if (this.pythonProcess != null) {
          console.log('child process success')
        }
      },
      exitPyProc() {
        this.rpcClient.close()
        this.pythonProcess.kill()
        this.pythonProcess = null
      },
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
        this.rpcClient.connect('tcp://127.0.0.1:' + this.serverPort)
        this.rpcClient.on('error', function(error) {
          console.error('RPC rpcClient error:', error)
        })

        this.timer = setInterval(() => {
          console.log('延迟执行')
          this.rpcClient.invoke('dump', (error, res) => {
            if (error) {
              console.error(error)
            } else {
              // console.log('返回啦===' + JSON.stringify(res));
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
              // console.log('ChartData.CPU====' + JSON.stringify(this.cpuData));
            }
          })
        }, 1000)
      },
      stopTest() {
        console.log('关闭')
        this.setRunning(false)
        clearInterval(this.timer)
        this.timer = null
        this.$emit('start', { CPU: this.cpuData, FPS: this.fpsData, Memory: this.memoryData })
      },
      setRunning(val) {
        this.running = val
        this.$emit('start', val)
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
