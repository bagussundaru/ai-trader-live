/**
 * Direct API Test without bybit-api library
 * Using raw HTTPS requests to bypass SDK issues
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const https = require('https');
const crypto = require('crypto');

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

console.log('🔍 Testing Direct HTTPS Request to Bybit...\n');

// Create signature for authenticated request
function createSignature(params, timestamp) {
  const paramStr = timestamp + API_KEY + 5000 + Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHmac('sha256', API_SECRET)
    .update(paramStr)
    .digest('hex');
}

// Test 1: Public endpoint (no auth)
console.log('📊 Test 1: Public Market Data (no authentication)...');

const publicOptions = {
  hostname: 'api.bybit.com',
  path: '/v5/market/tickers?category=linear&symbol=ETHUSDT',
  method: 'GET',
  rejectUnauthorized: false,
  headers: {
    'Content-Type': 'application/json'
  }
};

const publicReq = https.request(publicOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (result.retCode === 0) {
        console.log('✅ Public API: SUCCESS\n');
        const ticker = result.result.list[0];
        console.log(`   ${ticker.symbol}: $${ticker.lastPrice}`);
        console.log(`   24h Volume: ${ticker.volume24h}\n`);

        // Now test authenticated endpoint
        testAuthenticatedEndpoint();
      } else {
        console.error('❌ Public API Error:', result.retMsg);
      }
    } catch (error) {
      console.error('❌ Parse Error:', error.message);
      console.error('   Response:', data);
    }
  });
});

publicReq.on('error', (error) => {
  console.error('❌ Public Request Error:', error.message);
  console.error('\nThis suggests a network/firewall issue blocking HTTPS.\n');
  process.exit(1);
});

publicReq.end();

// Test 2: Authenticated endpoint
function testAuthenticatedEndpoint() {
  console.log('🔐 Test 2: Authenticated Account Balance...');

  const timestamp = Date.now().toString();
  const params = { accountType: 'UNIFIED' };
  const signature = createSignature(params, timestamp);

  const authOptions = {
    hostname: 'api.bybit.com',
    path: '/v5/account/wallet-balance?accountType=UNIFIED',
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'X-BAPI-API-KEY': API_KEY,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-SIGN': signature,
      'X-BAPI-RECV-WINDOW': '5000'
    }
  };

  const authReq = https.request(authOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);

        if (result.retCode === 0) {
          console.log('✅ Authenticated API: SUCCESS\n');

          const walletData = result.result.list[0];
          const usdtCoin = walletData.coin.find(c => c.coin === 'USDT');

          if (usdtCoin) {
            console.log(`   Balance: $${parseFloat(usdtCoin.walletBalance).toFixed(2)} USDT`);
            console.log(`   Available: $${parseFloat(usdtCoin.availableToWithdraw).toFixed(2)} USDT\n`);
          }

          console.log('╔════════════════════════════════════════════════════════╗');
          console.log('║                                                        ║');
          console.log('║    ✅ API KEYS WORKING                                 ║');
          console.log('║    🔴 READY FOR LIVE TRADING                           ║');
          console.log('║                                                        ║');
          console.log('╚════════════════════════════════════════════════════════╝\n');

          console.log('🚀 To start trading:');
          console.log('   npm run start:live\n');

          process.exit(0);
        } else {
          console.error('❌ Authenticated API Error:', result.retMsg);
          console.error('\nPossible causes:');
          console.error('  1. API keys are for TESTNET (not LIVE)');
          console.error('  2. API keys expired or invalid');
          console.error('  3. Trading permission not enabled\n');
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
        console.error('   Response:', data);
        process.exit(1);
      }
    });
  });

  authReq.on('error', (error) => {
    console.error('❌ Authenticated Request Error:', error.message);
    process.exit(1);
  });

  authReq.end();
}
