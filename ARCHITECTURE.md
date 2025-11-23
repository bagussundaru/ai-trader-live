# 🏗️ Arsitektur Sistem Blaxel AI Trader

## Overview

Blaxel AI Trader adalah sistem trading otomatis yang menggabungkan analisis teknikal AI, manajemen risiko profesional, dan eksekusi otomatis di Bybit exchange.

## Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         BLAXEL PLATFORM                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Agent Hosting (Serverless)                     │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              BLAXEL AI TRADER                         │  │ │
│  │  │                                                        │  │ │
│  │  │  ┌─────────────┐        ┌──────────────┐            │  │ │
│  │  │  │   Data      │───────>│ AI Decision  │            │  │ │
│  │  │  │   Engine    │  Data  │    Core      │            │  │ │
│  │  │  └─────────────┘        └──────────────┘            │  │ │
│  │  │        │                       │                     │  │ │
│  │  │        │ Market Data           │ Signals             │  │ │
│  │  │        v                       v                     │  │ │
│  │  │  ┌─────────────┐        ┌──────────────┐            │  │ │
│  │  │  │  WebSocket  │        │   Strategy   │            │  │ │
│  │  │  │  Connector  │        │    Engine    │            │  │ │
│  │  │  └─────────────┘        └──────────────┘            │  │ │
│  │  │                                │                     │  │ │
│  │  │                                │ Trade Decisions     │  │ │
│  │  │                                v                     │  │ │
│  │  │                         ┌──────────────┐            │  │ │
│  │  │    ┌───────────────────>│     Risk     │<────┐      │  │ │
│  │  │    │    Validate        │   Manager    │Check│      │  │ │
│  │  │    │                    └──────────────┘     │      │  │ │
│  │  │    │                           │             │      │  │ │
│  │  │    │                           │ Approved    │      │  │ │
│  │  │    │                           v             │      │  │ │
│  │  │    │                    ┌──────────────┐     │      │  │ │
│  │  │    │                    │  Execution   │─────┘      │  │ │
│  │  │    │                    │    Engine    │            │  │ │
│  │  │    │                    └──────────────┘            │  │ │
│  │  │    │                           │                     │  │ │
│  │  │    │                           │ Orders              │  │ │
│  │  │    │                           v                     │  │ │
│  │  │    │                    ┌──────────────┐            │  │ │
│  │  │    └────────────────────│ Performance  │            │  │ │
│  │  │         Record          │   Tracker    │            │  │ │
│  │  │                         └──────────────┘            │  │ │
│  │  │                                                      │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Observability Layer                      │ │
│  │  [Logs] [Metrics] [Traces] [Alerts] [Dashboard]           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              v
              ┌───────────────────────────────┐
              │        BYBIT EXCHANGE          │
              │                                │
              │  ┌──────────┐  ┌───────────┐  │
              │  │   REST   │  │ WebSocket │  │
              │  │   API    │  │    API    │  │
              │  └──────────┘  └───────────┘  │
              │                                │
              │  • Market Data                 │
              │  • Order Execution             │
              │  • Account Info                │
              └───────────────────────────────┘
```

## Komponen Utama

### 1. Data Engine

**Tanggung Jawab:**
- Koneksi ke Bybit WebSocket untuk data real-time
- Mengumpulkan price, volume, order book
- Menyimpan historical klines (candlestick data)
- Publish data ke subscribers

**File:** [src/engines/DataEngine.js](src/engines/DataEngine.js)

**Input:**
- Bybit WebSocket streams (ticker, kline, orderbook)

**Output:**
- Market data structure dengan price, volume, klines
- Real-time updates ke Strategy Engine

**Dependencies:**
- `bybit-api` WebSocket client
- Configuration dari config.js

---

### 2. AI Decision Core

**Tanggung Jawab:**
- Analisis teknikal menggunakan multiple indicators
- Menghitung RSI, MACD, EMA, Bollinger Bands
- Scoring system untuk generate signals
- Confidence calculation

**File:** [src/ai/AIDecisionCore.js](src/ai/AIDecisionCore.js)

**Input:**
- Market data (klines, price, volume)

**Output:**
- Trading signals: { action, confidence, reasons }
- Action: "Buy", "Sell", atau "Hold"
- Confidence: 0.0 - 1.0

**Indicators:**
- RSI (14 period)
- MACD (12, 26, 9)
- EMA (9, 21, 50)
- Bollinger Bands (20, 2)
- Trend Strength

**Scoring System:**
```javascript
Bullish/Bearish Score (max 100 points):
- RSI: 30 points
- MACD: 25 points
- EMA Trend: 20 points
- Bollinger Bands: 15 points
- Trend Strength: 10 points

Confidence = max(bullishScore, bearishScore) / 100
Signal = "Buy" if bullishScore > bearishScore && confidence > 0.6
Signal = "Sell" if bearishScore > bullishScore && confidence > 0.6
Signal = "Hold" otherwise
```

---

### 3. Risk Manager

**Tanggung Jawab:**
- Validasi setiap trade sebelum eksekusi
- Position sizing berdasarkan account balance
- Calculate stop-loss dan take-profit
- Emergency close mechanism
- Risk exposure monitoring

**File:** [src/managers/RiskManager.js](src/managers/RiskManager.js)

**Risk Rules:**
```javascript
1. Max Risk per Trade: 2% of account
2. Position Size: 5% of account balance
3. Stop Loss: 2% from entry price
4. Take Profit: 4% from entry price
5. Max Positions: 3 concurrent
6. Max Leverage: 10x
7. Min Signal Confidence: 60%
8. Emergency Close: if exposure > 90% account
```

**Validation Checks:**
- ✓ Account balance valid
- ✓ Max positions not exceeded
- ✓ Risk exposure within limits
- ✓ Signal confidence sufficient

---

### 4. Strategy Engine

**Tanggung Jawab:**
- Orchestrate trading loop
- Coordinate AI analysis dengan execution
- Manage existing positions
- Decision making untuk open/close positions

**File:** [src/engines/StrategyEngine.js](src/engines/StrategyEngine.js)

**Flow:**
```
Every 60 seconds:
1. Update account info & positions
2. Get market data from Data Engine
3. Analyze with AI Decision Core
4. If signal generated:
   a. Check with Risk Manager
   b. If approved → Execute via Execution Engine
   c. If rejected → Log reason
5. Manage existing positions
   - Check for reverse signals
   - Monitor PnL
```

---

### 5. Execution Engine

**Tanggung Jawab:**
- Komunikasi langsung dengan Bybit REST API
- Submit market orders
- Set stop-loss & take-profit
- Position management
- Account balance tracking

**File:** [src/engines/ExecutionEngine.js](src/engines/ExecutionEngine.js)

**Methods:**
- `executeSignal()` - Execute trade dari signal
- `placeOrder()` - Submit order ke Bybit
- `closePosition()` - Close specific position
- `closeAllPositions()` - Emergency close all
- `updateAccountInfo()` - Sync account balance
- `updatePositions()` - Sync open positions

**Order Flow:**
```
1. Receive signal from Strategy Engine
2. Validate with Risk Manager
3. Calculate position parameters:
   - Quantity (from position sizing)
   - Stop Loss price
   - Take Profit price
4. Submit Market Order to Bybit
5. Attach SL/TP to order
6. Update position tracking
7. Log order history
```

---

### 6. Performance Tracker

**Tanggung Jawab:**
- Record semua trades
- Calculate performance metrics
- Generate reports
- Track win rate, Sharpe ratio, drawdown

**File:** [src/trackers/PerformanceTracker.js](src/trackers/PerformanceTracker.js)

**Metrics:**
- Total Trades
- Win Rate
- Net Profit/Loss
- Profit Factor
- Sharpe Ratio
- Maximum Drawdown
- Largest Win/Loss
- Consecutive Wins/Losses

**Output:**
- Trade logs: `logs/trades.jsonl`
- Performance reports: `logs/report_*.json`

---

## Data Flow

### Trading Flow

```
1. Market Data Collection
   WebSocket → Data Engine → Store klines

2. Signal Generation
   Data Engine → AI Decision Core → Analyze → Generate Signal

3. Risk Validation
   Signal → Risk Manager → Validate → Approve/Reject

4. Order Execution
   Approved Signal → Execution Engine → Bybit API → Order Placed

5. Position Management
   Strategy Engine → Monitor Position → Check Exit Conditions

6. Performance Tracking
   Trade Result → Performance Tracker → Update Metrics → Log
```

### Information Flow

```
┌──────────┐
│  Market  │
│   Data   │
└────┬─────┘
     │
     ├─────> AI Analysis ──────> Signal
     │                             │
     │                             v
     │                      Risk Validation
     │                             │
     │                             v
     └─────> Position Info ───> Execute Decision
                                   │
                                   v
                            Bybit API Call
                                   │
                                   v
                            Update Positions
                                   │
                                   v
                            Track Performance
```

## Deployment di Blaxel

### Blaxel Components Usage

```
┌─────────────────────┬──────────────────────────────────┐
│ Blaxel Component    │ Usage                            │
├─────────────────────┼──────────────────────────────────┤
│ Agent Hosting       │ Main bot logic (serverless)      │
│ Sandboxes           │ Isolated execution environment   │
│ Model Gateway       │ Future: LLM for sentiment        │
│ MCP Servers         │ Future: Custom Bybit connector   │
│ Observability       │ Logs, metrics, traces, alerts    │
│ Batch Jobs          │ Future: Backtesting, analysis    │
└─────────────────────┴──────────────────────────────────┘
```

### Deployment Architecture

```
Developer Machine
     │
     │ git push / blaxel deploy
     v
Blaxel Platform
     │
     ├─> Build & Package
     │
     ├─> Deploy to Global Network
     │   (Auto-scaling, Low latency)
     │
     └─> Expose HTTP Endpoints
         /initialize
         /start
         /stop
         /status
         /trade
         /close-all
         /health
```

## Security Architecture

### API Key Management

```
Environment Variables (Blaxel Secrets)
     │
     ├─> BYBIT_API_KEY (Read-only at runtime)
     ├─> BYBIT_API_SECRET (Encrypted)
     └─> BLAXEL_API_KEY
```

### Permission Model

```
Bybit API Permissions:
  ✅ Read Account
  ✅ Read Positions
  ✅ Trade (Market/Limit Orders)
  ✅ Manage Orders
  ❌ Withdraw (DISABLED!)
  ❌ Transfer (DISABLED!)
```

### Network Security

```
Blaxel Agent
     │ (Encrypted HTTPS)
     v
Bybit API
     │
     └─> Optional: IP Whitelist
```

## Error Handling

### Failure Recovery

```
Error Type          → Action
─────────────────────────────────────────
WebSocket Disconnect → Auto-reconnect
API Error           → Retry with backoff
Insufficient Balance → Stop trading, alert
Risk Limit Exceeded → Reject trade, log
Emergency Condition → Close all positions
```

### Logging Strategy

```
Level     │ Use Case
──────────┼─────────────────────────────
INFO      │ Normal operations, signals
WARN      │ Risk rejections, retries
ERROR     │ API errors, failures
CRITICAL  │ Emergency closes, crashes
```

## Performance Considerations

### Latency Optimization

```
Component              │ Latency
───────────────────────┼─────────────
WebSocket Data         │ <10ms
AI Analysis            │ <100ms
Risk Validation        │ <5ms
Order Execution        │ <200ms
Total Signal→Order     │ <500ms
```

### Resource Usage

```
Component              │ Resource
───────────────────────┼─────────────
Data Engine            │ Memory: ~50MB
AI Decision Core       │ CPU: Low
Execution Engine       │ Network: Medium
Performance Tracker    │ Disk: ~10MB/day
```

## Scalability

### Horizontal Scaling

Blaxel Agent Hosting otomatis scale berdasarkan:
- Request volume
- Resource usage
- Geographic distribution

### Vertical Scaling

Adjust di `blaxel.config.json`:
```json
{
  "agent": {
    "memory": 512,  // Increase if needed
    "timeout": 300
  }
}
```

## Monitoring & Observability

### Metrics to Monitor

```
Trading Metrics:
- Signals per hour
- Trades executed
- Win rate
- PnL
- Position count

System Metrics:
- API latency
- Error rate
- WebSocket uptime
- Memory usage
```

### Alerting Conditions

```
Alert If:
- Error rate > 5%
- No signals for 1 hour
- Position PnL < -10%
- API connection down
- Account balance drop > 20%
```

## Future Enhancements

### Planned Features

1. **Sentiment Analysis**
   - Integrate LLM via Model Gateway
   - Analyze crypto news/social media
   - Combine with technical analysis

2. **Custom MCP Server**
   - Dedicated Bybit connector
   - Lower latency
   - Better error handling

3. **Backtesting Engine**
   - Use Blaxel Batch Jobs
   - Historical data analysis
   - Strategy optimization

4. **Multi-Exchange Support**
   - Abstract exchange interface
   - Support Binance, OKX, etc.
   - Arbitrage opportunities

5. **Advanced ML Models**
   - LSTM price prediction
   - Reinforcement learning
   - Pattern recognition

---

## File Structure

```
blaxel-ai-trader/
├── src/
│   ├── ai/
│   │   ├── AIDecisionCore.js       # AI analysis & signals
│   │   └── TechnicalIndicators.js  # Technical analysis tools
│   ├── config/
│   │   └── config.js                # Configuration
│   ├── engines/
│   │   ├── DataEngine.js            # Market data collection
│   │   ├── ExecutionEngine.js       # Order execution
│   │   └── StrategyEngine.js        # Trading strategy logic
│   ├── managers/
│   │   └── RiskManager.js           # Risk management
│   ├── trackers/
│   │   └── PerformanceTracker.js    # Performance metrics
│   └── index.js                     # Main entry point
├── scripts/
│   └── check-account.js             # Account verification
├── blaxel-agent.js                  # Blaxel wrapper
├── blaxel.config.json               # Blaxel deployment config
├── test-local.js                    # Local testing
├── .env                             # Environment variables
├── package.json                     # Dependencies
├── README.md                        # Main documentation
├── QUICKSTART.md                    # Quick start guide
├── DEPLOYMENT_GUIDE.md              # Deployment guide
└── ARCHITECTURE.md                  # This file
```

---

**Dibuat untuk deployment di Blaxel Platform**

*Versi: 1.0.0*
