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
                        await baseService.updateProxyModeButtons('always');
                        
                        // 保存用户选择到存储
                        localStorage.ProxyMode = 'always';
                        await window.storageAdapter.set('ProxyMode', 'always');
                        console.log('用户选择始终代理模式，已保存到存储');
                        
                        scope.$apply();
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
                        await baseService.updateProxyModeButtons('smarty');
                        
                        // 保存用户选择到存储
                        localStorage.ProxyMode = 'smarty';
                        await window.storageAdapter.set('ProxyMode', 'smarty');
                        console.log('用户选择按需代理模式，已保存到存储');
                        
                        scope.$apply();
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
                    await baseService.updateProxyModeButtons('close');
                    
                    // 保存用户选择到存储
                    localStorage.ProxyMode = 'close';
                    await window.storageAdapter.set('ProxyMode', 'close');
                    console.log('用户选择关闭代理模式，已保存到存储');
                    
                    scope.$apply();
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
                    console.log('开始获取服务器列表...');
                    
                    // 切换到服务器选择界面并显示进度条
                    scope.tab3 = "hide";
                    scope.tab4 = "";
                    scope.loading = true; // 显示进度条
                    scope.netlines = []; // 清空列表
                    scope.$apply();
                    
                    // 加载服务器列表
                    const response = await net.getServerList();
                    console.log('获取到的服务器列表响应:', response);
                    
                    // 检查响应数据结构
                    if (response && response.serverList && response.serverList.length > 0) {
                        // 处理服务器列表数据，转换为V3格式
                        const serverList = response.serverList.map(server => ({
                            name: server.name || server.serverName || '未知服务器',
                            sn: server.sn || server.serverSn || '',
                            position: server.position || server.serverPosition || '',
                            btnType: server.btnType || 'btn-default',
                            btnTypeName: server.btnTypeName || '普通线路',
                            tj1: server.tuijian ? 'recommend' : '',
                            tj2: server.tuijian ? 'recom-text' : 'hide'
                        }));
                        
                        scope.netlines = serverList;
                        
                        // V3改造说明: 保存服务器列表到存储，供changeLine等函数使用
                        try {
                            await window.storageAdapter.set('serverList', serverList);
                            console.log('服务器列表已保存到存储');
                        } catch (error) {
                            console.warn('保存服务器列表到存储失败:', error);
                        }
                        
                        // 隐藏进度条，显示服务器列表
                        scope.loading = false;
                        scope.$apply();
                        console.log('服务器列表已更新到scope:', serverList);
                    } else {
                        console.warn('服务器列表为空或格式不正确:', response);
                        // 显示错误信息给用户
                        scope.netlines = [];
                        scope.loading = false;
                        scope.$apply();
                    }
                } catch (error) {
                    console.error('获取服务器列表失败:', error);
                    // 显示错误信息给用户
                    scope.netlines = [];
                    scope.loading = false; // 隐藏进度条
                    scope.$apply();
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
                scope.tab3 = "";
                scope.tab4 = "hide";
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
                    if (serverSn && scope.netlines) {
                        // 找到选中的服务器
                        const selectedServer = scope.netlines.find(server => server.sn === serverSn);
                        if (selectedServer) {
                            // 保存当前选中的服务器到chrome.storage
                            await window.storageAdapter.set('currentServer', selectedServer);
                            
                            // 更新显示的服务器名称
                            scope.lineName = selectedServer.name;
                            scope.$root.lineName = selectedServer.name;
                            
                            // V3改造说明: 更新单选按钮状态
                            scope.currentServerSn = selectedServer.sn;
                            
                            // 同时保存到localStorage以兼容原有逻辑
                            localStorage.lineName = selectedServer.name;
                            localStorage.netsn = selectedServer.sn;
                            
                            // V3改造说明: 立即同步到chrome.storage，确保状态持久化
                            if (window.storageAdapter) {
                                window.storageAdapter.set('netsn', selectedServer.sn);
                            }
                            
                            // V3改造说明: 发出事件通知，确保所有相关组件都能收到状态更新
                            if (scope.$root && scope.$root.$broadcast) {
                                scope.$root.$broadcast('serverSelectionChanged', {
                                    name: selectedServer.name,
                                    sn: selectedServer.sn
                                });
                            }
                            
                            console.log('已选择服务器:', selectedServer.name, 'SN:', selectedServer.sn);
                            
                            // 返回主界面
                            scope.tab3 = "";
                            scope.tab4 = "hide";
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

// 域名添加
rocket.directive("webmanageradd", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function(){
                var domainAdd = $("#domainAdd").val();
                if(tldjs.isValid(domainAdd)){
                    // 添加域名操作成功
                    $("#domainAdd").val("");
                    var domain = tldjs.getDomain(domainAdd);
                    baseService.addDoamin(domain);
                    scope.addalert1 = "hide";
                    scope.addalert2 = "hide";
                    scope.addalert3 = "";

                    var autoProxyList = localStorage.autoProxyList.split(",");
                    scope.autoProxyList = autoProxyList;
                    scope.$apply();
                } else {
                    scope.addalert1 = "hide";
                    scope.addalert2 = "";
                    scope.addalert3 = "hide";

                    scope.$apply();
                }
            });
        }
    };
}]);

// 域名列表恢复初始值
rocket.directive("webmanagerdefault", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function(){
                baseService.changeToDefaultDomains();
                var autoProxyList = localStorage.autoProxyList.split(",");
                scope.autoProxyList = autoProxyList;
                scope.$apply();
            });
        }
    };
}]);

// 移除域名
rocket.directive("webmanagerremove", ["baseService", function(baseService){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function(){
                var domainRemove = element.attr('ng-value');
                baseService.removeDomain(domainRemove);
                var autoProxyList = localStorage.autoProxyList.split(",");
                scope.autoProxyList = autoProxyList;
                scope.$apply();
            });
        }
    };
}]);

// 复制邀请链接
rocket.directive("tuijianfuzhi", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function(){
                var tuijianInput = document.getElementById("tuijian");
                tuijianInput.select();
                tuijianInput.setSelectionRange(0, 99999); // For mobile devices
                document.execCommand("copy");
                
                // 显示复制成功提示
                element.text("已复制!");
                setTimeout(function(){
                    element.text("复制");
                }, 2000);
            });
        }
    };
});

// 刷新用户身份 - 刷新当前标签页
rocket.directive("refreshlevel", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    console.log('刷新按钮被点击 - 刷新当前标签页');
                    // V3改造说明: 使用适配器的异步API刷新当前标签页
                    await window.chromeAdapter.reloadTab();
                } catch (error) {
                    console.error('刷新标签页失败:', error);
                }
            });
        }
    };
});

// 退出登录
rocket.directive("logout", ["net", function(net){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", async function () {
                try {
                    // V3改造说明: 先关闭代理模式
                    await window.chromeAdapter.setProxy('close');
                    scope.$apply();
                    
                    // 清除本地存储的登录信息
                    localStorage.email = "";
                    localStorage.token = "";
                    localStorage.level = 0;
                    localStorage.expire = "";
                    localStorage.history_vip = 0;
                    
                    // 跳转到登录页面
                    location.href = "login.html#login";
                } catch (error) {
                    console.error('退出登录失败:', error);
                    // 即使出错也要清除登录信息并跳转
                    localStorage.email = "";
                    localStorage.token = "";
                    localStorage.level = 0;
                    localStorage.expire = "";
                    localStorage.history_vip = 0;
                    location.href = "login.html#login";
                }
            });
        }
    };
}]);

// 标签页切换指令
rocket.directive("tab1", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab1 = "";
                scope.tab2 = "hide";
                scope.tab1_span = "";
                scope.tab2_span = "hide";
                $("#tab1_a").addClass("list-group-item-warning");
                $("#tab2_a").removeClass("list-group-item-warning");

                $("#tab1_div").addClass("left3_active");
                $("#tab2_div").removeClass("left3_active");
                scope.$apply();
            });
        }
    };
});

rocket.directive("tab2", function(){
    return {
        restrict: "AEMC",
        replace: true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab1 = "hide";
                scope.tab2 = "";
                scope.tab1_span = "hide";
                scope.tab2_span = "";

                $("#tab2_a").addClass("list-group-item-warning");
                $("#tab1_a").removeClass("list-group-item-warning");

                $("#tab1_div").addClass("left3_active");
                $("#tab2_div").addClass("left3_active");

                scope.$apply();
            });
        }
    };
});

console.log('Domecross V3 Directives 加载完成');
