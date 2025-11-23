require('dotenv').config();

const config = {
  // Blaxel API
  blaxel: {
    apiKey: process.env.BLAXEL_API_KEY
  },

  // Bybit API
  bybit: {
    apiKey: process.env.BYBIT_API_KEY,
    apiSecret: process.env.BYBIT_API_SECRET,
    testnet: process.env.USE_TESTNET === 'true',
    recvWindow: 5000
  },

  // Trading Configuration
  trading: {
    symbol: process.env.TRADING_SYMBOL || 'ETHUSDT',
    category: process.env.CATEGORY || 'linear'
  },

  // Risk Management
  risk: {
    maxRiskPerTrade: parseFloat(process.env.MAX_RISK_PER_TRADE) || 0.02,
    maxLeverage: parseInt(process.env.MAX_LEVERAGE) || 10,
    positionSizePercent: parseFloat(process.env.POSITION_SIZE_PERCENT) || 0.05,
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT) || 0.02,
    takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT) || 0.04
  },

  // AI Configuration
  ai: {
    updateInterval: 60000, // 1 minute
    indicators: {
      rsiPeriod: 14,
      emaPeriods: [9, 21, 50],
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9
    }
  }
};

module.exports = config;
