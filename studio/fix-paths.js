#!/usr/bin/env node

/**
 * Fix Sanity Studio paths after build
 * Converts /static/ to /studio/static/ in index.html
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'dist', 'index.html');

console.log('🔧 Fixing asset paths in Sanity Studio build...');

try {
  let content = readFileSync(indexPath, 'utf-8');

  // Replace /static/ with /studio/static/
  const before = content;
  content = content.replace(/\/static\//g, '/studio/static/');

  if (content !== before) {
    writeFileSync(indexPath, content, 'utf-8');
    console.log('✅ Fixed paths: /static/ → /studio/static/');
  } else {
    console.log('⚠️  No paths to fix');
  }
} catch (err) {
  console.error('❌ Error fixing paths:', err.message);
  process.exit(1);
}
