#!/usr/bin/env node

/**
 * Hostinger FTP Deployment Script
 * Builds and uploads site + Sanity Studio to Hostinger via FTP
 * Usage: node deploy.js [all|site|studio]
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import * as ftp from 'basic-ftp';
import readline from 'readline';

const config = {
  host: '77.37.37.242',
  port: 21,
  user: 'u289779063.AlfieJE',
  siteUrl: 'https://idlehours.co.uk',
  paths: {
    site: {
      local: 'dist',
      remote: '/',        // FTP root maps to public_html
    },
    studio: {
      local: 'studio/dist',
      remote: '/studio',
    },
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Preflight checks
function preflightChecks(deployTarget = 'all') {
  console.log('Running preflight checks...\n');

  const checks = [];

  if (deployTarget === 'all' || deployTarget === 'site') {
    if (!existsSync('dist') || !existsSync('dist/index.html') || !existsSync('dist/assets')) {
      console.error('  FAIL: dist/ build not found or incomplete');
      checks.push(false);
    } else {
      const assets = readdirSync('dist/assets').filter(f => f.endsWith('.js'));
      if (assets.length === 0) {
        console.error('  FAIL: No .js files in dist/assets/');
        checks.push(false);
      } else {
        console.log('  OK: Site build verified (index.html + assets)');
        checks.push(true);
      }
    }
  }

  if (deployTarget === 'all' || deployTarget === 'studio') {
    if (!existsSync('studio/dist') || !existsSync('studio/dist/index.html')) {
      console.error('  FAIL: studio/dist/ build not found');
      checks.push(false);
    } else {
      console.log('  OK: Studio build verified');
      checks.push(true);
    }
  }

  console.log('');

  if (checks.includes(false)) {
    console.error('Preflight failed. Run "npm run build:all" first.\n');
    process.exit(1);
  }

  console.log('All checks passed!\n');
}

// Recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);
  files.forEach(file => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  return arrayOfFiles;
}

// Upload directory with progress (overwrites existing files, no clearing)
async function uploadDirectory(client, localPath, remotePath, label) {
  console.log(`Uploading ${label}...`);

  const files = getAllFiles(localPath);
  const total = files.length;
  let uploaded = 0;

  for (const localFile of files) {
    const relativePath = relative(localPath, localFile).replace(/\\/g, '/');
    const remoteFile = remotePath === '/'
      ? `/${relativePath}`
      : `${remotePath}/${relativePath}`;

    // Ensure remote directory exists
    const remoteDir = remoteFile.substring(0, remoteFile.lastIndexOf('/'));
    if (remoteDir) {
      await client.ensureDir(remoteDir);
    }

    // Upload file (overwrites if exists)
    await client.uploadFrom(localFile, remoteFile);

    uploaded++;
    const percent = Math.round((uploaded / total) * 100);
    process.stdout.write(`\r   ${uploaded}/${total} files (${percent}%)   `);
  }

  console.log(`\n   Done: ${total} files uploaded.\n`);
}

async function deploy(target = 'all') {
  console.log(`\n=== FTP Deploy to Hostinger (${target}) ===\n`);

  // Run preflight checks
  preflightChecks(target);

  // Get password
  const password = await askQuestion('FTP password: ');
  console.log('');
  rl.close();

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('Connecting to Hostinger FTP...');
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: password,
      secure: false,
    });
    console.log('Connected!\n');

    // Deploy site
    if (target === 'all' || target === 'site') {
      await uploadDirectory(
        client,
        config.paths.site.local,
        config.paths.site.remote,
        'Site (dist -> /)'
      );
    }

    // Deploy studio
    if (target === 'all' || target === 'studio') {
      await uploadDirectory(
        client,
        config.paths.studio.local,
        config.paths.studio.remote,
        'Studio (studio/dist -> /studio)'
      );
    }

    console.log('=== Deployment complete! ===\n');
    if (target === 'all' || target === 'site') {
      console.log(`  Site:   ${config.siteUrl}`);
    }
    if (target === 'all' || target === 'studio') {
      console.log(`  Studio: ${config.siteUrl}/studio`);
    }
    console.log('');

  } catch (err) {
    console.error('\nDeployment failed:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Parse CLI args
const target = process.argv[2] || 'all';

if (!['all', 'site', 'studio'].includes(target)) {
  console.error('Usage: node deploy.js [all|site|studio]');
  process.exit(1);
}

deploy(target).catch(console.error);
