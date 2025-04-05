const existingButton = document.getElementById('deepseek-toggle-button');
if (existingButton) {
  // 如果按钮已经存在，不重复创建
  return;
}

// 创建浮动按钮
const button = document.createElement('div');
button.id = 'deepseek-toggle-button';
button.innerText = '💬';
button.style.cssText = `
  position: fixed;
  bottom: 100px;
  right: 30px;
  z-index: 9999;
  background-color: #4A90E2;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

// 创建 iframe 聊天窗口
const iframe = document.createElement('iframe');
iframe.src = 'https://chat.deepseek.com/';
iframe.id = 'deepseek-chat-frame';
iframe.style.cssText = `
  position: fixed;
  bottom: 160px;
  right: 30px;
  width: 400px;
  height: 600px;
  z-index: 9998;
  border: none;
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
  display: none;
  border-radius: 12px;
`;

// 点击按钮，切换 iframe 显示/隐藏状态
button.onclick = () => {
  iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
};

// 添加按钮和 iframe 到页面中
document.body.appendChild(button);
document.body.appendChild(iframe);