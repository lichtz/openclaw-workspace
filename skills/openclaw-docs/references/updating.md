# OpenClaw 更新指南

## 推荐更新方式

### 方式1：重新运行安装脚本（推荐）
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

特点：
- 检测现有安装并原地升级
- 自动运行 `openclaw doctor`
- 支持 `--no-onboard` 跳过向导

### 方式2：openclaw update 命令
```bash
openclaw update
```

适用于源码安装（git checkout）：
- 要求干净的工作区
- 切换频道并拉取最新代码
- 安装依赖、构建、运行 doctor
- 默认重启网关

### 方式3：包管理器更新
```bash
# npm
npm i -g openclaw@latest

# pnpm
pnpm add -g openclaw@latest
```

## 更新后必做步骤

```bash
openclaw doctor          # 修复配置、迁移
openclaw gateway restart # 重启网关
openclaw health          # 验证健康状态
```

## 更新频道

切换更新频道：
```bash
openclaw update --channel beta
openclaw update --channel dev
openclaw update --channel stable
```

指定版本标签：
```bash
openclaw update --tag <version>
```

## 更新前备份

建议备份以下文件：
- `~/.openclaw/openclaw.json` - 配置
- `~/.openclaw/credentials/` - 凭证
- `~/.openclaw/workspace/` - 工作空间

## 回滚/固定版本

如需固定版本，使用特定标签安装：
```bash
npm i -g openclaw@<specific-version>
```

## Control UI 更新

Dashboard 中有 "Update & Restart" 按钮（RPC: update.run）：
- 仅适用于 git 安装
- 如果 rebase 失败会中止并重启
- 更新报告会发送到最近活跃的会话

## 自动更新检查

npm 安装默认会在网关启动时检查更新。
禁用：`update.checkOnStart: false`
