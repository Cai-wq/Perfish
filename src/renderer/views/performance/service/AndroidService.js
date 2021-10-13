/**
 * Android性能采集服务
 * Created by CaiWeiQi on 2021/9/10
 */
import zerorpc from 'zerorpc'
import child_process from 'child_process'
import path from 'path'
import cmd from 'node-cmd'
import { StateEnum } from './constant'
import { getAdbPath } from '@/utils/AndroidUtil'

import log from 'electron-log'
import { Message } from 'element-ui'
const logger = log.create('AdbPerfServerLog')
logger.transports.file.fileName = 'AdbPerfServer.log'
logger.transports.console.level = process.env.NODE_ENV === 'development'
  ? 'silly' : false

const serverPort = 14242
let pythonProcess = null
let rpcClient = null
export let serverState = StateEnum.OFFLINE
const registerMonitorList = []

function execFilePath() {
  let distDir
  if (process.env.NODE_ENV === 'development') {
    distDir = process.cwd()
  } else {
    // eslint-disable-next-line no-undef
    distDir = path.resolve(`${__static}`, '..')
  }
  return path.join(distDir, 'pydist', 'AdbPerfServer')
}

function configFilePath() {
  let distDir
  if (process.env.NODE_ENV === 'development') {
    distDir = process.cwd()
  } else {
    // eslint-disable-next-line no-undef
    distDir = path.resolve(`${__static}`, '..')
  }
  return path.join(distDir, 'pydist', 'config.conf')
}

function outputPath() {
  return path.join(path.dirname(logger.transports.file.getFile().path), 'AdbPerfServer_output')
}

/**
 * 启动性能测试服务
 */
export function init() {
  return new Promise((res, rej) => {
    if (pythonProcess != null) {
      logger.info('AdbPerfServer服务已启动')
      if (!rpcClient || rpcClient.closed()) {
        rpcConnect()
      }
      res()
    }
    new Promise((resolve, reject) => {
      const chmod = cmd.runSync('chmod 777 ' + execFilePath())
      if (chmod.err) {
        console.error('AdbPerfServer无执行权限, error=', chmod.err)
        Message.error('AdbPerfServer无执行权限')
        rej('AdbPerfServer无执行权限')
      }
      pythonProcess = child_process.execFile(execFilePath(),
        ['--port', serverPort,
          '--config', configFilePath(),
          '--adb_path', getAdbPath()])
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
          logger.info(chunk.toString())
          if (chunk.toString().indexOf(
            'start running on tcp://127.0.0.1:' + serverPort) !== -1) {
            logger.info('AdbPerfServer服务已启动')
            resolve()
          }
        }
      )
    }).then(() => {
      logger.info('[AdbPerfServer]-RPC服务已启动')
      serverState = StateEnum.IDLE
      rpcConnect()
      res()
    })
    if (pythonProcess == null) {
      rej('启动AdbPerfServer失败')
      throw new Error('启动AdbPerfServer失败')
    }
  })
}

/**
 * rpc客户端连接
 */
function rpcConnect() {
  rpcClient = new zerorpc.Client()
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
    rpcClient.invoke('start_test', deviceId, bundleId, outputPath(),
      function(error, res) {
        if (error) {
          reject('启动性能数据采集失败, error=' + error)
        }
        logger.info('start log===========\n\n\n' + res)
        serverState = StateEnum.TESTING
        res.toString().split(',').forEach((item) => {
          registerMonitorList.push(item)
        })
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
        cmd.runSync('rm -rf ' + outputPath())
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
    cmd.runSync('ps aux | grep AdbPerfServer | grep -v grep | awk \'{print $2}\' | xargs kill -9')
    pythonProcess = null
  }
  serverState = StateEnum.OFFLINE
}
