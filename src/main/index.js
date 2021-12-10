import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron'
import cmd from 'node-cmd'
import path from 'path'

// 日志
const logger = require('electron-log')
logger.transports.console.level = 'silly'
Object.assign(console, logger.functions)
global.shareObject = {
  logFileDir: path.dirname(logger.transports.file.getFile().path),
  perfDataPath: path.join(app.getPath('userData'), 'performance')
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  // require('fix-path').default()
  process.env.PATH = [
    './node_modules/.bin',
    '/.nodebrew/current/bin',
    '/usr/local/bin',
    '/usr/local/Cellar',
    '/opt/homebrew/Cellar',
    '/opt/homebrew/bin',
    '/Library/Frameworks/Python.framework/Versions/3/bin',
    '/Library/Frameworks/Python.framework/Versions/3.6/bin',
    '/Library/Frameworks/Python.framework/Versions/3.7/bin',
    '/Library/Frameworks/Python.framework/Versions/3.8/bin',
    '/Library/Frameworks/Python.framework/Versions/3.9/bin',
    process.env.PATH
  ].join(':')
} else {
  global.__static = require('path').join(process.cwd(), 'static')
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
    height: 940,
    useContentSize: true,
    width: 1700,
    webPreferences: {
      // 在网页中集成Node
      nodeIntegration: true,
      // renderer.js可以正常调用remote
      enableRemoteModule: true,
      // 允许跨域
      webSecurity: false
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
  app.on('ready', () => {
    createWindow()
    appMenu()
  })
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

// 菜单栏
function appMenu() {
  const menu = new Menu()
  menu.append(Menu.getApplicationMenu().items[0])
  menu.append(
    new MenuItem(
      {
        label: '性能测试',
        submenu: [{
          label: '开始测试',
          click() {
            mainWindow.webContents.send('href', 'HomePage')
          }
        },
        {
          label: '测试报告',
          click() {
            mainWindow.webContents.send('href', 'LocalReportListPage')
          }
        }]
      })
  )
  Menu.setApplicationMenu(menu)
}

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
