const DataEngine = require('./engines/DataEngine');
const ExecutionEngine = require('./engines/ExecutionEngine');
const StrategyEngine = require('./engines/StrategyEngine');
const RiskManager = require('./managers/RiskManager');
const AIDecisionCore = require('./ai/AIDecisionCore');
const PerformanceTracker = require('./trackers/PerformanceTracker');
const config = require('./config/config');

class BlaxelAITrader {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;

    // Initialize components
    this.riskManager = new RiskManager();
    this.aiCore = new AIDecisionCore();
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
      console.log('🤖 BLAXEL AI TRADER');
      console.log('========================================');
      console.log(`Trading Pair: ${config.trading.symbol}`);
      console.log(`Mode: ${config.bybit.testnet ? 'TESTNET' : 'LIVE'}`);
      console.log(`Max Risk per Trade: ${config.risk.maxRiskPerTrade * 100}%`);
      console.log(`Position Size: ${config.risk.positionSizePercent * 100}%`);
      console.log(`Stop Loss: ${config.risk.stopLossPercent * 100}%`);
      console.log(`Take Profit: ${config.risk.takeProfitPercent * 100}%`);
      console.log('========================================\n');

      // Initialize execution engine
      console.log('[Main] Initializing Execution Engine...');
      await this.executionEngine.initialize();

      // Initialize data engine
      console.log('[Main] Initializing Data Engine...');
      this.dataEngine.initialize();

      this.isInitialized = true;
      console.log('\n[Main] ✓ All systems initialized successfully\n');

    } catch (error) {
      console.error('[Main] Initialization error:', error.message);
      throw error;
    }
  }

  setupEventHandlers() {
    // Subscribe to market data updates
    this.dataEngine.subscribe((data) => {
      // You can add real-time monitoring here if needed
      // For now, strategy engine runs on interval
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n[Main] Received shutdown signal...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n[Main] Received termination signal...');
      await this.shutdown();
      process.exit(0);
    });
  }

  async start() {
    if (!this.isInitialized) {
      throw new Error('Trader not initialized. Call initialize() first.');
    }

    if (this.isRunning) {
      console.log('[Main] Trader is already running');
      return;
    }

    console.log('[Main] Starting AI Trader...\n');
    this.isRunning = true;

    // Start strategy engine
    this.strategyEngine.start();

    // Print performance summary every 5 minutes
    this.summaryInterval = setInterval(() => {
      this.performanceTracker.printSummary();
      this.printStatus();
    }, 5 * 60 * 1000);

    console.log('[Main] ✓ AI Trader is now running\n');
  }

  async stop() {
    console.log('[Main] Stopping AI Trader...');
    this.isRunning = false;

    // Stop strategy engine
    this.strategyEngine.stop();

    // Clear intervals
    if (this.summaryInterval) {
      clearInterval(this.summaryInterval);
    }

    console.log('[Main] AI Trader stopped');
  }

  async shutdown() {
    console.log('\n[Main] Shutting down...');

    // Stop trading
    await this.stop();

    // Export final report
    this.performanceTracker.exportReport();
    this.performanceTracker.printSummary();

    // Close data connections
    this.dataEngine.close();

    console.log('[Main] Shutdown complete');
  }

  printStatus() {
    const status = this.strategyEngine.getStatus();
    const riskMetrics = this.riskManager.getRiskMetrics();

    console.log('\n========== STATUS UPDATE ==========');
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`Running: ${this.isRunning ? 'Yes' : 'No'}`);
    console.log(`Account Balance: $${riskMetrics.accountBalance.toFixed(2)}`);
    console.log(`Open Positions: ${riskMetrics.openPositions}`);
    console.log(`Total Exposure: $${riskMetrics.totalExposure.toFixed(2)}`);

    if (status.lastSignal) {
      console.log(`Last Signal: ${status.lastSignal.action} (${(status.lastSignal.confidence * 100).toFixed(1)}%)`);
    }

    console.log('==================================\n');
  }

  // API methods for external control (useful for Blaxel integration)
  async getStatus() {
    return {
      isRunning: this.isRunning,
      strategyStatus: this.strategyEngine.getStatus(),
      riskMetrics: this.riskManager.getRiskMetrics(),
      performance: this.performanceTracker.getMetrics(),
      marketData: {
        price: this.dataEngine.getCurrentPrice(),
        symbol: config.trading.symbol
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
  const trader = new BlaxelAITrader();

  try {
    await trader.initialize();
    await trader.start();

    // Keep the process running
    console.log('[Main] Press Ctrl+C to stop the bot\n');

  } catch (error) {
    console.error('[Main] Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}

// Export for use as a module (for Blaxel integration)
module.exports = BlaxelAITrader;
