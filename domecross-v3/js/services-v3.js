/**
 * Domecross V3 Services - 适配Chrome Extension V3
 * 从原services.js重构而来，移除了需要在service worker中处理的逻辑
 */

/**
 * config工厂 - 简化版本，主要用于popup页面配置
 * V3改造说明: 移除了标签页监听器(移至service worker)，保留popup需要的配置
 */
rocket.factory("config",["$rootScope",function($rootScope){
    function init(){
        // 设置基本配置到rootScope
        $rootScope.websitename = websitename;
        $rootScope.websiteurl = websiteurl;
        $rootScope.websiteurl_s = websiteurl_s;
        $rootScope.websitenameen = websitenameen;
        $rootScope.banben = banben;
        $rootScope.month_price = month_price;
        $rootScope.fenxiang = fenxiang;
        $rootScope.fenxiang_encode = fenxiang_encode;
        
        console.log('Config初始化完成 - V3版本');
        
        // V3改造说明: 标签页监听器已移至service worker，这里不再需要
        // 原来的chrome.tabs.onUpdated等监听器现在在service-worker.js中处理
    }

    return {
        "init": init
    }
}]);

/**
 * baseService工厂 - 简化版本，移除service worker功能
 * V3改造说明: 保留popup需要的基础服务，移除后台服务逻辑
 */
rocket.factory("baseService",["$rootScope","$timeout","popupService","net","notice",function($rootScope,$timeout,popupService,net,notice){
    async function init(){
        console.log('BaseService初始化 - V3版本');
        
        // 设置默认自动代理列表
        const defaultProxyList = ["2mdn.net","3rdwavemedia.com","51jsq.org","80host.com","adver.com.tw","akamaihd.net","amazonaws.com","android.com","angularjs.org","apache.org","api-public.addthis.com","appspot.com","archive.org","archlinux.org","asciiflow.com","askci.com","audi-finance.com.cn","awsstatic.com","barracuda.com","berkeley.edu","bit.ly","blogblog.com","blogger.com","blogspot.co.uk","blogspot.com","blogspot.jp","bluemix.net","boardreader.com","box.com","braintreegateway.com","breakwall.net","brocadeconnect.com","brunoxu.com","c.isdspeed.qq.com","cacti.net","camscanner.com","chaiyalin.com","changyy.org","chenshake.com","chinadmd.com","chinagfw.org","chrome.com","chromium.com","chromium.org","cisco.com","cloudflare.com","cloudfront.net","cmcore.com","cnomy.com","codegangsta.io","comodoca.com","comodosslstore.com","conviva.com","crossl.net","crowdflower.com","cvedetails.com","daisygao.com","dallascao.com","dartlang.org","demandbase.com","devshed.com","digitalocean.com","docker.com","docker.io","doubleclick.net","drazens.com","dropbox.com","dropboxusercontent.com","dwnews.com","dyndns.org","envato.com","equinox.io","evozi.com","exoclick.com","expresspixel.com","extensions","facebook.com","facebook.net","fastly.net","favstar.fm","fbcdn.net","feedburner.com","feilong.me","ffvpn.com","flickr.com","fortinet.com","fqrouter.com","freebsd.org","freedom-man.com","freemao.info","game4fun.cn","game4fun.it","game4fun.me","gcsdblogs.org","gcsdstaff.org","gengbiao.me","getlantern.org","ggpht.com","ghconduit.com","github.com","github.io","githubusercontent.com","glbproxy.com","gliffy.com","glinskiy.com","gmail.com","gmane.org","gobyexample.com","godaddy.com","godoc.org","golang.org","golanghome.com","goo.gl","google-analytics.com","google.co.id","google.co.jp","google.com","google.com.hk","google.com.sg","google.com.tw","google.lk","googleadservices.com","googleapis.com","googlecode.com","googlegroups.com","googlesyndication.com","googletagservices.com","googleusercontent.com","googlevideo.com","googlezip.net","gorillatoolkit.org","grafana.org","gravatar.com","gstatic.com","gtcomm.net","guolinn.com","guyvansanden.be","hatenablog.com","heroku.com","hiali.xyz","honeyproxy.org","howtogeek.com","html5rocks.com","httpsindex.docker.io","hupso.com","hyperic.com","iasds01.com","ibm.com","ibmcloud.com","ibruce.info","ibxads.com","igfw.net","igvita.com","ilch.me","imgur.com","influxdb.com","infoq.com","instagram.com","cdninstagram.com","instantssl.com","ip.cn","iron.io","iteye.com","ithome.com.tw","jaceju.net","jamyy-s.us.to","jamyy.us.to","javabien.net","jazz.net","jetpack.me","jingpin.org","jquery.com","jsonlint.com","jwpcdn.com","k.vu","keakon.net","krizna.com","labalec.fr","lang.askci.com","leafh.pw","leawo.cn","libgd.org","linode.com","linuxboy.net","linuxcrafts.com","liveleak.com","m.addthis.com","maoshu.cc","marc.info","mariadb.com","marketo.net","martinfjordvald.com","mathtag.com","mazon.com","mediacru.sh","mediafire.com","mega.co.nz","mitmproxy.org","mmmglobal.org","modern.ie","mosir.org","my-proxy.com","mykeyport.com","mysql.com","neuhalfen.name","newtab","nghttp2.org","nmap.org","nodejs.org","noobslab.com","oldapps.com","omnigroup.com","onclickads.net","onsen.ag","openlogic.com","openshift.com","optimizely.com","packtpub.com","pastebin.com","pbone.net","pchome.com.tw","philipotoole.com","pixnet.net","pinterest.com","pinimg.com","accountkit.com","porn.com","pornhub.com","pwnyoutube.com","python.org","qiita.com","readthedocs.org","redhat.com","rgstatic.net","rust-lang.org","s3.amazonaws.com","safesrv.net","scratchpaper.com","screenyapp.com","secretchina.com","sequelpro.com","shadowsocks.org","sharesend.com","shui.us","sinaimg.cn","skanetwork.com","skydao.com","slideshare.net","slidesharecdn.com","socket.io","socketloop.com","sourcecode.net.br","sourceforge.net","spiceworks.com","sstatic.net","stackoverflow.com","sublimevideo.net","suiviperf.com","sunnyxx.com","sybase.com","symantec.com","t.co","t66y.com","91porn.com","texturevd.com.tw","themeforest.net","tidalpool.ca","tinypng.com","torcache.net","travis-ci.org","trialfire.com","truste.com","tumblr.com","tweettunnel.com","twimg.com","twitter.com","typekit.net","txxx.com","uk2.net","useso.com","v2ex.com","vimeo.com","vpngate.net","vpsee.com","vulcanproxy.com","w.org","websitepulse.com","widuu.com","wikia.com","wikidot.com","wordpress.com","wordpress.org","wp.com","wrapbootstrap.com","www.sina.com","xingwu.me","xmpp.org","xuite.net","xvideos.es","yahoo.com","yam.com","yourlust.com","youtu.be","youtube-nocookie.com","youtube.com","ytimg.com","zh.wikipedia.org"];
        
        // 使用V3适配器设置默认值
        const currentAutoProxyList = await window.storageAdapter.get('autoProxyList');
        if (!currentAutoProxyList) {
            await window.storageAdapter.set('autoProxyListDefault', defaultProxyList.join(','));
            await window.storageAdapter.set('autoProxyList', defaultProxyList.join(','));
        }

        // 设置代理模式UI状态
        $rootScope.proxyModeAlways = $rootScope.proxyModeSmarty = $rootScope.proxyModeClose = "btn-default";
        
        const currentProxyMode = await window.storageAdapter.get('ProxyMode') || 'close';
        await window.storageAdapter.set('ProxyMode', currentProxyMode);

        // 初始化UI状态
        $rootScope.alertDivDisplay = "hide";
        $rootScope.tab3 = "";
        $rootScope.tab4 = "hide";
        $rootScope.addalert1 = "";
        $rootScope.addalert2 = "hide";
        $rootScope.addalert3 = "hide";
        $rootScope.lineName = "";

        // 设置代理模式按钮状态
        updateProxyModeButtons(currentProxyMode);

        console.log('BaseService初始化完成');
    }

    function updateProxyModeButtons(mode) {
        $rootScope.proxyModeAlways = "btn-default";
        $rootScope.proxyModeSmarty = "btn-default"; 
        $rootScope.proxyModeClose = "btn-default";

        switch(mode) {
            case 'always':
                $rootScope.proxyModeAlways = "btn-success";
                break;
            case 'smarty':
                $rootScope.proxyModeSmarty = "btn-success";
                break;
            case 'close':
            default:
                $rootScope.proxyModeClose = "btn-success";
                break;
        }
    }

    return {
        "init": init,
        "updateProxyModeButtons": updateProxyModeButtons
    }
}]);

/**
 * net工厂 - 网络相关服务
 * V3改造说明: 保持网络请求功能，但使用现代fetch API
 */
rocket.factory("net",["$rootScope","$q",function($rootScope, $q){
    
    async function getServerList() {
        try {
            const positionc = await window.storageAdapter.get('positionc');
            const url = jerry(positionc);
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('获取服务器列表失败:', error);
            throw error;
        }
    }

    async function heartbeat() {
        try {
            const positiona = await window.storageAdapter.get('positiona');
            const url = jerry(positiona);
            
            // 构造心跳数据
            const heartbeatData = {
                // 这里添加需要的心跳数据
            };
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(heartbeatData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('心跳失败:', error);
            throw error;
        }
    }

    return {
        "getServerList": getServerList,
        "heartbeat": heartbeat
    }
}]);

/**
 * popupService工厂 - popup页面专用服务
 * V3改造说明: 使用V3适配的Chrome API
 */
rocket.factory("popupService",["$rootScope",function($rootScope){
    
    async function getCurrentTabUrl() {
        try {
            const tab = await window.chromeAdapter.getCurrentTab();
            if (tab && tab.url) {
                localStorage.currentTabUrl = tab.url;
                $rootScope.currentTabUrl = tab.url;
                $rootScope.$apply();
                return tab.url;
            }
        } catch (error) {
            console.error('获取当前标签页URL失败:', error);
        }
        return null;
    }

    function setWebDomain() {
        if (localStorage.currentTabUrl) {
            try {
                const url = new URL(localStorage.currentTabUrl);
                const domain = tldjs.getDomain(url.hostname);
                localStorage.currentTabDomain = domain;
                $rootScope.currentTabDomain = domain;
                
                // 检查是否在自动代理列表中
                checkDomainInAutoProxyList(domain);
            } catch (error) {
                console.error('解析域名失败:', error);
            }
        }
    }

    async function checkDomainInAutoProxyList(domain) {
        try {
            const autoProxyList = await window.storageAdapter.get('autoProxyList');
            if (autoProxyList) {
                const domains = autoProxyList.split(',');
                const isInList = domains.includes(domain);
                
                if (isInList) {
                    $rootScope.add_this = "hide";
                    $rootScope.remove_this = "";
                } else {
                    $rootScope.add_this = "";
                    $rootScope.remove_this = "hide";
                }
                $rootScope.$apply();
            }
        } catch (error) {
            console.error('检查域名列表失败:', error);
        }
    }

    async function addDomainToAutoProxy(domain) {
        try {
            const autoProxyList = await window.storageAdapter.get('autoProxyList') || '';
            const domains = autoProxyList ? autoProxyList.split(',') : [];
            
            if (!domains.includes(domain)) {
                domains.push(domain);
                await window.storageAdapter.set('autoProxyList', domains.join(','));
                
                // 更新UI
                $rootScope.add_this = "hide";
                $rootScope.remove_this = "";
                $rootScope.$apply();
                
                console.log('域名已添加到自动代理列表:', domain);
                return true;
            }
        } catch (error) {
            console.error('添加域名到自动代理列表失败:', error);
        }
        return false;
    }

    async function removeDomainFromAutoProxy(domain) {
        try {
            const autoProxyList = await window.storageAdapter.get('autoProxyList') || '';
            const domains = autoProxyList ? autoProxyList.split(',') : [];
            
            const index = domains.indexOf(domain);
            if (index > -1) {
                domains.splice(index, 1);
                await window.storageAdapter.set('autoProxyList', domains.join(','));
                
                // 更新UI
                $rootScope.add_this = "";
                $rootScope.remove_this = "hide";
                $rootScope.$apply();
                
                console.log('域名已从自动代理列表移除:', domain);
                return true;
            }
        } catch (error) {
            console.error('从自动代理列表移除域名失败:', error);
        }
        return false;
    }

    return {
        "getCurrentTabUrl": getCurrentTabUrl,
        "setWebDomain": setWebDomain,
        "checkDomainInAutoProxyList": checkDomainInAutoProxyList,
        "addDomainToAutoProxy": addDomainToAutoProxy,
        "removeDomainFromAutoProxy": removeDomainFromAutoProxy
    }
}]);

/**
 * notice工厂 - 通知服务
 * V3改造说明: 使用chrome.notifications API
 */
rocket.factory("notice",["$rootScope",function($rootScope){
    
    async function notify(message, title = 'Domecross') {
        try {
            if (chrome.notifications) {
                const notificationId = 'domecross_' + Date.now();
                await chrome.notifications.create(notificationId, {
                    type: 'basic',
                    iconUrl: 'images/domecross/logos/logo_green.png',
                    title: title,
                    message: message
                });
                
                // 3秒后自动清除通知
                setTimeout(() => {
                    chrome.notifications.clear(notificationId);
                }, 3000);
            } else {
                console.log('通知:', message);
            }
        } catch (error) {
            console.error('发送通知失败:', error);
        }
    }

    return {
        "notify": notify
    }
}]);

console.log('Domecross V3 Services 加载完成');
