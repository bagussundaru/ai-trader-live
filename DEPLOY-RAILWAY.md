# 🚀 Deploy ke Railway.app - LIVE Trading

## Railway.app adalah solusi termudah untuk deploy bot 24/7!

---

## ✅ Kenapa Railway?

- ✅ **FREE tier** ($5 credit/month - cukup untuk bot kecil)
- ✅ **Sangat mudah** - deploy dalam 10 menit
- ✅ **24/7 uptime** - bot jalan terus
- ✅ **No DNS hijacking** - server di luar Indonesia
- ✅ **Auto-restart** jika bot crash
- ✅ **Real-time logs** - monitoring mudah

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Sign Up Railway

1. Buka https://railway.app
2. Sign up dengan GitHub account
3. Verify email Anda
4. **Gratis** $5 credit per bulan!

---

### Step 2: Push Code ke GitHub (Private Repo)

```bash
cd d:/blaxel

# Initialize git jika belum
git init

# Add all files
git add .

# Commit
git commit -m "Enhanced AI Trader v2.0 - Ready for LIVE"

# Create private repo di GitHub (via website)
# Lalu:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**PENTING**: Pastikan repository **PRIVATE** karena ada API keys!

---

### Step 3: Deploy di Railway

#### Option A: Via Website (Termudah)

1. Login ke https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect GitHub account jika belum
5. Pilih repository **YOUR_REPO**
6. Railway akan auto-detect Node.js project
7. Click **"Deploy"**

#### Option B: Via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd d:/blaxel
railway init

# Link to project
railway link

# Deploy
railway up
```

---

### Step 4: Set Environment Variables

Di Railway dashboard:

1. Click project Anda
2. Go to **"Variables"** tab
3. Add these variables:

```
BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD
USE_TESTNET=false
TRADING_SYMBOL=ETHUSDT
CATEGORY=linear
MAX_RISK_PER_TRADE=0.01
MAX_LEVERAGE=5
POSITION_SIZE_PERCENT=0.03
STOP_LOSS_PERCENT=0.015
TAKE_PROFIT_PERCENT=0.03
AI_UPDATE_INTERVAL=60000
AI_CONFIDENCE_THRESHOLD=0.70
```

**Atau via CLI:**

```bash
railway variables set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
railway variables set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD
railway variables set USE_TESTNET=false
railway variables set TRADING_SYMBOL=ETHUSDT
railway variables set CATEGORY=linear
railway variables set MAX_RISK_PER_TRADE=0.01
railway variables set MAX_LEVERAGE=5
railway variables set POSITION_SIZE_PERCENT=0.03
railway variables set STOP_LOSS_PERCENT=0.015
railway variables set TAKE_PROFIT_PERCENT=0.03
railway variables set AI_UPDATE_INTERVAL=60000
railway variables set AI_CONFIDENCE_THRESHOLD=0.70
```

---

### Step 5: Verify Deployment

Railway akan automatically:
1. ✅ Install dependencies (`npm install`)
2. ✅ Start bot (`node start-live.js` - defined in Procfile)
3. ✅ Keep running 24/7

---

## 📊 Monitor Your Bot

### View Logs (Real-time)

**Via Dashboard:**
- Go to your project
- Click **"Logs"** tab
- See real-time output

**Via CLI:**
```bash
railway logs
```

### Check Status

```bash
railway status
```

### Restart Bot

If needed:
```bash
railway restart
```

---

## 💰 Cost

### Free Tier
- **$5 credit/month** (enough for small bot)
- Renews every month
- Perfect for testing

### If You Exceed Free Tier
- Pay-as-you-go: ~$5-10/month for 24/7 bot
- No contract
- Cancel anytime

---

## 🛑 Emergency Controls

### Stop Bot Temporarily

```bash
railway down
```

### Restart

```bash
railway up
```

### Delete Deployment

Di dashboard → Settings → Delete Service

---

## ✅ Verification Checklist

After deployment:

- [ ] Logs show "✅ LIVE MODE CONFIRMED"
- [ ] No DNS/connection errors
- [ ] Account balance fetched successfully
- [ ] WebSocket connected to Bybit
- [ ] All 5 engines initialized (Regime, OrderFlow, Macro, Sentiment, Technical)
- [ ] Bot shows "Waiting for trading signal..."

---

## 🔧 Troubleshooting

### Bot Crashes Immediately

Check logs for errors:
```bash
railway logs --tail 100
```

Common issues:
1. Missing environment variables
2. Wrong API keys
3. API keys not for LIVE mode

### No Trades Being Made

This is **NORMAL** if:
- Market regime is CHOPPY/NEWS_SHOCK
- Confidence below 70%
- Multiple factors not aligning

Check analysis in logs.

### High Memory Usage

If bot uses >512MB RAM, upgrade Railway plan.

---

## 📈 Next Steps After Deployment

1. **Monitor closely** for first 24 hours
2. Check logs every 2-3 hours
3. Verify trades make sense
4. Track P/L on Bybit dashboard
5. Adjust settings if needed (via environment variables)

---

## ⚠️ IMPORTANT

### Before Starting LIVE:

- [ ] Read GO-LIVE-CHECKLIST.md
- [ ] Verified API keys are for LIVE
- [ ] Withdraw/Transfer disabled on API keys
- [ ] Using capital you can afford to LOSE
- [ ] Ready to monitor for 24-48 hours

### While Running:

- ✅ Check logs 2-3x per day
- ✅ Review trades on Bybit
- ✅ Trust the system (don't over-intervene)
- ✅ Be patient

### Stop Trading If:

- ❌ Loss >10% in single day
- ❌ 5+ consecutive losses
- ❌ Unexpected behavior
- ❌ You're uncomfortable

---

## 🎊 You're LIVE!

Once deployed to Railway:
- ✅ Bot runs 24/7
- ✅ No DNS issues
- ✅ Auto-restart if crash
- ✅ Low latency to Bybit
- ✅ Easy monitoring

**Good luck and trade safely! 🚀📈**

---

## Quick Commands Reference

```bash
# Deploy
railway up

# Logs
railway logs --follow

# Status
railway status

# Restart
railway restart

# Stop
railway down

# Variables
railway variables
```
