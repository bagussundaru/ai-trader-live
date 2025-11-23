# Blaxel AI Trader for Bybit

AI Trading Bot profesional untuk Bybit dengan manajemen risiko tingkat lanjut, dibangun untuk deployment di platform Blaxel.

## Fitur Utama

### 🧠 AI Decision Core
- Analisis teknikal multi-indikator (RSI, MACD, EMA, Bollinger Bands)
- Sistem scoring untuk menghasilkan sinyal trading
- Deteksi support & resistance otomatis
- Analisis trend strength

### 🛡️ Risk Management
- Position sizing otomatis berdasarkan account balance
- Stop-loss dan take-profit otomatis
- Maximum risk per trade: 2%
- Emergency close mechanism
- Maximum 3 posisi bersamaan
- Leverage dibatasi (default: 10x)

### ⚡ Execution Engine
- Koneksi langsung ke Bybit API
- Order execution dengan stop-loss & take-profit
- Real-time position monitoring
- Account balance tracking

### 📊 Performance Tracking
- Win rate calculation
- Sharpe ratio
- Maximum drawdown
- Profit factor
- Trade history logging

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                   Blaxel Platform                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Agent Hosting (Serverless)              │   │
│  │                                                   │   │
│  │  ┌─────────────┐      ┌──────────────┐          │   │
│  │  │ AI Decision │─────>│   Strategy   │          │   │
│  │  │    Core     │      │    Engine    │          │   │
│  │  └─────────────┘      └──────────────┘          │   │
│  │         │                     │                  │   │
│  │         v                     v                  │   │
│  │  ┌─────────────┐      ┌──────────────┐          │   │
│  │  │    Risk     │<─────│  Execution   │          │   │
│  │  │   Manager   │      │    Engine    │          │   │
│  │  └─────────────┘      └──────────────┘          │   │
│  │                              │                   │   │
│  └──────────────────────────────┼───────────────────┘   │
│                                  │                       │
└──────────────────────────────────┼───────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    v                             v
          ┌─────────────────┐          ┌──────────────────┐
          │  Bybit REST API │          │ Bybit WebSocket  │
          └─────────────────┘          └──────────────────┘
```

## Instalasi Lokal

### Prerequisites
- Node.js 18+
- npm atau yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi environment variables di file `.env`:
```env
# Blaxel API Key
BLAXEL_API_KEY=your_blaxel_api_key

# Bybit API Credentials
BYBIT_API_KEY=your_bybit_api_key
BYBIT_API_SECRET=your_bybit_api_secret

# Trading Configuration
USE_TESTNET=true
TRADING_SYMBOL=ETHUSDT
CATEGORY=linear

# Risk Management
MAX_RISK_PER_TRADE=0.02
MAX_LEVERAGE=10
POSITION_SIZE_PERCENT=0.05
STOP_LOSS_PERCENT=0.02
TAKE_PROFIT_PERCENT=0.04
```

3. Jalankan bot:
```bash
npm start
```

## Deployment di Blaxel

### 1. Persiapan

Install Blaxel CLI:
```bash
npm install -g @blaxel/cli
```

Login ke Blaxel:
```bash
blaxel login
```

### 2. Deploy Agent

Deploy sebagai Agent Hosting:
```bash
blaxel deploy
```

Blaxel akan membaca konfigurasi dari `blaxel.config.json` dan men-deploy agent Anda sebagai serverless function.

### 3. Set Environment Variables

Set environment variables di Blaxel dashboard:
```bash
blaxel env:set BYBIT_API_KEY=your_key
blaxel env:set BYBIT_API_SECRET=your_secret
blaxel env:set BLAXEL_API_KEY=your_blaxel_key
blaxel env:set USE_TESTNET=true
```

### 4. Start Trading

Panggil endpoint untuk memulai trading:
```bash
curl -X POST https://your-agent-url.blaxel.app/start
```

## API Endpoints

### Initialize Agent
```
POST /initialize
```
Inisialisasi trading agent.

### Start Trading
```
POST /start
```
Mulai automated trading.

### Stop Trading
```
POST /stop
```
Hentikan automated trading.

### Get Status
```
GET /status
```
Mendapatkan status trading saat ini, metrics, dan posisi.

Response:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "riskMetrics": {
      "accountBalance": 1000.00,
      "openPositions": 1,
      "totalExposure": 500.00
    },
    "performance": {
      "winRate": "65.00%",
      "netProfit": "150.00",
      "sharpeRatio": "1.85"
    }
  }
}
```

### Execute Manual Trade
```
POST /trade
Content-Type: application/json

{
  "action": "Buy",
  "confidence": 0.8
}
```

### Close All Positions
```
POST /close-all
```

### Health Check
```
GET /health
```

## Risk Management Rules

### Position Sizing
- Maksimal 5% dari account balance per posisi
- Leverage dibatasi maksimal 10x
- Hanya mengambil sinyal dengan confidence >60%

### Stop Loss & Take Profit
- Stop Loss otomatis: 2% dari entry price
- Take Profit otomatis: 4% dari entry price
- Tidak ada trading tanpa stop loss

### Safety Mechanisms
- Emergency close jika exposure >90% account
- Maksimal 3 posisi terbuka bersamaan
- Cooldown 5 menit antara sinyal
- Validasi setiap trade oleh Risk Manager

## Monitoring dengan Blaxel Observability

Blaxel menyediakan observability lengkap:

1. **Logs**: Semua aktivitas trading tercatat
2. **Metrics**: Performance metrics real-time
3. **Traces**: Tracking setiap decision flow

Akses dashboard observability di:
```
https://dashboard.blaxel.com/observability
```

## Testing

### Testnet Mode
Selalu test di testnet terlebih dahulu:
```env
USE_TESTNET=true
```

### Backtest
Jalankan backtest dengan data historis:
```bash
npm test
```

## Keamanan

### API Keys
- **JANGAN** commit file `.env` ke repository
- Gunakan Blaxel Secrets Management untuk menyimpan API keys
- Hanya berikan permission "Trade" pada Bybit API, **TIDAK** "Withdraw"

### Network
- Blaxel Global Agentics Network memastikan koneksi low-latency
- Traffic terenkripsi end-to-end

### Isolation
- Sandboxes Blaxel mengisolasi execution environment
- Setiap agent berjalan di VM terpisah

## Support & Monitoring

### Performance Metrics
Bot secara otomatis melacak:
- Win rate
- Profit/Loss
- Sharpe ratio
- Maximum drawdown
- Consecutive wins/losses

### Logs
Semua trade dicatat di:
```
logs/trades.jsonl
```

Export report:
```javascript
// Di code Anda
performanceTracker.exportReport();
```

## Troubleshooting

### Bot tidak trading
1. Cek balance di account
2. Pastikan data market sudah tersedia (tunggu 1-2 menit)
3. Cek confidence threshold signal (harus >60%)
4. Periksa logs untuk error

### Posisi tidak terbuka
1. Periksa Risk Manager logs
2. Cek apakah sudah ada 3 posisi terbuka
3. Pastikan balance cukup untuk position size

### Koneksi error
1. Cek API key dan secret
2. Pastikan API key memiliki permission "Trade"
3. Periksa network connectivity

## Konfigurasi Lanjutan

Edit [src/config/config.js](src/config/config.js) untuk:
- Mengubah indikator teknikal
- Adjust risk parameters
- Modify update interval
- Customize trading logic

## Disclaimer

⚠️ **PERINGATAN**: Trading cryptocurrency sangat berisiko. Bot ini untuk tujuan edukasi dan eksperimen. Selalu:
- Mulai dengan modal kecil
- Test di testnet terlebih dahulu
- Pantau bot secara berkala
- Jangan investasikan uang yang tidak mampu Anda kehilangan

## License

MIT

## Contact

Untuk pertanyaan dan support, hubungi tim Blaxel di:
- Documentation: https://docs.blaxel.com
- GitHub: https://github.com/blaxel
