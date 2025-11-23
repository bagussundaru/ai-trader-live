class TechnicalIndicators {
  /**
   * Calculate Simple Moving Average (SMA)
   */
  static calculateSMA(data, period) {
    if (data.length < period) return null;

    const slice = data.slice(-period);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static calculateEMA(data, period) {
    if (data.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(data.slice(0, period), period);

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    let gains = 0;
    let losses = 0;

    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gains += changes[i];
      } else {
        losses -= changes[i];
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < changes.length; i++) {
      const change = changes[i];

      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;

    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    if (!fastEMA || !slowEMA) return null;

    const macdLine = fastEMA - slowEMA;

    // Calculate signal line (EMA of MACD)
    const macdHistory = [];
    for (let i = slowPeriod; i < prices.length; i++) {
      const slice = prices.slice(0, i + 1);
      const fast = this.calculateEMA(slice, fastPeriod);
      const slow = this.calculateEMA(slice, slowPeriod);
      macdHistory.push(fast - slow);
    }

    const signalLine = this.calculateEMA(macdHistory, signalPeriod);
    const histogram = macdLine - (signalLine || 0);

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;

    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);

    // Calculate standard deviation
    const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  /**
   * Calculate Average True Range (ATR)
   */
  static calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return null;

    const trueRanges = [];

    for (let i = 1; i < highs.length; i++) {
      const high = highs[i];
      const low = lows[i];
      const prevClose = closes[i - 1];

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );

      trueRanges.push(tr);
    }

    return this.calculateSMA(trueRanges, period);
  }

  /**
   * Detect support and resistance levels
   */
  static detectSupportResistance(prices, threshold = 0.02) {
    const levels = [];
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);
    const range = priceMax - priceMin;

    // Find local peaks and troughs
    for (let i = 2; i < prices.length - 2; i++) {
      // Peak (resistance)
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1] &&
          prices[i] > prices[i - 2] && prices[i] > prices[i + 2]) {
        levels.push({ price: prices[i], type: 'resistance' });
      }

      // Trough (support)
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1] &&
          prices[i] < prices[i - 2] && prices[i] < prices[i + 2]) {
        levels.push({ price: prices[i], type: 'support' });
      }
    }

    // Group similar levels
    const groupedLevels = [];
    for (const level of levels) {
      const existing = groupedLevels.find(l =>
        Math.abs(l.price - level.price) / range < threshold &&
        l.type === level.type
      );

      if (existing) {
        existing.count++;
        existing.price = (existing.price + level.price) / 2;
      } else {
        groupedLevels.push({ ...level, count: 1 });
      }
    }

    return groupedLevels.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate trend strength
   */
  static calculateTrendStrength(prices, period = 20) {
    if (prices.length < period) return 0;

    const slice = prices.slice(-period);
    const first = slice[0];
    const last = slice[slice.length - 1];

    // Calculate linear regression
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < slice.length; i++) {
      sumX += i;
      sumY += slice[i];
      sumXY += i * slice[i];
      sumXX += i * i;
    }

    const n = slice.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgPrice = sumY / n;

    // Normalize slope to -1 to 1 range
    const normalizedSlope = slope / avgPrice;

    return Math.max(-1, Math.min(1, normalizedSlope * 100));
  }
}

module.exports = TechnicalIndicators;
