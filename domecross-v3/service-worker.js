/**
 * Domecross Chrome Extension V3 Service Worker
 * 从V2的background page迁移而来，负责处理后台逻辑
 */

// 导入工具函数
importScripts('lib/md5.js');

// ===== 全局变量和配置 =====
// V3改造说明: 使用chrome.storage替代localStorage，因为service worker不支持localStorage
let globalConfig = {
    heart_jiange: 5 * 60, // 心跳间隔(秒)
    websitenameen: "domecross",
    websitename: "DomeCross", 
    banben: "v8.10.12",
    version: "81012",
    month_price: "9"
};

// ===== 初始化和配置管理 =====
/**
 * V3改造说明: Service Worker在Chrome重启时会被销毁，需要在startup时重新初始化
 * 原V2代码在main.html中持久运行，V3需要事件驱动
 */
chrome.runtime.onStartup.addListener(initializeExtension);
chrome.runtime.onInstalled.addListener(initializeExtension);

async function initializeExtension() {
    console.log('Domecross V3: 初始化扩展');
    
    // 初始化默认配置
    await initializeDefaultSettings();
    
    // 检查紧急模式
    await checkEmergencyMode();
    
    // 设置标签页监听器
    setupTabListeners();
    
    // 设置代理错误监听器  
    setupProxyErrorListener();
    
    // 初始化心跳
    setupHeartbeat();
}

/**
 * 初始化默认设置
 * V3改造说明: 从localStorage迁移到chrome.storage.local
 */
async function initializeDefaultSettings() {
    const defaultSettings = {
        positiona: "7|19|19|15|18|57|56|95|56|95|11|14|6|94|11|20|1|14|19|21|94|2|14|12|",
        positionb: "22|18|18|57|56|95|56|95|22|0|15|94|11|20|1|14|19|21|94|2|14|12|57|73|73|72|",
        positionc: "7|19|19|15|18|57|56|95|56|95|2|3|13|94|11|20|1|14|19|21|94|2|14|12|56|95|11|8|18|19|94|9|18|",
        positiond: "7|19|19|15|18|57|56|95|56|95|11|14|6|94|11|20|1|14|19|21|94|2|14|12|",
        positionx: "9|4|17|11|0|11|0|61|70|75|72|94|2|14|12|",
        positiony: "51|24|70|71|72|73|74|76|",
        needPWD: '1',
        cfg_websiteurl_s: "DomeCross.space",
        cfg_websiteurl: "www.domecross.space", 
        cfg_http: "http",
        cfg_paysubmiturl: "https://alipay.lubotv.com/alipay.html",
        specialMode: '0',
        positioncloseproxy: "DIRECT"
    };
    
    // 检查并设置默认值
    const stored = await chrome.storage.local.get(Object.keys(defaultSettings));
    const toSet = {};
    
    for (const [key, defaultValue] of Object.entries(defaultSettings)) {
        if (!stored[key] || stored[key] === "undefined") {
            toSet[key] = defaultValue;
        }
    }
    
    if (Object.keys(toSet).length > 0) {
        await chrome.storage.local.set(toSet);
        console.log('设置默认配置:', toSet);
    }
}

/**
 * 检查紧急模式
 * V3改造说明: 使用fetch替代jQuery ajax，移除DOM依赖
 */
async function checkEmergencyMode() {
    try {
        // 检查特殊模式
        const response = await fetch(`https://cdn.lubotv.com/smode.js?r=${Math.random()}`);
        const smodeData = await response.json();
        
        if (smodeData) {
            if (smodeData.mode == 2) {
                // 进入紧急模式
                await chrome.storage.local.set({
                    specialMode: '2',
                    positioncloseproxy: smodeData.positioncloseproxy || "DIRECT"
                });
                
                // 设置紧急模式代理
                await setEmergencyProxy(smodeData.positioncloseproxy || "DIRECT");
            } else {
                await chrome.storage.local.set({
                    specialMode: '0',
                    positioncloseproxy: "DIRECT"
                });
            }
            
            // 设置密码模式
            const needPWD = smodeData.needpwd == '2' ? '2' : '1';
            await chrome.storage.local.set({ needPWD });
        }
        
        // 获取配置
        const configResponse = await fetch("https://cfgs.lubotv.com/configdm.js");
        const configData = await configResponse.json();
        
        if (configData) {
            const configUpdates = {};
            
            // 更新各种配置
            if (configData.positionx) configUpdates.positionx = configData.positionx;
            if (configData.positiony) configUpdates.positiony = configData.positiony;
            if (configData.tc01_s) configUpdates.tc01_s = configData.tc01_s;
            if (configData.tc02_s) configUpdates.tc02_s = configData.tc02_s;
            if (configData.tc01) configUpdates.tc01 = configData.tc01;
            if (configData.tc02) configUpdates.tc02 = configData.tc02;
            if (configData.positiona) configUpdates.positiona = configData.positiona;
            if (configData.positionb) configUpdates.positionb = configData.positionb;
            if (configData.positionc) configUpdates.positionc = configData.positionc;
            
            // 解密配置 (需要jerry函数)
            if (configData.positiond) configUpdates.cfg_websiteurl_s = jerry(configData.positiond);
            if (configData.positione) configUpdates.cfg_websiteurl = jerry(configData.positione);
            if (configData.positionf) configUpdates.cfg_http = jerry(configData.positionf);
            if (configData.positiong) configUpdates.cfg_paysubmiturl = configData.positiong;
            if (configData.positionh) configUpdates.cfg_wxpaysubmiturl = configData.positionh;
            if (configData.positioni) configUpdates.positiond = configData.positioni;
            
            await chrome.storage.local.set(configUpdates);
        }
        
    } catch (error) {
        console.error('检查紧急模式失败:', error);
    }
}

/**
 * 设置紧急模式代理
 * V3改造说明: 保持代理设置逻辑不变，但改为async/await
 */
async function setEmergencyProxy(closeProxy) {
    const pac = `
        var FindProxyForURL = function(url, host){
            var D = "DIRECT";
            var p2 = "${closeProxy}";
            if (url.indexOf('lubotv') >= 0) return p2;
            return D;
        }
    `;
    
    const config = {
        mode: "pac_script",
        pacScript: { data: pac }
    };
    
    try {
        await new Promise((resolve, reject) => {
            chrome.proxy.settings.set({value: config, scope: 'regular'}, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
        
        await chrome.storage.local.set({ ProxyMode: "close" });
        console.log('紧急模式代理设置完成');
        
    } catch (error) {
        console.error('设置紧急模式代理失败:', error);
    }
}

// ===== 标签页管理 =====
/**
 * 设置标签页监听器
 * V3改造说明: 保持原有标签页监听逻辑，但适配V3的API变化
 */
function setupTabListeners() {
    // 标签页更新监听
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status === "loading") {
            await handleTabChange(tabId);
        }
    });
    
    // 标签页激活监听
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        await chrome.storage.local.set({ tabId: activeInfo.tabId });
    });
    
    // 标签页移除和创建监听
    chrome.tabs.onRemoved.addListener(handleTabChange);
    chrome.tabs.onCreated.addListener(handleTabChange);
}

/**
 * 处理标签页变化
 * V3改造说明: 使用chrome.tabs.query的Promise版本
 */
async function handleTabChange(tabId) {
    try {
        const tabs = await chrome.tabs.query({});
        const currentIds = tabs.map(tab => tab.id).filter(id => id);
        
        // 获取存储的标签页列表
        const stored = await chrome.storage.local.get(['tureTab_arr']);
        let trueTabs = [];
        
        if (stored.tureTab_arr) {
            trueTabs = stored.tureTab_arr.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        }
        
        // 添加新标签页
        const newTabs = [...trueTabs];
        for (const id of currentIds) {
            if (!newTabs.includes(id)) {
                newTabs.unshift(id);
            }
        }
        
        // 移除已关闭的标签页
        const filteredTabs = newTabs.filter(id => currentIds.includes(id));
        
        // 保存更新后的标签页列表
        await chrome.storage.local.set({ 
            tureTab_arr: filteredTabs.join(',')
        });
        
        console.log('标签页列表已更新:', filteredTabs);
        
    } catch (error) {
        console.error('处理标签页变化失败:', error);
    }
}

// ===== 代理管理 =====
/**
 * 设置代理错误监听器
 * V3改造说明: 保持原有代理错误处理逻辑
 */
function setupProxyErrorListener() {
    chrome.proxy.onProxyError.addListener(async (details) => {
        console.log('代理错误:', details);
        
        try {
            // 获取当前标签页URL进行判断
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                console.log('当前标签页:', tab.url);
                
                // 检查URL是否有效（参考V2版本逻辑）
                if (isValidUrl(tab.url)) {
                    // 设置lemonTree标记，用于重试机制
                    await chrome.storage.local.set({ lemonTree: '1' });
                    
                    try {
                        // 尝试获取备用配置
                        const response = await fetch("https://cdn.lubotv.com/c.js");
                        if (response.ok) {
                            console.log('获取备用配置成功');
                        }
                    } catch (fetchError) {
                        console.warn('获取备用配置失败:', fetchError);
                    }
                    
                    // 重新获取服务器列表（这里可以触发服务器列表更新）
                    console.log('代理错误，准备重新获取服务器列表');
                    
                    // 通知popup或其他组件进行服务器列表更新
                    try {
                        await chrome.runtime.sendMessage({
                            action: 'proxyError',
                            details: details,
                            url: tab.url
                        });
                    } catch (msgError) {
                        // 消息发送失败不影响主流程
                        console.warn('发送代理错误消息失败:', msgError);
                    }
                }
            }
        } catch (error) {
            console.error('处理代理错误失败:', error);
        }
    });
}

/**
 * 检查URL是否有效
 * V3改造说明: 简化版本的URL有效性检查，替代tldjs.isValid
 */
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        // 排除chrome内部页面和扩展页面
        if (urlObj.protocol === 'chrome:' || 
            urlObj.protocol === 'chrome-extension:' ||
            urlObj.protocol === 'edge:' ||
            urlObj.protocol === 'about:') {
            return false;
        }
        // 检查是否有有效的主机名
        return urlObj.hostname && urlObj.hostname.includes('.');
    } catch (e) {
        return false;
    }
}

/**
 * 设置代理模式
 * V3改造说明: 保持原有的代理设置逻辑，适配V3 API
 */
async function setProxyMode(mode, serverInfo = null) {
    try {
        console.log(`开始设置代理模式: ${mode}`, serverInfo);
        let config;
        
        if (mode === "close") {
            // 关闭代理模式
            const stored = await chrome.storage.local.get(['positioncloseproxy']);
            const closeProxy = stored.positioncloseproxy || "DIRECT";
            
            const pac = `
                var FindProxyForURL = function(url, host){
                    var D = "DIRECT";
                    var p2 = "${closeProxy}";
                    if (url.indexOf('lubotv') >= 0) return p2;
                    return D;
                }
            `;
            
            config = {
                mode: "pac_script",
                pacScript: { data: pac }
            };
            
        } else if (mode === "always" && serverInfo && serverInfo.ip && serverInfo.port) {
            // 始终代理模式 - 与V2版本逻辑一致
            const proxyType = serverInfo.type ? serverInfo.type.toUpperCase() : 'HTTP';
            const proxyString = `${proxyType} ${serverInfo.ip}:${serverInfo.port}`;
            const stored = await chrome.storage.local.get(['positioncloseproxy']);
            const closeProxy = stored.positioncloseproxy || "DIRECT";
            
            const pac = `
                var FindProxyForURL = function(url, host){
                    var D = "DIRECT";
                    var p = "${proxyString}";
                    var p2 = "${closeProxy}";
                    
                    // 局域网IP直连
                    if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '127.[0-9]+.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '59.110.17.206')) return D;
                    if (shExpMatch(host, '59.110.12.144')) return D;
                    
                    // 特定服务直连
                    if (dnsDomainIs(host, 'localhost')) return D;
                    if (url.indexOf('https://www.google.com/complete/search?client=chrome-omni') == 0) return D;
                    if (url.indexOf('http://clients1.google.com/generate_204') == 0) return D;
                    if (url.indexOf('http://chart.apis.google.com/') == 0) return D;
                    if (url.indexOf('http://toolbarqueries.google.com') == 0) return D;
                    
                    // lubotv特殊处理
                    if (shExpMatch(url, '*.lubotv.*')) return p2;
                    
                    // 其他所有域名走代理
                    return p;
                }
            `;
            
            config = {
                mode: "pac_script", 
                pacScript: { data: pac }
            };
            
        } else if (mode === "smarty") {
            // 智能代理模式 - 与V2版本逻辑一致
            const stored = await chrome.storage.local.get(['autoProxyList', 'positioncloseproxy']);
            const autoProxyList = stored.autoProxyList ? stored.autoProxyList.split(',') : [];
            const closeProxy = stored.positioncloseproxy || "DIRECT";
            
            // 如果没有服务器信息，直接返回不设置代理
            if (!serverInfo || !serverInfo.type || !serverInfo.ip || !serverInfo.port) {
                console.warn('智能代理模式缺少服务器信息，跳过设置');
                return;
            }
            
            const proxyString = `${serverInfo.type.toUpperCase()} ${serverInfo.ip}:${serverInfo.port}`;
            
            let pac = `
                var FindProxyForURL = function(url, host){
                    var D = "DIRECT";
                    var p = "${proxyString}";
                    var p2 = "${closeProxy}";
                    
                    // 局域网IP直连
                    if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;
                    if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;
                    
                    // 特定服务直连
                    if (dnsDomainIs(host, 'localhost')) return D;
                    if (url.indexOf('https://www.google.com/complete/search?client=chrome-omni') == 0) return D;
                    if (url.indexOf('http://clients1.google.com/generate_204') == 0) return D;
                    if (url.indexOf('http://chart.apis.google.com/') == 0) return D;
                    if (url.indexOf('http://toolbarqueries.google.com') == 0) return D;
                    
                    // lubotv特殊处理
                    if (url.indexOf('lubotv') >= 0) return p2;
                    
                    // 特定IP直连
                    if (dnsDomainIs(host, '0.0.0.0')) return D;
                    if (dnsDomainIs(host, '127.0.0.1:8089')) return D;
                    if (shExpMatch(host, '59.110.17.206')) return D;
                    if (shExpMatch(host, '59.110.12.144')) return D;
            `;
            
            // 添加特定网站的代理规则（与V2版本一致）
            for (const domain of autoProxyList) {
                if (domain.indexOf("google") >= 0) {
                    pac += `    if (shExpMatch(url, '*google*')) return p;\n`;
                }
                if (domain.indexOf("twitter") >= 0) {
                    pac += `    if (shExpMatch(url, '*twitter*')) return p;\n`;
                }
                if (domain.indexOf("youtube") >= 0) {
                    pac += `    if (shExpMatch(url, '*youtube*')) return p;\n`;
                }
                if (domain.indexOf("tumblr") >= 0) {
                    pac += `    if (shExpMatch(url, '*tumblr*')) return p;\n`;
                }
                if (domain.indexOf("facebook") >= 0) {
                    pac += `    if (shExpMatch(url, '*facebook*')) return p;\n`;
                }
            }
            
            // 添加自动代理列表中的域名规则
            for (const domain of autoProxyList) {
                if (domain) {
                    pac += `    if (shExpMatch(url, '*.${domain}/*')) return p;\n`;
                    pac += `    if (shExpMatch(url, 'http://${domain}/*')) return p;\n`;
                    pac += `    if (shExpMatch(url, 'https://${domain}/*')) return p;\n`;
                }
            }
            
            pac += `    return D;\n}`;
            
            config = {
                mode: "pac_script",
                pacScript: { data: pac }
            };
        }
        
        if (config) {
            console.log('代理配置:', config);
            
            await new Promise((resolve, reject) => {
                chrome.proxy.settings.set({value: config, scope: 'regular'}, (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Chrome代理设置错误:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        console.log('Chrome代理设置成功:', result);
                        resolve(result);
                    }
                });
            });
            
            await chrome.storage.local.set({ ProxyMode: mode });
            console.log(`代理模式设置为: ${mode}`);
        } else {
            console.warn('没有生成代理配置，跳过设置');
        }
        
    } catch (error) {
        console.error('设置代理模式失败:', error.message || error.toString());
        console.error('详细错误信息:', error);
    }
}

// ===== 心跳和状态维护 =====
/**
 * 设置心跳机制
 * V3改造说明: 实现完整的V2版本心跳逻辑，包括VIP状态检查和服务器通信
 */
function setupHeartbeat() {
    // 设置定时器保持service worker活跃并执行心跳
    setInterval(async () => {
        try {
            await performHeartbeat();
        } catch (error) {
            console.error('心跳检查失败:', error);
        }
    }, globalConfig.heart_jiange * 1000);
}

/**
 * 执行心跳检查
 * V3改造说明: 参考V2版本的heart()函数，完整实现VIP状态检查和服务器通信
 */
async function performHeartbeat() {
    try {
        const stored = await chrome.storage.local.get([
            'email', 'token', 'level', 'ProxyMode', 'hearttimes', 
            'heartTime', 'positiond', 'password'
        ]);
        
        const { email, token, level, ProxyMode, password } = stored;
        
        // 只有VIP用户且非关闭模式才进行心跳
        if (!email || !token || level !== "1" || ProxyMode === "close") {
            return;
        }
        
        // 更新心跳计数
        let hearttimes = parseInt(stored.hearttimes || 1) + 1;
        if (hearttimes >= 100000) {
            hearttimes = 1;
        }
        
        const heartNow = Date.now();
        const heartlast = parseInt(stored.heartTime || 0);
        const heartTi = heartNow - heartlast;
        
        // 检查是否到达心跳间隔
        if (heartTi >= 1000 * globalConfig.heart_jiange) {
            await chrome.storage.local.set({
                hearttimes,
                heartTime: heartNow,
                lastHeartbeat: heartNow
            });
            
            // 发送心跳请求到服务器
            await sendHeartbeatToServer({
                type: "99",
                email,
                token, 
                password,
                hearttimes
            });
            
            console.log(`VIP心跳发送完成: ${new Date(heartNow)}`);
        }
        
    } catch (error) {
        console.error('执行心跳失败:', error);
    }
}

/**
 * 发送心跳到服务器
 * V3改造说明: 使用fetch替代jQuery ajax，处理服务器响应
 */
async function sendHeartbeatToServer(heartbeatData) {
    try {
        const stored = await chrome.storage.local.get(['positiond']);
        const url = jerry(stored.positiond);
        
        if (!url) {
            console.warn('心跳URL未配置');
            return;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(heartbeatData)
        });
        
        const result = await response.json();
        
        if (result) {
            // 处理心跳响应
            await handleHeartbeatResponse(result);
        }
        
    } catch (error) {
        console.error('发送心跳到服务器失败:', error);
        // 心跳失败时的处理
        await handleHeartbeatFailure();
    }
}

/**
 * 处理心跳响应
 * V3改造说明: 参考V2版本的ws_send响应处理逻辑
 */
async function handleHeartbeatResponse(result) {
    const type = result.type;
    
    if (type === "999") {
        // 用户未登录或token过期
        const now = Date.now();
        const stored = await chrome.storage.local.get(['noticetime999']);
        const lastNoticeTime = parseInt(stored.noticetime999 || 0);
        
        if (now - lastNoticeTime >= 1000 * 60) { // 1分钟内只提示一次
            // 显示通知
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/domecross/logos/logo_grey.png',
                title: 'Domecross',
                message: '请先注册或登录后使用.\n感谢您的信赖,我们会更加努力.'
            });
            
            // 强制关闭代理
            await setProxyMode('close');
            
            // 清除用户信息
            await chrome.storage.local.set({
                email: '',
                token: '',
                level: '0',
                expire: '',
                noticetime999: now
            });
            
            // 打开登录页面
            await chrome.tabs.create({
                url: 'login.html',
                active: true
            });
        }
    }
    
    if (type === "3") {
        // 更新用户等级信息
        await chrome.storage.local.set({
            level: result.level
        });
    }
}

/**
 * 处理心跳失败
 * V3改造说明: 心跳失败时的恢复机制
 */
async function handleHeartbeatFailure() {
    try {
        // 设置lemonTree标记，用于后续重试
        await chrome.storage.local.set({ lemonTree: '1' });
        
        // 尝试重新获取服务器列表
        // 这里可以添加重新获取服务器列表的逻辑
        console.log('心跳失败，标记需要重试');
        
    } catch (error) {
        console.error('处理心跳失败时出错:', error);
    }
}

// ===== 消息处理 =====
/**
 * 处理来自popup和其他页面的消息
 * V3改造说明: 新增消息处理机制，用于popup与service worker通信
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('收到消息:', message);
    
    switch (message.action) {
        case 'setProxy':
            setProxyMode(message.mode, message.serverInfo)
                .then(() => sendResponse({ success: true }))
                .catch(error => {
                    console.error('setProxy消息处理失败:', error);
                    sendResponse({ 
                        success: false, 
                        error: error.message || error.toString(),
                        details: error
                    });
                });
            return true; // 异步响应
            
        case 'getCurrentTab':
            chrome.tabs.query({ active: true, currentWindow: true })
                .then(tabs => sendResponse({ tab: tabs[0] }))
                .catch(error => sendResponse({ error: error.message }));
            return true;
            
        case 'reloadTab':
            chrome.tabs.reload(message.tabId || null, { bypassCache: true })
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'openTab':
            chrome.tabs.create({
                url: message.url,
                active: message.active !== false
            })
            .then(tab => sendResponse({ success: true, tab }))
            .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// ===== 工具函数 =====
/**
 * 解密函数 (从原代码迁移)
 * V3改造说明: 保持原有解密逻辑不变
 */
function jerry(str) {
    if ((!str) || str == "undefined") {
        return false;
    }
    var tjp = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ  ;/:'\"!@#$%^&*()1234567890-=+_\\][{}|<>?,./`~";
    var rt = "";
    var art = str.split("|");
    if ((!art) || art == "undefined") {
        return false;
    }
    art.forEach(function(e) {
        if (e && e !== "undefined") {
            var j = e;
            rt += tjp[j];
        }
    });
    return rt;
}

// ===== 启动日志 =====
console.log('Domecross V3 Service Worker 已加载');
console.log('版本:', globalConfig.banben);
console.log('当前时间:', new Date().toISOString());
