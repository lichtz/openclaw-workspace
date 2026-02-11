# Network Fix Skill

解决 VPN 代理问题，用于修复 GitHub API 连接。

## 问题症状

GitHub API 连接超时：
```
dial tcp 20.205.243.168:443: i/o timeout
```

## 使用方法

运行此 skill 的脚本：
```bash
./fix_network.sh
```

## 脚本逻辑

1. 检查 VPN 是否开启（尝试连接 github.com）
2. 如果 VPN 已开启，设置代理：
   ```bash
   export https_proxy=http://127.0.0.1:7890
   export http_proxy=http://127.0.0.1:7890
   ```
3. 如果 VPN 未开启，移除代理设置
4. 测试 GitHub API 连接
