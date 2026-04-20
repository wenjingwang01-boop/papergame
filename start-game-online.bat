@echo off

:: 三组扑克牌游戏启动脚本
:: 2026-04-20

echo =====================================
echo        三组扑克牌游戏

echo =====================================
echo 1. 启动本地服务器（推荐）
echo 2. 启动在线服务器
echo 3. 直接打开本地游戏（无需服务器）
echo 4. 退出
echo =====================================

set /p choice=请选择操作: 

if %choice%==1 (
    echo 启动本地服务器...
    echo 请确保已安装Python 3
    start "本地服务器" python python-server.py
    echo 服务器已启动，端口3001
    echo 请在浏览器打开 http://localhost:3001
    echo 按任意键继续...
    pause >nul
    start http://localhost:3001
    exit
)

if %choice%==2 (
    echo 启动在线服务器...
    echo 请确保已安装Node.js
    if exist "server-online.js" (
        start "在线服务器" node server-online.js
        echo 服务器已启动，端口3000
        echo 请在浏览器打开 http://localhost:3000
        echo 按任意键继续...
        pause >nul
        start http://localhost:3000
    ) else (
        echo 错误：server-online.js 文件不存在
        echo 按任意键继续...
        pause >nul
    )
    exit
)

if %choice%==3 (
    echo 直接打开本地游戏...
    start index.html
    echo 游戏已打开，请添加AI对手进行本地游戏
    exit
)

if %choice%==4 (
    exit
)

echo 无效选择，请重新运行脚本
pause >nul