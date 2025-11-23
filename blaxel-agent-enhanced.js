/**
 * Blaxel Agent Wrapper - Enhanced Version (v2.0)
 *
 * This file wraps the Enhanced AI Trader for deployment on Blaxel platform
 * with Multi-Factor Institutional-Grade Analysis
 */

const EnhancedBlaxelAITrader = require('./src/index-enhanced');

class EnhancedBlaxelAgentWrapper {
  constructor() {
    this.trader = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the enhanced agent
   */
  async initialize() {
    try {
      console.log('[Blaxel Enhanced Agent] 🚀 Initializing...');

      this.trader = new EnhancedBlaxelAITrader();
      await this.trader.initialize();

      this.isInitialized = true;
      console.log('[Blaxel Enhanced Agent] ✅ Initialized successfully');

      return {
        success: true,
        version: '2.0-enhanced',
        message: 'Enhanced AI Trader initialized with multi-factor analysis',
        features: [
          'Market Regime Detection',
          'Order Flow Analysis (CVD, OI, Funding)',
          'Macro Fundamental Tracking',
          'Sentiment & On-Chain Metrics',
          'Dynamic ATR-based Risk Management',
          'Multi-Factor Weighted Decision Model'
        ]
      };
    } catch (error) {
      console.error('[Blaxel Enhanced Agent] ❌ Initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start enhanced trading
   */
  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.trader.start();
      return {
        success: true,
        version: '2.0-enhanced',
        message: 'Enhanced trading started'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stop trading
   */
  async stop() {
    try {
      await this.trader.stop();
      return {
        success: true,
        message: 'Trading stopped'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get enhanced status
   */
  async getStatus() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Agent not initialized'
      };
    }

    try {
      const status = await this.trader.getStatus();
      return {
        success: true,
        version: '2.0-enhanced',
        data: status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute manual trade with enhanced analysis
   */
  async executeTrade(params) {
    try {
      const { action, confidence } = params;

      if (!action || !['Buy', 'Sell'].includes(action)) {
        return {
          success: false,
          error: 'Invalid action. Must be "Buy" or "Sell"'
        };
      }

      const result = await this.trader.executeManualTrade(action, confidence || 0.8);
      return {
        success: result.success,
        version: '2.0-enhanced',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close all positions
   */
  async closeAll() {
    try {
      await this.trader.closeAllPositions();
      return {
        success: true,
        message: 'All positions closed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get regime analysis
   */
  async getRegime() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Agent not initialized'
      };
    }

    try {
      const regime = this.trader.aiCore.regimeDetector.getCurrentRegime();
      return {
        success: true,
        data: regime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get order flow analysis
   */
  async getOrderFlow() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Agent not initialized'
      };
    }

    try {
      const orderFlow = await this.trader.orderFlowEngine.analyze();
      return {
        success: true,
        data: orderFlow
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get macro analysis
   */
  async getMacro() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Agent not initialized'
      };
    }

    try {
      const macro = await this.trader.macroEngine.analyze();
      return {
        success: true,
        data: macro
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sentiment analysis
   */
  async getSentiment() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Agent not initialized'
      };
    }

    try {
      const sentiment = await this.trader.sentimentEngine.analyze();
      return {
        success: true,
        data: sentiment
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check
   */
  async health() {
    return {
      success: true,
      version: '2.0-enhanced',
      status: 'healthy',
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      features: {
        regimeDetection: true,
        orderFlowAnalysis: true,
        macroTracking: true,
        sentimentAnalysis: true,
        dynamicRisk: true,
        multiFactorModel: true
      }
    };
  }
}

// Create singleton instance
const agent = new EnhancedBlaxelAgentWrapper();

// Export handler functions for Blaxel serverless endpoints
module.exports = {
  // Main handler for HTTP requests
  handler: async (event) => {
    const { method, path, body } = event;

    try {
      switch (path) {
        case '/initialize':
          return await agent.initialize();

        case '/start':
          if (method === 'POST') {
            return await agent.start();
          }
          break;

        case '/stop':
          if (method === 'POST') {
            return await agent.stop();
          }
          break;

        case '/status':
          if (method === 'GET') {
            return await agent.getStatus();
          }
          break;

        case '/trade':
          if (method === 'POST') {
            return await agent.executeTrade(body);
          }
          break;

        case '/close-all':
          if (method === 'POST') {
            return await agent.closeAll();
          }
          break;

        case '/regime':
          if (method === 'GET') {
            return await agent.getRegime();
          }
          break;

        case '/order-flow':
          if (method === 'GET') {
            return await agent.getOrderFlow();
          }
          break;

        case '/macro':
          if (method === 'GET') {
            return await agent.getMacro();
          }
          break;

        case '/sentiment':
          if (method === 'GET') {
            return await agent.getSentiment();
          }
          break;

        case '/health':
          if (method === 'GET') {
            return await agent.health();
          }
          break;

        default:
          return {
            success: false,
            error: 'Unknown endpoint',
            availableEndpoints: [
              'POST /initialize',
              'POST /start',
              'POST /stop',
              'GET /status',
              'POST /trade',
              'POST /close-all',
              'GET /regime',
              'GET /order-flow',
              'GET /macro',
              'GET /sentiment',
              'GET /health'
            ]
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Export agent instance for direct use
  agent
};
