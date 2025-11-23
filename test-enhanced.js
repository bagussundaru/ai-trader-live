/**
 * Enhanced AI Trader Test Script
 *
 * Tests the v2.0 multi-factor system
 */

const EnhancedBlaxelAITrader = require('./src/index-enhanced');

async function testEnhanced() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🧪 TESTING ENHANCED AI TRADER v2.0       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const trader = new EnhancedBlaxelAITrader();

  try {
    // Initialize
    console.log('📋 Step 1: Initializing Enhanced Trader...\n');
    await trader.initialize();

    console.log('\n✅ Initialization Complete!\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  ENHANCED FEATURES LOADED                  ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║  ✓ Market Regime Detector                  ║');
    console.log('║  ✓ Order Flow Engine                       ║');
    console.log('║  ✓ Macro Fundamental Engine                ║');
    console.log('║  ✓ Sentiment & On-Chain Engine             ║');
    console.log('║  ✓ Dynamic Risk Manager (ATR-based)        ║');
    console.log('║  ✓ Enhanced AI Decision Core               ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Get initial status
    console.log('📋 Step 2: Getting Initial Status...\n');
    const status = await trader.getStatus();

    console.log('💰 Account Information:');
    console.log(`  Balance: $${status.riskMetrics.accountBalance.toFixed(2)}`);
    console.log(`  Open Positions: ${status.riskMetrics.openPositions}/3`);
    console.log(`  Total Exposure: $${status.riskMetrics.totalExposure.toFixed(2)}\n`);

    console.log('📊 Market Data:');
    console.log(`  Symbol: ${status.marketData.symbol}`);
    console.log(`  Current Price: $${status.marketData.price || 'Loading...'}\n`);

    if (status.enhanced.regime) {
      console.log('🎯 Market Regime:');
      console.log(`  State: ${status.enhanced.regime.regime}`);
      console.log(`  Action: ${status.enhanced.regime.action}`);
      console.log(`  Confidence: ${(status.enhanced.regime.confidence * 100).toFixed(1)}%\n`);
    }

    if (status.enhanced.macroSignal) {
      console.log('🌍 Macro Signal:');
      console.log(`  Signal: ${status.enhanced.macroSignal.signal}`);
      console.log(`  Action: ${status.enhanced.macroSignal.action}\n`);
    }

    // Start trading
    console.log('📋 Step 3: Starting Enhanced Trading...\n');
    await trader.start();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║  ✅ ENHANCED BOT IS NOW RUNNING            ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📈 The bot will now:');
    console.log('  1. Analyze market using 5 factors');
    console.log('  2. Detect market regime');
    console.log('  3. Check order flow (CVD, OI, Funding)');
    console.log('  4. Monitor macro conditions');
    console.log('  5. Track sentiment & on-chain data');
    console.log('  6. Use dynamic ATR-based risk management');
    console.log('  7. Execute only high-confidence trades\n');

    console.log('💡 Status updates every 30 seconds');
    console.log('🛑 Press Ctrl+C to stop the bot\n');

    // Print status every 30 seconds
    let cycleCount = 0;
    setInterval(async () => {
      try {
        cycleCount++;
        const currentStatus = await trader.getStatus();

        console.log('\n╔════════════════════════════════════════════╗');
        console.log(`║  📊 STATUS UPDATE #${cycleCount.toString().padStart(2, '0')}                      ║`);
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  Time: ${new Date().toLocaleTimeString().padEnd(32, ' ')}║`);
        console.log(`║  Price: $${(currentStatus.marketData.price || 0).toFixed(2).padEnd(29, ' ')}║`);
        console.log(`║  Positions: ${currentStatus.riskMetrics.openPositions}/3${' '.repeat(27)}║`);
        console.log(`║  Balance: $${currentStatus.riskMetrics.accountBalance.toFixed(2).padEnd(26, ' ')}║`);

        if (currentStatus.enhanced.regime) {
          const regime = currentStatus.enhanced.regime.regime.toUpperCase();
          console.log(`║  Regime: ${regime.padEnd(31, ' ')}║`);
        }

        if (currentStatus.enhanced.lastSignal) {
          const signal = currentStatus.enhanced.lastSignal;
          const action = signal.action || 'N/A';
          const conf = signal.confidence ? `${(signal.confidence * 100).toFixed(0)}%` : 'N/A';
          console.log(`║  Last Signal: ${action} (${conf})${' '.repeat(31 - action.length - conf.length - 3)}║`);
        }

        console.log('╠════════════════════════════════════════════╣');

        const perf = currentStatus.performance;
        if (perf.totalTrades > 0) {
          console.log(`║  Trades: ${perf.totalTrades.toString().padEnd(33, ' ')}║`);
          console.log(`║  Win Rate: ${perf.winRate.padEnd(30, ' ')}║`);
          console.log(`║  Net P/L: $${perf.netProfit.padEnd(28, ' ')}║`);
        } else {
          console.log('║  No trades executed yet                    ║');
        }

        console.log('╚════════════════════════════════════════════╝\n');

      } catch (error) {
        console.error('❌ Error getting status:', error.message);
      }
    }, 30000); // Every 30 seconds

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════╗');
    console.error('║  ❌ TEST FAILED                            ║');
    console.error('╚════════════════════════════════════════════╝\n');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n╔════════════════════════════════════════════╗');
  console.log('║  🛑 STOPPING TEST...                       ║');
  console.log('╚════════════════════════════════════════════╝\n');
  process.exit(0);
});

// Run test
testEnhanced();
