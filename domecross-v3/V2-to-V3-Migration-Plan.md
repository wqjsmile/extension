# Domecross Chrome扩展 V2 到 V3 迁移计划

## 项目概述
Domecross是一个专门为网站测试员提供的Chrome扩展，可模拟网站多地点打开效果和进行访问速度评估。当前版本基于Manifest V2，需要升级到Manifest V3以符合Chrome的新要求。

## 当前V2版本分析

### 项目结构
```
extracted/
├── manifest.json           # V2清单文件
├── main.html              # 后台页面 (Background Page)
├── popup.html             # 弹出页面
├── login.html             # 登录页面
├── option.html            # 选项页面
├── js/
│   ├── app.js             # 主应用逻辑
│   ├── controllers.js     # Angular控制器
│   ├── services.js        # Angular服务
│   ├── filters.js         # Angular过滤器
│   └── directives.js      # Angular指令
├── css/                   # 样式文件
├── images/                # 图标资源
└── lib/                   # 第三方库
    ├── angular/
    ├── bootstrap/
    ├── jquery/
    └── 其他库
```

### 核心功能分析
1. **代理管理**: 通过Chrome proxy API设置代理服务器
2. **标签页监控**: 监听标签页的创建、更新、移除等事件
3. **网站测试**: 对指定域名进行多地点访问测试
4. **用户认证**: 集成登录和付费功能
5. **数据存储**: 使用localStorage存储用户设置和状态

### 关键API使用
- `chrome.proxy`: 代理设置
- `chrome.tabs`: 标签页管理
- `chrome.notifications`: 通知
- `chrome.webRequest`: 网络请求拦截
- Background Page: 持久后台页面

## V3 迁移计划

### 阶段1: 清单文件升级
**目标**: 将manifest.json从V2格式升级到V3

**主要变更**:
1. `manifest_version`: 2 → 3
2. `browser_action` → `action`
3. `background.page` → `background.service_worker`
4. 更新`content_security_policy`格式
5. 调整权限声明

**改造原因**: V3要求使用新的清单格式，移除了对持久后台页面的支持

### 阶段2: Service Worker迁移
**目标**: 将background page改为service worker

**主要变更**:
1. 创建独立的service worker文件
2. 迁移事件监听逻辑
3. 处理DOM依赖问题
4. 实现消息传递机制

**改造原因**: V3不再支持background page，必须使用service worker

### 阶段3: API适配
**目标**: 更新已废弃的API调用

**主要变更**:
1. 更新tabs API的回调为Promise
2. 适配新的通知API
3. 处理权限变更

**改造原因**: 许多V2 API在V3中已被废弃或变更

### 阶段4: 架构优化
**目标**: 优化代码结构以适应V3

**主要变更**:
1. 重构状态管理
2. 优化消息传递
3. 改进错误处理

**改造原因**: V3的架构变化要求重新设计部分功能

## 详细实施步骤

### Step 1: Manifest V3 升级

#### 原始manifest.json分析
```json
{
    "manifest_version": 2,                    // 需要升级到3
    "name": "Domecross", 
    "version": "8.10.12",
    "description": "专门为网站测试员提供的插件，可模拟网站多地点打开效果和进行访问速度评估。",
    "icons": {                               // 保持不变
        "16": "images/domecross/logos/logo_green.png",
        "48": "images/domecross/logos/logo_green.png", 
        "128": "images/domecross/logos/logo_green.png"
    },
    "browser_action": {                      // V3中改为action
        "defualt_icon": {                    // 注意：这里有拼写错误
            "19": "images/domecross/logos/logo_green.png",
            "38": "images/domecross/logos/logo_green.png"
        },
        "default_title": "Domecross",
        "default_popup": "popup.html"
    },
    "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'",  // V3格式不同
    "permissions": [                         // 部分权限需要调整
        "proxy",
        "tabs", 
        "cookies",
        "notifications",
        "http://*.lubotv.com/",
        "https://*.lubotv.com/"
    ],
    "background": {                          // V3中改为service_worker
        "page": "main.html"
    },
    "update_url": "http://clients2.google.com/service/update2/crx"  // 可选保留
}
```

#### V3版本manifest.json
```json
{
    "manifest_version": 3,
    "name": "Domecross",
    "version": "8.10.12", 
    "description": "专门为网站测试员提供的插件，可模拟网站多地点打开效果和进行访问速度评估。",
    "icons": {
        "16": "images/domecross/logos/logo_green.png",
        "48": "images/domecross/logos/logo_green.png",
        "128": "images/domecross/logos/logo_green.png"
    },
    "action": {
        "default_icon": {
            "19": "images/domecross/logos/logo_green.png", 
            "38": "images/domecross/logos/logo_green.png"
        },
        "default_title": "Domecross",
        "default_popup": "popup.html"
    },
    "content_security_policy": {
        "extension_pages": "script-src 'self'; object-src 'self'"
    },
    "permissions": [
        "proxy",
        "tabs",
        "cookies", 
        "notifications",
        "storage"
    ],
    "host_permissions": [
        "http://*.lubotv.com/",
        "https://*.lubotv.com/"
    ],
    "background": {
        "service_worker": "service-worker.js"
    }
}
```

**主要变更说明**:
1. **manifest_version**: 升级到3
2. **browser_action → action**: V3统一使用action
3. **修复拼写错误**: defualt_icon → default_icon  
4. **content_security_policy**: V3要求对象格式，移除unsafe-eval
5. **权限分离**: 将host权限移到host_permissions
6. **添加storage权限**: 用于替代localStorage在service worker中的使用
7. **background**: 改为service_worker指向新文件

### Step 2: Service Worker创建

#### 分析main.html的功能
main.html作为background page包含：
1. Angular应用初始化
2. 代理设置逻辑
3. 标签页事件监听
4. 网络请求处理
5. 定时任务

#### 创建service-worker.js
由于service worker不支持DOM，需要重构main.html中的逻辑。

### Step 3: Angular应用适配

#### 问题分析
当前应用大量使用了：
1. Angular 1.x框架
2. jQuery操作
3. Bootstrap UI组件
4. localStorage存储

#### V3适配策略
1. **保留Angular**: popup.html等页面仍可使用
2. **Service Worker重构**: 提取纯逻辑代码
3. **消息传递**: 建立popup与service worker通信
4. **存储迁移**: localStorage → chrome.storage

## 风险评估与缓解策略

### 高风险项
1. **Service Worker限制**: 无DOM访问，需要重构
2. **Angular依赖**: 大量业务逻辑绑定在Angular中
3. **代理API**: 可能存在兼容性问题
4. **第三方库**: 部分库可能不兼容V3

### 缓解策略
1. **逐步迁移**: 分阶段进行，确保每步可回滚
2. **功能验证**: 每个阶段完成后进行全面测试
3. **备用方案**: 保留V2版本作为后备
4. **用户通知**: 提前告知用户升级计划

## 时间计划
- **阶段1-2**: 2-3天 (清单升级 + Service Worker基础)
- **阶段3**: 2-3天 (API适配)  
- **阶段4**: 1-2天 (优化测试)
- **总计**: 5-8天

## 验收标准
1. 所有V2功能在V3中正常工作
2. Chrome DevTools无错误
3. 通过Chrome Web Store审核
4. 性能不低于V2版本
5. 用户体验保持一致
