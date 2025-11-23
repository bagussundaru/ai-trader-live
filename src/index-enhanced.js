const DataEngine = require('./engines/DataEngine');
const ExecutionEngine = require('./engines/ExecutionEngine');
const StrategyEngine = require('./engines/StrategyEngine');
const DynamicRiskManager = require('./managers/DynamicRiskManager');
const EnhancedAIDecisionCore = require('./ai/EnhancedAIDecisionCore');
const OrderFlowEngine = require('./engines/OrderFlowEngine');
const MacroFundamentalEngine = require('./engines/MacroFundamentalEngine');
const SentimentOnChainEngine = require('./engines/SentimentOnChainEngine');
const PerformanceTracker = require('./trackers/PerformanceTracker');
const ApiServer = require('./api/ApiServer');
const config = require('./config/config');

/**
 * Enhanced Blaxel AI Trader v2.0
 *
 * Multi-Factor Institutional-Grade Trading System
 *
 * Features:
 * - Market Regime Detection
 * - Order Flow Analysis (CVD, OI, Funding)
 * - Macro Fundamental Tracking (DXY, US10Y, ETF)
 * - Sentiment & On-Chain (Fear/Greed, NUPL, MVRV)
 * - Dynamic ATR-based Risk Management
 * - Multi-Factor Weighted Decision Model
 */
class EnhancedBlaxelAITrader {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;

    console.log('🚀 Initializing Enhanced AI Trader v2.0...');

    // Initialize enhanced engines
    this.orderFlowEngine = new OrderFlowEngine();
    this.macroEngine = new MacroFundamentalEngine();
    this.sentimentEngine = new SentimentOnChainEngine();

    // Initialize dynamic risk manager
    this.riskManager = new DynamicRiskManager();

    // Initialize enhanced AI core with all engines
    this.aiCore = new EnhancedAIDecisionCore(
      this.orderFlowEngine,
      this.macroEngine,
      this.sentimentEngine
    );

    // Initialize data and execution engines
    this.dataEngine = new DataEngine();
    this.executionEngine = new ExecutionEngine(this.riskManager);

    // Initialize strategy engine with enhanced AI
    this.strategyEngine = new StrategyEngine(this.aiCore, this.executionEngine);

    // Initialize performance tracker
    this.performanceTracker = new PerformanceTracker();

    // Initialize API server for dashboard
    this.apiServer = new ApiServer(this);

    // Connect components
    this.strategyEngine.setDataEngine(this.dataEngine);

    // Override strategy execution with enhanced mode
    this.enhanceStrategyEngine();

    this.setupEventHandlers();

    // Track data for dashboard
    this.lastSignal = null;
    this.lastAnalysis = null;
    this.recentLogs = [];
  }

  /**
   * Enhance strategy engine to use multi-factor analysis
   */
  enhanceStrategyEngine() {
    const originalExecuteStrategy = this.strategyEngine.executeStrategy.bind(this.strategyEngine);

    this.strategyEngine.executeStrategy = async () => {
      try {
        if (!this.strategyEngine.isRunning) return;

        console.log('\n[Enhanced Strategy] 🔄 Executing cycle...');

        // Update account and positions
        const accountSummary = await this.executionEngine.getAccountSummary();
        console.log(`[Enhanced Strategy] 💰 Balance: $${accountSummary.balance.toFixed(2)} | Positions: ${accountSummary.positions}`);

        // Emergency check
        if (this.riskManager.shouldEmergencyClose()) {
          console.error('[Enhanced Strategy] 🚨 EMERGENCY CLOSE TRIGGERED!');
          await this.executionEngine.closeAllPositions();
          return;
        }

        // Get market data
        const marketData = this.dataEngine?.getMarketData();
        if (!marketData || !marketData.price) {
          console.log('[Enhanced Strategy] ⏳ Waiting for market data...');
          return;
        }

        // Use enhanced multi-factor analysis
        console.log('[Enhanced Strategy] 🧠 Running multi-factor analysis...');
        const signal = await this.aiCore.analyzeEnhanced(marketData);

        if (!signal) {
          console.log('[Enhanced Strategy] ⚠️ No signal generated');
          return;
        }

        // Update regime multiplier in risk manager
        if (this.aiCore.regimeDetector.getCurrentRegime()) {
          const regimeMultiplier = this.aiCore.getCombinedRiskMultiplier();
          this.riskManager.setRegimeMultiplier(regimeMultiplier);
          console.log(`[Enhanced Strategy] 📊 Regime multiplier: ${regimeMultiplier.toFixed(2)}x`);
        }

        // Handle signal with enhanced execution
        await this.handleEnhancedSignal(signal, marketData);

      } catch (error) {
        console.error('[Enhanced Strategy] ❌ Error:', error.message);
      }
    };
  }

  /**
   * Handle signal with enhanced execution logic
   */
  async handleEnhancedSignal(signal, marketData) {
    try {
      const currentPrice = marketData.price;
      const positions = this.riskManager.openPositions;

      if (signal.action === 'Hold') {
        console.log('[Enhanced Strategy] ⏸️ Signal: HOLD - No action');
        return;
      }

      // If we have open positions
      if (positions.length > 0) {
        await this.manageEnhancedPositions(signal, positions, currentPrice, marketData);
      } else {
        // Open new position with enhanced parameters
        await this.openEnhancedPosition(signal, currentPrice, marketData);
      }

    } catch (error) {
      console.error('[Enhanced Strategy] ❌ Signal handling error:', error.message);
    }
  }

  /**
   * Manage existing positions with enhanced logic
   */
  async manageEnhancedPositions(signal, positions, currentPrice, marketData) {
    for (const position of positions) {
      const positionSide = position.side;
      const entryPrice = parseFloat(position.avgPrice);
      const pnl = parseFloat(position.unrealisedPnl);
      const pnlPercent = (pnl / (entryPrice * parseFloat(position.size))) * 100;

      console.log(`[Enhanced Strategy] 📈 Managing ${positionSide}: Entry $${entryPrice.toFixed(2)}, PnL: ${pnlPercent.toFixed(2)}%`);

      // Check for reverse signal with high confidence
      const shouldClose =
        (positionSide === 'Buy' && signal.action === 'Sell' && signal.confidence > 0.75) ||
        (positionSide === 'Sell' && signal.action === 'Buy' && signal.confidence > 0.75);

      if (shouldClose) {
        console.log(`[Enhanced Strategy] 🔄 Closing ${positionSide} - reverse signal detected`);
        await this.executionEngine.closePosition(positionSide);
      } else {
        // Check if we should trail stop-loss (ATR-based)
        const atr = this.riskManager.calculateATR(marketData.klines);
        if (atr) {
          const newStopLoss = this.riskManager.calculateTrailingStop(position, currentPrice, atr);
          if (newStopLoss) {
            console.log(`[Enhanced Strategy] 📍 Trailing stop updated: $${newStopLoss.toFixed(2)}`);
            // TODO: Update stop-loss via API
          }
        }
      }
    }
  }

  /**
   * Open new position with enhanced parameters
   */
  async openEnhancedPosition(signal, currentPrice, marketData) {
    console.log(`[Enhanced Strategy] 🎯 Opening ${signal.action} position`);
    console.log(`[Enhanced Strategy] 📊 Confidence: ${(signal.confidence * 100).toFixed(1)}%`);

    // Enhanced execution with dynamic risk parameters
    const result = await this.executeEnhancedSignal(signal, currentPrice, marketData);

    if (result.success) {
      console.log(`[Enhanced Strategy] ✅ Position opened successfully`);

      // Track performance
      this.performanceTracker.recordTrade({
        timestamp: Date.now(),
        symbol: config.trading.symbol,
        side: signal.action,
        entryPrice: currentPrice,
        signal: signal
      });
    } else {
      console.log(`[Enhanced Strategy] ❌ Failed: ${result.reason || result.error}`);
    }
  }

  /**
   * Execute signal with enhanced dynamic risk management
   */
  async executeEnhancedSignal(signal, currentPrice, marketData) {
    try {
      // Dynamic risk approval
      const approval = this.riskManager.approveTrade(signal, currentPrice, marketData);

      if (!approval.approved) {
        return { success: false, reason: approval.reason };
      }

      const params = approval.parameters;

      console.log(`\n[Enhanced Execution] 📋 Trade Parameters:`);
      console.log(`  Action: ${signal.action}`);
      console.log(`  Quantity: ${params.quantity}`);
      console.log(`  Entry: $${currentPrice.toFixed(2)}`);
      console.log(`  Stop Loss: $${params.stopLoss.toFixed(2)} (${params.stopLossDistance.toFixed(2)} distance)`);
      console.log(`  Take Profit: $${params.takeProfit.toFixed(2)} (${params.takeProfitDistance.toFixed(2)} distance)`);
      console.log(`  Risk Amount: $${params.riskAmount.toFixed(2)} (${params.riskPercent.toFixed(2)}%)`);
      console.log(`  Risk/Reward: 1:${params.riskReward.toFixed(2)}`);
      console.log(`  ATR: ${params.atr.toFixed(2)} (${params.atrPercent.toFixed(2)}%)`);
      console.log(`  Leverage: ${params.leverage.toFixed(1)}x`);

      // Execute order
      const orderResult = await this.executionEngine.placeOrder({
        side: signal.action,
        orderType: 'Market',
        qty: params.quantity.toString(),
        stopLoss: params.stopLoss.toString(),
        takeProfit: params.takeProfit.toString()
      });

      if (orderResult.success) {
        console.log(`[Enhanced Execution] ✅ Order executed: ${orderResult.orderId}`);

        // Update positions and account
        await this.executionEngine.updatePositions();
        await this.executionEngine.updateAccountInfo();
      }

      return orderResult;

    } catch (error) {
      console.error('[Enhanced Execution] ❌ Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async initialize() {
    try {
      console.log('\n========================================');
      console.log('🚀 ENHANCED BLAXEL AI TRADER v2.0');
      console.log('========================================');
      console.log('✨ Multi-Factor Institutional Model');
      console.log('');
      console.log('Features Enabled:');
      console.log('  ✓ Market Regime Detection');
      console.log('  ✓ Order Flow Analysis (CVD, OI, Funding)');
      console.log('  ✓ Macro Fundamental Tracking');
      console.log('  ✓ Sentiment & On-Chain Metrics');
      console.log('  ✓ Dynamic ATR-based Risk Management');
      console.log('  ✓ Multi-Factor Weighted Decision (5 factors)');
      console.log('========================================');
      console.log(`Trading Pair: ${config.trading.symbol}`);
      console.log(`Mode: ${config.bybit.testnet ? '🧪 TESTNET' : '🔴 LIVE'}`);
      console.log('========================================\n');

      // Initialize execution engine
      console.log('[Enhanced] 🔧 Initializing Execution Engine...');
      await this.executionEngine.initialize();

      // Initialize data engine
      console.log('[Enhanced] 📊 Initializing Data Engine...');
      this.dataEngine.initialize();

      // Warm up engines
      console.log('[Enhanced] 🔥 Warming up analysis engines...');
      console.log('  - Fetching initial market data...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for data

      console.log('  - Running initial macro analysis...');
      await this.macroEngine.analyze();

      console.log('  - Running initial sentiment analysis...');
      await this.sentimentEngine.analyze();

      this.isInitialized = true;
      console.log('\n[Enhanced] ✅ All systems initialized and ready!\n');

      // Start API server for dashboard
      console.log('[Enhanced] 🌐 Starting API server for dashboard...');
      this.apiServer.start();

    } catch (error) {
      console.error('[Enhanced] ❌ Initialization error:', error.message);
      throw error;
    }
  }

  setupEventHandlers() {
    // Subscribe to market data updates
    this.dataEngine.subscribe((data) => {
      // Real-time updates can be logged here if needed
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n[Enhanced] 🛑 Shutdown signal received...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n[Enhanced] 🛑 Termination signal received...');
      await this.shutdown();
      process.exit(0);
    });
  }

  async start() {
    if (!this.isInitialized) {
      throw new Error('Trader not initialized. Call initialize() first.');
    }

    if (this.isRunning) {
      console.log('[Enhanced] ⚠️ Already running');
      return;
    }

    console.log('[Enhanced] 🚀 Starting Enhanced AI Trader...\n');
    this.isRunning = true;

    // Start strategy engine
    this.strategyEngine.start();

    // Print enhanced summary every 5 minutes
    this.summaryInterval = setInterval(() => {
      this.printEnhancedSummary();
    }, 5 * 60 * 1000);

    console.log('[Enhanced] ✅ Enhanced AI Trader is now running!\n');
    console.log('[Enhanced] 💡 Press Ctrl+C to stop\n');
  }

  async stop() {
    console.log('[Enhanced] 🛑 Stopping Enhanced AI Trader...');
    this.isRunning = false;

    this.strategyEngine.stop();

    if (this.summaryInterval) {
      clearInterval(this.summaryInterval);
    }

    console.log('[Enhanced] ⏹️ Enhanced AI Trader stopped');
  }

  async shutdown() {
    console.log('\n[Enhanced] 🔄 Shutting down...');

    await this.stop();

    // Export final reports
    console.log('[Enhanced] 📄 Generating final reports...');
    this.performanceTracker.exportReport();
    this.performanceTracker.printSummary();

    // Close connections
    this.dataEngine.close();

    console.log('[Enhanced] ✅ Shutdown complete\n');
  }

  printEnhancedSummary() {
    console.log('\n========== 📊 ENHANCED STATUS SUMMARY ==========');
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log(`🏃 Running: ${this.isRunning ? 'Yes ✅' : 'No ❌'}`);

    const riskMetrics = this.riskManager.getRiskMetrics();
    console.log(`\n💰 Account:`);
    console.log(`  Balance: $${riskMetrics.accountBalance.toFixed(2)}`);
    console.log(`  Positions: ${riskMetrics.openPositions}/3`);
    console.log(`  Exposure: $${riskMetrics.totalExposure.toFixed(2)}`);

    console.log(`\n📈 Risk Metrics:`);
    console.log(`  Current ATR: ${riskMetrics.currentATR?.toFixed(2) || 'N/A'}`);
    console.log(`  Regime Multiplier: ${riskMetrics.regimeMultiplier.toFixed(2)}x`);
    console.log(`  Effective Risk: ${(riskMetrics.effectiveRisk * 100).toFixed(2)}%`);

    const regime = this.aiCore.regimeDetector.getCurrentRegime();
    if (regime) {
      console.log(`\n🎯 Market Regime:`);
      console.log(`  State: ${regime.regime.toUpperCase()}`);
      console.log(`  Action: ${regime.action}`);
      console.log(`  Confidence: ${(regime.confidence * 100).toFixed(1)}%`);
    }

    const lastSignal = this.aiCore.getLastSignal();
    if (lastSignal) {
      console.log(`\n🧠 Last Signal:`);
      console.log(`  Action: ${lastSignal.action}`);
      console.log(`  Confidence: ${(lastSignal.confidence * 100).toFixed(1)}%`);
    }

    const performance = this.performanceTracker.getMetrics();
    console.log(`\n📊 Performance:`);
    console.log(`  Total Trades: ${performance.totalTrades}`);
    console.log(`  Win Rate: ${performance.winRate}`);
    console.log(`  Net Profit: $${performance.netProfit}`);
    console.log(`  Sharpe Ratio: ${performance.sharpeRatio}`);

    console.log('==============================================\n');
  }

  async getStatus() {
    return {
      version: '2.0-enhanced',
      isRunning: this.isRunning,
      timestamp: new Date().toISOString(),

      // Basic status
      riskMetrics: this.riskManager.getRiskMetrics(),
      performance: this.performanceTracker.getMetrics(),

      // Market data
      marketData: {
        price: this.dataEngine.getCurrentPrice(),
        symbol: config.trading.symbol
      },

      // Enhanced features
      enhanced: {
        regime: this.aiCore.regimeDetector.getCurrentRegime(),
        orderFlow: this.orderFlowEngine.getData(),
        macroSignal: this.macroEngine.getCurrentSignal(),
        lastSignal: this.aiCore.getLastSignal()
      }
    };
  }

  async executeManualTrade(action, confidence = 0.8) {
    const signal = {
      action,
      confidence,
      manual: true
    };

    const marketData = this.dataEngine.getMarketData();
    const currentPrice = marketData.price;

    return await this.executeEnhancedSignal(signal, currentPrice, marketData);
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

  } catch (error) {
    console.error('[Enhanced] 🔥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = EnhancedBlaxelAITrader;
