<template>
  <div
    v-loading="dataLoading"
    class="performance-report"
    element-loading-text="拼命加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row class="content-card">
      <performance-task-info
          :platform="infoData.platform"
          :perf-id="infoData.perfId"
          :title="infoData.title"
          :package-info="infoData.packageInfo"
          :device-info="infoData.deviceInfo"
          :author="infoData.author"
          :start-time="infoData.startTime"
          :end-time="infoData.endTime"
          :create-time="infoData.createTime"
          :description="infoData.description"
      />
    </el-row>
    <el-row class="content-card">
      <el-card>
        <div slot="header" class="header-title">
          <span>概览</span>
        </div>
        <performance-result-overview :cpu-data="infoData.overviewData.CPU" :fps-data="infoData.overviewData.FPS" :memory-data="infoData.overviewData.Memory"/>
      </el-card>
    </el-row>
    <el-row class="content-card">
      <el-card>
        <div slot="header" class="header-title">
          <span>CPU</span>
        </div>
        <performance-chart style="height: 400px" report-mode :overview-data="infoData.overviewData.CPU"
                                       :chart-data="infoData.performanceData && infoData.performanceData.CPU ? infoData.performanceData.CPU : {}"
                                       title="CPU"/>
      </el-card>
    </el-row>
    <el-row class="content-card">
      <el-card>
        <div slot="header" class="header-title">
          <span>Memory</span>
        </div>
        <performance-chart style="height: 400px" report-mode :overview-data="infoData.overviewData.Memory"
                                       :chart-data="infoData.performanceData && infoData.performanceData.Memory ? infoData.performanceData.Memory : {}"
                                       title="Memory"/>
      </el-card>
    </el-row>
    <el-row class="content-card">
      <el-card>
        <div slot="header" class="header-title">
          <span>FPS</span>
        </div>
        <performance-chart style="height: 400px" report-mode :overview-data="infoData.overviewData.FPS"
                                       :chart-data="infoData.performanceData && infoData.performanceData.FPS ? infoData.performanceData.FPS : {}"
                                       title="FPS"/>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import PerformanceTaskInfo from './components/TaskInfoView'
import PerformanceResultOverview from './components/Overview.vue'
import PerformanceChart from '../components/PerformanceChart'
import fs from 'fs-extra'

export default {
  name: 'LocalReportPage',
  components: {
    PerformanceTaskInfo,
    PerformanceResultOverview,
    PerformanceChart
  },
  props: {
    infoData: {
      type: Object,
      require: true
    }
  },
  watch: {
    infoData: {
      deep: true,
      immediate: true,
      handler(val) {
        console.log('更新infoData===', val)
        if (!val.performanceData) {
          this.getPerformanceData()
        }
      }
    }
  },
  data() {
    return {
      dataLoading: true
    }
  },
  methods: {
    getPerformanceData() {
      this.dataLoading = true
      try {
        const detail = fs.readJSONSync(this.infoData.perfDetailFile)
        this.infoData.performanceData = detail
      } catch (e) {
        console.error('读取性能报告详情失败, error=', e)
        this.$message.error('读取性能报告详情失败, error=' + e)
      } finally {
        this.dataLoading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .performance-report {
    margin-bottom: 100px;
  }

  .content-card {
    margin: 15px 20px;

    .header-title {
      font-weight: bold;
    }
  }
</style>
