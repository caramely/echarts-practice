@echo off
echo ========================================
echo  实时数据监控仪表板 - 启动脚本
echo ========================================
echo.

echo 请选择要启动的组件：
echo 1. 启动后端服务 (需要Java和Maven)
echo 2. 启动前端HTTP服务器 (需要Python)
echo 3. 同时启动前后端
echo 4. 退出
echo.

set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto exit

echo 无效选项
pause
exit /b

:start_backend
echo.
echo 正在启动后端服务...
echo 请确保已安装Java 8+和Maven
echo.
cd backend
call mvn clean spring-boot:run
if errorlevel 1 (
    echo 后端启动失败，请检查Java和Maven环境
    pause
)
exit /b

:start_frontend
echo.
echo 正在启动前端HTTP服务器...
echo 请确保已安装Python 3+
echo.
cd frontend
python -m http.server 3000
if errorlevel 1 (
    echo 前端服务器启动失败，请检查Python环境
    echo 或者可以直接在浏览器中打开 frontend/index.html
    pause
)
exit /b

:start_both
echo.
echo 注意：需要打开两个终端窗口分别运行前后端
echo.
echo 后端启动命令：
echo cd backend && mvn clean spring-boot:run
echo.
echo 前端启动命令：
echo cd frontend && python -m http.server 3000
echo.
echo 或者直接打开 frontend/index.html
pause
exit /b

:exit
echo 退出
exit /b