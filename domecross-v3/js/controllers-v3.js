/**
 * Domecross V3 Controllers - 适配Chrome Extension V3
 * 从原controllers.js重构而来，移除background page逻辑，专注于popup功能
 */

/**
 * popup控制器 - 主要的popup界面控制器
 * V3改造说明: 移除了background page相关逻辑，使用异步初始化
 */
var popup = rocket.controller("popup", ["$scope", "$rootScope", "baseService", "popupService", "config", function($scope, $rootScope, baseService, popupService, config){
    console.log('Popup控制器初始化 - V3版本');
    
    // 初始化配置
    config.init();

    // 异步初始化
    async function initializePopup() {
        try {
            // 获取当前访问的网站
            await popupService.getCurrentTabUrl();
            popupService.setWebDomain();

            // baseService初始化
            await baseService.init();

            // 检查用户登录状态
            const email = await window.storageAdapter.get('email');
            if (!email) {
                // V3改造说明: 使用适配器打开登录页面
                await window.chromeAdapter.createTab({
                    url: 'login.html#login',
                    active: true
                });
            }

            // 初始化UI状态
            $rootScope.add_this = "";
            $rootScope.remove_this = "hide";
            $rootScope.normal_adds_div = "";
            $rootScope.error_adds_div = "hide";
            
            // 初始化进度条状态
            $scope.loading = false;
            
            // 初始化个人设置按钮状态
            initPersonalSettingsButton();
            
            // 加载当前代理模式状态
            await loadProxyModeStatus();
            
            // 加载当前服务器信息
            await loadCurrentServerInfo();
            
            $scope.$apply();
            
        } catch (error) {
            console.error('Popup初始化失败:', error);
        }
    }
    
    /**
     * 初始化个人设置按钮状态
     * V3改造说明: 参考V2版本逻辑，根据用户VIP状态设置按钮文本和样式
     */
    function initPersonalSettingsButton() {
        try {
            // 默认设置
            $rootScope.personSet = "个人设置";
            $rootScope.personSetClass = "btn-default";
            
            // 根据用户VIP等级和历史状态调整按钮文本和样式
            const level = localStorage.level;
            const historyVip = localStorage.history_vip;
            
            if (level !== '1') {
                // 用户不是VIP
                if (historyVip !== '0') {
                    // 有VIP历史，显示"开通VIP"
                    $rootScope.personSet = "开通VIP";
                    $rootScope.personSetClass = "btn-danger";
                } else {
                    // 没有VIP历史，显示"申请试用"
                    $rootScope.personSet = "申请试用";
                    $rootScope.personSetClass = "btn-warning";
                }
            }
            
            console.log('个人设置按钮状态初始化:', $rootScope.personSet, $rootScope.personSetClass);
        } catch (error) {
            console.error('初始化个人设置按钮状态失败:', error);
            // 设置默认值
            $rootScope.personSet = "个人设置";
            $rootScope.personSetClass = "btn-default";
        }
    }
    
    /**
     * 加载代理模式状态
     * V3改造说明: 优先从localStorage读取，确保用户设置的持久性
     */
    async function loadProxyModeStatus() {
        try {
            // 优先从localStorage读取用户设置，如果没有则使用默认值
            let proxyMode = localStorage.ProxyMode;
            
            if (!proxyMode) {
                // 如果localStorage没有设置，尝试从chrome.storage读取
                proxyMode = await window.storageAdapter.get('ProxyMode') || 'close';
                // 将读取到的值同步到localStorage
                if (proxyMode) {
                    localStorage.ProxyMode = proxyMode;
                }
            } else {
                // 如果localStorage有设置，同步到chrome.storage
                await window.storageAdapter.set('ProxyMode', proxyMode);
            }
            
            console.log('loadProxyModeStatus: 当前代理模式 =', proxyMode);
            await baseService.updateProxyModeButtons(proxyMode);
        } catch (error) {
            console.error('加载代理模式状态失败:', error);
            // 出错时使用默认值
            await baseService.updateProxyModeButtons('close');
        }
    }
    
    /**
     * 加载当前服务器信息
     * V3改造说明: 异步加载服务器信息，参考V2版本的goDefault逻辑
     */
    async function loadCurrentServerInfo() {
        try {
            // 优先从localStorage读取，这是V2版本的核心逻辑
            if (localStorage.lineName && localStorage.lineName !== "请选择测试点") {
                $rootScope.lineName = localStorage.lineName;
                $scope.currentServerSn = localStorage.netsn || '';  // V3改造说明: 设置当前服务器SN供单选按钮使用
                console.log('从localStorage恢复服务器选择:', localStorage.lineName, 'SN:', $scope.currentServerSn);
                
                // 同步到chrome.storage
                const currentServer = {
                    name: localStorage.lineName,
                    sn: localStorage.netsn || ''
                };
                await window.storageAdapter.set('currentServer', currentServer);
                return;
            }
            
            // 如果localStorage中没有，尝试从chrome.storage获取
            let currentServer = await window.storageAdapter.get('currentServer');
            
            if (currentServer && currentServer.name) {
                $rootScope.lineName = currentServer.name;
                $scope.currentServerSn = currentServer.sn || '';   // V3改造说明: 设置当前服务器SN供单选按钮使用
                // 同步到localStorage
                localStorage.lineName = currentServer.name;
                if (currentServer.sn) {
                    localStorage.netsn = currentServer.sn;
                }
                console.log('从chrome.storage恢复服务器选择:', currentServer.name, 'SN:', $scope.currentServerSn);
            } else {
                // 只有在localStorage中也没有时才设置默认值，不清除用户之前的选择
                if (!localStorage.lineName || localStorage.lineName === "请选择测试点") {
                    $rootScope.lineName = "请选择测试点";
                    $scope.currentServerSn = '';
                } else {
                    // 保持localStorage中的选择，确保用户选择在登录/退出后保持
                    $rootScope.lineName = localStorage.lineName;
                    $scope.currentServerSn = localStorage.netsn || '';
                    console.log('保持localStorage中的服务器选择:', localStorage.lineName, 'SN:', $scope.currentServerSn);
                }
            }
        } catch (error) {
            console.error('加载服务器信息失败:', error);
            // 出错时也不清除用户之前的选择
            if (!localStorage.lineName || localStorage.lineName === "请选择测试点") {
                $rootScope.lineName = "请选择测试点";
                $scope.currentServerSn = '';
            } else {
                $rootScope.lineName = localStorage.lineName;
                $scope.currentServerSn = localStorage.netsn || '';
                console.log('出错时保持localStorage中的服务器选择:', localStorage.lineName, 'SN:', $scope.currentServerSn);
            }
        }
    }
    
    // V3改造说明: 监听服务器选择变化事件，更新单选按钮状态
    $scope.$on('serverSelectionChanged', function(event, serverInfo) {
        $scope.currentServerSn = serverInfo.sn;
        console.log('Popup控制器: 收到服务器选择变化事件, 更新currentServerSn:', serverInfo.sn);
    });
    
    // 启动异步初始化
    initializePopup();
    
    // V3改造说明: 每次进入测试点列表页面时，从localStorage恢复当前选中状态
    $scope.$watch('tab4', function(newVal, oldVal) {
        if (newVal === '' && oldVal === 'hide') {
            // 从隐藏状态变为显示状态，说明进入了测试点列表页面
            // 从localStorage恢复当前选中的服务器SN
            var currentSn = localStorage.getItem('netsn') || '';
            if (currentSn && currentSn !== $scope.currentServerSn) {
                $scope.currentServerSn = currentSn;
                console.log('Popup控制器: 进入测试点列表页面，恢复当前选中状态:', currentSn);
            }
        }
    });
}]);

/**
 * V3改造说明: 移除了background控制器，因为在V3中background page不存在
 * 原background控制器的功能已迁移到service-worker.js中
 */

/**
 * option控制器 - 选项页面控制器
 * V3改造说明: 从原controllers.js移植option控制器的完整功能
 */
var option = rocket.controller("option", ["$scope", "$rootScope", "baseService", "popupService", "$http", "config", function($scope, $rootScope, baseService, popupService, $http, config){
    console.log('Option控制器初始化 - V3版本');
    
    config.init();
    // baseService初始化
    baseService.init();
    
    $scope.tab1 = "";
    $scope.tab2 = "hide";
    $scope.tab1_span = "";
    $scope.tab2_span = "hide";
    $rootScope.tryout = "hide";
    
    // 检查登录状态
    if(!localStorage.email){
        window.location.href = "login.html";
    }

    $scope.emailshow = localStorage.email;
    $scope.expireleft = "非VIP高级会员";
    $scope.vipAlert = "show";

    // 设置URL变量
    $scope.forget_url = forget_url;
    $scope.pay_url = pay_url;
    $scope.instructions_url = instructions_url;
    $scope.index_url = index_url;

    // 计算会员状态和剩余天数
    if(localStorage.expire && localStorage.level > 0){
        var now = new Date();
        now = Date.parse(now);
        var left_expire = new Date(localStorage.expire);
        left_expire = Date.parse(left_expire);
        var expireleft = (left_expire - now) / (1000 * 3600 * 24);

        if(expireleft >= 0){
            if(expireleft <= 0.1) expireleft = 0.1;
            $scope.expireleft = "剩余 " + expireleft.toFixed(1) + " 天";
            $scope.vipAlert = "hide";
        }
    }

    // 加载域名列表
    var autoProxyList = localStorage.autoProxyList.split(",");
    if(localStorage.sort == "name"){
        autoProxyList = autoProxyList.sort();
        $scope.paixu = "按字母顺序排序";
    } else {
        localStorage.sort = "time";
        $scope.paixu = "按添加时间排序";
    }
    $scope.autoProxyList = autoProxyList;

    // 初始化域名验证提示状态
    $scope.addalert1 = "";      // 信息提示
    $scope.addalert2 = "hide";  // 错误提示（域名不合法）
    $scope.addalert3 = "hide";  // 成功提示

    // 设置网站URL变量（用于邀请链接）
    $scope.websiteurl = websiteurl;
    $rootScope.websiteurl = websiteurl;
    
    // 设置分享内容
    $scope.fenxiang = fenxiang;
    $scope.fenxiang_encode = encodeURIComponent(fenxiang);
    $rootScope.fenxiang = fenxiang;
    $rootScope.fenxiang_encode = encodeURIComponent(fenxiang);
    
    // 修改密码功能模块 Starts
    $scope.changesub = "确认修改";
    $scope.change_sub = function(){
        var add = "";
        var i = 1;
        $scope.changesub = "提交中";
        var regbutton = setInterval(function(){
            if(i<4){
                add = add + ".";
            } else {
                i = 0;
                add = "";
            }
            i++;
            $scope.changesub = "提交中" + add;
            $scope.$apply();
        }, 500);

        $scope.changeForm.$invalid = true;

        // 核心更改密码开始
        var mail = localStorage.email;
        var password = md5($("#password").val());
        var newpassword = md5($("#newpassword").val());
        
        // 更改密码交互
        if((!mail) || (!password) || (!newpassword)){
            $("#ts_error").show(100);
            $("#ts_error").text("发送严重错误!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            }, 5000);
            clearInterval(regbutton);
            $scope.changeForm.$invalid = false;
            $scope.changesub = "确认修改";
            return false;
        }
        
        var l = jerry(localStorage.positiona);
        $http({
            method: 'GET',
            url: l,
            params: {
                'type': '4',
                'email': mail,
                'password': password,
                'newpassword': newpassword
            }
        }).success(function(data, header, config, status){
            // 响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var spassword = data.password;
            
            if(type == "success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                }, 3000);
                
                // 修改成功
                $("#password").val('');
                $("#newpassword").val('');
                $("#newpassword2").val('');
                localStorage.password = spassword;

                clearInterval(regbutton);
                $scope.changeForm.$invalid = false;
                $scope.changesub = "确认修改";
                $('#changePassword').modal('hide');
            }
            if(type == "error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                }, 5000);
                clearInterval(regbutton);
                $scope.changeForm.$invalid = false;
                $scope.changesub = "确认修改";
            }
        }).error(function(data, header, config, status){
            // 处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            }, 5000);
            clearInterval(regbutton);
            $scope.changeForm.$invalid = false;
            $scope.changesub = "确认修改";
        });
        // 核心更改密码结束
    };
    // 修改密码功能模块 Ends
    
    console.log('Option控制器初始化完成 - 会员状态:', $scope.expireleft);
}]);

/**
 * login控制器 - 登录页面控制器
 */
var log = rocket.controller("log", ["$scope", "$rootScope", "$http", "config", function($scope, $rootScope, $http, config){
    console.log('Login控制器初始化 - V3版本');
    
    // 初始化配置
    config.init();
    
    // 设置必要的scope变量
    $scope.regsub = "注册";
    $scope.logsub = "登录"; 
    $scope.verify_msg = "";
    $scope.verify = false;
    $scope.verify_send = false;
    
    // 初始化测试点相关变量
    $scope.tab3 = "";
    $scope.tab4 = "hide";
    $scope.netlines = [];
    $scope.loading = false;
    
    // 加载当前选择的测试点
    loadCurrentServerInfo();
    
    // 初始化个人设置按钮（V3版本）
    initPersonalSettingsButton();
    
    /**
     * 加载当前服务器信息
     * V3改造说明: 异步加载服务器信息，参考V2版本的goDefault逻辑
     */
    async function loadCurrentServerInfo() {
        try {
            // 优先从localStorage读取，这是V2版本的核心逻辑
            if (localStorage.lineName && localStorage.lineName !== "请选择测试点") {
                $scope.lineName = localStorage.lineName;
                console.log('从localStorage恢复服务器选择:', localStorage.lineName);
                
                // 同步到chrome.storage
                const currentServer = {
                    name: localStorage.lineName,
                    sn: localStorage.netsn || ''
                };
                await window.storageAdapter.set('currentServer', currentServer);
                return;
            }
            
            // 如果localStorage中没有，尝试从chrome.storage获取
            let currentServer = await window.storageAdapter.get('currentServer');
            
            if (currentServer && currentServer.name) {
                $scope.lineName = currentServer.name;
                // 同步到localStorage
                localStorage.lineName = currentServer.name;
                if (currentServer.sn) {
                    localStorage.netsn = currentServer.sn;
                }
                console.log('从chrome.storage恢复服务器选择:', currentServer.name);
            } else {
                $scope.lineName = "请选择测试点";
            }
        } catch (error) {
            console.error('加载服务器信息失败:', error);
            $scope.lineName = "请选择测试点";
        }
    }
    
    // 处理URL hash（注册/登录切换）
    var hash = location.hash;
    if(hash != "#login"){
        hash = "#register";
    }
    setTimeout(function() {
        if (typeof $ !== 'undefined' && $(hash+"_tab").length) {
            $(hash+"_tab").tab('show');
        }
    }, 100);
    
    // 获取API URL
    var l = jerry(localStorage.positiona);
    var apiUrl = l;
    
    // 注册功能
    $scope.reg_sub = function(){
        if (!$scope.myEmail || !$scope.password || !$scope.passwordagain) {
            return;
        }
        
        var add = "";
        var i = 1;
        $scope.regsub = "注册中请稍后";
        var regbutton = setInterval(function(){
            if(i<4){
                add = add + ".";
            } else {
                i = 0;
                add = "";
            }
            i++;
            $scope.regsub = "注册中请稍后" + add;
            $scope.$apply();
        }, 500);
        
        $scope.regForm.$invalid = true;
        
        // 核心注册开始
        var mail = $("#reg_email").val();
        var password = md5($("#reg_password").val());
        var verify = $("#reg_verify").val();
        
        console.log('注册API URL:', apiUrl);
        
        // 注册交互
        $http({
            method: 'GET',
            url: apiUrl,
            params: {
                'type': '2',
                'email': mail,
                'password': password,
                'verify': verify
            }
        }).success(function(data, header, config, status){
            // 响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var spassword = data.password;
            
            if(type == "success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                }, 5000);
                
                // 注册成功
                localStorage.email = mail;
                localStorage.token = token;
                localStorage.password = spassword;
                localStorage.level = 0;
                location.href = "option.html";
            }
            if(type == "error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                }, 5000);
                clearInterval(regbutton);
                $scope.regForm.$invalid = false;
                $scope.regsub = "注册";
            }
        }).error(function(data, header, config, status){
            // 处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            }, 5000);
            clearInterval(regbutton);
            $scope.regForm.$invalid = false;
            $scope.regsub = "注册";
        });
    };
    
    // 登录功能
    $scope.log_sub = function(){
        if (!$scope.myEmail || !$scope.password) {
            return;
        }
        
        var add = "";
        var i = 1;
        $scope.logsub = "登录中请稍后";
        var logbutton = setInterval(function(){
            if(i<4){
                add = add + ".";
            } else {
                i = 0;
                add = "";
            }
            i++;
            $scope.logsub = "登录中请稍后" + add;
            $scope.$apply();
        }, 500);
        
        $scope.logForm.$invalid = true;
        
        // 核心登录开始
        var mail = $("#log_email").val();
        var password = md5($("#log_password").val());
        
        console.log('解密后的API URL:', apiUrl);
        console.log('登录请求参数:', {
            method: 'GET',
            url: apiUrl,
            params: {
                'type': '3',
                'email': mail,
                'password': password
            }
        });
        
        // 登录交互
        $http({
            method: 'GET',
            url: apiUrl,
            params: {
                'type': '3',
                'email': mail,
                'password': password
            }
        }).success(function(data, header, config, status){
            console.log('登录响应:', data);
            console.log('响应头:', header);
            console.log('状态码:', status);
            // 响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var level = data.level;
            var expire = data.expire;
            var spassword = data.password;
            
            if(type == "success" || type == "3"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                }, 5000);
                
                // 登录成功
                localStorage.email = mail;
                localStorage.token = token;
                localStorage.level = level;
                localStorage.expire = expire;
                localStorage.password = spassword;
                
                // V3改造说明: 只在首次登录或ProxyMode未设置时才自动设置为smarty
                // 避免覆盖用户手动设置的always模式
                if(level > 0 && !localStorage.ProxyMode){
                    localStorage.ProxyMode = "smarty";
                }
                location.href = "option.html";
            }
            if(type == "error" || type == "999"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg || "登录失败，请检查账号密码");
                setTimeout(function(){
                    $("#ts_error").hide(100);
                }, 5000);
                clearInterval(logbutton);
                $scope.logForm.$invalid = false;
                $scope.logsub = "登录";
            }
        }).error(function(data, header, config, status){
            // 处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            }, 5000);
            clearInterval(logbutton);
            $scope.logForm.$invalid = false;
            $scope.logsub = "登录";
        });
    };
    
    // 加载当前选择的测试点信息
    async function loadCurrentServerInfo() {
        try {
            const currentServer = await window.storageAdapter.get('currentServer');
            if (currentServer && currentServer.name) {
                $scope.lineName = currentServer.name;
            } else {
                $scope.lineName = "请选择测试点";
            }
        } catch (error) {
            console.error('加载服务器信息失败:', error);
            $scope.lineName = "请选择测试点";
        }
    }
    
    /**
     * 初始化个人设置按钮（V3版本）
     * 确保DOM加载完成后设置点击事件
     */
    function initPersonalSettingsButton() {
        console.log('初始化个人设置按钮 - log控制器');
        
        // 使用$timeout确保DOM加载完成
        setTimeout(() => {
            const personalBtn = document.getElementById('personal-settings-btn');
            if (personalBtn) {
                personalBtn.onclick = function() {
                    console.log('个人设置按钮被点击 - log控制器');
                    
                    // 确保用户已登录
                    if (!localStorage.username) {
                        alert('请先登录');
                        return;
                    }
                    
                    // 打开个人设置页面
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('personal.html')
                    });
                };
                console.log('个人设置按钮事件绑定成功 - log控制器');
            } else {
                console.log('个人设置按钮未找到 - log控制器');
            }
        }, 100);
    }
}]);

/**
 * pay控制器 - 支付页面控制器
 * V3改造说明: 从原controllers.js移植pay控制器的完整功能
 */
var pay = rocket.controller("pay", ["$scope", "$rootScope", "baseService", "popupService", "config", function($scope, $rootScope, baseService, popupService, config){
    console.log('Pay控制器初始化 - V3版本');
    
    // 初始化配置
    config.init();
    
    // baseService初始化
    baseService.init();
    
    // 设置价格变量（从localStorage读取或使用默认值）
    $scope.tc01_s = localStorage.tc01_s ? localStorage.tc01_s : '9';      // 包月显示价格
    $scope.tc02_s = localStorage.tc02_s ? localStorage.tc02_s : '25';    // 季度显示价格  
    $scope.tc01 = localStorage.tc01 ? localStorage.tc01 : '9.00';        // 包月实际价格
    $scope.tc02 = localStorage.tc02 ? localStorage.tc02 : '25.00';       // 季度实际价格
    
    console.log('Pay控制器价格设置:', {
        tc01_s: $scope.tc01_s,
        tc02_s: $scope.tc02_s,
        tc01: $scope.tc01,
        tc02: $scope.tc02
    });
}]);

console.log('Domecross V3 Controllers 加载完成');
