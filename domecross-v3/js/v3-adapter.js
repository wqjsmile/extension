/**
 * V3适配器 - 处理V2到V3的API变更
 * 主要功能：localStorage到chrome.storage的适配，API调用的Promise化
 */

// ===== Storage适配器 =====
/**
 * localStorage到chrome.storage的适配层
 * V3改造说明: popup页面仍可使用localStorage，但为了与service worker数据同步，
 * 建议统一使用chrome.storage
 */
class StorageAdapter {
    constructor() {
        this.cache = new Map();
        this.syncInProgress = false;
    }
    
    // 从chrome.storage获取数据
    async get(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];
        } catch (error) {
            console.error('Storage get error:', error);
            // 降级到localStorage
            return localStorage.getItem(key);
        }
    }
    
    // 向chrome.storage设置数据  
    async set(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
            // 同步到localStorage作为备份
            if (typeof value === 'string') {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Storage set error:', error);
            // 降级到localStorage
            localStorage.setItem(key, value);
        }
    }
    
    // 批量获取
    async getMultiple(keys) {
        try {
            return await chrome.storage.local.get(keys);
        } catch (error) {
            console.error('Storage getMultiple error:', error);
            const result = {};
            keys.forEach(key => {
                result[key] = localStorage.getItem(key);
            });
            return result;
        }
    }
    
    // 批量设置
    async setMultiple(data) {
        try {
            await chrome.storage.local.set(data);
            // 同步到localStorage
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    localStorage.setItem(key, value);
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });
        } catch (error) {
            console.error('Storage setMultiple error:', error);
            // 降级到localStorage
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
        }
    }
    
    // 同步localStorage到chrome.storage
    async syncFromLocalStorage() {
        if (this.syncInProgress) return;
        this.syncInProgress = true;
        
        try {
            const localData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                localData[key] = localStorage.getItem(key);
            }
            
            if (Object.keys(localData).length > 0) {
                await chrome.storage.local.set(localData);
                console.log('localStorage同步到chrome.storage完成');
            }
        } catch (error) {
            console.error('同步localStorage失败:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
}

// 全局storage实例
window.storageAdapter = new StorageAdapter();

// ===== Chrome API适配器 =====
/**
 * Chrome API的Promise化包装
 * V3改造说明: 将回调式API转换为Promise，便于async/await使用
 */
class ChromeAPIAdapter {
    
    // 标签页API适配
    static async createTab(options) {
        return new Promise((resolve, reject) => {
            chrome.tabs.create(options, (tab) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(tab);
                }
            });
        });
    }
    
    static async getCurrentTab() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(tabs[0]);
                }
            });
        });
    }
    
    static async reloadTab(tabId = null, options = { bypassCache: true }) {
        return new Promise((resolve, reject) => {
            chrome.tabs.reload(tabId, options, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
    
    static async queryTabs(query = {}) {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(query, (tabs) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(tabs);
                }
            });
        });
    }
    
    // 与service worker通信
    static async sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }
    
    // 代理API适配 (通过service worker)
    static async setProxy(mode, serverInfo = null) {
        return this.sendMessage({
            action: 'setProxy',
            mode: mode,
            serverInfo: serverInfo
        });
    }
}

// 全局API适配器
window.chromeAdapter = ChromeAPIAdapter;

// ===== 向后兼容层 =====
/**
 * 为原有代码提供兼容性支持
 * V3改造说明: 保持原有API调用方式，内部转换为V3适配调用
 */

// 模拟原有的Chrome API调用方式，但内部使用适配器
if (!window.originalChrome) {
    window.originalChrome = {
        tabs: {
            create: chrome.tabs.create,
            reload: chrome.tabs.reload,
            query: chrome.tabs.query,
            getSelected: chrome.tabs.getSelected // V2 API，需要特殊处理
        }
    };
    
    // 重写chrome.tabs.getSelected为V3兼容版本
    chrome.tabs.getSelected = function(windowId, callback) {
        // V3改造说明: getSelected在V3中已废弃，使用query替代
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                callback(tabs[0]);
            } else {
                callback(null);
            }
        });
    };
}

// ===== 初始化 =====
/**
 * 页面加载时的初始化
 * V3改造说明: 确保在页面加载时同步数据
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('V3适配器初始化');
    
    // 同步localStorage到chrome.storage
    await window.storageAdapter.syncFromLocalStorage();
    
    // 检查service worker状态
    try {
        const response = await chrome.runtime.sendMessage({ action: 'ping' });
        console.log('Service worker连接正常');
    } catch (error) {
        console.warn('Service worker未响应，某些功能可能受限:', error);
    }
});

// ===== 全局工具函数 =====
/**
 * 保持原有的工具函数不变
 * V3改造说明: 这些函数在popup中仍然可用
 */

// 解密函数 (正确版本)
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

// 导出适配器供其他文件使用
window.V3Adapter = {
    storage: window.storageAdapter,
    chrome: ChromeAPIAdapter,
    jerry: jerry
};

console.log('V3适配器加载完成');
