/**
 * Created by CaiWeiQi on 2021/9/10
 */
import zerorpc from 'zerorpc'
import child_process from 'child_process'
import path from 'path'
import log from 'electron-log'
const logger = log.create('InstrumentsServerLog')
logger.transports.file.fileName = 'InstrumentsServer.log'
logger.transports.console.level = 'silly'

const StateEnum = {
  STATE_STOP: 0,
  STATE_INITIALIZED: 101,
  STATE_RUNNING: 102
}

const serverPort = 24242
let pythonProcess = null
let rpcClient = null
// eslint-disable-next-line no-unused-vars
let serverState = StateEnum.STATE_STOP
const registerMonitorList = []

function execFilePath() {
  return path.join(process.cwd(), 'pydist', 'InstrumentsServer')
}

export function init() {
  new Promise((resolve, reject) => {
    pythonProcess = child_process.execFile(execFilePath(), ['--port', serverPort])
    logger.info(`子进程pid=${pythonProcess.pid}`)
    pythonProcess.stdout.on(
      'data',
      (chunk) => {
        logger.info('服务日志stdout===')
        logger.info(chunk.toString())
      }
    )
    pythonProcess.stderr.on(
      'data',
      (chunk) => {
        logger.info('服务日志stderr===')
        logger.info(chunk.toString())
        if (chunk.toString().indexOf(
          'start running on tcp://127.0.0.1:' + serverPort) !== -1) {
          logger.info('InstrumentsCaller服务已启动')
          serverState = StateEnum.STATE_INITIALIZED
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
    // iOS Instruments服务启动耗时较长，心跳设长点避免请求超时
    const constLargeEnoughHeartbeat = 60 * 60 * 24 * 30 * 12 // 1 Year
    rpcClient = new zerorpc.Client({
      'heartbeatInterval': constLargeEnoughHeartbeat
    })
    rpcClient.connect('tcp://127.0.0.1:' + serverPort)
  })
  if (pythonProcess == null) {
    throw new Error('启动InstrumentsServer失败')
  }
}

export function start(deviceId, bundleId) {
  return new Promise((resolve, reject) => {
    rpcClient.invoke({ timeout: 30 }, 'start_test', deviceId, bundleId,
      function(error, res) {
        if (error) {
          reject('启动性能数据采集失败, error=' + error)
        }
        logger.info('start log===========\n\n\n' + res)
        resolve(res)
      })
  })
}

export function stop() {
  return new Promise((resolve, reject) => {
    rpcClient.invoke('stop_test',
      function(error, res) {
        if (error) {
          reject('停止性能数据采集失败, error=' + error)
        }
        logger.info('stop log===========\n\n\n' + res)
        resolve(res)
      })
  })
}

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

export function kill() {
  if (rpcClient != null) {
    rpcClient.close()
    rpcClient = null
  }
  if (pythonProcess != null) {
    pythonProcess.kill()
    pythonProcess = null
  }
}
