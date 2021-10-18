/**
 * iOS性能采集服务
 * Created by CaiWeiQi on 2021/9/10
 */
import zerorpc from 'zerorpc'
import child_process from 'child_process'
import path from 'path'
import fs from 'fs'
import cmd from 'node-cmd'
import { Message } from 'element-ui'
import { StateEnum } from './constant'

import log from 'electron-log'
const logger = log.create('InstrumentsServerLog')
logger.transports.file.fileName = 'InstrumentsServer.log'
logger.transports.console.level = process.env.NODE_ENV === 'development' ? 'silly' : false
const serviceLogDir = path.join(path.dirname(logger.transports.file.getFile().path), 'instrumentsCaller_logs')

const serverPort = 24242
let pythonProcess = null
let rpcClient = null
export let serverState = StateEnum.OFFLINE
const registerMonitorList = []

function execFilePath() {
  return path.join(__static, 'InstrumentsServer')
}

/**
 * 启动性能测试服务
 */
export function init() {
  if (pythonProcess != null) {
    return new Promise((res, rej) => {
      logger.info('InstrumentsCaller服务已启动')
      if (!rpcClient || rpcClient.closed()) {
        rpcConnect()
      }
      res()
    })
  }
  return new Promise((res, rej) => {
    new Promise((resolve, reject) => {
      console.log('InstrumentsServer文件地址', execFilePath())
      if (!fs.existsSync(serviceLogDir)) {
        fs.mkdirSync(serviceLogDir)
      }
      const chmod = cmd.runSync('chmod 777 ' + execFilePath())
      if (chmod.err) {
        console.error('InstrumentsServer无执行权限, error=', chmod.err)
        Message.error('InstrumentsServer无执行权限')
        rej('InstrumentsServer无执行权限')
      }
      pythonProcess = child_process.execFile(execFilePath(), ['--port', serverPort, '--log', serviceLogDir])
      logger.info(`InstrumentsCaller服务进程pid=${pythonProcess.pid}`)
      // pythonProcess.stdout.on(
      //   'data',
      //   (chunk) => {
      //     logger.info('服务日志stdout===')
      //     logger.info(chunk.toString())
      //   }
      // )
      pythonProcess.stderr.on(
        'data',
        (chunk) => {
          logger.info(chunk.toString())
          if (chunk.toString().indexOf(
            'start running on tcp://127.0.0.1:' + serverPort) !== -1) {
            logger.info('InstrumentsCaller服务已启动')
            resolve()
          } else if (chunk.toString().indexOf(
            'set com.apple.instruments.server.services.graphics.opengl callback ...') !== -1) {
            logger.info('[InstrumentsCaller]-帧率数据监控已启动')
            registerMonitorList.push('com.apple.instruments.server.services.graphics.opengl')
          } else if (chunk.toString().indexOf(
            'set com.apple.instruments.server.services.coreprofilesessiontap callback ...') !== -1) {
            logger.info('[InstrumentsCaller]-GPU数据监控已启动')
            registerMonitorList.push('com.apple.instruments.server.services.coreprofilesessiontap')
          } else if (chunk.toString().indexOf(
            'set com.com.apple.instruments.server.services.networking callback ...') !== -1) {
            logger.info('[InstrumentsCaller]-网络数据监控已启动')
            registerMonitorList.push('com.apple.instruments.server.services.networking')
          } else if (chunk.toString().indexOf(
            'set com.apple.instruments.server.services.sysmontap callback ...') !== -1) {
            logger.info('[InstrumentsCaller]-CPU&内存数据监控已启动')
            registerMonitorList.push('com.apple.instruments.server.services.sysmontap')
          }
        }
      )
    }).then(() => {
      logger.info('[InstrumentsCaller]-RPC服务已启动')
      serverState = StateEnum.IDLE
      rpcConnect()
      res()
    })
    if (pythonProcess == null) {
      rej('启动InstrumentsServer失败')
      throw new Error('启动InstrumentsServer失败')
    }
  })
}

/**
 * rpc客户端连接
 */
function rpcConnect() {
  // iOS Instruments服务启动耗时较长，心跳设长点避免请求超时
  const constLargeEnoughHeartbeat = 60 * 60 * 24 * 30 * 12 // 1 Year
  rpcClient = new zerorpc.Client({
    'heartbeatInterval': constLargeEnoughHeartbeat
  })
  rpcClient.connect('tcp://127.0.0.1:' + serverPort)
}

/**
 * 开始性能数据采集
 * @param deviceId 设备UDID
 * @param bundleId 测试包名
 * @returns {Promise<unknown>}
 */
export function start(deviceId, bundleId) {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke({ timeout: 30 }, 'start_test', deviceId, bundleId,
      function(error, res) {
        if (error) {
          reject('启动性能数据采集失败, error=' + error)
        }
        logger.info('start log===========\n\n\n' + res)
        serverState = StateEnum.TESTING
        resolve(res)
      })
  })
}

/**
 * 停止性能数据采集
 * @returns {Promise<unknown>}
 */
export function stop() {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke('stop_test',
      function(error, res) {
        if (error) {
          reject('停止性能数据采集失败, error=' + error)
        }
        logger.info('stop log===========\n\n\n' + res)
        serverState = StateEnum.IDLE
        resolve(res)
      })
  })
}

/**
 * 获取最近一秒性能数据
 * @returns {Promise<unknown>}
 */
export function dump() {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke('dump', (error, res) => {
      if (error) {
        reject('dump性能数据失败, error=' + error)
      }
      resolve(res)
    })
  })
}

/**
 * 获取本地设备列表
 * @returns {Promise<unknown>}
 */
export function getIosDeviceList() {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke('get_device_list', (error, res) => {
      if (error) {
        reject('get_device_list失败, error=' + error)
      }
      resolve(res)
    })
  })
}

/**
 * 获取设备详情
 * @returns {Promise<unknown>}
 */
export function getIosDeviceInfo(deviceId) {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke('get_device_info', deviceId, (error, res) => {
      if (error) {
        reject('get_device_info失败, error=' + error)
      }
      resolve(res)
    })
  })
}

/**
 * 获取本地设备列表
 * @returns {Promise<unknown>}
 */
export function getIosAppList(deviceId) {
  return new Promise((resolve, reject) => {
    if (!rpcClient) {
      reject('rpcClient未初始化')
    }
    rpcClient.invoke('get_app_list', deviceId, (error, res) => {
      if (error) {
        reject('get_app_list失败, error=' + error)
      }
      resolve(res)
    })
  })
}

/**
 * 关闭性能测试服务
 */
export function kill() {
  if (rpcClient != null) {
    rpcClient.close()
    rpcClient = null
  }
  if (pythonProcess != null) {
    pythonProcess.kill('SIGTERM')
    pythonProcess.kill(9)
    cmd.runSync('ps aux | grep InstrumentsServer | grep -v grep | awk \'{print $2}\' | xargs kill -9')
    pythonProcess = null
  }
  serverState = StateEnum.OFFLINE
}
