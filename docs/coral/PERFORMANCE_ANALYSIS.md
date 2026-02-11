# Coral Android 项目 - 性能优化分析报告

## ⚡ 性能概览

### 核心性能指标

| 指标 | 当前状态 | 目标值 | 优先级 |
|------|----------|--------|--------|
| **冷启动时间** | ~2-3s | <1.5s | P0 |
| **H5 页面加载** | ~1-2s | <800ms | P0 |
| **内存占用** | ~100-150MB | <80MB | P1 |
| **WebView 初始化** | ~500ms | <200ms | P1 |
| **离线包加载** | ~300ms | <150ms | P2 |

---

## 🚀 WebView 优化

### 1. WebView 池化机制

```java
// H5WebViewFactory
public class H5WebViewFactory {
    
    private static final int MAX_POOL_SIZE = 5;
    private static Queue<H5WebView> webViewPool = new LinkedBlockingQueue<>();
    
    public static H5WebView obtain(Activity activity, H5Page page, Bundle params) {
        // 尝试从池中获取
        H5WebView webView = webViewPool.poll();
        
        if (webView == null) {
            // 池为空，创建新的
            webView = new H5WebView(activity, page, params);
        } else {
            // 复用 WebView，重置状态
            webView.reset(activity, page, params);
        }
        
        return webView;
    }
    
    public static void recycle(H5WebView webView) {
        if (webViewPool.size() < MAX_POOL_SIZE) {
            // 清理 WebView 状态
            webView.clear();
            webViewPool.offer(webView);
        }
    }
}
```

### 2. 预加载机制

```java
// H5PreLoader
public class H5PreLoader {
    
    private static final int PRELOAD_COUNT = 2;
    private static Queue<H5WebView> preloadPool = new LinkedBlockingQueue<>();
    
    public static void preload(String url) {
        // 预加载 URL
        if (preloadPool.size() < PRELOAD_COUNT) {
            H5ThreadPoolFactory.getSingleThreadExecutor().execute(() -> {
                H5WebView webView = new H5WebView(null, null, null);
                webView.loadUrl(url);
                preloadPool.offer(webView);
            });
        }
    }
    
    public static H5WebView getPreloaded(String url) {
        // 检查是否有匹配的预加载 WebView
        for (H5WebView webView : preloadPool) {
            if (webView.getUrl().equals(url)) {
                preloadPool.remove(webView);
                return webView;
            }
        }
        return null;
    }
}
```

### 3. 缓存策略

#### DiskLruCache 实现

```java
// H5DiskCache
public class H5DiskCache {
    
    private static final int MAX_SIZE = 100 * 1024 * 1024; // 100MB
    private DiskLruCache cache;
    
    public void put(String key, String value) {
        try {
            DiskLruCache.Editor editor = cache.edit(hashKey(key));
            
            // 写入缓存
            BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(editor.newOutputStream(0)));
            writer.write(value);
            writer.close();
            
            editor.commit();
        } catch (IOException e) {
            Log.e("H5DiskCache", "Put failed", e);
        }
    }
    
    public String get(String key) {
        try {
            DiskLruCache.Snapshot snapshot = cache.get(hashKey(key));
            if (snapshot != null) {
                return snapshot.getString(0);
            }
        } catch (IOException e) {
            Log.e("H5DiskCache", "Get failed", e);
        }
        return null;
    }
    
    // 使用 LRU 淘汰策略
    private String hashKey(String key) {
        return H5SecurityUtil.getMD5(key);
    }
}
```

#### 缓存配置

```java
// H5CacheConfig
public class H5CacheConfig {
    
    // 缓存过期时间 (7天)
    public static final long CACHE_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000L;
    
    // 缓存策略
    public enum CacheStrategy {
        FORCE_CACHE,      // 优先使用缓存
        FORCE_NETWORK,   // 强制请求网络
        CACHE_FIRST,     // 缓存优先，失败后网络
        NETWORK_FIRST    // 网络优先，失败后缓存
    }
    
    // 根据 URL 类型选择策略
    public static CacheStrategy getStrategy(String url) {
        if (isStaticResource(url)) {
            return CacheStrategy.CACHE_FIRST;
        } else if (isAPI(url)) {
            return CacheStrategy.NETWORK_FIRST;
        } else {
            return CacheStrategy.CACHE_FIRST;
        }
    }
}
```

### 4. 资源预连接

```java
// H5PreConnect
public class H5PreConnect {
    
    private static final Set<String> PRE_CONNECT_DOMAINS = new HashSet<>(
        Arrays.asList(
            "https://www.ibanking.chbank.com",
            "https://cdn.xxx.com"
        )
    );
    
    public static void preConnect(String url) {
        // 解析域名
        URL parsedUrl = new URL(url);
        String host = parsedUrl.getHost();
        
        if (PRE_CONNECT_DOMAINS.contains(host)) {
            // 预连接 DNS 和 TCP
            H5ThreadPoolFactory.getCachedThreadExecutor().execute(() -> {
                try {
                    // 打开到服务器的连接
                    URLConnection connection = new URL("https://" + host).openConnection();
                    connection.connect();
                } catch (IOException e) {
                    Log.w("H5PreConnect", "Preconnect failed: " + host);
                }
            });
        }
    }
}
```

---

## 💾 内存优化

### 1. 图片内存缓存

```java
// H5ImageCache
public class H5ImageCache {
    
    private static final int MAX_MEMORY_CACHE = 20 * 1024 * 1024; // 20MB
    private LruCache<String, Bitmap> memoryCache;
    
    public H5ImageCache() {
        // 计算内存缓存大小
        int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);
        int cacheSize = maxMemory / 8;
        
        memoryCache = new LruCache<String, Bitmap>(cacheSize) {
            @Override
            protected int sizeOf(String key, Bitmap bitmap) {
                return bitmap.getByteCount() / 1024;
            }
            
            @Override
            protected void entryRemoved(boolean evicted, String key, 
                                        Bitmap oldValue, Bitmap newValue) {
                if (evicted) {
                    // 放入磁盘缓存
                    saveToDiskCache(key, oldValue);
                }
            }
        };
    }
}
```

### 2. 对象池

```java
// H5ObjectPool
public abstract class H5ObjectPool<T> {
    
    private static final int MAX_SIZE = 100;
    private Queue<T> pool = new LinkedBlockingQueue<>();
    
    public T obtain() {
        T obj = pool.poll();
        if (obj == null) {
            obj = create();
        }
        reset(obj);
        return obj;
    }
    
    public void recycle(T obj) {
        if (pool.size() < MAX_SIZE) {
            pool.offer(obj);
        }
    }
    
    protected abstract T create();
    protected abstract void reset(T obj);
}

// 使用示例: JSONObject 池
public class JSONObjectPool extends H5ObjectPool<JSONObject> {
    protected JSONObject create() {
        return new JSONObject();
    }
    
    protected void reset(JSONObject obj) {
        obj.clear();
    }
}
```

### 3. 内存泄漏检测

```java
// H5LeakDetector
public class H5LeakDetector {
    
    public static void init(Context context) {
        if (BuildConfig.DEBUG) {
            // Debug 版本启用 LeakCanary
            LeakCanary.install((Application) context);
        }
    }
    
    // 常见的内存泄漏模式
    private static final Set<Class<?>> LEAK_PATTERNS = new HashSet<>(
        Arrays.asList(
            Handler.class,
            AsyncTask.class,
            Thread.class,
            TimerTask.class
        )
    );
    
    public static void checkForLeaks(View view) {
        // 检查 View 泄漏
        if (view.getParent() == null) {
            // View 未被添加到视图树，可能泄漏
            Log.w("LeakDetector", "View may leak: " + view.getClass().getName());
        }
    }
}
```

---

## 🗜️ 离线包优化

### 1. 增量更新

```java
// H5PatchManager
public class H5PatchManager {
    
    public void applyPatch(String appId, PatchInfo patchInfo) {
        // 1. 下载增量文件 (patch)
        File patchFile = downloadPatch(patchInfo.patchUrl);
        
        // 2. 下载旧版本包
        File oldPackage = getOldPackage(appId);
        
        // 3. 应用增量补丁
        File newPackage = applyBsDiff(oldPackage, patchFile);
        
        // 4. 校验完整性
        if (verifyChecksum(newPackage, patchInfo.checksum)) {
            // 5. 替换旧包
            replacePackage(appId, newPackage);
        }
    }
}
```

### 2. 离线包压缩

```java
// H5ZipUtil
public class H5ZipUtil {
    
    // 使用 Deflate 算法压缩
    public static void compressZip(File source, File target) {
        try (
            ZipOutputStream zos = new ZipOutputStream(
                new FileOutputStream(target))
        ) {
            // 设置压缩级别 (1-9, 9 最高压缩率)
            zos.setLevel(9);
            
            // 设置压缩方法
            zos.setMethod(ZipOutputStream.DEFLATED);
            
            // 遍历文件
            walkFile(source, source.getName(), zos);
            
        } catch (IOException e) {
            Log.e("H5ZipUtil", "Compress failed", e);
        }
    }
}
```

### 3. 离线包预下载

```java
// H5OfflinePreDownload
public class H5OfflinePreDownload {
    
    private static final int MAX_DOWNLOAD_COUNT = 5;
    
    public static void preDownloadApps(List<String> appIds) {
        // 并发下载离线包
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        for (String appId : appIds) {
            if (count < MAX_DOWNLOAD_COUNT) {
                executor.execute(() -> {
                    try {
                        downloadOfflinePackage(appId);
                    } catch (Exception e) {
                        Log.e("PreDownload", "Failed: " + appId, e);
                    }
                });
            }
        }
    }
}
```

---

## 🧵 线程优化

### 1. 线程池配置

```java
// H5ThreadPoolFactory
public class H5ThreadPoolFactory {
    
    // CPU 密集型任务
    public static ExecutorService getCpuThreadExecutor() {
        return Executors.newFixedThreadPool(
            Math.max(2, Runtime.getRuntime().availableProcessors())
        );
    }
    
    // IO 密集型任务
    public static ExecutorService getIoThreadExecutor() {
        return Executors.newCachedThreadPool();
    }
    
    // 定时任务
    public static ScheduledExecutorService getScheduledExecutor() {
        return Executors.newSingleThreadScheduledExecutor();
    }
    
    // 单线程任务
    public static ExecutorService getSingleThreadExecutor() {
        return Executors.newSingleThreadExecutor();
    }
}
```

### 2. 任务优先级

```java
// H5PriorityExecutor
public class H5PriorityExecutor extends ThreadPoolExecutor {
    
    public H5PriorityExecutor() {
        super(2, 5, 60, TimeUnit.SECONDS,
              new PriorityBlockingQueue<>());
    }
    
    @Override
    public void execute(Runnable command) {
        if (command instanceof PriorityRunnable) {
            super.execute(command);
        } else {
            super.execute(new PriorityRunnable(command, Priority.NORMAL));
        }
    }
}

public class PriorityRunnable implements Runnable {
    private final Priority priority;
    private final Runnable delegate;
    
    public enum Priority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}
```

---

## 📊 性能监控

### 1. FPS 监控

```java
// H5FPSMonitor
public class H5FPSMonitor {
    
    private static final long FRAME_INTERVAL = 16; // 60fps
    private long lastFrameTime;
    private int frameCount;
    private float currentFps;
    
    public void onFrame() {
        long currentTime = System.nanoTime();
        frameCount++;
        
        if (currentTime - lastFrameTime >= 1_000_000_000) {
            currentFps = frameCount;
            frameCount = 0;
            lastFrameTime = currentTime;
            
            if (currentFps < 50) {
                // FPS 低于 50，触发告警
                PerformanceReporter.report("fps_low", currentFps);
            }
        }
    }
}
```

### 2. 页面加载监控

```java
// H5PerformanceMonitor
public class H5PerformanceMetrics {
    
    public static class PerformanceMetrics {
        public long navigationStart;      // 导航开始
        public long domainLookupStart;    // DNS 查询开始
        public long connectStart;         // 连接开始
        public long requestStart;         // 请求开始
        public long responseStart;       // 响应开始
        public long domContentLoaded;     // DOM 内容加载完成
        public long loadEventStart;       // 页面加载完成
        
        // 计算关键指标
        public long getFirstPaint() {
            return responseStart - navigationStart;
        }
        
        public long getDomReady() {
            return domContentLoaded - navigationStart;
        }
        
        public long getPageLoad() {
            return loadEventStart - navigationStart;
        }
    }
}
```

### 3. 内存监控

```java
// H5MemoryMonitor
public class H5MemoryMonitor {
    
    private static final long MAX_MEMORY = 150 * 1024 * 1024; // 150MB
    
    public static void startMonitor() {
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(
            () -> {
                Runtime runtime = Runtime.getRuntime();
                long usedMemory = runtime.totalMemory() - runtime.freeMemory();
                long maxMemory = runtime.maxMemory();
                
                float usagePercent = (float) usedMemory / maxMemory * 100;
                
                if (usagePercent > 80) {
                    // 内存使用超过 80%
                    PerformanceReporter.report("memory_high", usagePercent);
                }
                
                if (usedMemory > MAX_MEMORY) {
                    // 触发内存警告
                    System.gc();
                }
            },
            0, 30, TimeUnit.SECONDS
        );
    }
}
```

---

## 🎯 优化建议清单

### P0 - 紧急优化

- [ ] **WebView 池化**: 减少 WebView 创建开销
- [ ] **离线包预加载**: 提升页面加载速度
- [ ] **图片三级缓存**: 减少重复下载

### P1 - 高优优化

- [ ] **内存泄漏修复**: 解决 Handler/Context 泄漏
- [ ] **线程池配置**: 优化线程使用
- [ ] **FPS 监控**: 实时监控页面流畅度

### P2 - 中优优化

- [ ] **增量更新**: 减少离线包下载量
- [ ] **预连接 DNS**: 减少网络延迟
- [ ] **资源压缩**: 减小包体积

---

*文档生成时间: 2026-02-05*
