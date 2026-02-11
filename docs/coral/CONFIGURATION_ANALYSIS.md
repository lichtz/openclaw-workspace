# Coral Android 项目 - 项目配置与工程实践分析

## 📋 项目配置总览

### Gradle 配置

#### gradle.properties

```properties
# JVM 内存配置
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8

# 并行构建 (已注释)
# org.gradle.parallel=true

# AndroidX
android.useAndroidX=true

# Kotlin 代码风格
kotlin.code.style=official

# R 类不传递依赖
android.nonTransitiveRClass=true
```

#### 版本配置

| 组件 | 版本 | 说明 |
|------|------|------|
| **AGP** | 8.8.0 | Android Gradle Plugin |
| **Gradle** | 8.8+ | Gradle Wrapper |
| **Kotlin** | 2.0.0 | Kotlin 编译器 |
| **Compile SDK** | 35 | 编译目标 |
| **Min SDK** | 24 | 最低支持 |
| **Target SDK** | 35 | 目标版本 |

---

## 🏗️ 模块配置

### settings.gradle

```groovy
rootProject.name = "coral"

include ':app'                                    # 主应用
include ':adapter-flame'                          # H5 适配层
include ':base-flame-nebula'                      # H5 容器核心
include ':base--flame-offlineres'                 # 离线资源
include ':base-data-cache'                        # 数据缓存
include ':base---flame-core'                      # 核心库
include ':base----flame-basis'                    # 基础库
include ':base---utils'                           # 工具类
include ':base----log'                            # 日志系统
```

### 禁用模块 (注释状态)

```groovy
// include ':webResouce'        # Web 资源
// include ':commonTools'        # 通用工具
// include ':encrypt'            # 加密模块
// include ':webContainer'       # Web 容器
// include ':dataManager'        # 数据管理
// include ':adapter'            # 适配器
```

---

## 🔧 构建变体配置

### Build Types

| 类型 | Minify | Debuggable | ShrinkResources | 签名 |
|------|--------|------------|-----------------|------|
| **Debug** | ❌ | ✅ | ❌ | Debug 签名 |
| **Release** | ✅ | ❌ | ✅ | Release 签名 |

### Product Flavors

| 风味 | Application ID | 用途 |
|------|---------------|------|
| **dev** | com.ht.mbank.test | 开发测试 |
| **prd** | com.ht.mbank.prd | 生产发布 |

---

## 📦 依赖仓库配置

### 仓库列表 (优先级顺序)

```
1. 阿里云镜像 (国内加速)
   - maven.aliyun.com/repository/google
   - maven.aliyun.com/repository/central
   - maven.aliyun.com/repository/gradle-plugin
   - maven.aliyun.com/repository/jcenter

2. Google 官方
   - google()

3. Maven Central
   - mavenCentral()

4. Gradle Plugin
   - gradlePluginPortal()
```

### 依赖解析模式

```groovy
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    // ...
}
```

---

## 🔒 签名配置

### Debug 签名

```groovy
signingConfigs {
    debug {
        keyAlias 'key0'
        keyPassword '123456'
        storeFile file('../test.keystore')
        storePassword '123456'
        v2SigningEnabled true
    }
}
```

### Release 签名

```groovy
signingConfigs {
    release {
        keyAlias 'key0'
        keyPassword '123456'
        storeFile file('../test.keystore')
        storePassword '123456'
        v2SigningEnabled true
    }
}
```

**⚠️ 安全风险**: 使用了弱密码和测试 keystore，生产环境需使用正式签名。

---

## 🎨 主题配置

### 当前主题

```xml
<style name="Theme.MyApplication" parent="Theme.AppCompat.Light.NoActionBar" />

<style name="Theme.Empty" parent=""/>
```

### 建议升级

```xml
<!-- Material 3 主题 -->
<style name="Theme.Coral" parent="Theme.Material3.Light.NoActionBar">
    <item name="colorPrimary">@color/h5_blue</item>
    <item name="colorPrimaryVariant">@color/h5_blue_dark</item>
    <item name="colorOnPrimary">@color/h5_white</item>
    <item name="colorSecondary">@color/h5_blue_light</item>
    <item name="android:statusBarColor">@color/h5_blue</item>
</style>
```

---

## 🔧 ProGuard 规则

### 当前规则文件

| 模块 | 规则文件 | 完整性 |
|------|----------|--------|
| **app** | app/proguard-rules.pro | 基础 |
| **adapter-flame** | adapter-flame/proguard-rules.pro | 基础 |
| **base-flame-nebula** | base-flame-nebula/proguard-rules.pro | 部分 |
| **base-data-cache** | base-data-cache/proguard-rules.pro | 基础 |
| **encrypt** | encrypt/proguard-rules.pro | 基础 |

### 关键规则

```proguard
# FastJSON
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.alibaba.fastjson.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule

# SQLCipher
-keep class net.sqlcipher.** { *; }
-keep class net.sqlcipher.database.** { *; }

# H5 API 保留
-keep class com.ynetpay.mobile.h5container.api.** { *; }
-keep class com.ynetpay.mobile.h5container.service.** { *; }
-keep class com.ynetpay.mobile.nebula.config.** { *; }
```

---

## 🧵 线程与并发

### 当前并发模式

| 模式 | 使用频率 | 问题 |
|------|----------|------|
| **Thread/Runnable** | 1634 处 | ❌ 线程管理混乱 |
| **Handler** | 大量 | 需要手动管理 |
| **AsyncTask** | 0 处 | ✅ 已避免 |
| **RxJava** | 16 处 | ⚠️ 可用协程替代 |
| **synchronized** | 97 文件 | ⚠️ 过度使用 |

### 常见反模式

```java
// ❌ 反模式: 直接创建 Thread
new Thread(new Runnable() {
    @Override
    public void run() {
        // 网络请求
        loadData();
    }
}).start();

// ✅ 建议: 使用线程池
H5ThreadPoolFactory.getIoThreadExecutor().execute(() -> {
    loadData();
});

// ✅ 最佳: Kotlin 协程
viewModelScope.launch(Dispatchers.IO) {
    loadData()
}
```

---

## 📱 组件生命周期

### Application 配置

```java
// app/src/main/java/com/stht/coral/HtApplication.java
public class HtApplication extends Application {
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        // 初始化 H5 容器
        initH5Container();
        
        // 初始化日志
        initLogger();
        
        // 初始化安全
        initSecurity();
    }
    
    private void initH5Container() {
        // H5 容器初始化
        Nebula.init(this);
    }
    
    private void initLogger() {
        // 日志框架初始化
        YLog.init(this);
    }
    
    private void initSecurity() {
        // 安全组件初始化
        SecurityUtil.init(this);
    }
}
```

---

## 🌐 网络配置

### API 基础配置

```xml
<meta-data
    android:name="Flame_Rpc_Base_Url"
    android:value="https://www.ibanking.chbank.com:8888/api" />

<meta-data
    android:name="Flame_Rpc_IsEncrypt"
    android:value="off" />

<meta-data
    android:name="Flame_channel"
    android:value="20240000" />

<meta-data
    android:name="Flame_Check_Zip_Url"
    android:value="https://www.ibanking.chbank.com:8888/nibs/flame/cheetah/DA10010.do" />
```

---

## 🔐 权限配置

### AndroidManifest 权限

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<!-- 其他权限按需添加 -->
```

### 动态权限

```java
// 运行时请求权限
private void requestLocationPermission() {
    if (ContextCompat.checkSelfPermission(this, 
            Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
        
        ActivityCompat.requestPermissions(this,
            new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
            REQUEST_LOCATION_CODE);
    }
}
```

---

## 📊 工程实践问题

### 需要改进的配置

| 问题 | 影响 | 建议 |
|------|------|------|
| **测试 keystore** | 安全风险 | 更换正式签名 |
| **弱密码** | 安全风险 | 使用强密码 |
| **HTTP 明文** | 安全风险 | 强制 HTTPS |
| **并行构建关闭** | 构建速度 | 启用并行 |
| **缺少代码混淆** | 安全风险 | 完善 ProGuard |

### 推荐改进

```properties
# gradle.properties 改进
org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
android.enableR8.fullMode=true
```

```groovy
# build.gradle 改进
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        
        // 代码签名 (使用环境变量)
        signingConfig signingConfigs.release
    }
}
```

---

## ✅ 检查清单

### 构建配置

- [ ] 使用正式签名证书
- [ ] 启用 Gradle 构建缓存
- [ ] 开启并行构建
- [ ] 配置代码混淆
- [ ] 启用资源压缩

### 安全配置

- [ ] 移除测试 keystore
- [ ] 使用强密码
- [ ] 启用 HTTPS 强制
- [ ] 配置 Certificate Pinning
- [ ] 添加 ProGuard 规则

### 性能配置

- [ ] 配置多线程构建
- [ ] 启用增量编译
- [ ] 优化依赖解析
- [ ] 配置 Dex 选项

---

*文档生成时间: 2026-02-05*
