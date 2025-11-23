/**
 * API Server for Dashboard
 * Provides REST endpoints to access bot status and data
 */

const http = require('http');
const url = require('url');

class ApiServer {
  constructor(trader) {
    this.trader = trader;
    this.server = null;
    this.port = process.env.PORT || 3000;
  }

  start() {
    this.server = http.createServer((req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsedUrl = url.parse(req.url, true);
      const path = parsedUrl.pathname;

      // Route handling
      try {
        if (path === '/api/status') {
          this.handleStatus(req, res);
        } else if (path === '/api/account') {
          this.handleAccount(req, res);
        } else if (path === '/api/analysis') {
          this.handleAnalysis(req, res);
        } else if (path === '/api/regime') {
          this.handleRegime(req, res);
        } else if (path === '/api/factors') {
          this.handleFactors(req, res);
        } else if (path === '/api/positions') {
          this.handlePositions(req, res);
        } else if (path === '/api/logs') {
          this.handleLogs(req, res);
        } else if (path === '/' || path === '/dashboard') {
          this.serveDashboard(req, res);
        } else {
          this.send404(res);
        }
      } catch (error) {
        this.sendError(res, error);
      }
    });

    this.server.listen(this.port, () => {
      console.log(`[ApiServer] 🌐 Dashboard available at: http://localhost:${this.port}/dashboard`);
      console.log(`[ApiServer] 📊 API endpoints available at: http://localhost:${this.port}/api/*`);
    });
  }

  handleStatus(req, res) {
    const status = {
      success: true,
      bot: {
        version: '2.0.0',
        mode: process.env.USE_TESTNET === 'true' ? 'TESTNET' : 'LIVE',
        symbol: process.env.TRADING_SYMBOL || 'ETHUSDT',
        running: true,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, status);
  }

  handleAccount(req, res) {
    const account = {
      success: true,
      data: {
        balance: this.trader.riskManager?.accountBalance || 0,
        positions: this.trader.riskManager?.openPositions?.length || 0,
        leverage: parseInt(process.env.MAX_LEVERAGE) || 5,
        riskPerTrade: parseFloat(process.env.MAX_RISK_PER_TRADE) || 0.01
      },
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, account);
  }

  handleAnalysis(req, res) {
    const currentPrice = this.trader.dataEngine?.getCurrentPrice() || 0;
    const lastSignal = this.trader.lastSignal || null;

    const analysis = {
      success: true,
      data: {
        currentPrice: currentPrice,
        signal: lastSignal ? {
          action: lastSignal.action,
          confidence: lastSignal.confidence,
          timestamp: lastSignal.timestamp
        } : null,
        threshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.70
      },
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, analysis);
  }

  handleRegime(req, res) {
    const regime = this.trader.aiCore?.regimeDetector?.getCurrentRegime() || {
      state: 'UNKNOWN',
      confidence: 0,
      action: 'WAIT',
      multiplier: 1.0
    };

    const response = {
      success: true,
      data: regime,
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, response);
  }

  handleFactors(req, res) {
    const factors = this.trader.lastAnalysis || {
      technical: 0,
      orderFlow: 0,
      regime: 0,
      macro: 0,
      sentiment: 0,
      total: 0
    };

    const response = {
      success: true,
      data: factors,
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, response);
  }

  handlePositions(req, res) {
    const positions = this.trader.riskManager?.openPositions || [];

    const response = {
      success: true,
      data: positions.map(pos => ({
        symbol: pos.symbol,
        side: pos.side,
        size: pos.size,
        avgPrice: pos.avgPrice,
        unrealizedPnl: pos.unrealisedPnl,
        leverage: pos.leverage
      })),
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, response);
  }

  handleLogs(req, res) {
    const logs = this.trader.recentLogs || [];

    const response = {
      success: true,
      data: logs.slice(-50), // Last 50 logs
      timestamp: new Date().toISOString()
    };

    this.sendJSON(res, response);
  }

  serveDashboard(req, res) {
    const fs = require('fs');
    const path = require('path');

    const dashboardPath = path.join(__dirname, '../../dashboard/index.html');

    fs.readFile(dashboardPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Dashboard not found. Please ensure dashboard/index.html exists.');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  sendJSON(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  send404(res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  sendError(res, error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('[ApiServer] Server stopped');
    }
  }
}

module.exports = ApiServer;
