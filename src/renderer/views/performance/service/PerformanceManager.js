/**
 * Created by CaiWeiQi on 2021/9/14
 */
import * as iOS from './iOSService'
import * as Android from './AndroidService'

export const PerformanceManager = {
  iOS: {
    init: iOS.init,
    start: iOS.start,
    stop: iOS.stop,
    dump: iOS.dump,
    kill: iOS.kill
  },
  Android: {
    init: Android.init,
    start: Android.start,
    stop: Android.stop,
    dump: Android.dump,
    kill: Android.kill
  },
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
