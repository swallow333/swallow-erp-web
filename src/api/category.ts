import request from '@/utils/request'

export interface ProductCategory {
  id: number
  code: string
  name: string
  parentId: number
  level: number
  sortOrder: number
  icon: string
  status: number
  children?: ProductCategory[]
}

export const getCategoryTree = () => {
  return request.get('/categories/tree')
}

export const createCategory = (data: any) => {
  return request.post('/categories', data)
}

export const updateCategory = (id: number, data: any) => {
  return request.put(`/categories/${id}`, data)
}

export const deleteCategory = (id: number) => {
  return request.delete(`/categories/${id}`)
}

export const updateCategoryStatus = (id: number, status: number) => {
  return request.put(`/categories/${id}/status?status=${status}`)
}
