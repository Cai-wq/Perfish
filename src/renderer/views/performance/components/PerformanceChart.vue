<template>
  <div>
    <div ref="chart" style="height: 250px" />
  </div>
</template>

<script>
  import echarts from 'echarts'
  import ChartResize from '../../layout/mixin/ChartResize'

  export default {
    name: 'PerformanceChart',
    mixins: [ChartResize],
    props: {
      chartData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          console.error('XXXXXXXX=' + JSON.stringify(val))
          if (val.detail && Object.keys(val.detail).length !== 0) {
            this.setOptions(val)
          }
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initChart()
      })
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        this.chart = echarts.init(this.$refs.chart, 'light')
      },
      formatTime(timestamp) {
        const date = new Date(timestamp)
        const YYYY = date.getFullYear()
        const MM = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
        const DD = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        const hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        const mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        const ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        return YYYY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss
      },
      setOptions(chartData) {
        const xData = chartData.detail[Object.keys(chartData.detail)[0]].data.map((item) => {
          return item.time
        })
        const seriesData = []
        const legendData = []
        Object.keys(chartData.detail).forEach((key) => {
          const currentData = {}
          currentData.name = key + '(' + chartData.detail[key].unit + ')'
          legendData.push(currentData.name)
          currentData.type = 'line'
          currentData.symbol = 'none' // 去掉折角处的点
          currentData.dimensions = [{ name: '时间', type: 'time' }, { name: '值' }]
          currentData.data = chartData.detail[key].data.map((item) => {
            return [item.time, item.value]
          })
          seriesData.push(currentData)
        })

        const data = {
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let labelText = ''
              // 显示 x 轴时间的值
              labelText += this.formatTime(params[0].data[0])
              // 可能有不止一个系列，所以要遍历一下
              params.forEach((param) => {
                const dataTime = param.data[1]
                labelText += '<br><strong>' + param.marker + param.seriesName + '</strong>: ' +
                  (Math.round(dataTime) === dataTime ? dataTime : dataTime.toFixed(2))
              })
              return labelText
            }
          },

          legend: {
            data: legendData
          },
          grid: {
            left: '0',
            bottom: '3%',
            right: '2%',
            containLabel: true
          },
          dataZoom: [{
            type: 'slider',
            filterMode: 'filter'
          }],
          xAxis: {
            type: 'time',
            boundaryGap: false,
            data: xData
          },
          yAxis: {
            type: 'value'
          },
          series: seriesData
        }
        // 加第二个参数true强制重绘
        this.chart.setOption(data, true)
      }
    }
  }
</script>

<style scoped>

</style>
