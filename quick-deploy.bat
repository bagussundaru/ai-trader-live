@echo off
REM Quick Deploy Script for Windows - Blaxel LIVE Trading

echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║    🚀 BLAXEL ENHANCED AI TRADER v2.0                   ║
echo ║    Quick Deploy to LIVE Trading                        ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Blaxel CLI is installed
where blaxel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Blaxel CLI not found!
    echo Installing Blaxel CLI...
    call npm install -g blaxel-cli
    echo ✅ Blaxel CLI installed
)

REM Login check
echo 🔐 Checking Blaxel authentication...
blaxel status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please login to Blaxel:
    call blaxel login
)

echo ✅ Authenticated
echo.

REM Deploy
echo 📤 Deploying Enhanced AI Trader v2.0...
call npm run deploy:enhanced

echo.
echo ✅ Deployment complete!
echo.

REM Set environment variables
echo 🔧 Setting LIVE environment variables...
echo    (Using conservative settings for safety)
echo.

call blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
call blaxel env:set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD
call blaxel env:set USE_TESTNET=false
call blaxel env:set TRADING_SYMBOL=ETHUSDT
call blaxel env:set CATEGORY=linear
call blaxel env:set MAX_RISK_PER_TRADE=0.01
call blaxel env:set MAX_LEVERAGE=5
call blaxel env:set POSITION_SIZE_PERCENT=0.03
call blaxel env:set STOP_LOSS_PERCENT=0.015
call blaxel env:set TAKE_PROFIT_PERCENT=0.03
call blaxel env:set AI_UPDATE_INTERVAL=60000
call blaxel env:set AI_CONFIDENCE_THRESHOLD=0.70

echo.
echo ✅ Environment variables set
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║    ✅ DEPLOYMENT SUCCESSFUL                            ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo 📋 Next Steps:
echo.
echo Get your agent URL from: blaxel status
echo Then run these commands (replace YOUR-URL):
echo.
echo 1️⃣  Initialize:
echo    curl -X POST https://YOUR-URL/initialize
echo.
echo 2️⃣  Start trading:
echo    curl -X POST https://YOUR-URL/start
echo.
echo 3️⃣  Check status:
echo    curl https://YOUR-URL/status
echo.
echo 4️⃣  Monitor logs:
echo    blaxel logs --follow
echo.
echo 🛑 Emergency stop:
echo    curl -X POST https://YOUR-URL/close-all
echo    curl -X POST https://YOUR-URL/stop
echo.
echo ⚠️  IMPORTANT:
echo    • This is LIVE trading with REAL money
echo    • Start with small capital (less than $500)
echo    • Monitor closely for first 24-48 hours
echo    • Read GO-LIVE-CHECKLIST.md before starting
echo.
echo Good luck! 🚀📈
echo.

pause
