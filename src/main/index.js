import { app, BrowserWindow, ipcMain } from 'electron'
import cmd from 'node-cmd'
// import fixPath from 'fix-path'

// 日志
const logger = require('electron-log')
logger.transports.console.level = 'silly'
Object.assign(console, logger.functions)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  // fixPath()
  process.env.PATH = [
    './node_modules/.bin',
    '/.nodebrew/current/bin',
    '/usr/local/bin',
    '/usr/local/Cellar',
    '/opt/homebrew/Cellar',
    '/opt/homebrew/bin',
    process.env.PATH
  ].join(':')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 930,
    useContentSize: true,
    width: 1700,
    webPreferences: {
      // 在网页中集成Node
      nodeIntegration: true,
      // renderer.js可以正常调用remote
      enableRemoteModule: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    cleanAndExit()
  })
}

// 单例
if (!app.requestSingleInstanceLock()) {
  if (mainWindow) {
    mainWindow.close()
  }
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      } else {
        mainWindow.focus()
      }
    }
  })
  app.on('ready', createWindow)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

// 监听手动退出事件
ipcMain.on('SafeExit', (event, args) => {
  console.error('退出, message=', JSON.stringify(args))
  cleanAndExit()
})

function cleanAndExit() {
  // 清理环境
  cmd.runSync('ps aux | grep InstrumentsServer | grep -v grep | awk \'{print $2}\' | xargs kill -9')
  cmd.runSync('ps aux | grep AdbPerfServer | grep -v grep | awk \'{print $2}\' | xargs kill -9')
  app.exit()
}
