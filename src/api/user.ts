import request from '@/utils/request'

export interface SysUser {
  id: number
  username: string
  nickname: string
  phone: string
  status: number
  createTime: string
}

export interface UserQueryParams {
  keyword?: string
  status?: number
  pageNum?: number
  pageSize?: number
}

// 分页查询用户
export const getUserPage = (params: UserQueryParams) => {
  return request.post<any, any>('/users/page', params)
}

// 新增用户
export const createUser = (data: any) => {
  return request.post('/users', data)
}

// 修改用户
export const updateUser = (id: number, data: any) => {
  return request.put(`/users/${id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete(`/users/${id}`)
}

// 启用/禁用
export const updateUserStatus = (id: number, status: number) => {
  return request.put(`/users/${id}/status?status=${status}`)
}
