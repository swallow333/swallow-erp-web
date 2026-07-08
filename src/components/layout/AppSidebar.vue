<script setup lang="ts">
import {
  Odometer,
  Setting,
  User,
  Shop,
  Van,
  ShoppingCart,
  Sell,
  Box,
} from '@element-plus/icons-vue'
</script>

<template>
  <div class="sidebar-container">
    <div class="logo">
      <span>ERP 管理系统</span>
    </div>
    <el-menu
      :default-active="$route.path"
      class="sidebar-menu"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/dashboard/index">
        <el-icon><Odometer /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/dashboard/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/dashboard/products">
        <el-icon><Shop /></el-icon>
        <span>商品管理</span>
      </el-menu-item>

      <el-menu-item index="/dashboard/suppliers">
        <el-icon><Van /></el-icon>
        <span>供应商管理</span>
      </el-menu-item>

      <el-sub-menu index="purchase">
        <template #title>
          <el-icon><ShoppingCart /></el-icon>
          <span>采购管理</span>
        </template>
        <el-menu-item index="/dashboard/purchase-orders">采购订单</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="sale">
        <template #title>
          <el-icon><Sell /></el-icon>
          <span>销售管理</span>
        </template>
        <el-menu-item index="/dashboard/sale-orders">销售订单</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/dashboard/inventory">
        <el-icon><Box /></el-icon>
        <span>库存管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100vh;
  background: #3b85ca;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  background: #002140;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

/* 覆盖 Element Plus 默认样式 */
.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item.is-active {
  background: #1890ff !important;
}
</style>
