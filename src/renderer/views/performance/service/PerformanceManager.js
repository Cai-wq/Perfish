/**
 * Created by CaiWeiQi on 2021/9/14
 */
import * as iOS from './iOSService'
import * as Android from './AndroidService'

export const PerformanceManager = {
  iOS: iOS,
  Android: Android,
  clear: function() {
    try {
      iOS.kill()
    } catch (e) {
      //
    }
    try {
      Android.kill()
    } catch (e) {
      //
    }
  }
}
