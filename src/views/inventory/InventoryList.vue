<template>
  <div class="inventory-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>实时库存</span>
          <el-button type="primary" @click="loadData">刷新</el-button>
        </div>
      </template>

      <!-- 搜索 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="商品名称/SKU" clearable />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="searchForm.onlyLowStock" @change="handleSearch">
            仅显示低库存
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 库存表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="productSku" label="SKU" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="quantity" label="库存数量" width="120" align="center">
          <template #default="{ row }">
            <span
              :style="
                row.quantity <= (row.safetyStock || 5) ? 'color: #f56c6c; font-weight: bold;' : ''
              "
            >
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lockedQuantity" label="锁定数量" width="120" align="center" />
        <el-table-column prop="availableQuantity" label="可用数量" width="120" align="center">
          <template #default="{ row }">
            <span :style="row.availableQuantity <= 0 ? 'color: #f56c6c; font-weight: bold;' : ''">
              {{ row.availableQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.quantity > (row.safetyStock || 5) ? 'success' : 'danger'"
              size="small"
            >
              {{ row.quantity > (row.safetyStock || 5) ? '正常' : '库存不足' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewFlows(row)">流水</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="loadData"
        @size-change="loadData"
        layout="total, sizes, prev, pager, next"
        class="pagination"
      />
    </el-card>

    <!-- 库存流水弹窗 -->
    <el-dialog v-model="flowVisible" :title="'库存流水 - ' + currentProductName" width="800px">
      <el-table :data="flowData" v-loading="flowLoading" stripe max-height="400">
        <el-table-column prop="flowTypeName" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.flowType === 1 ? 'success' : 'danger'" size="small">
              {{ row.flowTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changeQuantity" label="变动数量" width="120" align="center">
          <template #default="{ row }">
            <span :style="row.changeQuantity > 0 ? 'color: #67c23a;' : 'color: #f56c6c;'">
              {{ row.changeQuantity > 0 ? '+' : '' }}{{ row.changeQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeQuantity" label="变动前" width="100" align="center" />
        <el-table-column prop="afterQuantity" label="变动后" width="100" align="center" />
        <el-table-column prop="sourceType" label="来源" width="120">
          <template #default="{ row }">
            {{
              row.sourceType === 'PURCHASE_IN'
                ? '采购入库'
                : row.sourceType === 'SALE_OUT'
                  ? '销售出库'
                  : '-'
            }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="createTime" label="时间" width="180" />
      </el-table>
      <el-pagination
        v-model:current-page="flowPageNum"
        v-model:page-size="flowPageSize"
        :total="flowTotal"
        @current-change="loadFlows"
        @size-change="loadFlows"
        layout="total, prev, pager, next"
        size="small"
        class="flow-pagination"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInventoryPage, getStockFlows, type Inventory, type StockFlow } from '@/api/inventory'

// ===== 搜索 =====
const searchForm = reactive({
  keyword: '',
  onlyLowStock: false,
})
const tableData = ref<Inventory[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// ===== 库存流水 =====
const flowVisible = ref(false)
const flowData = ref<StockFlow[]>([])
const flowTotal = ref(0)
const flowPageNum = ref(1)
const flowPageSize = ref(10)
const flowLoading = ref(false)
const currentProductId = ref(0)
const currentProductName = ref('')

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const res = await getInventoryPage({
      keyword: searchForm.keyword || undefined,
      onlyLowStock: searchForm.onlyLowStock || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// ===== 搜索 =====
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.onlyLowStock = false
  pageNum.value = 1
  loadData()
}

// ===== 查看流水 =====
const viewFlows = (row: Inventory) => {
  currentProductId.value = row.productId
  currentProductName.value = row.productName
  flowPageNum.value = 1
  flowVisible.value = true
  loadFlows()
}

const loadFlows = async () => {
  flowLoading.value = true
  try {
    const res = await getStockFlows({
      productId: currentProductId.value,
      pageNum: flowPageNum.value,
      pageSize: flowPageSize.value,
    })
    flowData.value = res.data?.list || []
    flowTotal.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('加载流水失败')
  } finally {
    flowLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.inventory-list {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
.flow-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
