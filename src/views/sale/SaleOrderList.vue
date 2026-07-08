<template>
  <div class="sale-order-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>销售订单管理</span>
          <el-button type="primary" @click="openCreateDialog">创建销售订单</el-button>
        </div>
      </template>

      <!-- 搜索 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态" style="width: 120px">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="草稿" :value="0" />
            <el-option label="已审核" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="orderDate" label="下单日期" width="180" />
        <el-table-column prop="totalAmount" label="总金额" width="140">
          <template #default="{ row }"> ¥{{ row.totalAmount?.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="success"
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button v-if="row.status === 1" size="small" type="primary" @click="handleShip(row)">
              发货
            </el-button>
            <el-button
              v-if="row.status === 2"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 1"
              size="small"
              type="danger"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
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

    <!-- 创建订单弹窗 -->
    <el-dialog v-model="dialogVisible" title="创建销售订单" width="700px" @close="resetForm">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="客户电话">
          <el-input v-model="formData.customerPhone" placeholder="请输入客户电话" />
        </el-form-item>
        <el-form-item label="客户地址">
          <el-input v-model="formData.customerAddress" placeholder="请输入客户地址" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>

        <el-divider>销售明细</el-divider>
        <el-table :data="formData.details" border>
          <el-table-column label="商品" min-width="200">
            <template #default="{ row, $index }">
              <el-select v-model="row.productId" placeholder="选择商品" filterable>
                <el-option v-for="p in productList" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }"> ¥{{ (row.quantity * row.price).toFixed(2) }} </template>
          </el-table-column>
          <el-table-column label="操作" width="60">
            <template #default="{ $index }">
              <el-button size="small" type="danger" @click="removeDetail($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" type="primary" @click="addDetail">添加商品</el-button>

        <el-divider />
        <div style="text-align: right; font-size: 16px">
          合计：<strong>¥{{ totalAmount.toFixed(2) }}</strong>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailVisible" title="销售订单详情" width="700px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{
            currentOrder.customerName
          }}</el-descriptions-item>
          <el-descriptions-item label="下单日期">{{ currentOrder.orderDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusName(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总金额" :span="2">
            ¥{{ currentOrder.totalAmount?.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{
            currentOrder.remark || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>明细</el-divider>
        <el-table :data="currentOrder.details || []" border>
          <el-table-column prop="productName" label="商品" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="price" label="单价" width="140">
            <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="小计" width="140">
            <template #default="{ row }">¥{{ (row.quantity * row.price).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSaleOrderPage,
  createSaleOrder,
  updateSaleOrderStatus,
  cancelSaleOrder,
  getSaleOrderById,
  type SaleOrder,
} from '@/api/sale'
import { getProductList } from '@/api/product'

// ===== 搜索 =====
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: undefined as number | undefined,
})
const tableData = ref<SaleOrder[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const productList = ref<any[]>([])

// ===== 状态 =====
const getStatusName = (status: number) => {
  const map: Record<number, string> = {
    0: '草稿',
    1: '已审核',
    2: '已发货',
    3: '已完成',
    4: '已取消',
  }
  return map[status] || '-'
}
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger',
  }
  return map[status] || 'info'
}

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const res = await getSaleOrderPage({
      orderNo: searchForm.orderNo || undefined,
      customerName: searchForm.customerName || undefined,
      status: searchForm.status,
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

const handleSearch = () => {
  pageNum.value = 1
  loadData()
}
const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.customerName = ''
  searchForm.status = undefined
  pageNum.value = 1
  loadData()
}

// ===== 创建订单 =====
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()

const formData = reactive({
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  remark: '',
  details: [] as { productId: number; quantity: number; price: number }[],
})

const rules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
}

const totalAmount = computed(() => {
  return formData.details.reduce((sum, d) => sum + d.quantity * d.price, 0)
})

const addDetail = () => {
  formData.details.push({ productId: 0, quantity: 1, price: 0 })
}
const removeDetail = (index: number) => {
  formData.details.splice(index, 1)
}

const resetForm = () => {
  formData.customerName = ''
  formData.customerPhone = ''
  formData.customerAddress = ''
  formData.remark = ''
  formData.details = []
  formRef.value?.resetFields()
}

const openCreateDialog = async () => {
  try {
    const res = await getProductList()
    productList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载商品数据失败')
    return
  }
  resetForm()
  addDetail()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (formData.details.length === 0) {
    ElMessage.warning('请添加销售明细')
    return
  }
  if (formData.details.some((d) => !d.productId || d.quantity <= 0 || d.price <= 0)) {
    ElMessage.warning('请完善销售明细')
    return
  }

  submitting.value = true
  try {
    await createSaleOrder({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      remark: formData.remark,
      details: formData.details,
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 错误已拦截
  } finally {
    submitting.value = false
  }
}

// ===== 查看详情 =====
const detailVisible = ref(false)
const currentOrder = ref<SaleOrder | null>(null)

const viewDetail = async (row: SaleOrder) => {
  try {
    const res = await getSaleOrderById(row.id)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
}

// ===== 审核 =====
const handleApprove = async (row: SaleOrder) => {
  try {
    await ElMessageBox.confirm(`确认审核订单 "${row.orderNo}" 吗？审核后将扣减库存。`, '提示', {
      type: 'warning',
    })
    await updateSaleOrderStatus(row.id, { status: 1 })
    ElMessage.success('审核成功，库存已扣减')
    loadData()
  } catch (error) {}
}

// ===== 发货 =====
const handleShip = async (row: SaleOrder) => {
  try {
    await ElMessageBox.confirm(`确认订单 "${row.orderNo}" 已发货？`, '提示', { type: 'warning' })
    await updateSaleOrderStatus(row.id, { status: 2 })
    ElMessage.success('发货成功')
    loadData()
  } catch (error) {}
}

// ===== 完成 =====
const handleComplete = async (row: SaleOrder) => {
  try {
    await ElMessageBox.confirm(`确认订单 "${row.orderNo}" 已完成？`, '提示', { type: 'warning' })
    await updateSaleOrderStatus(row.id, { status: 3 })
    ElMessage.success('已完成')
    loadData()
  } catch (error) {}
}

// ===== 取消 =====
const handleCancel = async (row: SaleOrder) => {
  try {
    await ElMessageBox.confirm(`确认取消订单 "${row.orderNo}" 吗？取消后将释放锁定库存。`, '提示', {
      type: 'error',
    })
    await cancelSaleOrder(row.id)
    ElMessage.success('取消成功')
    loadData()
  } catch (error) {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.sale-order-list {
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
.el-divider {
  margin: 16px 0;
}
</style>
