# Perfish

基于Electron实现的可视化移动端APP性能测试工具。
- [x] 同时支持Android、iOS平台
- [x] 无需ROOT/越狱
- [x] 无需安装其他依赖，即插即用（iOS需要XCode支持）
- [x] 提供CPU、FPS、Jank、Memory等性能参数
- [ ] Network、Battery
- [ ] 云端看板
- [ ] 报告比对

## 快速上手

### 开发环境
```bash
npm install

# serve with hot reload at localhost:9080
npm run dev
```

### FQA
1. 若dev启动后报错Node.js版本问题，如
```
XXX Node.js version using NODE_MODULE_VERSION XX. This version of Node.js requires NODE_MODULE_VERSION XX. Please try re-compiling or re-installing the module (dor instance, using `npm rebuild` or `npm install`).
```

* 执行`npm run rebuild`，再重启即可解决

### 发布
```bash
# 打正式包
npm run build
```

### 其他
```bash
# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```
---

## Thanks
- [使用纯 python 实现 Instruments 协议，跨平台 (win,mac,linux) 获取 iOS 性能数据](https://testerhome.com/topics/27159)
- mobilepef: <https://github.com/alibaba/mobileperf>
- TIDEVICE: <https://github.com/alibaba/taobao-iphone-device>
- Apple Device Images: <https://github.com/iGhibli/iOS-DeviceSupport>
