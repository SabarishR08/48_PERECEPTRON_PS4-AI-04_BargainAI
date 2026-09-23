const fs = require('fs');
const path = require('path');
const https = require('https');

// Test images of common market items in the 3 categories:
// 1. Tomatoes (Produce)
// 2. USB-C Cable (Electronics Accessories)
// 3. Cotton T-Shirt (Apparel)
const TEST_IMAGES = [
  {
    category: 'produce',
    name: 'fresh_tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    description: 'Fresh red country tomatoes in market basket',
    location: { city: 'Delhi', locality: 'Sarojini Nagar Mandi', tier: 'tier1_metro' }
  },
  {
    category: 'electronics',
    name: 'usb_c_cable',
    url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80',
    description: 'Black braided USB fast charging cable',
    location: { city: 'Jaipur', locality: 'Gaurav Tower Street Bazaar', tier: 'tier2_city' }
  },
  {
    category: 'apparel',
    name: 'cotton_tshirt',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
    description: 'Plain white crewneck cotton t-shirt',
    location: { city: 'Sonipat', locality: 'Rural Haat', tier: 'rural' }
  }
];

function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects if any
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
  console.log('=====================================================');
  console.log('  BargainAI - Real-World Online Image Pipeline Test  ');
  console.log('=====================================================\n');

  for (const item of TEST_IMAGES) {
    console.log(`\n-----------------------------------------------------`);
    console.log(`[TESTING] ${item.name.toUpperCase()} (${item.category.toUpperCase()})`);
    console.log(`Image Source: ${item.url}`);
    console.log(`Market Location: ${item.location.city} (${item.location.tier})`);
    console.log(`Downloading online image...`);

    try {
      const base64Image = await downloadImageAsBase64(item.url);
      console.log(`✓ Image successfully downloaded (Size: ${(base64Image.length / 1024).toFixed(1)} KB)`);

      const payload = {
        itemText: item.description,
        itemPhoto: `data:image/jpeg;base64,${base64Image}`,
        location: item.location,
        categoryHint: item.category
      };

      console.log(`Calling local Next.js /api/estimate endpoint...`);
      const response = await fetch('http://localhost:3000/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      console.log('\n--- Pipeline Result ---');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Identified Item: ${result.identifiedItem}`);
      console.log(`Category: ${result.matchedCategory} | Condition: ${result.condition} | Confidence: ${result.confidence}`);
      console.log(`Fair Price Range: ${result.priceRange.currency}${result.priceRange.min} - ${result.priceRange.currency}${result.priceRange.max} / ${result.priceRange.unit}`);
      console.log(`\nReasoning:\n${result.reasoning}`);

      if (result.playbook) {
        console.log(`\nNegotiation Playbook:`);
        console.log(`  Opening Counter: ${result.playbook.openingOffer}`);
        console.log(`  Target Price:    ${result.playbook.targetPrice}`);
        console.log(`  Walk-Away Point: ${result.playbook.walkAwayPrice}`);
        console.log(`  Concession:      ${result.playbook.concessionStrategy}`);
        if (result.playbook.keyPhrases) {
          console.log(`  Key Phrases:`);
          result.playbook.keyPhrases.forEach((p, i) => console.log(`    ${i + 1}. ${p}`));
        }
      }

      console.log(`\nNegotiation Tips:`);
      result.negotiationTips.forEach((t, i) => console.log(`  • ${t}`));
      console.log(`\nData Source Used: ${result.referenceData?.source} (Baseline: ₹${result.referenceData?.baselineMin} - ₹${result.referenceData?.baselineMax}, Multiplier: ${result.referenceData?.multiplier}x)`);
    } catch (err) {
      console.error(`❌ Error during test:`, err.message);
    }
  }

  console.log('\n=====================================================');
  console.log('              End of Pipeline Test                   ');
  console.log('=====================================================\n');
}

runTests();
