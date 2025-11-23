const { RestClientV5 } = require('bybit-api');
const config = require('../config/config');

class ExecutionEngine {
  constructor(riskManager) {
    this.client = new RestClientV5({
      key: config.bybit.apiKey,
      secret: config.bybit.apiSecret,
      testnet: config.bybit.testnet,
      recv_window: config.bybit.recvWindow
    });

    this.riskManager = riskManager;
    this.symbol = config.trading.symbol;
    this.category = config.trading.category;
    this.orderHistory = [];
  }

  async initialize() {
    try {
      console.log('[ExecutionEngine] Initializing...');

      // Get account balance
      await this.updateAccountInfo();

      // Get current positions
      await this.updatePositions();

      // Set leverage
      await this.setLeverage(config.risk.maxLeverage);

      console.log('[ExecutionEngine] Initialization complete');
    } catch (error) {
      console.error('[ExecutionEngine] Initialization error:', error.message);
      throw error;
    }
  }

  async updateAccountInfo() {
    try {
      const response = await this.client.getWalletBalance({
        accountType: 'UNIFIED'
      });

      if (response.retCode === 0) {
        const walletData = response.result.list[0];
        const usdtCoin = walletData.coin.find(c => c.coin === 'USDT');

        if (usdtCoin) {
          const balance = parseFloat(usdtCoin.walletBalance);
          this.riskManager.setAccountBalance(balance);
        }
      }
    } catch (error) {
      console.error('[ExecutionEngine] Error updating account info:', error.message);
    }
  }

  async updatePositions() {
    try {
      const response = await this.client.getPositionInfo({
        category: this.category,
        symbol: this.symbol
      });

      if (response.retCode === 0) {
        const positions = response.result.list.filter(pos => parseFloat(pos.size) > 0);
        this.riskManager.updatePositions(positions);
        console.log(`[ExecutionEngine] Active positions: ${positions.length}`);
      }
    } catch (error) {
      console.error('[ExecutionEngine] Error updating positions:', error.message);
    }
  }

  async setLeverage(leverage) {
    try {
      const validatedLeverage = this.riskManager.validateLeverage(leverage);

      const response = await this.client.setLeverage({
        category: this.category,
        symbol: this.symbol,
        buyLeverage: validatedLeverage.toString(),
        sellLeverage: validatedLeverage.toString()
      });

      if (response.retCode === 0) {
        console.log(`[ExecutionEngine] Leverage set to ${validatedLeverage}x`);
      }
    } catch (error) {
      console.error('[ExecutionEngine] Error setting leverage:', error.message);
    }
  }

  async executeSignal(signal, currentPrice) {
    try {
      console.log(`\n[ExecutionEngine] Processing signal: ${signal.action} (confidence: ${(signal.confidence * 100).toFixed(1)}%)`);

      // Check with Risk Manager
      if (!this.riskManager.approveTrade(signal, currentPrice)) {
        console.log('[ExecutionEngine] Trade rejected by Risk Manager');
        return { success: false, reason: 'Risk management rejection' };
      }

      // Calculate position parameters
      const quantity = this.riskManager.calculatePositionSize(currentPrice);
      const stopLoss = this.riskManager.calculateStopLoss(currentPrice, signal.action);
      const takeProfit = this.riskManager.calculateTakeProfit(currentPrice, signal.action);

      console.log(`[ExecutionEngine] Trade parameters:`);
      console.log(`  - Action: ${signal.action}`);
      console.log(`  - Quantity: ${quantity}`);
      console.log(`  - Entry: $${currentPrice.toFixed(2)}`);
      console.log(`  - Stop Loss: $${stopLoss.toFixed(2)} (${config.risk.stopLossPercent * 100}%)`);
      console.log(`  - Take Profit: $${takeProfit.toFixed(2)} (${config.risk.takeProfitPercent * 100}%)`);

      // Place market order
      const orderResult = await this.placeOrder({
        side: signal.action,
        orderType: 'Market',
        qty: quantity.toString(),
        stopLoss: stopLoss.toString(),
        takeProfit: takeProfit.toString()
      });

      if (orderResult.success) {
        console.log(`[ExecutionEngine] Order executed successfully: ${orderResult.orderId}`);

        // Log the order
        this.logOrder({
          timestamp: Date.now(),
          signal,
          orderResult,
          parameters: { quantity, currentPrice, stopLoss, takeProfit }
        });

        // Update positions
        await this.updatePositions();
        await this.updateAccountInfo();
      }

      return orderResult;

    } catch (error) {
      console.error('[ExecutionEngine] Error executing signal:', error.message);
      return { success: false, error: error.message };
    }
  }

  async placeOrder(orderParams) {
    try {
      const params = {
        category: this.category,
        symbol: this.symbol,
        side: orderParams.side,
        orderType: orderParams.orderType,
        qty: orderParams.qty,
        timeInForce: 'GTC'
      };

      // Add stop loss and take profit if provided
      if (orderParams.stopLoss) {
        params.stopLoss = orderParams.stopLoss;
      }

      if (orderParams.takeProfit) {
        params.takeProfit = orderParams.takeProfit;
      }

      const response = await this.client.submitOrder(params);

      if (response.retCode === 0) {
        return {
          success: true,
          orderId: response.result.orderId,
          orderLinkId: response.result.orderLinkId
        };
      } else {
        console.error('[ExecutionEngine] Order failed:', response.retMsg);
        return {
          success: false,
          error: response.retMsg
        };
      }

    } catch (error) {
      console.error('[ExecutionEngine] Place order error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async closePosition(side) {
    try {
      console.log(`[ExecutionEngine] Closing ${side} position...`);

      // Get current position to determine size
      const positionResponse = await this.client.getPositionInfo({
        category: this.category,
        symbol: this.symbol
      });

      if (positionResponse.retCode === 0) {
        const position = positionResponse.result.list.find(p => p.side === side);

        if (position && parseFloat(position.size) > 0) {
          const closeSide = side === 'Buy' ? 'Sell' : 'Buy';

          const closeOrder = await this.placeOrder({
            side: closeSide,
            orderType: 'Market',
            qty: position.size,
            reduceOnly: true
          });

          if (closeOrder.success) {
            console.log('[ExecutionEngine] Position closed successfully');
            await this.updatePositions();
            await this.updateAccountInfo();
          }

          return closeOrder;
        }
      }

      return { success: false, reason: 'No position to close' };

    } catch (error) {
      console.error('[ExecutionEngine] Error closing position:', error.message);
      return { success: false, error: error.message };
    }
  }

  async closeAllPositions() {
    try {
      console.log('[ExecutionEngine] Closing all positions...');

      const response = await this.client.getPositionInfo({
        category: this.category,
        symbol: this.symbol
      });

      if (response.retCode === 0) {
        const positions = response.result.list.filter(pos => parseFloat(pos.size) > 0);

        for (const position of positions) {
          await this.closePosition(position.side);
        }

        console.log('[ExecutionEngine] All positions closed');
      }

    } catch (error) {
      console.error('[ExecutionEngine] Error closing all positions:', error.message);
    }
  }

  logOrder(orderData) {
    this.orderHistory.push(orderData);

    // Keep last 100 orders
    if (this.orderHistory.length > 100) {
      this.orderHistory.shift();
    }
  }

  getOrderHistory() {
    return this.orderHistory;
  }

  async getAccountSummary() {
    await this.updateAccountInfo();
    await this.updatePositions();

    return {
      balance: this.riskManager.accountBalance,
      positions: this.riskManager.openPositions.length,
      totalExposure: this.riskManager.getTotalExposure(),
      riskMetrics: this.riskManager.getRiskMetrics()
    };
  }
}

module.exports = ExecutionEngine;
