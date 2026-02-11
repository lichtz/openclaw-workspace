# OpenClaw 远程节点配置指南

在服务器上部署 OpenClaw 作为远程执行节点，让本地 Mac 可以发送命令让服务器执行。

## 架构

```
┌─────────────┐      WebSocket       ┌──────────────┐
│  本地 Mac    │  ═══════════════════► │  远程服务器   │
│  (Gateway)   │   (Tailscale 网络)   │  (Node Host) │
└─────────────┘                      └──────────────┘
```

## 前提条件

1. 两台机器都安装 OpenClaw
2. 两台机器都加入同一个 Tailscale 网络
3. 本地 Mac 的 Gateway 需要能被远程连接

## 配置步骤

### 1. 本地 Mac（Gateway）配置

修改 `~/.openclaw/openclaw.json`，让 Gateway 绑定到 Tailscale 接口：

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "0.0.0.0",
    "auth": {
      "mode": "token",
      "token": "your-token"
    }
  }
}
```

重启 Gateway：
```bash
openclaw gateway restart
```

### 2. 远程服务器（Node Host）配置

在服务器上运行节点主机（前台）：
```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
openclaw node run --host <mac-tailscale-ip> --port 18789 --display-name "Cloud Server"
```

安装为服务（推荐）：
```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
openclaw node install --host <mac-tailscale-ip> --port 18789 --display-name "Cloud Server"
openclaw node restart
```

### 3. 配对节点

在本地 Mac 上查看待配对请求：
```bash
openclaw nodes pending
```

批准节点：
```bash
openclaw nodes approve <request-id>
```

查看已连接节点：
```bash
openclaw nodes status
```

### 4. 配置 Exec 使用远程节点

全局配置：
```bash
openclaw config set tools.exec.host node
openclaw config set tools.exec.node "Cloud Server"
```

## 在服务器上执行命令

配置完成后，所有 exec 调用都会路由到服务器：

```bash
# 在服务器上执行命令
openclaw nodes run --node "Cloud Server" --raw "uname -a"
openclaw nodes run --node "Cloud Server" --raw "df -h"
```

## 故障排除

### 节点无法连接

1. 检查本地 Mac 的 Gateway 是否绑定了正确的地址
2. 检查 Tailscale 是否连通：`tailscale ping <ip>`
3. 检查防火墙是否开放 18789 端口

### 命令被拒绝

节点主机有执行审批机制，配置允许列表：
```bash
openclaw approvals allowlist add --node "Cloud Server" "/usr/bin/uname"
```

## 安全建议

- 使用强 token
- 限制允许执行的命令
- 使用 Tailscale 的 ACL 限制访问
