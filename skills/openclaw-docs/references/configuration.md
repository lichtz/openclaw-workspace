# OpenClaw 配置说明

## 配置文件位置

主配置文件：`~/.openclaw/openclaw.json`

## 常用配置项

### Gateway 配置

```json
{
  "gateway": {
    "port": 18789,
    "host": "127.0.0.1",
    "auth": {
      "token": "your-secure-token"
    }
  }
}
```

### Canvas 主机配置

```json
{
  "canvasHost": {
    "port": 18793,
    "host": "0.0.0.0"
  }
}
```

### 模型提供商配置

#### Anthropic (Claude)
```json
{
  "providers": {
    "anthropic": {
      "apiKey": "sk-ant-..."
    }
  }
}
```

#### OpenAI
```json
{
  "providers": {
    "openai": {
      "apiKey": "sk-..."
    }
  }
}
```

#### 其他提供商
- Moonshot AI
- MiniMax
- GLM (Z.AI)
- OpenRouter
- Amazon Bedrock

### 频道配置

#### WhatsApp
```json
{
  "channels": {
    "whatsapp": {
      "enabled": true
    }
  }
}
```
登录方式：`openclaw channels login`

#### Telegram
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "..."
    }
  }
}
```

#### Discord
```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "botToken": "..."
    }
  }
}
```

### Web 搜索配置

```bash
openclaw configure --section web
```

或手动编辑：
```json
{
  "tools": {
    "web": {
      "search": {
        "apiKey": "your-brave-api-key"
      }
    }
  }
}
```

### 路由配置

```json
{
  "routing": {
    "agents": {
      "main": {
        "workspace": "~/.openclaw/workspace",
        "sandbox": {
          "mode": "off"
        }
      }
    }
  }
}
```

沙盒模式选项：
- `"off"`: 不沙盒
- `"non-main"`: 仅非主会话沙盒
- `"all"`: 全部沙盒

### 更新配置

```json
{
  "update": {
    "checkOnStart": true,
    "channel": "stable"
  }
}
```

频道选项：`stable`、`beta`、`dev`

## 配置命令

```bash
# 交互式配置
openclaw configure

# 配置特定部分
openclaw configure --section web
openclaw configure --section providers

# 查看当前配置
cat ~/.openclaw/openclaw.json

# 验证配置
openclaw doctor
```

## 凭证管理

凭证文件位置：`~/.openclaw/credentials/`

- OAuth: `oauth.json`
- 频道凭证: 各频道子目录

## 环境变量

部分配置可通过环境变量覆盖：

| 变量 | 说明 |
|------|------|
| `OPENCLAW_GATEWAY_TOKEN` | 网关 token |
| `OPENCLAW_GATEWAY_PORT` | 网关端口 |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |

## 多网关配置

如需运行多个网关实例：

```bash
# 实例1
openclaw gateway --port 18789 --config-dir ~/.openclaw/instance1

# 实例2
openclaw gateway --port 18790 --config-dir ~/.openclaw/instance2
```

每个实例需要独立的配置目录。
