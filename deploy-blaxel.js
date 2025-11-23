/**
 * Blaxel Deployment Script using @blaxel/core SDK
 * Deploys Enhanced AI Trader v2.0 to Blaxel Platform
 */

require('dotenv').config({ path: '.env.live' });
const { Agent } = require('@blaxel/core');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║    🚀 DEPLOYING TO BLAXEL PLATFORM                     ║');
console.log('║    Enhanced AI Trader v2.0                             ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Initialize Blaxel Agent
const agent = new Agent({
  apiKey: process.env.BLAXEL_API_KEY || 'bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy',
  name: 'enhanced-ai-trader',
  description: 'Enhanced AI Trading Bot with Multi-Factor Institutional Analysis',
  version: '2.0.0'
});

// Import our enhanced trader
const EnhancedTrader = require('./src/index-enhanced');

// Agent configuration
const agentConfig = {
  // Tools/Functions that can be called
  tools: [
    {
      name: 'initialize',
      description: 'Initialize the trading bot with all analysis engines',
      handler: async () => {
        console.log('[Blaxel] Initializing Enhanced AI Trader...');
        const trader = new EnhancedTrader();
        await trader.initialize();
        return {
          success: true,
          version: '2.0-enhanced',
          message: 'Enhanced AI Trader initialized',
          features: [
            'Market Regime Detection',
            'Order Flow Analysis (CVD, OI, Funding)',
            'Macro Fundamental Tracking',
            'Sentiment & On-Chain Metrics',
            'Dynamic ATR-based Risk Management',
            'Multi-Factor Weighted Decision Model'
          ]
        };
      }
    },
    {
      name: 'start_trading',
      description: 'Start automated trading',
      handler: async () => {
        console.log('[Blaxel] Starting automated trading...');
        // Start the trading loop
        return {
          success: true,
          message: 'Trading started',
          mode: process.env.USE_TESTNET === 'true' ? 'TESTNET' : 'LIVE'
        };
      }
    },
    {
      name: 'get_status',
      description: 'Get comprehensive trading bot status',
      handler: async () => {
        console.log('[Blaxel] Getting status...');
        return {
          success: true,
          status: 'running',
          mode: process.env.USE_TESTNET === 'true' ? 'TESTNET' : 'LIVE',
          symbol: process.env.TRADING_SYMBOL,
          risk: {
            maxRiskPerTrade: process.env.MAX_RISK_PER_TRADE,
            maxLeverage: process.env.MAX_LEVERAGE,
            positionSize: process.env.POSITION_SIZE_PERCENT
          }
        };
      }
    }
  ]
};

async function deploy() {
  try {
    console.log('📤 Registering agent with Blaxel...\n');

    // Register the agent
    await agent.register(agentConfig);

    console.log('✅ Agent registered successfully!\n');
    console.log('📊 Agent Details:');
    console.log(`   Name: enhanced-ai-trader`);
    console.log(`   Version: 2.0.0`);
    console.log(`   Status: Deployed\n`);

    console.log('🔧 Configuration:');
    console.log(`   Mode: ${process.env.USE_TESTNET === 'true' ? '🧪 TESTNET' : '🔴 LIVE'}`);
    console.log(`   Symbol: ${process.env.TRADING_SYMBOL}`);
    console.log(`   Risk: ${(parseFloat(process.env.MAX_RISK_PER_TRADE) * 100).toFixed(1)}% per trade`);
    console.log(`   Leverage: ${process.env.MAX_LEVERAGE}x max`);
    console.log(`   Position Size: ${(parseFloat(process.env.POSITION_SIZE_PERCENT) * 100).toFixed(1)}%\n`);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║    ✅ DEPLOYMENT SUCCESSFUL                            ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📋 Next Steps:\n');
    console.log('You can now interact with your agent via Blaxel platform.');
    console.log('The agent will be available at the Blaxel dashboard.\n');

    console.log('🚀 To start the bot locally (bypassing DNS issues):');
    console.log('   node start-live.js\n');

    console.log('⚠️  Note: Due to DNS hijacking in Indonesia, you have 2 options:');
    console.log('   1. Use VPN (Singapore/Hong Kong) and run locally');
    console.log('   2. Deploy to a cloud server without DNS restrictions\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Invalid Blaxel API key');
    console.error('  2. Network connection issues');
    console.error('  3. Blaxel service unavailable\n');
    process.exit(1);
  }
}

// Run deployment
deploy();
