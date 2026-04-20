const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else if (req.url === '/socket.io/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 存储房间信息
const rooms = {};

io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);

    // 创建房间
    socket.on('createRoom', ({ roomId, playerName }) => {
        console.log(`创建房间: ${roomId}, 玩家: ${playerName}`);
        
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                host: socket.id
            };
        }

        const player = {
            id: socket.id,
            name: playerName,
            isHost: true
        };

        rooms[roomId].players.push(player);
        socket.join(roomId);

        socket.emit('roomCreated', { roomId, players: rooms[roomId].players });
        io.to(roomId).emit('updatePlayers', { players: rooms[roomId].players });
    });

    // 加入房间
    socket.on('joinRoom', ({ roomId, playerName }) => {
        console.log(`加入房间: ${roomId}, 玩家: ${playerName}`);

        if (!rooms[roomId]) {
            socket.emit('error', { message: '房间不存在' });
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            isHost: false
        };

        rooms[roomId].players.push(player);
        socket.join(roomId);

        socket.emit('roomJoined', { roomId, players: rooms[roomId].players });
        io.to(roomId).emit('playerJoined', { playerName, playerId: socket.id });
        io.to(roomId).emit('updatePlayers', { players: rooms[roomId].players });
    });

    // 开始游戏
    socket.on('startGame', ({ roomId, players }) => {
        console.log(`开始游戏: ${roomId}`);
        io.to(roomId).emit('gameStarted', { players });
    });

    // 选择卡牌
    socket.on('selectCard', ({ roomId, playerId, round, cards }) => {
        console.log(`选择卡牌: ${roomId}, 玩家: ${playerId}, 轮次: ${round}`);
        io.to(roomId).emit('cardSelected', { playerId, round, cards });
    });

    // 断开连接
    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);

        // 从所有房间中移除该玩家
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);
                
                // 如果房间为空，删除房间
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('playerLeft', { playerName, playerId: socket.id });
                    io.to(roomId).emit('updatePlayers', { players: room.players });
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`局域网访问地址: http://YOUR_LOCAL_IP:${PORT}`);
    console.log('按 Ctrl+C 停止服务器');
});