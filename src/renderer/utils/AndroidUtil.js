/**
 * Android工具类
 * Created by CaiWeiQi on 2021/9/3
 */
import cmd from 'node-cmd'

/**
 * 检查有没装Android SDK
 */
export function checkDepend() {
  const result = cmd.runSync('adb --version')
  return !result.err
}

/**
 * 获取Android可用设备列表
 */
export function getAndroidDevices() {
  const deviceList = []
  const result = cmd.runSync('adb devices -l')
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
  const result = cmd.runSync('adb -s ' + deviceId + ' shell getprop ro.product.device')
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
  const result = cmd.runSync('adb -s ' + deviceId + ' shell pm list package -3')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取应用列表失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((value) => {
      if (value && value.trim() !== '') {
        const packageName = value.replace('package:', '').trim()
        appList.push({
          name: packageName,
          packageName: packageName,
          version: null
        })
      }
    })
  }
  return appList
}

/**
 * 获取应用Build号
 */
export function getAppBuildVersion(deviceId, packageName) {
  let buildVersion = '0'
  if (!deviceId || deviceId === '' || !packageName || packageName === '') {
    return buildVersion
  }
  const result = cmd.runSync('adb -s ' + deviceId + ' shell dumpsys package ' + packageName + ' | grep versionCode | awk \'{print $1}\' | awk -F= \'{print $2}\'')
  const { err, data } = result
  if (err) {
    console.error('获取Android应用Build号失败, err=' + err)
  } else {
    buildVersion = data
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
  const getpropResult = cmd.runSync('adb -s ' + deviceId + ' shell getprop')
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
  const result = cmd.runSync('adb -s ' + deviceId + ' shell cat /proc/cpuinfo')
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
  const result = cmd.runSync('adb -s ' + deviceId + ' shell cat /proc/meminfo | grep MemTotal | awk \'{printf $2}\'')
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
