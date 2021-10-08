/**
 * Created by CaiWeiQi on 2021/9/27
 */
const cmdPlugin = {
  install(Vue) {
    Vue.prototype.$cmd = require('node-cmd')
  }
}

export default cmdPlugin
