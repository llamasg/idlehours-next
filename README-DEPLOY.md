# Deployment Guide

Deploy your Pokémon blog to Hostinger via FTP with automated scripts.

## Quick Start

```bash
# Deploy everything (site + studio)
npm run deploy

# Deploy only the main site
npm run deploy:site

# Deploy only Sanity Studio
npm run deploy:studio
```

## Prerequisites

**First time setup:**
```bash
npm install basic-ftp --save-dev
```

**Before deploying:**
```bash
npm run build:all
```

This builds both the main site (`dist/`) and Sanity Studio (`cosyblog/dist/`).

## Deployment Scripts

### npm run deploy (Recommended)

Deploys both site and studio to Hostinger.

**What it does:**
1. ✅ Runs `npm run build:all` to build everything
2. ✅ Runs preflight checks:
   - Verifies `dist/index.html` exists
   - Verifies `dist/assets/*.js` files exist
   - Verifies `cosyblog/dist/index.html` exists
3. ✅ Prompts for FTP password
4. ✅ Clears remote directories
5. ✅ Uploads site: `dist/*` → `/public_html/`
6. ✅ Uploads studio: `cosyblog/dist/*` → `/public_html/studio/`
7. ✅ Shows live URLs

**Usage:**
```bash
npm run deploy
```

### npm run deploy:site

Deploys only the main site (faster for site-only changes).

```bash
npm run deploy:site
```

### npm run deploy:studio

Deploys only Sanity Studio (faster for CMS-only changes).

```bash
npm run deploy:studio
```

## Connection Details

- **Protocol:** FTP (NOT SFTP/SSH)
- **Host:** 77.37.37.242
- **Port:** 21
- **Username:** u289779063.paleturquoise-crow-983526.hostingersite.com
- **Password:** (prompted - never stored)

**Paths:**
- Site: `dist/` → `/public_html/`
- Studio: `cosyblog/dist/` → `/public_html/studio/`

**Important:** This Hostinger plan does NOT support SSH/SFTP. Only FTP on port 21 works.

## Expected Folder Structure on Hostinger

After successful deployment, your Hostinger `/public_html` should contain:

```
/public_html/
├── index.html              (from dist/index.html)
├── assets/
│   ├── index-[hash].js     (from dist/assets/)
│   ├── index-[hash].css
│   └── ...
├── studio/
│   ├── index.html          (from cosyblog/dist/index.html)
│   ├── static/
│   └── ...
```

## Verification Checklist

After deployment, verify:

- [ ] Main site loads: https://paleturquoise-crow-983526.hostingersite.com
- [ ] Images display correctly
- [ ] Blog posts load from Sanity
- [ ] Navigation works
- [ ] Sanity Studio loads: https://paleturquoise-crow-983526.hostingersite.com/studio
- [ ] Can login to studio
- [ ] Can edit content in studio

## Alternative: Bash Script (Linux/Mac/WSL)

If you prefer `lftp` with mirror functionality:

**Install lftp:**
```bash
# Ubuntu/Debian/WSL
sudo apt-get install lftp

# macOS
brew install lftp
```

**Deploy:**
```bash
npm run deploy:bash
```

This uses `lftp mirror -R --delete` for optimal sync behavior.

## Alternative: PowerShell (Windows)

```bash
npm run deploy:ps1
```

Uses native .NET FTP - no external tools required.

## Manual Deployment

If automated deployment fails, use an FTP client:

1. **Build:**
   ```bash
   npm run build:all
   ```

2. **Connect via FTP client:**
   - Host: `77.37.37.242`
   - Port: `21`
   - Username: `u289779063.paleturquoise-crow-983526.hostingersite.com`
   - Protocol: FTP (not SFTP)

3. **Upload:**
   - Upload `dist/*` → `/public_html/`
   - Upload `cosyblog/dist/*` → `/public_html/studio/`

**Recommended FTP Clients:**
- FileZilla (Windows/Mac/Linux)
- WinSCP (Windows)
- Cyberduck (Mac)

## What Gets Deployed

✅ **Deployed:**
- Built site files (`dist/`)
- Sanity Studio (`cosyblog/dist/`)

❌ **NOT Deployed:**
- Source files (`src/`, `*.tsx`)
- `node_modules/`
- Configuration files
- `.git/`
- Development files

## Troubleshooting

### Preflight checks fail

**Error:** `dist/ directory not found`

**Solution:**
```bash
npm run build:all
```

---

**Error:** `No .js files found in dist/assets/`

**Solution:** Check your Vite build. Try:
```bash
rm -rf dist
npm run build
```

### Connection timeout

**Error:** `getConnection: Timed out while waiting for handshake`

**Cause:** Trying to use SFTP/SSH instead of FTP

**Solution:** Ensure you're using:
- Port **21** (not 22)
- Host **77.37.37.242** (IP address)
- Protocol **FTP** (not SFTP)

### Site shows blank page

**Check:**
1. Visit https://paleturquoise-crow-983526.hostingersite.com
2. Open browser DevTools → Console
3. Look for 404 errors on assets

**Common causes:**
- Assets not uploaded (preflight should catch this)
- Wrong base path in Vite config (should be `/`)

**Solution:**
```bash
# Rebuild and redeploy
npm run build:all
npm run deploy
```

### Studio not accessible

**Error:** 404 on `/studio`

**Check:**
```bash
# Verify studio built
ls cosyblog/dist

# Should show:
# index.html  static/  ...
```

**Solution:**
```bash
# Rebuild studio
npm run build:studio

# Deploy studio only
npm run deploy:studio
```

### Password incorrect

Double-check your FTP password. The correct username is:
`u289779063.paleturquoise-crow-983526.hostingersite.com`

### Upload too fast / wrong files

The deployment script:
- Clears remote directories first
- Uploads ALL files from `dist/` and `cosyblog/dist/`
- Shows progress with file count

Typical upload time: 2-5 minutes depending on connection.

If upload was suspiciously fast (< 30s), check:
```bash
# Verify builds exist
ls dist/
ls cosyblog/dist/
```

## Live URLs

- **Main Site:** https://paleturquoise-crow-983526.hostingersite.com
- **Sanity Studio:** https://paleturquoise-crow-983526.hostingersite.com/studio

## Notes

- **FTP only:** No SSH/SFTP support on this hosting plan
- **Mirror behavior:** Deployment clears remote dirs, then uploads fresh
- **Password security:** Never stored - prompted each time
- **Typical upload:** 2-5 minutes for full deploy
- **Faster deploys:** Use `:site` or `:studio` targets for partial updates
