# PUBG 战绩查询微信小程序

## 项目结构

```
pubg_test/
├── miniprogram/          # 微信小程序前端
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── sitemap.json
│   ├── pages/
│   │   ├── index/       # 搜索页
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   └── player/      # 玩家数据页
│   │       ├── player.js
│   │       ├── player.json
│   │       ├── player.wxml
│   │       └── player.wxss
│   └── utils/
│       └── util.js
├── server/               # 数据代理服务
│   ├── index.js
│   ├── scraper.js
│   └── package.json
└── project.config.json   # 微信开发者工具配置
```

## 功能介绍

1. 查询玩家在 pubg.plus 上的赛季数据
2. 默认玩家：CCChan_292
3. 按模式（单人/双人/四人）展示统计数据
4. 赛季切换：可切换不同赛季查看历史数据
5. 查询历史：自动保存最近查询过的玩家，方便快速重查
6. 战绩对比：支持两个玩家同模式数据对比，自动标注胜负
7. 数据来源：pubg.plus（通过代理服务请求页面解析）

## 使用说明

### 1. 微信开发者工具配置
1. 用微信开发者工具打开项目根目录
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 在微信公众平台 -> 开发 -> 开发设置 -> 服务器域名中，添加你的代理服务器域名到 request 合法域名
4. 或者直接勾选 "不校验合法域名"（开发调试用）

### 2. 后端代理服务器

方式一（推荐）：双击 `server/start-server.bat` 一键启动

方式二（命令行）：
```bash
cd server
npm install
npm start
```

代理服务器默认运行在 `http://localhost:3000`，如需修改端口设置 `PORT` 环境变量。

### 3. 数据获取方式
小程序通过代理服务调用 pubg.plus 新版数据接口（`https://apiv1.pubg.plus`）获取玩家信息、赛季列表和赛季统计

### 4. 演示模式
如果网络请求失败，会自动使用内置演示数据展示

## API 接口

| 接口 | 说明 |
|------|------|
| `GET /api/player/:name` | 查询玩家最新赛季数据 |
| `GET /api/player/:name?season={seasonId}` | 查询指定赛季数据 |
| `GET /api/player/:name/seasons` | 获取该玩家的赛季列表 |
| 玩家页右上角 | 对比按钮跳转对比页 |
| `GET /api/health` | 健康检查 |

## 注意事项
- 小程序需要配置代理服务器域名白名单
- 数据以 pubg.plus 网站实际返回为准
- 默认查询玩家：CCChan_292
- 接口需要 `ts` + `sign` 签名参数，签名密钥内置在 `server/scraper.js` 中；若 pubg.plus 改版导致接口变化，需要重新核对
- 若遇到 `428`/`1007`（pubg.plus 安全验证）或请求超时，说明当前网络被 pubg.plus 限流，请稍等片刻再试；服务端已内置滑动验证自动尝试与结果缓存，可减少触发频率


