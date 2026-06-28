<template>
  <div class="category-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>商品分类管理</span>
          <el-button type="primary" @click="openCreateDialog">新增分类</el-button>
        </div>
      </template>

      <!-- 树形表格 -->
      <el-table :data="tableData" row-key="id" v-loading="loading" border>
        <el-table-column prop="code" label="编码" width="150" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="level" label="层级" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-tree-select
            v-model="formData.parentId"
            :data="parentOptions"
            :props="{ label: 'name', value: 'id' }"
            placeholder="选择父分类（不选为顶级）"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" />
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  type ProductCategory,
} from '@/api/category'

const tableData = ref<ProductCategory[]>([])
const parentOptions = ref<ProductCategory[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const submitting = ref(false)
const formRef = ref()
const isEdit = ref(false)

const formData = reactive({
  id: 0,
  code: '',
  name: '',
  parentId: undefined as number | undefined,
  sortOrder: 0,
  status: 1,
})

const rules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCategoryTree()
    tableData.value = res.data || []
    // 构建父分类选项（所有分类）
    parentOptions.value = res.data || []
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: ProductCategory) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  formData.id = row.id
  formData.code = row.code
  formData.name = row.name
  formData.parentId = row.parentId === 0 ? undefined : row.parentId
  formData.sortOrder = row.sortOrder || 0
  formData.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateCategory(formData.id, {
        name: formData.name,
        parentId: formData.parentId || 0,
        sortOrder: formData.sortOrder,
        status: formData.status,
      })
      ElMessage.success('修改成功')
    } else {
      await createCategory({
        code: formData.code,
        name: formData.name,
        parentId: formData.parentId || 0,
        sortOrder: formData.sortOrder,
      })
      ElMessage.success('创建成功')
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
  formData.parentId = undefined
  formData.sortOrder = 0
  formData.status = 1
  formRef.value?.resetFields()
}

const handleToggleStatus = async (row: ProductCategory) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确认${newStatus === 0 ? '禁用' : '启用'}分类 "${row.name}" 吗？`,
      '提示',
      { type: 'warning' },
    )
    await updateCategoryStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {}
}

const handleDelete = async (row: ProductCategory) => {
  try {
    await ElMessageBox.confirm(`确认删除分类 "${row.name}" 吗？`, '提示', { type: 'error' })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.category-list {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
