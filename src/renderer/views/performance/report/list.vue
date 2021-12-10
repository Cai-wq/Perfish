<template>
  <div class="app-container">
    <el-tabs v-model="platform" @tab-click="switchPlatform">
      <el-tab-pane name="Android">
        <span slot="label"><svg-icon icon-class="android-logo"/> Android</span>
      </el-tab-pane>
      <el-tab-pane name="iOS">
        <span slot="label"><svg-icon icon-class="apple-logo"/> iOS</span>
      </el-tab-pane>
    </el-tabs>

    <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        stripe
    >
      <el-table-column label="APP" width="150">
        <template slot-scope="scope">
          <div class="package-info">
            <h4>{{ scope.row.packageInfo.applicationName }}</h4>
            <p>版本号: {{ scope.row.packageInfo.version }}</p>
            <p>Build号: {{ scope.row.packageInfo.buildNum }}</p>
            <p>{{ scope.row.packageName }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="设备">
        <template slot-scope="scope">
          <div class="device-info">
            <p>{{ scope.row.deviceInfo.devices[0].deviceName }}</p>
            <p v-if="scope.row.platform === 'ios'">iOS {{ scope.row.deviceInfo.devices[0].osVersion }}</p>
            <p v-else>Android {{ scope.row.deviceInfo.devices[0].osVersion }}</p>
            <p>UDID: {{ scope.row.deviceId }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标题" prop="title" />
      <el-table-column label="描述" prop="description"/>
      <el-table-column label="CPU均值" align="center" width="100">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.CPU">
            {{ scope.row.overviewData.CPU.avg.toFixed(2) }}{{ scope.row.overviewData.CPU.unit }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="CPU峰值" align="center" width="100">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.CPU">
            {{ scope.row.overviewData.CPU.max.toFixed(2) }}{{ scope.row.overviewData.CPU.unit }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="FPS均值" align="center" width="80">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.FPS">
            {{ scope.row.overviewData.FPS.avg.toFixed(2) }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="FPS峰值" align="center" width="80">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.FPS">
            {{ scope.row.overviewData.FPS.max.toFixed(2) }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="Memory均值" align="center" width="110">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.Memory">
            {{ scope.row.overviewData.Memory.avg.toFixed(2) }}{{ scope.row.overviewData.Memory.unit }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="Memory峰值" align="center" width="110">
        <template slot-scope="scope">
          <p v-if="scope.row.overviewData.Memory">
            {{ scope.row.overviewData.Memory.max.toFixed(2) }}{{ scope.row.overviewData.Memory.unit }}
          </p>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column label="保存时间" align="center" width="95">
        <template slot-scope="scope">
          <p>{{ getDate(scope.row.startTime) }}</p>
          <p>{{ getTime(scope.row.startTime) }}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="80">
        <template slot-scope="scope">
          <router-link :to="{name: 'LocalReportPage', query: { infoData: scope.row }}">
            <el-button type="text" size="small">查看报告</el-button>
          </router-link>
          <el-button type="text" size="small" @click="deleteReport(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList"/>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'

  export default {
    name: 'LocalReportListPage',
    components: { Pagination },
    data() {
      return {
        platform: 'Android',
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          orderBy: 'startTime',
          desc: true
        },
        activateRow: null
      }
    },
    mounted() {
      this.platform = this.$store.getters.platform
      this.getList()
    },
    methods: {
      switchPlatform() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        try {
          const all = this.$db.read().get(this.platform.toLowerCase()).value()
          all.sort((a, b) => {
            return b.startTime - a.startTime
          })
          this.total = all.length
          this.list = all.filter((item, index) => {
            if (index >= ((this.listQuery.page - 1) * this.listQuery.limit) && index < this.listQuery.page * this.listQuery.limit) {
              return item
            }
          })
        } catch (e) {
          console.error('读取报告列表失败, error=', e)
          this.$message.error('读取报告列表失败, error=' + e)
        } finally {
          this.listLoading = false
        }
      },
      getDate(timestamp) {
        const date = new Date(timestamp)
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      },
      getTime(timestamp) {
        const date = new Date(timestamp)
        const min = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes()
        const sec = date.getSeconds() > 10 ? date.getSeconds() : '0' + date.getSeconds()
        return date.getHours() + ':' + min + ':' + sec
      },
      deleteReport(row) {
        try {
          this.$db.get(this.platform.toLowerCase()).remove(row).write()
          this.$message.success('已删除报告: ' + row.title)
        } catch (e) {
          console.error('删除报告失败, error=', e)
          this.$message.error('删除报告失败, error=' + e)
        } finally {
          this.getList()
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .package-info {
    h4 {
      margin: 0 0;
    }

    p {
      margin: 0 0;
    }
  }

  .device-info {
    p {
      margin: 0 0;
    }
  }
</style>
