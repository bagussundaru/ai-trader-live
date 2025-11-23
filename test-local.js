/**
 * Local Testing Script
 *
 * This script allows you to test the bot locally before deploying to Blaxel
 */

const BlaxelAITrader = require('./src/index');

async function testBot() {
  console.log('🧪 Starting Local Test...\n');

  const trader = new BlaxelAITrader();

  try {
    // Initialize
    console.log('1. Initializing bot...');
    await trader.initialize();
    console.log('✓ Bot initialized\n');

    // Get initial status
    console.log('2. Getting initial status...');
    const initialStatus = await trader.getStatus();
    console.log('Account Balance:', initialStatus.riskMetrics.accountBalance);
    console.log('Current Price:', initialStatus.marketData.price);
    console.log('✓ Status retrieved\n');

    // Start trading
    console.log('3. Starting automated trading...');
    await trader.start();
    console.log('✓ Trading started\n');

    // Let it run for testing
    console.log('Bot is now running. Press Ctrl+C to stop.\n');
    console.log('Status updates will be printed every 5 minutes.\n');

    // Print status every 30 seconds for testing
    setInterval(async () => {
      try {
        const status = await trader.getStatus();
        console.log('\n--- Status Update ---');
        console.log('Time:', new Date().toLocaleString());
        console.log('Running:', status.isRunning);
        console.log('Price:', status.marketData.price);
        console.log('Positions:', status.riskMetrics.openPositions);

        if (status.strategyStatus.lastSignal) {
          const signal = status.strategyStatus.lastSignal;
          console.log('Last Signal:', signal.action, `(${(signal.confidence * 100).toFixed(1)}%)`);
        }
        console.log('-------------------\n');
      } catch (error) {
        console.error('Error getting status:', error.message);
      }
    }, 30000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down test...');
  process.exit(0);
});

// Run test
testBot();
