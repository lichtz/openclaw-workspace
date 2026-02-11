# Coral Android 项目 - API 接口详细分析

## 📡 核心服务接口 (H5Service)

### 接口概述

`H5Service` 是 H5 容器的核心服务抽象类，继承自 `ExternalService`，提供页面管理、插件管理、Provider 管理等核心功能。

### 主要方法分类

#### 1. 页面管理 (Page Management)

```java
// 创建页面
public abstract H5Page createPage(Activity activity, H5Bundle h5Bundle);
public abstract void createPageAsync(Activity activity, H5Bundle h5Bundle, 
                                      H5PageReadyListener h5PageReadyListener);

// 启动页面
public abstract void startPage(MicroApplication application, H5Bundle h5Bundle);
public abstract void startPageFromActivity(Activity activity, H5Bundle h5Bundle);

// 获取页面
public abstract H5Page getTopH5Page();
public abstract H5BaseFragment getTopH5BaseFragment();
public abstract Fragment getTopH5Fragment();
```

#### 2. Session 管理

```java
public abstract H5Session getTopSession();
public abstract H5Session getSessionByWorkerId(String param);
public abstract Stack<H5Session> getSessions();
```

#### 3. 插件管理

```java
public abstract H5PluginManager getPluginManager();
public abstract void addPluginConfig(H5PluginConfig h5PluginConfig);
public abstract void addH5PluginConfigList(List<H5PluginConfig> plist);
public abstract H5Plugin createPlugin(String param, H5Page h5Page, 
                                       H5PluginManager h5PluginManager);
```

#### 4. Provider 管理

```java
public abstract H5ProviderManager getProviderManager();
public abstract boolean isAliDomain(String param);
public abstract boolean permitLocation(String param);
```

#### 5. 数据共享

```java
public abstract void setSharedData(String param1, String param2);
public abstract String getSharedData(String param);
public abstract void removeSharedData(String param);
```

#### 6. 事件系统

```java
public abstract boolean sendEvent(H5Event h5Event);
public abstract boolean sendEvent(H5Event h5Event, H5BridgeContext h5BridgeContext);
```

#### 7. 应用管理

```java
public abstract void prepareApp(String param1, String param2, 
                                H5AppInstallProcess installProcess);
public abstract NebulaAppManager getNebulaAppManager();
public abstract NebulaCommonManager getNebulaCommonManager();
```

#### 8. Service Worker

```java
public abstract void sendServiceWorkerPushMessage(HashMap<String, String> hashMap);
public abstract void sendServiceWorkerPushMessage(HashMap<String, String> hashMap, 
                                                  H5CallBack h5CallBack);
public abstract void clearServiceWorker(String param);
```

---

## 🔷 Session 接口 (H5Session)

### 接口定义

```java
public abstract interface H5Session extends H5CoreNode {
    
    // 标识管理
    public abstract String getId();
    public abstract void setId(String param);
    
    // 页面管理
    public abstract boolean addPage(H5Page h5Page);
    public abstract boolean removePage(H5Page h5Page);
    public abstract H5Page getTopPage();
    public abstract Stack<H5Page> getPages();
    
    // 场景管理
    public abstract H5Scenario getScenario();
    public abstract void setScenario(H5Scenario h5Scenario);
    
    // 参数传递
    public abstract Bundle getParams();
    
    // 监听器管理
    public abstract void addListener(H5Listener h5Listener);
    public abstract void removeListener(H5Listener h5Listener);
    public abstract void removeAllListener();
    
    // Provider
    public abstract H5ContentProvider getWebProvider();
    
    // Service Worker
    public abstract void setServiceWorkerID(String param);
    public abstract String getServiceWorkerID();
    
    // 生命周期
    public abstract boolean exitSession();
}
```

---

## 📄 Page 接口 (H5Page)

### 核心方法

```java
public abstract interface H5Page extends H5CoreNode {
    
    // 标识
    public abstract String getPageId();
    public abstract String getUrl();
    
    // 状态
    public abstract int getState();
    public abstract boolean isLoading();
    public abstract boolean isLoaded();
    
    // 导航
    public abstract void loadUrl(String url);
    public abstract void loadUrl(String url, Map<String, String> additionalHttpHeaders);
    public abstract void reload();
    public abstract void goBack();
    public abstract void goForward();
    
    // WebView
    public abstract WebView getWebView();
    public abstract void setWebView(WebView webView);
    
    // 生命周期
    public abstract void onCreate(Bundle bundle);
    public abstract void onStart();
    public abstract void onResume();
    public abstract void onPause();
    public abstract void onStop();
    public abstract void onDestroy();
    
    // 参数
    public abstract Bundle getParams();
    public abstract void setParams(Bundle bundle);
    
    // 桥接
    public abstract void callJs(String js);
    public abstract void callJs(String js, H5CallBack callback);
    public abstract boolean sendEvent(H5Event event);
}
```

---

## 🌉 Bridge 接口 (H5Bridge)

### JS 调用 Native

```java
public abstract interface H5Bridge {
    
    // 注册桥接方法
    public abstract void register(String methodName, H5BridgeHandler handler);
    public abstract void unregister(String methodName);
    
    // 调用 Native
    public abstract void callNative(String method, JSONObject params, 
                                    H5BridgeContext context);
    public abstract void callNative(String method, JSONObject params);
    
    // 调用 JS
    public abstract void callJs(String bridgeId, String method, JSONObject params);
    public abstract void callJs(String method, JSONObject params);
    
    // 拦截器
    public abstract void addInterceptor(H5BridgeInterceptor interceptor);
    public abstract void removeInterceptor(H5BridgeInterceptor interceptor);
    
    // 回调
    public abstract void setCallback(H5BridgeCallback callback);
}
```

---

## 🔌 Plugin 接口 (H5Plugin)

### 插件接口

```java
public abstract interface H5Plugin {
    
    // 初始化
    public abstract void init(H5Page page, JSONObject params);
    
    // 执行
    public abstract boolean handle(String action, JSONObject params, 
                                  H5BridgeContext context);
    
    // 生命周期
    public abstract void onCreate();
    public abstract void onDestroy();
    public abstract void onResume();
    public abstract void onPause();
    
    // 权限
    public abstract Set<String> getPermissions();
    public abstract boolean requirePermission(String permission);
}
```

### 内置插件列表

| 插件 | 类名 | 功能 |
|------|------|------|
| **UI插件** | H5UIPlugin | 页面UI操作 |
| **导航插件** | H5NavigatorPlugin | 页面导航 |
| **存储插件** | H5StoragePlugin | 本地存储 |
| **位置插件** | H5LocationPlugin | 地理位置 |
| **分享插件** | H5SharePlugin | 社交分享 |
| **加载插件** | H5LoadingPlugin | 加载动画 |
| **截图插件** | H5SnapshotPlugin | 页面截图 |
| **网络插件** | H5NetworkAnalysisPlugin | 网络分析 |
| **安全插件** | H5SecurePlugin | 安全检查 |
| **APK插件** | H5ApkLoadPlugin | APK安装 |
| **嵌入视图插件** | H5EmbedViewPlugin | 嵌入Native视图 |

---

## 🏢 Provider 接口 (H5Provider)

### Provider 接口

```java
public abstract interface H5Provider {
    
    // 初始化
    public abstract void init(Context context);
    
    // 配置
    public abstract String getName();
    public abstract int getPriority();
    
    // 提供数据
    public abstract Object provide(Context context, String action, Bundle data);
    
    // 生命周期
    public abstract void onCreate();
    public abstract void onDestroy();
}
```

### 内置 Provider 列表

| Provider | 类名 | 功能 |
|----------|------|------|
| **自动登录** | H5AutoLoginProvider | 自动登录 |
| **预连接** | H5PreConnectProvider | 预连接 |
| **嵌入视图** | H5EmbededViewProvider | 嵌入视图 |
| **资源替换** | H5ReplaceResourceProvider | 资源替换 |

---

## 📱 JS API 列表

### 常用 JS 方法

```javascript
// 页面导航
HybridAPI.navigateTo({ url: 'https://...' })
HybridAPI.navigateBack()

// 标题栏
HybridAPI.setTitle({ title: '标题' })
HybridAPI.setNavigationBarStyle({ style: 'light' })

// 分享
HybridAPI.share({
  type: 'link',
  url: 'https://...',
  title: '分享标题',
  content: '分享内容'
})

// 地理位置
HybridAPI.getLocation({ success: (res) => {} })

// 二维码
HybridAPI.scanQRCode({ success: (res) => {} })

// 图片
HybridAPI.chooseImage({ source: 'album' })
HybridAPI.previewImage({ urls: [...] })

// 支付
HybridAPI.requestPayment({ orderId: '...' })

// 小程序
HybridAPI.navigateToMiniProgram({ appId: '...' })

// 存储
HybridAPI.setStorage({ key: 'data', value: '...' })
HybridAPI.getStorage({ key: 'data' })

// 网络状态
HybridAPI.getNetworkType({ success: (res) => {} })

// 剪贴板
HybridAPI.setClipboard({ text: '...' })
HybridAPI.getClipboard({ success: (res) => {} })

// 设备信息
HybridAPI.getSystemInfo({ success: (res) => {} })

// 振动
HybridAPI.vibrate({ type: 'short' })

// Toast
HybridAPI.showToast({ message: '提示' })
HybridAPI.showLoading({ message: '加载中...' })
HybridAPI.hideLoading()
```

---

## 🔧 配置接口

### H5PluginConfig

```java
public class H5PluginConfig {
    private String name;           // 插件名称
    private String className;      // 插件类全限定名
    private int priority;          // 优先级
    private boolean enable;        // 是否启用
    private Bundle params;         // 初始参数
    private Set<String> actions;   // 处理的 action 列表
}
```

### H5EmbedViewConfig

```java
public class H5EmbedViewConfig {
    private String viewId;        // 视图ID
    private String viewClass;      // 视图类
    private Bundle params;         // 初始参数
    private int position;         // 位置
}
```

---

## 📊 回调接口

### H5CallBack

```java
public abstract interface H5CallBack {
    public abstract void call(H5Result result);
}

public class H5Result {
    private int code;             // 状态码
    private String message;       // 消息
    private JSONObject data;      // 数据
    private String error;         // 错误信息
    
    public static final int SUCCESS = 0;
    public static final int FAIL = -1;
    public static final int CANCEL = 1;
}
```

### H5BridgeContext

```java
public abstract interface H5BridgeContext {
    public abstract void send(JSONObject data);
    public abstract void send(JSONObject data, H5CallBack callback);
    public abstract void end();
    public abstract void error(String message);
    public abstract H5Page getPage();
    public abstract Activity getActivity();
}
```

---

## 📋 Bundle 参数约定

### 启动参数 (H5Bundle)

| 参数 | 类型 | 说明 |
|------|------|------|
| url | String | 页面URL |
| appId | String | 应用ID |
| bizType | String | 业务类型 |
| params | Bundle | 扩展参数 |
| isPrerender | boolean | 是否预渲染 |
| transparent | boolean | 是否透明 |
| backgroundColor | int | 背景色 |
| titleBarStyle | String | 标题栏样式 |

---

*文档生成时间: 2026-02-05*
