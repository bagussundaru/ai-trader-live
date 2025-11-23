const config = require('../config/config');

class StrategyEngine {
  constructor(aiCore, executionEngine) {
    this.aiCore = aiCore;
    this.executionEngine = executionEngine;
    this.isRunning = false;
    this.analysisInterval = null;
    this.currentPosition = null;
  }

  start() {
    if (this.isRunning) {
      console.log('[StrategyEngine] Already running');
      return;
    }

    console.log('[StrategyEngine] Starting trading strategy...');
    this.isRunning = true;

    // Run analysis every minute
    this.analysisInterval = setInterval(() => {
      this.executeStrategy();
    }, config.ai.updateInterval);

    // Run immediately
    this.executeStrategy();
  }

  stop() {
    console.log('[StrategyEngine] Stopping trading strategy...');
    this.isRunning = false;

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  async executeStrategy() {
    try {
      if (!this.isRunning) return;

      console.log('\n[StrategyEngine] Executing strategy cycle...');

      // Update account and positions
      const accountSummary = await this.executionEngine.getAccountSummary();

      console.log(`[StrategyEngine] Account: $${accountSummary.balance.toFixed(2)} | Positions: ${accountSummary.positions}`);

      // Check for emergency close conditions
      if (this.executionEngine.riskManager.shouldEmergencyClose()) {
        console.error('[StrategyEngine] EMERGENCY CLOSE TRIGGERED!');
        await this.executionEngine.closeAllPositions();
        return;
      }

      // Get market data from data engine
      const marketData = this.dataEngine?.getMarketData();

      if (!marketData || !marketData.price) {
        console.log('[StrategyEngine] Waiting for market data...');
        return;
      }

      // Analyze market with AI
      const signal = this.aiCore.analyze(marketData);

      if (!signal) {
        console.log('[StrategyEngine] No signal generated');
        return;
      }

      // Execute based on signal
      await this.handleSignal(signal, marketData.price);

    } catch (error) {
      console.error('[StrategyEngine] Strategy execution error:', error.message);
    }
  }

  async handleSignal(signal, currentPrice) {
    try {
      // Check current positions
      const positions = this.executionEngine.riskManager.openPositions;

      if (signal.action === 'Hold') {
        console.log('[StrategyEngine] Signal: HOLD - No action taken');
        return;
      }

      // If we have an open position
      if (positions.length > 0) {
        await this.manageExistingPositions(signal, positions, currentPrice);
      } else {
        // No open positions - consider opening new position
        await this.openNewPosition(signal, currentPrice);
      }

    } catch (error) {
      console.error('[StrategyEngine] Signal handling error:', error.message);
    }
  }

  async manageExistingPositions(signal, positions, currentPrice) {
    for (const position of positions) {
      const positionSide = position.side;
      const entryPrice = parseFloat(position.avgPrice);
      const currentSize = parseFloat(position.size);
      const pnl = parseFloat(position.unrealisedPnl);
      const pnlPercent = (pnl / (entryPrice * currentSize)) * 100;

      console.log(`[StrategyEngine] Managing ${positionSide} position: Entry $${entryPrice.toFixed(2)}, PnL: ${pnlPercent.toFixed(2)}%`);

      // Check if signal conflicts with position (reverse signal)
      const shouldClose =
        (positionSide === 'Buy' && signal.action === 'Sell' && signal.confidence > 0.7) ||
        (positionSide === 'Sell' && signal.action === 'Buy' && signal.confidence > 0.7);

      if (shouldClose) {
        console.log(`[StrategyEngine] Closing ${positionSide} position due to reverse signal`);
        await this.executionEngine.closePosition(positionSide);
      } else {
        console.log(`[StrategyEngine] Holding ${positionSide} position`);
      }
    }
  }

  async openNewPosition(signal, currentPrice) {
    if (signal.action === 'Buy' || signal.action === 'Sell') {
      console.log(`[StrategyEngine] Opening new ${signal.action} position`);
      const result = await this.executionEngine.executeSignal(signal, currentPrice);

      if (result.success) {
        console.log(`[StrategyEngine] Position opened successfully`);
      } else {
        console.log(`[StrategyEngine] Failed to open position: ${result.reason || result.error}`);
      }
    }
  }

  setDataEngine(dataEngine) {
    this.dataEngine = dataEngine;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSignal: this.aiCore.getLastSignal(),
      performanceMetrics: this.aiCore.getPerformanceMetrics()
    };
  }
}

module.exports = StrategyEngine;
