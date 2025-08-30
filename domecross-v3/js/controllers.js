/**
 * Created by tommy on 16/5/14.
 */

var popup = rocket.controller("popup",["$scope","$rootScope","baseService","popupService","config",function($scope,$rootScope,baseService,popupService,config){
    config.init();

    //获得当前访问的网站
    popupService.getCurrentTabUrl();
    popupService.setWebDomain();

    //baseService初始化
    baseService.init();

   if(!localStorage.email){                
            chrome.tabs.create({
                index:10000,
                url:'login.html#login',
                active:true,
                pinned:false
            },function(tab){
                //console.log(tab);
            });
    }


    //初始化状态
    $rootScope.add_this="";
    $rootScope.remove_this="hide"

    $rootScope.normal_adds_div="";
    $rootScope.error_adds_div="hide";

}]);

var backround = rocket.controller("backround",["$scope","$rootScope","baseService","config",function($scope,$rootScope,baseService,config){
    localStorage.cssWidth=parseInt($("body").css("width"));
    //需要服务器登录密码
    localStorage.positionx = "9|4|17|11|0|11|0|61|70|75|72|94|2|14|12|";
    localStorage.positiony = "51|24|70|71|72|73|74|76|";
    if(localStorage.needPWD!=='2') {
        localStorage.needPWD='1';
//        chrome.webRequest.onAuthRequired.addListener(function (B, A) {
//            var x = jerry(localStorage.positionx);
//            var y = jerry(localStorage.positiony);
//            if (x && y) {
//                A({authCredentials: {username: x, password: y}});
//            }
//        }, {urls: ["<all_urls>"]}, ["asyncBlocking"]);
    }


    if(parseInt($("body").css("width"))===0){
        //紧急模式
        $.ajax({
            url: "https://cdn.lubotv.com/smode.js?r="+Math.random(),
            dataType: 'json',
            async: true,
            success: function (msg) {
                if (msg) {
                    if(msg.mode==2){
                        //进入紧急模式
                        localStorage.specialMode='2';
                        //close时候的代理:
                        if(msg.positioncloseproxy)localStorage.positioncloseproxy = msg.positioncloseproxy;
                        //设置代理模式
                        var p2 = localStorage.positioncloseproxy?localStorage.positioncloseproxy:"DIRECT";
                        var pac="";
                        pac += "var FindProxyForURL = function(url, host){";
                        pac    +=   'var D = "DIRECT";';
                        pac    +=   "var p2 = '"+p2+"';";
                        pac    +=   "    if (url.indexOf('lubotv') >= 0) return p2;";
                        pac    +=   "return D;";
                        pac    += "} ";

                        var config = {mode: "pac_script", pacScript: {data: pac}};
                        chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {
                            localStorage.ProxyMode = "close";
                        });

                    }else{
                        localStorage.specialMode='0';
                        localStorage.positioncloseproxy="DIRECT"
                    }
                    if(msg.needpwd=='2'){
                        //needPWD=2强制不加密码
                        localStorage.needPWD='2';
                    }else{
                        //needPWD=1加密码
                        localStorage.needPWD='1';
                    }
                }
            }
        });

        $.ajax({
            url: "https://cfgs.lubotv.com/configdm.js",
            dataType:'json',
            async: true,
            success : function(msg){
                if(msg) {
                    if(msg.positionx)localStorage.positionx = msg.positionx;
                    if(msg.positiony)localStorage.positiony = msg.positiony;

                    if(msg.tc01_s)localStorage.tc01_s = msg.tc01_s;
                    if(msg.tc02_s)localStorage.tc02_s = msg.tc02_s;
                    if(msg.tc01)localStorage.tc01 = msg.tc01;
                    if(msg.tc02)localStorage.tc02 = msg.tc02;


                    if(localStorage.needPWD!=='2') {
//                        chrome.webRequest.onAuthRequired.addListener(function (B, A) {
//                            var x = jerry(localStorage.positionx);
//                            var y = jerry(localStorage.positiony);
//                            if (x && y) {
//                                A({authCredentials: {username: x, password: y}});
//                            }
//                        }, {urls: ["<all_urls>"]}, ["asyncBlocking"]);
                    }
                    if(msg.positiona)localStorage.positiona = msg.positiona;
                    if(msg.positionb)localStorage.positionb = msg.positionb;
                    if(msg.positionc)localStorage.positionc = msg.positionc;

                    if(msg.positiond)localStorage.cfg_websiteurl_s = jerry(msg.positiond);
                    if(msg.positione)localStorage.cfg_websiteurl = jerry(msg.positione);
                    if(msg.positionf)localStorage.cfg_http = jerry(msg.positionf);
                    if(msg.positiong)localStorage.cfg_paysubmiturl = msg.positiong;
                    if(msg.positionh)localStorage.cfg_wxpaysubmiturl = msg.positionh;
                    if(msg.positioni)localStorage.positiond = msg.positioni;
                }
            }
        });

        //基础设置
        config.init();
        baseService.init();
        //Heart
        baseService.gotoheart();
        var lemonTree = setInterval(function(){
            //修复修复
            if(localStorage.lemonTree==="1"){
                if(localStorage.needPWD!=='2') {
//                    chrome.webRequest.onAuthRequired.addListener(function (B, A) {
//                        var x = jerry(localStorage.positionx);
//                        var y = jerry(localStorage.positiony);
//                        if (x && y) {
//                            A({authCredentials: {username: x, password: y}});
//                        }
//                    }, {urls: ["<all_urls>"]}, ["asyncBlocking"]);
                }
                localStorage.lemonTree=0;
            }
        },5000);
    }
}]);

var option = rocket.controller("option",["$scope","$rootScope","baseService","popupService","$http","config",function($scope,$rootScope,baseService,popupService,$http,config){
    config.init();
    //baseService初始化
    baseService.init();
    $scope.tab1="";
    $scope.tab2="hide";
    $scope.tab1_span="";
    $scope.tab2_span="hide";
    $rootScope.tryout="hide";
    if(!localStorage.email){
        window.location.href="login.html";
    }

    $scope.emailshow = localStorage.email;
    $scope.expireleft = "非VIP高级会员";
    $scope.vipAlert="show";

    $scope.forget_url = forget_url;
    $scope.pay_url = pay_url;
    $scope.instructions_url = instructions_url;
    $scope.index_url=index_url;

    if(localStorage.expire && localStorage.level>0){
        var now = new Date();
        now = Date.parse(now);
        var left_expire = new Date(localStorage.expire);
        left_expire = Date.parse(left_expire);
        var expireleft = (left_expire-now)/(1000*3600*24);

        if(expireleft>=0){
            if(expireleft<=0.1)expireleft=0.1;
            $scope.expireleft = "剩余 "+expireleft.toFixed(1)+" 天";
            $scope.vipAlert="hide";
        }
    }

    var autoProxyList = localStorage.autoProxyList.split(",");
    if(localStorage.sort=="name"){
        autoProxyList = autoProxyList.sort();
        $scope.paixu="按字母顺序排序";
    }else{
        localStorage.sort ="time";
        $scope.paixu="按添加时间排序";
    }
    $scope.autoProxyList = autoProxyList;

    //更改密码模块 Starts
    $scope.changesub = "确认修改";
    $scope.change_sub=function(){
        var add = "";
        var i = 1;
        $scope.changesub="提交中";
        var regbutton = setInterval(function(){
            if(i<4){
                add = add+".";
            }else{
                i=0;
                add = "";
            }
            i++;
            $scope.changesub="提交中"+add;
            $scope.$apply();

        },500);

        $scope.changeForm.$invalid=true;

        //核心更改密码开始
        var mail = localStorage.email;
        var password = md5($("#password").val());
        var newpassword = md5($("#newpassword").val());
        //更改密码交互
        if((!mail) ||(!password)||(!newpassword)){
            $("#ts_error").show(100);
            $("#ts_error").text("发送严重错误!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            },5000);
            return false;
        }
        var l = jerry(localStorage.positiona);
        $http({
            method:'GET',
            url:l,
            params:{
                'type':'4',
                'email':mail,
                'password':password,
                'newpassword':newpassword
            }
        }).success(function(data,header,config,status){
            //响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var spassword = data.password;
            if(type=="success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                },3000);
                //修改
                $("#password").val('');
                $("#newpassword").val('');
                $("#newpassword2").val('');
                localStorage.password=spassword;

                clearInterval(regbutton);
                $scope.changeForm.$invalid=false;
                $scope.changesub="确认修改";
                //$scope.$apply();
                $('#changePassword').modal('hide')
            }
            if(type=="error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                },5000);
                clearInterval(regbutton);
                $scope.changeForm.$invalid=false;
                $scope.changesub="确认修改";
                // $scope.$apply();
            }

        }).error(function(data,header,config,status){
            //处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            },5000);
            clearInterval(regbutton);
            $scope.changeForm.$invalid=false;
            $scope.changesub="确认修改";
        });
        //核心更改密码结束
    }
    //更改密码模块 Ends
}]);

var log = rocket.controller("log",["$http","$scope","$rootScope","config",function($http,$scope,$rootScope,config){
    var hash = location.hash ;
    if(hash !="#login"){
        hash = "#register";
    }
    $(hash+"_tab").tab('show');
    var l = jerry(localStorage.positiona);
    config.init();
    //注册模块 Starts
    $scope.regsub = "注册";
    $scope.reg_sub=function(){
        var add = "";
        var i = 1;
        $scope.regsub="注册中请稍后";
        var regbutton = setInterval(function(){
            if(i<4){
                add = add+".";
            }else{
                i=0;
                add = "";
            }
            i++;
            $scope.regsub="注册中请稍后"+add;
            $scope.$apply();

        },500);

        $scope.regForm.$invalid=true;

        //核心注册开始
        var mail = $("#reg_email").val();
        var password = md5($("#reg_password").val());
        var verify = $("#reg_verify").val();
        //注册交互
        $http({
            method:'GET',
            url:l,
            params:{
                'type':'2',
                'email':mail,
                'password':password,
                'verify':verify
            }
        }).success(function(data,header,config,status){
            //响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var spassword = data.password;
            if(type=="success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                },5000);
                //注册成功
                localStorage.email = mail;
                localStorage.token = token;
                localStorage.password=spassword;

                localStorage.level = 0;
                location.href="option.html";
            }
            if(type=="error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                },5000);
                clearInterval(regbutton);
                $scope.regForm.$invalid=false;
                $scope.regsub="注册";

               // $scope.$apply();
            }

        }).error(function(data,header,config,status){
            //处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            },5000);
            clearInterval(regbutton);
            $scope.regForm.$invalid=false;
            $scope.regsub="注册";

        });
        //核心注册结束
    }
    //注册模块 Ends

    //登录模块 Starts
    $scope.logsub = "登录";
    $scope.forget_url = forget_url;
    $scope.log_sub=function(){
        var add = "";
        var i = 1;
        $scope.logsub="登录中请稍后";
        var logbutton = setInterval(function(){
            if(i<4){
                add = add+".";
            }else{
                i=0;
                add = "";
            }
            i++;
            $scope.logsub="登录中请稍后"+add;
            $scope.$apply();


        },500);

        $scope.logForm.$invalid=true;

        //核心登录开始
        var mail = $("#log_email").val();
        var password = md5($("#log_password").val());

        //登录交互
        $http({
            method:'GET',
            url:l,
            params:{
                'type':'3',
                'email':mail,
                'password':password
            }
        }).success(function(data,header,config,status){
            //响应成功
            var type = data.type;
            var msg = data.msg;
            var token = data.token;
            var level = data.level;
            var expire = data.expire;
            var spassword = data.password;

            if(type=="success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                },5000);
                //登录成功
                localStorage.email = mail;
                localStorage.token = token;
                localStorage.level = level;
                localStorage.expire = expire;
                localStorage.password=spassword;

                if(level>0 && ((!localStorage.ProxyMode)||localStorage.ProxyMode=="close")){
                    localStorage.ProxyMode="smarty";
                }
                location.href="option.html";
            }
            if(type=="error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                },5000);
                clearInterval(logbutton);
                $scope.logForm.$invalid=false;
                $scope.logsub="登录";
                // $scope.$apply();
            }
        }).error(function(data,header,config,status){
            //处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            },5000);
            clearInterval(logbutton);
            $scope.logForm.$invalid=false;
            $scope.logsub="登录";

        });
        //核心注册结束
    }
    //登录模块 Ends


    $scope.verify = 0;
    $scope.verify_msg = "请输入您收到的验证码";

}]);

var pay = rocket.controller("pay",["$scope","$rootScope","baseService","popupService","config",function($scope,$rootScope,baseService,popupService,config){
    config.init();
    //baseService初始化
    baseService.init();
    $scope.tc01_s=localStorage.tc01_s?localStorage.tc01_s:'9';
    $scope.tc02_s=localStorage.tc02_s?localStorage.tc02_s:'25';
    $scope.tc01=localStorage.tc01?localStorage.tc01:'9.00';
    $scope.tc02=localStorage.tc02?localStorage.tc02:'25.00';
}]);

var forget = rocket.controller("forget",["$http","$scope","$rootScope","config",function($http,$scope,$rootScope,config){

    //注册模块 Starts
    config.init();
    var l = jerry(localStorage.positiona);
    $scope.forgetsub = "提交修改";
    $scope.forget_sub=function(){
        var add = "";
        var i = 1;
        $scope.forgetsub="提交中请稍后";
        var fogetbutton = setInterval(function(){
            if(i<4){
                add = add+".";
            }else{
                i=0;
                add = "";
            }
            i++;
            $scope.forgetsub="提交中请稍后"+add;
            $scope.$apply();

        },500);

        $scope.forgetForm.$invalid=true;

        //核心重置密码开始
        var mail = $("#forget_email").val();
        var password = md5($("#forget_password").val());
        var verify = $("#forget_verify").val();

        $http({
            method:'GET',
            url:l,
            params:{
                'type':'5',
                'email':mail,
                'password':password,
                'verify':verify
            }
        }).success(function(data,header,config,status){
            //响应成功
            var type = data.type;
            var msg = data.msg;
            if(type=="success"){
                $("#ts_success").show(100);
                $("#ts_success").text(msg);
                setTimeout(function(){
                    $("#ts_success").hide(100);
                },5000);
                localStorage.email = mail;
                location.href="login.html#login";
            }
            if(type=="error"){
                $("#ts_error").show(100);
                $("#ts_error").text(msg);
                setTimeout(function(){
                    $("#ts_error").hide(100);
                },5000);
                clearInterval(fogetbutton);
                $scope.forgetForm.$invalid=false;
                $scope.forgetsub="提交修改";

                // $scope.$apply();
            }

        }).error(function(data,header,config,status){
            //处理响应失败
            $("#ts_error").show(100);
            $("#ts_error").text("网络不可用,请检查您的网络!");
            setTimeout(function(){
                $("#ts_error").hide(100);
            },5000);
            clearInterval(forgetbutton);
            $scope.forgetForm.$invalid=false;
            $scope.forgetsub="提交修改";

        });
    }
    //忘记密码模块 Ends

    $scope.verify = 0;
    $scope.verify_msg = "请输入您收到的验证码";

}]);