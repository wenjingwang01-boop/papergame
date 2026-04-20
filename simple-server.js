const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

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
    console.log(`${req.method} ${req.url}`);
    
    // 默认返回index.html
    let filePath = '.' + req.url;
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