@echo off
echo ========================================
echo   三组扑克牌游戏 - 服务器启动
echo ========================================
echo.
echo 请选择启动方式:
echo.
echo 1. 使用Python服务器 (推荐)
echo 2. 使用Node.js服务器
echo 3. 仅本地游戏 (不需要服务器)
echo.
set /p choice="请输入选项 (1-3): "

if "%choice%"=="1" goto python_server
if "%choice%"=="2" goto node_server
if "%choice%"=="3" goto local_game
goto invalid

:python_server
echo.
echo 正在启动Python服务器...
echo 如果提示找不到python命令，请先安装Python
echo.
echo 服务器启动后，请在浏览器中打开：
echo http://localhost:3001
echo.
echo 正在打开启动页面...
start start.html
echo.
echo 服务器已启动，正在运行...
echo 按 Ctrl+C 停止服务器
echo.
python python-server.py
pause
goto end

:node_server
echo.
echo 正在启动Node.js服务器...
echo 如果提示找不到node命令，请先安装Node.js
echo.
node local-server.js
pause
goto end

:local_game
echo.
echo 正在打开本地游戏...
start index.html
echo.
echo 提示: 本地游戏模式不支持多人在线对战
echo 如需多人对战，请选择选项1或2
echo 并从 http://localhost:3000 访问游戏
echo 不要直接打开 index.html 文件
echo.
pause
goto end

:invalid
echo.
echo 无效选项，请重新运行脚本
pause
goto end

:end