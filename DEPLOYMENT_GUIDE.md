# Panduan Deployment ke Blaxel Platform

Panduan lengkap untuk men-deploy AI Trading Bot ke Blaxel.com

## Arsitektur Deployment

Bot ini akan di-deploy menggunakan komponen Blaxel berikut:

### 1. **Agents Hosting** (Otak Trader)
- Menjalankan logika AI Decision Core
- Hosting Strategy Engine
- Serverless deployment untuk efisiensi

### 2. **Sandboxes** (Execution Environment)
- VM terisolasi untuk keamanan
- Boot time <25ms untuk response cepat
- Eksekusi kode trading yang aman

### 3. **Model Gateway** (AI Model Management)
- Akses ke LLM untuk analisis sentimen (opsional)
- Routing dan fallback otomatis
- Token usage monitoring

### 4. **MCP Servers** (Market Data & Execution)
- Custom tool untuk Bybit API integration
- Real-time market data fetching
- Order execution handler

## Langkah-Langkah Deployment

### Step 1: Persiapan Account Blaxel

1. Daftar di [Blaxel.com](https://blaxel.com)

2. Dapatkan API Key dari dashboard:
   ```
   Dashboard → API Keys → Create New Key
   ```

3. Save API key Anda (sudah ada):
   ```
   bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy
   ```

### Step 2: Install Blaxel CLI

```bash
npm install -g @blaxel/cli
```

Atau dengan yarn:
```bash
yarn global add @blaxel/cli
```

### Step 3: Login ke Blaxel

```bash
blaxel login
```

Masukkan API key Anda saat diminta:
```
API Key: bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy
```

### Step 4: Konfigurasi Project

File `blaxel.config.json` sudah disiapkan dengan konfigurasi:

```json
{
  "name": "blaxel-ai-trader",
  "agent": {
    "type": "serverless",
    "runtime": "nodejs18",
    "handler": "blaxel-agent.handler",
    "memory": 512,
    "timeout": 300
  },
  "observability": {
    "logging": true,
    "metrics": true,
    "traces": true
  }
}
```

### Step 5: Set Environment Variables

Set semua environment variables yang diperlukan:

```bash
# Bybit API Credentials
blaxel env:set BYBIT_API_KEY=GpT4GPwOXzvW8nEqhx
blaxel env:set BYBIT_API_SECRET=SCJpSe8YIsGoKvElxxIibeLrEUVtkgnPT2xD

# Blaxel API Key
blaxel env:set BLAXEL_API_KEY=bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy

# Trading Configuration
blaxel env:set USE_TESTNET=true
blaxel env:set TRADING_SYMBOL=ETHUSDT
blaxel env:set CATEGORY=linear

# Risk Management
blaxel env:set MAX_RISK_PER_TRADE=0.02
blaxel env:set MAX_LEVERAGE=10
blaxel env:set POSITION_SIZE_PERCENT=0.05
blaxel env:set STOP_LOSS_PERCENT=0.02
blaxel env:set TAKE_PROFIT_PERCENT=0.04
```

### Step 6: Deploy Agent

Deploy project ke Blaxel:

```bash
blaxel deploy
```

Output yang diharapkan:
```
✓ Uploading code...
✓ Building agent...
✓ Deploying to global network...
✓ Agent deployed successfully!

Agent URL: https://blaxel-ai-trader-xxxxx.blaxel.app
Endpoints:
  - POST   /initialize
  - POST   /start
  - POST   /stop
  - GET    /status
  - POST   /trade
  - POST   /close-all
  - GET    /health
```

### Step 7: Verify Deployment

Test health endpoint:

```bash
curl https://your-agent-url.blaxel.app/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "initialized": false,
  "timestamp": "2025-11-23T..."
}
```

### Step 8: Initialize Agent

Initialize trading agent:

```bash
curl -X POST https://your-agent-url.blaxel.app/initialize
```

Response:
```json
{
  "success": true,
  "message": "AI Trader Agent initialized"
}
```

### Step 9: Start Trading

Mulai automated trading:

```bash
curl -X POST https://your-agent-url.blaxel.app/start
```

Response:
```json
{
  "success": true,
  "message": "Trading started"
}
```

## Monitoring di Blaxel Dashboard

### 1. Observability Dashboard

Akses di: `https://dashboard.blaxel.com/observability`

Features:
- **Real-time Logs**: Lihat semua aktivitas trading
- **Metrics**: Monitor performance metrics
- **Traces**: Track decision flow AI
- **Alerts**: Set up alerts untuk kondisi tertentu

### 2. Agent Management

Akses di: `https://dashboard.blaxel.com/agents`

Features:
- Agent status monitoring
- Resource usage (CPU, Memory)
- Request analytics
- Error tracking

### 3. Cost Monitoring

Akses di: `https://dashboard.blaxel.com/billing`

Monitor:
- Compute usage
- API calls count
- Network egress
- Total cost

## API Usage Examples

### Check Trading Status

```bash
curl https://your-agent-url.blaxel.app/status
```

### Execute Manual Trade

```bash
curl -X POST https://your-agent-url.blaxel.app/trade \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Buy",
    "confidence": 0.85
  }'
```

### Stop Trading

```bash
curl -X POST https://your-agent-url.blaxel.app/stop
```

### Close All Positions (Emergency)

```bash
curl -X POST https://your-agent-url.blaxel.app/close-all
```

## Scaling & Performance

### Auto-scaling
Blaxel secara otomatis scale agent berdasarkan load:
- Cold start: <25ms
- Concurrent requests: Auto-handled
- Global distribution: Automatic

### Performance Optimization

1. **Region Selection**
   - Blaxel otomatis deploy di region terdekat dengan Bybit
   - Low latency untuk order execution

2. **Memory Allocation**
   - Default: 512MB
   - Bisa ditingkatkan di `blaxel.config.json`:
   ```json
   {
     "agent": {
       "memory": 1024
     }
   }
   ```

3. **Timeout Configuration**
   - Default: 300s (5 minutes)
   - Sesuaikan untuk long-running analysis

## Security Best Practices

### 1. API Keys Management

**JANGAN** hardcode API keys di code. Gunakan Blaxel Secrets:

```bash
# Store sensitive data sebagai secrets
blaxel secrets:set BYBIT_API_SECRET your_secret_value
```

Access di code:
```javascript
const secret = process.env.BYBIT_API_SECRET;
```

### 2. Bybit API Permissions

Di Bybit API settings, **HANYA** enable:
- ✅ Read positions
- ✅ Trade
- ❌ Withdraw (DISABLE!)
- ❌ Transfer (DISABLE!)

### 3. IP Whitelist (Opsional)

Untuk keamanan extra, whitelist Blaxel IPs di Bybit:
```bash
# Get Blaxel egress IPs
blaxel network:info
```

## Troubleshooting

### Agent tidak start

**Cek logs:**
```bash
blaxel logs --tail 100
```

**Periksa:**
- Environment variables sudah set?
- API credentials valid?
- Account balance cukup?

### High Latency

**Solutions:**
- Periksa region deployment
- Increase memory allocation
- Check Bybit API status

### Errors saat deploy

**Common issues:**
- Missing dependencies → Run `npm install`
- Invalid config → Validate `blaxel.config.json`
- Quota exceeded → Check Blaxel billing

## Monitoring & Alerts

### Setup Alerts di Blaxel

1. Go to Dashboard → Alerts
2. Create new alert:
   - **Condition**: `error_rate > 5%`
   - **Action**: Send notification
   - **Channel**: Email/Slack

3. Create performance alert:
   - **Condition**: `response_time > 1000ms`
   - **Action**: Auto-scale or notify

### Custom Metrics

Log custom metrics:
```javascript
// In your code
console.log('METRIC', {
  metric: 'trade_executed',
  value: 1,
  tags: { symbol: 'ETHUSDT', side: 'Buy' }
});
```

View di Blaxel dashboard.

## Cost Optimization

### 1. Use Batch Jobs for Analysis

Untuk analisis data historis, gunakan Batch Jobs:
```bash
blaxel batch:create --script backtest.js
```

Lebih murah untuk long-running tasks.

### 2. Optimize Update Interval

Adjust di `config.js`:
```javascript
ai: {
  updateInterval: 60000, // 1 minute (default)
  // Increase to 300000 (5 min) untuk reduce API calls
}
```

### 3. Monitor API Usage

```bash
blaxel usage:show
```

Track:
- API calls per day
- Compute hours
- Network transfer

## Advanced: MCP Server Integration

Untuk latency yang lebih rendah, create custom MCP server:

### 1. Create MCP Server

File: `mcp-bybit-server.js`
```javascript
const { MCPServer } = require('@blaxel/mcp');

const server = new MCPServer({
  name: 'bybit-connector',
  tools: [
    {
      name: 'get_market_data',
      handler: async (params) => {
        // Fetch from Bybit
      }
    },
    {
      name: 'execute_order',
      handler: async (params) => {
        // Execute order
      }
    }
  ]
});

module.exports = server;
```

### 2. Deploy MCP Server

```bash
blaxel mcp:deploy mcp-bybit-server.js
```

### 3. Connect to Agent

Update agent to use MCP server:
```javascript
const mcpClient = require('@blaxel/mcp-client');

const bybitAPI = mcpClient.connect('bybit-connector');
const data = await bybitAPI.call('get_market_data', { symbol: 'ETHUSDT' });
```

## Rollback & Version Management

### Deploy new version

```bash
blaxel deploy --version v2.0.0
```

### Rollback to previous version

```bash
blaxel rollback --version v1.0.0
```

### List versions

```bash
blaxel versions:list
```

## Support

### Documentation
- Blaxel Docs: https://docs.blaxel.com
- API Reference: https://docs.blaxel.com/api

### Community
- Discord: https://discord.gg/blaxel
- GitHub: https://github.com/blaxel

### Support Ticket
```bash
blaxel support:create --issue "Your issue description"
```

## Next Steps

1. ✅ Deploy ke testnet terlebih dahulu
2. ✅ Monitor performance selama 24-48 jam
3. ✅ Analyze win rate dan metrics
4. ✅ Adjust parameters jika diperlukan
5. ⚠️ Deploy ke live trading (mulai dengan modal kecil)

---

**Selamat trading! 🚀**

*Remember: Always test thoroughly in testnet before going live.*
