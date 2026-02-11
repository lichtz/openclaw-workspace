# OpenClaw 架构概述

## 系统架构

```
WhatsApp / Telegram / Discord / iMessage (+ 插件)
 │
 ▼
 ┌───────────────────────────┐
 │ Gateway                   │ ws://127.0.0.1:18789 (仅本地)
 │ (单一来源)                 │
 │                           │ http://<gateway-host>:18793
 │                           │ /__openclaw__/canvas/ (Canvas 主机)
 └───────────┬───────────────┘
             │
             ├─ Pi 代理 (RPC)
             ├─ CLI (openclaw ...)
             ├─ Chat UI (SwiftUI)
             ├─ macOS App (OpenClaw.app)
             ├─ iOS 节点 (Gateway WS + 配对)
             └─ Android 节点 (Gateway WS + 配对)
```

## 核心组件

### Gateway（网关）
- 单一长运行进程
- 拥有所有频道连接
- WebSocket 控制平面
- 默认监听：ws://127.0.0.1:18789

### Canvas 主机
- HTTP 文件服务器
- 端口：18793（默认）
- 路径：`/__openclaw__/canvas/`
- 为节点 WebViews 提供服务

### 网络模型

- **一个主机一个网关**（推荐）
  - WhatsApp Web 会话唯一拥有者
  - 如需隔离，运行多网关（不同端口/配置）

- **本地优先**
  - 默认绑定到本地回环
  - 向导默认生成网关 token

- **Tailscale 访问**
  ```bash
  openclaw gateway --bind tailnet --token ...
  ```

- **节点连接**
  - 通过 WebSocket 连接到 Gateway
  - 支持 LAN/Tailnet/SSH
  - 旧版 TCP 桥接已废弃

## 主要特性

| 特性 | 说明 |
|------|------|
| 📱 WhatsApp | Baileys 库，WhatsApp Web 协议 |
| ✈️ Telegram | grammY，支持 DM 和群组 |
| 🎮 Discord | channels.discord.js，DM 和 Guild |
| 🧩 Mattermost | 插件，Bot Token + WebSocket |
| 💬 iMessage | macOS 本地 imsg CLI |
| 🤖 Pi 代理 | RPC 模式，工具流 |
| ⏱️ 流式响应 | 分块流式输出 |
| 🧠 多代理路由 | 按账户/对等方路由到隔离代理 |
| 🔐 OAuth | Anthropic + OpenAI 订阅认证 |
| 💬 会话管理 | 主会话共享，群组隔离 |
| 👥 群组支持 | 默认 @提及触发，可切换 always |
| 📎 媒体支持 | 图片、音频、文档收发 |
| 🎤 语音备注 | 可选转录钩子 |
| 🖥️ WebChat/macOS | 本地 UI + 菜单栏 |
| 📱 iOS/Android | 作为节点配对，Canvas 界面 |

## 会话模型

- **主会话** (`main`): 直接消息折叠到共享主会话
- **群组会话**: 隔离的独立会话
- **多代理路由**: 不同账户/频道可路由到不同代理

## 安全模型

- **Gateway Token**: 非本地绑定必需
- **配对码**: 新 DM 默认需要批准
- **Sandbox**: 可配置非主会话沙盒模式
- **DM 策略**: 可审计和警告风险设置

## 远程访问

- **SSH 隧道**: 端口转发
- **Tailscale**: `--bind tailnet` + token
- **发现**: Bonjour mDNS，LAN 自动发现

## 配置文件结构

```json
{
  "gateway": {
    "port": 18789,
    "auth": {
      "token": "..."
    }
  },
  "channels": {
    "whatsapp": {...},
    "telegram": {...}
  },
  "routing": {
    "agents": {
      "main": {...}
    }
  }
}
```
