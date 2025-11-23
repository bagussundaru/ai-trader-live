const TechnicalIndicators = require('./TechnicalIndicators');

/**
 * Market Regime Detector
 *
 * Detects current market condition:
 * - Trending (Bullish/Bearish)
 * - Ranging (Sideways/Choppy)
 * - Volatile (High volatility)
 * - Low Volatility
 * - News Shock (Sudden spike)
 *
 * This prevents trading in unfavorable conditions
 */
class MarketRegimeDetector {
  constructor() {
    this.currentRegime = null;
    this.regimeHistory = [];
  }

  /**
   * Main detection function
   */
  detect(marketData) {
    const { klines } = marketData;

    if (!klines || klines.length < 50) {
      return { regime: 'unknown', confidence: 0 };
    }

    const closes = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    const volumes = klines.map(k => k.volume);

    // Calculate regime indicators
    const volatility = this.calculateVolatility(closes);
    const trendStrength = this.calculateTrendStrength(closes);
    const rangeState = this.detectRanging(closes, highs, lows);
    const volumeState = this.analyzeVolume(volumes);
    const newsShock = this.detectNewsShock(closes, volumes);

    // Determine regime
    const regime = this.determineRegime({
      volatility,
      trendStrength,
      rangeState,
      volumeState,
      newsShock
    });

    this.currentRegime = regime;
    this.logRegime(regime);

    return regime;
  }

  calculateVolatility(closes) {
    // Calculate standard deviation of returns
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualized volatility
    const annualizedVol = stdDev * Math.sqrt(365 * 24); // hourly data

    return {
      value: annualizedVol,
      level: this.classifyVolatility(annualizedVol)
    };
  }

  classifyVolatility(vol) {
    if (vol > 1.5) return 'extreme';
    if (vol > 1.0) return 'high';
    if (vol > 0.5) return 'medium';
    return 'low';
  }

  calculateTrendStrength(closes) {
    // ADX-like trend strength
    const period = 14;
    const slice = closes.slice(-period * 2);

    // Calculate directional movement
    let upMoves = 0;
    let downMoves = 0;

    for (let i = 1; i < slice.length; i++) {
      const change = slice[i] - slice[i - 1];
      if (change > 0) upMoves++;
      if (change < 0) downMoves++;
    }

    const trendRatio = Math.abs(upMoves - downMoves) / slice.length;

    // Linear regression slope
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < slice.length; i++) {
      sumX += i;
      sumY += slice[i];
      sumXY += i * slice[i];
      sumXX += i * i;
    }

    const n = slice.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const normalizedSlope = slope / (sumY / n);

    return {
      strength: trendRatio,
      direction: slope > 0 ? 'bullish' : 'bearish',
      score: Math.abs(normalizedSlope * 100)
    };
  }

  detectRanging(closes, highs, lows) {
    const period = 50;
    const recent = closes.slice(-period);
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);

    const high = Math.max(...recentHighs);
    const low = Math.min(...recentLows);
    const range = high - low;
    const currentPrice = recent[recent.length - 1];

    // Count touches to support/resistance
    const tolerance = range * 0.02;
    let topTouches = 0;
    let bottomTouches = 0;

    for (let i = 0; i < recent.length; i++) {
      if (Math.abs(recentHighs[i] - high) < tolerance) topTouches++;
      if (Math.abs(recentLows[i] - low) < tolerance) bottomTouches++;
    }

    const isRanging = topTouches >= 3 && bottomTouches >= 3;
    const rangePercentage = (range / currentPrice) * 100;

    return {
      isRanging,
      rangePercentage,
      support: low,
      resistance: high,
      topTouches,
      bottomTouches
    };
  }

  analyzeVolume(volumes) {
    const recent = volumes.slice(-20);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const current = volumes[volumes.length - 1];

    const ratio = current / avg;

    return {
      current,
      average: avg,
      ratio,
      level: ratio > 2 ? 'extreme' : ratio > 1.5 ? 'high' : ratio > 0.8 ? 'normal' : 'low'
    };
  }

  detectNewsShock(closes, volumes) {
    // Detect sudden price + volume spike (news/macro event)
    const recentCloses = closes.slice(-10);
    const recentVolumes = volumes.slice(-10);

    const priceChanges = [];
    for (let i = 1; i < recentCloses.length; i++) {
      priceChanges.push(Math.abs((recentCloses[i] - recentCloses[i - 1]) / recentCloses[i - 1]));
    }

    const maxPriceChange = Math.max(...priceChanges);
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const maxVolume = Math.max(...recentVolumes);

    const priceShock = maxPriceChange > 0.03; // 3% move in one candle
    const volumeShock = maxVolume > avgVolume * 3;

    return {
      detected: priceShock && volumeShock,
      priceChange: maxPriceChange,
      volumeSpike: maxVolume / avgVolume
    };
  }

  determineRegime(indicators) {
    const { volatility, trendStrength, rangeState, volumeState, newsShock } = indicators;

    // Priority 1: News shock
    if (newsShock.detected) {
      return {
        regime: 'news_shock',
        subtype: 'high_risk',
        confidence: 0.95,
        action: 'AVOID_TRADING',
        reason: 'News shock detected - extreme volatility',
        indicators
      };
    }

    // Priority 2: Extreme volatility
    if (volatility.level === 'extreme') {
      return {
        regime: 'volatile',
        subtype: 'extreme',
        confidence: 0.9,
        action: 'STRICT_SL',
        reason: 'Extreme volatility - widen stop-loss',
        indicators
      };
    }

    // Priority 3: Strong trend
    if (trendStrength.score > 0.5 && !rangeState.isRanging) {
      return {
        regime: 'trending',
        subtype: trendStrength.direction,
        confidence: 0.85,
        action: 'TREND_FOLLOW',
        reason: `Strong ${trendStrength.direction} trend detected`,
        strategy: 'EMA_CROSSOVER',
        indicators
      };
    }

    // Priority 4: Ranging market
    if (rangeState.isRanging && volatility.level === 'low') {
      return {
        regime: 'ranging',
        subtype: 'sideways',
        confidence: 0.8,
        action: 'MEAN_REVERSION',
        reason: 'Market in range - use RSI + BB',
        strategy: 'RSI_BB',
        support: rangeState.support,
        resistance: rangeState.resistance,
        indicators
      };
    }

    // Priority 5: Choppy (ranging with volatility)
    if (rangeState.isRanging && volatility.level !== 'low') {
      return {
        regime: 'choppy',
        subtype: 'whipsaw',
        confidence: 0.75,
        action: 'REDUCE_TRADING',
        reason: 'Choppy market - high whipsaw risk',
        indicators
      };
    }

    // Priority 6: Low volatility
    if (volatility.level === 'low' && volumeState.level === 'low') {
      return {
        regime: 'low_volatility',
        subtype: 'quiet',
        confidence: 0.7,
        action: 'WAIT',
        reason: 'Low volatility and volume - wait for setup',
        indicators
      };
    }

    // Default: Uncertain
    return {
      regime: 'uncertain',
      subtype: 'mixed_signals',
      confidence: 0.5,
      action: 'CONSERVATIVE',
      reason: 'Mixed market signals - trade conservatively',
      indicators
    };
  }

  logRegime(regime) {
    this.regimeHistory.push({
      timestamp: Date.now(),
      regime: regime.regime,
      subtype: regime.subtype,
      confidence: regime.confidence
    });

    // Keep last 100
    if (this.regimeHistory.length > 100) {
      this.regimeHistory.shift();
    }

    console.log('\n========== MARKET REGIME ==========');
    console.log(`Regime: ${regime.regime.toUpperCase()} (${regime.subtype})`);
    console.log(`Confidence: ${(regime.confidence * 100).toFixed(1)}%`);
    console.log(`Action: ${regime.action}`);
    console.log(`Reason: ${regime.reason}`);
    if (regime.strategy) {
      console.log(`Recommended Strategy: ${regime.strategy}`);
    }
    console.log('==================================\n');
  }

  getCurrentRegime() {
    return this.currentRegime;
  }

  /**
   * Check if current regime allows trading
   */
  shouldTrade() {
    if (!this.currentRegime) return false;

    const avoidRegimes = ['news_shock', 'choppy', 'low_volatility'];
    return !avoidRegimes.includes(this.currentRegime.regime);
  }

  /**
   * Get recommended strategy based on regime
   */
  getRecommendedStrategy() {
    if (!this.currentRegime) return null;

    const strategies = {
      trending: 'EMA_CROSSOVER',
      ranging: 'RSI_BB',
      volatile: 'BREAKOUT',
      uncertain: 'CONSERVATIVE'
    };

    return strategies[this.currentRegime.regime] || 'CONSERVATIVE';
  }

  /**
   * Get regime-adjusted risk multiplier
   */
  getRiskMultiplier() {
    if (!this.currentRegime) return 1.0;

    const multipliers = {
      trending: 1.2,      // Increase position in trends
      ranging: 1.0,       // Normal in range
      volatile: 0.5,      // Reduce in high vol
      choppy: 0.3,        // Very small in choppy
      news_shock: 0.0,    // No trading
      low_volatility: 0.5,// Small positions
      uncertain: 0.7      // Conservative
    };

    return multipliers[this.currentRegime.regime] || 1.0;
  }
}

module.exports = MarketRegimeDetector;
