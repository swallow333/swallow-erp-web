import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),
  actions: {
    setToken(token: string) {
      console.log('🔵 setToken 被调用了！') // 看这行有没有打印
      console.log('🔵 传入的 token:', token)
      this.token = token
      localStorage.setItem('token', token)
      console.log('🔵 localStorage 已更新:', localStorage.getItem('token'))
    },
    setUserInfo(info: any) {
      this.userInfo = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
  },
})
