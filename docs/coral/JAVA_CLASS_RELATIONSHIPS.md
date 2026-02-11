# Coral Android - Java 类关系深度分析

## 📊 继承体系全景图

### 1. 页面核心继承链

```
Object
    │
    └── H5CoreNode (接口)
            │
            ├── H5BaseNebulaService
            │       │
            │       └── H5BasePage ──┬── implements H5Page (接口)
            │                         └── implements APWebView (接口)
            │
            └── H5Page (接口) ─── 实现类 ── H5PageImpl (nebulacore.core)
                                       │
                                       └── 组合关系
                                            ├── H5WebView
                                            ├── H5BridgeImpl
                                            ├── H5SessionImpl
                                            └── List<H5Plugin>
```

### 2. Activity/Fragment 继承链

```
Fragment (Android)
    │
    └── H5BaseFragment (h5container.api)
            │
            └── H5Fragment (nebulacore.ui)
                    │
                    └── 持有 H5Page
                            │
                            ├── H5PageImpl
                            │       │
                            │       ├── H5WebView
                            │       ├── H5BridgeImpl
                            │       └── List<H5Plugin>
                            │
                            └── H5BasePage (basebridge)
```

### 3. WebView 封装继承链

```
APWebView (接口)
    │
    ├── AndroidWebView ── 包装 ── H5WebView (持有)
    ├── UCWebView ─────── 包装 ── H5WebView (持有)
    └── XWebView ──────── 包装 ── H5WebView (持有)
```

### 4. Bridge 继承链

```
H5Bridge (接口)
    │
    └── H5BridgeImpl (nebulacore.bridge)
            │
            ├── 组合 H5WebView
            ├── 组合 H5Page
            ├── 持有 Map<String, H5CallBack>
            └── 管理 H5Plugin
```

### 5. Plugin 继承链

```
H5Plugin (接口)
    │
    ├── H5SimplePlugin (抽象类) ── implements H5Plugin
    │       │
    │       └── H5PagePlugin (页面插件)
    │       │       │
    │       │       └── 持有 H5WebView, H5Bridge
    │       │
    │       ├── H5UIPlugin (UI插件)
    │       ├── H5NavigatorPlugin (导航插件)
    │       ├── H5StoragePlugin (存储插件)
    │       ├── H5LocationPlugin (位置插件)
    │       ├── H5SharePlugin (分享插件)
    │       └── ... 更多插件
    │
    └── H5BasePlugin (deprecated)
```

### 6. Context 继承链

```
H5Context (接口)
    │
    ├── WalletContext (nebulacore.wallet)
    │       │
    │       └── 持有 Context
    │
    └── H5BaseContext (basebridge)
```

---

## 🔗 依赖关系详解

### 1. H5Page 核心依赖

```java
// H5PageImpl 的核心依赖
public class H5PageImpl implements H5Page, APWebView {
    
    // 1. WebView 封装
    private H5WebView webView;  // 组合关系
    
    // 2. Bridge 通信
    private H5BridgeImpl bridge;  // 组合关系
    
    // 3. Session 管理
    private H5SessionImpl session;  // 组合关系
    
    // 4. 页面上下文
    private H5Context context;  // 组合关系
    
    // 5. 插件列表
    private List<H5Plugin> plugins;  // 组合关系
    
    // 6. 配置
    private Bundle params;
    
    // 7. Provider 管理器
    private H5ProviderManagerImpl providerManager;
    
    // 8. WebViewClient
    private H5WebViewClient webViewClient;
    
    // 9. WebChromeClient
    private H5WebChromeClient webChromeClient;
}
```

**关系图**:
```
H5PageImpl
    │
    ├── H5WebView ──── 使用 ───> APWebView (接口)
    │       │
    │       └── 实际实现
    │           ├── AndroidWebView
    │           ├── UCWebView
    │           └── XWebView
    │
    ├── H5BridgeImpl ─── 使用 ───> H5Bridge (接口)
    │       │
    │       ├── 注册 H5Plugin
    │       ├── 管理 H5CallBack
    │       └── 注入 JS
    │
    ├── H5SessionImpl ─── 管理 ───> H5Session (接口)
    │       │
    │       ├── Stack<H5Page> 页面栈
    │       └── H5Scenario 场景
    │
    ├── H5Context ─── 实现 ───> H5Context (接口)
    │       │
    │       └── 持有 Activity/Context
    │
    ├── List<H5Plugin> ─── 扩展 ───> H5Plugin (接口)
    │       │
    │       ├── H5PagePlugin
    │       ├── H5UIPlugin
    │       ├── H5NavigatorPlugin
    │       └── ... 更多
    │
    └── H5ProviderManagerImpl ─── 获取 ───> H5ProviderManager (接口)
            │
            ├── H5ConfigProvider
            ├── H5LogProvider
            ├── H5DialogProvider
            └── ... 更多 Provider
```

---

### 2. H5Activity 依赖关系

```java
public class H5Activity extends FragmentActivity {
    
    // 1. Fragment 管理
    private H5FragmentManager h5FragmentManager;
    
    // 2. 广播接收
    private BroadcastReceiver broadcastReceiver;
    
    // 3. 页面参数
    private Bundle intentExtras;
    
    // 4. 参数监听
    private H5ParamHolder.PageParamListener pageParamListener;
    
    // 5. Activity 生命周期回调
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 1. 获取 Intent 参数
        String url = getIntent().getStringExtra("url");
        Bundle params = getIntent().getBundleExtra("params");
        
        // 2. 创建 H5Fragment
        H5Fragment fragment = H5FragmentManager.createFragment(url, params);
        
        // 3. 显示 Fragment
        setContentView(fragment.getView());
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // 通知 Fragment
        if (h5FragmentManager != null) {
            h5FragmentManager.getCurrentPage().onResume();
        }
    }
}
```

**关系图**:
```
H5Activity
    │
    ├── extends FragmentActivity (Android)
    │
    ├── 持有 H5FragmentManager ─── 管理 ───> H5Fragment
    │       │
    │       └── H5Fragment ─── 持有 ───> H5Page
    │               │
    │               └── H5PageImpl
    │                       │
    │                       ├── H5WebView
    │                       ├── H5BridgeImpl
    │                       └── H5SessionImpl
    │
    └── 注册 BroadcastReceiver ─── 接收 ───> 全局事件
```

---

### 3. H5Fragment 依赖关系

```java
public class H5Fragment extends Fragment implements H5BaseFragment {
    
    // 1. 页面实例
    private H5Page h5Page;
    
    // 2. WebView 容器
    private ViewGroup webViewContainer;
    
    // 3. 标题栏
    private H5TitleView titleView;
    
    // 4. 加载视图
    private H5LoadingView loadingView;
    
    // 5. 错误视图
    private View errorView;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, 
                            Bundle savedInstanceState) {
        // 1. 创建根视图
        View rootView = inflater.inflate(R.layout.h5_fragment, container, false);
        
        // 2. 获取容器
        webViewContainer = rootView.findViewById(R.id.webview_container);
        
        // 3. 创建 H5Page
        h5Page = H5PageFactory.create(url, params);
        
        // 4. 添加到容器
        webViewContainer.addView(h5Page.getView());
        
        return rootView;
    }
    
    public void startLoad() {
        // 启动页面加载
        h5Page.loadUrl(url);
    }
}
```

---

### 4. H5BridgeImpl 依赖关系

```java
public class H5BridgeImpl implements H5Bridge {
    
    // 1. WebView 引用
    private H5WebView webview;
    
    // 2. 页面引用
    private H5Page h5Page;
    
    // 3. 回调 Map
    private Map<String, H5CallBack> callBackMap;
    
    // 4. 验证 Map
    private Map<String, Long> valMap;
    
    // 5. JS API 配置
    private List<String> strlist;
    private JSONArray configArray;
    
    // 6. 是否为小程序
    private boolean isTinyApp;
    
    // 7. App ID
    private String appId;
    
    public void callNative(String method, JSONObject params, H5BridgeContext context) {
        // 1. 方法白名单校验
        if (!isMethodAllowed(method)) {
            context.send(createError("方法未授权"));
            return;
        }
        
        // 2. 参数校验
        if (!validateParams(params, method)) {
            context.send(createError("参数错误"));
            return;
        }
        
        // 3. 权限校验
        if (isSensitiveMethod(method)) {
            if (!checkPermission(method)) {
                context.send(createError("缺少权限"));
                return;
            }
        }
        
        // 4. 路由到 Plugin
        boolean handled = routeToPlugin(method, params, context);
        
        if (!handled) {
            // 5. 内置方法处理
            handleBuiltinMethod(method, params, context);
        }
    }
}
```

---

### 5. H5Plugin 继承体系

```
H5Plugin (接口)
    │
    ├── boolean handle(String action, JSONObject params, H5BridgeContext context)
    ├── void init(H5Page page, JSONObject params)
    ├── void onCreate()
    ├── void onDestroy()
    ├── void onResume()
    └── void onPause()
            │
            └── H5SimplePlugin (抽象类 implements H5Plugin)
                    │
                    ├── H5PagePlugin
                    │       │
                    │       ├── 持有 H5WebView
                    │       ├── 持有 H5Bridge
                    │       ├── 持有 H5BackHandler
                    │       └── 注册页面方法
                    │               ├── onShow/onHide
                    │               ├── setTitle
                    │               └── handleBack
                    │
                    ├── H5UIPlugin
                    │       │
                    │       ├── showToast()
                    │       ├── showLoading()
                    │       ├── showAlert()
                    │       └── showActionSheet()
                    │
                    ├── H5NavigatorPlugin
                    │       │
                    │       ├── navigateTo()
                    │       ├── navigateBack()
                    │       └── redirectTo()
                    │
                    ├── H5StoragePlugin
                    │       │
                    │       ├── setStorage()
                    │       ├── getStorage()
                    │       └── removeStorage()
                    │
                    ├── H5LocationPlugin
                    │       │
                    │       ├── getLocation()
                    │       ├── startLocation()
                    │       └── stopLocation()
                    │
                    ├── H5SharePlugin
                    │       │
                    │       └── share()
                    │
                    ├── H5ImagePlugin
                    │       │
                    │       ├── chooseImage()
                    │       ├── previewImage()
                    │       └── takePhoto()
                    │
                    ├── H5PaymentPlugin
                    │       │
                    │       └── requestPayment()
                    │
                    ├── H5ScannerPlugin
                    │       │
                    │       └── scanQRCode()
                    │
                    ├── H5NetworkPlugin
                    │       │
                    │       └── getNetworkType()
                    │
                    ├── H5DevicePlugin
                    │       │
                    │       └── getSystemInfo()
                    │
                    └── H5ContactPlugin
                            │
                            └── chooseContact()
```

---

### 6. Provider 依赖体系

```
H5Provider (接口)
    │
    ├── void init(Context context)
    ├── String getName()
    ├── int getPriority()
    └── Object provide(Context context, String action, Bundle data)
            │
            └── H5ProviderManagerImpl (implements H5ProviderManager)
                    │
                    ├── Map<String, H5ProviderConfig> configMap
                    └── Map<String, Object> providerMap
                            │
                            ├── H5ConfigProvider
                            │       │
                            │       └── getConfig(String key)
                            │
                            ├── H5LogProvider
                            │       │
                            │       └── log(String tag, String message)
                            │
                            ├── H5DialogProvider
                            │       │
                            │       ├── showDialog()
                            │       └── dismissDialog()
                            │
                            ├── H5LoadingProvider
                            │       │
                            │       ├── showLoading()
                            │       └── hideLoading()
                            │
                            ├── H5AutoLoginProvider
                            │       │
                            │       └── getAutoLoginInfo()
                            │
                            ├── H5UrlDownloadProvider
                            │       │
                            │       └── download(url, callback)
                            │
                            ├── H5EmbededViewProvider
                            │       │
                            │       ├── createView()
                            │       └── destroyView()
                            │
                            └── H5LottieViewProvider
                                    │
                                    └── playAnimation()
```

---

### 7. Socket/Module 继承体系

```
Socket (抽象类)
    │
    ├── CustomSocket
    │       │
    │       └── Module (抽象类)
    │               │
    │               ├── AuthorizationModule (extends AuthorizationSocket)
    │               ├── CacheModule (extends CacheSocket)
    │               ├── ConsoleModule (extends ConsoleSocket)
    │               └── EventModule (extends EventSocket)
    │
    ├── AuthorizationSocket
    │       │
    │       └── AuthorizationModule
    │
    ├── CacheSocket
    │       │
    │       └── CacheModule
    │
    ├── ConsoleSocket
    │       │
    │       └── ConsoleModule
    │
    └── EventSocket
            │
            └── EventModule
```

---

### 8. WebIntercept 继承体系

```
WebIntercept (接口)
    │
    ├── WebResourceResponse intercept(WebView view, String url)
    │
    └── BaseWebIntercept (抽象类 implements WebIntercept)
            │
            ├── CacheWebIntercept
            │       │
            │       └── 优先返回缓存
            │
            └── OnlineWebIntercept
                    │
                    └── 处理在线请求
```

---

## 🎯 核心类关系图

### 页面加载核心关系

```
                    ┌─────────────────────────────────────────┐
                    │           H5Activity                    │
                    │  extends FragmentActivity               │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ 创建
                                       ↓
                    ┌─────────────────────────────────────────┐
                    │          H5FragmentManager              │
                    │         创建 H5Fragment                 │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ 创建
                                       ↓
                    ┌─────────────────────────────────────────┐
                    │             H5Fragment                │
                    │   extends Fragment implements            │
                    │   H5BaseFragment                        │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ 创建
                                       ↓
                    ┌─────────────────────────────────────────┐
                    │            H5PageFactory              │
                    │          创建 H5PageImpl               │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ 创建
                                       ↓
┌────────────────┬───────────────────────────────────────────────────────┐
│                │                    H5PageImpl                         │
│                │    implements H5Page, APWebView                       │
│                └──────────────────┬───────────────────────────────────┘
│                                   │
│          ┌────────────────────────┼────────────────────────┐
│          │                        │                        │
│          ↓                        ↓                        ↓
│ ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│ │   H5WebView    │   │  H5BridgeImpl  │   │   H5SessionImpl     │
│ │  包装 WebView  │   │  JS-Native 桥接 │   │    Session 管理     │
│ └────────┬────────┘   └───────┬───────┘   └──────────┬──────────┘
│          │                    │                        │
│          ↓                    ↓                        ↓
│ ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│ │ AndroidWebView  │   │  List<H5Plugin> │   │  Stack<H5Page>      │
│ │ UCWebView       │   │   H5PagePlugin  │   │   页面栈            │
│ │ XWebView        │   │   H5UIPlugin    │   └─────────────────────┘
│ └─────────────────┘   │   ...           │
│                      └─────────────────┘
│
│                                   │
│                                   ↓
│                    ┌─────────────────────────────────────────┐
│                    │      H5ProviderManagerImpl              │
│                    │         Provider 管理                   │
│                    └──────────────────┬──────────────────────┘
│                                       │
│                                       │ 获取
│                                       ↓
│                    ┌─────────────────────────────────────────┐
│                    │           Provider 列表                │
│                    │ H5ConfigProvider / H5LogProvider / ...  │
│                    └─────────────────────────────────────────┘
```

---

## 📋 类关系速查表

### 继承关系 (Inheritance)

| 子类 | 父类/接口 | 关系 |
|------|-----------|------|
| **H5BasePage** | H5BaseNebulaService | extends |
| **H5BaseNebulaService** | H5CoreNode | implements |
| **H5PageImpl** | H5Page | implements |
| **H5Fragment** | Fragment | extends |
| **H5BridgeImpl** | H5Bridge | implements |
| **H5SimplePlugin** | H5Plugin | implements |
| **H5PagePlugin** | H5SimplePlugin | extends |
| **H5UIPlugin** | H5SimplePlugin | extends |
| **H5NavigatorPlugin** | H5SimplePlugin | extends |
| **H5StoragePlugin** | H5SimplePlugin | extends |
| **H5LocationPlugin** | H5SimplePlugin | extends |
| **H5SharePlugin** | H5SimplePlugin | extends |
| **H5WebView** | APWebView | implements |
| **H5Activity** | FragmentActivity | extends |
| **H5BaseActivity** | BaseFragmentActivity | extends |

### 组合关系 (Composition)

| 主类 | 持有对象 | 关系 |
|------|----------|------|
| **H5PageImpl** | H5WebView | 组合 |
| **H5PageImpl** | H5BridgeImpl | 组合 |
| **H5PageImpl** | H5SessionImpl | 组合 |
| **H5PageImpl** | List<H5Plugin> | 组合 |
| **H5PageImpl** | H5Context | 组合 |
| **H5BridgeImpl** | H5WebView | 引用 |
| **H5BridgeImpl** | Map<String, H5CallBack> | 组合 |
| **H5Fragment** | H5Page | 组合 |
| **H5Activity** | H5FragmentManager | 组合 |
| **H5Activity** | BroadcastReceiver | 组合 |

### 实现关系 (Implementation)

| 接口 | 实现类 |
|------|--------|
| **H5Page** | H5PageImpl |
| **H5Bridge** | H5BridgeImpl |
| **H5Plugin** | H5SimplePlugin (抽象) → 具体 Plugin |
| **H5Provider** | 具体 Provider 实现 |
| **H5Session** | H5SessionImpl |
| **APWebView** | H5WebView |
| **H5ProviderManager** | H5ProviderManagerImpl |

### 使用关系 (Usage)

| 调用类 | 被调用类 | 方法 |
|--------|----------|------|
| **H5BridgeImpl** | H5Plugin | plugin.handle() |
| **H5PageImpl** | H5ProviderManager | getProvider() |
| **H5PageImpl** | H5PluginManager | createPlugins() |
| **H5Activity** | H5Fragment | startLoad() |
| **H5Fragment** | H5Page | loadUrl() |
| **H5Page** | H5WebView | loadUrl() |
| **H5BridgeImpl** | H5WebView | evaluateJavaScript() |

---

## 🔄 核心业务流程中的类协作

### 场景一：页面加载

```
1. H5Activity.onCreate()
   └── H5FragmentManager.createFragment()
       └── H5Fragment.newInstance()
           └── H5Fragment.onCreateView()
               └── H5PageFactory.create()
                   ├── H5PageImpl.onCreate()
                   │   ├── H5WebViewFactory.create()
                   │   │   └── H5WebView.configure()
                   │   ├── H5BridgeImpl.init()
                   │   │   ├── injectJavaScript()
                   │   │   └── registerBuiltinMethods()
                   │   ├── H5SessionImpl.init()
                   │   └── H5PluginManager.createPlugins()
                   │       └── List<H5Plugin>.init()
                   └── H5Fragment.startLoad()
                       └── H5Page.loadUrl()
                           └── H5WebView.loadUrl()
```

### 场景二：JS 调用 Native

```
1. JS: HybridAPI.callNative()
   └── WebView: prompt()
       └── H5BridgeImpl.callNative()
           ├── isMethodAllowed()  // 白名单校验
           ├── validateParams()  // 参数校验
           ├── checkPermission() // 权限校验
           └── routeToPlugin()
               ├── H5PluginManager.getPlugin()
               └── H5Plugin.handle()
                   └── [执行业务逻辑]
                       ├── H5LocationPlugin → 获取位置
                       ├── H5SharePlugin → 分享
                       └── H5UIPlugin → 显示 UI
```

### 场景三：Native 调用 JS

```
1. Native: 业务逻辑完成
   └── H5BridgeImpl.callJs()
       ├── buildJsCode()
       └── H5WebView.evaluateJavaScript()
           └── JS: HybridBridge.callback()
               └── 执行 JS callback
```

---

## 📊 依赖强度分析

### 高内聚模块

| 模块 | 类数量 | 内聚度 | 说明 |
|------|--------|--------|------|
| **nebulacore.ui** | 15+ | 高 | UI 组件，职责单一 |
| **nebulacore.web** | 10+ | 高 | WebView 封装 |
| **nebulacore.plugin** | 12+ | 高 | 插件实现 |
| **h5container.api** | 20+ | 高 | 接口定义 |

### 低耦合模块

| 模块 | 依赖模块 | 耦合度 | 说明 |
|------|----------|--------|------|
| **base-flame-nebula** | base----flame-basis | 低 | 仅依赖网络/数据库 |
| **adapter-flame** | base-flame-nebula | 中 | 适配层 |
| **app** | adapter-flame | 中 | 应用层 |

---

*文档生成时间: 2026-02-05*
*包含: 8 个核心继承链 + 15+ 依赖关系图*
