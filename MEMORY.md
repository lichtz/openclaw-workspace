# MEMORY.md - 长期记忆

## 关于老大
- **名字**: 老大
- **称呼**: 老大
- **时区**: Asia/Shanghai
- **风格偏好**: 撒娇可爱、活泼、能干、带点小调皮
- **工作方式**: 偏好主动，不需要事事都问
- **常用工具**: iOS 日历、微信

## 重要事件

### 2026-02-01
- 创建了 `openclaw-sync` skill，用于跨设备同步 OpenClaw 配置
- 更换了头像为 Gemini 生成的图片
- 部署 OpenClaw 到远程服务器 (101.35.160.223)
- 配置了 Tailscale 组网
- 配置了服务器作为 OpenClaw 远程节点

### 2026-02-02
- 更新服务器 OpenClaw 从 2026.1.29 → 2026.1.30
- 配置 SSH 密钥认证到服务器
- 同步本地 git 配置到服务器
- 同步 OpenClaw 记忆文件到服务器（MEMORY.md, SOUL.md, USER.md, IDENTITY.md, TOOLS.md, AGENTS.md）
- 配置 OpenClaw workspace rsync 增量同步（Mac ↔ 服务器）
- 卸载本地 Tailscale

## 项目

### OpenClaw 远程节点
- **服务器 IP**: 101.35.160.223
- **Tailscale IP**: 100.119.237.45
- **用途**: 作为远程执行节点，让本地 Mac 可以发送命令让服务器执行
- **状态**: 已部署 OpenClaw + Tailscale + Node Host 服务

### OpenClaw 配置同步
- **同步方式**: rsync 增量同步
- **Mac 脚本**: `/Users/licht/.openclaw/workspace/sync_workspace.sh`
- **同步内容**: OpenClaw workspace (配置、记忆、技能等)
- **使用方法**:
  ```bash
  cd /Users/licht/.openclaw/workspace
  ./sync_workspace.sh        # 双向同步
  ./sync_workspace.sh to     # Mac → 服务器
  ./sync_workspace.sh from   # 服务器 → Mac
  ```
- **特点**: 增量同步，只传改动的文件，不覆盖新文件

## 偏好与习惯
- 喜欢助手主动干活，不需要事事都问
- 偏好可爱的交互风格

### 2026-02-04
- 在服务器上安装 Node v24.13.0
- 配置 SSH 密钥认证（RSA 公钥已添加到服务器 ~/.ssh/authorized_keys）
- 现在可免密码 SSH 登录：`ssh root@101.35.160.223`

### AI博客项目
- **地址**: http://101.35.160.223
- **用途**: 备案用，展示AI相关资讯和教程
- **内容**: 每天3篇AI相关详细内容
- **更新命令**: `ssh root@101.35.160.223 /root/update_ai_blog.sh`

## 备注
- 服务器部署信息见服务器上的 `openclaw-remote-node` skill

### 2026-02-07
- 发现 OpenClaw 自动重启失败导致 QQ Bot 断连问题
  - 原因：01:05:44 尝试自动更新时 daemon 重启失败
  - 错误：`ERR_MODULE_NOT_FOUND: Cannot find module 'daemon-cli-yMu4ZGat.js'`
  - 恢复：01:08:58 手动执行 `openclaw gateway restart`
  - 症状：QQ Bot 无响应，显示 "No response within timeout"
- 日志位置：`/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- **需要配置自动监控机制**，防止类似情况再次发生
