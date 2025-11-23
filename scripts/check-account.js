/**
 * Check Bybit Account Info
 *
 * Quick script to verify API connection and check account balance
 */

require('dotenv').config();
const { RestClientV5 } = require('bybit-api');

async function checkAccount() {
  console.log('🔍 Checking Bybit Account...\n');

  const client = new RestClientV5({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    testnet: process.env.USE_TESTNET === 'true'
  });

  try {
    // 1. Check API connection
    console.log('1. Testing API connection...');
    const serverTime = await client.getServerTime();
    console.log('✓ Connected to Bybit');
    console.log(`Server time: ${new Date(parseInt(serverTime.result.timeSecond) * 1000).toISOString()}\n`);

    // 2. Get wallet balance
    console.log('2. Fetching wallet balance...');
    const balance = await client.getWalletBalance({
      accountType: 'UNIFIED'
    });

    if (balance.retCode === 0) {
      const walletData = balance.result.list[0];
      console.log('✓ Wallet balance retrieved\n');

      console.log('Account Type:', walletData.accountType);
      console.log('Total Equity:', walletData.totalEquity, 'USD');
      console.log('Available Balance:', walletData.totalAvailableBalance, 'USD');
      console.log('Wallet Balance:', walletData.totalWalletBalance, 'USD');
      console.log('Used Margin:', walletData.totalMarginBalance, 'USD');

      console.log('\nCoin Balances:');
      walletData.coin.forEach(coin => {
        if (parseFloat(coin.walletBalance) > 0) {
          console.log(`  ${coin.coin}: ${coin.walletBalance}`);
        }
      });
    } else {
      console.error('❌ Failed to get balance:', balance.retMsg);
    }

    // 3. Get current positions
    console.log('\n3. Checking current positions...');
    const positions = await client.getPositionInfo({
      category: 'linear',
      symbol: process.env.TRADING_SYMBOL || 'ETHUSDT'
    });

    if (positions.retCode === 0) {
      const openPositions = positions.result.list.filter(pos => parseFloat(pos.size) > 0);

      if (openPositions.length > 0) {
        console.log(`✓ Found ${openPositions.length} open position(s)\n`);

        openPositions.forEach(pos => {
          console.log(`Position: ${pos.side} ${pos.symbol}`);
          console.log(`  Size: ${pos.size}`);
          console.log(`  Entry Price: $${pos.avgPrice}`);
          console.log(`  Current Price: $${pos.markPrice}`);
          console.log(`  Unrealized PnL: $${pos.unrealisedPnl}`);
          console.log(`  Leverage: ${pos.leverage}x`);
          console.log('');
        });
      } else {
        console.log('✓ No open positions\n');
      }
    }

    // 4. Get recent orders
    console.log('4. Checking recent orders...');
    const orders = await client.getActiveOrders({
      category: 'linear',
      symbol: process.env.TRADING_SYMBOL || 'ETHUSDT'
    });

    if (orders.retCode === 0) {
      if (orders.result.list.length > 0) {
        console.log(`✓ Found ${orders.result.list.length} active order(s)\n`);
        orders.result.list.forEach(order => {
          console.log(`Order: ${order.side} ${order.qty} ${order.symbol}`);
          console.log(`  Type: ${order.orderType}`);
          console.log(`  Price: $${order.price}`);
          console.log(`  Status: ${order.orderStatus}`);
          console.log('');
        });
      } else {
        console.log('✓ No active orders\n');
      }
    }

    console.log('========================================');
    console.log('✅ Account check complete!');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Tip: Check your BYBIT_API_KEY and BYBIT_API_SECRET in .env file');
    }
    process.exit(1);
  }
}

checkAccount();
