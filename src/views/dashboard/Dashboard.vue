<template>
  <div class="dashboard">
    <!-- 顶部四个统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 + 待处理 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>近7天销售趋势</span>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>待处理事项</span>
          </template>
          <div class="todo-list">
            <div class="todo-item">
              <span class="todo-label">待审核订单</span>
              <el-tag type="warning">{{ statistics?.pendingOrders || 0 }}</el-tag>
            </div>
            <div class="todo-item">
              <span class="todo-label">待审核采购单</span>
              <el-tag type="warning">{{ statistics?.pendingPurchaseOrders || 0 }}</el-tag>
            </div>
            <div class="todo-item">
              <span class="todo-label">低库存商品</span>
              <el-tag type="danger">{{ statistics?.lowStockCount || 0 }}</el-tag>
            </div>
            <div class="todo-item">
              <span class="todo-label">今日订单</span>
              <el-tag type="success">{{ statistics?.todayOrders || 0 }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销商品 + 近期动态 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>热销商品 TOP5</span>
          </template>
          <el-table :data="statistics?.topProducts || []" stripe>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="totalQuantity" label="销量" width="80" />
            <el-table-column prop="totalAmount" label="销售额" width="120">
              <template #default="{ row }"> ¥{{ row.totalAmount?.toFixed(2) }} </template>
            </el-table-column>
          </el-table>
          <div v-if="!statistics?.topProducts?.length" class="empty-tip">暂无数据</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>近期订单动态</span>
          </template>
          <div
            v-for="order in statistics?.recentOrders || []"
            :key="order.orderNo"
            class="activity-item"
          >
            <div class="activity-info">
              <span class="activity-order">{{ order.orderNo }}</span>
              <span class="activity-customer">{{ order.customerName }}</span>
            </div>
            <div class="activity-right">
              <span class="activity-amount">¥{{ order.amount?.toFixed(2) }}</span>
              <el-tag size="small" :type="getStatusType(order.statusName)">
                {{ order.statusName }}
              </el-tag>
            </div>
          </div>
          <div v-if="!statistics?.recentOrders?.length" class="empty-tip">暂无动态</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStatistics, type DashboardStatistics } from '@/api/dashboard'

// ========== 数据 ==========
const statistics = ref<DashboardStatistics | null>(null)
const chartRef = ref<HTMLDivElement>()

// ========== 统计卡片配置 ==========
const statCards = ref([
  { title: '总销售额', value: '¥0', icon: 'Money', color: '#409eff' },
  { title: '总订单数', value: '0', icon: 'Document', color: '#67c23a' },
  { title: '总商品数', value: '0', icon: 'Goods', color: '#e6a23c' },
  { title: '待处理', value: '0', icon: 'Bell', color: '#f56c6c' },
])

// ========== 加载数据 ==========
const loadData = async () => {
  try {
    const res = await getDashboardStatistics()
    statistics.value = res

    // 更新统计卡片
    statCards.value = [
      {
        title: '总销售额',
        value: `¥${res.totalSales?.toFixed(2) || '0'}`,
        icon: 'Money',
        color: '#409eff',
      },
      {
        title: '总订单数',
        value: String(res.totalOrders || 0),
        icon: 'Document',
        color: '#67c23a',
      },
      { title: '总商品数', value: String(res.totalProducts || 0), icon: 'Goods', color: '#e6a23c' },
      {
        title: '待处理',
        value: String((res.pendingOrders || 0) + (res.pendingPurchaseOrders || 0)),
        icon: 'Bell',
        color: '#f56c6c',
      },
    ]

    // 渲染图表
    await nextTick()
    renderChart()
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

// ========== 渲染图表 ==========
const renderChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)

  const trend = statistics.value?.salesTrend || []
  const dates = trend.map((item) => item.date)
  const amounts = trend.map((item) => item.amount)

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>销售额：¥${p.value?.toFixed(2) || 0}`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates.length ? dates : ['暂无数据'],
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: amounts.length ? amounts : [0],
        lineStyle: {
          color: '#409eff',
          width: 3,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
        itemStyle: {
          color: '#409eff',
        },
      },
    ],
  })

  // 自适应
  window.addEventListener('resize', () => chart.resize())
}

// ========== 工具方法 ==========
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    草稿: 'info',
    已审核: 'warning',
    已发货: 'primary',
    已完成: 'success',
    已取消: 'danger',
  }
  return map[status] || 'info'
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
.stat-info {
  flex: 1;
}
.stat-title {
  font-size: 14px;
  color: #999;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.chart-row,
.bottom-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}
.todo-label {
  font-size: 14px;
  color: #333;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.activity-item:last-child {
  border-bottom: none;
}
.activity-info {
  display: flex;
  gap: 12px;
  align-items: center;
}
.activity-order {
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
}
.activity-customer {
  font-size: 13px;
  color: #666;
}
.activity-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.activity-amount {
  font-weight: 600;
  color: #f56c6c;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>
