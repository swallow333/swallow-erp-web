import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data
        if (res.code === 200 || res.code === 0) {
            return res
        }
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(res)
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
    }
)

export default request