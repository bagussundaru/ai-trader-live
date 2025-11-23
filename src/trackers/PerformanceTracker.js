const fs = require('fs');
const path = require('path');

class PerformanceTracker {
  constructor() {
    this.trades = [];
    this.metrics = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0
    };

    this.startTime = Date.now();
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  recordTrade(trade) {
    const tradeRecord = {
      timestamp: Date.now(),
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      duration: trade.duration,
      signal: trade.signal
    };

    this.trades.push(tradeRecord);
    this.updateMetrics(tradeRecord);
    this.saveTrade(tradeRecord);

    console.log(`[PerformanceTracker] Trade recorded: ${trade.side} ${trade.quantity} @ $${trade.entryPrice} -> $${trade.exitPrice} | PnL: ${trade.pnlPercent.toFixed(2)}%`);
  }

  updateMetrics(trade) {
    this.metrics.totalTrades++;

    if (trade.pnl > 0) {
      this.metrics.winningTrades++;
      this.metrics.totalProfit += trade.pnl;
      this.metrics.consecutiveWins++;
      this.metrics.consecutiveLosses = 0;

      if (trade.pnl > this.metrics.largestWin) {
        this.metrics.largestWin = trade.pnl;
      }

      if (this.metrics.consecutiveWins > this.metrics.maxConsecutiveWins) {
        this.metrics.maxConsecutiveWins = this.metrics.consecutiveWins;
      }
    } else if (trade.pnl < 0) {
      this.metrics.losingTrades++;
      this.metrics.totalLoss += Math.abs(trade.pnl);
      this.metrics.consecutiveLosses++;
      this.metrics.consecutiveWins = 0;

      if (Math.abs(trade.pnl) > this.metrics.largestLoss) {
        this.metrics.largestLoss = Math.abs(trade.pnl);
      }

      if (this.metrics.consecutiveLosses > this.metrics.maxConsecutiveLosses) {
        this.metrics.maxConsecutiveLosses = this.metrics.consecutiveLosses;
      }
    }
  }

  saveTrade(trade) {
    const logFile = path.join(this.logDir, 'trades.jsonl');

    try {
      fs.appendFileSync(logFile, JSON.stringify(trade) + '\n');
    } catch (error) {
      console.error('[PerformanceTracker] Error saving trade:', error.message);
    }
  }

  getMetrics() {
    const netProfit = this.metrics.totalProfit - this.metrics.totalLoss;
    const winRate = this.metrics.totalTrades > 0
      ? (this.metrics.winningTrades / this.metrics.totalTrades) * 100
      : 0;

    const avgWin = this.metrics.winningTrades > 0
      ? this.metrics.totalProfit / this.metrics.winningTrades
      : 0;

    const avgLoss = this.metrics.losingTrades > 0
      ? this.metrics.totalLoss / this.metrics.losingTrades
      : 0;

    const profitFactor = this.metrics.totalLoss > 0
      ? this.metrics.totalProfit / this.metrics.totalLoss
      : 0;

    // Calculate Sharpe Ratio (simplified)
    const returns = this.trades.map(t => t.pnlPercent);
    const sharpeRatio = this.calculateSharpeRatio(returns);

    // Calculate Maximum Drawdown
    const maxDrawdown = this.calculateMaxDrawdown();

    return {
      totalTrades: this.metrics.totalTrades,
      winningTrades: this.metrics.winningTrades,
      losingTrades: this.metrics.losingTrades,
      winRate: winRate.toFixed(2) + '%',
      netProfit: netProfit.toFixed(2),
      totalProfit: this.metrics.totalProfit.toFixed(2),
      totalLoss: this.metrics.totalLoss.toFixed(2),
      largestWin: this.metrics.largestWin.toFixed(2),
      largestLoss: this.metrics.largestLoss.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2) + '%',
      maxConsecutiveWins: this.metrics.maxConsecutiveWins,
      maxConsecutiveLosses: this.metrics.maxConsecutiveLosses,
      uptime: this.getUptime()
    };
  }

  calculateSharpeRatio(returns) {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualized Sharpe Ratio (assuming daily returns)
    const sharpe = (avgReturn / stdDev) * Math.sqrt(365);
    return sharpe;
  }

  calculateMaxDrawdown() {
    if (this.trades.length === 0) return 0;

    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    for (const trade of this.trades) {
      runningPnL += trade.pnl;

      if (runningPnL > peak) {
        peak = runningPnL;
      }

      const drawdown = ((peak - runningPnL) / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  printSummary() {
    const metrics = this.getMetrics();

    console.log('\n========== PERFORMANCE SUMMARY ==========');
    console.log(`Uptime: ${metrics.uptime}`);
    console.log(`Total Trades: ${metrics.totalTrades}`);
    console.log(`Win Rate: ${metrics.winRate}`);
    console.log(`Net Profit: $${metrics.netProfit}`);
    console.log(`Profit Factor: ${metrics.profitFactor}`);
    console.log(`Sharpe Ratio: ${metrics.sharpeRatio}`);
    console.log(`Max Drawdown: ${metrics.maxDrawdown}`);
    console.log(`Largest Win: $${metrics.largestWin}`);
    console.log(`Largest Loss: $${metrics.largestLoss}`);
    console.log(`Max Consecutive Wins: ${metrics.maxConsecutiveWins}`);
    console.log(`Max Consecutive Losses: ${metrics.maxConsecutiveLosses}`);
    console.log('========================================\n');
  }

  exportReport() {
    const metrics = this.getMetrics();
    const reportFile = path.join(this.logDir, `report_${Date.now()}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      trades: this.trades
    };

    try {
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`[PerformanceTracker] Report exported to ${reportFile}`);
      return reportFile;
    } catch (error) {
      console.error('[PerformanceTracker] Error exporting report:', error.message);
      return null;
    }
  }

  reset() {
    this.trades = [];
    this.metrics = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0
    };
    this.startTime = Date.now();
    console.log('[PerformanceTracker] Metrics reset');
  }
}

module.exports = PerformanceTracker;
