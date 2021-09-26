/**
 * iOS性能采集服务
 * Created by CaiWeiQi on 2021/9/10
 */
import zerorpc from 'zerorpc'
import child_process from 'child_process'
import path from 'path'
import cmd from 'node-cmd'
import { StateEnum } from './constant'

import log from 'electron-log'
const logger = log.create('InstrumentsServerLog')
logger.transports.file.fileName = 'InstrumentsServer.log'
logger.transports.console.level = process.env.NODE_ENV === 'development' ? 'silly' : false

const serverPort = 24242
let pythonProcess = null
let rpcClient = null
export let serverState = StateEnum.STATE_STOP
const registerMonitorList = []

function execFilePath() {
  return path.join(process.cwd(), 'pydist', 'InstrumentsServer')
}

/**
 * 启动性能测试服务
 */
export function init() {
  return new Promise((res, rej) => {
    if (pythonProcess != null) {
      logger.info('InstrumentsCaller服务已启动')
      rpcConnect()
      // return
      res()
    }
    new Promise((resolve, reject) => {
      pythonProcess = child_process.execFile(execFilePath(), ['--port', serverPort])
      logger.info(`子进程pid=${pythonProcess.pid}`)
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
          // logger.info('服务日志stderr===')
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
      serverState = StateEnum.STATE_INITIALIZED
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
    rpcClient.invoke({ timeout: 30 }, 'start_test', deviceId, bundleId,
      function(error, res) {
        if (error) {
          reject('启动性能数据采集失败, error=' + error)
        }
        logger.info('start log===========\n\n\n' + res)
        serverState = StateEnum.STATE_RUNNING
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
    rpcClient.invoke('stop_test',
      function(error, res) {
        if (error) {
          reject('停止性能数据采集失败, error=' + error)
        }
        logger.info('stop log===========\n\n\n' + res)
        serverState = StateEnum.STATE_STOP
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
    rpcClient.invoke('dump', (error, res) => {
      if (error) {
        reject('dump性能数据失败, error=' + error)
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
}
