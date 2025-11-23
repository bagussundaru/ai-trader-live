/**
 * Direct Deployment to Blaxel Platform
 * Using Blaxel API with your API key
 */

require('dotenv').config({ path: '.env.live' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BLAXEL_API_KEY = 'bl_aaab3uukg62s5vmha81r4ajgx2w8dvvy';
const BLAXEL_API_URL = 'https://api.blaxel.ai';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║    🚀 DEPLOYING TO BLAXEL PLATFORM                     ║');
console.log('║    Enhanced AI Trader v2.0                             ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

async function testBlaxelConnection() {
  console.log('🔐 Testing Blaxel API connection...\n');

  try {
    // Try to get account/project info
    const response = await axios.get(`${BLAXEL_API_URL}/v1/projects`, {
      headers: {
        'Authorization': `Bearer ${BLAXEL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Blaxel API connection successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ Blaxel API Error:', error.response.status);
      console.log('Error details:', error.response.data);
    } else if (error.request) {
      console.log('❌ No response from Blaxel API');
      console.log('Possible issues:');
      console.log('  1. API endpoint might be different');
      console.log('  2. Network connectivity issues');
      console.log('  3. API key format incorrect\n');
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  }
}

async function tryAlternativeEndpoints() {
  console.log('🔍 Trying alternative Blaxel endpoints...\n');

  const endpoints = [
    'https://api.blaxel.ai/v1/agents',
    'https://api.blaxel.ai/agents',
    'https://api.blaxel.ai/v1/deployments',
    'https://api.blaxel.ai/deployments',
    'https://api.blaxel.ai/v1/projects',
    'https://api.blaxel.ai/projects'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying: ${endpoint}`);

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${BLAXEL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log(`✅ SUCCESS on ${endpoint}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return { success: true, endpoint, data: response.data };
    } catch (error) {
      console.log(`   ❌ ${error.response?.status || error.code} - ${error.message}`);
    }
  }

  return { success: false };
}

async function checkBlaxelDocs() {
  console.log('\n📖 Checking Blaxel documentation...\n');

  try {
    const response = await axios.get('https://blaxel.ai', {
      timeout: 10000
    });

    console.log('✅ Blaxel website accessible');

    // Try to find API documentation links
    const html = response.data;
    if (html.includes('docs') || html.includes('api')) {
      console.log('📚 Documentation might be available at:');
      console.log('   - https://docs.blaxel.ai');
      console.log('   - https://blaxel.ai/docs');
      console.log('   - https://api.blaxel.ai/docs\n');
    }
  } catch (error) {
    console.log('⚠️  Could not access Blaxel website');
  }
}

async function main() {
  console.log('🔧 Configuration:');
  console.log(`   API Key: ${BLAXEL_API_KEY.substring(0, 10)}...`);
  console.log(`   Mode: ${process.env.USE_TESTNET === 'true' ? 'TESTNET' : '🔴 LIVE'}`);
  console.log(`   Symbol: ${process.env.TRADING_SYMBOL}\n`);

  // Test connection
  const connected = await testBlaxelConnection();

  if (!connected) {
    console.log('\n🔍 Connection failed. Trying alternative approaches...\n');

    const result = await tryAlternativeEndpoints();

    if (!result.success) {
      await checkBlaxelDocs();

      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║                                                        ║');
      console.log('║    ⚠️  BLAXEL DEPLOYMENT TIDAK TERSEDIA                ║');
      console.log('║                                                        ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      console.log('📋 Kemungkinan penyebab:\n');
      console.log('1. Blaxel platform untuk AI agents (request/response model)');
      console.log('   Trading bot butuh long-running process (24/7)\n');

      console.log('2. Blaxel API endpoint berbeda atau memerlukan setup khusus\n');

      console.log('3. Deployment method via web interface (bukan programmatic)\n');

      console.log('💡 REKOMENDASI:\n');
      console.log('Gunakan platform yang support background workers:');
      console.log('  ⭐ Railway.app - Deploy dalam 10 menit (GRATIS)');
      console.log('  ⭐ DigitalOcean VPS - Full control ($6/month)');
      console.log('  ⭐ Fly.io - Serverless platform ($3/month)\n');

      console.log('📖 Panduan lengkap:');
      console.log('   [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md)');
      console.log('   [DEPLOYMENT-ALTERNATIVE.md](DEPLOYMENT-ALTERNATIVE.md)\n');

      console.log('🏠 Untuk testing lokal:');
      console.log('   1. Install VPN (ProtonVPN gratis)');
      console.log('   2. Connect ke Singapore');
      console.log('   3. Run: node start-live.js\n');

      return false;
    } else {
      console.log('\n✅ Found working endpoint!');
      console.log('Now attempting deployment...\n');
      // Continue with deployment using the working endpoint
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
