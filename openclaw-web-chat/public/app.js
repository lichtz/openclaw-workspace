// OpenClaw Web Chat - Frontend (REST API + Polling)

class OpenClawChat {
  constructor() {
    this.messages = [];
    this.pendingPolls = new Map();
    this.maxPollAttempts = 60; // 最多轮询60次（30秒）
    this.pollInterval = 500; // 轮询间隔500ms

    this.initElements();
    this.initEventListeners();
    this.checkConnection();
  }

  initElements() {
    this.messagesContainer = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.connectionStatus = document.getElementById('connectionStatus');
  }

  initEventListeners() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async checkConnection() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.status === 'ok') {
        this.updateConnectionStatus(true);
      } else {
        this.updateConnectionStatus(false);
      }
    } catch (error) {
      this.updateConnectionStatus(false);
    }
  }

  updateConnectionStatus(connected) {
    const statusText = this.connectionStatus.querySelector('.status-text');
    if (connected) {
      this.connectionStatus.classList.add('connected');
      statusText.textContent = '已连接';
    } else {
      this.connectionStatus.classList.remove('connected');
      statusText.textContent = '连接断开';
    }
  }

  async sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text) return;

    // Add user message immediately
    this.addMessage(text, 'user');
    this.messageInput.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          userId: 'web-user-' + Date.now()
        })
      });

      const data = await response.json();

      if (data.success && data.messageId) {
        // 开始轮询等待回复
        this.startPolling(data.messageId);
        this.addMessage('消息已发送，等待回复...', 'bot');
      } else {
        this.removeTypingIndicator();
        this.addMessage('发送失败: ' + (data.error || '未知错误'), 'bot');
      }
    } catch (error) {
      this.removeTyplingIndicator();
      this.addMessage('发送失败: ' + error.message, 'bot');
    }
  }

  startPolling(messageId) {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/poll/${messageId}`);
        const data = await response.json();
        
        if (data.hasReply) {
          // 收到回复！
          this.removeTypingIndicator();
          this.addMessage(data.reply, 'bot');
          this.pendingPolls.delete(messageId);
        } else if (attempts < this.maxPollAttempts) {
          // 继续轮询
          setTimeout(poll, this.pollInterval);
        } else {
          // 超时
          this.removeTypingIndicator();
          this.addMessage('等待回复超时（30秒）', 'bot');
          this.pendingPolls.delete(messageId);
        }
      } catch (error) {
        console.error('轮询错误:', error);
        if (attempts < this.maxPollAttempts) {
          setTimeout(poll, this.pollInterval);
        }
      }
    };
    
    // 保存轮询任务
    this.pendingPolls.set(messageId, { poll, attempts });
    
    // 开始轮询
    setTimeout(poll, this.pollInterval);
  }

  addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${type === 'bot' ? '🐱' : '👤'}</div>
      <div class="message-content">
        <div class="message-text">${this.escapeHtml(text)}</div>
        <div class="message-time">${this.getTime()}</div>
      </div>
    `;

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">🐱</div>
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  getTime() {
    return new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
  new OpenClawChat();
});
