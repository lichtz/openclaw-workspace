#!/bin/bash
# OpenClaw 记忆自动同步脚本

set -e

REPO_DIR="/root/.openclaw/workspace/memory_backup"
MEMORY_SOURCE="/root/.openclaw/workspace"

echo "🔄 开始同步记忆..."

# 切换到备份目录
cd "$REPO_DIR"

# 复制最新的记忆文件
cp -f "$MEMORY_SOURCE/MEMORY.md" .
cp -f "$MEMORY_SOURCE/IDENTITY.md" .
cp -f "$MEMORY_SOURCE/USER.md" .
cp -f "$MEMORY_SOURCE/SOUL.md" .
cp -f "$MEMORY_SOURCE/TOOLS.md" .
cp -f "$MEMORY_SOURCE/AGENTS.md" .
cp -f "$MEMORY_SOURCE/HEARTBEAT.md" .

# 复制每日笔记
cp -f "$MEMORY_SOURCE/memory/"*.md ./memory/ 2>/dev/null || true

# Git 提交
git add .
COMMIT_MSG="Memory sync: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "没有需要同步的内容"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 记忆同步完成！"
