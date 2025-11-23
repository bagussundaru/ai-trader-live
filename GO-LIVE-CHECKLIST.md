# 🔴 GO LIVE CHECKLIST - Blaxel AI Trader

## ⚠️ CRITICAL WARNING

**Trading cryptocurrency adalah SANGAT BERISIKO!**

- You can LOSE all your capital
- Past performance ≠ Future results
- Start with SMALL amounts
- Never invest more than you can afford to lose

---

## ✅ PRE-LIVE CHECKLIST

### 1. Testing Completion ✓

- [ ] Tested on testnet for minimum 1 week
- [ ] Win rate acceptable (>50%)
- [ ] Profit factor acceptable (>1.2)
- [ ] Max drawdown acceptable (<30%)
- [ ] No critical errors in logs
- [ ] All features working correctly

### 2. Bybit Account Setup ✓

- [ ] Bybit account created and verified
- [ ] 2FA enabled on Bybit account
- [ ] API keys generated
- [ ] **API permissions set correctly:**
  - ✅ Read Account
  - ✅ Read Positions
  - ✅ Trade
  - ❌ **Withdraw (DISABLED!)**
  - ❌ **Transfer (DISABLED!)**
- [ ] IP whitelist configured (optional but recommended)

### 3. Capital Preparation ✓

- [ ] Decided on starting capital (recommend $100-$500 max for first week)
- [ ] Capital deposited to Bybit
- [ ] Understand you may lose this capital
- [ ] Have more funds available if needed

### 4. Risk Management ✓

Review current risk settings in `.env`:

```env
MAX_RISK_PER_TRADE=0.02    # 2% max risk per trade
MAX_LEVERAGE=10            # 10x max leverage (consider reducing to 5x)
POSITION_SIZE_PERCENT=0.05 # 5% of balance per position
```

**Recommended for LIVE:**
```env
MAX_RISK_PER_TRADE=0.01    # 1% (more conservative)
MAX_LEVERAGE=5             # 5x (safer for live)
POSITION_SIZE_PERCENT=0.03 # 3% (smaller positions)
```

### 5. Monitoring Setup ✓

- [ ] Setup phone alerts for critical events
- [ ] Have time to monitor bot for first 24-48 hours
- [ ] Setup Blaxel dashboard monitoring
- [ ] Know how to emergency stop bot
- [ ] Have emergency close plan

### 6. Configuration Review ✓

Check `.env` settings:

```env
# CRITICAL: Set to LIVE mode
USE_TESTNET=false  # ⚠️ THIS ACTIVATES LIVE TRADING

# API Keys (LIVE)
BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD

# Trading pair
TRADING_SYMBOL=ETHUSDT  # Verify this is what you want

# Risk (CONSERVATIVE for live)
MAX_RISK_PER_TRADE=0.01
MAX_LEVERAGE=5
POSITION_SIZE_PERCENT=0.03
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Final Verification

```bash
# 1. Verify Bybit connection
npm run check

# Expected output:
# ✓ Connected to Bybit
# ✓ Wallet balance retrieved
# Account Type: UNIFIED
# Total Equity: XXX USD
```

### Step 2: Update Environment to LIVE

Edit `.env`:

```env
# CHANGE THIS LINE:
USE_TESTNET=false  # ⚠️ NOW LIVE!

# Optional: Reduce risk for live
MAX_RISK_PER_TRADE=0.01
MAX_LEVERAGE=5
POSITION_SIZE_PERCENT=0.03
STOP_LOSS_PERCENT=0.015
TAKE_PROFIT_PERCENT=0.03
```

### Step 3: Test Connection to LIVE Account

```bash
npm run check
```

Verify:
- Shows LIVE account balance
- Shows correct account type (UNIFIED)
- No errors

### Step 4: Choose Version

**Option A: Enhanced v2.0 (Recommended)**
```bash
npm run start:enhanced
```

**Option B: Basic v1.0**
```bash
npm start
```

### Step 5: Monitor Closely

**First 24 Hours:**
- Check every 1-2 hours
- Verify trades make sense
- Monitor P/L
- Check for errors in logs

**First Week:**
- Check at least 2-3 times per day
- Review daily performance
- Adjust if needed

---

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Local Machine (Simplest)

```bash
# Run enhanced version
npm run start:enhanced

# Keep terminal open
# Bot runs on your machine
# Press Ctrl+C to stop
```

**Pros:**
- Simple and immediate
- Full control
- Easy to monitor

**Cons:**
- Must keep computer on
- Internet must stay connected
- No redundancy

---

### Option 2: Blaxel Cloud (Recommended for 24/7)

#### Step 1: Set Blaxel Env Variables

```bash
# Set LIVE mode
blaxel env:set USE_TESTNET=false

# Set LIVE API keys
blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
blaxel env:set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD

# Set conservative risk for live
blaxel env:set MAX_RISK_PER_TRADE=0.01
blaxel env:set MAX_LEVERAGE=5
blaxel env:set POSITION_SIZE_PERCENT=0.03
```

#### Step 2: Deploy Enhanced Version

```bash
npm run deploy:enhanced
```

#### Step 3: Initialize and Start

```bash
# Get your deployed URL from Blaxel dashboard
AGENT_URL="https://your-agent-url.blaxel.app"

# Initialize
curl -X POST $AGENT_URL/initialize

# Start trading
curl -X POST $AGENT_URL/start

# Check status
curl $AGENT_URL/status
```

#### Step 4: Monitor via Blaxel Dashboard

- Go to https://dashboard.blaxel.com
- View logs, metrics, traces
- Set up alerts

---

## 📊 MONITORING & MANAGEMENT

### Check Status

```bash
# If running locally
# Status prints every 5 minutes automatically

# If on Blaxel
curl https://your-agent-url/status
```

### Emergency Stop

**Local:**
```bash
# Press Ctrl+C in terminal
```

**Blaxel:**
```bash
# Stop trading
curl -X POST https://your-agent-url/stop

# Close all positions immediately
curl -X POST https://your-agent-url/close-all
```

### Manual Trade (If Needed)

```bash
# Execute manual buy
curl -X POST https://your-agent-url/trade \
  -H "Content-Type: application/json" \
  -d '{"action":"Buy","confidence":0.8}'

# Execute manual sell
curl -X POST https://your-agent-url/trade \
  -H "Content-Type: application/json" \
  -d '{"action":"Sell","confidence":0.8}'
```

---

## 🎯 FIRST WEEK STRATEGY

### Day 1-3: Observation Phase

- **Capital:** Use only 20-30% of intended capital
- **Action:** Monitor closely, verify all features work
- **Goal:** Ensure no critical issues

### Day 4-7: Gradual Scale

- **Capital:** Increase to 50-70% if performance good
- **Action:** Continue monitoring
- **Goal:** Build confidence in system

### Week 2+: Full Scale (If Profitable)

- **Capital:** Scale to 100% if:
  - Win rate >50%
  - Net profit positive
  - No critical errors
  - Comfortable with results

---

## 🚨 STOP CONDITIONS

**IMMEDIATELY STOP BOT IF:**

1. ❌ Loss exceeds 10% of capital in single day
2. ❌ Multiple consecutive losses (5+)
3. ❌ Unexpected behavior (trades don't make sense)
4. ❌ API errors persisting
5. ❌ Unusual market conditions (flash crash, extreme volatility)
6. ❌ You're not comfortable with what it's doing

**How to Stop:**
```bash
# Local
Ctrl+C

# Blaxel
curl -X POST https://your-agent-url/stop
curl -X POST https://your-agent-url/close-all
```

---

## 📈 PERFORMANCE TRACKING

### Daily Review

Check these metrics:
- Total trades
- Win rate
- Net P/L
- Max drawdown
- Largest loss
- Regime detection accuracy

### Weekly Review

Analyze:
- Overall profitability
- Which regimes performed best
- Order flow accuracy
- Macro signals effectiveness
- Risk management performance

### Monthly Review

Decide:
- Continue as-is
- Adjust parameters
- Scale up capital
- Scale down capital
- Stop trading

---

## ⚙️ RECOMMENDED LIVE SETTINGS

### Conservative (Recommended for Start)

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.01      # 1% risk
MAX_LEVERAGE=5                # 5x leverage
POSITION_SIZE_PERCENT=0.03    # 3% position size
STOP_LOSS_PERCENT=0.015       # 1.5% SL
TAKE_PROFIT_PERCENT=0.03      # 3% TP
```

### Moderate (After 2 Weeks Success)

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.015      # 1.5% risk
MAX_LEVERAGE=7                # 7x leverage
POSITION_SIZE_PERCENT=0.04    # 4% position size
STOP_LOSS_PERCENT=0.02        # 2% SL
TAKE_PROFIT_PERCENT=0.04      # 4% TP
```

### Aggressive (Only After 1 Month+ Profitable)

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.02       # 2% risk
MAX_LEVERAGE=10               # 10x leverage
POSITION_SIZE_PERCENT=0.05    # 5% position size
STOP_LOSS_PERCENT=0.02        # 2% SL (ATR-based in v2.0)
TAKE_PROFIT_PERCENT=0.04      # 4% TP (ATR-based in v2.0)
```

---

## 🎯 FINAL CHECKLIST BEFORE GOING LIVE

- [ ] ✅ I have tested on testnet for at least 1 week
- [ ] ✅ I understand I can lose all my capital
- [ ] ✅ I am using SMALL capital I can afford to lose
- [ ] ✅ Bybit API has NO withdraw/transfer permissions
- [ ] ✅ I have set `USE_TESTNET=false` in `.env`
- [ ] ✅ I have reduced risk parameters for live
- [ ] ✅ I have time to monitor for first 24-48 hours
- [ ] ✅ I know how to emergency stop
- [ ] ✅ I have reviewed all documentation
- [ ] ✅ I am mentally prepared for potential losses

---

## 🚀 GO LIVE COMMAND

### Enhanced v2.0 (Recommended)

```bash
# Final check
npm run check

# GO LIVE!
npm run start:enhanced
```

### Monitor Output

You should see:
```
🚀 ENHANCED BLAXEL AI TRADER v2.0
========================================
Mode: 🔴 LIVE

[Enhanced] 🔧 Initializing Execution Engine...
[Enhanced] 💰 Balance: $XXX.XX
[Enhanced] ✅ All systems initialized and ready!
[Enhanced] 🚀 Starting Enhanced AI Trader...
[Enhanced] ✅ Enhanced AI Trader is now running!
```

---

## 📞 EMERGENCY CONTACTS & SUPPORT

### Immediate Issues

1. **Stop bot:** Ctrl+C or `curl -X POST .../stop`
2. **Close positions:** `curl -X POST .../close-all`
3. **Check logs:** `npm run logs` or Blaxel dashboard

### Support Resources

- Blaxel Docs: https://docs.blaxel.com
- Bybit Support: https://www.bybit.com/en/help-center
- Bybit API Status: https://bybit-exchange.github.io/docs/

---

## 🎊 YOU'RE READY!

Jika semua checklist ✅, Anda siap GO LIVE!

**Remember:**
- Start small
- Monitor closely
- Be patient
- Don't panic on losses
- Trust the system
- But verify results

**Good luck and trade safely! 🚀📈**

---

*Go Live Checklist v1.0*
*Created: 2025-11-23*
*Use at your own risk. Trading is risky.*
