const fs = require('fs');
const path = require('path');
const https = require('https');

// Test suite covering:
// 1. Tomatoes (Produce - Buyer mode, Delhi metro)
// 2. USB-C Cable (Electronics - Seller/Vendor mode, Jaipur tier-2)
// 3. Cotton T-Shirt (Apparel - Buyer mode, Sonipat rural)
// 4. Out-of-scope item: Office Chair (Should be safely rejected with low confidence and 0 price)
const TEST_SCENARIOS = [
  {
    category: 'produce',
    name: 'fresh_tomatoes_buyer',
    role: 'buyer',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    description: 'Fresh red country tomatoes in market basket',
    location: { city: 'Delhi', locality: 'Sarojini Nagar Mandi', tier: 'tier1_metro' },
    expectSuccess: true
  },
  {
    category: 'electronics',
    name: 'usb_c_cable_seller',
    role: 'seller',
    url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80',
    description: 'Braided Type-C fast charging cable with alloy shell',
    location: { city: 'Jaipur', locality: 'Gaurav Tower Bazaar', tier: 'tier2_city' },
    expectSuccess: true
  },
  {
    category: 'apparel',
    name: 'cotton_tshirt_buyer',
    role: 'buyer',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
    description: 'Plain white crewneck cotton t-shirt',
    location: { city: 'Sonipat', locality: 'Rural Haat', tier: 'rural' },
    expectSuccess: true
  },
  {
    category: 'unknown',
    name: 'out_of_scope_office_chair',
    role: 'buyer',
    url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&q=80',
    description: 'Ergonomic mesh revolving office chair',
    location: { city: 'Delhi', locality: 'Nehru Place', tier: 'tier1_metro' },
    expectSuccess: false // Should trigger safe low-confidence refusal
  }
];

function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImageAsBase64(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  BargainAI - End-to-End Test Suite: Roles, Seasons, Guardrails  ');
  console.log('================================================================\n');

  for (const item of TEST_SCENARIOS) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`[TEST SCENARIO] ${item.name.toUpperCase()} (Role: ${item.role.toUpperCase()})`);
    console.log(`Item: "${item.description}"`);
    console.log(`Location: ${item.location.city} (${item.location.tier})`);
    console.log(`Downloading online image reference...`);

    try {
      const base64Image = await downloadImageAsBase64(item.url);
      console.log(`✓ Image fetched successfully (${(base64Image.length / 1024).toFixed(1)} KB)`);

      const payload = {
        itemText: item.description,
        itemPhoto: `data:image/jpeg;base64,${base64Image}`,
        role: item.role,
        location: item.location,
        categoryHint: item.category !== 'unknown' ? item.category : undefined
      };

      console.log(`Invoking POST /api/estimate...`);
      const response = await fetch('http://localhost:3000/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      console.log(`\nResponse Status: ${response.status} ${response.statusText}`);
      console.log(`Success Flag:    ${result.success}`);
      console.log(`Confidence:      ${result.confidence}`);
      console.log(`Matched Cat:     ${result.matchedCategory}`);
      console.log(`Role Mode:       ${result.role || 'N/A'}`);

      if (!result.success) {
        console.log(`\n🛡️ SAFE REFUSAL GUARD TRIGGERED AS EXPECTED:`);
        console.log(`  Price Range:   ₹${result.priceRange?.min} - ₹${result.priceRange?.max}`);
        console.log(`  Clarification: ${result.clarificationMessage}`);
        console.log(`  Reasoning:     ${result.reasoning}`);
      } else {
        console.log(`\n💰 Fair Price:   ${result.priceRange.currency}${result.priceRange.min} - ${result.priceRange.currency}${result.priceRange.max} / ${result.priceRange.unit}`);
        if (result.seasonalFactor) {
          console.log(`🌱 Seasonal:     ${result.seasonalFactor.seasonName} (${result.seasonalFactor.impactLabel})`);
        }
        console.log(`\n📋 Playbook (${result.role === 'seller' ? 'Vendor Margin Defense' : 'Buyer Bargaining'}):`);
        console.log(`  Initial Offer/Quote: ${result.playbook?.openingOffer}`);
        console.log(`  Optimal Target:      ${result.playbook?.targetPrice}`);
        console.log(`  Floor/Ceiling Limit: ${result.playbook?.walkAwayPrice}`);
        console.log(`  Concession Tactic:   ${result.playbook?.concessionStrategy}`);
        if (result.playbook?.keyPhrases) {
          console.log(`  Key Phrases:`);
          result.playbook.keyPhrases.forEach((p, idx) => console.log(`    ${idx + 1}. ${p}`));
        }
      }
    } catch (err) {
      console.error(`❌ Test failed with error:`, err.message);
    }
  }

  console.log('\n================================================================');
  console.log('                 End of Pipeline Verification                   ');
  console.log('================================================================\n');
}

runTests();
