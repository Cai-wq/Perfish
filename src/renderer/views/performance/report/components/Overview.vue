<template>
  <div>
    <el-row class="overview-content">
      <el-col :span="4">
        <h4>CPU均值</h4>
        <h1 v-if="cpuData.avg">{{ cpuData.avg.toFixed(2) }} {{ cpuData.unit }}</h1>
        <h1 v-else>-</h1>
      </el-col>
      <el-col :span="4">
        <h4>CPU峰值</h4>
        <h1 v-if="cpuData.max">{{ cpuData.max.toFixed(2) }} {{ cpuData.unit }}</h1>
        <h1 v-else>-</h1>
      </el-col>
      <el-col :span="4">
        <h4>FPS均值</h4>
        <h1 v-if="fpsData.avg">{{ fpsData.avg.toFixed(2) }}</h1>
        <h1 v-else>-</h1>
      </el-col>
      <el-col :span="4">
        <h4>FPS峰值</h4>
        <h1 v-if="fpsData.max">{{ fpsData.max.toFixed(2) }}</h1>
        <h1 v-else>-</h1>
      </el-col>
      <el-col :span="4">
        <h4>Memory均值</h4>
        <h1 v-if="memoryData.avg">{{ memoryData.avg.toFixed(2) }} {{ memoryData.unit }}</h1>
        <h1 v-else>-</h1>
      </el-col>
      <el-col :span="4">
        <h4>Memory峰值</h4>
        <h1 v-if="memoryData.max">{{ memoryData.max.toFixed(2) }} {{ memoryData.unit }}</h1>
        <h1 v-else>-</h1>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'PerformanceResultOverview',
  props: {
    cpuData: {
      type: Object,
      required: true,
      default: function() {
        return {
          key: '',
          unit: '',
          avg: null,
          max: null
        }
      }
    },
    fpsData: {
      type: Object,
      required: true,
      default: function() {
        return {
          key: '',
          unit: '',
          avg: null,
          max: null
        }
      }
    },
    memoryData: {
      type: Object,
      required: true,
      default: function() {
        return {
          key: '',
          unit: '',
          avg: null,
          max: null
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .overview-content {
    text-align: center;
  }
</style>
