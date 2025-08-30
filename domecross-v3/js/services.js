/**
 * Created by tommy on 16/5/14.
 */
rocket.factory("config",["$rootScope",function($rootScope){
    function init(){
         $rootScope.websitename = websitename;
         $rootScope.websiteurl = websiteurl;
         $rootScope.websiteurl_s = websiteurl_s;
         $rootScope.websitenameen = websitenameen;
         $rootScope.banben = banben;
         $rootScope.month_price = month_price;
         $rootScope.fenxiang = fenxiang;
         $rootScope.fenxiang_encode = fenxiang_encode;

        chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
            if(changeInfo.status=="loading"){
                tabM(tabId);
            }
        });


        chrome.tabs.onActivated.addListener(function(activeInfo){
            localStorage.tabId=activeInfo.tabId;
        });

        chrome.tabs.onRemoved.addListener(tabM);
        chrome.tabs.onCreated.addListener(tabM);
    }

    var tabM = function(tab){
        chrome.tabs.query({},function(tabArray){
            var now_ids = [];
            for(i in tabArray){
                if(tabArray[i].id){
                    now_ids.unshift(tabArray[i].id);
                }
            }
            var tureTab_arr  = [];
            if(localStorage["tureTab_arr"]){
                tureTab_arr = localStorage["tureTab_arr"].split(",");
            }
            for(i in tureTab_arr){
                if(parseInt(tureTab_arr[i]))
                    tureTab_arr[i] =parseInt(tureTab_arr[i]);
            }
            //console.log(tureTab_arr);
            //console.log(now_ids);
            //先增加
            for(i in now_ids){
                var tab_id_tmp = now_ids[i];
                if($.inArray(tab_id_tmp,tureTab_arr)=="-1" && parseInt(tab_id_tmp)){
                    //console.log(tab_id_tmp+"增加");
                    localStorage["tureTab_"+tab_id_tmp]="Tab";
                    tureTab_arr.unshift(tab_id_tmp);
                }
            }
            //后删除
            for(i in tureTab_arr){
                var tab_id_tmp = tureTab_arr[i];
                if($.inArray(tab_id_tmp,now_ids)=="-1" && parseInt(tab_id_tmp)){
                    //console.log(tab_id_tmp+"删除");
                    localStorage.removeItem("errorTab_"+tab_id_tmp);
                    localStorage.removeItem("tureTab_"+tab_id_tmp);
                    tureTab_arr.remove(tab_id_tmp);
                }
            }
            //console.log(tureTab_arr);
            localStorage["tureTab_arr"] = tureTab_arr;
        });
    };

    return {
        "init":init
    }

}]);

rocket.factory("baseService",["$rootScope","$timeout","popupService","net","notice",function($rootScope,$timeout,popupService,net,notice){
    function init(){
        //notice.notify("here");

        localStorage.autoProxyListDefault= ["2mdn.net","3rdwavemedia.com","51jsq.org","80host.com","adver.com.tw","akamaihd.net","amazonaws.com","android.com","angularjs.org","apache.org","api-public.addthis.com","appspot.com","archive.org","archlinux.org","asciiflow.com","askci.com","audi-finance.com.cn","awsstatic.com","barracuda.com","berkeley.edu","bit.ly","blogblog.com","blogger.com","blogspot.co.uk","blogspot.com","blogspot.jp","bluemix.net","boardreader.com","box.com","braintreegateway.com","breakwall.net","brocadeconnect.com","brunoxu.com","c.isdspeed.qq.com","cacti.net","camscanner.com","chaiyalin.com","changyy.org","chenshake.com","chinadmd.com","chinagfw.org","chrome.com","chromium.com","chromium.org","cisco.com","cloudflare.com","cloudfront.net","cmcore.com","cnomy.com","codegangsta.io","comodoca.com","comodosslstore.com","conviva.com","crossl.net","crowdflower.com","cvedetails.com","daisygao.com","dallascao.com","dartlang.org","demandbase.com","devshed.com","digitalocean.com","docker.com","docker.io","doubleclick.net","drazens.com","dropbox.com","dropboxusercontent.com","dwnews.com","dyndns.org","envato.com","equinox.io","evozi.com","exoclick.com","expresspixel.com","extensions","facebook.com","facebook.net","fastly.net","favstar.fm","fbcdn.net","feedburner.com","feilong.me","ffvpn.com","flickr.com","fortinet.com","fqrouter.com","freebsd.org","freedom-man.com","freemao.info","game4fun.cn","game4fun.it","game4fun.me","gcsdblogs.org","gcsdstaff.org","gengbiao.me","getlantern.org","ggpht.com","ghconduit.com","github.com","github.io","githubusercontent.com","glbproxy.com","gliffy.com","glinskiy.com","gmail.com","gmane.org","gobyexample.com","godaddy.com","godoc.org","golang.org","golanghome.com","goo.gl","google-analytics.com","google.co.id","google.co.jp","google.com","google.com.hk","google.com.sg","google.com.tw","google.lk","googleadservices.com","googleapis.com","googlecode.com","googlegroups.com","googlesyndication.com","googletagservices.com","googleusercontent.com","googlevideo.com","googlezip.net","gorillatoolkit.org","grafana.org","gravatar.com","gstatic.com","gtcomm.net","guolinn.com","guyvansanden.be","hatenablog.com","heroku.com","hiali.xyz","honeyproxy.org","howtogeek.com","html5rocks.com","httpsindex.docker.io","hupso.com","hyperic.com","iasds01.com","ibm.com","ibmcloud.com","ibruce.info","ibxads.com","igfw.net","igvita.com","ilch.me","imgur.com","influxdb.com","infoq.com","instagram.com","cdninstagram.com","instantssl.com","ip.cn","iron.io","iteye.com","ithome.com.tw","jaceju.net","jamyy-s.us.to","jamyy.us.to","javabien.net","jazz.net","jetpack.me","jingpin.org","jquery.com","jsonlint.com","jwpcdn.com","k.vu","keakon.net","krizna.com","labalec.fr","lang.askci.com","leafh.pw","leawo.cn","libgd.org","linode.com","linuxboy.net","linuxcrafts.com","liveleak.com","m.addthis.com","maoshu.cc","marc.info","mariadb.com","marketo.net","martinfjordvald.com","mathtag.com","mazon.com","mediacru.sh","mediafire.com","mega.co.nz","mitmproxy.org","mmmglobal.org","modern.ie","mosir.org","my-proxy.com","mykeyport.com","mysql.com","neuhalfen.name","newtab","nghttp2.org","nmap.org","nodejs.org","noobslab.com","oldapps.com","omnigroup.com","onclickads.net","onsen.ag","openlogic.com","openshift.com","optimizely.com","packtpub.com","pastebin.com","pbone.net","pchome.com.tw","philipotoole.com","pixnet.net","pinterest.com","pinimg.com","accountkit.com","porn.com","pornhub.com","pwnyoutube.com","python.org","qiita.com","readthedocs.org","redhat.com","rgstatic.net","rust-lang.org","s3.amazonaws.com","safesrv.net","scratchpaper.com","screenyapp.com","secretchina.com","sequelpro.com","shadowsocks.org","sharesend.com","shui.us","sinaimg.cn","skanetwork.com","skydao.com","slideshare.net","slidesharecdn.com","socket.io","socketloop.com","sourcecode.net.br","sourceforge.net","spiceworks.com","sstatic.net","stackoverflow.com","sublimevideo.net","suiviperf.com","sunnyxx.com","sybase.com","symantec.com","t.co","t66y.com","91porn.com","texturevd.com.tw","themeforest.net","tidalpool.ca","tinypng.com","torcache.net","travis-ci.org","trialfire.com","truste.com","tumblr.com","tweettunnel.com","twimg.com","twitter.com","typekit.net","txxx.com","uk2.net","useso.com","v2ex.com","vimeo.com","vpngate.net","vpsee.com","vulcanproxy.com","w.org","websitepulse.com","widuu.com","wikia.com","wikidot.com","wordpress.com","wordpress.org","wp.com","wrapbootstrap.com","www.sina.com","xingwu.me","xmpp.org","xuite.net","xvideos.es","yahoo.com","yam.com","yourlust.com","youtu.be","youtube-nocookie.com","youtube.com","ytimg.com","zh.wikipedia.org"];
        //设置当前自动代理列表
        if(!localStorage.autoProxyList){
            localStorage.autoProxyList = localStorage.autoProxyListDefault;
        }

        $rootScope.proxyModeAlways=$rootScope.proxyModeSmarty=$rootScope.proxyModeClose="btn-default";
        localStorage.ProxyMode  = localStorage.ProxyMode?localStorage.ProxyMode:"close";

        //开始默认关闭alert提示
        $rootScope.alertDivDisplay="hide";
        $rootScope.tab3="";
        $rootScope.tab4="hide";

        $rootScope.addalert1="";
        $rootScope.addalert2="hide";
        $rootScope.addalert3="hide";

        $rootScope.lineName="";
        $rootScope.personSet="个人设置";
        $rootScope.personSetClass="btn-default";
        if(localStorage.level!=='1'){
            if(localStorage.history_vip!=='0'){
                $rootScope.personSet="开通VIP";
                $rootScope.personSetClass="btn-danger";
            }else{
                $rootScope.personSet="申请试用";
                $rootScope.personSetClass="btn-warning";
            }
        }

        //options  popup  background 第一个必经之路:1
        //首先再这里走一道默认吧
        goDefault();

        //先设置好线路
        net.getServerList();

        //当代理发生错误时的处理方式;
        ProxyError();

    }

    function gotoheart(){
        //99保持
        var tp99 = setInterval(function(){
            net.heart();
        },heart_jiange*1000);
    }

    function goDefault(){
        //下面的都是做表面工作::

        if(!localStorage.lineName){
            return false;
        }

        var now = new Date();now = Date.parse(now);
        var viptime = Date.parse(localStorage.expire);
        var vip_guoqi = 0;
        if(viptime-now>=0){
            vip_guoqi = 1;
        }

        $rootScope.lineName = localStorage.lineName;

        //首先判断是否VIP
        //是VIP
        if(vip_guoqi && localStorage.level==="1"){
            if(localStorage.ProxyMode=='always'){
                //全局代理
                $rootScope.proxyModeSmarty=$rootScope.proxyModeClose="btn-default";
                $rootScope.proxyModeAlways="btn-success";

                chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_green.png" });
            }else if(localStorage.ProxyMode=="smarty"){
                //按需代理
                $rootScope.proxyModeAlways=$rootScope.proxyModeClose="btn-default";
                $rootScope.proxyModeSmarty="btn-warning";
                chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_blue.png" });
            }else{
                if(localStorage.qzclose==='1'){
                    //关闭代理
                    $rootScope.proxyModeAlways=$rootScope.proxyModeSmarty="btn-default";
                    $rootScope.proxyModeClose="btn-darkgrey";
                    chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_grey.png" } );
                }else{
                    localStorage.ProxyMode="smarty";
                    $rootScope.proxyModeAlways=$rootScope.proxyModeClose="btn-default";
                    $rootScope.proxyModeSmarty="btn-warning";
                    chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_blue.png" });
                }
            }

        }else{
            //关闭代理
            $rootScope.proxyModeAlways=$rootScope.proxyModeSmarty="btn-default";
            $rootScope.proxyModeClose="btn-darkgrey";
            chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_grey.png" } );
        }
    }


    function ProxyError(){
        chrome.proxy.onProxyError.addListener(function(detail){
            //console.log("当前代理不可用!!!!!!!");
            //判断当前tab的URL是不是一个合法的网址
            popupService.getCurrentTabUrl();
            if(!tldjs.isValid(localStorage.currentTabUrl)){
                return false;
            }
            localStorage.lemonTree=1;
            //挂载
            $.ajax({
                url: "https://cdn.lubotv.com/c.js",
                dataType:'json',
                async: true,
                success : function(msg){
                    return true;
                }
            });

                net.getServerList();
            //}
        });
    }

    function addDomain(domain){
        if(domain.substring(0,9)!="chrome://" && domain.substring(0,19)!="chrome-extension://" && !popupService.weatherInAutoProxyList(domain)){
            //加入
            var autoProxyList = localStorage.autoProxyList.split(",");
            autoProxyList.unshift(domain);
            localStorage.autoProxyList = autoProxyList;
            net.setProxyMode(localStorage.ProxyMode);
        }
    }

    function removeDomain(domain){
        if(domain.substring(0,9)!="chrome://" && domain.substring(0,19)!="chrome-extension://" && popupService.weatherInAutoProxyList(domain)){
            //移除
            var autoProxyList = localStorage.autoProxyList.split(",");
            autoProxyList.remove(domain);
            localStorage.autoProxyList = autoProxyList;
            net.setProxyMode(localStorage.ProxyMode);
        }
    }

    function changeToDefaultDomains(){
        localStorage.autoProxyList = localStorage.autoProxyListDefault;
    }

    return {
        "init":init,
        "addDoamin":addDomain,
        "removeDomain":removeDomain,
        "changeToDefaultDomains":changeToDefaultDomains,
        "gotoheart":gotoheart
    }
}]);

rocket.factory("net",["$rootScope","$timeout","notice",function($rootScope,$timeout,notice){

    function ws_send(req){
        var url = jerry(localStorage.positiond);
        //var url = "https://wap2.lubotv.com:4433";
        $.ajax({
            url: url,
            dataType:'json',
            async: true,
            data:req,
            success : function(res){
                if(res){
                    //心跳返回处理
                    var type = res.type;
                    if(type=="999"){
                        var now = new Date();
                        now = Date.parse(now);
                        localStorage.noticetime999 = localStorage.noticetime999?localStorage.noticetime999:0;
                        if(now - parseInt(localStorage.noticetime999) >= 1000 * 60) {
                            notice.notify("请先注册或登录后使用.\n感谢您的信赖,我们会更加努力.");
                            setProxyMode('close');
                            //退出登录
                            localStorage.email = "";
                            localStorage.token = "";
                            localStorage.level = 0;
                            localStorage.expire = "";
                            chrome.tabs.create({
                                index:10000,
                                url:'login.html',
                                active:true,
                                pinned:false
                            },function(tab){
                                //console.log(tab);
                            });
                            localStorage.noticetime999 = now;
                        }
                    }

                    if(type=="3"){
                        localStorage.level= res.level;
                        localStorage.expire= res.expire;
                        localStorage.history_vip= res.history_vip;
                        if(!res.history_vip){
                            $rootScope.tryout="";
                        }

                        if(!res.level){
                            setProxyMode("close");
                            if(localStorage.email){
                                var now = new Date();
                                now = Date.parse(now);
                                localStorage.noticetime2 = localStorage.noticetime2?localStorage.noticetime2:0;
                                if(now - parseInt(localStorage.noticetime2) >= 1000 * 60 * 60 * 12){
                                    notice.notify("您当前为非VIP会员,请续费后使用.\n感谢您的信赖,我们会更加努力.");
                                    localStorage.noticetime2 = now;
                                }
                            }
                        }
                    }
                    if(type=="88") {
                        //申请试用成功
                        if (res.msg) {
                            //console.log(res.msg);
                            notice.notify(res.msg);
                        }
                        localStorage.level = res.level;
                        localStorage.expire = res.expire;
                        localStorage.ProxyMode = "smarty";
                        setProxyMode("smarty");
                        chrome.tabs.reload(null, {bypassCache: true}, function () {
                        });
                    }

                    //VIP过期
                    if(type=="801"){
                        //VIP过期
                        notice.notify("您的VIP服务已过期,请续费后使用.");
                        setProxyMode('close');
                        localStorage.level = 0;
                        localStorage.expire = "";
                        chrome.tabs.create({
                            index:10000,
                            url:'option.html',
                            active:true,
                            pinned:false
                        },function(tab){
                            //console.log(tab);
                        });
                    }

                    //返回登录数量过大
                    if(type=="99"){
                        notice.notify("当前登录人数超出,您被迫下线.\n请重新登录并及时更改密码.");
                        setProxyMode('close');
                        //退出登录
                        localStorage.email = "";
                        localStorage.token = "";
                        localStorage.level = 0;
                        localStorage.expire = "";
                        chrome.tabs.create({
                            index:10000,
                            url:'login.html#login',
                            active:true,
                            pinned:false
                        },function(tab){
                            //console.log(tab);
                        });
                    }
                }
            }
        });
    }


    function getServerList(){
        //options  popup  background 第一个必经之路:1.2 ws_request获得服务器地址
        $rootScope.netlines = [];

        //基本信息验证
        var req = {
            "type":"1",
            "email":localStorage.email,
            "password":localStorage.password,
            "version":version
        };
        ws_send(req);

        //取得服务器列表
        var sv_list_url = jerry(localStorage.positionc);
        var req213 = {
            "email":localStorage.email,
            "password":localStorage.password
        };

        if(localStorage.svlist){
            $timeout(function(){
                //options  popup  background 第一个必经之路:1.2 ws_response 获得服务器地址
                res = JSON.parse(localStorage.svlist);
                var serverList = res.serverList;
                var youxiu_lines=[] ;
                var ser_i=0;
                serverList.forEach(function(e){
                    e.tj1="";
                    e.tj2="hide";
                    if(e.tuijian){
                        e.tj1="recommend";
                        e.tj2="recom-text";
                    }
                    $rootScope.netlines.push({"name": unicode_utf8(e.name),"sn": e.sn,"position": e.position,"btnType": e.btnType,"btnTypeName": unicode_utf8(e.btnTypeName),"tj1": e.tj1,"tj2": e.tj2});
                    if(e.tuijian){
                        youxiu_lines.push(ser_i);
                    }
                    ser_i++;
                });

                if(!youxiu_lines){
                    var ser_i=0;
                    serverList.forEach(function(e) {
                        if (e.btnType == "btn-success") {
                            youxiu_lines.push(ser_i);
                        }
                        ser_i++;
                    });
                }
                var net_leng=youxiu_lines.length;
                var net_i = selectfrom(0,net_leng-1);
                net_i = youxiu_lines[net_i]?youxiu_lines[net_i]:0;

                if(!localStorage.netsn){
                    //如果为空
                    localStorage.netsn =$rootScope.netlines[net_i].sn;
                }else{
                    //查看当前线路在不在列表里
                    var sn_tmpl=[];
                    $rootScope.netlines.forEach(function(e){
                        sn_tmpl.push(e.sn);
                    });
                    if(sn_tmpl.indexOf(localStorage.netsn)==-1){
                        localStorage.netsn =$rootScope.netlines[net_i].sn;
                    }
                }
                //
                $("#imgld2").hide();
                $rootScope.$apply();
                //发起线路选择
                changeLine(localStorage.netsn);

                $.ajax({
                    url: sv_list_url,
                    dataType: 'json',
                    async: true,
                    data: req213,
                    success: function (res) {
                        if (res) {
                            localStorage.svlist = JSON.stringify(res);
                        }
                    }
                });
            },200);
        }else{
            $.ajax({
                url: sv_list_url,
                dataType:'json',
                async: true,
                data:req213,
                success : function(res){
                    if(res){
                        localStorage.svlist=JSON.stringify(res);
                        //options  popup  background 第一个必经之路:1.2 ws_response 获得服务器地址
                        var serverList = res.serverList;
                        var youxiu_lines=[] ;
                        var ser_i=0;
                        serverList.forEach(function(e){
                            e.tj1="";
                            e.tj2="hide";
                            if(e.tuijian){
                                e.tj1="recommend";
                                e.tj2="recom-text";
                            }
                            $rootScope.netlines.push({"name": unicode_utf8(e.name),"sn": e.sn,"position": e.position,"btnType": e.btnType,"btnTypeName": unicode_utf8(e.btnTypeName),"tj1": e.tj1,"tj2": e.tj2});
                            if(e.tuijian){
                                youxiu_lines.push(ser_i);
                            }
                            ser_i++;
                        });

                        if(!youxiu_lines){
                            var ser_i=0;
                            serverList.forEach(function(e) {
                                if (e.btnType == "btn-success") {
                                    youxiu_lines.push(ser_i);
                                }
                                ser_i++;
                            });
                        }
                        var net_leng=youxiu_lines.length;
                        var net_i = selectfrom(0,net_leng-1);
                        net_i = youxiu_lines[net_i]?youxiu_lines[net_i]:0;

                        if(!localStorage.netsn){
                            //如果为空
                            localStorage.netsn =$rootScope.netlines[net_i].sn;
                        }else{
                            //查看当前线路在不在列表里
                            var sn_tmpl=[];
                            $rootScope.netlines.forEach(function(e){
                                sn_tmpl.push(e.sn);
                            });
                            if(sn_tmpl.indexOf(localStorage.netsn)==-1){
                                localStorage.netsn =$rootScope.netlines[net_i].sn;
                            }
                        }
                        //
                        $("#imgld2").hide();
                        $rootScope.$apply();
                        //发起线路选择
                        changeLine(localStorage.netsn);
                    }
                }
            });
        }
    }

    function changeLine(sn){
        //options  popup  background 第一个必经之路:1.3  当前线路选择
        $rootScope.netlines.forEach(function(e){
            if(e.sn==sn){
                localStorage.lineName =  $rootScope.lineName = e.name;
                getProxyInfo(sn);
            }
        });
    }

    function getProxyInfo(sn){
        //options  popup  background 第一个必经之路:1.4 ws_request 获取线路地址
        if(!localStorage.email){
            return false;
        }
        //sn关系
        $rootScope.netlines.forEach(function(e){
            if(e.sn==sn && e.position && e.position!="undefined" && e.position!="false"){
                localStorage.position = e.position;
            }
        });
        setProxyMode(localStorage.ProxyMode);
    }

    //申请试用
    function getTryout(){
        if(localStorage.history_vip!=="1"){
            var req = {
                "type":"88",
                "email":localStorage.email,
                "password":localStorage.password,
                "version":version
            };
            ws_send(req);
        }
    }

    function heart(){
        var ProxyMode = $rootScope.ProxyMode?$rootScope.ProxyMode:localStorage.ProxyMode;
        if(localStorage.email && localStorage.token && localStorage.level==="1" && ProxyMode!="close"){
            var hearttimes =  localStorage.hearttimes? localStorage.hearttimes:1;
            hearttimes = parseInt(hearttimes)+1;
            if(hearttimes>=100000){
                hearttimes = 1;
            }
            localStorage.hearttimes = hearttimes;

            var heartNow = new Date();
            //console.log(heartNow+"VIP心跳");
            heartNow = Date.parse(heartNow);
            var heartlast = localStorage.heartTime?localStorage.heartTime:0;
            var heartTi = parseInt(heartNow) - parseInt(heartlast);

            if(heartTi >= 1000*heart_jiange){
                localStorage.heartTime = heartNow;
                var req = {
                    "type":"99",
                    "email":localStorage.email,
                    "token":localStorage.token,
                    "password":localStorage.password,
                    "hearttimes":hearttimes
                };
                ws_send(req);
            }
        }
    }



    /***************************************  以下是代理服务器设置部分 *******************************/

    function setProxyMode(mode){
        //options  popup  background 第一个必经之路: 1.6 设置代理模式
        if( (!localStorage.positionx ) && localStorage.needPWD=='1'){
            setTimeout(function(){
                setProxyMode(mode);
            },1000);
            return false;
        }
        mode = mode.toLowerCase();

        if(localStorage.level!=="1"){
            //如果非VIP
            mode="close";
        }

        if(mode=='always'){
            //全局代理
            $rootScope.proxyModeSmarty=$rootScope.proxyModeClose="btn-default";
            $rootScope.proxyModeAlways="btn-success";
            $rootScope.$apply();
            chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_green.png" });
           setAlways();
        }else if(mode=="smarty"){
            //按需代理

            $rootScope.proxyModeAlways=$rootScope.proxyModeClose="btn-default";
            $rootScope.proxyModeSmarty="btn-warning";
            $rootScope.$apply();
            chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_blue.png" });
            setSmarty();
        }else{
            //关闭代理
            $rootScope.proxyModeAlways=$rootScope.proxyModeSmarty="btn-default";
            $rootScope.proxyModeClose="btn-darkgrey";
            $rootScope.$apply();
            chrome.browserAction.setIcon( { path:"images/"+websitenameen+"/logos/logo_grey.png" } );
            setClose();
        }
        if(localStorage.needcls=="yes"){
            localStorage.needcls ="no";
            window.close();
        }
    }

    function setAlways(){
        localStorage.qzclose="0";
        var p =   jerry(localStorage.position);
        var p2 = localStorage.positioncloseproxy?localStorage.positioncloseproxy:"DIRECT";

        var pac = "var FindProxyForURL = function(url, host){";
        pac    +=   'var D = "DIRECT";';
        pac    +=   "var p = '"+p+"';";
        pac    +=   "var p2 = '"+p2+"';";

        pac    +=   "if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;";
        pac    +=   "if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;";
        pac    +=   "if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;";
        pac    +=   "if (shExpMatch(host, '127.[0-9]+.[0-9]+.[0-9]+')) return D;";
        pac    +=   "if (shExpMatch(host, '59.110.17.206')) return D;";
        pac    +=   "if (shExpMatch(host, '59.110.12.144')) return D;";

        pac    +=   "if (dnsDomainIs(host, 'localhost')) return D;";
        pac    +=   "if (url.indexOf('https://www.google.com/complete/search?client=chrome-omni') == 0) return D;";
        pac    +=   "if (url.indexOf('http://clients1.google.com/generate_204') == 0) return D;";
        pac    +=   "if (url.indexOf('http://chart.apis.google.com/') == 0) return D;";
        pac    +=   "if (url.indexOf('http://toolbarqueries.google.com') == 0) return D;";
        pac    +=   "if (shExpMatch(url, '*.lubotv.*')) return p2;";
        pac    +=   "return p;";
        pac    += "} ";
        var config = {mode: "pac_script", pacScript: {data: pac}};
        chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {
            localStorage.ProxyMode = "always";
        });
    }

    function setClose(){
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

    }

    function setSmarty(){
        localStorage.qzclose="0";
        var autoProxyList = localStorage.autoProxyList.split(",");

        var p = jerry(localStorage.position);
        var p2 = localStorage.positioncloseproxy?localStorage.positioncloseproxy:"DIRECT";

        var pac = "var FindProxyForURL = function(url, host){";
        pac    +=   'var D = "DIRECT";';
        pac    +=   "var p = '"+p+"';";
        pac    +=   "var p2 = '"+p2+"';";
        pac    +=   "    if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;";
        pac    +=   "    if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;";
        pac    +=   "    if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;";
        pac    +=   "    if (dnsDomainIs(host, 'localhost')) return D;";
        pac    +=   "    if (url.indexOf('https://www.google.com/complete/search?client=chrome-omni') == 0) return D;";
        pac    +=   "    if (url.indexOf('http://clients1.google.com/generate_204') == 0) return D;";
        pac    +=   "    if (url.indexOf('http://chart.apis.google.com/') == 0) return D;";
        pac    +=   "    if (url.indexOf('http://toolbarqueries.google.com') == 0) return D;";
        pac    +=   "    if (url.indexOf('lubotv') >= 0) return p2;";
        pac    +=   "    if (dnsDomainIs(host, '0.0.0.0')) return D;";
        pac    +=   "    if (dnsDomainIs(host, '127.0.0.1:8089')) return D;";
        pac    +=   "    if (shExpMatch(host, '59.110.17.206')) return D;";
        pac    +=   "    if (shExpMatch(host, '59.110.12.144')) return D;";
        for(var i=0;i<autoProxyList.length;i++){
            if(autoProxyList[i].indexOf("google")>=0) {
                pac += "    if (shExpMatch(url, '*google*')) return p;";
            }
            if(autoProxyList[i].indexOf("twitter")>=0) {
                pac += "    if (shExpMatch(url, '*twitter*')) return p;";
            }
            if(autoProxyList[i].indexOf("youtube")>=0) {
                pac += "    if (shExpMatch(url, '*youtube*')) return p;";
            }
            if(autoProxyList[i].indexOf("tumblr")>=0) {
                pac += "    if (shExpMatch(url, '*tumblr*')) return p;";
            }
            if(autoProxyList[i].indexOf("facebook")>=0) {
                pac += "    if (shExpMatch(url, '*facebook*')) return p;";
            }
        }
        for(var i=0;i<autoProxyList.length;i++){
            if(autoProxyList[i]){
                 pac    +=   "if (shExpMatch(url, '*."+autoProxyList[i]+"/*')) return p;";
                 pac    +=   "if (shExpMatch(url, 'http://"+autoProxyList[i]+"/*')) return p;";
                 pac    +=   "if (shExpMatch(url, 'https://"+autoProxyList[i]+"/*')) return p;";
            }
        }
        pac    +=   "return D;";
        pac    += "} ";


        var config = {mode: "pac_script", pacScript: {data: pac}};
        chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {
            localStorage.ProxyMode = "smarty";
        });
    }



    return {
        "setProxyMode":setProxyMode,
        "changeLine":changeLine,
        "getServerList":getServerList,
        "getProxyInfo":getProxyInfo,
        "getTryout":getTryout,
        "heart":heart
    }
}]);

rocket.factory("popupService",["$rootScope","$timeout",function($rootScope,$timeout){
        //获得当前Tab的URL地址,赋值给localStorage
        function getCurrentTabUrl(){
            chrome.tabs.getSelected(null, function(tab) {
                localStorage.currentTabUrl = tab.url;
            });
        }

        //获得当前Tab的webDomain域名,赋值给localStorage
        function setWebDomain(){
            $timeout(function(){
                if(localStorage.currentTabUrl){
                    var urlk = localStorage.currentTabUrl;
                    if(urlk.substring(0,9)!="chrome://" && urlk.substring(0,19)!="chrome-extension://"){
                        urlk = tldjs.getDomain(localStorage.currentTabUrl);
                    }
                    localStorage.currentWebDomain=urlk;
                    $rootScope.currentTabUrl = urlk.substring(0,28);

                    //当前网站是否已加入智能代理里列表
                    var hasInAutoProxyList =weatherInAutoProxyList(localStorage.currentWebDomain);
                    if(hasInAutoProxyList){
                        $rootScope.add_this="hide";
                        $rootScope.remove_this="";
                    }else{
                        $rootScope.add_this="";
                        $rootScope.remove_this="hide"
                    }

                    if(localStorage.ProxyMode=="smarty"){
                        var hasInAutoProxyList =weatherInAutoProxyList(localStorage.currentWebDomain);
                        if(hasInAutoProxyList){
                            chrome.tabs.getSelected(null, function(tab) {
                                var tabId = tab.id;
                                var error_tab =[];
                                if(localStorage["errorTab_"+tabId]){
                                    error_tab = localStorage["errorTab_"+tabId].split(",");
                                }
                                //console.log(error_tab);
                                var error_tab2=[];
                                for(var j=0;j<3;j++){
                                    if(!weatherInAutoProxyList(error_tab[j])){
                                        if(tldjs.isValid(error_tab[j]))
                                        error_tab2.unshift(error_tab[j])
                                    }
                                }
                                //console.log(error_tab2);
                                if(error_tab2.length){
                                    $rootScope.error_tab = error_tab2;
                                    $rootScope.normal_adds_div="hide";
                                    $rootScope.error_adds_div="";
                                }
                            });
                        }
                    }
                }else{
                    setWebDomain();
                }
            },100);
        }

        //判断当前webDomain是否在智能代理的列表中,返回:TRUE or FALSE
        function weatherInAutoProxyList(domain){
           //判断是否存在 $rootScope.autoProxyList
            var autoProxyList = localStorage.autoProxyList.split(",");
            if(domain && (domain.indexOf("google")>"-1")){
                return true;
            }
            if($.inArray(domain, autoProxyList)!="-1"){
                 //存在,返回true
                 return true;
            }else{
                //不存在,返回false
                return false;
            }
        }

        return {
            "getCurrentTabUrl":getCurrentTabUrl,
            "setWebDomain":setWebDomain,
            "weatherInAutoProxyList":weatherInAutoProxyList
        }
}]);

rocket.factory("notice",["$rootScope",function($rootScope){
    function notify(message){
                  var opt = {
                      type: "basic", 
                      title: websitename+"提醒", 
                      message: message, 
                      iconUrl: "images/"+websitenameen+"/logos/logo.png" 
                  }; 
        chrome.notifications.create('',opt,function(id){  });
     }
    return {
        "notify":notify
    }
}]);
