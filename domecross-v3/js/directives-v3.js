/**
 * Domecross V3 Directives - 适配Chrome Extension V3
 * 从原directives.js重构而来，使用V3适配的API调用
 */

// 跳转到options个人中心
rocket.directive("hreftooptions", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // V3改造说明: 使用适配器的异步API
                    await window.chromeAdapter.createTab({
                        url: 'option.html',
                        active: true
                    });
                } catch (error) {
                    console.error('打开选项页面失败:', error);
                }
            });
        }
    };
});

// 将当前域名加入自动代理列表
rocket.directive("addcurdomain", ["popupService", function(popupService){
    return {
        restrict: "AEMC", 
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // V3改造说明: 使用currentTabDomain而不是localStorage
                    const webDomain = scope.$root.currentTabDomain || localStorage.currentTabDomain;
                    if (webDomain) {
                        // 添加域名到自动代理列表
                        await popupService.addDomainToAutoProxy(webDomain);
                        
                        // 重新加载页面
                        await window.chromeAdapter.reloadTab();
                        
                        // 关闭popup
                        window.close();
                    } else {
                        console.error('无法获取当前域名');
                    }
                } catch (error) {
                    console.error('添加域名失败:', error);
                }
            });
        }
    };
}]);

// 将错误域名加入自动代理列表 
rocket.directive("adderrordomain", ["popupService", function(popupService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // 获取选中的错误域名
                    const selectedDomains = [];
                    $('.error_adds:checked').each(function() {
                        selectedDomains.push($(this).val());
                    });
                    
                    // 批量添加域名
                    for (const domain of selectedDomains) {
                        await popupService.addDomainToAutoProxy(domain);
                    }
                    
                    // 重新加载页面
                    await window.chromeAdapter.reloadTab();
                    
                    // 关闭popup
                    window.close();
                } catch (error) {
                    console.error('批量添加域名失败:', error);
                }
            });
        }
    };
}]);

// 从自动代理列表移除当前域名
rocket.directive("removecurdomain", ["popupService", function(popupService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    const webDomain = scope.$root.currentTabDomain || localStorage.currentTabDomain;
                    if (webDomain) {
                        // 从自动代理列表移除域名
                        await popupService.removeDomainFromAutoProxy(webDomain);
                        
                        // 重新加载页面
                        await window.chromeAdapter.reloadTab();
                        
                        // 关闭popup
                        window.close();
                    }
                } catch (error) {
                    console.error('移除域名失败:', error);
                }
            });
        }
    };
}]);

// 代理模式：始终代理
rocket.directive("modealways", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // V3改造说明: 通过service worker设置代理
                    const currentServer = await window.storageAdapter.get('currentServer');
                    if (currentServer) {
                        await window.chromeAdapter.setProxy('always', currentServer);
                        baseService.updateProxyModeButtons('always');
                        scope.$apply();
                        
                        // 重新加载页面
                        await window.chromeAdapter.reloadTab();
                    } else {
                        scope.$root.alertMessage = "请先选择一个代理服务器";
                        scope.$root.alertDivDisplay = "";
                        scope.$apply();
                        
                        setTimeout(() => {
                            scope.$root.alertDivDisplay = "hide";
                            scope.$apply();
                        }, 3000);
                    }
                } catch (error) {
                    console.error('设置始终代理模式失败:', error);
                }
            });
            
            element.on("mouseover", function(){
                scope.$root.alertDivDisplay = "";
                scope.$root.alertMessage = "所有网站都通过代理访问";
                scope.$apply();
            });
            
            element.on("mouseout", function(){
                scope.$root.alertDivDisplay = "hide";
                scope.$apply();
            });
        }
    };
}]);

// 代理模式：智能代理
rocket.directive("modesmarty", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    const currentServer = await window.storageAdapter.get('currentServer');
                    if (currentServer) {
                        await window.chromeAdapter.setProxy('smarty', currentServer);
                        baseService.updateProxyModeButtons('smarty');
                        scope.$apply();
                        
                        // 重新加载页面
                        await window.chromeAdapter.reloadTab();
                    } else {
                        scope.$root.alertMessage = "请先选择一个代理服务器";
                        scope.$root.alertDivDisplay = "";
                        scope.$apply();
                        
                        setTimeout(() => {
                            scope.$root.alertDivDisplay = "hide";
                            scope.$apply();
                        }, 3000);
                    }
                } catch (error) {
                    console.error('设置智能代理模式失败:', error);
                }
            });
            
            element.on("mouseover", function(){
                scope.$root.alertDivDisplay = "";
                scope.$root.alertMessage = "只有列表中的网站通过代理访问";
                scope.$apply();
            });
            
            element.on("mouseout", function(){
                scope.$root.alertDivDisplay = "hide";
                scope.$apply();
            });
        }
    };
}]);

// 代理模式：关闭代理
rocket.directive("modeclose", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    await window.chromeAdapter.setProxy('close');
                    baseService.updateProxyModeButtons('close');
                    scope.$apply();
                    
                    // 重新加载页面
                    await window.chromeAdapter.reloadTab();
                } catch (error) {
                    console.error('关闭代理模式失败:', error);
                }
            });
            
            element.on("mouseover", function(){
                scope.$root.alertDivDisplay = "";
                scope.$root.alertMessage = "关闭代理，直接访问网站";
                scope.$apply();
            });
            
            element.on("mouseout", function(){
                scope.$root.alertDivDisplay = "hide";
                scope.$apply();
            });
        }
    };
}]);

// 网络线路选择
rocket.directive("netline", ["net", function(net){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // 切换到服务器选择界面
                    scope.$root.tab3 = "hide";
                    scope.$root.tab4 = "";
                    scope.$apply();
                    
                    // 加载服务器列表
                    const serverList = await net.getServerList();
                    if (serverList && serverList.length > 0) {
                        scope.$root.netlines = serverList;
                        scope.$apply();
                    }
                } catch (error) {
                    console.error('获取服务器列表失败:', error);
                }
            });
        }
    };
}]);

// 返回主界面
rocket.directive("netlineback", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.$root.tab3 = "";
                scope.$root.tab4 = "hide";
                scope.$apply();
            });
        }
    };
});

// 选择服务器线路
rocket.directive("chooselinesn", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    const serverSn = element.attr('value');
                    if (serverSn && scope.$root.netlines) {
                        // 找到选中的服务器
                        const selectedServer = scope.$root.netlines.find(server => server.sn === serverSn);
                        if (selectedServer) {
                            // 保存当前选中的服务器
                            await window.storageAdapter.set('currentServer', selectedServer);
                            scope.$root.lineName = selectedServer.name;
                            
                            // 返回主界面
                            scope.$root.tab3 = "";
                            scope.$root.tab4 = "hide";
                            scope.$apply();
                        }
                    }
                } catch (error) {
                    console.error('选择服务器失败:', error);
                }
            });
        }
    };
});

// 刷新页面
rocket.directive("reloadtab", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    await window.chromeAdapter.reloadTab();
                } catch (error) {
                    console.error('刷新页面失败:', error);
                }
            });
        }
    };
});

console.log('Domecross V3 Directives 加载完成');
