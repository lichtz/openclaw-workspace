// OpenClaw Web Chat - Message Listener Service
// 运行在后台，定期检查OpenClaw的QQ Bot消息

const http = require('http');
const WebSocket = require('ws');

const OPENCLAW_WS = 'ws://127.0.0.1:18789';
const POLL_INTERVAL = 1000; // 每秒检查一次

// 存储待回复的消息ID
const pendingMessages = new Map();
let lastMessageTime = Date.now();

console.log('🔄 OpenClaw Message Listener Started');
console.log(`📡 连接 OpenClaw: ${OPENCLAW_WS}`);

// 连接到OpenClaw WebSocket
function connectOpenClaw() {
  const ws = new WebSocket(OPENCLAW_WS);
  
  ws.on('open', () => {
    console.log('✅ 已连接到 OpenClaw Gateway');
  });
  
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      await handleMessage(msg, ws);
    } catch (error) {
      // 忽略非JSON消息
    }
  });
  
  ws.on('close', () => {
    console.log('❌ OpenClaw连接断开，5秒后重连...');
    setTimeout(connectOpenClaw, 5000);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error.message);
  });
}

// 处理收到的消息
async function handleMessage(msg, ws) {
  // 检查是否是QQ Bot的私聊消息
  if (msg.t === 'C2C_MESSAGE_CREATE' || msg.channel_type === 'qqbot') {
    const content = msg.content || msg.msg_content || '';
    const msgId = msg.id || msg.msg_id;
    
    console.log(`📨 收到消息: ${content.substring(0, 50)}...`);
    
    // 检查是否是我们发送的消息的回复
    // 这里需要匹配逻辑：查找最近发送的消息
    
    // 标记消息时间为最新
    lastMessageTime = Date.now();
  }
}

// 查找对应的web消息并更新
function findAndUpdateReply(qqContent) {
  // 遍历待回复的消息
  for (const [msgId, msgData] of pendingMessages) {
    // 找到匹配的原始消息
    if (qqContent.includes(msgData.original.substring(0, 10))) {
      // 更新回复内容
      msgData.reply = qqContent;
      msgData.replyTimestamp = Date.now();
      console.log(`✅ 找到回复: ${msgId}`);
      return true;
    }
  }
  return false;
}

// 启动监听
connectOpenClaw();

// 定期清理超时消息
setInterval(() => {
  const now = Date.now();
  for (const [msgId, msgData] of pendingMessages) {
    if (now - msgData.timestamp > 60000) { // 60秒超时
      pendingMessages.delete(msgId);
      console.log(`🗑️ 清理超时消息: ${msgId}`);
    }
  }
}, 10000);

console.log('🚀 Message Listener 运行中...');
console.log('   - 监听 OpenClaw QQ Bot 消息');
console.log('   - 使用 http://localhost:3000/api/poll/:messageId 检查回复');
