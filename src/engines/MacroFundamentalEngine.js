const axios = require('axios');

/**
 * Macro Fundamental Engine
 *
 * Tracks:
 * - Fed events (FOMC, rate decisions)
 * - Economic data (CPI, NFP, unemployment)
 * - DXY (Dollar Index)
 * - US10Y (Treasury yields)
 * - Global liquidity
 * - ETF flows (Bitcoin/Ethereum ETFs)
 * - Correlation with traditional markets
 *
 * This prevents trading against macro trends
 */
class MacroFundamentalEngine {
  constructor() {
    this.macroData = {
      fed: null,
      economicData: null,
      dxy: null,
      us10y: null,
      etfFlows: null,
      btcCorrelation: null
    };

    this.macroSignal = null;
    this.lastUpdate = 0;
    this.updateInterval = 3600000; // 1 hour
  }

  /**
   * Main analysis function
   */
  async analyze() {
    try {
      // Check if we need to update
      if (Date.now() - this.lastUpdate < this.updateInterval) {
        return this.macroSignal;
      }

      console.log('[Macro] Fetching fundamental data...');

      // Fetch data from various sources
      const [dxy, us10y, etfFlows] = await Promise.all([
        this.getDXY(),
        this.getUS10Y(),
        this.getETFFlows()
      ]);

      // Get economic calendar for upcoming events
      const upcomingEvents = await this.getEconomicCalendar();

      // Generate macro signal
      const signal = this.generateMacroSignal({
        dxy,
        us10y,
        etfFlows,
        upcomingEvents
      });

      this.macroSignal = signal;
      this.lastUpdate = Date.now();

      this.logMacroSignal(signal);
      return signal;

    } catch (error) {
      console.error('[Macro] Analysis error:', error.message);
      return this.macroSignal; // Return last known signal
    }
  }

  /**
   * Get DXY (Dollar Index) data
   */
  async getDXY() {
    try {
      // Using Alpha Vantage or similar free API
      // For now, we'll use a proxy endpoint or mock data
      // In production, use: Alpha Vantage, Yahoo Finance API, or Fed API

      // Placeholder implementation
      // TODO: Replace with actual API call
      return {
        current: 104.5,
        change: -0.3,
        trend: 'weakening',
        signal: 'BULLISH_FOR_BTC' // Weak dollar = bullish for crypto
      };
    } catch (error) {
      console.error('[Macro] DXY fetch error:', error.message);
      return null;
    }
  }

  /**
   * Get US 10-Year Treasury Yield
   */
  async getUS10Y() {
    try {
      // Placeholder implementation
      // TODO: Replace with actual API call (FRED API, Alpha Vantage)
      return {
        current: 4.25,
        change: 0.05,
        trend: 'rising',
        signal: 'BEARISH_FOR_BTC' // Rising yields = bearish for risk assets
      };
    } catch (error) {
      console.error('[Macro] US10Y fetch error:', error.message);
      return null;
    }
  }

  /**
   * Get Bitcoin/Ethereum ETF flows
   */
  async getETFFlows() {
    try {
      // Data sources: CoinGlass, Farside Investors, or direct from exchanges
      // Placeholder implementation
      // TODO: Integrate with CoinGlass API or similar

      return {
        btcInflow: 250000000, // $250M inflow
        ethInflow: 50000000,  // $50M inflow
        netFlow: 300000000,
        trend: 'positive',
        signal: 'BULLISH'
      };
    } catch (error) {
      console.error('[Macro] ETF flows error:', error.message);
      return null;
    }
  }

  /**
   * Get economic calendar events
   */
  async getEconomicCalendar() {
    try {
      // Sources: Investing.com API, ForexFactory, TradingEconomics
      // Placeholder implementation
      // TODO: Integrate with economic calendar API

      const now = Date.now();
      const next24h = now + 86400000;

      // Mock upcoming events
      const upcomingEvents = [
        {
          name: 'FOMC Meeting',
          date: next24h + 3600000,
          importance: 'high',
          expectedImpact: 'HIGH_VOLATILITY'
        },
        {
          name: 'CPI Data',
          date: next24h + 7200000,
          importance: 'high',
          expectedImpact: 'HIGH_VOLATILITY'
        }
      ];

      // Check if major event in next 24 hours
      const hasHighImpactEvent = upcomingEvents.some(e =>
        e.importance === 'high' && e.date - now < 86400000
      );

      return {
        events: upcomingEvents,
        hasHighImpactEvent,
        signal: hasHighImpactEvent ? 'REDUCE_EXPOSURE' : 'NORMAL'
      };
    } catch (error) {
      console.error('[Macro] Calendar error:', error.message);
      return { events: [], hasHighImpactEvent: false, signal: 'NORMAL' };
    }
  }

  /**
   * Generate macro signal from all fundamental data
   */
  generateMacroSignal(data) {
    const { dxy, us10y, etfFlows, upcomingEvents } = data;

    let bullishScore = 0;
    let bearishScore = 0;
    const factors = [];

    // 1. DXY Analysis (25 points)
    if (dxy) {
      if (dxy.trend === 'weakening') {
        bullishScore += 25;
        factors.push(`Weak dollar (${dxy.current.toFixed(2)}) - bullish for crypto`);
      } else if (dxy.trend === 'strengthening') {
        bearishScore += 25;
        factors.push(`Strong dollar (${dxy.current.toFixed(2)}) - bearish for crypto`);
      }
    }

    // 2. US10Y Analysis (20 points)
    if (us10y) {
      if (us10y.trend === 'falling') {
        bullishScore += 20;
        factors.push(`Falling yields (${us10y.current.toFixed(2)}%) - risk-on`);
      } else if (us10y.trend === 'rising') {
        bearishScore += 20;
        factors.push(`Rising yields (${us10y.current.toFixed(2)}%) - risk-off`);
      }
    }

    // 3. ETF Flows Analysis (30 points)
    if (etfFlows) {
      if (etfFlows.netFlow > 100000000) { // >$100M inflow
        bullishScore += 30;
        factors.push(`Strong ETF inflow ($${(etfFlows.netFlow / 1000000).toFixed(0)}M)`);
      } else if (etfFlows.netFlow > 0) {
        bullishScore += 15;
        factors.push(`Positive ETF flow ($${(etfFlows.netFlow / 1000000).toFixed(0)}M)`);
      } else if (etfFlows.netFlow < -100000000) { // >$100M outflow
        bearishScore += 30;
        factors.push(`Strong ETF outflow ($${(etfFlows.netFlow / 1000000).toFixed(0)}M)`);
      } else if (etfFlows.netFlow < 0) {
        bearishScore += 15;
        factors.push(`Negative ETF flow ($${(etfFlows.netFlow / 1000000).toFixed(0)}M)`);
      }
    }

    // 4. Economic Events Analysis (25 points)
    if (upcomingEvents.hasHighImpactEvent) {
      bearishScore += 25;
      factors.push('High impact macro event in <24h - reduce exposure');
    }

    // Calculate final signal
    const netScore = bullishScore - bearishScore;
    const confidence = Math.abs(netScore) / 100;

    let signal;
    let action;

    if (upcomingEvents.hasHighImpactEvent) {
      signal = 'CAUTION';
      action = 'REDUCE_EXPOSURE';
    } else if (netScore > 40) {
      signal = 'STRONG_BULLISH';
      action = 'FAVORABLE_FOR_LONGS';
    } else if (netScore > 20) {
      signal = 'BULLISH';
      action = 'SLIGHTLY_FAVORABLE';
    } else if (netScore < -40) {
      signal = 'STRONG_BEARISH';
      action = 'FAVORABLE_FOR_SHORTS';
    } else if (netScore < -20) {
      signal = 'BEARISH';
      action = 'SLIGHTLY_UNFAVORABLE';
    } else {
      signal = 'NEUTRAL';
      action = 'NO_MACRO_BIAS';
    }

    return {
      signal,
      action,
      confidence,
      bullishScore,
      bearishScore,
      netScore,
      factors,
      data: {
        dxy: dxy?.current,
        us10y: us10y?.current,
        etfNetFlow: etfFlows?.netFlow,
        upcomingEvents: upcomingEvents?.events?.length || 0
      },
      timestamp: Date.now()
    };
  }

  logMacroSignal(signal) {
    console.log('\n========== MACRO FUNDAMENTAL ==========');
    console.log(`Signal: ${signal.signal}`);
    console.log(`Action: ${signal.action}`);
    console.log(`Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`Net Score: ${signal.netScore} (Bull: ${signal.bullishScore}, Bear: ${signal.bearishScore})`);
    console.log('\nFactors:');
    signal.factors.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor}`);
    });
    console.log('\nData:');
    if (signal.data.dxy) console.log(`  DXY: ${signal.data.dxy.toFixed(2)}`);
    if (signal.data.us10y) console.log(`  US10Y: ${signal.data.us10y.toFixed(2)}%`);
    if (signal.data.etfNetFlow) console.log(`  ETF Flow: $${(signal.data.etfNetFlow / 1000000).toFixed(0)}M`);
    console.log(`  Upcoming Events: ${signal.data.upcomingEvents}`);
    console.log('======================================\n');
  }

  getCurrentSignal() {
    return this.macroSignal;
  }

  /**
   * Check if it's safe to trade based on macro conditions
   */
  shouldAvoidTrading() {
    if (!this.macroSignal) return false;

    // Avoid trading if:
    // 1. High impact event coming
    // 2. Extremely bearish macro
    return (
      this.macroSignal.action === 'REDUCE_EXPOSURE' ||
      this.macroSignal.signal === 'STRONG_BEARISH'
    );
  }

  /**
   * Get macro bias multiplier for position sizing
   */
  getMacroBiasMultiplier() {
    if (!this.macroSignal) return 1.0;

    const multipliers = {
      'STRONG_BULLISH': 1.3,
      'BULLISH': 1.1,
      'NEUTRAL': 1.0,
      'BEARISH': 0.8,
      'STRONG_BEARISH': 0.5,
      'CAUTION': 0.6
    };

    return multipliers[this.macroSignal.signal] || 1.0;
  }
}

module.exports = MacroFundamentalEngine;
