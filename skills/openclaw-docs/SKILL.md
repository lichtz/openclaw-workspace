---
name: openclaw-docs
description: OpenClaw 官方文档速查 skill。当用户询问 OpenClaw 的安装、更新、配置、使用方法、故障排查等问题时使用。包含官方文档的核心内容，支持快速查询各种功能的使用说明。
---

# OpenClaw 官方文档

OpenClaw 是一个 AI 助手网关，连接 WhatsApp/Telegram/Discord/iMessage 等聊天平台到 Pi 等 AI 代理。

## 快速参考

- **官网**: https://openclaw.ai
- **文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **Dashboard**: http://127.0.0.1:18789/

## 核心命令速查

### 安装与更新
```bash
# 推荐安装方式
curl -fsSL https://openclaw.ai/install.sh | bash

# npm 全局安装
npm install -g openclaw@latest

# 更新
openclaw update
# 或
npm i -g openclaw@latest
```

### 网关管理
```bash
openclaw gateway status    # 查看状态
openclaw gateway start     # 启动
openclaw gateway stop      # 停止
openclaw gateway restart   # 重启
```

### 健康检查与修复
```bash
openclaw doctor      # 运行诊断修复
openclaw health      # 健康检查
openclaw status      # 状态查看
```

### 频道配置
```bash
openclaw channels login              # WhatsApp 扫码登录
openclaw pairing list whatsapp       # 查看配对请求
openclaw pairing approve whatsapp <code>  # 批准配对
```

### 向导与配置
```bash
openclaw onboard --install-daemon    # 安装向导+服务
openclaw configure --section web     # 配置 Web 搜索 API
openclaw dashboard                   # 打开 Dashboard
```

## 详细文档

需要详细信息时，阅读以下参考文件：

- **安装与入门**: [references/install.md](references/install.md)
- **更新方法**: [references/updating.md](references/updating.md)
- **架构概述**: [references/architecture.md](references/architecture.md)
- **配置说明**: [references/configuration.md](references/configuration.md)

## 常见问题

### 如何升级 OpenClaw？
1. 运行 `curl -fsSL https://openclaw.ai/install.sh | bash` 或 `npm i -g openclaw@latest`
2. 运行 `openclaw doctor` 修复配置
3. 运行 `openclaw gateway restart` 重启网关
4. 运行 `openclaw health` 验证

### 服务器部署注意事项
- Node.js >= 22 是必需的
- 建议配置 systemd 服务保持网关运行
- 使用 `--bind tailnet --token ...` 绑定到 Tailscale 网络
- 配置文件位置：`~/.openclaw/openclaw.json`
- 凭证位置：`~/.openclaw/credentials/`

### 重装后的恢复
1. 重新安装 OpenClaw
2. 如有备份，恢复 `~/.openclaw/` 目录
3. 重新运行 `openclaw onboard` 配置
4. 重新登录频道（WhatsApp 需重新扫码）
