# 🚀 Deploy Enhanced AI Trader to Blaxel (LIVE MODE)

## Quick Deployment Guide

Since your local environment has DNS hijacking issues (Indonesian ISP blocking Bybit), you need to deploy to **Blaxel Cloud** to bypass this.

---

## ✅ Prerequisites

- [x] Blaxel account created
- [x] Blaxel CLI installed (`npm install -g blaxel-cli`)
- [x] Blaxel API Key: `bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy`
- [x] Bybit API credentials ready
- [x] Enhanced v2.0 system complete

---

## 🔐 Step 1: Login to Blaxel

```bash
blaxel login
```

When prompted, enter your API key:
```
bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy
```

---

## 📤 Step 2: Deploy Enhanced Agent

```bash
# Deploy the enhanced version
npm run deploy:enhanced
```

Or manually:
```bash
blaxel deploy --config blaxel-enhanced.config.json
```

This will:
- Upload all enhanced engine files
- Configure serverless endpoints
- Set up observability and metrics
- Deploy to Blaxel cloud (no DNS issues!)

---

## 🔴 Step 3: Set LIVE Environment Variables

**CRITICAL**: You must set these on Blaxel to enable LIVE trading:

```bash
# Bybit credentials
blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
blaxel env:set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD

# LIVE MODE (not testnet)
blaxel env:set USE_TESTNET=false

# Trading configuration
blaxel env:set TRADING_SYMBOL=ETHUSDT
blaxel env:set CATEGORY=linear

# Conservative LIVE risk settings
blaxel env:set MAX_RISK_PER_TRADE=0.01
blaxel env:set MAX_LEVERAGE=5
blaxel env:set POSITION_SIZE_PERCENT=0.03
blaxel env:set STOP_LOSS_PERCENT=0.015
blaxel env:set TAKE_PROFIT_PERCENT=0.03

# AI configuration
blaxel env:set AI_UPDATE_INTERVAL=60000
blaxel env:set AI_CONFIDENCE_THRESHOLD=0.70
```

**All in one command:**
```bash
blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD USE_TESTNET=false TRADING_SYMBOL=ETHUSDT CATEGORY=linear MAX_RISK_PER_TRADE=0.01 MAX_LEVERAGE=5 POSITION_SIZE_PERCENT=0.03 STOP_LOSS_PERCENT=0.015 TAKE_PROFIT_PERCENT=0.03 AI_UPDATE_INTERVAL=60000 AI_CONFIDENCE_THRESHOLD=0.70
```

---

## 🎯 Step 4: Initialize and Start Trading

Your agent is now deployed at a URL like:
```
https://your-agent-id.blaxel.app
```

### 4.1 Initialize the Agent

```bash
curl -X POST https://your-agent-id.blaxel.app/initialize
```

**Expected response:**
```json
{
  "success": true,
  "version": "2.0-enhanced",
  "message": "Enhanced AI Trader initialized with multi-factor analysis",
  "features": [
    "Market Regime Detection",
    "Order Flow Analysis (CVD, OI, Funding)",
    "Macro Fundamental Tracking",
    "Sentiment & On-Chain Metrics",
    "Dynamic ATR-based Risk Management",
    "Multi-Factor Weighted Decision Model"
  ]
}
```

### 4.2 Start Automated Trading

```bash
curl -X POST https://your-agent-id.blaxel.app/start
```

**Expected response:**
```json
{
  "success": true,
  "version": "2.0-enhanced",
  "message": "Enhanced trading started"
}
```

---

## 📊 Step 5: Monitor Your Trading Bot

### Check Overall Status

```bash
curl https://your-agent-id.blaxel.app/status
```

### Check Market Regime

```bash
curl https://your-agent-id.blaxel.app/regime
```

Returns: Trending, Ranging, Choppy, Volatile, or News Shock

### Check Order Flow

```bash
curl https://your-agent-id.blaxel.app/order-flow
```

Returns: CVD, Open Interest, Funding Rate, Order Book analysis

### Check Macro Fundamentals

```bash
curl https://your-agent-id.blaxel.app/macro
```

Returns: DXY, US10Y, ETF flows, economic calendar

### Check Sentiment & On-Chain

```bash
curl https://your-agent-id.blaxel.app/sentiment
```

Returns: Fear & Greed Index, NUPL, MVRV, SOPR, Exchange Reserves

### Health Check

```bash
curl https://your-agent-id.blaxel.app/health
```

---

## 📝 Step 6: View Logs

```bash
# View last 100 lines
npm run logs

# Or with Blaxel CLI
blaxel logs --tail 100 --follow
```

---

## 🛑 Emergency Controls

### Stop Trading

```bash
curl -X POST https://your-agent-id.blaxel.app/stop
```

### Close All Positions

```bash
curl -X POST https://your-agent-id.blaxel.app/close-all
```

---

## 🔄 Manual Trade Execution

If you want to manually trigger a trade:

```bash
# Buy signal
curl -X POST https://your-agent-id.blaxel.app/trade \
  -H "Content-Type: application/json" \
  -d '{"action": "Buy", "confidence": 0.8}'

# Sell signal
curl -X POST https://your-agent-id.blaxel.app/trade \
  -H "Content-Type: application/json" \
  -d '{"action": "Sell", "confidence": 0.8}'
```

---

## 📈 Monitoring Dashboard (Optional)

Create a simple monitoring script:

```bash
# Save as monitor.sh
#!/bin/bash
while true; do
  clear
  echo "========== BLAXEL AI TRADER STATUS =========="
  curl -s https://your-agent-id.blaxel.app/status | jq .
  echo ""
  echo "========== MARKET REGIME =========="
  curl -s https://your-agent-id.blaxel.app/regime | jq .
  echo ""
  echo "Next update in 60 seconds..."
  sleep 60
done
```

Run it:
```bash
chmod +x monitor.sh
./monitor.sh
```

---

## ⚠️ Important Notes

### Why Blaxel Instead of Local?

Your local environment (Indonesia) has:
- ❌ DNS hijacking by ISP
- ❌ `api.bybit.com` redirected to `api.bybit.com.co.id`
- ❌ Connection to fake server `185.192.124.198`

Blaxel servers:
- ✅ No DNS hijacking
- ✅ Direct connection to Bybit
- ✅ 24/7 uptime
- ✅ Low latency
- ✅ Automatic restarts
- ✅ Built-in observability

### LIVE Trading Checklist

Before starting:
- [ ] Verified Bybit API keys are for **LIVE** (not testnet)
- [ ] API keys have **trading permission** enabled
- [ ] API keys have **withdraw/transfer disabled** (safety)
- [ ] Using capital you can afford to **LOSE**
- [ ] Tested on testnet for minimum 1 week
- [ ] Conservative risk settings applied (1% risk, 5x leverage)
- [ ] Ready to monitor for first 24-48 hours

---

## 🔧 Troubleshooting

### Deployment Fails

```bash
# Check Blaxel status
blaxel status

# Re-login
blaxel logout
blaxel login

# Try again
npm run deploy:enhanced
```

### Agent Not Responding

```bash
# Check logs
blaxel logs --tail 50

# Restart agent
curl -X POST https://your-agent-id.blaxel.app/stop
curl -X POST https://your-agent-id.blaxel.app/initialize
curl -X POST https://your-agent-id.blaxel.app/start
```

### Connection Errors on Blaxel

If you see connection errors even on Blaxel:
1. Check API keys are correct
2. Verify API keys are for **LIVE** mode
3. Check Bybit API status: https://bybit-exchange.github.io/docs/
4. Ensure trading permissions enabled on API keys

---

## 📖 Next Steps After Deployment

1. **First 24 hours**: Check status every 1-2 hours
2. **Monitor logs**: Watch for any errors
3. **Verify trades**: Ensure trades match expected behavior
4. **Track performance**: Note win rate, profit/loss
5. **Adjust if needed**: Can modify risk settings via env vars

---

## 🎊 You're Ready!

Once deployed to Blaxel, your bot will:
- ✅ Run 24/7 without DNS issues
- ✅ Execute multi-factor institutional-grade analysis
- ✅ Adapt to market regimes automatically
- ✅ Use ATR-based dynamic risk management
- ✅ Track order flow, macro, and sentiment signals
- ✅ Manage positions with conservative risk settings

**Good luck and trade safely! 🚀📈**

---

## Quick Command Reference

```bash
# Deploy
npm run deploy:enhanced

# Monitor
blaxel logs --follow

# Initialize
curl -X POST https://your-agent-id.blaxel.app/initialize

# Start
curl -X POST https://your-agent-id.blaxel.app/start

# Status
curl https://your-agent-id.blaxel.app/status

# Emergency stop
curl -X POST https://your-agent-id.blaxel.app/close-all
curl -X POST https://your-agent-id.blaxel.app/stop
```
