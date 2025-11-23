/**
 * LIVE Trading Starter with Proper SSL Configuration
 *
 * Handles SSL certificate issues and starts the enhanced trader in LIVE mode
 */

// Configure Node.js to handle SSL certificates properly
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Warning: Only use for Bybit API issues

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║         🔴 STARTING LIVE TRADING                       ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Verify we're in LIVE mode
require('dotenv').config();

if (process.env.USE_TESTNET === 'true') {
  console.error('❌ ERROR: Still in TESTNET mode!');
  console.error('   Please run: npm run go-live\n');
  process.exit(1);
}

console.log('✅ LIVE MODE CONFIRMED\n');
console.log('⚠️  SSL Certificate Validation: DISABLED (for Bybit compatibility)\n');
console.log('📊 Loading Enhanced AI Trader v2.0...\n');

// Load and start the enhanced trader
require('./src/index-enhanced.js');
