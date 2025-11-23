# 🔴 READY TO GO LIVE!

## 🚀 Quick Start - Production Trading

Semua sistem telah siap untuk LIVE trading! Berikut panduan cepat.

---

## ⚡ FASTEST WAY TO GO LIVE

### Step 1: Interactive Go Live Script

```bash
npm run go-live
```

Script ini akan:
- ✅ Menanyakan konfirmasi keamanan
- ✅ Backup konfigurasi testnet
- ✅ Switch ke LIVE mode dengan risk konservatif
- ✅ Memberikan instruksi selanjutnya

### Step 2: Verify Connection

```bash
npm run check
```

Output should show **LIVE** account balance (bukan testnet).

### Step 3: Start Trading

**Enhanced Version (Recommended):**
```bash
npm run start:enhanced
```

**Basic Version:**
```bash
npm start
```

---

## 🎯 MANUAL GO LIVE (Alternative)

Jika ingin manual tanpa script:

### 1. Backup Current Config

```bash
cp .env .env.testnet
```

### 2. Edit .env

```env
# Change this line:
USE_TESTNET=false  # 🔴 LIVE!

# Recommended conservative settings:
MAX_RISK_PER_TRADE=0.01      # 1%
MAX_LEVERAGE=5                # 5x
POSITION_SIZE_PERCENT=0.03    # 3%
```

### 3. Verify

```bash
npm run check
```

### 4. Start

```bash
npm run start:enhanced
```

---

## 🛑 EMERGENCY STOP

If you need to stop immediately:

```bash
# Press Ctrl+C in terminal

# OR if on Blaxel:
curl -X POST https://your-agent-url/stop
curl -X POST https://your-agent-url/close-all
```

---

## 🔄 SWITCH BACK TO TESTNET

If you want to go back to testing:

```bash
npm run switch-to-testnet
```

Or manually:
```bash
cp .env.testnet .env
```

---

## 📊 RECOMMENDED SETTINGS FOR LIVE

### Conservative (Week 1) ⭐ RECOMMENDED

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.01      # 1% risk
MAX_LEVERAGE=5                # 5x leverage
POSITION_SIZE_PERCENT=0.03    # 3% position
```

**Best for:**
- First time live
- Learning bot behavior
- Small capital (<$500)

### Moderate (Week 2-4)

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.015      # 1.5% risk
MAX_LEVERAGE=7                # 7x leverage
POSITION_SIZE_PERCENT=0.04    # 4% position
```

**Best for:**
- After 1 week profitable
- Medium capital ($500-$2000)
- More confident

### Aggressive (Month 2+)

```env
USE_TESTNET=false
MAX_RISK_PER_TRADE=0.02       # 2% risk
MAX_LEVERAGE=10               # 10x leverage
POSITION_SIZE_PERCENT=0.05    # 5% position
```

**Best for:**
- After 1 month+ profitable
- Larger capital (>$2000)
- Fully confident in system

---

## 📈 FIRST WEEK PLAN

### Day 1-2: Close Monitoring

- Check every 1-2 hours
- Verify trades make sense
- Watch for any errors
- **Capital:** 20-30% of intended

### Day 3-5: Regular Checks

- Check 3-4 times per day
- Review daily P/L
- Monitor regime detection
- **Capital:** 50-70% if going well

### Day 6-7: Comfort Phase

- Check 2-3 times per day
- Analyze weekly performance
- Decide if to continue/stop/adjust
- **Capital:** 100% if profitable

---

## ⚠️ CRITICAL REMINDERS

### BEFORE Going Live:

- [ ] Tested on testnet minimum 1 week
- [ ] Using capital I can afford to LOSE
- [ ] Bybit API has NO withdraw/transfer permission
- [ ] I have time to monitor first 24-48 hours
- [ ] I have read GO-LIVE-CHECKLIST.md
- [ ] I understand cryptocurrency trading is VERY risky

### DURING Live Trading:

- ✅ Monitor regularly (especially first week)
- ✅ Trust the system (don't over-intervene)
- ✅ Review daily performance
- ✅ Keep logs and metrics
- ✅ Be patient with results

### STOP TRADING IF:

- ❌ Loss >10% in single day
- ❌ 5+ consecutive losses
- ❌ Unexpected/weird behavior
- ❌ API errors persisting
- ❌ You're uncomfortable

---

## 🎯 MONITORING COMMANDS

### Check Current Status

```bash
# Local
# Automatically prints every 5 minutes

# Blaxel
curl https://your-agent-url/status
```

### View Logs

```bash
# Blaxel
npm run logs

# Or
blaxel logs --tail 100 --follow
```

### Get Detailed Analysis

```bash
curl https://your-agent-url/regime      # Market regime
curl https://your-agent-url/order-flow  # Order flow
curl https://your-agent-url/macro       # Macro signals
curl https://your-agent-url/sentiment   # Sentiment data
```

---

## 📊 PERFORMANCE TARGETS

### Week 1 Goals

- Survival (don't lose >5%)
- Understand bot behavior
- No critical errors

### Week 2-4 Goals

- Net profit >0%
- Win rate >50%
- Max drawdown <15%

### Month 2+ Goals

- Win rate 55-65%
- Profit factor >1.5
- Sharpe ratio >1.0
- Consistent profits

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Local (Your Computer)

```bash
npm run start:enhanced
```

**Pros:** Simple, immediate, full control
**Cons:** Must keep computer on

### Option 2: Blaxel Cloud (24/7)

```bash
# Set live env vars
blaxel env:set USE_TESTNET=false
blaxel env:set BYBIT_API_KEY=your_key
blaxel env:set BYBIT_API_SECRET=your_secret

# Deploy
npm run deploy:enhanced

# Start
curl -X POST https://your-url/initialize
curl -X POST https://your-url/start
```

**Pros:** 24/7, reliable, monitored
**Cons:** Need Blaxel account

---

## 📖 DOCUMENTATION

**Must Read Before Live:**
- [GO-LIVE-CHECKLIST.md](GO-LIVE-CHECKLIST.md) ⭐ READ THIS!
- [README-ENHANCED.md](README-ENHANCED.md)
- [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md)

**Reference:**
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎊 YOU'RE READY!

If you've completed all checklist items, you're ready to GO LIVE!

**Quick commands:**

```bash
# Interactive go live (RECOMMENDED)
npm run go-live

# Verify connection
npm run check

# Start trading
npm run start:enhanced

# Emergency stop
Ctrl+C

# Switch back to testnet
npm run switch-to-testnet
```

---

## ⚠️ FINAL WARNING

**CRYPTOCURRENCY TRADING IS EXTREMELY RISKY**

- You can lose ALL your capital
- Start SMALL (recommended <$500 first week)
- Monitor CLOSELY (first 24-48 hours critical)
- Be PATIENT (don't expect overnight riches)
- Trade RESPONSIBLY (never invest more than you can afford to lose)

**Good luck and trade safely! 🚀📈**

---

*Ready to Go Live Guide v1.0*
*Created: 2025-11-23*
*Trade at your own risk*
