# 🔧 Integration Guide - Upgrade to v2.0

## Quick Migration dari v1.0 ke v2.0

### Step 1: Update package.json dependencies

Tidak ada dependencies baru yang diperlukan! Semua menggunakan library yang sudah ada.

### Step 2: Create new main file untuk Enhanced version

Create [src/index-enhanced.js](src/index-enhanced.js):

```javascript
const DataEngine = require('./engines/DataEngine');
const ExecutionEngine = require('./engines/ExecutionEngine');
const StrategyEngine = require('./engines/StrategyEngine');
const DynamicRiskManager = require('./managers/DynamicRiskManager'); // NEW
const EnhancedAIDecisionCore = require('./ai/EnhancedAIDecisionCore'); // NEW
const OrderFlowEngine = require('./engines/OrderFlowEngine'); // NEW
const MacroFundamentalEngine = require('./engines/MacroFundamentalEngine'); // NEW
const SentimentOnChainEngine = require('./engines/SentimentOnChainEngine'); // NEW
const PerformanceTracker = require('./trackers/PerformanceTracker');
const config = require('./config/config');

class EnhancedBlaxelAITrader {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;

    // Initialize NEW engines
    this.orderFlowEngine = new OrderFlowEngine();
    this.macroEngine = new MacroFundamentalEngine();
    this.sentimentEngine = new SentimentOnChainEngine();

    // Initialize components with enhanced features
    this.riskManager = new DynamicRiskManager(); // Dynamic instead of static
    this.aiCore = new EnhancedAIDecisionCore(
      this.orderFlowEngine,
      this.macroEngine,
      this.sentimentEngine
    );

    this.dataEngine = new DataEngine();
    this.executionEngine = new ExecutionEngine(this.riskManager);
    this.strategyEngine = new StrategyEngine(this.aiCore, this.executionEngine);
    this.performanceTracker = new PerformanceTracker();

    // Connect components
    this.strategyEngine.setDataEngine(this.dataEngine);
    this.setupEventHandlers();
  }

  async initialize() {
    try {
      console.log('\n========================================');
      console.log('🚀 ENHANCED BLAXEL AI TRADER v2.0');
      console.log('========================================');
      console.log('Features:');
      console.log('  ✓ Multi-Factor Analysis (5 factors)');
      console.log('  ✓ Market Regime Detection');
      console.log('  ✓ Order Flow Analysis');
      console.log('  ✓ Macro Fundamental Tracking');
      console.log('  ✓ Sentiment & On-Chain Metrics');
      console.log('  ✓ Dynamic ATR-based Risk Management');
      console.log('========================================');
      console.log(`Trading Pair: ${config.trading.symbol}`);
      console.log(`Mode: ${config.bybit.testnet ? 'TESTNET' : 'LIVE'}`);
      console.log('========================================\n');

      // Initialize execution engine
      console.log('[Enhanced] Initializing Execution Engine...');
      await this.executionEngine.initialize();

      // Initialize data engine
      console.log('[Enhanced] Initializing Data Engine...');
      this.dataEngine.initialize();

      this.isInitialized = true;
      console.log('\n[Enhanced] ✓ All systems initialized\n');

    } catch (error) {
      console.error('[Enhanced] Initialization error:', error.message);
      throw error;
    }
  }

  setupEventHandlers() {
    this.dataEngine.subscribe((data) => {
      // Real-time updates
    });

    process.on('SIGINT', async () => {
      console.log('\n[Enhanced] Shutdown signal received...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n[Enhanced] Termination signal received...');
      await this.shutdown();
      process.exit(0);
    });
  }

  async start() {
    if (!this.isInitialized) {
      throw new Error('Trader not initialized');
    }

    if (this.isRunning) {
      console.log('[Enhanced] Already running');
      return;
    }

    console.log('[Enhanced] Starting Enhanced AI Trader...\n');
    this.isRunning = true;

    this.strategyEngine.start();

    this.summaryInterval = setInterval(() => {
      this.performanceTracker.printSummary();
      this.printEnhancedStatus();
    }, 5 * 60 * 1000);

    console.log('[Enhanced] ✓ Enhanced AI Trader running\n');
  }

  async stop() {
    console.log('[Enhanced] Stopping...');
    this.isRunning = false;
    this.strategyEngine.stop();

    if (this.summaryInterval) {
      clearInterval(this.summaryInterval);
    }

    console.log('[Enhanced] Stopped');
  }

  async shutdown() {
    console.log('\n[Enhanced] Shutting down...');
    await this.stop();
    this.performanceTracker.exportReport();
    this.performanceTracker.printSummary();
    this.dataEngine.close();
    console.log('[Enhanced] Shutdown complete');
  }

  printEnhancedStatus() {
    console.log('\n========== ENHANCED STATUS ==========');
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`Running: ${this.isRunning ? 'Yes' : 'No'}`);

    const riskMetrics = this.riskManager.getRiskMetrics();
    console.log(`Account: $${riskMetrics.accountBalance.toFixed(2)}`);
    console.log(`Positions: ${riskMetrics.openPositions}`);
    console.log(`Current ATR: ${riskMetrics.currentATR?.toFixed(2) || 'N/A'}`);
    console.log(`Regime Multiplier: ${riskMetrics.regimeMultiplier.toFixed(2)}x`);

    console.log('====================================\n');
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      version: '2.0-enhanced',
      strategyStatus: this.strategyEngine.getStatus(),
      riskMetrics: this.riskManager.getRiskMetrics(),
      performance: this.performanceTracker.getMetrics(),
      marketData: {
        price: this.dataEngine.getCurrentPrice(),
        symbol: config.trading.symbol
      },
      enhancedFeatures: {
        orderFlow: this.orderFlowEngine.getData(),
        macroSignal: this.macroEngine.getCurrentSignal(),
        sentimentData: this.sentimentEngine.sentimentData
      }
    };
  }

  async executeManualTrade(action, confidence = 0.8) {
    const signal = {
      action,
      confidence,
      manual: true
    };

    const currentPrice = this.dataEngine.getCurrentPrice();
    return await this.executionEngine.executeSignal(signal, currentPrice);
  }

  async closeAllPositions() {
    return await this.executionEngine.closeAllPositions();
  }
}

// Main execution
async function main() {
  const trader = new EnhancedBlaxelAITrader();

  try {
    await trader.initialize();
    await trader.start();

    console.log('[Enhanced] Press Ctrl+C to stop\n');

  } catch (error) {
    console.error('[Enhanced] Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnhancedBlaxelAITrader;
```

### Step 3: Update StrategyEngine untuk Enhanced AI

Edit [src/engines/StrategyEngine.js](src/engines/StrategyEngine.js), update `executeStrategy()`:

```javascript
async executeStrategy() {
  try {
    if (!this.isRunning) return;

    console.log('\n[Strategy] Executing cycle...');

    // Update account
    const accountSummary = await this.executionEngine.getAccountSummary();
    console.log(`[Strategy] Balance: $${accountSummary.balance.toFixed(2)}`);

    // Emergency check
    if (this.executionEngine.riskManager.shouldEmergencyClose()) {
      console.error('[Strategy] EMERGENCY CLOSE!');
      await this.executionEngine.closeAllPositions();
      return;
    }

    const marketData = this.dataEngine?.getMarketData();
    if (!marketData || !marketData.price) {
      console.log('[Strategy] Waiting for data...');
      return;
    }

    // Enhanced analysis (if available)
    let signal;
    if (this.aiCore.analyzeEnhanced) {
      console.log('[Strategy] Using ENHANCED multi-factor analysis');
      signal = await this.aiCore.analyzeEnhanced(marketData);
    } else {
      console.log('[Strategy] Using basic technical analysis');
      signal = this.aiCore.analyze(marketData);
    }

    if (!signal) {
      console.log('[Strategy] No signal generated');
      return;
    }

    // Handle signal
    await this.handleSignal(signal, marketData.price);

  } catch (error) {
    console.error('[Strategy] Execution error:', error.message);
  }
}
```

### Step 4: Update ExecutionEngine untuk Dynamic Risk

Edit [src/engines/ExecutionEngine.js](src/engines/ExecutionEngine.js), update `executeSignal()`:

```javascript
async executeSignal(signal, currentPrice) {
  try {
    console.log(`\n[Execution] Processing signal: ${signal.action}`);

    // Get market data for ATR calculation
    const marketData = this.dataEngine?.getMarketData();

    // Dynamic risk approval (if available)
    let approval;
    if (this.riskManager.approveTrade && marketData) {
      approval = this.riskManager.approveTrade(signal, currentPrice, marketData);
    } else {
      // Fallback to old method
      approval = {
        approved: this.riskManager.approveTrade(signal, currentPrice),
        parameters: {
          quantity: this.riskManager.calculatePositionSize(currentPrice),
          stopLoss: this.riskManager.calculateStopLoss(currentPrice, signal.action),
          takeProfit: this.riskManager.calculateTakeProfit(currentPrice, signal.action)
        }
      };
    }

    if (!approval.approved) {
      console.log('[Execution] Trade rejected:', approval.reason);
      return { success: false, reason: approval.reason };
    }

    const params = approval.parameters;

    console.log(`[Execution] Trade approved:`);
    console.log(`  Quantity: ${params.quantity}`);
    console.log(`  Entry: $${currentPrice.toFixed(2)}`);
    console.log(`  Stop Loss: $${params.stopLoss.toFixed(2)}`);
    console.log(`  Take Profit: $${params.takeProfit.toFixed(2)}`);
    if (params.riskReward) {
      console.log(`  Risk/Reward: 1:${params.riskReward.toFixed(2)}`);
    }
    if (params.atr) {
      console.log(`  ATR: ${params.atr.toFixed(2)} (${params.atrPercent.toFixed(2)}%)`);
    }

    // Execute
    const orderResult = await this.placeOrder({
      side: signal.action,
      orderType: 'Market',
      qty: params.quantity.toString(),
      stopLoss: params.stopLoss.toString(),
      takeProfit: params.takeProfit.toString()
    });

    if (orderResult.success) {
      console.log(`[Execution] ✓ Order executed: ${orderResult.orderId}`);
      this.logOrder({
        timestamp: Date.now(),
        signal,
        orderResult,
        parameters: params
      });

      await this.updatePositions();
      await this.updateAccountInfo();
    }

    return orderResult;

  } catch (error) {
    console.error('[Execution] Error:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Step 5: Update package.json scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "start:enhanced": "node src/index-enhanced.js",
    "test": "node test-local.js",
    "test:enhanced": "node test-enhanced.js",
    "check": "node scripts/check-account.js"
  }
}
```

### Step 6: Create test file for enhanced version

Create `test-enhanced.js`:

```javascript
const EnhancedBlaxelAITrader = require('./src/index-enhanced');

async function testEnhanced() {
  console.log('🧪 Testing Enhanced AI Trader v2.0...\n');

  const trader = new EnhancedBlaxelAITrader();

  try {
    await trader.initialize();

    console.log('\n✓ Initialization successful');
    console.log('✓ All engines loaded:');
    console.log('  - Enhanced AI Decision Core');
    console.log('  - Order Flow Engine');
    console.log('  - Macro Fundamental Engine');
    console.log('  - Sentiment & On-Chain Engine');
    console.log('  - Dynamic Risk Manager');
    console.log('  - Market Regime Detector');

    await trader.start();

    console.log('\n📊 Bot running in enhanced mode');
    console.log('Press Ctrl+C to stop\n');

    setInterval(async () => {
      const status = await trader.getStatus();
      console.log('\n--- Enhanced Status ---');
      console.log(`Time: ${new Date().toLocaleString()}`);
      console.log(`Price: $${status.marketData.price}`);
      console.log(`Positions: ${status.riskMetrics.openPositions}`);

      if (status.enhancedFeatures.macroSignal) {
        console.log(`Macro Signal: ${status.enhancedFeatures.macroSignal.signal}`);
      }

      console.log('----------------------\n');
    }, 60000); // Every minute

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testEnhanced();
```

---

## 🎯 Usage

### Run Enhanced Version

```bash
npm run start:enhanced
```

### Run Original Version (backward compatible)

```bash
npm start
```

### Test Enhanced Version

```bash
npm run test:enhanced
```

---

## 🔄 Gradual Migration Strategy

### Week 1: Test Enhanced with Mock Data
- Run `test:enhanced`
- Observe multi-factor analysis
- Check regime detection
- Verify no errors

### Week 2: Enable Order Flow
- Connect to Bybit API
- Test CVD, OI, Funding analysis
- Verify signals make sense

### Week 3: Enable Macro & Sentiment
- Configure external APIs (optional)
- Or use mock data
- Test full multi-factor model

### Week 4: Live Testnet
- Deploy enhanced version to testnet
- Monitor for 1 week minimum
- Compare metrics with v1.0

### Week 5+: Go Live
- If metrics better than v1.0
- Deploy to live with small capital
- Gradually increase

---

## ⚙️ Configuration

### Adjust Factor Weights

Edit [src/ai/EnhancedAIDecisionCore.js](src/ai/EnhancedAIDecisionCore.js):

```javascript
this.weights = {
  technical: 0.30,     // Increase technical weight
  regime: 0.15,        // Reduce regime
  orderFlow: 0.25,
  macro: 0.15,
  sentiment: 0.15
};
```

### Adjust Confidence Threshold

```javascript
const confidenceThreshold = 0.70; // More selective (fewer trades)
// OR
const confidenceThreshold = 0.60; // More trades
```

### Enable/Disable Specific Factors

```javascript
// To disable a factor, set weight to 0:
this.weights = {
  technical: 0.40,
  regime: 0.30,
  orderFlow: 0.30,
  macro: 0.00,        // Disabled
  sentiment: 0.00     // Disabled
};
```

---

## 📊 Monitoring Enhanced Features

### Check Regime

```javascript
const regime = trader.aiCore.regimeDetector.getCurrentRegime();
console.log('Current Regime:', regime.regime);
console.log('Recommended Action:', regime.action);
```

### Check Order Flow

```javascript
const orderFlow = await trader.orderFlowEngine.analyze();
console.log('Funding Rate:', orderFlow.data.funding.rate);
console.log('OI Change:', orderFlow.data.openInterest.change);
```

### Check Macro

```javascript
const macro = await trader.macroEngine.analyze();
console.log('Macro Signal:', macro.signal);
console.log('DXY:', macro.data.dxy);
```

---

## 🐛 Troubleshooting

### Issue: Enhanced features not working

**Solution**: Make sure you're running `index-enhanced.js`, not `index.js`

### Issue: API errors for macro/sentiment data

**Solution**: System works with mock data. To use real data, configure APIs in respective engine files.

### Issue: Different signals than v1.0

**Expected**: v2.0 is more selective. It filters out many trades that v1.0 would take.

---

## ✅ Verification Checklist

- [ ] All new files created
- [ ] `index-enhanced.js` created
- [ ] `test-enhanced.js` created
- [ ] package.json updated
- [ ] StrategyEngine updated
- [ ] ExecutionEngine updated
- [ ] Test runs without errors
- [ ] Regime detection working
- [ ] Order flow fetching data
- [ ] Multi-factor signals generating

---

## 🎊 Success!

You now have both versions:
- **v1.0** (Basic): Original technical-only system
- **v2.0** (Enhanced): Multi-factor institutional model

Choose which to run based on your testing results!

---

*Integration Guide v2.0*
*Last Updated: 2025-11-23*
