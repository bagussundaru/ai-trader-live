const { RestClientV5 } = require('bybit-api');
const config = require('../config/config');

/**
 * Order Flow Engine
 *
 * Analyzes:
 * - CVD (Cumulative Volume Delta) - buying vs selling pressure
 * - Open Interest - total open contracts
 * - Funding Rate - perpetual swap funding
 * - Liquidations - forced closures
 * - Order Book Imbalance - bid/ask pressure
 *
 * This reveals TRUE market momentum
 */
class OrderFlowEngine {
  constructor() {
    this.client = new RestClientV5({
      key: config.bybit.apiKey,
      secret: config.bybit.apiSecret,
      testnet: config.bybit.testnet
    });

    this.symbol = config.trading.symbol;
    this.category = config.trading.category;

    this.cvd = 0;
    this.openInterest = 0;
    this.fundingRate = 0;
    this.orderBookData = null;
    this.liquidationData = [];
  }

  /**
   * Main analysis function
   */
  async analyze() {
    try {
      const [funding, oi, orderBook] = await Promise.all([
        this.getFundingRate(),
        this.getOpenInterest(),
        this.getOrderBook()
      ]);

      const analysis = this.generateAnalysis({
        funding,
        oi,
        orderBook
      });

      this.logAnalysis(analysis);
      return analysis;

    } catch (error) {
      console.error('[OrderFlow] Analysis error:', error.message);
      return null;
    }
  }

  /**
   * Get current funding rate
   */
  async getFundingRate() {
    try {
      const response = await this.client.getTickers({
        category: this.category,
        symbol: this.symbol
      });

      if (response.retCode === 0 && response.result.list.length > 0) {
        const ticker = response.result.list[0];
        const fundingRate = parseFloat(ticker.fundingRate || 0);
        const nextFundingTime = ticker.nextFundingTime;

        this.fundingRate = fundingRate;

        return {
          rate: fundingRate,
          ratePercent: fundingRate * 100,
          annualized: fundingRate * 3 * 365 * 100, // 3 times per day
          nextFundingTime,
          sentiment: this.classifyFundingRate(fundingRate)
        };
      }

      return null;
    } catch (error) {
      console.error('[OrderFlow] Funding rate error:', error.message);
      return null;
    }
  }

  classifyFundingRate(rate) {
    const percent = rate * 100;

    if (percent > 0.05) return { label: 'extremely_bullish', signal: 'CAUTION_LONG' };
    if (percent > 0.02) return { label: 'bullish', signal: 'NEUTRAL' };
    if (percent > -0.02) return { label: 'neutral', signal: 'BALANCED' };
    if (percent > -0.05) return { label: 'bearish', signal: 'NEUTRAL' };
    return { label: 'extremely_bearish', signal: 'CAUTION_SHORT' };
  }

  /**
   * Get open interest
   */
  async getOpenInterest() {
    try {
      const response = await this.client.getOpenInterest({
        category: this.category,
        symbol: this.symbol,
        intervalTime: '1h'
      });

      if (response.retCode === 0 && response.result.list.length > 0) {
        const current = response.result.list[0];
        const previous = response.result.list[1] || current;

        const currentOI = parseFloat(current.openInterest);
        const previousOI = parseFloat(previous.openInterest);

        this.openInterest = currentOI;

        const change = ((currentOI - previousOI) / previousOI) * 100;

        return {
          current: currentOI,
          change: change,
          trend: this.classifyOITrend(change),
          timestamp: current.timestamp
        };
      }

      return null;
    } catch (error) {
      console.error('[OrderFlow] Open interest error:', error.message);
      return null;
    }
  }

  classifyOITrend(change) {
    if (change > 5) return { label: 'strong_increase', signal: 'MOMENTUM_UP' };
    if (change > 2) return { label: 'increase', signal: 'BUILDING' };
    if (change > -2) return { label: 'stable', signal: 'NEUTRAL' };
    if (change > -5) return { label: 'decrease', signal: 'WEAKENING' };
    return { label: 'strong_decrease', signal: 'MOMENTUM_DOWN' };
  }

  /**
   * Get order book for imbalance analysis
   */
  async getOrderBook() {
    try {
      const response = await this.client.getOrderbook({
        category: this.category,
        symbol: this.symbol,
        limit: 50
      });

      if (response.retCode === 0) {
        const { b: bids, a: asks } = response.result;

        // Calculate total bid/ask volume
        const bidVolume = bids.reduce((sum, [price, size]) => sum + parseFloat(size), 0);
        const askVolume = asks.reduce((sum, [price, size]) => sum + parseFloat(size), 0);

        // Calculate bid/ask ratio
        const ratio = bidVolume / askVolume;

        // Calculate weighted average prices
        const bidWeightedSum = bids.reduce((sum, [price, size]) => {
          return sum + (parseFloat(price) * parseFloat(size));
        }, 0);
        const askWeightedSum = asks.reduce((sum, [price, size]) => {
          return sum + (parseFloat(price) * parseFloat(size));
        }, 0);

        const bidWAP = bidWeightedSum / bidVolume;
        const askWAP = askWeightedSum / askVolume;
        const spread = ((askWAP - bidWAP) / bidWAP) * 100;

        this.orderBookData = {
          bidVolume,
          askVolume,
          ratio,
          bidWAP,
          askWAP,
          spread,
          timestamp: response.time
        };

        return {
          bidVolume,
          askVolume,
          ratio,
          spread,
          imbalance: this.classifyImbalance(ratio),
          pressure: ratio > 1 ? 'BUY' : 'SELL'
        };
      }

      return null;
    } catch (error) {
      console.error('[OrderFlow] Order book error:', error.message);
      return null;
    }
  }

  classifyImbalance(ratio) {
    if (ratio > 1.5) return { label: 'strong_buy_pressure', signal: 'BULLISH' };
    if (ratio > 1.2) return { label: 'buy_pressure', signal: 'SLIGHTLY_BULLISH' };
    if (ratio > 0.8) return { label: 'balanced', signal: 'NEUTRAL' };
    if (ratio > 0.6) return { label: 'sell_pressure', signal: 'SLIGHTLY_BEARISH' };
    return { label: 'strong_sell_pressure', signal: 'BEARISH' };
  }

  /**
   * Calculate CVD from recent trades
   */
  calculateCVD(trades) {
    // CVD = Sum of (Buy Volume - Sell Volume)
    let cvd = this.cvd;

    for (const trade of trades) {
      const volume = parseFloat(trade.size);
      const side = trade.side;

      if (side === 'Buy') {
        cvd += volume;
      } else {
        cvd -= volume;
      }
    }

    this.cvd = cvd;
    return cvd;
  }

  /**
   * Generate comprehensive order flow analysis
   */
  generateAnalysis(data) {
    const { funding, oi, orderBook } = data;

    if (!funding || !oi || !orderBook) {
      return {
        available: false,
        reason: 'Insufficient data'
      };
    }

    // Scoring system
    let bullishScore = 0;
    let bearishScore = 0;
    const factors = [];

    // 1. Funding Rate Analysis (30 points)
    if (funding.sentiment.label === 'extremely_bullish') {
      bearishScore += 30; // Overheated longs - potential reversal
      factors.push('Funding extremely high - longs overleveraged');
    } else if (funding.sentiment.label === 'bullish') {
      bullishScore += 15;
      factors.push('Positive funding - bullish sentiment');
    } else if (funding.sentiment.label === 'bearish') {
      bearishScore += 15;
      factors.push('Negative funding - bearish sentiment');
    } else if (funding.sentiment.label === 'extremely_bearish') {
      bullishScore += 30; // Overheated shorts - potential reversal
      factors.push('Funding extremely negative - shorts overleveraged');
    }

    // 2. Open Interest Analysis (25 points)
    if (oi.trend.label === 'strong_increase') {
      bullishScore += 25;
      factors.push('Strong OI increase - momentum building');
    } else if (oi.trend.label === 'increase') {
      bullishScore += 15;
      factors.push('OI increasing - fresh positions');
    } else if (oi.trend.label === 'strong_decrease') {
      bearishScore += 25;
      factors.push('Strong OI decrease - momentum fading');
    } else if (oi.trend.label === 'decrease') {
      bearishScore += 15;
      factors.push('OI decreasing - position unwinding');
    }

    // 3. Order Book Imbalance (25 points)
    if (orderBook.imbalance.label === 'strong_buy_pressure') {
      bullishScore += 25;
      factors.push('Strong bid pressure - buyers aggressive');
    } else if (orderBook.imbalance.label === 'buy_pressure') {
      bullishScore += 15;
      factors.push('Bid pressure - slight buy advantage');
    } else if (orderBook.imbalance.label === 'strong_sell_pressure') {
      bearishScore += 25;
      factors.push('Strong ask pressure - sellers aggressive');
    } else if (orderBook.imbalance.label === 'sell_pressure') {
      bearishScore += 15;
      factors.push('Ask pressure - slight sell advantage');
    }

    // 4. Spread Analysis (20 points)
    if (orderBook.spread < 0.01) {
      bullishScore += 10;
      bearishScore += 10; // Tight spread = good liquidity
      factors.push('Tight spread - high liquidity');
    } else if (orderBook.spread > 0.1) {
      bullishScore -= 20;
      bearishScore -= 20; // Wide spread = poor liquidity
      factors.push('Wide spread - low liquidity, avoid trading');
    }

    // Calculate final signal
    const totalScore = Math.max(bullishScore, bearishScore);
    const confidence = totalScore / 100;
    const signal = bullishScore > bearishScore ? 'BULLISH' : bearishScore > bullishScore ? 'BEARISH' : 'NEUTRAL';

    return {
      available: true,
      signal,
      confidence,
      bullishScore,
      bearishScore,
      factors,
      data: {
        funding: {
          rate: funding.ratePercent.toFixed(4) + '%',
          annualized: funding.annualized.toFixed(2) + '%',
          sentiment: funding.sentiment.label
        },
        openInterest: {
          current: oi.current.toFixed(0),
          change: oi.change.toFixed(2) + '%',
          trend: oi.trend.label
        },
        orderBook: {
          bidVolume: orderBook.bidVolume.toFixed(2),
          askVolume: orderBook.askVolume.toFixed(2),
          ratio: orderBook.ratio.toFixed(2),
          imbalance: orderBook.imbalance.label,
          spread: orderBook.spread.toFixed(4) + '%'
        }
      }
    };
  }

  logAnalysis(analysis) {
    if (!analysis.available) {
      console.log('[OrderFlow] Data not available');
      return;
    }

    console.log('\n========== ORDER FLOW ANALYSIS ==========');
    console.log(`Signal: ${analysis.signal}`);
    console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`Bullish Score: ${analysis.bullishScore} | Bearish Score: ${analysis.bearishScore}`);
    console.log('\nFactors:');
    analysis.factors.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor}`);
    });
    console.log('\nData:');
    console.log('  Funding Rate:', analysis.data.funding.rate, `(${analysis.data.funding.sentiment})`);
    console.log('  Open Interest:', analysis.data.openInterest.current, `(${analysis.data.openInterest.change})`);
    console.log('  Order Book Ratio:', analysis.data.orderBook.ratio, `(${analysis.data.orderBook.imbalance})`);
    console.log('  Spread:', analysis.data.orderBook.spread);
    console.log('=========================================\n');
  }

  getData() {
    return {
      cvd: this.cvd,
      openInterest: this.openInterest,
      fundingRate: this.fundingRate,
      orderBook: this.orderBookData
    };
  }
}

module.exports = OrderFlowEngine;
