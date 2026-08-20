@echo off
cd /d "%~dp0"
echo ============================================
echo   PUBG 战绩代理服务启动器
echo ============================================
echo.
echo 正在启动，请保持本窗口不要关闭...
echo 启动成功后会出现: 代理服务运行在 http://localhost:3000
echo 关闭本窗口 = 停止服务
echo.
call npm start
echo.
echo 服务已停止。按任意键关闭窗口...
pause > nul