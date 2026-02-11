# Coral Android 项目 - 分析文档索引

## 📚 已生成的文档清单

| # | 文档名称 | 文件名 | 核心内容 |
|---|---------|--------|----------|
| 1 | **依赖关系图** | DEPENDENCY_GRAPH.md | 模块依赖、第三方库、Gradle 配置 |
| 2 | **架构分析** | ARCHITECTURE_ANALYSIS.md | 项目结构、架构模式、设计模式 |
| 3 | **API 接口文档** | API_REFERENCE.md | H5Service、H5Session、H5Bridge 等核心 API |
| 4 | **安全性分析** | SECURITY_ANALYSIS.md | 加密、校验、权限、隐私保护 |
| 5 | **性能优化** | PERFORMANCE_ANALYSIS.md | WebView 优化、缓存、内存、线程 |
| 6 | **资源分析** | RESOURCE_ANALYSIS.md | Layout、Drawable、Values 资源统计 |
| 7 | **测试与构建** | TEST_BUILD_ANALYSIS.md | 测试覆盖、CI/CD、ProGuard |
| 8 | **现代化分析** | MODERNIZATION_ANALYSIS.md | AndroidX、Compose、DI、协程 |
| 9 | **配置分析** | CONFIGURATION_ANALYSIS.md | Gradle、签名、主题、权限 |

---

## 📊 项目关键指标

### 代码规模

| 指标 | 数值 |
|------|------|
| **总文件数** | 995 个 |
| **Java 代码** | 140,247 行 |
| **Kotlin 代码** | 149 行 |
| **模块数** | 9 个 |
| **Layout 文件** | 40 个 |
| **Drawable 文件** | 150+ 个 |

### 技术栈

| 类别 | 技术 | 状态 |
|------|------|------|
| **语言** | Java 99.9% / Kotlin 0.1% | ⚠️ 需迁移 |
| **构建** | Gradle 8.8.0 + AGP 8.8.0 | ✅ |
| **UI** | ViewBinding 部分使用 | ⚠️ 需完善 |
| **网络** | OkHttp3 + FastJSON | ✅ |
| **异步** | RxJava + Handler | ⚠️ 需升级 |
| **数据库** | SQLCipher + GreenDAO | ⚠️ 需迁移 |
| **H5 容器** | 自研 Nebula | ✅ |

---

## 🔍 核心发现

### 优势 ✅

1. **模块化设计**: 9 个独立模块，职责清晰
2. **完善的网络层**: OkHttp3 + SSL 固定
3. **H5 容器成熟**: 完整的 JS-Java Bridge
4. **插件化架构**: 支持动态扩展
5. **离线包支持**: 增量更新能力

### 待改进 ⚠️

1. **Java 为主**: Kotlin 渗透率 <1%
2. **测试缺失**: 无有效测试用例
3. **文档不足**: 缺少 API 文档
4. **架构老旧**: 未使用 MVVM/MVP
5. **性能优化**: WebView 未池化
6. **安全加固**: 部分 HTTP 明文传输

### 高风险 ⚠️

1. **测试 keystore**: 使用弱密码
2. **内存泄漏**: Handler/Context 泄漏风险
3. **代码质量**: 注释覆盖 <10%
4. **缺少 CI/CD**: 无自动化构建

---

## 🎯 重构优先级

### P0 - 紧急

- [ ] 安全: 更换正式签名证书
- [ ] 安全: 强制 HTTPS
- [ ] 构建: 启用 AndroidX 完全迁移
- [ ] 构建: 配置 CI/CD

### P1 - 高优

- [ ] 架构: 引入 Hilt DI
- [ ] 架构: 迁移到 MVVM
- [ ] 测试: 添加单元测试
- [ ] 性能: WebView 池化

### P2 - 中优

- [ ] 现代化: Kotlin 逐步迁移
- [ ] 现代化: 引入 Compose 评估
- [ ] 性能: 完善缓存策略
- [ ] 文档: 完善 API 文档

### P3 - 低优

- [ ] UI: Material Design 3 升级
- [ ] 性能: 线程池优化
- [ ] 安全: 添加安全扫描
- [ ] 监控: 添加性能监控

---

## 📂 文档快速索引

### 新手入门

1. **ARCHITECTURE_ANALYSIS.md** - 了解项目整体架构
2. **DEPENDENCY_GRAPH.md** - 查看模块依赖关系
3. **CONFIGURATION_ANALYSIS.md** - 熟悉构建配置

### API 开发

1. **API_REFERENCE.md** - 查阅 H5 API 接口
2. **ARCHITECTURE_ANALYSIS.md** - 理解架构模式

### 性能优化

1. **PERFORMANCE_ANALYSIS.md** - 性能优化指南
2. **RESOURCE_ANALYSIS.md** - 资源优化建议

### 安全相关

1. **SECURITY_ANALYSIS.md** - 安全机制详解
2. **CONFIGURATION_ANALYSIS.md** - 签名与权限

### 重构规划

1. **MODERNIZATION_ANALYSIS.md** - 现代化路线图
2. **TEST_BUILD_ANALYSIS.md** - 测试改进建议

---

## 🔗 相关文件位置

```
/root/coral_old/coral/
├── 📄 文档目录
│   ├── DEPENDENCY_GRAPH.md        (10KB)
│   ├── ARCHITECTURE_ANALYSIS.md   (13KB)
│   ├── API_REFERENCE.md           (10KB)
│   ├── SECURITY_ANALYSIS.md       (13KB)
│   ├── PERFORMANCE_ANALYSIS.md    (14KB)
│   ├── RESOURCE_ANALYSIS.md      (7KB)
│   ├── TEST_BUILD_ANALYSIS.md    (10KB)
│   ├── MODERNIZATION_ANALYSIS.md (8KB)
│   └── CONFIGURATION_ANALYSIS.md (8KB)
│
├── 📦 源代码
│   ├── app/                        (40 Java 文件)
│   ├── adapter-flame/              (144 Java 文件)
│   ├── base-flame-nebula/          (629 Java 文件) ⭐ 核心
│   ├── base-data-cache/            (11 Java 文件)
│   └── ...
│
├── ⚙️ 配置
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
│
└── 📱 资源
    └── res/
        ├── layout/                 (40 XML)
        ├── drawable/              (150+ XML)
        └── values/                (50+ XML)
```

---

## 📈 后续行动项

### 短期 (本周)

- [ ] 阅读所有分析文档
- [ ] 确定重构优先级
- [ ] 建立开发环境

### 中期 (本月)

- [ ] 完成 P0 安全修复
- [ ] 引入 Hilt DI
- [ ] 添加单元测试框架

### 长期 (季度)

- [ ] 架构现代化
- [ ] 完善测试覆盖
- [ ] 建立 CI/CD

---

*文档生成时间: 2026-02-05*
*总文档数: 9 份*
*总代码分析: 995 文件，14 万行*
