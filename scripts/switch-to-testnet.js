/**
 * Switch Back to Testnet Script
 *
 * Safely switch from live back to testnet
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║         🧪 SWITCH BACK TO TESTNET                      ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

try {
  const envPath = path.join(__dirname, '../.env');
  const envTestnetPath = path.join(__dirname, '../.env.testnet');

  if (!fs.existsSync(envTestnetPath)) {
    console.log('❌ .env.testnet backup not found!');
    console.log('\nManually edit .env and set:');
    console.log('USE_TESTNET=true\n');
    process.exit(1);
  }

  console.log('🔄 Restoring testnet configuration...\n');

  fs.copyFileSync(envTestnetPath, envPath);

  console.log('✅ Successfully switched back to TESTNET!\n');

  console.log('📋 You are now in testnet mode:');
  console.log('  • USE_TESTNET=true');
  console.log('  • Trading with virtual funds');
  console.log('  • Safe for testing\n');

  console.log('🧪 Test commands:');
  console.log('   npm run check');
  console.log('   npm run test:enhanced\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
