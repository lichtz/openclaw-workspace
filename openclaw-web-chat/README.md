# OpenClaw Web Chat 🌐

一个简单的Web聊天界面，对接OpenClaw AI助手。

## 功能特性

- 💬 实时WebSocket通信
- 🎨 现代简约UI设计
- 📱 响应式布局
- 🔄 自动重连
- 🎭 打字动画效果

## 快速开始

### 1. 安装依赖

```bash
cd openclaw-web-chat
npm install
```

### 2. 启动服务

```bash
npm start
```

服务将在 `http://localhost:3000` 启动

### 3. 打开浏览器

访问 http://localhost:3000

## 配置

在 `server.js` 中修改OpenClaw网关地址：

```javascript
const OPENCLAW_HOST = '127.0.0.1';  // OpenClaw网关地址
const OPENCLAW_PORT = 18789;        // OpenClaw网关端口
```

## 项目结构

```
openclaw-web-chat/
├── server.js          # 后端服务
├── package.json       # 项目依赖
├── public/
│   ├── index.html     # 主页面
│   ├── style.css     # 样式
│   └── app.js        # 前端逻辑
└── README.md
```

## 依赖

- express - Web服务器
- ws - WebSocket
- axios - HTTP客户端

## 注意

- 确保OpenClaw网关正在运行
- 默认连接 `ws://localhost:3000`
- OpenClaw网关默认端口为 18789
