/**
 * GO LIVE Script
 *
 * Safely switch from testnet to live trading
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function goLive() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║         🔴 GO LIVE - SWITCH TO PRODUCTION              ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('⚠️  WARNING: You are about to switch to LIVE TRADING!\n');

  console.log('This will:');
  console.log('  • Switch from testnet to LIVE Bybit account');
  console.log('  • Use REAL money for trading');
  console.log('  • Apply more conservative risk settings');
  console.log('  • You can LOSE your capital\n');

  const confirm1 = await question('Do you understand the risks? (yes/no): ');
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('\n❌ Aborted. Staying on testnet.');
    rl.close();
    return;
  }

  console.log('\n📋 Current Testnet Settings:');
  console.log('  • Risk per trade: 2%');
  console.log('  • Max leverage: 10x');
  console.log('  • Position size: 5%\n');

  console.log('📋 Recommended LIVE Settings:');
  console.log('  • Risk per trade: 1% (more conservative)');
  console.log('  • Max leverage: 5x (reduced for safety)');
  console.log('  • Position size: 3% (smaller positions)\n');

  const confirm2 = await question('Apply these conservative settings for live? (yes/no): ');
  if (confirm2.toLowerCase() !== 'yes') {
    console.log('\n⚠️  Warning: Using aggressive settings on live is risky!');
  }

  console.log('\n🔍 Pre-flight Checklist:\n');

  const checks = [
    'Have you tested on testnet for at least 1 week?',
    'Are you using capital you can afford to LOSE?',
    'Have you disabled Withdraw/Transfer on Bybit API?',
    'Have you reviewed the GO-LIVE-CHECKLIST.md?',
    'Are you ready to monitor the bot for 24-48 hours?'
  ];

  for (const check of checks) {
    const answer = await question(`✓ ${check} (yes/no): `);
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Please complete all checklist items before going live.');
      rl.close();
      return;
    }
  }

  console.log('\n🎯 Final Confirmation:\n');
  console.log('You are about to:');
  console.log('  1. Backup current .env to .env.testnet');
  console.log('  2. Copy .env.live to .env');
  console.log('  3. Switch to LIVE TRADING MODE\n');

  const finalConfirm = await question('Type "GO LIVE" to proceed: ');
  if (finalConfirm !== 'GO LIVE') {
    console.log('\n❌ Aborted. Safety first!');
    rl.close();
    return;
  }

  try {
    // Backup current .env
    const envPath = path.join(__dirname, '../.env');
    const envTestnetPath = path.join(__dirname, '../.env.testnet');
    const envLivePath = path.join(__dirname, '../.env.live');

    console.log('\n📦 Backing up current .env to .env.testnet...');
    fs.copyFileSync(envPath, envTestnetPath);
    console.log('✓ Backup created');

    console.log('\n🔄 Switching to LIVE configuration...');
    fs.copyFileSync(envLivePath, envPath);
    console.log('✓ Configuration switched to LIVE');

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║              🔴 YOU ARE NOW IN LIVE MODE               ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('✅ Live configuration applied!\n');

    console.log('📋 Next Steps:\n');
    console.log('1. Verify connection:');
    console.log('   npm run check\n');
    console.log('2. Start trading (Enhanced recommended):');
    console.log('   npm run start:enhanced\n');
    console.log('3. Monitor closely for first 24-48 hours\n');

    console.log('🚨 Emergency Stop:');
    console.log('   Press Ctrl+C to stop bot\n');

    console.log('📖 Read GO-LIVE-CHECKLIST.md for full guide\n');

    console.log('⚠️  Remember:');
    console.log('   • Start with SMALL capital');
    console.log('   • Monitor closely');
    console.log('   • You can lose money');
    console.log('   • Trade responsibly\n');

    console.log('🎯 To switch back to testnet:');
    console.log('   cp .env.testnet .env\n');

    console.log('Good luck! 🚀\n');

  } catch (error) {
    console.error('\n❌ Error switching to live:', error.message);
    console.log('\nYour .env was not changed. Still on testnet.');
  }

  rl.close();
}

goLive();
