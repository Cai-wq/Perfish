/**
 * Created by CaiWeiQi on 2021/9/16
 */
import request from '@/servers/base-server'

export function uploadPerformanceInfo(params) {
  return request({
    url: '/performanceTask/save',
    method: 'POST',
    heads: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: params
  })
}
