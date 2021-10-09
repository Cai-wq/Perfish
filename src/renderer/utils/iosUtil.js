/**
 * iOS工具类
 * Created by CaiWeiQi on 2021/9/3
 */
import cmd from 'node-cmd'

/**
 * 检查有没装Tidevice和libimobiledevice
 */
export function checkIosDepend() {
  const checkTidevice = cmd.runSync('tidevice --version')
  console.log('tidevice version=', checkTidevice.data)
  if (checkTidevice.err) {
    console.error('tidevice error=', checkTidevice.err)
  }
  const checkIdeviceinstaller = cmd.runSync('ideviceinstaller --version')
  console.log(checkIdeviceinstaller.data)
  if (checkIdeviceinstaller.err) {
    console.error('ideviceinstaller error=', checkIdeviceinstaller.err)
  }
  return checkTidevice.err == null && checkIdeviceinstaller.err == null
}

/**
 * 获取iOS可用设备列表
 */
export function getIosDevices() {
  const deviceList = []
  const result = cmd.runSync('tidevice list')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取iOS设备列表失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((item) => {
      if (item && item.trim() !== '') {
        const udid = item.trim().split(' ')[0]
        deviceList.push({
          udid: udid,
          name: item.replace(udid, '')
        })
      }
    })
  }
  return deviceList
}

/**
 * 获取设备中所有第三方应用
 */
export function getIosApplications(deviceId) {
  const appList = []
  if (!deviceId || deviceId === '') {
    return appList
  }
  const result = cmd.runSync('tidevice --udid ' + deviceId + ' applist')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取应用列表失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((value) => {
      if (value && value.trim() !== '') {
        const arr = value.split(' ')
        const bundleId = arr[0]
        const version = arr[arr.length - 1]
        const name = value.replace(bundleId, '').replace(version, '').trim()
        appList.push({
          name: name,
          packageName: bundleId,
          version: version
        })
      }
    })
  }
  return appList
}

/**
 * 获取应用Build号
 */
export function getAppBuildVersion(deviceId, bundleId) {
  let buildVersion = '0'
  if (!deviceId || deviceId === '' || !bundleId || bundleId === '') {
    return buildVersion
  }
  const result = cmd.runSync('ideviceinstaller -u ' + deviceId + ' -l -o list_user | grep ' + bundleId)
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取iOS应用Build号失败, err=' + err)
  } else {
    buildVersion = data.replace(/\s+/g, '').replace(/\"/g, '').split(',')[1]
  }
  return buildVersion
}

/**
 * 获取设备详细信息
 */
export function getIosDeviceInfo(deviceId) {
  const deviceInfo = {}
  if (!deviceId || deviceId === '') {
    return deviceInfo
  }
  const result = cmd.runSync('tidevice --udid ' + deviceId + ' info')
  const { err, data } = result
  // console.log('执行命令, data=' + data + '\nerr=' + err)
  if (err) {
    console.error('获取iOS设备详细信息失败, err=' + err)
  } else {
    data.split(/[(\r\n)\r\n]+/).forEach((item) => {
      if (item.startsWith('DeviceName')) {
        deviceInfo.DeviceName = item.replace('DeviceName:', '').trim()
      } else if (item.startsWith('MarketName')) {
        deviceInfo.MarketName = item.replace('MarketName:', '').trim()
      } else if (item.startsWith('ProductVersion')) {
        deviceInfo.OSVersion = item.replace('ProductVersion:', '').trim()
      } else if (item.startsWith('ProductType')) {
        deviceInfo.ProductType = item.replace('ProductType:', '').trim()
      } else if (item.startsWith('WiFiAddress')) {
        deviceInfo.WiFiAddress = item.replace('WiFiAddress:', '').trim()
      } else if (item.startsWith('CPUArchitecture')) {
        deviceInfo.CPUArchitecture = item.replace('CPUArchitecture:', '').trim()
      }
    })
    deviceInfo.UDID = deviceId
  }
  return deviceInfo
}
