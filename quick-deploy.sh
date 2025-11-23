#!/bin/bash

# Quick Deploy Script for Blaxel LIVE Trading
# This automates the entire deployment process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║    🚀 BLAXEL ENHANCED AI TRADER v2.0                   ║"
echo "║    Quick Deploy to LIVE Trading                        ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Blaxel CLI is installed
if ! command -v blaxel &> /dev/null; then
    echo "❌ Blaxel CLI not found!"
    echo "Installing Blaxel CLI..."
    npm install -g blaxel-cli
    echo "✅ Blaxel CLI installed"
fi

# Login check
echo "🔐 Checking Blaxel authentication..."
if ! blaxel status &> /dev/null; then
    echo "Please login to Blaxel:"
    blaxel login
fi

echo "✅ Authenticated"
echo ""

# Deploy
echo "📤 Deploying Enhanced AI Trader v2.0..."
npm run deploy:enhanced

echo ""
echo "✅ Deployment complete!"
echo ""

# Set environment variables
echo "🔧 Setting LIVE environment variables..."
echo "   (Using conservative settings for safety)"
echo ""

blaxel env:set \
  BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx \
  BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD \
  USE_TESTNET=false \
  TRADING_SYMBOL=ETHUSDT \
  CATEGORY=linear \
  MAX_RISK_PER_TRADE=0.01 \
  MAX_LEVERAGE=5 \
  POSITION_SIZE_PERCENT=0.03 \
  STOP_LOSS_PERCENT=0.015 \
  TAKE_PROFIT_PERCENT=0.03 \
  AI_UPDATE_INTERVAL=60000 \
  AI_CONFIDENCE_THRESHOLD=0.70

echo ""
echo "✅ Environment variables set"
echo ""

# Get agent URL
AGENT_URL=$(blaxel info --json | jq -r '.url' || echo "")

if [ -z "$AGENT_URL" ]; then
    echo "⚠️  Could not auto-detect agent URL"
    echo "Please get your URL from: blaxel status"
    AGENT_URL="<your-agent-url>"
else
    echo "🌐 Your agent URL: $AGENT_URL"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║    ✅ DEPLOYMENT SUCCESSFUL                            ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Show next steps
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Initialize the agent:"
echo "   curl -X POST $AGENT_URL/initialize"
echo ""
echo "2️⃣  Start trading:"
echo "   curl -X POST $AGENT_URL/start"
echo ""
echo "3️⃣  Check status:"
echo "   curl $AGENT_URL/status"
echo ""
echo "4️⃣  Monitor logs:"
echo "   blaxel logs --follow"
echo ""
echo "🛑 Emergency stop:"
echo "   curl -X POST $AGENT_URL/close-all"
echo "   curl -X POST $AGENT_URL/stop"
echo ""

echo "⚠️  IMPORTANT:"
echo "   • This is LIVE trading with REAL money"
echo "   • Start with small capital (<$500)"
echo "   • Monitor closely for first 24-48 hours"
echo "   • Read GO-LIVE-CHECKLIST.md before starting"
echo ""

echo "🎯 Ready to initialize? (yes/no)"
read -r CONFIRM

if [ "$CONFIRM" = "yes" ]; then
    echo ""
    echo "🚀 Initializing agent..."
    curl -X POST "$AGENT_URL/initialize" | jq .

    echo ""
    echo "🎯 Start trading now? (yes/no)"
    read -r START

    if [ "$START" = "yes" ]; then
        echo ""
        echo "🔴 Starting LIVE trading..."
        curl -X POST "$AGENT_URL/start" | jq .

        echo ""
        echo "✅ Trading started!"
        echo "📊 View status: curl $AGENT_URL/status | jq ."
        echo ""
    fi
fi

echo "Good luck! 🚀📈"
