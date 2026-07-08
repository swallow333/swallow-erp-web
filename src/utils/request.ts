import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 通用请求地址前缀
  timeout: 30000, // 限制请求超时时间为 30 秒
})

// 请求拦截器：处理HTTP状态码、业务状态码、Token 过期转登录、统一错误提示等
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果 HTTP 状态码是 200/201，再检查业务 code
    if (response.status === 200 || response.status === 201) {
      const res = response.data
      // 业务 code 也视为成功
      if (res.code === 200 || res.code === 201 || res.code === 0) {
        return res
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(res)
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  },
)

export default request
