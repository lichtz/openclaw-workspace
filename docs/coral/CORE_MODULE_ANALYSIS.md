# Coral Android - 核心模块类关系深度分析

## 📊 核心模块概览

| 模块 | 路径 | 类数量 | 主要职责 |
|------|------|--------|----------|
| **core** | nebulacore.core | 15+ | 核心实现 |
| **appcenter** | nebula.appcenter | 25+ | 应用中心 |
| **ui** | nebulacore.ui | 15+ | UI 组件 |
| **env** | nebulacore.env | 5+ | 环境配置 |
| **config** | nebulacore.config | 5+ | 配置管理 |

---

## 🏗️ core 核心模块

### core 模块类列表

| 类名 | 职责 | 继承/实现 |
|------|------|----------|
| **H5CoreTarget** | 核心节点基类 | extends Object |
| **H5SessionImpl** | Session 实现 | extends H5CoreTarget |
| **H5PageImpl** | Page 实现 | extends H5BasePage |
| **H5BridgeContextImpl** | Bridge 上下文实现 | extends H5BaseBridgeContext |
| **H5EventDispatcher** | 事件分发器 | 独立类 |
| **H5PageFactoryImpl** | Page 工厂实现 | 独立类 |
| **H5ScenarioImpl** | Scenario 实现 | 独立类 |
| **H5BridgeRunnable** | Bridge 运行任务 | 独立类 |
| **H5ContentProviderImpl** | ContentProvider 实现 | 独立类 |
| **NebulaServiceImpl** | Nebula 服务实现 | 独立类 |

### H5CoreTarget 核心基类

```java
/**
 * 核心目标 - 节点基类
 * 采用组合模式管理子节点
 */
public abstract class H5CoreTarget implements H5CoreNode {
    public static final String TAG = "H5CoreTarget";
    
    // 核心数据
    protected H5Data mH5Data;
    
    // 插件管理器
    private H5PluginManager pluginManager = new H5PluginManagerImpl(this);
    
    // 父子节点关系
    private H5CoreNode parent = null;
    private List<H5CoreNode> children = new ArrayList<>();
    
    // ==================== 子节点管理 ====================
    
    /**
     * 添加子节点
     */
    @Override
    public synchronized boolean addChild(H5CoreNode child) {
        if (child == null) {
            return false;
        }
        
        // 防止重复添加
        for (H5CoreNode target : this.children) {
            if (target.equals(child)) {
                return false;
            }
        }
        
        this.children.add(child);
        child.setParent(this);
        return true;
    }
    
    /**
     * 移除子节点
     */
    @Override
    public synchronized boolean removeChild(H5CoreNode child) {
        if (child == null) {
            return false;
        }
        boolean removed = this.children.remove(child);
        if (removed) {
            child.setParent(null);
        }
        return removed;
    }
    
    /**
     * 获取所有子节点
     */
    @Override
    public List<H5CoreNode> getChildren() {
        return new ArrayList<>(this.children);
    }
    
    // ==================== 插件管理 ====================
    
    /**
     * 获取插件管理器
     */
    @Override
    public H5PluginManager getPluginManager() {
        return this.pluginManager;
    }
    
    // ==================== 生命周期 ====================
    
    @Override
    public void onCreate() {
        // 子类实现
    }
    
    @Override
    public void onDestroy() {
        // 清理所有子节点
        for (H5CoreNode child : this.children) {
            child.onDestroy();
        }
        this.children.clear();
    }
}
```

### H5SessionImpl 会话管理

```java
/**
 * Session 实现 - 管理页面栈
 */
public class H5SessionImpl extends H5CoreTarget implements H5Session {
    
    public static final String TAG = "H5Session";
    
    // Session ID
    private String Id;
    
    // 场景
    private H5Scenario h5Scenario;
    
    // 页面栈
    private final Stack<H5Page> h5PageStack;
    
    // 是否已退出
    private boolean sessionIsExited;
    
    // 内容提供者
    private H5ContentProvider h5ContentProvider;
    
    // 监听器列表
    private List<H5Listener> h5ListenerList;
    
    // 启动参数
    private Bundle recvBundle;
    
    // Service Worker ID
    private String serviceWorkerID;
    
    // Tab 管理
    private H5SessionTabBar h5SessionTabBar;
    private H5SessionTabManager h5SessionTabManager;
    private H5SessionTabObserver h5SessionTabObserver;
    
    public H5SessionImpl() {
        // 初始化
        this.sessionIsExited = false;
        this.h5ListenerList = new LinkedList<>();
        this.h5PageStack = new Stack<>();
        this.mH5Data = new H5MemData();
        
        // 初始化插件
        initPlugin();
        
        // 初始化 Tab 管理
        this.h5SessionTabManager = new H5SessionTabManager();
        this.h5SessionTabObserver = new H5SessionTabObserver();
    }
    
    // ==================== 页面栈管理 ====================
    
    /**
     * 获取页面数量
     */
    public int getPageStackCount() {
        return this.h5PageStack.size();
    }
    
    /**
     * 添加页面
     */
    public boolean addPage(H5Page page) {
        if (page == null) {
            return false;
        }
        this.h5PageStack.push(page);
        
        // 建立父子关系
        this.addChild((H5CoreNode) page);
        
        return true;
    }
    
    /**
     * 移除页面
     */
    public boolean removePage(H5Page page) {
        if (page == null) {
            return false;
        }
        
        // 从栈中移除
        this.h5PageStack.remove(page);
        
        // 移除父子关系
        this.removeChild((H5CoreNode) page);
        
        return true;
    }
    
    /**
     * 获取顶部页面
     */
    public H5Page getTopPage() {
        if (this.h5PageStack.isEmpty()) {
            return null;
        }
        return this.h5PageStack.peek();
    }
    
    /**
     * 获取所有页面
     */
    public Stack<H5Page> getPages() {
        return new Stack<>();
    }
    
    // ==================== Session 生命周期 ====================
    
    /**
     * 退出 Session
     */
    public boolean exitSession() {
        if (this.sessionIsExited) {
            return false;
        }
        
        this.sessionIsExited = true;
        
        // 关闭所有页面
        while (!this.h5PageStack.isEmpty()) {
            H5Page page = this.h5PageStack.pop();
            page.exitPage();
        }
        
        // 清理监听器
        this.h5ListenerList.clear();
        
        // 调用父类销毁
        this.onDestroy();
        
        return true;
    }
}
```

### H5PageFactoryImpl 页面工厂

```java
/**
 * H5Page 工厂实现
 */
public class H5PageFactoryImpl implements H5PageFactory {
    
    public static final String TAG = "H5PageFactoryImpl";
    
    private Activity mActivity;
    
    public H5PageFactoryImpl(Activity activity) {
        this.mActivity = activity;
    }
    
    /**
     * 创建页面
     */
    public H5ViewHolder createPage(Activity activity, Bundle intentExtras) {
        H5Log.d("H5PageFactoryImpl", "start create page");
        long start = System.currentTimeMillis();
        
        // 1. 创建 ViewHolder
        H5ViewHolder h5ViewHolder = new H5ViewHolder();
        
        // 2. 检查是否透明
        boolean isTransparent = H5Utils.getBoolean(intentExtras, "transparent", false);
        
        try {
            // 3. 创建 H5PageImpl
            H5PageImpl h5Page = new H5PageImpl(
                this.mActivity, 
                intentExtras, 
                h5ViewHolder
            );
            h5ViewHolder.setH5Page(h5Page);
            
            // 4. 如果非透明，创建导航栏
            if (!isTransparent) {
                H5Log.d("H5PageFactoryImpl", "init nav bar");
                H5NavigationBar navBar = new H5NavigationBar(
                    activity, 
                    intentExtras, 
                    h5ViewHolder
                );
                h5ViewHolder.setH5NavBar(navBar);
                
                // 5. 创建 Web 内容区
                H5Log.d("H5PageFactoryImpl", "init web content");
                H5WebContent webContent = new H5WebContent(h5Page);
                h5ViewHolder.setH5WebContainer(webContent);
                
                // 6. 注册内容区为插件
                h5Page.getPluginManager().register(webContent);
            }
            
            // 7. 创建 Fragment（如果需要）
            if (H5Utils.getBoolean(intentExtras, "useFragment", true)) {
                H5Fragment fragment = H5Fragment.newInstance(h5Page);
                h5ViewHolder.setFragment(fragment);
            }
            
            long cost = System.currentTimeMillis() - start;
            H5Log.d("H5PageFactoryImpl", "create page cost: " + cost + "ms");
            
        } catch (Exception e) {
            H5Log.e("H5PageFactoryImpl", "create page failed", e);
        }
        
        return h5ViewHolder;
    }
}
```

---

## 📱 H5ViewHolder 视图持有者

```java
/**
 * 视图持有者 - 持有页面所有视图组件
 */
public class H5ViewHolder {
    
    // 页面
    private H5PageImpl h5Page;
    
    // Fragment
    private H5Fragment h5Fragment;
    
    // 导航栏
    private H5NavigationBar h5NavBar;
    
    // Web 内容区
    private H5WebContent h5WebContainer;
    
    // 根视图
    private View rootView;
    
    // ==================== Getter/Setter ====================
    
    public void setH5Page(H5PageImpl h5Page) {
        this.h5Page = h5Page;
    }
    
    public H5PageImpl getH5Page() {
        return this.h5Page;
    }
    
    public void setH5NavBar(H5NavigationBar navBar) {
        this.h5NavBar = navBar;
    }
    
    public H5NavigationBar getH5NavBar() {
        return this.h5NavBar;
    }
    
    public void setH5WebContainer(H5WebContent webContent) {
        this.h5WebContainer = webContent;
    }
    
    public H5WebContent getH5WebContainer() {
        return this.h5WebContainer;
    }
    
    public void setFragment(H5Fragment fragment) {
        this.h5Fragment = fragment;
    }
    
    public H5Fragment getFragment() {
        return this.h5Fragment;
    }
}
```

---

## 🎯 H5EventDispatcher 事件分发器

```java
/**
 * H5 事件分发器
 */
public class H5EventDispatcher {
    
    public static final String TAG = "H5EventDispatcher";
    
    /**
     * 判断事件是否有效
     */
    private static boolean isValidEvent(H5Event h5Event) {
        if (h5Event == null) {
            H5Log.w("H5EventDispatcher", "invalid event body!");
            return false;
        }
        
        H5CoreNode h5CoreNode = h5Event.getTarget();
        if (h5CoreNode == null) {
            // 尝试从顶层 Session 获取
            NebulaService service = Nebula.getService();
            if (service != null) {
                H5Session session = service.getTopSession();
                if (session != null) {
                    H5Page h5Page = session.getTopPage();
                    if (h5Page != null) {
                        h5CoreNode = h5Page;
                    }
                }
            }
        }
        
        return h5CoreNode != null;
    }
    
    /**
     * 发送事件
     */
    public static boolean sendEvent(H5Event h5Event) {
        if (!isValidEvent(h5Event)) {
            return false;
        }
        
        try {
            H5CoreNode target = h5Event.getTarget();
            
            // 1. 检查过滤器
            H5EventFilter filter = h5Event.getFilter();
            if (filter != null && !filter.accept(target)) {
                return false;
            }
            
            // 2. 分发给目标
            return target.dispatchEvent(h5Event);
            
        } catch (Exception e) {
            H5Log.e("H5EventDispatcher", "send event failed", e);
            return false;
        }
    }
    
    /**
     * 广播事件
     */
    public static boolean broadcastEvent(H5Event h5Event) {
        if (!isValidEvent(h5Event)) {
            return false;
        }
        
        try {
            NebulaService service = Nebula.getService();
            if (service == null) {
                return false;
            }
            
            Stack<H5Session> sessions = service.getSessions();
            boolean result = false;
            
            for (H5Session session : sessions) {
                if (session.dispatchEvent(h5Event)) {
                    result = true;
                }
            }
            
            return result;
            
        } catch (Exception e) {
            H5Log.e("H5EventDispatcher", "broadcast event failed", e);
            return false;
        }
    }
}
```

---

## 🏢 appcenter 应用中心模块

### appcenter 模块类列表

| 类名 | 职责 | 类型 |
|------|------|------|
| **H5AppDBService** | 数据库服务 | Service |
| **H5ResourceManager** | 资源管理 | Manager |
| **H5AppUtil** | 应用工具 | Util |
| **H5NebulaAppConfigManager** | 配置管理 | Manager |
| **NebulaAppCallback** | 回调接口 | Interface |
| **NebulaAppManager** | 管理器接口 | Interface |
| **H5AppDownLoader** | 下载器 | Class |
| **H5AppDownLoadImpl** | 下载实现 | Class |
| **H5AppBizHttpProviderImpl** | HTTP 提供者 | Class |

### NebulaAppManager 接口

```java
/**
 * App 管理器接口
 */
public abstract interface NebulaAppManager {
    
    /**
     * 注册回调
     */
    public abstract void registerNebulaAppCallback(NebulaAppCallback nebulaAppCallback);
    
    /**
     * 取消注册
     */
    public abstract void unregisterNebulaAppCallback(NebulaAppCallback nebulaAppCallback);
    
    /**
     * 获取回调列表
     */
    public abstract List<NebulaAppCallback> getNebulaAppCallbackList();
}
```

### H5AppDownLoader 下载器

```java
/**
 * App 下载器
 */
public class H5AppDownLoader {
    
    private static final String TAG = "H5AppDownLoader";
    
    // 下载配置
    private DownloadConfig config;
    
    // 下载状态
    private DownloadState state = DownloadState.IDLE;
    
    // 进度
    private int progress = 0;
    
    // 下载监听器
    private DownloadListener listener;
    
    /**
     * 开始下载
     */
    public void startDownload(String url, String appId) {
        if (state == DownloadState.DOWNLOADING) {
            H5Log.w(TAG, "download already in progress");
            return;
        }
        
        this.state = DownloadState.DOWNLOADING;
        this.progress = 0;
        
        // 通知开始
        if (listener != null) {
            listener.onStart();
        }
        
        // 执行下载
        executeDownload(url, appId);
    }
    
    /**
     * 暂停下载
     */
    public void pauseDownload() {
        if (state == DownloadState.DOWNLOADING) {
            this.state = DownloadState.PAUSED;
            // 通知暂停
            if (listener != null) {
                listener.onPause();
            }
        }
    }
    
    /**
     * 继续下载
     */
    public void resumeDownload() {
        if (state == DownloadState.PAUSED) {
            this.state = DownloadState.DOWNLOADING;
            // 继续下载
            executeDownload(this.currentUrl, this.currentAppId);
        }
    }
    
    /**
     * 取消下载
     */
    public void cancelDownload() {
        this.state = DownloadState.CANCELLED;
        // 清理资源
        cleanup();
    }
    
    /**
     * 内部执行下载
     */
    private void executeDownload(String url, String appId) {
        this.currentUrl = url;
        this.currentAppId = appId;
        
        // 使用线程池执行
        ExecutorService executor = H5ThreadPoolProvider.getDownloadExecutor();
        executor.execute(() -> {
            try {
                // 1. 下载文件
                downloadFile(url);
                
                // 2. 校验完整性
                if (verifyChecksum(downloadedFile)) {
                    // 3. 解压
                    unzipFile(downloadedFile, targetDir);
                    
                    // 4. 完成
                    this.state = DownloadState.COMPLETED;
                    if (listener != null) {
                        listener.onComplete(targetDir);
                    }
                } else {
                    // 校验失败
                    this.state = DownloadState.FAILED;
                    if (listener != null) {
                        listener.onError("校验失败");
                    }
                }
                
            } catch (Exception e) {
                this.state = DownloadState.FAILED;
                if (listener != null) {
                    listener.onError(e.getMessage());
                }
            }
        });
    }
    
    /**
     * 下载文件
     */
    private void downloadFile(String url) throws IOException {
        // 实现下载逻辑
    }
    
    /**
     * 校验文件
     */
    private boolean verifyChecksum(File file) {
        // 实现校验逻辑
    }
    
    /**
     * 解压文件
     */
    private void unzipFile(File source, File target) throws IOException {
        // 实现解压逻辑
    }
}
```

---

## 📊 核心模块类关系图

### 继承关系

```
Object
    │
    ├── H5CoreTarget (abstract)
    │       │
    │       └── H5SessionImpl ────── implements H5Session
    │       │
    │       └── H5CoreNode (interface)
    │               │
    │               └── H5BaseNebulaService
    │                       │
    │                       └── H5BasePage ───── implements H5Page
    │
    ├── H5Session (interface)
    │       │
    │       └── H5SessionImpl
    │
    ├── H5Page (interface)
    │       │
    │       └── H5PageImpl
    │
    ├── H5BridgeContext (interface)
    │       │
    │       └── H5BaseBridgeContext
    │               │
    │               └── H5BridgeContextImpl
    │
    ├── H5PluginManager (interface)
    │       │
    │       └── H5PluginManagerImpl
    │
    └── H5ProviderManager (interface)
            │
            └── H5ProviderManagerImpl
```

### 组合关系

```
H5SessionImpl
    │
    ├── Stack<H5Page> h5PageStack ───── 页面栈
    │       │
    │       └── H5PageImpl
    │
    ├── H5Scenario h5Scenario ─────────── 场景
    │       │
    │       └── H5ScenarioImpl
    │
    ├── H5ContentProvider h5ContentProvider ─ 内容提供者
    │       │
    │       └── H5ContentProviderImpl
    │
    ├── List<H5Listener> h5ListenerList ─ 监听器列表
    │
    ├── H5SessionTabBar h5SessionTabBar ─ Tab 栏
    │       │
    │       └── H5SessionTabManager
    │
    └── H5CoreTarget ←─ 继承
            │
            ├── H5PluginManager pluginManager ─ 插件管理器
            │       │
            │       └── List<H5Plugin>
            │
            └── List<H5CoreNode> children ─ 子节点列表
```

### 工厂创建关系

```
H5PageFactoryImpl
    │
    └── createPage(activity, intentExtras)
            │
            ├── 1. 创建 H5ViewHolder
            │       │
            │       └── new H5ViewHolder()
            │
            ├── 2. 创建 H5PageImpl
            │       │
            │       └── new H5PageImpl(activity, extras, viewHolder)
            │               │
            │               ├── H5WebView
            │               ├── H5BridgeImpl
            │               └── H5SessionImpl
            │
            ├── 3. 创建 H5NavigationBar (非透明时)
            │       │
            │       └── new H5NavigationBar(activity, extras, viewHolder)
            │
            ├── 4. 创建 H5WebContent
            │       │
            │       └── new H5WebContent(h5Page)
            │
            └── 5. 创建 H5Fragment (如果需要)
                    │
                    └── new H5Fragment(h5Page)
```

---

## 🔄 事件流关系

```
H5Event
    │
    ├── H5EventDispatcher.sendEvent()
    │       │
    │       ├── 1. 验证事件
    │       │       └── isValidEvent()
    │       │
    │       ├── 2. 获取目标
    │       │       └── h5Event.getTarget()
    │       │
    │       └── 3. 分发事件
    │               └── target.dispatchEvent()
    │
    └── H5CoreTarget.dispatchEvent()
            │
            ├── 1. 检查过滤器
            │       └── filter.accept()
            │
            ├── 2. 查找处理器
            │       └── findHandler()
            │
            ├── 3. 执行处理
            │       └── handler.handle()
            │
            └── 4. 向上冒泡
                    └── parent.dispatchEvent()
```

---

## 📋 核心类速查

### 核心类职责表

| 类名 | 包名 | 职责 | 重要性 |
|------|------|------|--------|
| **H5CoreTarget** | nebulacore.core | 核心节点基类 | ⭐⭐⭐ |
| **H5SessionImpl** | nebulacore.core | Session 管理 | ⭐⭐⭐ |
| **H5PageImpl** | nebulacore.core | Page 实现 | ⭐⭐⭐ |
| **H5PageFactoryImpl** | nebulacore.core | Page 工厂 | ⭐⭐⭐ |
| **H5ViewHolder** | nebulacore.core | 视图持有者 | ⭐⭐⭐ |
| **H5EventDispatcher** | nebulacore.core | 事件分发 | ⭐⭐ |
| **H5BridgeContextImpl** | nebulacore.core | Bridge 上下文 | ⭐⭐⭐ |
| **H5NavigationBar** | nebulacore.view | 导航栏 | ⭐⭐ |
| **H5WebContent** | nebulacore.ui | Web 内容 | ⭐⭐ |
| **H5Fragment** | nebulacore.ui | 页面碎片 | ⭐⭐⭐ |

### 核心类方法表

| 类名 | 关键方法 | 说明 |
|------|----------|------|
| **H5SessionImpl** | getTopPage() | 获取顶部页面 |
| **H5SessionImpl** | addPage(page) | 添加页面 |
| **H5SessionImpl** | exitSession() | 退出会话 |
| **H5PageImpl** | loadUrl(url) | 加载 URL |
| **H5PageImpl** | exitPage() | 退出页面 |
| **H5PageFactoryImpl** | createPage() | 创建页面 |
| **H5EventDispatcher** | sendEvent() | 发送事件 |
| **H5EventDispatcher** | broadcastEvent() | 广播事件 |

---

*文档生成时间: 2026-02-05*
*模块: core + appcenter*
*类数量: 50+*
