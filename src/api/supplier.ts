import request from '@/utils/request'

export interface Supplier {
  id: number
  code: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  taxNo: string
  bankName: string
  bankAccount: string
  paymentTerms: string
  leadDays: number
  status: number
  remark: string
  createTime: string
}

export interface SupplierQueryParams {
  keyword?: string
  status?: number
  pageNum?: number
  pageSize?: number
}

// 分页查询
export const getSupplierPage = (params: SupplierQueryParams) => {
  return request.post('/suppliers/page', params)
}

// 获取启用列表（下拉框用）
export const getEnabledSuppliers = () => {
  return request.get('/suppliers/enabled')
}

// 查询单个
export const getSupplierById = (id: number) => {
  return request.get(`/suppliers/${id}`)
}

// 新增
export const createSupplier = (data: any) => {
  return request.post('/suppliers', data)
}

// 修改
export const updateSupplier = (id: number, data: any) => {
  return request.put(`/suppliers/${id}`, data)
}

// 删除
export const deleteSupplier = (id: number) => {
  return request.delete(`/suppliers/${id}`)
}

// 启用/禁用
export const updateSupplierStatus = (id: number, status: number) => {
  return request.put(`/suppliers/${id}/status?status=${status}`)
}
