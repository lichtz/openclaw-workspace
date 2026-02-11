# Auto Sync Skill

同步 Mac OpenClaw 到服务器和 GitHub。

## 策略

| 目标 | 内容 | 方式 |
|------|------|------|
| **服务器** | `memory/` | 每日记忆文件 |
| **GitHub** | 全部文件 | MEMORY.md, SOUL.md, USER.md, memory/* |

## 使用方法

```bash
cd /Users/licht/.openclaw/workspace
./auto_sync.sh           # 全部同步
./auto_sync.sh server   # 只同步服务器
./auto_sync.sh github   # 只同步 GitHub
```

## 注意事项

- 服务器同步：`memory/` 文件夹
- GitHub 同步：全部文件，只增不覆盖
- 需要 VPN（代理: `http://127.0.0.1:7890`）
