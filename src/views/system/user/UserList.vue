<template>
  <div class="user-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="用户名/昵称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openCreateDialog">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
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

      <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isCreate">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
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
  getUserPage,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  type SysUser,
} from '@/api/user'

// ===== 搜索表单 =====
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

// ===== 表格数据 =====
const tableData = ref<SysUser[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// ===== 弹窗 =====
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isCreate = ref(true)
const submitting = ref(false)
const formRef = ref()

const formData = reactive({
  id: 0,
  username: '',
  password: '',
  nickname: '',
  phone: '',
  status: 1,
})

// ===== 表单校验规则 =====
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
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

// ===== 搜索 =====
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  pageNum.value = 1
  loadData()
}

// ===== 新增 =====
const openCreateDialog = () => {
  isCreate.value = true
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

// ===== 编辑 =====
const openEditDialog = (row: SysUser) => {
  isCreate.value = false
  dialogTitle.value = '编辑用户'
  formData.id = row.id
  formData.username = row.username
  formData.password = ''
  formData.nickname = row.nickname || ''
  formData.phone = row.phone || ''
  formData.status = row.status
  dialogVisible.value = true
}

// ===== 提交表单 =====
const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isCreate.value) {
      await createUser({
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        phone: formData.phone,
      })
      ElMessage.success('新增成功')
    } else {
      await updateUser(formData.id, {
        nickname: formData.nickname,
        phone: formData.phone,
        status: formData.status,
        password: formData.password || undefined,
      })
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 错误已在 request 拦截器中处理
  } finally {
    submitting.value = false
  }
}

// ===== 重置表单 =====
const resetForm = () => {
  formData.id = 0
  formData.username = ''
  formData.password = ''
  formData.nickname = ''
  formData.phone = ''
  formData.status = 1
  formRef.value?.resetFields()
}

// ===== 启用/禁用 =====
const handleToggleStatus = async (row: SysUser) => {
  const newStatus = row.status === 1 ? 0 : 1
  const msg = newStatus === 0 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${msg}用户 "${row.username}" 吗？`, '提示', { type: 'warning' })
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${msg}成功`)
    loadData()
  } catch (error) {
    // 取消
  }
}

// ===== 删除 =====
const handleDelete = async (row: SysUser) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 "${row.username}" 吗？`, '提示', { type: 'error' })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 取消
  }
}

// ===== 生命周期 =====
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.search-card .el-form {
  margin-bottom: 0;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
