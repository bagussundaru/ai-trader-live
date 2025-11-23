/**
 * Blaxel Agent Wrapper
 *
 * This file wraps the AI Trader for deployment on Blaxel platform
 * as an Agent Hosting service.
 */

const BlaxelAITrader = require('./src/index');

class BlaxelAgentWrapper {
  constructor() {
    this.trader = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the agent
   * Called by Blaxel when the agent is deployed
   */
  async initialize() {
    try {
      console.log('[BlaxelAgent] Initializing AI Trader Agent...');

      this.trader = new BlaxelAITrader();
      await this.trader.initialize();

      this.isInitialized = true;
      console.log('[BlaxelAgent] Agent initialized successfully');

      return {
        success: true,
        message: 'AI Trader Agent initialized'
      };
    } catch (error) {
      console.error('[BlaxelAgent] Initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start trading
   * Endpoint: POST /start
   */
  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.trader.start();
      return {
        success: true,
        message: 'Trading started'
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
   * Endpoint: POST /stop
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
   * Get current status
   * Endpoint: GET /status
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
   * Execute manual trade
   * Endpoint: POST /trade
   * Body: { action: "Buy" | "Sell", confidence: 0.0-1.0 }
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
   * Endpoint: POST /close-all
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
   * Health check
   * Endpoint: GET /health
   */
  async health() {
    return {
      success: true,
      status: 'healthy',
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const agent = new BlaxelAgentWrapper();

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

        case '/health':
          if (method === 'GET') {
            return await agent.health();
          }
          break;

        default:
          return {
            success: false,
            error: 'Unknown endpoint'
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
