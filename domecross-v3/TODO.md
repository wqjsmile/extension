# Domecross V3 开发 TODO 列表

## 🎯 主要任务

### ✅ 已完成
- [x] **修复进度条显示问题** - 根据V2版本逻辑正确控制imgld2元素的显示
- [x] **修复服务器选择保存问题** - 选择后应该更新主界面显示
- [x] **修复测试点持久化问题** - 参考V2版本的goDefault逻辑，确保刷新页面后测试点选择状态能正确恢复
- [x] **修复测试点列表定位问题** - 参考V2版本的changeLine逻辑，确保进入测试点列表时能自动定位到当前选中的节点
- [x] **修复单选按钮选中状态显示问题** - 参考V2版本逻辑，确保单选按钮能正确显示当前选中的测试点
- [x] **修复单选按钮状态持久化问题** - 确保从测试点列表页面返回后，再次进入时能正确显示选中状态

### 🔄 进行中
- [ ] **完善错误处理** - 添加更友好的错误提示和重试机制

### 📋 待处理
- [ ] **性能优化** - 优化页面加载速度和响应性
- [ ] **代码重构** - 清理冗余代码，提高可维护性
- [ ] **测试覆盖** - 添加单元测试和集成测试

## 📝 详细说明

### 测试点持久化修复 (已完成)
**问题描述**: 选择测试点后，刷新页面或重新打开扩展，测试点选择状态丢失

**解决方案**: 
1. 参考V2版本的 `goDefault()` 函数逻辑
2. 优先从 `localStorage.lineName` 读取保存的测试点
3. 在 `popup`、`login`、`baseService` 三个控制器中都添加了 `loadCurrentServerInfo()` 函数
4. 确保每次初始化时都能正确恢复之前选择的测试点状态

**核心逻辑**:
```javascript
// 优先从localStorage读取，这是V2版本的核心逻辑
if (localStorage.lineName && localStorage.lineName !== "请选择测试点") {
    $rootScope.lineName = localStorage.lineName;
    // 同步到chrome.storage
    await window.storageAdapter.set('currentServer', currentServer);
    return;
}
```

**修复位置**:
- `js/controllers-v3.js` - popup和login控制器
- `js/services-v3.js` - baseService

### 测试点列表定位修复 (已完成)
**问题描述**: 虽然测试点选择状态已正确保存，但在测试点列表页面中，没有自动定位到当前选中的节点

**解决方案**: 
1. 参考V2版本的 `changeLine()` 函数逻辑
2. 在 `getServerList()` 获取服务器列表后，自动调用 `changeLineAfterGetServerList()` 函数
3. 该函数会检查当前选中的服务器，并自动定位到对应节点
4. 同时保存服务器列表到存储中，供其他函数使用

**核心逻辑**:
```javascript
// 获取服务器列表后，自动定位到当前选中的节点
if (data && data.serverList && data.serverList.length > 0) {
    await changeLineAfterGetServerList(data.serverList);
}

// 自动定位逻辑
async function changeLineAfterGetServerList(serverList) {
    let currentSn = localStorage.netsn;
    if (!currentSn) {
        // 如果没有选中的服务器，选择第一个推荐的服务器
        const recommendedServer = serverList.find(server => server.tuijian) || serverList[0];
        if (recommendedServer) {
            currentSn = recommendedServer.sn;
            localStorage.netsn = currentSn;
        }
    }
    // 调用changeLine定位到选中的节点
    if (currentSn) {
        await changeLine(currentSn);
    }
}
```

**修复位置**:
- `js/services-v3.js` - net服务，添加了完整的changeLine逻辑
- `js/directives-v3.js` - 保存服务器列表到存储

### 单选按钮选中状态显示修复 (已完成)
**问题描述**: V3版本虽然有单选按钮的HTML代码，但是缺少了选中状态的绑定逻辑，导致单选按钮无法显示当前选中的测试点（如图中V2版本的蓝色实心圆点效果）

**解决方案**: 
1. 在HTML模板中添加了 `ng-checked` 指令绑定
2. 在popup控制器中添加了 `currentServerSn` 变量管理
3. 实现了完整的单选按钮状态管理机制

**核心逻辑**:
```html
<!-- HTML模板修复 -->
<input type="radio" name="netLine" value="{{l.sn}}" ng-checked="l.sn == currentServerSn" />
```

```javascript
// Controller状态管理
$scope.currentServerSn = localStorage.netsn || '';

// 用户选择交互
scope.currentServerSn = selectedServer.sn;

// 事件监听同步
$scope.$on('serverSelectionChanged', function(event, serverInfo) {
    $scope.currentServerSn = serverInfo.sn;
});
```

**修复位置**:
- `popup.html` - 添加ng-checked指令
- `js/controllers-v3.js` - popup控制器状态管理
- `js/directives-v3.js` - chooselinesn指令状态更新

### 单选按钮状态持久化修复 (已完成)
**问题描述**: 当用户从测试点列表页面返回popup页面后，再次进入测试点列表页面时，发现之前选择的测试点并没有被实心蓝点选中

**解决方案**: 
1. 参考V2版本的实现逻辑，V2版本中`$rootScope`是全局共享的
2. 在V3版本中添加了页面切换监听器，每次进入测试点列表页面时都从localStorage恢复状态
3. 实现了完整的状态同步机制，包括localStorage、chrome.storage和事件广播

**核心逻辑**:
```javascript
// 页面切换监听器
$scope.$watch('tab4', function(newVal, oldVal) {
    if (newVal === '' && oldVal === 'hide') {
        // 进入测试点列表页面时，从localStorage恢复状态
        var currentSn = localStorage.getItem('netsn') || '';
        if (currentSn && currentSn !== $scope.currentServerSn) {
            $scope.currentServerSn = currentSn;
        }
    }
});

// 状态同步机制
localStorage.netsn = selectedServer.sn;
if (window.storageAdapter) {
    window.storageAdapter.set('netsn', selectedServer.sn);
}
if (scope.$root && scope.$root.$broadcast) {
    scope.$root.$broadcast('serverSelectionChanged', {
        name: selectedServer.name,
        sn: selectedServer.sn
    });
}
```

**修复位置**:
- `js/controllers-v3.js` - 添加页面切换监听器
- `js/directives-v3.js` - 完善状态同步机制

## 🚀 下一步计划
1. 测试测试点持久化功能是否正常工作
2. 完善错误处理机制
3. 进行性能优化
4. 添加测试覆盖

---
*最后更新: 2024-12-19*
