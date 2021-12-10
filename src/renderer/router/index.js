import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'
import { ipcRenderer } from 'electron'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  // { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/home',
    name: 'HomePage',
    children: [{
      path: 'home',
      component: () => import('@/views/home/index')
    }]
  },

  {
    path: '/settings',
    name: 'SettingsPage',
    component: () => import('@/views/settings/index')
  },

  {
    path: '/report',
    component: Layout,
    name: 'ReportPage',
    children: [{
      name: 'LocalReportListPage',
      path: 'list',
      meta: { title: '列表', icon: 'form' },
      component: () => import('@/views/performance/report/list')
    },
    {
      name: 'LocalReportPage',
      path: 'detail',
      hidden: true,
      props: router => ({
        infoData: router.query.infoData
      }),
      component: () => import('@/views/performance/report/detail')
    }]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const router = new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
export default router

ipcRenderer.on('href', (event, args) => {
  if (args) {
    router.push({ name: args })
  }
})
