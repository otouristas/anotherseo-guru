#!/usr/bin/env node

// Configuration validation script
console.log('🔍 Validating configuration files...');

import fs from 'node:fs';
import path from 'node:path';

// Helpers
function tryParseJSON(name, content) {
  try {
    return { ok: true, data: JSON.parse(content) };
  } catch (e1) {
    // Fallback for JSON with comments/trailing commas (JSONC)
    const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, '');
    const withoutLine = withoutBlock.replace(/^\s*\/\/.*$/gm, '');
    const withoutTrailingCommas = withoutLine.replace(/,(\s*[}\]])/g, '$1');
    try {
      return { ok: true, data: JSON.parse(withoutTrailingCommas) };
    } catch (e2) {
      return { ok: false, error: e2.message };
    }
  }
}

// Validate JSON files
const jsonFiles = [
  'package.json',
  'components.json',
  '.lintstagedrc.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json'
];

console.log('📄 Checking JSON files:');
jsonFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const result = tryParseJSON(file, content);
      if (result.ok) {
        console.log(`✅ ${file} - Valid JSON${file.startsWith('tsconfig') ? ' (JSONC supported)' : ''}`);
      } else {
        console.log(`❌ ${file} - JSON Error: ${result.error}`);
      }
    } else {
      console.log(`⚠️  ${file} - File not found`);
    }
  } catch (error) {
    console.log(`❌ ${file} - JSON Error: ${error.message}`);
  }
});

// Validate TOML files (basic syntax check)
const tomlFiles = ['netlify.toml'];

console.log('📄 Checking TOML files:');
tomlFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic TOML validation - check for common syntax issues
      const lines = content.split('\n');
      let bracketCount = 0;
      let inQuotes = false;
      let quoteChar = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines
        if (line.startsWith('#') || line === '') continue;
        
        // Check for unclosed quotes
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"' || char === "'") {
            if (!inQuotes) {
              inQuotes = true;
              quoteChar = char;
            } else if (char === quoteChar && (j === 0 || line[j-1] !== '\\')) {
              inQuotes = false;
              quoteChar = '';
            }
          }
        }
        
        // Count brackets
        bracketCount += (line.match(/\[/g) || []).length;
        bracketCount -= (line.match(/\]/g) || []).length;
      }
      
      if (inQuotes) {
        throw new Error('Unclosed quotes detected');
      }
      
      if (bracketCount !== 0) {
        throw new Error('Unmatched brackets detected');
      }
      
      console.log(`✅ ${file} - Valid TOML syntax`);
    } else {
      console.log(`⚠️  ${file} - File not found`);
    }
  } catch (error) {
    console.log(`❌ ${file} - TOML Error: ${error.message}`);
  }
});

// Check for common Netlify configuration issues
console.log('🔧 Checking Netlify configuration:');
try {
  if (fs.existsSync('netlify.toml')) {
    const content = fs.readFileSync('netlify.toml', 'utf8');
    
    // Check for problematic sections
    const issues = [];
    
    if (content.includes('[build.ignore]')) {
      issues.push('Invalid [build.ignore] section found');
    }
    
    if (content.includes('[[edge_functions]]') && !content.includes('# [[edge_functions]]')) {
      issues.push('Edge functions configuration may cause issues');
    }
    
    if (content.includes('[[forms]]') && !content.includes('# [[forms]]')) {
      issues.push('Forms configuration may cause issues');
    }
    
    if (issues.length === 0) {
      console.log('✅ Netlify configuration looks good');
    } else {
      issues.forEach(issue => console.log(`⚠️  ${issue}`));
    }
  }
} catch (error) {
  console.log(`❌ Error checking Netlify config: ${error.message}`);
}

console.log('✅ Configuration validation complete!');
