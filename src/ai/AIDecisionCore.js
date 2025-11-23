const TechnicalIndicators = require('./TechnicalIndicators');
const config = require('../config/config');

class AIDecisionCore {
  constructor() {
    this.lastSignal = null;
    this.signalHistory = [];
    this.cooldownPeriod = 5 * 60 * 1000; // 5 minutes cooldown between signals
    this.lastSignalTime = 0;
  }

  /**
   * Main analysis function - combines multiple indicators
   */
  analyze(marketData) {
    try {
      const klines = marketData.klines;

      if (!klines || klines.length < 50) {
        console.log('[AIDecisionCore] Insufficient data for analysis');
        return null;
      }

      // Extract price data
      const closes = klines.map(k => k.close);
      const highs = klines.map(k => k.high);
      const lows = klines.map(k => k.low);
      const volumes = klines.map(k => k.volume);

      // Calculate all indicators
      const indicators = this.calculateIndicators(closes, highs, lows, volumes);

      if (!indicators) {
        console.log('[AIDecisionCore] Failed to calculate indicators');
        return null;
      }

      // Generate trading signal
      const signal = this.generateSignal(indicators, marketData.price);

      // Log analysis
      this.logAnalysis(indicators, signal);

      return signal;

    } catch (error) {
      console.error('[AIDecisionCore] Analysis error:', error.message);
      return null;
    }
  }

  calculateIndicators(closes, highs, lows, volumes) {
    try {
      const rsi = TechnicalIndicators.calculateRSI(closes, config.ai.indicators.rsiPeriod);
      const macd = TechnicalIndicators.calculateMACD(
        closes,
        config.ai.indicators.macdFast,
        config.ai.indicators.macdSlow,
        config.ai.indicators.macdSignal
      );

      const ema9 = TechnicalIndicators.calculateEMA(closes, config.ai.indicators.emaPeriods[0]);
      const ema21 = TechnicalIndicators.calculateEMA(closes, config.ai.indicators.emaPeriods[1]);
      const ema50 = TechnicalIndicators.calculateEMA(closes, config.ai.indicators.emaPeriods[2]);

      const bb = TechnicalIndicators.calculateBollingerBands(closes);
      const atr = TechnicalIndicators.calculateATR(highs, lows, closes);
      const supportResistance = TechnicalIndicators.detectSupportResistance(closes);
      const trendStrength = TechnicalIndicators.calculateTrendStrength(closes);

      return {
        rsi,
        macd,
        ema: { ema9, ema21, ema50 },
        bollingerBands: bb,
        atr,
        supportResistance,
        trendStrength,
        currentPrice: closes[closes.length - 1],
        volumeAvg: TechnicalIndicators.calculateSMA(volumes, 20)
      };

    } catch (error) {
      console.error('[AIDecisionCore] Error calculating indicators:', error.message);
      return null;
    }
  }

  generateSignal(indicators, currentPrice) {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastSignalTime < this.cooldownPeriod) {
      return { action: 'Hold', confidence: 0, reason: 'Cooldown period' };
    }

    // Initialize scoring system
    let bullishScore = 0;
    let bearishScore = 0;
    const reasons = [];

    // 1. RSI Analysis (30 points)
    if (indicators.rsi) {
      if (indicators.rsi < 30) {
        bullishScore += 30;
        reasons.push(`RSI oversold (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi > 70) {
        bearishScore += 30;
        reasons.push(`RSI overbought (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi < 45) {
        bullishScore += 10;
        reasons.push(`RSI bullish (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi > 55) {
        bearishScore += 10;
        reasons.push(`RSI bearish (${indicators.rsi.toFixed(1)})`);
      }
    }

    // 2. MACD Analysis (25 points)
    if (indicators.macd) {
      if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
        bullishScore += 25;
        reasons.push('MACD bullish crossover');
      } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
        bearishScore += 25;
        reasons.push('MACD bearish crossover');
      }
    }

    // 3. EMA Trend Analysis (20 points)
    if (indicators.ema.ema9 && indicators.ema.ema21 && indicators.ema.ema50) {
      const { ema9, ema21, ema50 } = indicators.ema;

      // Golden cross pattern
      if (ema9 > ema21 && ema21 > ema50 && currentPrice > ema9) {
        bullishScore += 20;
        reasons.push('Bullish EMA alignment');
      }
      // Death cross pattern
      else if (ema9 < ema21 && ema21 < ema50 && currentPrice < ema9) {
        bearishScore += 20;
        reasons.push('Bearish EMA alignment');
      }
      // Partial alignment
      else if (ema9 > ema21 && currentPrice > ema9) {
        bullishScore += 10;
        reasons.push('Partial bullish EMA');
      } else if (ema9 < ema21 && currentPrice < ema9) {
        bearishScore += 10;
        reasons.push('Partial bearish EMA');
      }
    }

    // 4. Bollinger Bands (15 points)
    if (indicators.bollingerBands) {
      const { upper, lower, middle } = indicators.bollingerBands;

      if (currentPrice < lower) {
        bullishScore += 15;
        reasons.push('Price below lower BB');
      } else if (currentPrice > upper) {
        bearishScore += 15;
        reasons.push('Price above upper BB');
      } else if (currentPrice < middle) {
        bullishScore += 5;
      } else if (currentPrice > middle) {
        bearishScore += 5;
      }
    }

    // 5. Trend Strength (10 points)
    if (indicators.trendStrength) {
      if (indicators.trendStrength > 0.3) {
        bullishScore += 10;
        reasons.push(`Strong uptrend (${indicators.trendStrength.toFixed(2)})`);
      } else if (indicators.trendStrength < -0.3) {
        bearishScore += 10;
        reasons.push(`Strong downtrend (${indicators.trendStrength.toFixed(2)})`);
      }
    }

    // Calculate final signal
    const totalScore = bullishScore + bearishScore;
    const confidence = Math.max(bullishScore, bearishScore) / 100;

    let action = 'Hold';
    if (bullishScore > bearishScore && confidence > 0.6) {
      action = 'Buy';
      this.lastSignalTime = now;
    } else if (bearishScore > bullishScore && confidence > 0.6) {
      action = 'Sell';
      this.lastSignalTime = now;
    }

    const signal = {
      action,
      confidence,
      bullishScore,
      bearishScore,
      reasons: reasons.join(', '),
      timestamp: now,
      indicators: {
        rsi: indicators.rsi?.toFixed(2),
        macd: indicators.macd?.histogram?.toFixed(4),
        trend: indicators.trendStrength?.toFixed(2),
        price: currentPrice
      }
    };

    this.lastSignal = signal;
    this.signalHistory.push(signal);

    // Keep last 100 signals
    if (this.signalHistory.length > 100) {
      this.signalHistory.shift();
    }

    return signal;
  }

  logAnalysis(indicators, signal) {
    console.log('\n========== AI ANALYSIS ==========');
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`Price: $${indicators.currentPrice.toFixed(2)}`);
    console.log('\nIndicators:');
    console.log(`  RSI: ${indicators.rsi?.toFixed(2) || 'N/A'}`);
    console.log(`  MACD: ${indicators.macd?.macd?.toFixed(4) || 'N/A'}`);
    console.log(`  Signal: ${indicators.macd?.signal?.toFixed(4) || 'N/A'}`);
    console.log(`  Histogram: ${indicators.macd?.histogram?.toFixed(4) || 'N/A'}`);
    console.log(`  EMA9: ${indicators.ema.ema9?.toFixed(2) || 'N/A'}`);
    console.log(`  EMA21: ${indicators.ema.ema21?.toFixed(2) || 'N/A'}`);
    console.log(`  EMA50: ${indicators.ema.ema50?.toFixed(2) || 'N/A'}`);
    console.log(`  Trend Strength: ${indicators.trendStrength?.toFixed(2) || 'N/A'}`);

    if (indicators.bollingerBands) {
      console.log(`  BB Upper: ${indicators.bollingerBands.upper.toFixed(2)}`);
      console.log(`  BB Middle: ${indicators.bollingerBands.middle.toFixed(2)}`);
      console.log(`  BB Lower: ${indicators.bollingerBands.lower.toFixed(2)}`);
    }

    console.log('\nSignal:');
    console.log(`  Action: ${signal.action}`);
    console.log(`  Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`  Bullish Score: ${signal.bullishScore}`);
    console.log(`  Bearish Score: ${signal.bearishScore}`);
    console.log(`  Reasons: ${signal.reasons}`);
    console.log('================================\n');
  }

  getLastSignal() {
    return this.lastSignal;
  }

  getSignalHistory() {
    return this.signalHistory;
  }

  /**
   * Calculate win rate from signal history
   */
  getPerformanceMetrics() {
    if (this.signalHistory.length < 10) {
      return null;
    }

    const buySignals = this.signalHistory.filter(s => s.action === 'Buy');
    const sellSignals = this.signalHistory.filter(s => s.action === 'Sell');

    return {
      totalSignals: this.signalHistory.length,
      buySignals: buySignals.length,
      sellSignals: sellSignals.length,
      avgConfidence: this.signalHistory.reduce((acc, s) => acc + s.confidence, 0) / this.signalHistory.length
    };
  }
}

module.exports = AIDecisionCore;
