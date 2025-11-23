const config = require('../config/config');

class RiskManager {
  constructor() {
    this.accountBalance = 0;
    this.openPositions = [];
    this.maxRiskPerTrade = config.risk.maxRiskPerTrade;
    this.maxLeverage = config.risk.maxLeverage;
    this.positionSizePercent = config.risk.positionSizePercent;
    this.stopLossPercent = config.risk.stopLossPercent;
    this.takeProfitPercent = config.risk.takeProfitPercent;
  }

  setAccountBalance(balance) {
    this.accountBalance = parseFloat(balance);
    console.log(`[RiskManager] Account balance updated: $${this.accountBalance.toFixed(2)}`);
  }

  updatePositions(positions) {
    this.openPositions = positions;
  }

  /**
   * Approve or reject a trade based on risk parameters
   */
  approveTrade(signal, currentPrice) {
    const checks = [
      this.checkAccountBalance(),
      this.checkMaxPositions(),
      this.checkRiskExposure(signal, currentPrice),
      this.checkSignalValidity(signal)
    ];

    const approved = checks.every(check => check.passed);

    if (!approved) {
      const failedChecks = checks.filter(c => !c.passed);
      console.warn('[RiskManager] Trade rejected. Failed checks:',
        failedChecks.map(c => c.reason).join(', '));
    }

    return approved;
  }

  checkAccountBalance() {
    if (this.accountBalance <= 0) {
      return { passed: false, reason: 'Invalid account balance' };
    }
    return { passed: true };
  }

  checkMaxPositions() {
    // Limit to 3 open positions at once
    if (this.openPositions.length >= 3) {
      return { passed: false, reason: 'Maximum positions reached (3)' };
    }
    return { passed: true };
  }

  checkRiskExposure(signal, currentPrice) {
    const positionSize = this.calculatePositionSize(currentPrice);
    const riskAmount = positionSize * this.stopLossPercent;
    const riskRatio = riskAmount / this.accountBalance;

    if (riskRatio > this.maxRiskPerTrade) {
      return {
        passed: false,
        reason: `Risk ratio ${(riskRatio * 100).toFixed(2)}% exceeds max ${(this.maxRiskPerTrade * 100)}%`
      };
    }

    return { passed: true };
  }

  checkSignalValidity(signal) {
    if (!signal || !signal.action || !signal.confidence) {
      return { passed: false, reason: 'Invalid signal structure' };
    }

    // Only trade on high confidence signals (>60%)
    if (signal.confidence < 0.6) {
      return { passed: false, reason: `Low confidence ${(signal.confidence * 100).toFixed(1)}%` };
    }

    return { passed: true };
  }

  /**
   * Calculate position size based on account balance and risk parameters
   */
  calculatePositionSize(currentPrice) {
    // Position size = Account Balance * Position Size Percent
    const positionValue = this.accountBalance * this.positionSizePercent;

    // Convert to quantity
    const quantity = positionValue / currentPrice;

    // Round to 3 decimal places (standard for crypto)
    return Math.floor(quantity * 1000) / 1000;
  }

  /**
   * Calculate stop loss price
   */
  calculateStopLoss(entryPrice, side) {
    if (side === 'Buy') {
      // For long positions, stop loss is below entry price
      return entryPrice * (1 - this.stopLossPercent);
    } else {
      // For short positions, stop loss is above entry price
      return entryPrice * (1 + this.stopLossPercent);
    }
  }

  /**
   * Calculate take profit price
   */
  calculateTakeProfit(entryPrice, side) {
    if (side === 'Buy') {
      // For long positions, take profit is above entry price
      return entryPrice * (1 + this.takeProfitPercent);
    } else {
      // For short positions, take profit is below entry price
      return entryPrice * (1 - this.takeProfitPercent);
    }
  }

  /**
   * Validate leverage is within safe limits
   */
  validateLeverage(requestedLeverage) {
    if (requestedLeverage > this.maxLeverage) {
      console.warn(`[RiskManager] Requested leverage ${requestedLeverage}x exceeds max ${this.maxLeverage}x`);
      return this.maxLeverage;
    }
    return requestedLeverage;
  }

  /**
   * Calculate risk/reward ratio
   */
  calculateRiskReward(entryPrice, stopLoss, takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    return reward / risk;
  }

  /**
   * Get current total exposure
   */
  getTotalExposure() {
    return this.openPositions.reduce((total, pos) => {
      return total + Math.abs(parseFloat(pos.size) * parseFloat(pos.avgPrice));
    }, 0);
  }

  /**
   * Emergency check - close all positions if account drops below threshold
   */
  shouldEmergencyClose() {
    const totalExposure = this.getTotalExposure();
    const exposureRatio = totalExposure / this.accountBalance;

    // Emergency close if exposure exceeds 90% of account
    if (exposureRatio > 0.9) {
      console.error('[RiskManager] EMERGENCY: Exposure ratio exceeds 90%!');
      return true;
    }

    return false;
  }

  /**
   * Get risk metrics for logging
   */
  getRiskMetrics() {
    return {
      accountBalance: this.accountBalance,
      openPositions: this.openPositions.length,
      totalExposure: this.getTotalExposure(),
      maxRiskPerTrade: this.maxRiskPerTrade,
      maxLeverage: this.maxLeverage
    };
  }
}

module.exports = RiskManager;
