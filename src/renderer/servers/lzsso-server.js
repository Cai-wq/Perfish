/**
 * Created by CaiWeiQi on 2021/2/3
 */
import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, goToSSO } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.SSO_SERVER, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000 // request timeout
})
// cookie跨域
axios.defaults.withCredentials = true
service.defaults.withCredentials = true

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.withCredentials = true

    if (getToken()) {
      config.headers['X-SSO-Authorization'] = getToken()
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    console.log(res)

    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200 && res.code !== 0) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // code等于1001，TOKEN未授权或已过期。code等于1002，没有访问权限
      if (res.code === 1001) {
        goToSSO()
        return res
      } else if (res.code === 1002) {
        this.$notify.error(res.message())
      } else if (res.code === 401) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
