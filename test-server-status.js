#!/usr/bin/env node

const https = require('https');

// 测试服务器状态
function testServer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            resolve({
                statusCode: res.statusCode,
                statusMessage: res.statusMessage
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function main() {
    console.log('测试在线服务器状态...');
    
    try {
        const serverStatus = await testServer('https://three-game-server.onrender.com');
        console.log('服务器状态:', serverStatus);
        
        const apiStatus = await testServer('https://three-game-server.onrender.com/api/createRoom');
        console.log('API状态:', apiStatus);
        
        console.log('✅ 服务器可访问');
    } catch (error) {
        console.log('❌ 服务器不可访问:', error.message);
    }
}

main();