# PerfFish

> 移动端性能测试工具desktop

## 快速上手

### 开发环境
```bash
# 安装依赖（必须加后面的 --registry ，明确使用公司私有仓库。否则会导致用例编辑器依赖拉不下来）
npm install --registry=http://npm.lizhifm.com

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

## 简介

基于Electron实现的可视化移动端APP性能测试工具

云端看板：[海王平台-性能测试报告](http://poseidon.183me.com/#/mobile-platform/performance/report)

![](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/all/boxcn04CAkBzem0z3Rg4q81gike/?mount_node_token=doccnaisDEsAk8rgrpChDofr4Tb&mount_point=doc_image)

[指引文档](https://lizhi2021.feishu.cn/wiki/wikcnCtxxIx431VbGA8DChT5PLh)

## 更新日志

[https://lizhi2021.feishu.cn/wiki/wikcnv3lchkJ4eivL7DVdbKTqIb](https://lizhi2021.feishu.cn/wiki/wikcnv3lchkJ4eivL7DVdbKTqIb)
