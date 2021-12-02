/**
 * Android工具类
 * Created by CaiWeiQi on 2021/9/3
 */
import store from '../store'
import cmd from 'node-cmd'
import path from 'path'

/**
 * 获取adb路径
 */
export function getAdbPath() {
  const adb = path.join(__static, 'adb')
  // const chmod = cmd.runSync('[ -w ' + adb + ' ] && echo "adb yes" || chmod 777 ' + adb)
  const chmod = cmd.runSync('chmod 777 ' + adb)
  if (chmod.err) {
    console.error('adb无执行权限, error=', chmod.err)
  }
  return adb
}

/**
 * 执行adb命令
 */
export function adbExec(command) {
  return cmd.runSync(getAdbPath() + ' ' + command)
}

/**
 * 获取aapt路径
 */
export function getAaptPath() {
  return path.join(__static, 'aapt')
}

/**
 * 检查有没装Android SDK
 */
export function checkAndroidDepend() {
  const result = adbExec('--version')
  console.log('AndroidSDK ', result.data)
  if (result.err) {
    console.error('AndroidSDK error=', result.err)
    return false
  }
  return true
}

/**
 * 获取Android可用设备列表
 */
export function getAndroidDevices() {
  const deviceList = []
  const result = adbExec('devices -l')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取Android设备列表失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((item, index) => {
      if (index > 0 && item && item.trim() !== '') {
        const udid = item.trim().split(' ')[0]
        const name = item.trim().split('transport_id:')[0].split('device:')[1].trim()
        deviceList.push({
          udid: udid,
          name: name
        })
      }
    })
  }
  return deviceList
}

/**
 * 获取设备信息-name
 */
export function getAndroidDeviceName(deviceId) {
  if (!deviceId || deviceId === '') {
    return ''
  }
  const result = adbExec('-s ' + deviceId + ' shell getprop ro.product.device')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取Android设备列表失败, err=' + err)
    return ''
  } else {
    return data.trim()
  }
}

/**
 * 获取设备中所有第三方应用
 */
export function getAndroidApplications(deviceId) {
  const appList = []
  if (!deviceId || deviceId === '') {
    return appList
  }
  const result = adbExec('-s ' + deviceId + ' shell pm list package -3')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取应用列表失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((value) => {
      if (value && value.trim() !== '') {
        const packageName = value.replace('package:', '').trim()
        let appName = store.getters.performance.applicationMap[packageName]
        appName = appName && appName !== '' ? appName : packageName
        appList.push({
          name: appName,
          packageName: packageName,
          version: null
        })
      }
    })
    appList.sort((x, y) => {
      if (x.name !== x.packageName) {
        return -1
      }
      if (y.name !== y.packageName) {
        return 1
      }
      return 0
    })
    appList.sort((x, y) => {
      if (store.getters.performance.cacheApp.Android === x.packageName) {
        return -1
      }
      if (store.getters.performance.cacheApp.Android === y.packageName) {
        return 1
      }
      return 0
    })
  }
  return appList
}

/**
 * 获取APP名
 */
export function getAndroidAppName(deviceId, packageName) {
  let name = packageName
  if (!deviceId || deviceId === '' || !packageName || packageName === '') {
    return name
  }
  try {
    const pushResult = adbExec('-s ' + deviceId + ' shell [ -x /data/local/tmp/aapt-arm-pie ] && echo "true" || ' +
      getAdbPath() + ' -s ' + deviceId + ' push ' + getAaptPath() + ' /data/local/tmp && ' +
      getAdbPath() + ' -s ' + deviceId + ' shell chmod 0755 /data/local/tmp/aapt-arm-pie')
    if (pushResult.err) {
      console.error('推送aapt至手机失败, err=' + pushResult.err)
    }

    const apkResult = adbExec(
      '-s ' + deviceId + ' shell pm list packages -3 -f ' + packageName + ' | grep ' + packageName + '- | head -1')
    if (apkResult.err) {
      console.error('获取设备apk路径失败, err=' + apkResult.err)
    }
    let apkPath = apkResult.data.replace('package:', '')
    apkPath = apkPath.substring(0, apkPath.lastIndexOf('='))
    if (!apkPath || apkPath === '') {
      return name
    }

    const dumpResult = adbExec(
      '-s ' + deviceId + ' shell /data/local/tmp/aapt-arm-pie d badging ' + apkPath)
    const { err, data } = dumpResult
    if (err) {
      console.error('dump apk信息失败, err=' + err)
    }
    for (const line of data.split('\n')) {
      if (line.startsWith('application-label:')) {
        const arr = line.trim().split("'")
        if (arr.length > 1) {
          name = arr[1]
          break
        }
      }
    }
  } catch (e) {
    console.error('获取APP名失败', e)
  }
  return name && name !== '' ? name : packageName
}

/**
 * 获取APP版本
 */
export function getAppVersion(deviceId, packageName) {
  let buildVersion = ''
  if (!deviceId || deviceId === '' || !packageName || packageName === '') {
    return buildVersion
  }
  const result = adbExec('-s ' + deviceId + ' shell dumpsys package ' + packageName + ' | grep versionName | awk \'{print $1}\' | awk -F= \'{print $2}\'')
  const { err, data } = result
  if (err) {
    console.error('获取Android应用版本号失败, err=' + err)
  } else {
    buildVersion = data.trim()
  }
  return buildVersion
}

/**
 * 获取应用Build号
 */
export function getAppBuildVersion(deviceId, packageName) {
  let buildVersion = '0'
  if (!deviceId || deviceId === '' || !packageName || packageName === '') {
    return buildVersion
  }
  const result = adbExec('-s ' + deviceId + ' shell dumpsys package ' + packageName + ' | grep versionCode | awk \'{print $1}\' | awk -F= \'{print $2}\'')
  const { err, data } = result
  if (err) {
    console.error('获取Android应用Build号失败, err=' + err)
  } else {
    buildVersion = data.trim()
  }
  return buildVersion
}

/**
 * 获取设备详细信息
 */
export function getAndroidDeviceInfo(deviceId) {
  const systemInfo = {}
  if (!deviceId || deviceId === '') {
    return systemInfo
  }
  // 系统信息
  const getpropResult = adbExec('-s ' + deviceId + ' shell getprop')
  const { err, data } = getpropResult
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取Android设备详细信息失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((item) => {
      if (item.startsWith('[ro.product.device]')) {
        systemInfo.DeviceName = item.replace('[ro.product.device]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.product.brand]')) {
        systemInfo.ProductBrand = item.replace('[ro.product.brand]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.product.model]')) {
        systemInfo.ProductModel = item.replace('[ro.product.model]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.product.name]')) {
        systemInfo.ProductName = item.replace('[ro.product.name]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.build.version.sdk]')) {
        systemInfo.VersionSDK = item.replace('[ro.build.version.sdk]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.build.version.release]')) {
        systemInfo.OSVersion = item.replace('[ro.build.version.release]: [', '').replace(']', '').trim()
      } else if (item.startsWith('[ro.product.cpu.abi]')) {
        systemInfo.CPUArchitecture = item.replace('[ro.product.cpu.abi]: [', '').replace(']', '').trim()
      }
    })
  }
  systemInfo.UDID = deviceId
  const cpuInfo = getAndroidDeviceCPUInfo(deviceId)
  const deviceInfo = { ...systemInfo, ...cpuInfo }
  const memoryTotal = getAndroidDeviceMemoryTotal(deviceId)
  if (memoryTotal) {
    deviceInfo.MemoryTotal = memoryTotal
  }
  return deviceInfo
}

/**
 * 获取设备CPU信息
 */
export function getAndroidDeviceCPUInfo(deviceId) {
  const cpuInfo = {}
  if (!deviceId || deviceId === '') {
    return cpuInfo
  }
  // 系统信息
  const result = adbExec('-s ' + deviceId + ' shell cat /proc/cpuinfo')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取Android设备CPU信息失败, err=' + err)
  } else {
    let cpuCoreNum = 0
    data.split(/[(\r\n)\r\n]+/).forEach((item) => {
      if (item.startsWith('Hardware')) {
        cpuInfo.CPUModel = item.split(':')[1].trim()
      } else if (item.startsWith('BogoMIPS')) {
        cpuCoreNum++
      }
    })
    cpuInfo.CPUCoreNum = cpuCoreNum
  }
  return cpuInfo
}

/**
 * 获取设备内存信息
 */
export function getAndroidDeviceMemoryTotal(deviceId) {
  if (!deviceId || deviceId === '') {
    return null
  }
  // 系统信息
  const result = adbExec('-s ' + deviceId + ' shell cat /proc/meminfo | grep MemTotal | awk \'{printf $2}\'')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取Android设备Memory信息失败, err=' + err)
  } else {
    const gb = parseInt(data) / 1000 / 1000
    return Math.ceil(gb) + 'GB'
  }
  return null
}
