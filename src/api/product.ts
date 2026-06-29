import request from '@/utils/request'

export interface Product {
  id: number
  asin: string
  sku: string
  title: string
  brand: string
  category: string
  categoryId?: number
  imageUrl: string
  price: number
  costPrice: number
  status: number
  createTime: string
}

export interface ProductQueryParams {
  keyword?: string
  categoryId?: number
  status?: number
  pageNum?: number
  pageSize?: number
}

// 分页查询商品
export const getProductPage = (params: ProductQueryParams) => {
  return request.post<any, any>('/products/page', params)
}

// 查询所有商品
export const getProductList = () => {
  return request.get('/products')
}

// 查询单个商品
export const getProductById = (id: number) => {
  return request.get(`/products/${id}`)
}

// 新增商品
export const createProduct = (data: any) => {
  return request.post('/products', data)
}

// 修改商品
export const updateProduct = (id: number, data: any) => {
  return request.put(`/products/${id}`, data)
}

// 删除商品
export const deleteProduct = (id: number) => {
  return request.delete(`/products/${id}`)
}
