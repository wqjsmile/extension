# 🚀 DomCross Chrome Extension V3 升级项目

## 📋 项目概述

这是一个将DomCross Chrome扩展从Manifest V2成功升级到Manifest V3的完整项目。升级后的扩展符合Chrome最新的安全标准，具有更好的性能和安全性。

## ✨ 主要特性

- ✅ **Manifest V3兼容** - 符合Chrome最新扩展标准
- 🔒 **增强安全性** - 改进的权限模型和内容安全策略
- ⚡ **更好性能** - Service Worker替代Background Page
- 🛡️ **现代化架构** - 异步存储操作和Promise封装
- 🔄 **完整功能** - 保持所有原有代理功能

## 📁 项目结构

```
domcross/
├── manifest.json          # V3版本清单文件
├── background.js          # Service Worker后台脚本
├── popup/                 # 弹出窗口界面
├── js/                    # 核心JavaScript逻辑
├── css/                   # 样式文件
├── images/                # 图标和图片资源
├── lib/                   # 第三方库文件
├── option.html            # 选项页面
├── login.html             # 登录页面
├── pay.html               # 支付页面
└── install.sh             # 安装脚本
```

## 🔄 升级内容

### 1. Manifest文件升级
- 版本号从2升级到3
- 后台脚本改为Service Worker
- 权限模型优化
- 内容安全策略更新

### 2. 后台脚本重构
- `background.js` → Service Worker
- 异步存储操作
- 改进的错误处理
- 网络请求优化

### 3. 代码现代化
- Promise封装的API调用
- 异步/等待语法支持
- 更好的错误捕获
- 代码结构优化

## 📦 安装包

### 开发版本
- `domcross-v3.zip` - 基础开发包
- `domcross-v3-release.zip` - 完整发布包

### 安装脚本
- `install.sh` - macOS/Linux安装脚本
- `install.bat` - Windows安装脚本

## 🚀 快速开始

### 方法1: 使用安装脚本
```bash
# macOS/Linux
./install.sh

# Windows
install.bat
```

### 方法2: 手动安装
1. 解压扩展文件
2. 打开Chrome扩展管理页面 (`chrome://extensions/`)
3. 启用开发者模式
4. 点击"加载已解压的扩展程序"
5. 选择解压后的文件夹

## 🔧 开发说明

### 环境要求
- Chrome 88+ (支持Manifest V3)
- 现代JavaScript环境
- 网络连接 (用于代理功能)

### 主要API
- **Chrome Storage API** - 本地数据存储
- **Chrome Proxy API** - 代理设置管理
- **Chrome Tabs API** - 标签页操作
- **Chrome Runtime API** - 扩展通信

### 核心功能
- 用户认证和登录
- 代理服务器选择
- 自动代理配置
- 线路状态监控
- 支付和会员管理

## 📚 技术文档

- [Manifest V3升级说明](domcross/MANIFEST_V3_EXPLANATION.md)
- [控制器迁移状态](domcross/CONTROLLERS_MIGRATION_STATUS.md)
- [完整迁移总结](domcross/MIGRATION_SUMMARY.md)
- [安装指南](domcross/INSTALLATION_GUIDE.md)

## 🐛 问题排查

### 常见问题
1. **扩展无法加载** - 检查Chrome版本和manifest.json
2. **后台脚本错误** - 查看Service Worker控制台
3. **代理功能异常** - 验证网络连接和账户状态

### 调试方法
- 使用Chrome开发者工具
- 查看扩展管理页面错误信息
- 检查Service Worker日志

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

本项目遵循原有项目的许可证条款。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**🎉 恭喜！DomCross扩展已成功升级到V3版本！**

现在可以享受更安全、更快速的Chrome扩展体验了！
