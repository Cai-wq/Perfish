/**
 * Created by CaiWeiQi on 2021/12/8
 */
import Low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'

const STORE_PATH = process.type !== 'renderer' ? global.shareObject.perfDataPath
  : require('electron').remote.getGlobal('shareObject').perfDataPath

console.log('本地数据存储', STORE_PATH)
// 判断路径是否存在，若不存在，就创建
// if (process.type !== 'renderer') {
if (!fs.pathExistsSync(STORE_PATH)) {
  fs.mkdirpSync(STORE_PATH)
}
// }

// 初始化lowdb读写的json文件名以及存储路径
const adapter = new FileSync(path.join(STORE_PATH, 'db.json'))
const db = Low(adapter) // lowdb接管该文件

if (!db.has('android').value()) {
  db.set('android', []).write()
}
if (!db.has('ios').value()) {
  db.set('ios', []).write()
}

export default db
