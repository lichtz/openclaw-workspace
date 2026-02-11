# Coral Android - adapter-flame 模块类关系分析

## 📊 adapter-flame 模块概览

### 模块职责

**adapter-flame** 是 H5 容器的适配层，负责：
- 适配具体业务实现
- 提供 UI 组件适配器
- 管理 Activity 生命周期
- 集成社交分享 SDK

### 模块统计

| 指标 | 数值 |
|------|------|
| **Java 文件数** | 144 |
| **核心包** | 10+ |
| **核心类** | 50+ |

---

## 🏗️ adapter-flame 核心继承链

### 1. Plugin 继承链

```
H5SimplePlugin (nebulacore)
    │
    └── AdaptedH5SimplePlugin (adapter-flame)
            │
            ├── H5PageApiPluginProxy
            │       │
            │       └── implements AdaptedOnH5ActivityResult
            │
            ├── H5TitleInitPlugin
            │       │
            │       └── 初始化标题栏
            │
            ├── H5FlamePageExtendPlugin
            │       │
            │       └── 页面扩展
            │
            ├── H5TitleInitPluginProxy
            │       │
            │       └── implements AdaptedOnH5ActivityResult
            │
            └── H5AboutApiPluginImpl
                    │
                    └── implements AdaptedOnH5ActivityResult
```

### 2. Wrapper 继承链

```
H5WebContentView (接口)
    │
    └── H5WebContentViewWrapper
            │
            └── 实现页面内容包装

H5TitleView (接口)
    │
    ├── H5TitleViewWrapper
    │       │
    │       └── 包装标题栏视图
    │
    └── H5FlameTitleBar (h5container.api)
            │
            └── 实现标题栏

H5NavMenuView (接口)
    │
    └── H5NavMenuViewWrapper
            │
            └── 包装导航菜单

H5TitleBarFrameLayout (基类)
    │
    └── H5TitleBarFrameLayoutAdapter
            │
            └── 适配器模式
```

### 3. Provider 继承链

```
H5CacheProvider (接口)
    │
    └── H5CacheProviderImpl
            │
            └── 实现缓存 Provider

H5ViewProvider (接口)
    │
    └── H5ViewProviderImpl
            │
            └── 实现视图 Provider

H5UaProvider (接口)
    │
    └── H5UaProviderImpl
            │
            └── 实现 UA Provider

H5ErrorPageView (接口)
    │
    └── H5ErrorPageViewImpl
            │
            └── 实现错误页视图

H5ReceivedSslErrorHandler (接口)
    │
    └── H5ReceivedSslErrorHandlerImpl
            │
            └── 实现 SSL 错误处理

H5WebContentImpl (基类)
    │
    └── H5CustomWebContentImpl
            │
            └── 自定义 Web 内容
```

### 4. Starter 继承链

```
IH5Starter (接口)
    │
    ├── H5DefaultStarter
    │       │
    │       └── 默认启动器
    │
    ├── H5StartupStarter
    │       │
    │       └── 启动启动器
    │
    ├── H5PerfStarter
    │       │
    │       └── 性能启动器
    │
    ├── H5VersionStarter
    │       │
    │       └── extends H5BaseStarter
    │               │
    │               └── 版本启动器
    │
    └── H5RetryDecoratorStarter
            │
            └── implements IH5Starter
                    │
                    └── 重试装饰器
```

---

## 🔗 核心类依赖关系

### 1. H5ActivityManager

**职责**: Activity 生命周期管理，全局页面管理

```java
public class H5ActivityManager implements Application.ActivityLifecycleCallbacks {
    
    private static H5ActivityManager instance;
    private Stack<Activity> activityStack;      // Activity 栈
    private Map<String, Long> resumeMap;        // Resume 时间
    private boolean isActive = false;            // 是否在前台
    
    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        activityStack.push(activity);
    }
    
    @Override
    public void onActivityResumed(Activity activity) {
        isActive = true;
        String activityName = activity.getClass().getName();
        resumeMap.put(activityName, System.currentTimeMillis());
    }
    
    @Override
    public void onActivityPaused(Activity activity) {
        isActive = false;
    }
    
    @Override
    public void onActivityDestroyed(Activity activity) {
        activityStack.remove(activity);
    }
    
    // 关闭所有页面
    public void finishAllActivities() {
        for (Activity activity : activityStack) {
            activity.finish();
        }
        activityStack.clear();
    }
    
    // 获取顶部 Activity
    public Activity getTopActivity() {
        if (activityStack.isEmpty()) {
            return null;
        }
        return activityStack.peek();
    }
}
```

### 2. Wrapper 类关系

```java
// H5WebContentViewWrapper - Web 内容包装
public class H5WebContentViewWrapper implements H5WebContentView {
    
    private H5WebContentView delegate;  // 委托
    
    @Override
    public void setContentView(View view) {
        delegate.setContentView(view);
    }
    
    @Override
    public void addView(View view) {
        delegate.addView(view);
    }
}

// H5TitleViewWrapper - 标题栏包装
public class H5TitleViewWrapper implements H5TitleView {
    
    private H5TitleView delegate;
    
    @Override
    public void setTitle(String title) {
        delegate.setTitle(title);
    }
    
    @Override
    public void setTitleColor(int color) {
        delegate.setTitleColor(color);
    }
    
    @Override
    public void showBackButton(boolean show) {
        delegate.showBackButton(show);
    }
}

// H5NavMenuViewWrapper - 导航菜单包装
public class H5NavMenuViewWrapper implements H5NavMenuView {
    
    private H5NavMenuView delegate;
    
    @Override
    public void showMenu(MenuItem[] items) {
        delegate.showMenu(items);
    }
    
    @Override
    public void hideMenu() {
        delegate.hideMenu();
    }
}
```

### 3. Plugin 类关系

```java
// H5PageApiPluginProxy - 页面 API 代理
public class H5PageApiPluginProxy extends AdaptedH5SimplePlugin 
        implements AdaptedOnH5ActivityResult {
    
    private H5PageApiPlugin apiPlugin;  // 实际页面 API
    
    @Override
    public boolean handle(String action, JSONObject params, H5BridgeContext context) {
        return apiPlugin.handle(action, params, context);
    }
    
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        apiPlugin.onActivityResult(requestCode, resultCode, data);
    }
}

// H5TitleInitPlugin - 标题栏初始化插件
public class H5TitleInitPlugin extends H5SimplePlugin {
    
    private H5TitleView titleView;  // 标题栏视图
    
    @Override
    public void init(H5Page page, JSONObject params) {
        // 1. 获取标题栏
        titleView = page.getH5TitleBar();
        
        // 2. 设置默认标题
        String title = params.getString("title");
        titleView.setTitle(title);
        
        // 3. 配置返回按钮
        boolean showBack = params.getBooleanValue("showBack", true);
        titleView.showBackButton(showBack);
        
        // 4. 设置背景色
        int bgColor = params.getIntValue("bgColor", 0xFFFFFFFF);
        titleView.setBackgroundColor(bgColor);
    }
}

// H5FlamePageExtendPlugin - 页面扩展插件
public class H5FlamePageExtendPlugin extends H5SimplePlugin {
    
    private FragmentLifecycleObserver lifecycleObserver;
    
    @Override
    public void init(H5Page page, JSONObject params) {
        // 注册生命周期观察者
        lifecycleObserver = new FragmentLifecycleObserver(page);
        page.getH5Fragment().registerLifecycleObserver(lifecycleObserver);
    }
    
    // 内部类：生命周期观察者
    private class FragmentLifecycleObserver implements LifecycleObserver {
        private H5Page page;
        
        public FragmentLifecycleObserver(H5Page page) {
            this.page = page;
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
        void onResume() {
            page.onResume();
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        void onPause() {
            page.onPause();
        }
    }
}
```

---

## 📁 adapter-flame 包结构

### 包列表

| 包名 | 类数量 | 主要职责 |
|------|--------|----------|
| **com.ynet.finmall.adapter** | 5+ | 基础适配器 |
| **com.ynet.finmall.adapter.h5** | 10+ | H5 适配 |
| **com.ynet.finmall.adapter.h5.wrapper** | 5+ | Wrapper 包装 |
| **com.ynet.finmall.adapter.h5.plugin** | 10+ | 插件实现 |
| **com.ynet.finmall.adapter.h5.provider** | 10+ | Provider 实现 |
| **com.ynet.finmall.adapter.h5.manager** | 5+ | 管理器 |
| **com.ynet.finmall.adapter.h5.utils** | 10+ | 工具类 |
| **com.ynet.finmall.adapter.h5.starter** | 5+ | 启动器 |
| **com.ynet.finmall.adapter.h5.appConfig** | 10+ | 配置管理 |
| **com.ynet.finmall.adapter.h5.view** | 5+ | 视图组件 |

---

## 🔗 模块间关系

### adapter-flame 与 base-flame-nebula 关系

```
adapter-flame                              base-flame-nebula
    │                                           │
    │                                           │
    ├── H5ActivityManager ────────────────→ H5ActivityManager (冲突?)
    │                                           │
    ├── AdaptedH5SimplePlugin ─────────────→ H5SimplePlugin (继承)
    │                                           │
    ├── H5PageApiPluginProxy ─────────────→ H5PagePlugin (代理)
    │                                           │
    ├── H5CacheProviderImpl ───────────────→ H5CacheProvider (实现)
    │                                           │
    ├── H5TitleViewWrapper ────────────────→ H5TitleView (包装)
    │                                           │
    └── H5ServiceImpl ─────────────────────→ H5Service (实现)
                                                    │
                                            ┌────────┴────────┐
                                            │                 │
                                    H5PageImpl    H5ProviderManagerImpl
```

### 类依赖矩阵

| adapter-flame 类 | 依赖 base-flame-nebula | 关系类型 |
|------------------|-------------------------|----------|
| **H5ActivityManager** | H5Activity | 使用 |
| **AdaptedH5SimplePlugin** | H5SimplePlugin | 继承 |
| **H5PageApiPluginProxy** | H5PagePlugin | 代理 |
| **H5TitleViewWrapper** | H5TitleView | 实现 |
| **H5CacheProviderImpl** | H5CacheProvider | 实现 |
| **H5ViewProviderImpl** | H5ViewProvider | 实现 |
| **H5CustomWebContentImpl** | H5WebContentImpl | 继承 |
| **H5ServiceImpl** | H5Service | 实现 |

---

## 🎯 核心类协作流程

### 页面启动流程

```
1. 应用启动
   │
   └── H5ActivityManager.onCreate()
           │
           └── 注册 Application 生命周期回调
                   │
                   └── H5VersionStarter.start()
                           │
                           ├── 检查版本
                           └── H5StartupStarter.start()
                                   │
                                   ├── 初始化配置
                                   └── H5PerfStarter.start()
                                           │
                                           └── 启动性能监控
                                                   │
                                                   └── H5DefaultStarter.start()
                                                           │
                                                           └── 创建 H5Activity
```

### 页面适配流程

```
1. H5Activity 启动
   │
   ├── H5FragmentManager 创建 Fragment
   │       │
   │       └── H5Fragment
   │               │
   │               └── H5PageImpl
   │
   ├── H5TitleInitPlugin 初始化标题栏
   │       │
   │       ├── 获取 H5TitleView
   │       ├── 设置标题
   │       └── 配置返回按钮
   │
   ├── H5PageApiPluginProxy 代理页面 API
   │       │
   │       ├── 转发 API 调用
   │       └── 处理 Activity Result
   │
   └── H5FlamePageExtendPlugin 页面扩展
           │
           ├── 注册生命周期观察
           └── 同步页面状态
```

---

## 📋 核心类索引

### Manager 类

| 类名 | 包名 | 职责 |
|------|------|------|
| **H5ActivityManager** | manager | Activity 栈管理 |

### Plugin 类

| 类名 | 包名 | 职责 |
|------|------|------|
| **AdaptedH5SimplePlugin** | bean | 适配插件基类 |
| **H5PageApiPluginProxy** | plugin | 页面 API 代理 |
| **H5TitleInitPlugin** | plugin | 标题栏初始化 |
| **H5FlamePageExtendPlugin** | plugin | 页面扩展 |
| **H5TitleInitPluginProxy** | plugin | 标题栏代理 |
| **H5AboutApiPluginImpl** | plugin | 关于页面 |

### Wrapper 类

| 类名 | 包名 | 职责 |
|------|------|------|
| **H5WebContentViewWrapper** | wrapper | Web 内容包装 |
| **H5TitleViewWrapper** | wrapper | 标题栏包装 |
| **H5NavMenuViewWrapper** | wrapper | 导航菜单包装 |
| **H5TitleBarFrameLayoutAdapter** | wrapper | 标题栏适配器 |
| **H5PullHeaderViewWrapper** | wrapper | 下拉头部包装 |

### Provider 类

| 类名 | 包名 | 职责 |
|------|------|------|
| **H5CacheProviderImpl** | provider | 缓存 Provider |
| **H5CustomWebContentImpl** | provider | 自定义 Web 内容 |
| **H5ViewProviderImpl** | provider | 视图 Provider |
| **H5UaProviderImpl** | provider | UA Provider |
| **H5ErrorPageViewImpl** | provider | 错误页 Provider |
| **H5ReceivedSslErrorHandlerImpl** | provider | SSL 错误处理 |

### Starter 类

| 类名 | 包名 | 职责 |
|------|------|------|
| **H5DefaultStarter** | starter | 默认启动器 |
| **H5StartupStarter** | starter | 启动启动器 |
| **H5PerfStarter** | starter | 性能启动器 |
| **H5VersionStarter** | starter | 版本启动器 |
| **H5RetryDecoratorStarter** | starter | 重试装饰器 |

---

## 🔄 与其他模块的交互

### 与 base-flame-nebula 交互

```java
// adapter-flame 使用 base-flame-nebula
import com.ynetpay.mobile.h5container.api.H5Page;
import com.ynetpay.mobile.h5container.api.H5Plugin;
import com.ynetpay.mobile.nebula.plugin.H5SimplePlugin;
import com.ynetpay.mobile.nebula.view.H5TitleView;
```

### 与 base-data-cache 交互

```java
// adapter-flame 使用 base-data-cache
import com.ynet.finmall.datacache.AppCache;
import com.ynet.finmall.datacache.IAppDataBaseCache;
```

### 与 app 模块交互

```java
// adapter-flame 适配 app 模块
import com.stht.coral.ui.MainActivity;
import com.stht.coral.HtApplication;
```

---

## 📊 adapter-flame 类关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                    adapter-flame 模块                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Manager 层                           │  │
│  │  H5ActivityManager                                        │  │
│  │  (Activity 生命周期管理)                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ↓                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Plugin 层                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐            │  │
│  │  │ AdaptedH5Simple │──→ │ H5SimplePlugin  │ (继承)      │  │
│  │  │     Plugin      │    │ (base-flame)    │            │  │
│  │  └────────┬────────┘    └─────────────────┘            │  │
│  │           │                                             │  │
│  │           ├─→ H5PageApiPluginProxy                      │  │
│  │           ├─→ H5TitleInitPlugin                        │  │
│  │           ├─→ H5FlamePageExtendPlugin                 │  │
│  │           └─→ H5AboutApiPluginImpl                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ↓                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Wrapper 层                             │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │              H5WebContentViewWrapper            │     │  │
│  │  │              H5TitleViewWrapper                 │     │  │
│  │  │              H5NavMenuViewWrapper               │     │  │
│  │  │              H5TitleBarFrameLayoutAdapter       │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ↓                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Provider 层                            │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ H5CacheProviderImpl ─→ H5CacheProvider          │     │  │
│  │  │ H5ViewProviderImpl  ─→ H5ViewProvider          │     │  │
│  │  │ H5UaProviderImpl    ─→ H5UaProvider            │     │  │
│  │  │ H5CustomWebContentImpl ─→ H5WebContentImpl     │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ↓                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Starter 层                             │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ IH5Starter (接口)                                │     │  │
│  │  │      │                                            │     │  │
│  │  │      ├─→ H5DefaultStarter                        │     │  │
│  │  │      ├─→ H5StartupStarter                        │     │  │
│  │  │      ├─→ H5PerfStarter                          │     │  │
│  │  │      ├─→ H5VersionStarter                       │     │  │
│  │  │      └─→ H5RetryDecoratorStarter                 │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ 依赖
┌─────────────────────────────────────────────────────────────────┐
│               base-flame-nebula (核心模块)                      │
│                                                                 │
│  H5SimplePlugin → H5Plugin → 插件接口                          │
│  H5TitleView → TitleView 接口                                   │
│  H5CacheProvider → Cache Provider 接口                           │
│  H5PageImpl → H5Page → 页面接口                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*文档生成时间: 2026-02-05*
*模块: adapter-flame*
*类数量: 144 文件*
