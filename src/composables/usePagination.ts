import { ref, computed } from 'vue'

export function usePagination(initialPageSize = 10) {
  const pageNum = ref(1)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  // 动态计算 page-sizes
  const pageSizes = computed(() => {
    // 默认选项
    const defaultSizes = [10, 20, 50, 100]
    // 只保留小于等于总数据量的选项
    const validSizes = defaultSizes.filter((size) => size <= total.value)
    // 至少保留一个选项（防止下拉框为空）
    if (validSizes.length === 0) {
      // 如果总条数很小（比如 0 或 3），返回 [10] 或 [total]
      return [total.value > 0 ? total.value : 10]
    }
    return validSizes
  })

  // 重置页码
  const resetPage = () => {
    pageNum.value = 1
  }

  return { pageNum, pageSize, total, pageSizes, resetPage }
}
