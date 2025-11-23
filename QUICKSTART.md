# 🚀 Quick Start Guide

Panduan cepat untuk memulai AI Trading Bot dalam 5 menit.

## Prerequisites

- Node.js 18+ terinstall
- Account Bybit (buat di [bybit.com](https://www.bybit.com))
- Account Blaxel (buat di [blaxel.com](https://blaxel.com))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Konfigurasi API Keys

Sudah ada di file `.env`:

```env
# Blaxel
BLAXEL_API_KEY=bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy

# Bybit
BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD

# Mode
USE_TESTNET=true
```

⚠️ **PENTING**: Pastikan `USE_TESTNET=true` untuk testing!

## Step 3: Verifikasi Koneksi

```bash
npm run check
```

Output yang diharapkan:
```
✓ Connected to Bybit
✓ Wallet balance retrieved
✓ No open positions
✅ Account check complete!
```

## Step 4: Test Lokal (Opsional)

Test bot di lokal terlebih dahulu:

```bash
npm test
```

Bot akan:
- Connect ke Bybit testnet
- Fetch market data real-time
- Generate trading signals
- Print status setiap 30 detik

Tekan `Ctrl+C` untuk stop.

## Step 5: Deploy ke Blaxel

### 5a. Install Blaxel CLI

```bash
npm install -g @blaxel/cli
```

### 5b. Login

```bash
blaxel login
```

Masukkan API key: `bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy`

### 5c. Set Environment Variables

```bash
blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
blaxel env:set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD
blaxel env:set BLAXEL_API_KEY=bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy
blaxel env:set USE_TESTNET=true
```

### 5d. Deploy

```bash
npm run deploy
```

Atau:

```bash
blaxel deploy
```

## Step 6: Start Trading

Setelah deploy sukses, Anda akan mendapat URL agent:

```
Agent URL: https://blaxel-ai-trader-xxxxx.blaxel.app
```

### Initialize Agent

```bash
curl -X POST https://YOUR-AGENT-URL/initialize
```

### Start Trading

```bash
curl -X POST https://YOUR-AGENT-URL/start
```

### Check Status

```bash
curl https://YOUR-AGENT-URL/status
```

## Monitor Trading

### Via Blaxel Dashboard

1. Login ke [dashboard.blaxel.com](https://dashboard.blaxel.com)
2. Go to **Agents** → `blaxel-ai-trader`
3. View:
   - Real-time logs
   - Metrics & performance
   - Resource usage

### Via Logs

```bash
npm run logs
```

Atau:

```bash
blaxel logs --tail 100 --follow
```

## Manual Trading

Execute manual trade:

```bash
curl -X POST https://YOUR-AGENT-URL/trade \
  -H "Content-Type: application/json" \
  -d '{"action":"Buy","confidence":0.8}'
```

## Emergency Stop

Close all positions:

```bash
curl -X POST https://YOUR-AGENT-URL/close-all
```

Stop trading:

```bash
curl -X POST https://YOUR-AGENT-URL/stop
```

## Understanding the Bot

### Risk Management

- **Max risk per trade**: 2% of account
- **Position size**: 5% of account
- **Stop loss**: 2% from entry
- **Take profit**: 4% from entry
- **Max positions**: 3 concurrent
- **Max leverage**: 10x

### Trading Logic

Bot menggunakan multiple indicators:
- **RSI**: Oversold/overbought detection
- **MACD**: Trend momentum
- **EMA**: Trend direction (9, 21, 50 periods)
- **Bollinger Bands**: Volatility & support/resistance

**Signal threshold**: Hanya trade dengan confidence >60%

### Update Frequency

- Market data: Real-time WebSocket
- Analysis: Every 60 seconds
- Status update: Every 5 minutes

## Troubleshooting

### Bot tidak trading?

**Possible reasons:**
1. Insufficient balance
2. Market data belum siap (tunggu 1-2 menit)
3. Signal confidence <60%
4. Already 3 positions open

**Solution:**
```bash
# Check logs
npm run logs

# Check status
curl https://YOUR-AGENT-URL/status
```

### Connection error?

**Check:**
1. API keys valid?
2. API permissions correct? (harus ada "Trade")
3. Internet connection stable?

**Verify:**
```bash
npm run check
```

### Deployment failed?

**Common fixes:**
```bash
# Re-install dependencies
rm -rf node_modules package-lock.json
npm install

# Try deploy again
npm run deploy
```

## Important Notes

### ⚠️ Safety First

1. **Always start with testnet** (`USE_TESTNET=true`)
2. **Never invest money you can't afford to lose**
3. **Monitor the bot regularly** (at least daily)
4. **Start with small amounts** when going live
5. **Review logs and metrics** before increasing capital

### 📊 Performance Monitoring

Check performance metrics:
```bash
curl https://YOUR-AGENT-URL/status | jq '.data.performance'
```

Key metrics:
- **Win Rate**: Should be >50%
- **Profit Factor**: Should be >1.0
- **Sharpe Ratio**: Higher is better (>1.0 is good)
- **Max Drawdown**: Lower is better (<20% ideal)

### 🔐 Security

1. **Never commit `.env` to git**
2. **Use Blaxel Secrets** for sensitive data
3. **Disable "Withdraw" permission** on Bybit API
4. **Enable 2FA** on both Bybit and Blaxel accounts

## Next Steps

### After 24-48 Hours Testing

1. Review performance metrics
2. Analyze trade history
3. Adjust risk parameters if needed
4. Consider going live with small capital

### Customization

Edit [src/config/config.js](src/config/config.js) to:
- Change risk parameters
- Adjust indicators
- Modify update intervals
- Customize trading logic

### Advanced Features

See full documentation:
- [README.md](README.md) - Complete documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Advanced deployment

## Support

**Issues?**
- Check logs: `npm run logs`
- Review status: `curl YOUR-AGENT-URL/status`
- Read docs: `README.md`

**Need help?**
- Blaxel docs: https://docs.blaxel.com
- Bybit API docs: https://bybit-exchange.github.io/docs/v5/intro

---

**Happy Trading! 📈**

*Remember: Past performance doesn't guarantee future results.*
