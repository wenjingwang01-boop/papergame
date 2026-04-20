@echo off
echo 正在启动游戏服务器...
echo.
echo 服务器将在以下地址运行:
echo - 本地访问: http://localhost:3000
echo - 局域网访问: 请将下面的IP地址替换为你的实际IP
echo   http://YOUR_IP:3000
echo.
echo 按Ctrl+C停止服务器
echo.
node server.js
pause