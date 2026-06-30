<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProductPage,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductQueryParams,
} from '@/api/product'

// ===== 搜索 =====
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

// ===== 表格 =====
const tableData = ref<Product[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// ===== 弹窗 =====
const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const submitting = ref(false)
const formRef = ref()
const isEdit = ref(false)

const formData = reactive({
  id: 0,
  asin: '',
  sku: '',
  title: '',
  brand: '',
  category: '',
  imageUrl: '',
  price: 0,
  costPrice: 0,
  status: 1,
  // ✅ 添加这些字段（与 ProductCreateRequest 匹配）
  bulletPoints: '', // 五点描述
  description: '', // 详细描述
  searchTerms: '', // 搜索关键词
  variationTheme: '', // 变体主题
  parentAsin: '', // 父ASIN
})

const rules = {
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
}

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const params: ProductQueryParams = {
      keyword: searchForm.keyword || undefined,
      status: searchForm.status,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    const res = await getProductPage(params)
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
  isEdit.value = false
  dialogTitle.value = '新增商品'
  resetForm()
  dialogVisible.value = true
}

// ===== 编辑 =====
const openEditDialog = (row: Product) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  formData.id = row.id
  formData.asin = row.asin || ''
  formData.sku = row.sku
  formData.title = row.title
  formData.brand = row.brand || ''
  formData.category = row.category || ''
  formData.imageUrl = row.imageUrl || ''
  formData.price = row.price
  formData.costPrice = row.costPrice || 0
  formData.status = row.status
  dialogVisible.value = true
}

// ===== 提交 =====
const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data = {
      asin: formData.asin,
      sku: formData.sku,
      title: formData.title,
      brand: formData.brand,
      category: formData.category,
      imageUrl: formData.imageUrl,
      price: formData.price,
      costPrice: formData.costPrice,
      // ✅ 新增字段
      bulletPoints: formData.bulletPoints ? [formData.bulletPoints] : [],
      description: formData.description || '',
      searchTerms: formData.searchTerms || '',
      variationTheme: formData.variationTheme || '',
      parentAsin: formData.parentAsin || '',
    }
    if (isEdit.value) {
      await updateProduct(formData.id, data)
      ElMessage.success('修改成功')
    } else {
      await createProduct(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    submitting.value = false
  }
}

// ===== 重置 =====
const resetForm = () => {
  formData.id = 0
  formData.asin = ''
  formData.sku = ''
  formData.title = ''
  formData.brand = ''
  formData.category = ''
  formData.imageUrl = ''
  formData.price = 0
  formData.costPrice = 0
  formData.status = 1
  formRef.value?.resetFields()
}

// ===== 删除 =====
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(`确认删除商品 "${row.title}" 吗？`, '提示', { type: 'error' })
    await deleteProduct(row.id)
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

<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>商品列表</span>
          <el-button type="primary" @click="openCreateDialog">新增商品</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="商品名称/SKU" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="在售" :value="1" />
            <el-option label="停售" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sku" label="SKU" width="150" />
        <el-table-column prop="title" label="商品名称" min-width="200" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="售价" width="120">
          <template #default="{ row }"> ¥{{ row.price?.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="120">
          <template #default="{ row }"> ¥{{ row.costPrice?.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在售' : '停售' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="ASIN" prop="asin">
          <el-input v-model="formData.asin" placeholder="亚马逊ASIN码" />
        </el-form-item>
        <el-form-item label="SKU" prop="sku">
          <el-input v-model="formData.sku" placeholder="卖家SKU" />
        </el-form-item>
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="formData.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="formData.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="formData.costPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="主图URL" prop="imageUrl">
          <el-input v-model="formData.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">停售</el-radio>
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
.product-list {
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
