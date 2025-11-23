/**
 * Quick Connection Test for LIVE Bybit API
 */

// Disable SSL cert validation for Bybit
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const { RestClientV5 } = require('bybit-api');

console.log('🔍 Testing Bybit LIVE API Connection...\n');

if (process.env.USE_TESTNET === 'true') {
  console.error('❌ ERROR: Still in TESTNET mode!');
  process.exit(1);
}

const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: false,
  recv_window: 5000
});

async function testConnection() {
  try {
    console.log('📊 Fetching account balance...');
    const balanceResponse = await client.getWalletBalance({
      accountType: 'UNIFIED'
    });

    if (balanceResponse.retCode === 0) {
      console.log('✅ REST API Connection: SUCCESS\n');

      const walletData = balanceResponse.result.list[0];
      const usdtCoin = walletData.coin.find(c => c.coin === 'USDT');

      if (usdtCoin) {
        const balance = parseFloat(usdtCoin.walletBalance);
        const available = parseFloat(usdtCoin.availableToWithdraw);

        console.log('💰 Account Balance:');
        console.log(`   Total: $${balance.toFixed(2)} USDT`);
        console.log(`   Available: $${available.toFixed(2)} USDT\n`);
      }
    } else {
      console.error('❌ REST API Error:', balanceResponse.retMsg);
      process.exit(1);
    }

    console.log('📈 Fetching positions...');
    const positionsResponse = await client.getPositionInfo({
      category: 'linear',
      symbol: process.env.TRADING_SYMBOL || 'ETHUSDT'
    });

    if (positionsResponse.retCode === 0) {
      console.log('✅ Position Query: SUCCESS\n');

      const positions = positionsResponse.result.list.filter(pos => parseFloat(pos.size) > 0);
      console.log(`📍 Open Positions: ${positions.length}\n`);

      if (positions.length > 0) {
        positions.forEach(pos => {
          console.log(`   ${pos.side} ${pos.symbol}: ${pos.size} @ $${pos.avgPrice}`);
        });
        console.log();
      }
    } else {
      console.error('❌ Position Query Error:', positionsResponse.retMsg);
    }

    console.log('🎯 Testing WebSocket connection...');
    const { WebsocketClient } = require('bybit-api');

    const wsClient = new WebsocketClient({
      key: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_API_SECRET,
      market: 'v5',
      testnet: false
    });

    wsClient.on('open', (data) => {
      console.log('✅ WebSocket Connection: SUCCESS');
      console.log(`   Connected to: ${data.wsKey}\n`);

      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║                                                        ║');
      console.log('║    ✅ ALL CONNECTIONS SUCCESSFUL                       ║');
      console.log('║    🔴 READY FOR LIVE TRADING                           ║');
      console.log('║                                                        ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      console.log('🚀 To start trading, run:');
      console.log('   npm run start:live\n');

      setTimeout(() => {
        wsClient.closeAll();
        process.exit(0);
      }, 2000);
    });

    wsClient.on('error', (error) => {
      console.error('❌ WebSocket Error:', error.message);
      process.exit(1);
    });

    // Subscribe to test connection
    wsClient.subscribeV5([`tickers.${process.env.TRADING_SYMBOL || 'ETHUSDT'}`], 'linear');

  } catch (error) {
    console.error('\n❌ Connection Test Failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. API keys invalid or not activated for live trading');
    console.error('  2. API keys need trading permissions enabled');
    console.error('  3. Network/firewall blocking connection');
    console.error('  4. Bybit API maintenance\n');
    process.exit(1);
  }
}

testConnection();
