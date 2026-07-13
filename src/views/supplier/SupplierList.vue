<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import {
  getSupplierPage,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  updateSupplierStatus,
  type Supplier,
} from '@/api/supplier'

const searchForm = reactive({ keyword: '', status: undefined as number | undefined })
const { pageNum, pageSize, total, pageSizes, resetPage } = usePagination()
const tableData = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('新增供应商')
const submitting = ref(false)
const formRef = ref()
const isEdit = ref(false)

const formData = reactive({
  id: 0,
  code: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  taxNo: '',
  bankName: '',
  bankAccount: '',
  paymentTerms: '',
  leadDays: 0,
  status: 1,
  remark: '',
})

const rules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSupplierPage({
      keyword: searchForm.keyword || undefined,
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
  resetPage()
  loadData()
}
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  pageNum.value = 1
  loadData()
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增供应商'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: Supplier) => {
  isEdit.value = true
  dialogTitle.value = '编辑供应商'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data = { ...formData }
    delete data.id
    if (isEdit.value) {
      await updateSupplier(formData.id, data)
      ElMessage.success('修改成功')
    } else {
      await createSupplier(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 错误已拦截
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.id = 0
  formData.code = ''
  formData.name = ''
  formData.contact = ''
  formData.phone = ''
  formData.email = ''
  formData.address = ''
  formData.taxNo = ''
  formData.bankName = ''
  formData.bankAccount = ''
  formData.paymentTerms = ''
  formData.leadDays = 0
  formData.status = 1
  formData.remark = ''
  formRef.value?.resetFields()
}

const handleToggleStatus = async (row: Supplier) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确认${newStatus === 0 ? '禁用' : '启用'}供应商 "${row.name}" 吗？`,
      '提示',
      { type: 'warning' },
    )
    await updateSupplierStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {}
}

const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm(`确认删除供应商 "${row.name}" 吗？`, '提示', { type: 'error' })
    await deleteSupplier(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {}
}

onMounted(loadData)
</script>

<template>
  <div class="supplier-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>供应商管理</span>
          <el-button type="primary" @click="openCreateDialog">新增供应商</el-button>
        </div>
      </template>

      <!-- 搜索 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="名称/编码" clearable />
        </el-form-item>
        <el-form-item label="状态" style="width: 120px">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="name" label="供应商名称" min-width="150" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="paymentTerms" label="付款条件" width="120" />
        <el-table-column prop="leadDays" label="交货周期" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        @current-change="loadData"
        @size-change="loadData"
        layout="total, sizes, prev, pager, next"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入供应商编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="付款条件">
          <el-input v-model="formData.paymentTerms" placeholder="如：月结30天" />
        </el-form-item>
        <el-form-item label="交货周期">
          <el-input-number v-model="formData.leadDays" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.supplier-list {
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
</style>
