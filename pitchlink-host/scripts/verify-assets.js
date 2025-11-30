#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Verifying Expo Asset Configuration...\n');

// Check if required asset files exist
const requiredAssets = [
  'assets/images/icon.png',
  'assets/images/splash.png',
  'assets/images/adaptive-icon.png',
  'assets/images/favicon.png'
];

let allAssetsExist = true;

requiredAssets.forEach(asset => {
  const assetPath = path.join(__dirname, '..', asset);
  if (fs.existsSync(assetPath)) {
    const stats = fs.statSync(assetPath);
    console.log(`✓ ${asset} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`✗ ${asset} (MISSING)`);
    allAssetsExist = false;
  }
});

console.log('\nChecking app.json configuration...\n');

// Check app.json configuration
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const expoConfig = appJson.expo;
  
  console.log('✓ app.json found');
  
  // Check splash configuration
  if (expoConfig.splash && expoConfig.splash.image) {
    console.log(`✓ Splash screen configured: ${expoConfig.splash.image}`);
  } else {
    console.log('✗ Splash screen not configured');
    allAssetsExist = false;
  }
  
  // Check icon configuration
  if (expoConfig.icon) {
    console.log(`✓ App icon configured: ${expoConfig.icon}`);
  } else {
    console.log('✗ App icon not configured');
    allAssetsExist = false;
  }
  
  // Check Android adaptive icon configuration
  if (expoConfig.android && expoConfig.android.adaptiveIcon && expoConfig.android.adaptiveIcon.foregroundImage) {
    console.log(`✓ Android adaptive icon configured: ${expoConfig.android.adaptiveIcon.foregroundImage}`);
  } else {
    console.log('✗ Android adaptive icon not configured');
  }
  
  // Check web favicon configuration
  if (expoConfig.web && expoConfig.web.favicon) {
    console.log(`✓ Web favicon configured: ${expoConfig.web.favicon}`);
  } else {
    console.log('✗ Web favicon not configured');
  }
} else {
  console.log('✗ app.json not found');
  allAssetsExist = false;
}

console.log('\n' + '='.repeat(50));
if (allAssetsExist) {
  console.log('✅ All assets are properly configured!');
  console.log('You can now build your app with:');
  console.log('  npx expo build:android');
  console.log('  npx expo build:ios');
} else {
  console.log('❌ Some assets are missing or misconfigured.');
  console.log('Please check the errors above and fix them.');
}
console.log('='.repeat(50));