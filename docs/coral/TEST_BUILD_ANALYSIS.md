# Coral Android 项目 - 测试与构建分析报告

## 🧪 测试覆盖分析

### 当前测试状态

| 测试类型 | 状态 | 覆盖范围 | 说明 |
|----------|------|----------|------|
| **单元测试** | ⚠️ 极少 | <5% | 仅示例代码 |
| **集成测试** | ⚠️ 极少 | <5% | 仅示例代码 |
| **UI 测试** | ❌ 无 | 0% | 未实现 |
| **性能测试** | ❌ 无 | 0% | 未实现 |
| **安全测试** | ❌ 无 | 0% | 未实现 |

---

## 📝 现有测试文件

### 单元测试示例

```java
// adapter-flame/src/test/java/.../ExampleUnitTest.java
public class ExampleUnitTest {
    @Test
    public void addition_isCorrect() {
        assertEquals(4, 2 + 2);
    }
}
```

**问题**: 仅包含最基本的测试示例，无实际业务测试。

### 集成测试示例

```java
// adapter-flame/src/androidTest/java/.../ExampleInstrumentedTest.java
public class ExampleInstrumentedTest {
    @Test
    public void useAppContext() {
        // Context of the app under test.
    }
}
```

**问题**: 空测试，无实际验证逻辑。

---

## 🎯 测试缺口分析

### 高优先级测试需求

| 模块 | 测试类型 | 关键测试点 |
|------|----------|-----------|
| **H5Bridge** | 单元测试 | JS 桥接调用、数据传递 |
| **H5Plugin** | 单元测试 | 插件注册、方法调用 |
| **H5Cache** | 单元测试 | 缓存读写、过期策略 |
| **H5WebView** | 集成测试 | 页面加载、生命周期 |
| **H5Session** | 集成测试 | Session 管理、页面栈 |

### 测试用例建议

#### 1. H5Bridge 测试

```java
// H5BridgeTest.java
public class H5BridgeTest {
    
    @Test
    public void testRegisterMethod() {
        H5Bridge bridge = new H5BridgeImpl();
        bridge.register("testMethod", (params, context) -> {
            return new H5Result(0, "success");
        });
        
        assertTrue(bridge.hasMethod("testMethod"));
    }
    
    @Test
    public void testCallNative() {
        H5Bridge bridge = new H5BridgeImpl();
        
        JSONObject params = new JSONObject();
        params.put("key", "value");
        
        CountDownLatch latch = new CountDownLatch(1);
        final H5Result[] result = new H5Result[1];
        
        bridge.callNative("testMethod", params, new H5BridgeContext() {
            @Override
            public void send(JSONObject data) {
                result[0] = new H5Result(0, "ok");
                latch.countDown();
            }
        });
        
        latch.await(5, TimeUnit.SECONDS);
        assertNotNull(result[0]);
        assertEquals(0, result[0].getCode());
    }
}
```

#### 2. H5Plugin 测试

```java
// H5PluginTest.java
public class H5PluginTest {
    
    @Test
    public void testPluginLifecycle() {
        H5UIPlugin plugin = new H5UIPlugin();
        
        // Test init
        H5Page mockPage = mock(H5Page.class);
        plugin.init(mockPage, new JSONObject());
        
        verify(mockPage, times(1)).registerPlugin(plugin);
        
        // Test destroy
        plugin.onDestroy();
        
        // Verify resources released
        assertNull(plugin.getPage());
    }
    
    @Test
    public void testHandleAction() {
        H5UIPlugin plugin = new H5UIPlugin();
        
        JSONObject params = new JSONObject();
        params.put("title", "Test Title");
        
        H5BridgeContext context = mock(H5BridgeContext.class);
        
        boolean result = plugin.handle("setTitle", params, context);
        
        assertTrue(result);
        verify(context).send(argThat(data -> 
            data.getString("title").equals("Test Title")));
    }
}
```

#### 3. H5Cache 测试

```java
// H5CacheTest.java
public class H5CacheTest {
    
    @Test
    public void testCachePutAndGet() {
        FileCache cache = new FileCache(RuntimeEnvironment.application, "testApp");
        
        String key = "https://example.com/page";
        String value = "cached content";
        
        cache.put(key, value);
        
        String retrieved = cache.get(key);
        assertEquals(value, retrieved);
    }
    
    @Test
    public void testCacheExpiration() {
        FileCache cache = new FileCache(RuntimeEnvironment.application, "testApp");
        
        // Put expired cache
        String key = "https://example.com/expired";
        String value = "old content";
        cache.put(key, value, System.currentTimeMillis() - 10000); // Expired
        
        // Should return null
        String retrieved = cache.get(key);
        assertNull(retrieved);
    }
    
    @Test
    public void testCacheClear() {
        FileCache cache = new FileCache(RuntimeEnvironment.application, "testApp");
        
        cache.put("key1", "value1");
        cache.put("key2", "value2");
        
        cache.clear();
        
        assertNull(cache.get("key1"));
        assertNull(cache.get("key2"));
    }
}
```

#### 4. H5WebView 测试

```java
// H5WebViewTest.java
@RunWith(MockitoJUnitRunner.class)
public class H5WebViewTest {
    
    @Mock
    private Activity mockActivity;
    @Mock
    private H5Page mockPage;
    
    @Before
    public void setup() {
        when(mockPage.getParams()).thenReturn(new Bundle());
    }
    
    @Test
    public void testWebViewCreation() {
        Bundle params = new Bundle();
        H5WebView webView = new H5WebView(mockActivity, mockPage, params);
        
        assertNotNull(webView);
        assertNotNull(webView.getWebView());
    }
    
    @Test
    public void testLoadUrl() {
        H5WebView webView = new H5WebView(mockActivity, mockPage, new Bundle());
        
        webView.loadUrl("https://example.com");
        
        verify(webView.getWebView()).loadUrl("https://example.com");
    }
    
    @Test
    public void testPageLifecycle() {
        H5WebView webView = new H5WebView(mockActivity, mockPage, new Bundle());
        
        // Test onResume
        webView.onResume();
        verify(webView.getWebView()).onResume();
        
        // Test onPause
        webView.onPause();
        verify(webView.getWebView()).onPause();
        
        // Test onDestroy
        webView.onDestroy();
        verify(webView.getWebView()).destroy();
    }
}
```

---

## 🏗️ 构建配置分析

### ProGuard 规则

#### 当前状态

| 模块 | ProGuard 规则 | 完整性 |
|------|---------------|--------|
| **app** | proguard-rules.pro | ⚠️ 基础 |
| **adapter-flame** | proguard-rules.pro | ⚠️ 基础 |
| **base-flame-nebula** | proguard-rules.pro | ⚠️ 部分 |
| **base-data-cache** | proguard-rules.pro | ⚠️ 基础 |
| **encrypt** | proguard-rules.pro | ⚠️ 基础 |

#### 关键 ProGuard 规则

```proguard
# 保留 H5 API
-keep class com.ynetpay.mobile.h5container.api.** { *; }
-keep class com.ynetpay.mobile.h5container.service.** { *; }

# 保留 H5 插件
-keep class * extends com.ynetpay.mobile.h5container.api.H5Plugin { *; }

# 保留 Nebula 配置
-keep class com.ynetpay.mobile.nebula.config.** { *; }

# 保留 Provider
-keep class com.ynetpay.mobile.nebula.provider.** { *; }

# 保留枚举
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# FastJSON
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.alibaba.fastjson.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { *; }

# SQLCipher
-keep class net.sqlcipher.** { *; }
-keep class net.sqlcipher.database.** { *; }
```

### 构建变体

#### Product Flavors

```groovy
flavorDimensions 'htDim'

productFlavors {
    dev {
        dimension 'htDim'
        applicationId 'com.ht.mbank.test'
        versionCode 1
        versionName '1.0'
    }
    
    prd {
        dimension 'htDim'
        applicationId 'com.ht.mbank.prd'
        versionCode 1
        versionName '1.0'
    }
}
```

#### Build Types

```groovy
buildTypes {
    debug {
        minifyEnabled false
        debuggable true
        applicationIdSuffix '.debug'
        versionNameSuffix '-debug'
    }
    
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        signingConfig signingConfigs.release
    }
}
```

---

## 🔄 CI/CD 现状

### 当前状态

| 环节 | 工具 | 状态 |
|------|------|------|
| **版本控制** | Git | ✅ 使用 |
| **代码检查** | Android Lint | ⚠️ 未配置 |
| **单元测试** | JUnit | ⚠️ 未使用 |
| **集成测试** | Espresso | ❌ 未实现 |
| **构建** | Gradle | ✅ 使用 |
| **发布** | 手动 | ❌ 未配置 |

### 建议 CI/CD 流程

```yaml
# .github/workflows/android.yml
name: Android CI

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up JDK
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        
    - name: Build with Gradle
      run: ./gradlew build
      
    - name: Run Unit Tests
      run: ./gradlew test
      
    - name: Run Lint
      run: ./gradlew lint
      
    - name: Generate Coverage
      run: ./gradlew jacocoTestReport
      
    - name: Upload APK
      uses: actions/upload-artifact@v2
      with:
        name: app-debug
        path: app/build/outputs/apk/debug/
```

---

## 📊 构建性能

### 构建时间

| 构建任务 | 首次构建 | 增量构建 |
|----------|----------|----------|
| assembleDebug | ~3-5 min | ~1-2 min |
| assembleRelease | ~5-8 min | ~2-3 min |
| lint | ~2-3 min | ~30s |
| test | ~1-2 min | ~30s |

### 优化建议

- [ ] **构建缓存**: 启用 Gradle 构建缓存
- [ ] **并行构建**: 配置 parallel execution
- [ ] **Dex 合并**: 启用 D8/R8
- [ ] **资源优化**: 移除未使用资源

---

## ✅ 测试改进建议

### P0 - 紧急

- [ ] **补充单元测试**: 核心工具类、缓存
- [ ] **配置 Lint**: 代码规范检查
- [ ] **添加 CI**: GitHub Actions 集成

### P1 - 高优

- [ ] **集成测试**: WebView、Plugin 测试
- [ ] **覆盖率报告**: JaCoCo 集成
- [ ] **UI 测试**: Espresso 编写

### P2 - 中优

- [ ] **性能测试**: 页面加载、内存
- [ ] **安全测试**: 渗透测试
- [ ] **E2E 测试**: 自动化 UI 测试

---

*文档生成时间: 2026-02-05*
