const TechnicalIndicators = require('../ai/TechnicalIndicators');
const config = require('../config/config');

/**
 * Dynamic Risk Manager (ATR-based)
 *
 * Features:
 * - ATR-based stop-loss (adaptive to volatility)
 * - ATR-based position sizing
 * - Dynamic risk/reward ratios
 * - Regime-adjusted risk
 * - Volatility-scaled leverage
 *
 * This prevents:
 * - Whipsaw in high volatility
 * - Fixed SL getting hit in normal market movement
 * - Overexposure in choppy conditions
 */
class DynamicRiskManager {
  constructor() {
    this.accountBalance = 0;
    this.openPositions = [];
    this.currentATR = 0;
    this.regimeMultiplier = 1.0;

    // Base risk parameters (from config)
    this.maxRiskPerTrade = config.risk.maxRiskPerTrade;
    this.maxLeverage = config.risk.maxLeverage;
  }

  setAccountBalance(balance) {
    this.accountBalance = parseFloat(balance);
    console.log(`[DynamicRisk] Account balance: $${this.accountBalance.toFixed(2)}`);
  }

  updatePositions(positions) {
    this.openPositions = positions;
  }

  setRegimeMultiplier(multiplier) {
    this.regimeMultiplier = multiplier;
  }

  /**
   * Calculate current ATR from market data
   */
  calculateATR(klines) {
    if (!klines || klines.length < 15) return null;

    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    const closes = klines.map(k => k.close);

    const atr = TechnicalIndicators.calculateATR(highs, lows, closes, 14);
    this.currentATR = atr;

    return atr;
  }

  /**
   * Approve trade with dynamic risk assessment
   */
  approveTrade(signal, currentPrice, marketData) {
    // Calculate ATR
    const atr = this.calculateATR(marketData.klines);
    if (!atr) {
      return { approved: false, reason: 'Insufficient data for ATR calculation' };
    }

    // Basic checks
    const basicChecks = [
      this.checkAccountBalance(),
      this.checkMaxPositions(),
      this.checkSignalValidity(signal)
    ];

    for (const check of basicChecks) {
      if (!check.passed) {
        return { approved: false, reason: check.reason };
      }
    }

    // Calculate dynamic position parameters
    const params = this.calculatePositionParameters(signal, currentPrice, atr);

    // Check if position is within risk limits
    const riskCheck = this.validateRisk(params);
    if (!riskCheck.passed) {
      return { approved: false, reason: riskCheck.reason };
    }

    return {
      approved: true,
      parameters: params,
      atr
    };
  }

  checkAccountBalance() {
    if (this.accountBalance <= 0) {
      return { passed: false, reason: 'Invalid account balance' };
    }
    return { passed: true };
  }

  checkMaxPositions() {
    if (this.openPositions.length >= 3) {
      return { passed: false, reason: 'Maximum positions reached (3)' };
    }
    return { passed: true };
  }

  checkSignalValidity(signal) {
    if (!signal || !signal.action || !signal.confidence) {
      return { passed: false, reason: 'Invalid signal structure' };
    }

    if (signal.confidence < 0.6) {
      return { passed: false, reason: `Low confidence ${(signal.confidence * 100).toFixed(1)}%` };
    }

    return { passed: true };
  }

  /**
   * Calculate position parameters using ATR
   */
  calculatePositionParameters(signal, currentPrice, atr) {
    // 1. Calculate ATR-based stop-loss distance
    const atrMultiplier = 1.5; // 1.5x ATR for stop-loss
    const stopLossDistance = atr * atrMultiplier;

    // 2. Calculate stop-loss price
    let stopLossPrice;
    if (signal.action === 'Buy') {
      stopLossPrice = currentPrice - stopLossDistance;
    } else {
      stopLossPrice = currentPrice + stopLossDistance;
    }

    // 3. Calculate take-profit (3x ATR for 1:2 risk/reward)
    const takeProfitDistance = atr * 3.0;
    let takeProfitPrice;
    if (signal.action === 'Buy') {
      takeProfitPrice = currentPrice + takeProfitDistance;
    } else {
      takeProfitPrice = currentPrice - takeProfitDistance;
    }

    // 4. Calculate position size based on risk
    // Risk per trade = Account Balance * Max Risk * Regime Multiplier
    const riskAmount = this.accountBalance * this.maxRiskPerTrade * this.regimeMultiplier;

    // Position size = Risk Amount / Stop Loss Distance
    // This ensures we only risk the specified % regardless of volatility
    const positionSize = riskAmount / stopLossDistance;

    // 5. Calculate position value and leverage
    const positionValue = positionSize * currentPrice;
    const requiredLeverage = positionValue / this.accountBalance;

    // 6. Apply leverage limits
    let adjustedLeverage = Math.min(requiredLeverage, this.maxLeverage);
    let adjustedPositionValue = this.accountBalance * adjustedLeverage;
    let adjustedQuantity = adjustedPositionValue / currentPrice;

    // Round to 3 decimals
    adjustedQuantity = Math.floor(adjustedQuantity * 1000) / 1000;

    // 7. Calculate risk/reward ratio
    const riskReward = Math.abs(takeProfitPrice - currentPrice) / Math.abs(currentPrice - stopLossPrice);

    return {
      quantity: adjustedQuantity,
      entryPrice: currentPrice,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      stopLossDistance: stopLossDistance,
      takeProfitDistance: takeProfitDistance,
      riskAmount: riskAmount,
      riskPercent: (riskAmount / this.accountBalance) * 100,
      riskReward: riskReward,
      leverage: adjustedLeverage,
      positionValue: adjustedPositionValue,
      atr: atr,
      atrPercent: (atr / currentPrice) * 100
    };
  }

  validateRisk(params) {
    // Check if leverage is acceptable
    if (params.leverage > this.maxLeverage) {
      return {
        passed: false,
        reason: `Leverage ${params.leverage.toFixed(1)}x exceeds max ${this.maxLeverage}x`
      };
    }

    // Check if risk/reward is acceptable (minimum 1.5:1)
    if (params.riskReward < 1.5) {
      return {
        passed: false,
        reason: `Risk/Reward ${params.riskReward.toFixed(2)} too low (min 1.5)`
      };
    }

    // Check if position value exceeds account
    if (params.positionValue > this.accountBalance * this.maxLeverage) {
      return {
        passed: false,
        reason: 'Position value exceeds maximum allowed'
      };
    }

    return { passed: true };
  }

  /**
   * Validate leverage is within safe limits
   */
  validateLeverage(requestedLeverage) {
    if (requestedLeverage > this.maxLeverage) {
      console.warn(`[DynamicRisk] Requested leverage ${requestedLeverage}x exceeds max ${this.maxLeverage}x`);
      return this.maxLeverage;
    }
    return requestedLeverage;
  }

  /**
   * Calculate dynamic stop-loss for existing position
   * (Can trail stop-loss based on ATR)
   */
  calculateTrailingStop(position, currentPrice, atr) {
    const side = position.side;
    const entryPrice = parseFloat(position.avgPrice);

    // Trailing stop: 2x ATR from current price (wider than entry SL)
    const trailDistance = atr * 2.0;

    let newStopLoss;
    if (side === 'Buy') {
      newStopLoss = currentPrice - trailDistance;
      // Only move stop-loss up, never down
      const currentSL = parseFloat(position.stopLoss || 0);
      if (newStopLoss > currentSL && newStopLoss > entryPrice) {
        return newStopLoss;
      }
    } else {
      newStopLoss = currentPrice + trailDistance;
      // Only move stop-loss down, never up
      const currentSL = parseFloat(position.stopLoss || Number.MAX_VALUE);
      if (newStopLoss < currentSL && newStopLoss < entryPrice) {
        return newStopLoss;
      }
    }

    return null; // Don't update
  }

  /**
   * Get risk metrics with ATR info
   */
  getRiskMetrics() {
    return {
      accountBalance: this.accountBalance,
      openPositions: this.openPositions.length,
      totalExposure: this.getTotalExposure(),
      maxRiskPerTrade: this.maxRiskPerTrade,
      maxLeverage: this.maxLeverage,
      currentATR: this.currentATR,
      regimeMultiplier: this.regimeMultiplier,
      effectiveRisk: this.maxRiskPerTrade * this.regimeMultiplier
    };
  }

  getTotalExposure() {
    return this.openPositions.reduce((total, pos) => {
      return total + Math.abs(parseFloat(pos.size) * parseFloat(pos.avgPrice));
    }, 0);
  }

  shouldEmergencyClose() {
    const totalExposure = this.getTotalExposure();
    const exposureRatio = totalExposure / this.accountBalance;

    if (exposureRatio > 0.9) {
      console.error('[DynamicRisk] EMERGENCY: Exposure ratio exceeds 90%!');
      return true;
    }

    return false;
  }

  /**
   * Get position size for given risk and stop-loss distance
   */
  getPositionSizeForRisk(riskAmount, stopLossDistance, currentPrice) {
    const quantity = riskAmount / stopLossDistance;
    return Math.floor((quantity * currentPrice) / currentPrice * 1000) / 1000;
  }

  /**
   * Calculate optimal leverage based on volatility
   */
  getOptimalLeverage(atr, currentPrice) {
    const atrPercent = (atr / currentPrice) * 100;

    // Lower leverage in high volatility
    if (atrPercent > 3) return Math.min(5, this.maxLeverage);
    if (atrPercent > 2) return Math.min(7, this.maxLeverage);
    if (atrPercent > 1) return Math.min(10, this.maxLeverage);

    return this.maxLeverage;
  }
}

module.exports = DynamicRiskManager;
