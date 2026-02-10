#!/usr/bin/env node

/**
 * Hostinger FTP Deployment Script
 * Uploads site and studio to Hostinger with proper mirroring
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import * as ftp from 'basic-ftp';
import readline from 'readline';

const config = {
  host: '77.37.37.242',
  port: 21,
  user: 'u289779063.paleturquoise-crow-983526.hostingersite.com',
  paths: {
    site: {
      local: 'dist',
      remote: '/public_html',
    },
    studio: {
      local: 'cosyblog/dist',
      remote: '/public_html/studio',
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
  console.log('🔍 Running preflight checks...\n');

  const checks = [];

  if (deployTarget === 'all' || deployTarget === 'site') {
    // Check site build
    if (!existsSync('dist')) {
      console.error('❌ dist/ directory not found');
      checks.push(false);
    } else if (!existsSync('dist/index.html')) {
      console.error('❌ dist/index.html not found');
      checks.push(false);
    } else if (!existsSync('dist/assets')) {
      console.error('❌ dist/assets/ directory not found');
      checks.push(false);
    } else {
      const assets = readdirSync('dist/assets').filter(f => f.endsWith('.js'));
      if (assets.length === 0) {
        console.error('❌ No .js files found in dist/assets/');
        checks.push(false);
      } else {
        console.log('✅ Site build verified (index.html + assets)');
        checks.push(true);
      }
    }
  }

  if (deployTarget === 'all' || deployTarget === 'studio') {
    // Check studio build
    if (!existsSync('cosyblog/dist')) {
      console.error('❌ cosyblog/dist/ directory not found');
      checks.push(false);
    } else if (!existsSync('cosyblog/dist/index.html')) {
      console.error('❌ cosyblog/dist/index.html not found');
      checks.push(false);
    } else {
      console.log('✅ Studio build verified');
      checks.push(true);
    }
  }

  console.log('');

  if (checks.includes(false)) {
    console.error('❌ Preflight checks failed. Run "npm run build:all" first.\n');
    process.exit(1);
  }

  console.log('✅ All preflight checks passed!\n');
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

// Clear remote directory
async function clearRemoteDirectory(client, remotePath) {
  try {
    console.log(`🗑️  Clearing ${remotePath}...`);
    await client.removeDir(remotePath);
    await client.ensureDir(remotePath);
  } catch (err) {
    // Directory might not exist, that's fine
    await client.ensureDir(remotePath);
  }
}

// Upload directory with progress
async function uploadDirectory(client, localPath, remotePath, label) {
  console.log(`📤 Uploading ${label}...`);

  const files = getAllFiles(localPath);
  const total = files.length;
  let uploaded = 0;

  for (const localFile of files) {
    const relativePath = relative(localPath, localFile).replace(/\\/g, '/');
    const remoteFile = `${remotePath}/${relativePath}`;

    // Ensure remote directory exists
    const remoteDir = remoteFile.substring(0, remoteFile.lastIndexOf('/'));
    await client.ensureDir(remoteDir);

    // Upload file
    await client.uploadFrom(localFile, remoteFile);

    uploaded++;
    const percent = Math.round((uploaded / total) * 100);
    process.stdout.write(`\r   Progress: ${uploaded}/${total} files (${percent}%)   `);
  }

  console.log('\n');
}

async function deploy(target = 'all') {
  const deployBoth = target === 'all';

  console.log(`🚀 Starting FTP deployment to Hostinger...\n`);

  // Run preflight checks
  preflightChecks(target);

  // Get password
  const password = await askQuestion('Enter FTP password: ');
  console.log('');
  rl.close();

  // Connect
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('🔌 Connecting to Hostinger FTP...');
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: password,
      secure: false,
    });
    console.log('✅ Connected successfully!\n');

    // Deploy site
    if (deployBoth || target === 'site') {
      await clearRemoteDirectory(client, config.paths.site.remote);
      await uploadDirectory(
        client,
        config.paths.site.local,
        config.paths.site.remote,
        'Site (dist → /public_html)'
      );
    }

    // Deploy studio
    if (deployBoth || target === 'studio') {
      await clearRemoteDirectory(client, config.paths.studio.remote);
      await uploadDirectory(
        client,
        config.paths.studio.local,
        config.paths.studio.remote,
        'Studio (cosyblog/dist → /public_html/studio)'
      );
    }

    // Verify deployment
    console.log('🔍 Verifying deployment...\n');

    const verifications = [];

    if (deployBoth || target === 'site') {
      try {
        await client.size('/public_html/index.html');
        console.log('✅ Site: index.html uploaded');
        verifications.push(true);
      } catch {
        console.log('❌ Site: index.html missing!');
        verifications.push(false);
      }
    }

    if (deployBoth || target === 'studio') {
      try {
        await client.size('/public_html/studio/index.html');
        console.log('✅ Studio: index.html uploaded');

        const indexContent = await client.downloadTo(Buffer.alloc(0), '/public_html/studio/index.html');
        const hasCorrectPaths = indexContent.toString().includes('/studio/static/');
        if (hasCorrectPaths) {
          console.log('✅ Studio: paths are correct (/studio/static/)');
          verifications.push(true);
        } else {
          console.log('⚠️  Studio: paths may be incorrect');
          verifications.push(false);
        }
      } catch {
        console.log('❌ Studio: index.html missing!');
        verifications.push(false);
      }
    }

    console.log('');
    if (verifications.includes(false)) {
      console.log('⚠️  Some verification checks failed. Please review.\n');
    }

    console.log('✅ Deployment complete!\n');
    console.log('🌐 Site: https://paleturquoise-crow-983526.hostingersite.com');
    if (deployBoth || target === 'studio') {
      console.log('🎨 Studio: https://paleturquoise-crow-983526.hostingersite.com/studio');
    }
    console.log('');

  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Parse command line args
const args = process.argv.slice(2);
const target = args[0] || 'all'; // 'all', 'site', or 'studio'

if (!['all', 'site', 'studio'].includes(target)) {
  console.error('Usage: node deploy.js [all|site|studio]');
  process.exit(1);
}

deploy(target).catch(console.error);
