// 测试服务器代码语法
const fs = require('fs');
const path = require('path');

const serverCode = fs.readFileSync(path.join(__dirname, 'server-online.js'), 'utf8');

console.log('检查服务器代码语法...');

try {
    // 尝试解析代码
    eval(serverCode);
    console.log('✅ 服务器代码语法正确');
} catch (error) {
    console.log('❌ 服务器代码语法错误:', error.message);
}

console.log('测试完成');