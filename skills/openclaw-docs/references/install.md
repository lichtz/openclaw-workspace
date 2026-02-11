# OpenClaw 安装与入门指南

## 系统要求

- **Node.js**: >= 22 (必需)
- **pnpm**: 可选，推荐用于源码安装
- **操作系统**: macOS、Linux、Windows (WSL2 推荐)

## 安装方法

### 方法1：推荐 - 官网安装脚本
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

选项：
- `--no-onboard`: 不运行 onboarding 向导
- `--install-method git`: 从 git 源码安装

### 方法2：npm/pnpm 全局安装
```bash
npm install -g openclaw@latest
# 或
pnpm add -g openclaw@latest
```

### 方法3：源码安装（开发）
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build
pnpm build
```

## 初始化配置

### 运行向导（推荐）
```bash
openclaw onboard --install-daemon
```

向导会配置：
- 本地/远程网关
- 模型认证（OAuth 或 API Key）
- 聊天频道（WhatsApp/Telegram/Discord）
- 配对安全设置
- 工作空间和 skills
- 后台服务（可选）

### 快速验证
```bash
openclaw status
openclaw health
openclaw security audit --deep
```

## 启动网关

### 服务方式（推荐）
如果安装时选择了 `--install-daemon`：
```bash
openclaw gateway status
```

### 手动启动
```bash
openclaw gateway --port 18789 --verbose
```

### Dashboard 访问
本地访问：http://127.0.0.1:18789/

## 频道配置

### WhatsApp
```bash
openclaw channels login
```
然后在 WhatsApp 手机端扫码：Settings → Linked Devices

### Telegram
需要 Bot Token，向导可以配置，或手动：
```bash
openclaw configure
```

### Discord
需要 Bot Token，同上。

## 配对安全

默认设置：未知 DM 会收到配对码，需要批准后才响应。

```bash
openclaw pairing list whatsapp      # 查看待批准请求
openclaw pairing approve whatsapp <code>  # 批准
```

## 重要文件位置

| 用途 | 路径 |
|------|------|
| 配置文件 | `~/.openclaw/openclaw.json` |
| 凭证 | `~/.openclaw/credentials/` |
| 工作空间 | `~/.openclaw/workspace` |
| 日志 | `~/.openclaw/logs/` |

## 平台特定说明

### macOS
- 如需构建 App，安装 Xcode/Command Line Tools
- CLI + 网关只需 Node.js

### Windows
- **强烈推荐 WSL2** (Ubuntu)
- 原生 Windows 兼容性差，工具支持有限

### Linux 服务器
- 配置 systemd user service 保持运行
- 确保用户 lingering 已启用（`loginctl enable-linger $USER`）
