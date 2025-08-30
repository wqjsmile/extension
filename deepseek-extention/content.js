console.log("内容脚本已加载");

// 暗黑模式检测和处理
const initDarkModeDetection = () => {
  // 检测系统暗黑模式偏好
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 检测网站是否使用暗黑模式
  const detectWebsiteDarkMode = () => {
    const body = document.body;
    const html = document.documentElement;
    
    // 检查常见的暗黑模式类名和样式
    const darkModeIndicators = [
      // 常见的暗黑模式类名
      body.classList.contains('dark'),
      body.classList.contains('dark-mode'),
      body.classList.contains('theme-dark'),
      html.classList.contains('dark'),
      html.classList.contains('dark-mode'),
      html.classList.contains('theme-dark'),
      // 检查背景颜色
      isDarkBackground(body),
      isDarkBackground(html),
      // 检查系统偏好
      darkModeQuery.matches
    ];
    
    return darkModeIndicators.some(indicator => indicator);
  };
  
  // 检查元素背景是否为暗色
  const isDarkBackground = (element) => {
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      return false;
    }
    
    // 解析RGB值
    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      // 计算亮度 (使用相对亮度公式)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128; // 小于128认为是暗色
    }
    
    return false;
  };
  
  // 应用暗黑模式样式
  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // 更新按钮文字颜色（如果是文字按钮）
    const btn = document.getElementById('deepseek-btn');
    if (btn && btn.textContent === 'DS') {
      btn.style.color = isDark ? '#ffffff' : '#333333';
    }
  };
  
  // 初始检测
  const initialDarkMode = detectWebsiteDarkMode();
  applyDarkMode(initialDarkMode);
  
  // 监听系统暗黑模式变化
  darkModeQuery.addEventListener('change', (e) => {
    applyDarkMode(e.matches || detectWebsiteDarkMode());
  });
  
  // 监听网站样式变化
  const observer = new MutationObserver(() => {
    const isDark = detectWebsiteDarkMode();
    applyDarkMode(isDark);
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  console.log("暗黑模式检测初始化完成");
};

// 创建悬浮按钮
const createFloatingButton = () => {
  // 检查是否已存在按钮，避免重复创建
  if (document.getElementById('deepseek-btn')) {
    return;
  }

  const btn = document.createElement('div');
  btn.id = 'deepseek-btn';
  
  // 设置背景图片
  try {
    btn.style.backgroundImage = `url(${chrome.runtime.getURL('icons/logo.svg')})`;
  } catch (error) {
    console.error("无法加载图标:", error);
    // 如果图标加载失败，使用文字作为备选
    btn.textContent = 'DS';
    btn.setAttribute('data-text', 'true'); // 标记为文字按钮
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = 'bold';
    btn.style.color = '#333';
  }

  // 从存储中恢复位置和大小
  chrome.storage.local.get(['btnPos', 'btnSize'], (result) => {
    if (result.btnPos) {
      btn.style.left = `${result.btnPos.x}px`;
      btn.style.top = `${result.btnPos.y}px`;
    } else {
      // 默认位置 - 右下角
      btn.style.right = '20px';
      btn.style.bottom = '20px';
    }
    
    // 设置按钮大小
    const size = result.btnSize || 60;
    btn.style.setProperty('--btn-size', `${size}px`);
  });

  console.log("按钮创建成功");

  // 拖拽逻辑
  let isDragging = false;
  let hasMoved = false; // 记录是否真的移动了
  let isRightClick = false; // 记录是否是右键点击
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  btn.addEventListener('mousedown', (e) => {
    // 阻止事件冒泡
    e.preventDefault();
    e.stopPropagation();
    
    // 检查是否是右键点击
    isRightClick = e.button === 2;
    
    // 如果是右键点击，不进行拖拽逻辑
    if (isRightClick) {
      return;
    }
    
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    
    // 计算鼠标相对于按钮的偏移量
    const rect = btn.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    btn.style.cursor = 'grabbing';
    btn.style.transition = 'none'; // 拖拽时禁用过渡动画
    
    console.log("鼠标按下");
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || isRightClick) return;

    // 计算鼠标移动距离
    const moveX = Math.abs(e.clientX - startX);
    const moveY = Math.abs(e.clientY - startY);
    
    // 如果移动距离超过5像素，才认为是拖拽
    if (moveX > 5 || moveY > 5) {
      hasMoved = true;
      
      // 直接根据鼠标位置和偏移量计算新位置
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      // 边界检测
      const maxX = window.innerWidth - btn.offsetWidth;
      const maxY = window.innerHeight - btn.offsetHeight;
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      // 直接设置位置，与鼠标完全同步
      btn.style.left = `${boundedX}px`;
      btn.style.top = `${boundedY}px`;
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      
      // 如果大小控制面板显示中，同时移动它
      updateSizeControlsPosition();
      
      // 如果聊天窗口是打开的，实时跟随移动
      updateChatWindowPosition();
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging && !isRightClick) {
      isDragging = false;
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.3s ease'; // 恢复过渡动画
      
      if (hasMoved) {
        // 如果移动了，保存位置
        chrome.storage.local.set({
          btnPos: {
            x: parseInt(btn.style.left) || 0,
            y: parseInt(btn.style.top) || 0
          }
        });
        console.log("拖拽结束，位置已保存");
        
        // 拖拽结束后如果聊天窗口是打开的，需要重新定位
        const iframe = document.getElementById('chat-iframe');
        if (iframe && iframe.style.display !== 'none') {
          positionChatWindow();
        }
      } else {
        // 如果没有移动，触发点击事件
        console.log("没有移动，触发点击");
        toggleChatWindow();
      }
    }
    
    // 重置状态
    hasMoved = false;
    isRightClick = false;
  });

  // 右键菜单 - 显示大小控制
  btn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    toggleSizeControls(btn, e.clientX, e.clientY);
  });

  return btn;
};

// 计算聊天窗口的最佳位置
const calculateChatPosition = () => {
  const btn = document.getElementById('deepseek-btn');
  if (!btn) {
    console.error("按钮未找到，使用默认居中位置");
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  const btnRect = btn.getBoundingClientRect();
  const chatWidth = 400;
  const chatHeight = 600;
  const gap = 15; // 聊天窗口与按钮之间的间隙

  // 获取屏幕中心
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;
  
  // 按钮中心位置
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;

  let chatX, chatY;

  console.log(`按钮位置: (${btnCenterX}, ${btnCenterY}), 屏幕中心: (${screenCenterX}, ${screenCenterY})`);

  // 判断按钮相对于屏幕中心的位置，决定聊天窗口的摆放方向
  if (btnCenterX < screenCenterX) {
    // 按钮在屏幕左侧，聊天窗口放在按钮右侧（更靠近中心）
    chatX = btnRect.right + gap;
    console.log("按钮在左侧，聊天窗口放右侧");
  } else {
    // 按钮在屏幕右侧，聊天窗口放在按钮左侧（更靠近中心）
    chatX = btnRect.left - chatWidth - gap;
    console.log("按钮在右侧，聊天窗口放左侧");
  }

  if (btnCenterY < screenCenterY) {
    // 按钮在屏幕上半部分，聊天窗口尽量居中对齐按钮
    chatY = btnCenterY - chatHeight / 2;
    console.log("按钮在上半部分");
  } else {
    // 按钮在屏幕下半部分，聊天窗口尽量居中对齐按钮
    chatY = btnCenterY - chatHeight / 2;
    console.log("按钮在下半部分");
  }

  // 边界检测和调整
  // 水平边界检测
  if (chatX < 10) {
    chatX = 10;
    console.log("调整：聊天窗口太靠左，移至左边距10px");
  } else if (chatX + chatWidth > window.innerWidth - 10) {
    chatX = window.innerWidth - chatWidth - 10;
    console.log("调整：聊天窗口太靠右，移至右边距10px");
  }

  // 垂直边界检测
  if (chatY < 10) {
    chatY = 10;
    console.log("调整：聊天窗口太靠上，移至上边距10px");
  } else if (chatY + chatHeight > window.innerHeight - 10) {
    chatY = window.innerHeight - chatHeight - 10;
    console.log("调整：聊天窗口太靠下，移至下边距10px");
  }

  const result = {
    left: `${chatX}px`,
    top: `${chatY}px`,
    transform: 'none'
  };
  
  console.log("计算的聊天窗口位置:", result);
  return result;
};

// 定位聊天窗口（修复版本，解决动画问题）
const positionChatWindow = (animate = true) => {
  const iframe = document.getElementById('chat-iframe');
  if (!iframe) {
    console.error("iframe未找到，无法定位");
    return;
  }

  const position = calculateChatPosition();
  
  // 如果不需要动画，先禁用transition
  if (!animate) {
    iframe.style.transition = 'none';
  }
  
  iframe.style.left = position.left;
  iframe.style.top = position.top;
  iframe.style.transform = position.transform;
  
  // 如果禁用了动画，在下一帧恢复transition
  if (!animate) {
    requestAnimationFrame(() => {
      iframe.style.transition = '';
    });
  }
  
  console.log("聊天窗口已定位到:", position);
};

// 切换聊天窗口的独立函数
const toggleChatWindow = () => {
  const iframe = document.getElementById('chat-iframe');
  if (iframe) {
    const isVisible = iframe.style.display !== 'none';
    if (isVisible) {
      iframe.style.display = 'none';
      console.log("聊天窗口关闭");
    } else {
      // 先设置正确位置（无动画），再显示窗口
      positionChatWindow(false); // 不使用动画
      iframe.style.display = 'block';
      console.log("聊天窗口打开");
    }
  } else {
    console.error("聊天窗口iframe未找到");
  }
};

// 计算大小控制面板的位置（优化版本）
const calculateSizeControlPosition = () => {
  const btn = document.getElementById('deepseek-btn');
  if (!btn) {
    console.error("按钮未找到，使用默认位置");
    return { left: '50px', top: '50px' };
  }

  const btnRect = btn.getBoundingClientRect();
  const controlWidth = 80; // 估算的控制面板宽度
  const controlHeight = 140; // 估算的控制面板高度
  const gap = 10;

  // 获取屏幕中心
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;
  
  // 按钮中心位置
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;

  let controlX, controlY;

  // 使用与聊天窗口相同的逻辑
  if (btnCenterX < screenCenterX) {
    // 按钮在屏幕左侧，控制面板放在按钮右侧
    controlX = btnRect.right + gap;
  } else {
    // 按钮在屏幕右侧，控制面板放在按钮左侧
    controlX = btnRect.left - controlWidth - gap;
  }

  // 垂直居中对齐按钮
  controlY = btnCenterY - controlHeight / 2;

  // 边界检测和调整
  if (controlX < 10) {
    controlX = 10;
  } else if (controlX + controlWidth > window.innerWidth - 10) {
    controlX = window.innerWidth - controlWidth - 10;
  }

  if (controlY < 10) {
    controlY = 10;
  } else if (controlY + controlHeight > window.innerHeight - 10) {
    controlY = window.innerHeight - controlHeight - 10;
  }

  return {
    left: `${controlX}px`,
    top: `${controlY}px`
  };
};

// 更新聊天窗口位置（拖拽时实时跟随）
const updateChatWindowPosition = () => {
  const iframe = document.getElementById('chat-iframe');
  if (iframe && iframe.style.display !== 'none') {
    const position = calculateChatPosition();
    // 拖拽时不使用动画，直接更新位置
    iframe.style.transition = 'none';
    iframe.style.left = position.left;
    iframe.style.top = position.top;
    iframe.style.transform = position.transform;
    
    // 在下一帧恢复transition
    requestAnimationFrame(() => {
      iframe.style.transition = '';
    });
  }
};

// 更新大小控制面板位置（修复版本，解决跟手速度问题）
const updateSizeControlsPosition = () => {
  const controls = document.getElementById('size-controls');
  if (controls && controls.classList.contains('show')) {
    const position = calculateSizeControlPosition();
    
    // 拖拽时不使用动画，直接更新位置
    controls.style.transition = 'none';
    controls.style.left = position.left;
    controls.style.top = position.top;
    
    // 在下一帧恢复transition
    requestAnimationFrame(() => {
      controls.style.transition = 'all 0.2s ease';
    });
  }
};

// 创建大小控制面板
const createSizeControls = () => {
  if (document.getElementById('size-controls')) {
    return document.getElementById('size-controls');
  }

  const controls = document.createElement('div');
  controls.id = 'size-controls';
  controls.className = 'size-controls';

  const sizes = [
    { label: '小', value: 45 },
    { label: '中', value: 60 },
    { label: '大', value: 75 },
    { label: '特大', value: 90 }
  ];

  sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn';
    btn.textContent = size.label;
    btn.addEventListener('click', () => {
      changeButtonSize(size.value);
      controls.classList.remove('show');
    });
    controls.appendChild(btn);
  });

  document.body.appendChild(controls);
  return controls;
};

// 切换大小控制面板显示（优化版本）
const toggleSizeControls = (btn, x, y) => {
  const controls = createSizeControls();
  
  if (controls.classList.contains('show')) {
    controls.classList.remove('show');
    return;
  }

  // 使用优化后的位置计算逻辑（不再需要鼠标坐标）
  const position = calculateSizeControlPosition();
  controls.style.left = position.left;
  controls.style.top = position.top;
  
  controls.classList.add('show');
  
  // 点击其他地方关闭面板
  setTimeout(() => {
    const closeHandler = (e) => {
      if (!controls.contains(e.target) && e.target !== btn) {
        controls.classList.remove('show');
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 100);
};

// 改变按钮大小
const changeButtonSize = (size) => {
  const btn = document.getElementById('deepseek-btn');
  if (btn) {
    btn.style.setProperty('--btn-size', `${size}px`);
    
    // 保存大小设置
    chrome.storage.local.set({ btnSize: size });
    
    // 更新字体大小（如果是文字按钮）
    if (btn.textContent === 'DS') {
      btn.style.fontSize = `${size * 0.25}px`;
    }
    
    // 如果聊天窗口是打开的，重新定位
    const iframe = document.getElementById('chat-iframe');
    if (iframe && iframe.style.display !== 'none') {
      updateChatWindowPosition();
    }
    
    // 如果大小控制面板是打开的，重新定位
    updateSizeControlsPosition();
    
    console.log(`按钮大小已更改为: ${size}px`);
  }
};

const createChatWindow = () => {
  // 检查是否已存在窗口，避免重复创建
  if (document.getElementById('chat-iframe')) {
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'chat-iframe';
  iframe.src = 'https://yuanbao.tencent.com/chat'; // 更改为 DeepSeek 官网
  iframe.style.display = 'none';
  
  console.log("聊天窗口创建成功");
  return iframe;
};

// 监听窗口大小变化
window.addEventListener('resize', () => {
  const iframe = document.getElementById('chat-iframe');
  if (iframe && iframe.style.display !== 'none') {
    // 窗口大小变化时重新定位聊天窗口
    setTimeout(() => updateChatWindowPosition(), 100);
  }
  
  // 同时更新大小控制面板位置
  updateSizeControlsPosition();
  
  // 同时更新聊天窗口位置
  updateChatWindowPosition();
});

// 初始化插件
function initPlugin() {
  console.log("开始初始化插件, DOM状态:", document.readyState);
  
  try {
    // 首先初始化暗黑模式检测
    initDarkModeDetection();
    
    const button = createFloatingButton();
    const chatWindow = createChatWindow();
    
    if (button) {
      document.body.appendChild(button);
      console.log("按钮已添加到页面");
    }
    
    if (chatWindow) {
      document.body.appendChild(chatWindow);
      console.log("聊天窗口已添加到页面");
    }
    
    console.log("插件初始化完成");
  } catch (error) {
    console.error("插件初始化失败:", error);
  }
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlugin);
} else {
  // 使用setTimeout确保DOM完全准备好
  setTimeout(initPlugin, 100);
}