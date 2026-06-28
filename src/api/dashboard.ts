import request from '@/utils/request'

// 类型定义
export interface SalesTrend {
  date: string
  amount: number
}

export interface ProductRank {
  productId: number
  productName: string
  productSku: string
  totalQuantity: number
  totalAmount: number
}

export interface OrderActivity {
  orderNo: string
  customerName: string
  amount: number
  statusName: string
  createTime: string
}

export interface DashboardStatistics {
  totalProducts: number
  totalOrders: number
  totalSales: number
  totalPurchase: number
  pendingOrders: number
  pendingPurchaseOrders: number
  lowStockCount: number
  todayOrders: number
  todaySales: number
  salesTrend: SalesTrend[]
  topProducts: ProductRank[]
  recentOrders: OrderActivity[]
}

// 获取仪表盘数据
export const getDashboardStatistics = () => {
  return request.get<any, DashboardStatistics>('/dashboard/statistics')
}
