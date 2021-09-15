/**
 * Created by CaiWeiQi on 2021/9/10
 */
import zerorpc from 'zerorpc'
import child_process from 'child_process'
import path from 'path'
import log from 'electron-log'
const logger = log.create('AdbPerfServerLog')
logger.transports.file.fileName = 'AdbPerfServer.log'
logger.transports.console.level = 'silly'

const serverPort = 14242
let pythonProcess = null
let rpcClient = null
const registerMonitorList = []

function execFilePath() {
  return path.join(process.cwd(), 'pydist', 'AdbPerfServer')
}

function configFilePath() {
  return path.join(process.cwd(), 'pydist', 'config.conf')
}

function outputPath() {
  return path.join('~/Library', 'Lizhi', 'Perfect', 'AdbPerfServer')
}

export function init() {
  new Promise((resolve, reject) => {
    pythonProcess = child_process.execFile(execFilePath(),
      ['--port', serverPort,
        '--config', configFilePath()])
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
          logger.info('AdbPerfServer服务已启动')
          resolve()
        }
      }
    )
  }).then(() => {
    logger.info('[AdbPerfServer]-RPC服务已启动')
    rpcClient = new zerorpc.Client()
    rpcClient.connect('tcp://127.0.0.1:' + serverPort)
  })
  if (pythonProcess == null) {
    throw new Error('启动AdbPerfServer失败')
  }
}

export function start(deviceId, bundleId) {
  return new Promise((resolve, reject) => {
    rpcClient.invoke('start_test', deviceId, bundleId, outputPath(),
      function(error, res) {
        if (error) {
          reject('启动性能数据采集失败, error=' + error)
        }
        logger.info('start log===========\n\n\n' + res)
        res.split(',').forEach((item) => {
          registerMonitorList.push(item)
        })
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
