import request from '@/utils/request'

export interface SaleOrderDetail {
  productId: number
  quantity: number
  price: number
  amount?: number
}

export interface SaleOrder {
  id: number
  orderNo: string
  customerName: string
  customerPhone: string
  customerAddress: string
  orderDate: string
  totalAmount: number
  status: number
  statusName?: string
  remark: string
  createTime: string
  details?: SaleOrderDetail[]
}

export interface SaleOrderQueryParams {
  orderNo?: string
  customerName?: string
  status?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

// 创建销售订单
export const createSaleOrder = (data: any) => {
  return request.post('/sale-orders', data)
}

// 分页查询
export const getSaleOrderPage = (params: SaleOrderQueryParams) => {
  return request.post('/sale-orders/page', params)
}

// 查询详情
export const getSaleOrderById = (id: number) => {
  return request.get(`/sale-orders/${id}`)
}

// 更新状态（审核/发货/完成）
export const updateSaleOrderStatus = (id: number, data: { status: number; remark?: string }) => {
  return request.put(`/sale-orders/${id}/status`, data)
}

// 取消订单
export const cancelSaleOrder = (id: number) => {
  return request.put(`/sale-orders/${id}/cancel`)
}
