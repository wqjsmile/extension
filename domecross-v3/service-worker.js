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
                // 这里可以添加代理错误的处理逻辑
                console.log('当前标签页:', tab.url);
            }
        } catch (error) {
            console.error('处理代理错误失败:', error);
        }
    });
}

/**
 * 设置代理模式
 * V3改造说明: 保持原有的代理设置逻辑，适配V3 API
 */
async function setProxyMode(mode, serverInfo = null) {
    try {
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
            
        } else if (mode === "always" && serverInfo) {
            // 始终代理模式
            const pac = `
                var FindProxyForURL = function(url, host){
                    var D = "DIRECT";
                    var p = "${serverInfo.type.toUpperCase()} ${serverInfo.ip}:${serverInfo.port}";
                    if (url.indexOf('lubotv') >= 0) return D;
                    return p;
                }
            `;
            
            config = {
                mode: "pac_script", 
                pacScript: { data: pac }
            };
            
        } else if (mode === "smarty") {
            // 智能代理模式
            const stored = await chrome.storage.local.get(['autoProxyList']);
            const autoProxyList = stored.autoProxyList ? stored.autoProxyList.split(',') : [];
            
            let conditions = autoProxyList.map(domain => 
                `host == "${domain}" || dnsDomainIs(host, ".${domain}")`
            ).join(' || ');
            
            const pac = `
                var FindProxyForURL = function(url, host){
                    var D = "DIRECT";
                    var p = "${serverInfo ? serverInfo.type.toUpperCase() + ' ' + serverInfo.ip + ':' + serverInfo.port : 'DIRECT'}";
                    if (url.indexOf('lubotv') >= 0) return D;
                    if (${conditions || 'false'}) return p;
                    return D;
                }
            `;
            
            config = {
                mode: "pac_script",
                pacScript: { data: pac }
            };
        }
        
        if (config) {
            await new Promise((resolve, reject) => {
                chrome.proxy.settings.set({value: config, scope: 'regular'}, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            await chrome.storage.local.set({ ProxyMode: mode });
            console.log(`代理模式设置为: ${mode}`);
        }
        
    } catch (error) {
        console.error('设置代理模式失败:', error);
    }
}

// ===== 心跳和状态维护 =====
/**
 * 设置心跳机制
 * V3改造说明: Service Worker可能被Chrome终止，需要定期激活
 */
function setupHeartbeat() {
    // 设置定时器保持service worker活跃
    setInterval(async () => {
        try {
            // 心跳检查
            await chrome.storage.local.set({ 
                lastHeartbeat: Date.now() 
            });
            
            console.log('心跳检查完成');
        } catch (error) {
            console.error('心跳检查失败:', error);
        }
    }, globalConfig.heart_jiange * 1000);
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
                .catch(error => sendResponse({ success: false, error: error.message }));
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
