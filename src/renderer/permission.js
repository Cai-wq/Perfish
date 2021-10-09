import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
// import { Message } from 'element-ui'
// import { getToken, goToSSO } from '@/utils/auth' // get token from cookie
//
// const whiteList = ['/login'] // 不重定向白名单
// router.beforeEach(async(to, from, next) => {
//   // start progress bar
//   NProgress.start()
//   // set page title
//   // document.title = getPageTitle(to.meta.title)
//
//   // determine whether the user has logged in
//   const hasToken = getToken()
//
//   if (hasToken) {
//     if (to.path === '/login') {
//       // if is logged in, redirect to the home page
//       next({ path: '/' })
//       NProgress.done()
//     } else {
//       const hasGetUserInfo = store.getters.userInfo.name && store.getters.userInfo.email && store.getters.userInfo.account
//       if (hasGetUserInfo) {
//         next()
//       } else {
//         try {
//           // get user info
//           await store.dispatch('user/getUserInfo')
//           next()
//         } catch (error) {
//           // remove token and go to login page to re-login
//           await store.dispatch('user/resetToken')
//           Message.error('获取不到用户信息: ' + error)
//           NProgress.done()
//           goToSSO()
//           // Message.error(error || 'Has Error')
//           // next(`/login?redirect=${to.path}`)
//           NProgress.done()
//         }
//       }
//     }
//   } else {
//     /* has no token*/
//     if (whiteList.indexOf(to.path) !== -1) {
//       // in the free login whitelist, go directly
//       next()
//     } else {
//       // 单点登录
//       const searchURL = window.location.search ? window.location.search : window.location.hash
//       if (searchURL && searchURL.indexOf('__vt_param__') !== -1) {
//         const ssoToken = searchURL.substring(searchURL.indexOf('__vt_param__') + 13, searchURL.length).split('&')[0]
//         await store.dispatch('user/ssoLogin', ssoToken)
//         self.location.href = window.location.href.split('__vt_param__')[0]
//         next()
//         self.location.search = window.location.search.split('__vt_param__')[0]
//         NProgress.done()
//       } else {
//         await store.dispatch('user/resetToken')
//         Message.error('先去登录')
//         NProgress.done()
//         goToSSO()
//       }
//     }
//   }
// })

// FIXME 暂时不用账号
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  if (!store.getters.token) {
    console.error('重置用户信息')
    await store.dispatch('user/setUserInfo')
  }
  next()
  NProgress.done()
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
