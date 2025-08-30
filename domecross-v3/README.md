# Domecross Chrome Extension V3

专门为网站测试员提供的Chrome扩展，可模拟网站多地点打开效果和进行访问速度评估。

## 版本信息

- **当前版本**: v8.10.12
- **Manifest版本**: V3
- **Chrome最低版本**: 88+

## 功能特性

### 🌐 多点测试
- 支持多个地理位置的代理服务器
- 智能代理模式和手动代理切换
- 自动代理域名列表管理

### 🔧 代理管理
- **关闭模式**: 直接访问，无代理
- **智能模式**: 仅列表中的域名使用代理
- **始终模式**: 所有网站都通过代理访问

### 📊 网站分析
- 当前网站域名自动识别
- 错误资源检测和批量处理
- 访问速度评估

### 🎛️ 用户管理
- 用户账户登录系统
- 个性化设置和偏好
- 使用统计和历史记录

## 安装说明

### 开发版安装
1. 下载或克隆此项目
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `domecross-v3` 文件夹
6. 扩展将出现在Chrome工具栏中

### 系统要求
- Chrome浏览器 88+ 版本
- 支持Manifest V3的现代Chrome

## 使用方法

### 基本操作
1. **访问网站**: 正常浏览网页
2. **打开扩展**: 点击工具栏中的Domecross图标
3. **查看状态**: 扩展会显示当前网站信息
4. **管理列表**: 将网站加入或移出代理列表

### 代理设置
1. **选择测试点**: 点击"切换测试点"选择代理服务器
2. **设置模式**: 选择关闭/智能/始终三种代理模式
3. **管理域名**: 添加或移除需要代理的域名

### 高级功能
- **错误检测**: 自动检测页面中无法访问的资源
- **批量操作**: 一键添加多个域名到代理列表
- **个人设置**: 访问选项页面进行详细配置

## 技术架构

### V3架构特点
- **Service Worker**: 替代传统background page
- **消息机制**: popup与service worker通信
- **异步优先**: 全面使用async/await
- **存储统一**: chrome.storage.local替代localStorage

### 核心文件
```
domecross-v3/
├── manifest.json          # V3清单文件
├── service-worker.js      # 后台服务worker
├── popup.html             # 弹出界面
├── js/
│   ├── v3-adapter.js      # V3适配层
│   ├── controllers-v3.js  # Angular控制器
│   ├── services-v3.js     # Angular服务
│   └── directives-v3.js   # Angular指令
└── [资源文件]
```

### 关键技术
- **Framework**: AngularJS 1.x
- **UI**: Bootstrap 3.x
- **Storage**: Chrome Storage API
- **Network**: Fetch API
- **Proxy**: Chrome Proxy API

## 开发说明

### 从V2迁移
本项目已从Manifest V2完全迁移到V3，主要变更包括：

1. **后台脚本重构**: Background Page → Service Worker
2. **API更新**: 废弃API替换为V3兼容版本
3. **权限优化**: 权限声明分离和精简
4. **存储迁移**: localStorage数据自动迁移到chrome.storage

### 开发环境
```bash
# 项目结构
domecross-v3/
├── 核心文件 (manifest.json, service-worker.js, popup.html)
├── js/ (JavaScript逻辑文件)
├── css/ (样式文件)
├── lib/ (第三方库)
├── images/ (图标和图片资源)
└── 文档文件 (README.md, *.md)
```

### 调试方法
1. **Service Worker**: 在扩展管理页面点击"Service Worker"查看日志
2. **Popup调试**: 右键扩展图标选择"检查"
3. **网络监控**: 在开发者工具中监控网络请求
4. **存储查看**: 在Application标签查看chrome.storage数据

## 故障排除

### 常见问题

**Q: 扩展无法加载**
A: 检查Chrome版本是否支持Manifest V3，确认manifest.json语法正确

**Q: Popup无法打开**  
A: 查看扩展管理页面是否有错误，检查popup.html文件路径

**Q: 代理不生效**
A: 确认已选择代理服务器，检查网络连接和服务器状态

**Q: 数据丢失**
A: 首次安装时localStorage数据会自动迁移，如有问题可手动备份

### 获取帮助
- 查看开发者工具Console错误信息
- 检查扩展管理页面的详细错误
- 参考本项目的测试指南文档

## 文档

- [V2到V3迁移计划](V2-to-V3-Migration-Plan.md) - 详细的迁移规划
- [V3迁移总结](V3-Migration-Summary.md) - 完整的改造总结
- [测试指南](TESTING-GUIDE.md) - 测试方法和验证清单

## 更新日志

### v8.10.12 (V3版本)
- ✅ 完全迁移到Manifest V3
- ✅ Service Worker替代Background Page
- ✅ Chrome Storage API替代localStorage
- ✅ 全面异步化改造
- ✅ API兼容性更新
- ✅ 权限和安全优化

### 历史版本
- v8.10.12 (V2版本) - 原始V2版本功能

## 许可证

本项目遵循原有许可证协议。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

**注意**: 这是从V2迁移的V3版本，保持了所有原有功能的同时，提升了安全性和性能。
