const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;

// 存储房间信息
const rooms = {};

// 生成随机ID
function generateId() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    console.log(`${req.method} ${pathname}`);
    
    // API路由
    if (pathname.startsWith('/api/')) {
        handleApi(req, res, pathname, url);
        return;
    }
    
    // 静态文件服务
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('服务器错误');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('服务器错误: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function handleApi(req, res, pathname, url) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const action = pathname.replace('/api/', '');
            
            switch (action) {
                case 'createRoom':
                    handleCreateRoom(data, res);
                    break;
                case 'joinRoom':
                    handleJoinRoom(data, res);
                    break;
                case 'getRoom':
                    handleGetRoom(data, res);
                    break;
                case 'startGame':
                    handleStartGame(data, res);
                    break;
                default:
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}

function handleCreateRoom(data, res) {
    const { playerName } = data;
    const roomId = generateId();
    
    rooms[roomId] = {
        id: roomId,
        players: [{
            id: generateId(),
            name: playerName,
            isHost: true
        }],
        status: 'waiting',
        createdAt: Date.now()
    };
    
    console.log(`房间创建: ${roomId}, 玩家: ${playerName}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({
        success: true,
        roomId: roomId,
        players: rooms[roomId].players
    }));
}

function handleJoinRoom(data, res) {
    const { roomId, playerName } = data;
    
    if (!rooms[roomId]) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: '房间不存在' }));
        return;
    }
    
    const newPlayer = {
        id: generateId(),
        name: playerName,
        isHost: false
    };
    
    rooms[roomId].players.push(newPlayer);
    console.log(`玩家加入: ${roomId}, 玩家: ${playerName}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({
        success: true,
        roomId: roomId,
        players: rooms[roomId].players
    }));
}

function handleGetRoom(data, res) {
    const { roomId } = data;
    
    if (!rooms[roomId]) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: '房间不存在' }));
        return;
    }
    
    res.writeHead(200);
    res.end(JSON.stringify({
        success: true,
        room: rooms[roomId]
    }));
}

function handleStartGame(data, res) {
    const { roomId } = data;
    
    if (!rooms[roomId]) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: '房间不存在' }));
        return;
    }
    
    rooms[roomId].status = 'playing';
    console.log(`游戏开始: ${roomId}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({
        success: true,
        players: rooms[roomId].players
    }));
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  三组扑克牌游戏服务器已启动');
    console.log('========================================');
    console.log('');
    console.log('本地访问地址:');
    console.log(`  http://localhost:${PORT}`);
    console.log('');
    console.log('局域网访问地址:');
    console.log(`  http://YOUR_LOCAL_IP:${PORT}`);
    console.log('');
    console.log('使用说明:');
    console.log('1. 主机: 在浏览器打开上述地址，点击"创建房间"');
    console.log('2. 朋友: 在同一局域网内，打开 http://主机IP:3000');
    console.log('3. 朋友: 输入房间ID，点击"加入房间"');
    console.log('4. 主机: 点击"开始游戏"');
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
    console.log('========================================');
});