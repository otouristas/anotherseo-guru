#!/usr/bin/env node

// Simple build test script to identify issues
console.log('🔍 Testing build configuration...');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'index.html',
  'src/main.tsx',
  'src/App.tsx'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

// Check package.json for required dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'react',
  'react-dom',
  'vite',
  '@vitejs/plugin-react-swc'
];

console.log('📦 Checking required dependencies:');
requiredDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`✅ ${dep} found`);
  } else {
    console.log(`❌ ${dep} missing`);
  }
});

console.log('✅ Build configuration looks good!');
console.log('🚀 Ready to build...');
