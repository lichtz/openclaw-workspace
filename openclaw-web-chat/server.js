const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { execSync, exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// OpenClaw Gateway 配置
const OPENCLAW_PORT = 18789;
const OPENCLAW_TOKEN = '0263f3ed3bcaf5eed4cd1c5592dd2bfdb83ba04ff3b3f680';

// 中转消息队列（等待OpenClaw回复）
const pendingRequests = new Map();

// 存储网页用户的消息ID，用于追踪回复
const webMessages = new Map();
let lastMessageSeq = 0;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 发送消息到OpenClaw（使用CLI方式）
function sendToOpenClaw(message, userId = 'web-user') {
  return new Promise((resolve, reject) => {
    try {
      // 使用 openclaw message send CLI 命令
      const escapedMessage = message.replace(/"/g, '\\"');
      const cmd = `openclaw message send --channel qqbot --message "${escapedMessage}"`;
      
      console.log('Sending to OpenClaw:', message);
      
      exec(cmd, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          console.error('OpenClaw CLI Error:', error.message);
          // 如果是QQ Bot消息已发送的情况，也算成功
          if (error.message.includes('QQBot') || stderr.includes('QQBot')) {
            resolve({ success: true, reply: '消息已发送' });
          } else {
            resolve({ error: error.message });
          }
        } else {
          // CLI执行成功，但返回的是日志，不是API响应
          // 由于OpenClaw消息会通过QQ Bot异步回复，这里返回成功
          console.log('OpenClaw output:', stdout);
          resolve({ success: true, reply: '消息已发送，请等待回复' });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      resolve({ error: error.message });
    }
  });
}

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'chat') {
        // 发送消息到OpenClaw
        const result = await sendToOpenClaw(msg.text, msg.userId);
        
        // 发送确认给客户端
        ws.send(JSON.stringify({
          type: 'response',
          original: msg.text,
          reply: result.reply || result.error || '请求已发送',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.send(JSON.stringify({
    type: 'connected',
    message: '已连接到OpenClaw Web Chat'
  }));
});

// REST API端点
app.post('/api/chat', async (req, res) => {
  const { message, userId } = req.body;
  
  // 生成消息ID并存储
  const msgId = 'web-' + Date.now();
  webMessages.set(msgId, { 
    original: message, 
    reply: null, 
    timestamp: Date.now() 
  });
  
  // 发送消息到OpenClaw
  const result = await sendToOpenClaw(message, userId);
  
  res.json({ 
    success: true, 
    messageId: msgId,
    ...result 
  });
});

// 轮询检查是否有回复
app.get('/api/poll/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const msgData = webMessages.get(messageId);
  
  if (msgData && msgData.reply) {
    // 有回复了，返回并删除
    webMessages.delete(messageId);
    res.json({
      hasReply: true,
      reply: msgData.reply,
      timestamp: msgData.replyTimestamp
    });
  } else {
    res.json({ hasReply: false });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 OpenClaw Web Chat running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
});
