/**
 * Created by CaiWeiQi on 2021/9/10
 */
import request from '@/servers/lzsso-server'

export function getUserInfo() {
  return request({
    url: '/openapi/get_user_info',
    method: 'GET'
  })
}
