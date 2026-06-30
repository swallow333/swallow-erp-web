import request from '@/utils/request'

export interface PurchaseOrderDetail {
  productId: number
  quantity: number
  price: number
  amount?: number
}

export interface PurchaseOrder {
  id: number
  orderNo: string
  supplierId: number
  supplierName?: string
  orderDate: string
  totalAmount: number
  status: number
  statusName?: string
  remark: string
  createTime: string
  details?: PurchaseOrderDetail[]
}

export interface PurchaseOrderQueryParams {
  orderNo?: string
  supplierId?: number
  status?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

// 创建采购订单
export const createPurchaseOrder = (data: any) => {
  return request.post('/purchase-orders', data)
}

// 分页查询
export const getPurchaseOrderPage = (params: PurchaseOrderQueryParams) => {
  return request.post('/purchase-orders/page', params)
}

// 查询详情
export const getPurchaseOrderById = (id: number) => {
  return request.get(`/purchase-orders/${id}`)
}

// 更新状态（审核/入库）
export const updatePurchaseOrderStatus = (
  id: number,
  data: { status: number; remark?: string },
) => {
  return request.put(`/purchase-orders/${id}/status`, data)
}

// 创建入库单（采购入库）
export const createStockIn = (data: any) => {
  return request.post('/stock-in', data)
}

// 取消订单
export const cancelPurchaseOrder = (id: number) => {
  return request.put(`/purchase-orders/${id}/cancel`)
}
