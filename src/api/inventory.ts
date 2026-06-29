import request from '@/utils/request'

export interface Inventory {
  productId: number
  productName: string
  productSku: string
  quantity: number
  lockedQuantity: number
  availableQuantity: number
  safetyStock?: number
  lastUpdateTime: string
}

export interface StockFlow {
  id: number
  productId: number
  productName: string
  productSku: string
  flowType: number
  flowTypeName: string
  changeQuantity: number
  beforeQuantity: number
  afterQuantity: number
  sourceType: string
  sourceId: number
  remark: string
  createTime: string
}

export interface InventoryQueryParams {
  keyword?: string
  categoryId?: number
  onlyLowStock?: boolean
  pageNum?: number
  pageSize?: number
}

// 分页查询库存
export const getInventoryPage = (params: InventoryQueryParams) => {
  return request.post('/inventory/page', params)
}

// 查询单个商品库存
export const getInventoryByProduct = (productId: number) => {
  return request.get(`/inventory/product/${productId}`)
}

// 查询库存流水
export const getStockFlows = (params: {
  productId?: number
  pageNum?: number
  pageSize?: number
}) => {
  return request.get('/inventory/flows', { params })
}

// 低库存预警
export const getLowStockList = () => {
  return request.get('/inventory/low-stock')
}
