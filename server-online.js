const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 启用CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 存储房间信息
const rooms = {};

// 生成房间ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// 生成玩家ID
function generatePlayerId() {
    return Math.random().toString(36).substring(2, 10);
}

// API端点

// 创建房间
app.post('/api/createRoom', (req, res) => {
    const { playerName } = req.body;
    const roomId = generateRoomId();
    
    rooms[roomId] = {
        id: roomId,
        players: [{
            id: generatePlayerId(),
            name: playerName || '玩家',
            isHost: true
        }],
        status: 'waiting',
        createdAt: Date.now()
    };
    
    console.log(`房间创建: ${roomId}, 玩家: ${playerName}`);
    
    res.json({
        success: true,
        roomId: roomId,
        players: rooms[roomId].players
    });
});

// 加入房间
app.post('/api/joinRoom', (req, res) => {
    const { roomId, playerName } = req.body;
    
    if (!rooms[roomId]) {
        return res.json({ success: false, error: '房间不存在' });
    }
    
    const newPlayer = {
        id: generatePlayerId(),
        name: playerName || '玩家',
        isHost: false
    };
    
    rooms[roomId].players.push(newPlayer);
    
    console.log(`玩家加入: ${roomId}, 玩家: ${playerName}`);
    
    res.json({
        success: true,
        roomId: roomId,
        players: rooms[roomId].players
    });
});

// 获取房间信息
app.post('/api/getRoom', (req, res) => {
    const { roomId } = req.body;
    
    if (!rooms[roomId]) {
        return res.json({ success: false, error: '房间不存在' });
    }
    
    res.json({
        success: true,
        room: rooms[roomId]
    });
});

// 开始游戏
app.post('/api/startGame', (req, res) => {
    const { roomId } = req.body;
    
    if (!rooms[roomId]) {
        return res.json({ success: false, error: '房间不存在' });
    }
    
    rooms[roomId].status = 'playing';
    
    console.log(`游戏开始: ${roomId}`);
    
    res.json({
        success: true,
        players: rooms[roomId].players
    });
});

// 清理过期房间
setInterval(() => {
    const now = Date.now();
    for (const roomId in rooms) {
        if (now - rooms[roomId].createdAt > 3600000) { // 1小时
            console.log(`清理过期房间: ${roomId}`);
            delete rooms[roomId];
        }
    }
}, 300000); // 每5分钟检查一次

// 根路径
app.get('/', (req, res) => {
    res.send('三组扑克牌游戏服务器');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});