# Coral Android - 辅助模块类关系深度分析

## 📊 辅助模块概览

| 模块 | 类数量 | 主要职责 |
|------|--------|----------|
| **util** | 50+ | 工具类 |
| **callback** | 10+ | 回调类 |
| **socket** | 5+ | 通信套接字 |
| **manager** | 10+ | 管理器 |
| **provider** | 20+ | 提供者 |
| **view** | 20+ | 视图组件 |

---

## 🔧 util 工具类模块

### 工具类列表

| 类名 | 职责 | 依赖 |
|------|------|------|
| **H5Utils** | 通用工具（1500+行） | Context, Bundle, JSON |
| **H5FileUtil** | 文件操作 | File, IO |
| **H5SecurityUtil** | 安全工具 | MD5, SHA1 |
| **H5UrlHelper** | URL 处理 | URI, URL |
| **H5ZipUtil** | ZIP 压缩 | ZipFile |
| **H5IOUtils** | IO 操作 | InputStream, OutputStream |
| **H5NetworkUtil** | 网络工具 | ConnectivityManager |
| **H5ImageUtil** | 图片处理 | Bitmap |
| **H5Base64** | Base64 编码 | Base64 |
| **H5RsaUtil** | RSA 加密 | Cipher |
| **H5StatusBarUtils** | 状态栏 | WindowManager |
| **H5SchemeWhiteList** | Scheme 白名单 | Set<String> |
| **H5ParamParser** | 参数解析 | JSON |
| **H5PatternHelper** | 正则匹配 | Pattern |
| **H5DeviceHelper** | 设备信息 | TelephonyManager |

---

## 🔗 工具类核心依赖关系

### H5Utils 核心方法

```java
public class H5Utils {
    
    // ==================== 上下文相关 ====================
    
    // 获取 Context
    public static Context getContext() { ... }
    
    // 获取 Activity
    public static Activity getActivity() { ... }
    
    // 获取 Application
    public static Application getApp() { ... }
    
    // ==================== Bundle 相关 ====================
    
    // 获取 String
    public static String getString(Bundle bundle, String key) { ... }
    
    // 获取 Int
    public static int getInt(Bundle bundle, String key) { ... }
    
    // 获取 Boolean
    public static boolean getBoolean(Bundle bundle, String key) { ... }
    
    // 获取 JSONObject
    public static JSONObject getJSONObject(Bundle bundle, String key) { ... }
    
    // ==================== JSON 相关 ====================
    
    // 解析 JSON
    public static JSONObject parseObject(String text) { ... }
    
    public static JSONArray parseArray(String text) { ... }
    
    // JSON 转 Bundle
    public static Bundle fromJson(JSONObject json) { ... }
    
    // Bundle 转 JSON
    public static JSONObject toJson(Bundle bundle) { ... }
    
    // ==================== 线程相关 ====================
    
    // 主线程执行
    public static void runOnMain(Runnable action) { ... }
    
    // 延迟执行
    public static void runOnMainDelayed(Runnable action, long delayMs) { ... }
    
    // IO 线程执行
    public static void runOnIO(Runnable action) { ... }
    
    // ==================== 网络相关 ====================
    
    // 获取网络类型
    public static String getNetworkType() { ... }
    
    // 是否 WiFi
    public static boolean isWifi() { ... }
    
    // 是否连接
    public static boolean isNetworkAvailable() { ... }
    
    // ==================== 设备相关 ====================
    
    // 获取设备 ID
    public static String getDeviceId() { ... }
    
    // 获取屏幕宽高
    public static int getScreenWidth() { ... }
    public static int getScreenHeight() { ... }
    
    // 获取状态栏高度
    public static int getStatusBarHeight() { ... }
    
    // ==================== 文件相关 ====================
    
    // 获取缓存目录
    public static File getCacheDir() { ... }
    
    // 获取文件大小
    public static long getFileSize(File file) { ... }
    
    // 删除文件
    public static boolean deleteFile(String path) { ... }
    
    // ==================== 安全相关 ====================
    
    // URL 安全校验
    public static boolean isUrlSafe(String url) { ... }
    
    // 参数脱敏
    public static String maskSensitive(String data) { ... }
}
```

### H5Utils 依赖图

```
H5Utils (核心工具类)
    │
    ├── Context 相关
    │   ├── getContext() → Application Context
    │   ├── getActivity() → 当前 Activity
    │   └── getApp() → Application
    │
    ├── Bundle 相关
    │   ├── getString() → String
    │   ├── getInt() → int
    │   ├── getBoolean() → boolean
    │   └── getJSONObject() → JSONObject
    │
    ├── JSON 相关
    │   ├── parseObject() → JSONObject
    │   ├── parseArray() → JSONArray
    │   ├── fromJson() → Bundle
    │   └── toJson() → JSONObject
    │
    ├── 线程相关
    │   ├── runOnMain() → Handler
    │   ├── runOnMainDelayed() → Handler.postDelayed()
    │   └── runOnIO() → Executor
    │
    ├── 网络相关
    │   ├── getNetworkType() → ConnectivityManager
    │   ├── isWifi() → NetworkInfo
    │   └── isNetworkAvailable() → NetworkInfo
    │
    ├── 设备相关
    │   ├── getDeviceId() → TelephonyManager
    │   ├── getScreenWidth() → DisplayMetrics
    │   └── getStatusBarHeight() → Resources
    │
    └── 文件相关
        ├── getCacheDir() → Context.getCacheDir()
        ├── getFileSize() → File.length()
        └── deleteFile() → File.delete()
```

---

## 📞 callback 回调模块

### 回调类列表

| 类名 | 职责 | 实现接口 |
|------|------|----------|
| **H5CallBack** | 基础回调接口 | 接口 |
| **H5ShareCallback** | 分享回调 | H5CallBack, Runnable |
| **H5OnShareCallback** | 分享回调 | 接口 |
| **H5RequestListener** | 请求监听 | 接口 |
| **H5SimpleRpcListener** | RPC 监听 | 接口 |
| **H5AppInstallProcess** | 应用安装进度 | 接口 |
| **H5478Listener** | 47.8 特殊监听 | 接口 |
| **H5InputOperator** | 输入操作 | 接口 |

### 回调类继承关系

```
H5CallBack (接口)
    │
    └── 实现类
        ├── H5ShareCallback ⭐ (分享回调)
        │       │
        │       ├── 实现 H5CallBack, Runnable
        │       ├── 持有 H5Page
        │       ├── 持有 ShareResult
        │       └── 超时处理 (1s)
        │
        ├── H5OnShareCallback (分享回调)
        │       │
        │       └── void onShareComplete(ShareResult result)
        │
        └── H5RequestListener (请求监听)
                │
                ├── void onStart()
                ├── void onProgress(int progress)
                ├── void onSuccess(T result)
                └── void onError(String error)
```

### H5ShareCallback 详细分析

```java
public class H5ShareCallback implements H5CallBack, Runnable {
    
    // 常量
    public static int TIMEOUT = 1000;  // 超时 1 秒
    
    // 依赖
    private H5Page h5Page;
    private ShareResult shareResult;
    private boolean shareCallBack;
    
    // 构造函数
    public H5ShareCallback(H5Page h5Page, ShareResult shareResult) {
        this.h5Page = h5Page;
        this.shareResult = shareResult;
        this.shareCallBack = false;
        
        // 启动超时计时器
        H5Utils.runOnMain(this, TIMEOUT);
    }
    
    // 回调处理
    public void onCallBack(JSONObject result) {
        if (this.shareCallBack) {
            return;  // 防止重复回调
        }
        this.shareCallBack = true;
        
        if (this.h5Page == null) {
            return;
        }
        
        if (result == null) {
            // 默认分享信息
            JSONObject defaultResult = new JSONObject();
            defaultResult.put("imgUrl", "");
            defaultResult.put("desc", h5Page.getShareUrl());
            defaultResult.put("title", h5Page.getTitle());
            this.shareResult.shareResult(defaultResult);
        } else {
            this.shareResult.shareResult(result);
        }
    }
    
    // 超时处理
    public void run() {
        if (this.shareCallBack) {
            return;
        }
        // 超时则使用默认值
        this.onCallBack(null);
    }
}
```

---

## 🔌 socket 通信模块

### Socket 类列表

| 类名 | 类型 | 职责 |
|------|------|------|
| **CustomSocket** | 抽象类 | 自定义 Socket 基类 |
| **AuthorizationSocket** | 抽象类 | 授权 Socket |
| **CacheSocket** | 抽象类 | 缓存 Socket |
| **EventSocket** | 抽象类 | 事件 Socket |
| **ConsoleSocket** | 抽象类 | 控制台 Socket |

### Socket 继承体系

```
Socket (抽象基类)
    │
    ├── CustomSocket
    │       │
    │       └── JS Interface
    │           └── init(modules, webView, page)
    │           └── getSocketName()
    │
    ├── AuthorizationSocket
    │       │
    │       └── 授权认证相关
    │           └── call(data) → 解析并调用授权方法
    │
    ├── CacheSocket
    │       │
    │       └── 缓存相关
    │           └── call(data) → 解析并调用缓存方法
    │
    ├── EventSocket
    │       │
    │       └── 事件相关
    │           └── call(data) → 解析并调用事件方法
    │
    └── ConsoleSocket
            │
            └── 控制台相关
                └── call(data) → 解析并调用控制台方法
```

### Socket 核心实现

```java
public abstract class CacheSocket {
    
    // 参数
    protected H5BridgeParam param;
    
    // 回调 Map
    protected Map<String, CallBackFunction> responseCallbacks = 
        new HashMap<>();
    
    // Socket 名称
    public abstract String getBridgeName();
    
    // JS 调用入口
    @JavascriptInterface
    public void call(String data) {
        // 1. 解析数据
        JSONObject json = JSON.parseObject(data);
        param.setMethod(json.getString("method"));
        param.setParam(json.getJSONObject("param"));
        param.setCallback(json.getString("callback"));
        
        // 2. 保存回调
        putCallBackFun(param.getCallback());
        
        try {
            // 3. 反射调用方法
            Method method = getClass().getMethod(
                param.getMethod(), 
                JSONObject.class, 
                CallBackFunction.class
            );
            method.setAccessible(true);
            method.invoke(this, 
                param.getParam(), 
                responseCallbacks.get(param.getCallback())
            );
        } catch (Exception e) {
            Log.e("CacheSocket", "invoke failed", e);
        }
    }
    
    // 回调函数管理
    protected void putCallBackFun(String key) {
        // 注册回调
    }
}
```

---

## 🔧 module 模块继承

### Module 类列表

| 类名 | 继承 | 职责 |
|------|------|------|
| **ConsoleModule** | ConsoleSocket | 控制台模块 |
| **EventModule** | EventSocket | 事件模块 |
| **CacheModule** | CacheSocket | 缓存模块 |
| **AuthorizationModule** | AuthorizationSocket | 授权模块 |

### Module 实现关系

```
Module 实现类
    │
    ├── ConsoleModule (extends ConsoleSocket)
    │       │
    │       ├── void log(JSONObject message)
    │       ├── void error(JSONObject message)
    │       ├── void warn(JSONObject message)
    │       ├── void debug(JSONObject message)
    │       └── void info(JSONObject message)
    │
    ├── EventModule (extends EventSocket)
    │       │
    │       └── void trackEvent(JSONObject event)
    │
    ├── CacheModule (extends CacheSocket)
    │       │
    │       ├── void setStorage(JSONObject params)
    │       ├── void getStorage(JSONObject params)
    │       ├── void removeStorage(JSONObject params)
    │       └── void clearStorage(JSONObject params)
    │
    └── AuthorizationModule (extends AuthorizationSocket)
            │
            ├── void login(JSONObject params)
            ├── void logout(JSONObject params)
            └── void getAuthToken(JSONObject params)
```

---

## 👁️ view 视图模块

### 视图类列表

| 类名 | 类型 | 职责 |
|------|------|------|
| **H5TitleView** | 接口 | 标题栏 |
| **H5LoadingView** | 类 | 加载视图 |
| **H5WebLoadingView** | 类 | Web 加载视图 |
| **H5Progress** | 类 | 进度条 |
| **H5NavMenu** | 类 | 导航菜单 |
| **H5NavMenuItem** | 类 | 菜单项 |
| **H5TabbarLayout** | 类 | 标签栏布局 |
| **H5TabbarItem** | 类 | 标签项 |
| **H5ToolBarView** | 类 | 工具栏 |
| **H5ToolMenuView** | 类 | 工具菜单 |
| **H5BaseEmbedView** | 类 | 嵌入视图基类 |
| **H5WebContentView** | 接口 | Web 内容视图 |
| **ManagerToastLikeDialog** | 类 | Toast 对话框 |

### H5TitleView 接口方法

```java
public interface H5TitleView {
    
    // 标题文本
    String getTitle();
    void setTitle(String param);
    
    // 副标题
    void setSubTitle(String param);
    
    // 图片标题
    void setImgTitle(Bitmap bitmap);
    void setImgTitle(Bitmap bitmap, String param);
    
    // 按钮显示
    void showCloseButton(boolean flag);
    void showBackButton(boolean flag);
    void showOptionMenu(boolean flag);
    
    // 选项类型
    void setOptionType(H5Param.OptionType optionType);
    void setOptionType(H5Param.OptionType optionType, int iconRes, boolean showRedDot);
    
    // 视图获取
    View getContentView();
    TextView getMainTitleView();
    TextView getSubTitleView();
    View getDivider();
    View getHdividerInTitle();
    View getPopAnchor();
    
    // 状态
    void showTitleLoading(boolean flag);
    void resetTitleColor(int color);
    ColorDrawable getContentBgView();
    
    // 注入 H5Page
    void setH5Page(H5Page h5Page);
}
```

### View 组件关系

```
View 组件
    │
    ├── H5TitleView (接口)
    │       │
    │       ├── H5FlameTitleBar (实现)
    │       │       │
    │       │       ├── TextView mainTitle
    │       │       ├── TextView subTitle
    │       │       ├── ImageView backButton
    │       │       ├── ImageView closeButton
    │       │       └── View optionMenu
    │       │
    │       └── H5TitleViewWrapper (适配器)
    │               │
    │               └── 委托给实际实现
    │
    ├── H5LoadingView (类)
    │       │
    │       ├── RelativeLayout
    │       │       │
    │       │       └── TextView loadingText
    │       │
    │       ├── void show()
    │       ├── void hide()
    │       └── void setText(String text)
    │
    ├── H5Progress (类)
    │       │
    │       ├── ProgressBar
    │       ├── TextView progressText
    │       │
    │       ├── void setProgress(int percent)
    │       └── void setText(String text)
    │
    ├── H5NavMenu (类)
    │       │
    │       ├── PopupWindow
    │       ├── List<H5NavMenuItem> items
    │       │
    │       ├── void showMenu()
    │       ├── void hideMenu()
    │       └── void addItem(H5NavMenuItem item)
    │
    └── H5TabbarLayout (类)
            │
            ├── LinearLayout (水平)
            ├── List<H5TabbarItem> tabs
            │
            ├── void addTab(H5TabbarItem tab)
            ├── void selectTab(int index)
            └── void setBadge(int index, String badge)
```

---

## 👥 manager 管理器模块

### 管理器列表

| 类名 | 职责 | 单例 |
|------|------|------|
| **H5BridgeManager** | Bridge 管理 | ✅ |
| **PermissionManager** | 权限管理 | ✅ |
| **H5NebulaAppManager** | App 回调管理 | - |
| **H5PluginManagerImpl** | 插件管理 | ✅ |
| **H5ProviderManagerImpl** | Provider 管理 | ✅ |
| **H5NebulaCommonManager** | 通用管理 | - |

### Manager 核心实现

```java
// H5BridgeManager - Bridge 管理器
public class H5BridgeManager {
    private static H5BridgeManager instance;
    private List<String> bridges;  // Bridge 列表
    
    public static synchronized H5BridgeManager getInstance() {
        if (instance == null) {
            instance = new H5BridgeManager();
        }
        return instance;
    }
    
    public List<String> getBridges() {
        return bridges;
    }
    
    public void setBridges(List<String> bridges) {
        this.bridges = bridges;
    }
}

// PermissionManager - 权限管理器
public class PermissionManager {
    private static PermissionManager instance;
    private String loadUrl;
    private String token;
    private String methodName;
    private List<String> methodList = new ArrayList<>();
    private AuthorizationCallback authorizationCallback;
    
    public static synchronized PermissionManager getInstance() {
        if (instance == null) {
            instance = new PermissionManager();
        }
        return instance;
    }
    
    // 添加权限方法
    public void addMethod(String methodName) {
        if (methodList == null) {
            methodList = new ArrayList<>();
        }
        methodList.add(methodName);
    }
    
    // 权限校验
    public void authorizationCheck(Context context, String methodName, 
                                  AuthorizationCallback callback) {
        this.methodName = methodName;
        this.authorizationCallback = callback;
        // 执行授权检查
    }
    
    // 清理
    protected void clearAll() {
        methodList.clear();
    }
}
```

---

## 🏪 provider 提供者模块

### Provider 列表

| 类名 | 职责 | 单例 |
|------|------|------|
| **H5ConfigProvider** | 配置提供 | - |
| **H5LogProvider** | 日志提供 | - |
| **H5LoginProvider** | 登录提供 | - |
| **H5UrlDownloadProvider** | 下载提供 | - |
| **H5EmbededViewProvider** | 嵌入视图 | - |
| **H5AutoLoginProvider** | 自动登录 | - |
| **H5SchemeInterceptProvider** | Scheme 拦截 | - |
| **H5LottieViewProvider** | Lottie 动画 | - |
| **H5ThreadPoolProvider** | 线程池 | - |
| **H5TaskScheduleProvider** | 任务调度 | - |

### Provider 接口定义

```java
public interface H5Provider {
    
    // 初始化
    void init(Context context);
    
    // Provider 名称
    String getName();
    
    // 优先级
    int getPriority();
    
    // 提供服务
    Object provide(Context context, String action, Bundle data);
}

// 示例实现
public class H5LogProvider implements H5Provider {
    
    @Override
    public void init(Context context) {
        // 初始化日志
    }
    
    @Override
    public String getName() {
        return "H5LogProvider";
    }
    
    @Override
    public int getPriority() {
        return 0;
    }
    
    @Override
    public Object provide(Context context, String action, Bundle data) {
        switch (action) {
            case "log":
                return doLog(data);
            case "debug":
                return doDebug(data);
            case "error":
                return doError(data);
            default:
                return null;
        }
    }
}
```

---

## 📊 核心类协作关系

### 页面加载时的协作

```
H5PageImpl
    │
    ├── H5Utils (工具)
    │       ├── getContext() → Context
    │       ├── getString() → Bundle 解析
    │       └── runOnMain() → 线程切换
    │
    ├── H5BridgeManager (管理)
    │       ├── getBridges() → 获取 Bridge 列表
    │       └── setBridges() → 设置 Bridge
    │
    ├── H5ProviderManagerImpl (提供者)
    │       ├── getProvider(H5ConfigProvider.class)
    │       ├── getProvider(H5LogProvider.class)
    │       └── getProvider(H5LoginProvider.class)
    │
    └── H5PermissionManager (权限)
            ├── addMethod() → 添加权限方法
            └── authorizationCheck() → 权限校验
```

### JS 调用时的协作

```
JS: HybridAPI.callNative()
    │
    └── CustomSocket.call(data)
            │
            ├── JSON.parse(data) → 解析参数
            │
            ├── getMethod() → 获取方法名
            │
            ├── getParam() → 获取参数
            │
            ├── getCallback() → 获取回调 ID
            │
            ├── putCallBackFun() → 注册回调
            │
            └── getClass().getMethod() → 反射调用
                    │
                    └── Module 实现类
                        ├── ConsoleModule → 控制台
                        ├── EventModule → 事件
                        ├── CacheModule → 缓存
                        └── AuthorizationModule → 授权
```

---

## 🔗 完整依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                      核心层                                   │
│  H5PageImpl → H5BridgeImpl → H5Plugin                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      工具层                                   │
│  H5Utils → H5FileUtil → H5SecurityUtil → H5UrlHelper     │
│       ↓                                                   │
│  H5NetworkUtil → H5ImageUtil → H5IOUtils                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      管理器层                                 │
│  H5BridgeManager → PermissionManager → H5ProviderManager  │
│       ↓                                                     │
│  H5PluginManager → H5NebulaAppManager                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      提供者层                                 │
│  H5ConfigProvider → H5LogProvider → H5LoginProvider       │
│       ↓                                                     │
│  H5UrlDownloadProvider → H5EmbededViewProvider             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      回调层                                    │
│  H5CallBack → H5ShareCallback → H5RequestListener         │
│       ↓                                                     │
│  H5SimpleRpcListener → H5478Listener                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      视图层                                    │
│  H5TitleView → H5LoadingView → H5Progress                 │
│       ↓                                                     │
│  H5NavMenu → H5TabbarLayout → H5ToolBarView               │
└─────────────────────────────────────────────────────────────┘
```

---

*文档生成时间: 2026-02-05*
*模块: util/callback/socket/view/manager/provider*
*类数量: 100+*
