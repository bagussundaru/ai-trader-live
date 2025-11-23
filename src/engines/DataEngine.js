const { WebsocketClient } = require('bybit-api');
const config = require('../config/config');

class DataEngine {
  constructor() {
    this.wsClient = null;
    this.marketData = {
      price: 0,
      volume: 0,
      orderBook: { bids: [], asks: [] },
      klines: [],
      ticker: {}
    };
    this.subscribers = [];
  }

  initialize() {
    console.log('[DataEngine] Initializing WebSocket connection...');

    this.wsClient = new WebsocketClient({
      key: config.bybit.apiKey,
      secret: config.bybit.apiSecret,
      market: 'v5',
      testnet: config.bybit.testnet
    });

    this.setupEventHandlers();
    this.subscribeToMarketData();
  }

  setupEventHandlers() {
    this.wsClient.on('update', (data) => {
      this.handleUpdate(data);
    });

    this.wsClient.on('open', (data) => {
      console.log('[DataEngine] WebSocket connection opened:', data.wsKey);
    });

    this.wsClient.on('response', (data) => {
      console.log('[DataEngine] Response received:', data);
    });

    this.wsClient.on('error', (error) => {
      console.error('[DataEngine] WebSocket error:', error);
    });

    this.wsClient.on('reconnect', ({ wsKey }) => {
      console.log('[DataEngine] WebSocket reconnecting:', wsKey);
    });

    this.wsClient.on('reconnected', (data) => {
      console.log('[DataEngine] WebSocket reconnected:', data);
    });
  }

  subscribeToMarketData() {
    const symbol = config.trading.symbol;
    const category = config.trading.category;

    // Subscribe to ticker data (price updates) using v5 method
    this.wsClient.subscribeV5([
      `tickers.${symbol}`,
      `kline.1.${symbol}`,
      `orderbook.50.${symbol}`
    ], category);

    console.log(`[DataEngine] Subscribed to market data for ${symbol}`);
  }

  handleUpdate(data) {
    try {
      const topic = data.topic;

      if (topic.includes('tickers')) {
        this.handleTickerUpdate(data.data);
      } else if (topic.includes('kline')) {
        this.handleKlineUpdate(data.data);
      } else if (topic.includes('orderbook')) {
        this.handleOrderBookUpdate(data.data);
      }

      // Notify all subscribers
      this.notifySubscribers(data);
    } catch (error) {
      console.error('[DataEngine] Error handling update:', error);
    }
  }

  handleTickerUpdate(data) {
    this.marketData.ticker = data;
    this.marketData.price = parseFloat(data.lastPrice);
    this.marketData.volume = parseFloat(data.volume24h);
  }

  handleKlineUpdate(data) {
    if (Array.isArray(data)) {
      const kline = data[0];
      const klineData = {
        timestamp: kline.start,
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
        close: parseFloat(kline.close),
        volume: parseFloat(kline.volume)
      };

      // Keep last 200 klines for technical analysis
      this.marketData.klines.push(klineData);
      if (this.marketData.klines.length > 200) {
        this.marketData.klines.shift();
      }
    }
  }

  handleOrderBookUpdate(data) {
    this.marketData.orderBook = {
      bids: data.b.map(([price, size]) => ({
        price: parseFloat(price),
        size: parseFloat(size)
      })),
      asks: data.a.map(([price, size]) => ({
        price: parseFloat(price),
        size: parseFloat(size)
      }))
    };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[DataEngine] Error notifying subscriber:', error);
      }
    });
  }

  getCurrentPrice() {
    return this.marketData.price;
  }

  getMarketData() {
    return this.marketData;
  }

  getKlines(count = 100) {
    return this.marketData.klines.slice(-count);
  }

  close() {
    if (this.wsClient) {
      this.wsClient.closeAll();
      console.log('[DataEngine] WebSocket connections closed');
    }
  }
}

module.exports = DataEngine;
