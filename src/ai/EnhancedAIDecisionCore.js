const AIDecisionCore = require('./AIDecisionCore');
const MarketRegimeDetector = require('./MarketRegimeDetector');

/**
 * Enhanced AI Decision Core
 *
 * Multi-Factor Crypto Model combining:
 * 1. Technical Analysis (RSI, MACD, EMA, BB) - 25%
 * 2. Market Regime Detection - 20%
 * 3. Order Flow (CVD, OI, Funding) - 25%
 * 4. Macro Fundamentals (DXY, US10Y, ETF) - 15%
 * 5. Sentiment & On-Chain (Fear/Greed, NUPL, MVRV) - 15%
 *
 * This is a professional-grade decision system
 */
class EnhancedAIDecisionCore extends AIDecisionCore {
  constructor(orderFlowEngine, macroEngine, sentimentEngine) {
    super();

    this.regimeDetector = new MarketRegimeDetector();
    this.orderFlowEngine = orderFlowEngine;
    this.macroEngine = macroEngine;
    this.sentimentEngine = sentimentEngine;

    // Weights for each factor
    this.weights = {
      technical: 0.25,
      regime: 0.20,
      orderFlow: 0.25,
      macro: 0.15,
      sentiment: 0.15
    };
  }

  /**
   * Enhanced analysis with all factors
   */
  async analyzeEnhanced(marketData) {
    try {
      console.log('\n========== MULTI-FACTOR ANALYSIS ==========');

      // 1. Market Regime Detection
      const regime = this.regimeDetector.detect(marketData);

      // Check if regime allows trading
      if (!this.regimeDetector.shouldTrade()) {
        console.log(`[Enhanced AI] ⚠️ Market regime ${regime.regime} - AVOIDING TRADE`);
        return {
          action: 'Hold',
          confidence: 0,
          reason: `Market regime unfavorable: ${regime.reason}`,
          regime
        };
      }

      // 2. Technical Analysis (base)
      const technicalSignal = this.analyze(marketData);

      // 3. Order Flow Analysis
      const orderFlowSignal = await this.orderFlowEngine.analyze();

      // 4. Macro Fundamental Analysis
      const macroSignal = await this.macroEngine.analyze();

      // Check if macro conditions forbid trading
      if (macroEngine.shouldAvoidTrading()) {
        console.log('[Enhanced AI] ⚠️ Macro conditions unfavorable - AVOIDING TRADE');
        return {
          action: 'Hold',
          confidence: 0,
          reason: 'Macro conditions unfavorable',
          macroSignal
        };
      }

      // 5. Sentiment & On-Chain Analysis
      const sentimentSignal = await this.sentimentEngine.analyze();

      // 6. Combine all signals
      const enhancedSignal = this.combineSignals({
        technical: technicalSignal,
        regime,
        orderFlow: orderFlowSignal,
        macro: macroSignal,
        sentiment: sentimentSignal
      });

      this.logEnhancedSignal(enhancedSignal);

      return enhancedSignal;

    } catch (error) {
      console.error('[Enhanced AI] Analysis error:', error.message);
      return { action: 'Hold', confidence: 0, reason: 'Analysis error' };
    }
  }

  /**
   * Combine all signals using weighted scoring
   */
  combineSignals(signals) {
    const { technical, regime, orderFlow, macro, sentiment } = signals;

    let totalBullishScore = 0;
    let totalBearishScore = 0;
    const allFactors = [];

    // 1. Technical Analysis Score (25%)
    if (technical) {
      const techBullish = technical.bullishScore * this.weights.technical;
      const techBearish = technical.bearishScore * this.weights.technical;

      totalBullishScore += techBullish;
      totalBearishScore += techBearish;

      allFactors.push({
        category: 'Technical',
        weight: this.weights.technical,
        bullish: techBullish,
        bearish: techBearish,
        details: technical.reasons
      });
    }

    // 2. Regime Score (20%)
    if (regime) {
      // Regime acts as a modifier/filter
      const regimeScore = regime.confidence * 100 * this.weights.regime;

      if (regime.action === 'TREND_FOLLOW' && technical.action !== 'Hold') {
        // Boost technical signal in trending market
        totalBullishScore += regimeScore * 0.5;
      } else if (regime.action === 'MEAN_REVERSION') {
        // Slight boost to counter-trend setups
        totalBullishScore += regimeScore * 0.3;
      }

      allFactors.push({
        category: 'Regime',
        weight: this.weights.regime,
        regime: regime.regime,
        action: regime.action,
        details: regime.reason
      });
    }

    // 3. Order Flow Score (25%)
    if (orderFlow && orderFlow.available) {
      const ofBullish = orderFlow.bullishScore * this.weights.orderFlow;
      const ofBearish = orderFlow.bearishScore * this.weights.orderFlow;

      totalBullishScore += ofBullish;
      totalBearishScore += ofBearish;

      allFactors.push({
        category: 'OrderFlow',
        weight: this.weights.orderFlow,
        bullish: ofBullish,
        bearish: ofBearish,
        details: orderFlow.factors.join('; ')
      });
    }

    // 4. Macro Score (15%)
    if (macro) {
      const macroBullish = Math.max(0, macro.bullishScore) * this.weights.macro;
      const macroBearish = Math.max(0, macro.bearishScore) * this.weights.macro;

      totalBullishScore += macroBullish;
      totalBearishScore += macroBearish;

      allFactors.push({
        category: 'Macro',
        weight: this.weights.macro,
        bullish: macroBullish,
        bearish: macroBearish,
        signal: macro.signal,
        details: macro.factors.join('; ')
      });
    }

    // 5. Sentiment Score (15%)
    if (sentiment && sentiment.available) {
      const sentBullish = Math.max(0, sentiment.bullishScore) * this.weights.sentiment;
      const sentBearish = Math.max(0, sentiment.bearishScore) * this.weights.sentiment;

      totalBullishScore += sentBullish;
      totalBearishScore += sentBearish;

      allFactors.push({
        category: 'Sentiment',
        weight: this.weights.sentiment,
        bullish: sentBullish,
        bearish: sentBearish,
        signal: sentiment.signal,
        details: sentiment.factors.join('; ')
      });
    }

    // Calculate final signal
    const netScore = totalBullishScore - totalBearishScore;
    const totalScore = totalBullishScore + totalBearishScore;
    const rawConfidence = Math.abs(netScore) / 100;

    // Apply regime multiplier to confidence
    const regimeMultiplier = regime ? this.regimeDetector.getRiskMultiplier() : 1.0;
    const adjustedConfidence = Math.min(rawConfidence * regimeMultiplier, 1.0);

    // Determine action
    let action = 'Hold';
    const confidenceThreshold = 0.65; // Higher threshold for multi-factor model

    if (totalBullishScore > totalBearishScore && adjustedConfidence >= confidenceThreshold) {
      action = 'Buy';
    } else if (totalBearishScore > totalBullishScore && adjustedConfidence >= confidenceThreshold) {
      action = 'Sell';
    }

    return {
      action,
      confidence: adjustedConfidence,
      rawConfidence,
      bullishScore: totalBullishScore.toFixed(2),
      bearishScore: totalBearishScore.toFixed(2),
      netScore: netScore.toFixed(2),
      regimeMultiplier,
      factors: allFactors,
      signals: {
        technical,
        regime,
        orderFlow,
        macro,
        sentiment
      },
      timestamp: Date.now()
    };
  }

  logEnhancedSignal(signal) {
    console.log('\n========== ENHANCED AI DECISION ==========');
    console.log(`🎯 Final Action: ${signal.action}`);
    console.log(`📊 Confidence: ${(signal.confidence * 100).toFixed(1)}% (raw: ${(signal.rawConfidence * 100).toFixed(1)}%)`);
    console.log(`📈 Bullish Score: ${signal.bullishScore} | Bearish Score: ${signal.bearishScore}`);
    console.log(`⚖️  Net Score: ${signal.netScore}`);
    console.log(`🔄 Regime Multiplier: ${signal.regimeMultiplier.toFixed(2)}x`);

    console.log('\n📋 Factor Breakdown:');
    signal.factors.forEach(factor => {
      console.log(`\n  ${factor.category} (${(factor.weight * 100).toFixed(0)}% weight):`);
      if (factor.bullish !== undefined) {
        console.log(`    Bullish: ${factor.bullish.toFixed(2)} | Bearish: ${factor.bearish.toFixed(2)}`);
      }
      if (factor.regime) console.log(`    Regime: ${factor.regime} - ${factor.action}`);
      if (factor.signal) console.log(`    Signal: ${factor.signal}`);
      if (factor.details) console.log(`    Details: ${factor.details}`);
    });

    console.log('\n==========================================\n');
  }

  /**
   * Get combined risk multiplier from all engines
   */
  getCombinedRiskMultiplier() {
    const regimeMultiplier = this.regimeDetector.getRiskMultiplier();
    const macroMultiplier = this.macroEngine.getMacroBiasMultiplier();
    const sentimentMultiplier = this.sentimentEngine.getSentimentMultiplier();

    // Average of all multipliers
    return (regimeMultiplier + macroMultiplier + sentimentMultiplier) / 3;
  }
}

module.exports = EnhancedAIDecisionCore;
