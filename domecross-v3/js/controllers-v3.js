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
     * 加载代理模式状态
     * V3改造说明: 从chrome.storage读取状态
     */
    async function loadProxyModeStatus() {
        try {
            const proxyMode = await window.storageAdapter.get('ProxyMode') || 'close';
            baseService.updateProxyModeButtons(proxyMode);
        } catch (error) {
            console.error('加载代理模式状态失败:', error);
        }
    }
    
    /**
     * 加载当前服务器信息
     * V3改造说明: 异步加载服务器信息
     */
    async function loadCurrentServerInfo() {
        try {
            const currentServer = await window.storageAdapter.get('currentServer');
            if (currentServer && currentServer.name) {
                $rootScope.lineName = currentServer.name;
            } else {
                $rootScope.lineName = "请选择测试点";
            }
        } catch (error) {
            console.error('加载服务器信息失败:', error);
            $rootScope.lineName = "请选择测试点";
        }
    }
    
    // 启动异步初始化
    initializePopup();
}]);

/**
 * V3改造说明: 移除了background控制器，因为在V3中background page不存在
 * 原background控制器的功能已迁移到service-worker.js中
 */

/**
 * option控制器 - 选项页面控制器（如果需要的话）
 */
var option = rocket.controller("option", ["$scope", "$rootScope", function($scope, $rootScope){
    console.log('Option控制器初始化 - V3版本');
    
    // 选项页面的初始化逻辑
    async function initializeOption() {
        try {
            // 加载用户设置
            const settings = await window.storageAdapter.getMultiple([
                'email', 'autoProxyList', 'ProxyMode', 'currentServer'
            ]);
            
            $rootScope.userSettings = settings;
            $scope.$apply();
            
        } catch (error) {
            console.error('Option页面初始化失败:', error);
        }
    }
    
    initializeOption();
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
                
                if(level > 0 && ((!localStorage.ProxyMode) || localStorage.ProxyMode == "close")){
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
}]);

/**
 * pay控制器 - 支付页面控制器
 */
var pay = rocket.controller("pay", ["$scope", "$rootScope", function($scope, $rootScope){
    console.log('Pay控制器初始化 - V3版本');
    
    // 支付相关的逻辑
    $scope.paymentData = {
        amount: '',
        method: ''
    };
    
    $scope.submitPayment = async function() {
        try {
            // 这里实现支付逻辑
            console.log('支付提交:', $scope.paymentData);
        } catch (error) {
            console.error('支付失败:', error);
        }
    };
}]);

console.log('Domecross V3 Controllers 加载完成');
