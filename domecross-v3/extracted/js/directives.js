/**
 * Created by tommy on 16/5/14.
 */

//跳转到options个人中心
rocket.directive("hreftooptions",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                chrome.tabs.create({
                    index:10000,
                    url:'option.html',
                    active:true,
                    pinned:false
                },function(tab){
                    //console.log(tab);
                });
            });
        }
    };
});

//将当前域名加入自动代理列表
rocket.directive("addcurdomain",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                //获取当前要加入的域名
                var webDomain = localStorage.currentWebDomain;
                //调用baseService添加域名
                baseService.addDoamin(webDomain);

                //reload
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
                //chrome.tabs.getSelected(null, function(tab) {//    var code = 'window.location.reload();';//    chrome.tabs.executeScript(tab.id, {code: code});//});
                //切换界面
                window.close();
            });
        }
    };
}]);

//将当前域名加入自动代理列表
rocket.directive("adderrordomain",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                //获取当前要加入的域名
                $(".error_adds").each(function(i){
                    if($(this).is(":checked")){
                        var webDomain  = $(this).val();
                        baseService.addDoamin(webDomain);
                    }
                });

                //reload
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
                //chrome.tabs.getSelected(null, function(tab) {//    var code = 'window.location.reload();';//    chrome.tabs.executeScript(tab.id, {code: code});//});
                //切换界面
                window.close();
            });
        }
    };
}]);



//将当前域名移除自动代理列表
rocket.directive("removecurdomain",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                //获取当前要加入的域名
                var webDomain = localStorage.currentWebDomain;
                //调用baseService移除域名
                baseService.removeDomain(webDomain);
                //reload
                chrome.tabs.reload(null,{ bypassCache: true }, function(){});
                //切换界面
                window.close();
            });
        }
    };
}]);

//全局代理点击
rocket.directive("modealways",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                if(localStorage.level!=="1"){
                    scope.alertDivDisplay="";
                    scope.alertMessage="抱歉,您的VIP未开通或已过期,无法使用此功能!";
                    scope.$apply();
                    chrome.tabs.create({
                        index:10000,
                        url:'option.html',
                        active:true,
                        pinned:false
                    },function(tab){
                        //console.log(tab);
                    });
                    return ;
                }

                net.setProxyMode('always');
                scope.$apply();
                //chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
            element.on("mouseover",function(){
                scope.alertDivDisplay="";
                scope.alertMessage="针对所有网站,一直开启多点测试模式. 但会影响国内的访问速度 ( 不推荐 )";
                scope.$apply();
            });
            element.on("mouseleave",function(){
                scope.alertDivDisplay="hide";
                scope.alertMessage="";
                scope.$apply();
            });
        }
    };
}]);


//智能代理点击
rocket.directive("modesmarty",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                if(localStorage.level!=="1"){
                    scope.alertDivDisplay="";
                    scope.alertMessage="抱歉,您的VIP未开通或已过期,无法使用此功能!";
                    scope.$apply();
                    chrome.tabs.create({
                        index:10000,
                        url:'option.html',
                        active:true,
                        pinned:false
                    },function(tab){
                        //console.log(tab);
                    });
                    return ;
                }
                net.setProxyMode('smarty');
                scope.$apply();
                //chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
            element.on("mouseover",function(){
                scope.alertDivDisplay="";
                scope.alertMessage="只对列表中的网站,开启多点测试模式 ( 强烈推荐 )";
                scope.$apply();
            });
            element.on("mouseleave",function(){
                scope.alertDivDisplay="hide";
                scope.alertMessage="";
                scope.$apply();
            });
        }
    };
}]);

//禁用代理点击
rocket.directive("modeclose",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                localStorage.qzclose='1';
                net.setProxyMode('close');
                scope.$apply();
                //chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
            element.on("mouseover",function(){
                scope.alertDivDisplay="";
                scope.alertMessage="不使用多点测试工具，相当于关闭此插件";
                scope.$apply();
            });
            element.on("mouseleave",function(){
                scope.alertDivDisplay="hide";
                scope.alertMessage="";
                scope.$apply();
            });
        }
    };
}]);

rocket.directive("netline",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab3="hide";
                scope.tab4="";
                $("input[name='netLine'][value='"+localStorage.netsn+"']").attr("checked","checked");
                scope.$apply();
            });
        }
    };
});

rocket.directive("netlineback",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab3="";
                scope.tab4="hide";
                scope.$apply();
            });
        }
    };
});

//切换线路-核心
rocket.directive("chooselinesn",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                if(localStorage.level!=="1"){
                    chrome.tabs.create({
                        index:10000,
                        url:'option.html',
                        active:true,
                        pinned:false
                    },function(tab){
                        //console.log(tab);
                    });
                    return ;
                }
                var sn = attr.value;
                localStorage.netsn =sn;
                localStorage.needcls = "yes";

                net.changeLine(sn);
                //设置中请勿关闭
                element.html("<img src='/images/loading.gif'/>");

            });
        }
    };
}]);


//代理站点列表管理
rocket.directive("webmanager",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("mouseover",function(){
                $(element).find('.trash').show();
            });
            element.on("mouseleave",function(){
                $(element).find('.trash').hide();
            });
        }
    };
});

//weblist删除
rocket.directive("webmanagertrash",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click",function(){
                    if(attr.webname){
                        baseService.removeDomain(attr.webname);
                        $(element).parents(".col-md-4").hide(300);
                    }
            });
        }
    };
}]);

//weblist添加
rocket.directive("webmanageradd",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click",function(){
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
                }else{
                    scope.addalert1 = "hide";
                    scope.addalert2 = "";
                    scope.addalert3 = "hide";

                    scope.$apply();
                }
            });
        }
    };
}]);

//weblist恢复初始
rocket.directive("webmanagerdefault",["baseService",function(baseService){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click",function(){
                scope.addalert1 = "hide";
                scope.addalert2 = "hide";
                scope.addalert3 = "";

                $('#confirmDefault').modal('hide');
                baseService.changeToDefaultDomains();
                var autoProxyList = localStorage.autoProxyList.split(",");
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
        }
    };
}]);


//weblist排序
rocket.directive("sortbytime",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click",function(){
                localStorage.sort ="time";
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
        }
    };
});

//weblist排序
rocket.directive("sortbyname",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click",function(){
                localStorage.sort ="name";
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });
        }
    };
});

//密码输入一致性校验
rocket.directive('pwCheck', [function () {
   return {
       require: 'ngModel',
       link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                 scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                 });
            });
       }
    }
}]);

//发送验证码
rocket.directive('verify', ["$http",function ($http) {
    return {
        restrict: "AEMC",
        link: function (scope, element, attr) {
            var l = jerry(localStorage.positiona);
            element.on("click",function(){
                //首先判断邮箱是否合法
                var mail = $("#reg_email").val();
                if(!checkmail(mail)){
                    //邮箱非法
                    scope.verify_msg = "请先填入您的邮箱";
                    scope.verify=1;
                    scope.$apply();
                    return ;
                }else{
                    //邮箱合法
                    scope.verify=0;
                    scope.verify_send=1;
                    scope.$apply();
                }

                //发送验证码
                $http({
                    method:'GET',
                    url:l,
                    params:{
                        'type':'1',
                        'email':mail
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
                        },5000)
                    }
                    if(type=="error"){
                        $("#ts_error").show(100);
                        $("#ts_error").text(msg);
                        setTimeout(function(){
                            $("#ts_error").hide(100);
                        },5000)
                    }

                }).error(function(data,header,config,status){
                        //处理响应失败
                        $("#ts_error").show(100);
                        $("#ts_error").text("网络不可用,请检查您的网络!");
                        setTimeout(function(){
                            $("#ts_error").hide(100);
                        },5000)
                });

                //输入验证码提示
                var djs = 60;
                var stm = function(){
                    if(djs){
                        element.text("重新发送（ "+djs+" ）");
                        djs--;
                        setTimeout(stm,1000);
                    }else{
                        //恢复
                        scope.verify_send=0;
                        scope.$apply();
                        element.text("重新发送验证码");
                    }
                }
                //重新发送倒计时
                stm();
            });
        }
    }
}]);

//验证码小写转大写
rocket.directive('veritycode', [function () {
    return {
        link: function (scope, elem, attrs) {
            elem.on('keyup', function () {
                var vale = elem.val();
                elem.val(vale.toUpperCase());
            });
        }
    }
}]);


//退出登录
rocket.directive("logout",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                net.setProxyMode('close');
                scope.$apply();
                //退出登录
                localStorage.email = "";
                localStorage.token = "";
                localStorage.level = 0;
                localStorage.expire = "";
                localStorage.history_vip = 0;
                location.href="login.html#login";
            });
        }
    };
}]);

//刷新用户身份
rocket.directive("refreshlevel",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                chrome.tabs.reload(null,{ bypassCache: true } ,function() {});
            });

        }
    };
});


rocket.directive("tab1",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab1="";
                scope.tab2="hide";
                scope.tab1_span="";
                scope.tab2_span="hide";
                $("#tab1_a").addClass("list-group-item-warning");
                $("#tab2_a").removeClass("list-group-item-warning");

                $("#tab1_div").addClass("left3_active");
                $("#tab2_div").removeClass("left3_active");
                scope.$apply();
            });
        }
    };
});

rocket.directive("tab2",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                scope.tab1="hide";
                scope.tab2="";
                scope.tab1_span="hide";
                scope.tab2_span="";

                $("#tab2_a").addClass("list-group-item-warning");
                $("#tab1_a").removeClass("list-group-item-warning");

                $("#tab1_div").addClass("left3_active");
                $("#tab2_div").removeClass("left3_active");

                scope.$apply();
            });
        }
    };
});


rocket.directive("tuijianfuzhi",function(){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                copyUrl("tuijian");
                element.removeClass("btn-danger");
                element.addClass("btn-success");
                element.html("已复制");
            });
        }
    };
});

rocket.directive("tryoutbtn",["net",function(net){
    return {
        restrict: "AEMC",
        replace:true,
        link: function (scope, element, attr) {
            element.on("click", function () {
                element.attr("disabled","disabled");
                //setTimeout(function(){
                    $(".tryoutcc").hide();
                    net.getTryout();
                //},8000);
            });
        }
    };
}]);

rocket.directive('verifyforget', ["$http",function ($http) {
    return {
        restrict: "AEMC",
        link: function (scope, element, attr) {
            var l = jerry(localStorage.positiona);
            element.on("click",function(){
                //首先判断邮箱是否合法
                var mail = $("#forget_email").val();
                if(!checkmail(mail)){
                    //邮箱非法
                    scope.verify_msg = "请先填入您的邮箱";
                    scope.verify=1;
                    scope.$apply();
                    return ;
                }else{
                    //邮箱合法
                    scope.verify=0;
                    scope.verify_send=1;
                    scope.$apply();
                }

                //发送验证码
                $http({
                    method:'GET',
                    url:l,
                    params:{
                        'type':'6',
                        'email':mail
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
                        },5000)
                    }
                    if(type=="error"){
                        $("#ts_error").show(100);
                        $("#ts_error").text(msg);
                        setTimeout(function(){
                            $("#ts_error").hide(100);
                        },5000)
                    }

                }).error(function(data,header,config,status){
                    //处理响应失败
                    $("#ts_error").show(100);
                    $("#ts_error").text("网络不可用,请检查您的网络!");
                    setTimeout(function(){
                        $("#ts_error").hide(100);
                    },5000)
                });

                //输入验证码提示
                var djs = 60;
                var stm = function(){
                    if(djs){
                        element.text("重新发送（ "+djs+" ）");
                        djs--;
                        setTimeout(stm,1000);
                    }else{
                        //恢复
                        scope.verify_send=0;
                        scope.$apply();
                        element.text("重新发送验证码");
                    }
                }

                //重新发送倒计时
                stm();
            });
        }
    }
}]);