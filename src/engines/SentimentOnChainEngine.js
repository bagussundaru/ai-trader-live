const axios = require('axios');

/**
 * Sentiment & On-Chain Engine
 *
 * Tracks:
 * On-Chain Metrics:
 * - NUPL (Net Unrealized Profit/Loss)
 * - MVRV (Market Value to Realized Value)
 * - SOPR (Spent Output Profit Ratio)
 * - Exchange reserves
 * - Whale movements
 *
 * Sentiment Metrics:
 * - Fear & Greed Index
 * - Funding rate sentiment
 * - Liquidation heatmap
 * - Social sentiment
 *
 * This reveals market psychology and on-chain momentum
 */
class SentimentOnChainEngine {
  constructor() {
    this.sentimentData = {
      fearGreed: null,
      onChain: null,
      social: null
    };

    this.lastUpdate = 0;
    this.updateInterval = 1800000; // 30 minutes
  }

  /**
   * Main analysis function
   */
  async analyze() {
    try {
      // Check if update needed
      if (Date.now() - this.lastUpdate < this.updateInterval) {
        return this.generateSignal(this.sentimentData);
      }

      console.log('[Sentiment] Fetching sentiment & on-chain data...');

      const [fearGreed, onChain] = await Promise.all([
        this.getFearGreedIndex(),
        this.getOnChainMetrics()
      ]);

      this.sentimentData = { fearGreed, onChain };
      this.lastUpdate = Date.now();

      const signal = this.generateSignal(this.sentimentData);
      this.logSignal(signal);

      return signal;

    } catch (error) {
      console.error('[Sentiment] Analysis error:', error.message);
      return null;
    }
  }

  /**
   * Get Fear & Greed Index
   */
  async getFearGreedIndex() {
    try {
      // Alternative.me API (free)
      const response = await axios.get('https://api.alternative.me/fng/?limit=7');

      if (response.data && response.data.data) {
        const current = response.data.data[0];
        const previous = response.data.data[1];

        const value = parseInt(current.value);
        const prevValue = parseInt(previous.value);
        const change = value - prevValue;

        return {
          value,
          classification: current.value_classification,
          change,
          trend: change > 0 ? 'increasing' : 'decreasing',
          signal: this.classifyFearGreed(value),
          timestamp: current.timestamp
        };
      }

      return null;
    } catch (error) {
      console.error('[Sentiment] Fear & Greed error:', error.message);
      // Return mock data if API fails
      return {
        value: 50,
        classification: 'Neutral',
        change: 0,
        trend: 'stable',
        signal: 'NEUTRAL'
      };
    }
  }

  classifyFearGreed(value) {
    if (value <= 20) return { label: 'EXTREME_FEAR', action: 'CONTRARIAN_BUY' };
    if (value <= 40) return { label: 'FEAR', action: 'CAUTIOUS_BUY' };
    if (value <= 60) return { label: 'NEUTRAL', action: 'NORMAL' };
    if (value <= 80) return { label: 'GREED', action: 'CAUTIOUS_SELL' };
    return { label: 'EXTREME_GREED', action: 'CONTRARIAN_SELL' };
  }

  /**
   * Get on-chain metrics
   */
  async getOnChainMetrics() {
    try {
      // In production, use Glassnode API, CryptoQuant, or IntoTheBlock
      // For now, mock data structure

      // TODO: Integrate with Glassnode/CryptoQuant API
      return {
        nupl: {
          value: 0.45,
          classification: 'optimism',
          signal: 'SLIGHTLY_BULLISH'
        },
        mvrv: {
          value: 1.8,
          zscore: 0.5,
          signal: 'FAIR_VALUE'
        },
        sopr: {
          value: 1.02,
          signal: 'SLIGHT_PROFIT_TAKING'
        },
        exchangeReserves: {
          btc: 2500000,
          change: -50000, // Decreasing = bullish (coins leaving exchanges)
          signal: 'BULLISH'
        },
        whaleActivity: {
          largeTransactions: 245,
          trend: 'increasing',
          signal: 'ACCUMULATION'
        }
      };
    } catch (error) {
      console.error('[Sentiment] On-chain error:', error.message);
      return null;
    }
  }

  /**
   * Generate comprehensive sentiment signal
   */
  generateSignal(data) {
    const { fearGreed, onChain } = data;

    if (!fearGreed && !onChain) {
      return { available: false, reason: 'No data' };
    }

    let bullishScore = 0;
    let bearishScore = 0;
    const factors = [];

    // 1. Fear & Greed Analysis (35 points)
    if (fearGreed) {
      const fgSignal = fearGreed.signal;

      if (fgSignal.label === 'EXTREME_FEAR') {
        bullishScore += 35; // Contrarian buy
        factors.push(`Extreme Fear (${fearGreed.value}) - contrarian buy opportunity`);
      } else if (fgSignal.label === 'FEAR') {
        bullishScore += 20;
        factors.push(`Fear (${fearGreed.value}) - market cautious`);
      } else if (fgSignal.label === 'EXTREME_GREED') {
        bearishScore += 35; // Contrarian sell
        factors.push(`Extreme Greed (${fearGreed.value}) - contrarian sell signal`);
      } else if (fgSignal.label === 'GREED') {
        bearishScore += 20;
        factors.push(`Greed (${fearGreed.value}) - market euphoric`);
      }
    }

    // 2. NUPL Analysis (20 points)
    if (onChain?.nupl) {
      const nupl = onChain.nupl.value;

      if (nupl < 0) {
        bullishScore += 20; // Capitulation
        factors.push(`NUPL ${(nupl * 100).toFixed(1)}% - market in capitulation`);
      } else if (nupl > 0.75) {
        bearishScore += 20; // Euphoria
        factors.push(`NUPL ${(nupl * 100).toFixed(1)}% - market in euphoria`);
      } else if (nupl > 0.5) {
        bullishScore += 10;
        factors.push(`NUPL ${(nupl * 100).toFixed(1)}% - healthy optimism`);
      }
    }

    // 3. MVRV Analysis (15 points)
    if (onChain?.mvrv) {
      const mvrv = onChain.mvrv.value;

      if (mvrv < 1) {
        bullishScore += 15; // Below realized price
        factors.push(`MVRV ${mvrv.toFixed(2)} - below realized value`);
      } else if (mvrv > 3) {
        bearishScore += 15; // Overvalued
        factors.push(`MVRV ${mvrv.toFixed(2)} - overvalued territory`);
      }
    }

    // 4. Exchange Reserves (15 points)
    if (onChain?.exchangeReserves) {
      const change = onChain.exchangeReserves.change;

      if (change < -10000) {
        bullishScore += 15; // Coins leaving exchanges
        factors.push(`Exchange reserves down ${Math.abs(change).toFixed(0)} BTC - accumulation`);
      } else if (change > 10000) {
        bearishScore += 15; // Coins moving to exchanges
        factors.push(`Exchange reserves up ${change.toFixed(0)} BTC - distribution`);
      }
    }

    // 5. Whale Activity (15 points)
    if (onChain?.whaleActivity) {
      if (onChain.whaleActivity.signal === 'ACCUMULATION') {
        bullishScore += 15;
        factors.push('Whale accumulation detected');
      } else if (onChain.whaleActivity.signal === 'DISTRIBUTION') {
        bearishScore += 15;
        factors.push('Whale distribution detected');
      }
    }

    // Calculate final signal
    const netScore = bullishScore - bearishScore;
    const confidence = Math.abs(netScore) / 100;

    let signal, action;

    if (netScore > 40) {
      signal = 'STRONG_BULLISH';
      action = 'SENTIMENT_SUPPORTS_LONGS';
    } else if (netScore > 20) {
      signal = 'BULLISH';
      action = 'SLIGHTLY_BULLISH_SENTIMENT';
    } else if (netScore < -40) {
      signal = 'STRONG_BEARISH';
      action = 'SENTIMENT_SUPPORTS_SHORTS';
    } else if (netScore < -20) {
      signal = 'BEARISH';
      action = 'SLIGHTLY_BEARISH_SENTIMENT';
    } else {
      signal = 'NEUTRAL';
      action = 'MIXED_SENTIMENT';
    }

    return {
      available: true,
      signal,
      action,
      confidence,
      bullishScore,
      bearishScore,
      netScore,
      factors,
      data: {
        fearGreed: fearGreed?.value,
        fearGreedClass: fearGreed?.classification,
        nupl: onChain?.nupl?.value,
        mvrv: onChain?.mvrv?.value,
        exchangeFlow: onChain?.exchangeReserves?.change
      }
    };
  }

  logSignal(signal) {
    if (!signal || !signal.available) {
      console.log('[Sentiment] No signal available');
      return;
    }

    console.log('\n========== SENTIMENT & ON-CHAIN ==========');
    console.log(`Signal: ${signal.signal}`);
    console.log(`Action: ${signal.action}`);
    console.log(`Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`Net Score: ${signal.netScore} (Bull: ${signal.bullishScore}, Bear: ${signal.bearishScore})`);
    console.log('\nFactors:');
    signal.factors.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor}`);
    });
    console.log('\nData:');
    if (signal.data.fearGreed) console.log(`  Fear & Greed: ${signal.data.fearGreed} (${signal.data.fearGreedClass})`);
    if (signal.data.nupl) console.log(`  NUPL: ${(signal.data.nupl * 100).toFixed(1)}%`);
    if (signal.data.mvrv) console.log(`  MVRV: ${signal.data.mvrv.toFixed(2)}`);
    if (signal.data.exchangeFlow) console.log(`  Exchange Flow: ${signal.data.exchangeFlow > 0 ? '+' : ''}${signal.data.exchangeFlow.toFixed(0)} BTC`);
    console.log('=========================================\n');
  }

  /**
   * Get sentiment bias multiplier
   */
  getSentimentMultiplier() {
    const signal = this.generateSignal(this.sentimentData);

    if (!signal || !signal.available) return 1.0;

    const multipliers = {
      'STRONG_BULLISH': 1.2,
      'BULLISH': 1.1,
      'NEUTRAL': 1.0,
      'BEARISH': 0.9,
      'STRONG_BEARISH': 0.7
    };

    return multipliers[signal.signal] || 1.0;
  }
}

module.exports = SentimentOnChainEngine;
