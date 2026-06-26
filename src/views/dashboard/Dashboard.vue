<template>
  <div>
    <h1>仪表盘</h1>
    <p>欢迎使用 ERP 系统</p>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cards" :key="item.title">
        <el-card>
          <div class="card-title">{{ item.title }}</div>
          <div class="card-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const cards = [
  { title: '总销售额', value: '¥128,000' },
  { title: '总订单数', value: '256' },
  { title: '总商品数', value: '1,280' },
  { title: '待处理订单', value: '12' },
]
</script>

<style scoped>
.card-title {
  font-size: 14px;
  color: #999;
}
.card-value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 8px;
}
</style>
