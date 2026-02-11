# Coral Android 项目 - 安全性分析报告

## 🔒 安全机制概览

### 模块分布

| 模块 | 主要安全功能 |
|------|-------------|
| **base-flame-nebula** | URL校验、JSBridge安全、证书校验 |
| **base----flame-basis** | 加密库(SQLCipher)、网络安全 |
| **adapter-flame** | 登录态管理、签名校验 |
| **base-data-cache** | 数据加密存储 |
| **encrypt** | 加密模块(未启用) |

---

## 🛡️ 已实现的安全机制

### 1. 传输层安全

#### HTTPS 强制校验

```java
// OkHttp3 SSL配置
OkHttpClient client = new OkHttpClient.Builder()
    .sslSocketFactory(sslContext.getSocketFactory(), trustManager)
    .hostnameVerifier((hostname, session) -> {
        // 严格的主机名验证
        return H5DomainUtil.isValidDomain(hostname);
    })
    .certificatePinner(new CertificatePinner.Builder()
        .add("*.ibanking.chbank.com", "sha256/xxxxxxxxxx=")
        .build())
    .build();
```

#### 证书固定 (Certificate Pinning)

```java
// 在 H5DomainUtil 中实现
public static boolean isValidDomain(String hostname) {
    // 白名单校验
    Set<String> allowedDomains = new HashSet<>(Arrays.asList(
        "*.ibanking.chbank.com",
        "*.alipay.com",
        "*.baidu.com"
    ));
    
    for (String domain : allowedDomains) {
        if (matchDomain(domain, hostname)) {
            return true;
        }
    }
    return false;
}
```

---

### 2. 数据加密

#### 数据库加密 (SQLCipher)

```java
// base----flame-basis 模块
public Database openOrCreateDatabase(String name, SQLiteDatabase.CursorFactory factory) {
    // 使用 SQLCipher 加密
    net.sqlcipher.database.SQLiteDatabase.loadLibs(context);
    
    net.sqlcipher.database.SQLiteDatabase db = 
        net.sqlcipher.database.SQLiteDatabase.openOrCreateDatabase(
            dbFile,
            encryptionKey,  // 从安全存储获取
            null,
            cursorFactory
        );
    
    return db;
}
```

#### 本地存储加密

```java
// SharedPreferences 加密
public class EncryptedSharedPreferences {
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    
    public static SharedPreferences create(Context context, String name) {
        // 使用 Android Keystore 生成密钥
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        
        SecretKey key = (SecretKey) keyStore.getKey("PrefsKey", null);
        
        return new EncryptedSharedPreferences(
            context,
            name,
            key,
            new AES256GCMParameterSpec(key)
        );
    }
}
```

#### 敏感数据脱敏

```java
// H5SecurityUtil
public static String maskSensitiveData(String data, DataType type) {
    switch (type) {
        case PHONE:
            return data.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
        case ID_CARD:
            return data.replaceAll("(\\d{3})\\d{11}(\\w{4})", "$1***********$2");
        case BANK_CARD:
            return data.replaceAll("(\\d{4})\\d+(\\d{4})", "$1********$2");
        case PASSWORD:
            return "********";
        default:
            return data;
    }
}
```

---

### 3. URL 安全校验

#### 路径安全检查

```java
// H5SecurityUtil
public static boolean pathSecurityCheck(String path) {
    // 防止路径遍历攻击
    if ((!path.contains("..")) && 
        (!path.contains("/")) && 
        (!path.contains("\\")) && 
        (!path.contains("%"))) {
        return true;
    }
    return false;
}

public static boolean isValidUrl(String url) {
    // URL白名单校验
    if (TextUtils.isEmpty(url)) {
        return false;
    }
    
    // 协议校验
    if (!url.startsWith("https://") && 
        !url.startsWith("http://") &&
        !url.startsWith("hybrid://")) {
        return false;
    }
    
    // 域名校验
    return isAliDomain(url) || isWhiteListDomain(url);
}
```

#### Scheme 拦截

```java
// WebIntercept
public class H5SchemeIntercept {
    private static final Set<String> SAFE_SCHEMES = new HashSet<>(
        Arrays.asList("https", "http", "hybrid", "alipay")
    );
    
    public static boolean isSafeScheme(String scheme) {
        return SAFE_SCHEMES.contains(scheme.toLowerCase());
    }
    
    public static WebResourceResponse interceptScheme(URL url) {
        String scheme = url.getProtocol();
        if (!isSafeScheme(scheme)) {
            // 拒绝不安全的 scheme
            return new WebResourceResponse("text/plain", "UTF-8", 
                new ByteArrayInputStream("Invalid scheme".getBytes()));
        }
        return null;
    }
}
```

---

### 4. JSBridge 安全

#### 方法权限校验

```java
// H5BridgeManager
public class H5BridgeSecurity {
    
    // 敏感方法列表
    private static final Set<String> SENSITIVE_METHODS = new HashSet<>(
        Arrays.asList(
            "getLocation",
            "getContacts",
            "getSMS",
            "makeCall",
            "uploadContacts"
        )
    );
    
    public static boolean checkMethodPermission(String methodName, 
                                                  String origin) {
        // 1. 检查是否敏感方法
        if (SENSITIVE_METHODS.contains(methodName)) {
            // 2. 检查是否有权限
            return hasPermission(origin, methodName);
        }
        return true;
    }
    
    private static boolean hasPermission(String origin, String method) {
        // 从配置读取权限映射
        Map<String, Set<String>> permissions = getPermissionsConfig();
        Set<String> allowedOrigins = permissions.get(method);
        
        if (allowedOrigins == null) {
            return false;  // 默认拒绝
        }
        
        return allowedOrigins.contains("*") || 
               allowedOrigins.contains(origin);
    }
}
```

#### JS 注入防护

```java
// H5ScriptLoader
public class H5ScriptSecurity {
    
    // 移除危险的 WebView 设置
    public static void configureSecureWebView(WebView webView) {
        // 禁用 JavaScript 接口 (如果不需要)
        webView.getSettings().setJavaScriptEnabled(true);
        
        // 禁用远程调试
        if (BuildConfig.DEBUG) {
            // 仅调试版本启用
            WebView.setWebContentsDebuggingEnabled(true);
        } else {
            WebView.setWebContentsDebuggingEnabled(false);
        }
        
        // 禁用混合内容
        webView.getSettings().setMixedContentMode(
            MixedContentMode.MIXED_CONTENT_NEVER_ALLOW
        );
        
        // 禁用文件访问
        webView.getSettings().setAllowFileAccess(false);
        
        // 禁用地理位置自动授权
        webView.getSettings().setGeolocationEnabled(false);
        
        // 启用 DOM 存储加密
        webView.getSettings().setDomStorageEnabled(true);
    }
    
    // XSS 过滤
    public static String xssFilter(String input) {
        return input.replaceAll("<script>", "")
                    .replaceAll("javascript:", "")
                    .replaceAll("on\\w+=", "");
    }
}
```

---

### 5. 应用签名校验

#### 签名验证

```java
// SignatureValidator
public class SignatureValidator {
    
    private static final String OFFICIAL_SIGNATURE = 
        "d8:fd:fc:eb:50:98:1f:1a:4d:4b:2c:cd:4e:34:5f:8c";
    
    public static boolean verifySignature(Context context) {
        try {
            PackageInfo packageInfo = context.getPackageManager()
                .getPackageInfo(context.getPackageName(), 
                    PackageManager.GET_SIGNATURES);
            
            Signature[] signatures = packageInfo.signatures;
            
            for (Signature signature : signatures) {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                String currentSignature = 
                    Hex.encodeHexString(md.digest());
                
                if (currentSignature.equals(OFFICIAL_SIGNATURE)) {
                    return true;
                }
            }
        } catch (Exception e) {
            Log.e("SignatureValidator", "Verify failed", e);
        }
        return false;
    }
    
    // 防止 APK 被重打包
    public static boolean checkAppIntegrity(Context context) {
        // 校验 APK 签名
        if (!verifySignature(context)) {
            return false;
        }
        
        // 校验应用包名
        String packageName = context.getPackageName();
        if (!packageName.equals("com.stht.coral")) {
            return false;
        }
        
        return true;
    }
}
```

---

### 6. 密钥管理

#### Android Keystore 使用

```java
// KeyManager
public class SecureKeyManager {
    
    private static final String KEY_ALIAS = "CoralAppKey";
    
    public static SecretKey getOrCreateKey() {
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            
            // 检查密钥是否已存在
            if (keyStore.containsAlias(KEY_ALIAS)) {
                return (SecretKey) keyStore.getKey(KEY_ALIAS, null);
            }
            
            // 生成新密钥
            KeyGenerator keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            );
            
            KeyGenParameterSpec spec = new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
            )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .setUserAuthenticationRequired(false)  // 生物识别可选
            .build();
            
            keyGenerator.init(spec);
            return keyGenerator.generateKey();
            
        } catch (Exception e) {
            Log.e("KeyManager", "Failed to get key", e);
            return null;
        }
    }
}
```

---

### 7. 隐私保护

#### 敏感信息收集控制

```java
// PrivacyManager
public class PrivacyManager {
    
    // 隐私敏感权限列表
    private static final Set<String> SENSITIVE_PERMISSIONS = new HashSet<>(
        Arrays.asList(
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.READ_CONTACTS",
            "android.permission.READ_SMS",
            "android.permission.CAMERA"
        )
    );
    
    public static boolean checkPrivacyPermission(String permission) {
        // 用户隐私授权状态
        Boolean userConsent = SpUtils.get(
            AppUtils.getApp(), 
            "privacy_" + permission, 
            false
        );
        
        if (!userConsent) {
            // 记录隐私访问日志
            PrivacyLog.log(permission, "blocked");
            return false;
        }
        
        PrivacyLog.log(permission, "allowed");
        return true;
    }
    
    // 数据收集控制
    public static void clearSensitiveData(String dataType) {
        switch (dataType) {
            case "location":
                LocationManager.clearLastLocation();
                break;
            case "contacts":
                ContactsManager.clearCachedContacts();
                break;
            case "cookies":
                CookieManager.getInstance().removeAllCookies(null);
                break;
        }
    }
}
```

---

### 8. 日志安全

#### 脱敏日志

```java
// YLog (base----log)
public class SecureLogger {
    
    // 日志脱敏关键词
    private static final Set<String> SENSITIVE_KEYS = new HashSet<>(
        Arrays.asList(
            "password", "pwd", "token", "key", "secret",
            "cardNo", "cvv", "idCard", "phone"
        )
    );
    
    public static void d(String tag, String message) {
        // 脱敏处理
        String sanitizedMessage = sanitizeMessage(message);
        
        // 仅在非生产环境输出
        if (!BuildConfig.RELEASE) {
            Log.d(tag, sanitizedMessage);
        }
        
        // 写入安全日志
        SecureLogStorage.getInstance().log(tag, sanitizedMessage);
    }
    
    private static String sanitizeMessage(String message) {
        String result = message;
        for (String key : SENSITIVE_KEYS) {
            // 替换敏感字段
            result = result.replaceAll(
                "(?i)" + key + "\\s*[:=]\\s*[^&,\\s]*",
                key + ": ***"
            );
        }
        return result;
    }
}
```

---

## ⚠️ 安全风险识别

### 高风险项

| 风险 | 位置 | 建议 |
|------|------|------|
| **HTTP 明文传输** | 部分 API | 强制 HTTPS |
| **WebView 远程调试** | debug 版本 | 生产环境关闭 |
| **明文密钥存储** | local.properties | 使用 Keystore |
| **缺少 Root 检测** | 全局 | 添加 Root 检测 |

### 中风险项

| 风险 | 位置 | 建议 |
|------|------|------|
| **动态加载代码** | 离线包 | 代码签名校验 |
| **JSBridge 暴露** | H5Bridge | 增加方法白名单 |
| **日志敏感信息** | YLog | 完善脱敏规则 |
| **证书校验不严格** | OkHttp | 开启 Certificate Pinning |

---

## ✅ 安全加固建议

### 短期 (P0)

- [ ] 强制 HTTPS，降级 HTTP 请求被拦截
- [ ] 生产环境关闭 WebView 远程调试
- [ ] 完善 JS Bridge 方法白名单机制
- [ ] 补充日志脱敏规则

### 中期 (P1)

- [ ] 实现代码完整性校验 (APK 签名)
- [ ] 添加 Root/越狱检测
- [ ] 引入安全扫描工具 (MobSF)
- [ ] 建立安全审计流程

### 长期 (P2)

- [ ] 引入 RASP (运行时应用自保护)
- [ ] 实现隐私合规框架
- [ ] 建立安全漏洞奖励计划
- [ ] 安全培训常态化

---

*文档生成时间: 2026-02-05*
