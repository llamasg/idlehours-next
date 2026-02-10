# Sanity Studio Deployment Fix

## Problem Identified

The Sanity Studio was showing a blank page with this error:
```
Failed to load module script: Expected a JavaScript module script
but the server responded with a MIME type of "text/html"
```

**Root Cause:** Built `index.html` had paths like `/static/sanity-*.js` instead of `/studio/static/sanity-*.js`

Even though `basePath: '/studio'` was set in `sanity.config.ts`, Sanity's build process wasn't applying it to static asset paths.

---

## Solutions Implemented

### 1. Post-Build Path Fixer

Created `cosyblog/fix-paths.js` that runs after build:
- Automatically replaces `/static/` with `/studio/static/` in index.html
- Runs automatically via `npm run build` in studio

**Verified paths now:**
```html
<!-- Before -->
<script src="/static/sanity-*.js"></script>

<!-- After -->
<script src="/studio/static/sanity-*.js"></script>
```

### 2. Added .htaccess Files

**Main site** (`dist/.htaccess`):
- Enables client-side routing for React Router
- Serves static files directly
- Falls back to index.html for SPA routes

**Studio** (`cosyblog/dist/.htaccess`):
- Serves static assets directly
- Falls back to index.html for studio routing

### 3. Enhanced Deployment Verification

Updated `deploy.js` with post-deployment checks:
- ✅ Verifies `/public_html/index.html` exists
- ✅ Verifies `/public_html/studio/index.html` exists
- ✅ Verifies studio index.html contains `/studio/static/` paths
- ⚠️ Warns if any checks fail

---

## Files Modified

**Modified:**
- `cosyblog/package.json` - Added `"type": "module"` and updated build script
- `cosyblog/sanity.config.ts` - Already had `basePath: '/studio'` (no change needed)
- `vite.config.ts` - Added `publicDir: "public"` to copy .htaccess
- `deploy.js` - Added verification checks

**Created:**
- `cosyblog/fix-paths.js` - Post-build path fixer
- `cosyblog/vite.config.ts` - Vite config for studio
- `public/.htaccess` - Main site routing
- `cosyblog/dist/.htaccess` - Studio routing

---

## Build Process Now

### Studio Build:
```bash
npm run build:studio
```

**Steps:**
1. Runs `sanity build`
2. Runs `fix-paths.js` to fix asset paths
3. Outputs to `cosyblog/dist/` with correct paths

### Full Build:
```bash
npm run build:all
```

**Steps:**
1. Builds main site → `dist/`
2. Copies `public/.htaccess` → `dist/.htaccess`
3. Builds studio → `cosyblog/dist/`
4. Fixes paths in studio index.html
5. Copies `cosyblog/dist/.htaccess`

---

## Deployment

Run the deployment:
```bash
npm run deploy
```

**What happens:**
1. ✅ Builds both site and studio
2. ✅ Runs preflight checks
3. ✅ Uploads site with .htaccess
4. ✅ Uploads studio with .htaccess and fixed paths
5. ✅ Verifies deployment
6. ✅ Shows URLs

**Expected output:**
```
🔍 Verifying deployment...

✅ Site: index.html uploaded
✅ Studio: index.html uploaded
✅ Studio: paths are correct (/studio/static/)

✅ Deployment complete!

🌐 Site: https://paleturquoise-crow-983526.hostingersite.com
🎨 Studio: https://paleturquoise-crow-983526.hostingersite.com/studio
```

---

## Verification Checklist

After deployment, test:

**Main Site:**
- [ ] https://paleturquoise-crow-983526.hostingersite.com loads
- [ ] No console errors
- [ ] Navigation works (React Router)
- [ ] Blog posts load from Sanity
- [ ] Images display

**Sanity Studio:**
- [ ] https://paleturquoise-crow-983526.hostingersite.com/studio loads
- [ ] **No blank page** (was the issue)
- [ ] **No MIME type errors** (was the issue)
- [ ] Login screen displays
- [ ] Can login with Sanity credentials
- [ ] Dashboard loads
- [ ] Can edit content

---

## Technical Details

### Why the fix works:

1. **Sanity's build** generates paths from root (`/static/`)
2. **fix-paths.js** rewrites them to be relative to basePath (`/studio/static/`)
3. **Browser requests** go to the right location
4. **.htaccess** ensures proper routing and MIME types

### Path flow:

```
Browser: https://site.com/studio
    ↓
Loads: /public_html/studio/index.html
    ↓
Requests: /studio/static/sanity-*.js
    ↓
Server serves: /public_html/studio/static/sanity-*.js
    ↓
✅ Correct MIME type (application/javascript)
```

### Before fix:

```
Browser: https://site.com/studio
    ↓
Loads: /public_html/studio/index.html
    ↓
Requests: /static/sanity-*.js (wrong path!)
    ↓
Server tries: /public_html/static/sanity-*.js (doesn't exist)
    ↓
.htaccess fallback: Returns index.html
    ↓
❌ Wrong MIME type (text/html instead of javascript)
```

---

## Folder Structure on Hostinger

After deployment:

```
/public_html/
├── .htaccess                 ← Main site routing
├── index.html               ← React app
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── ...
└── studio/
    ├── .htaccess            ← Studio routing
    ├── index.html           ← Studio app (FIXED PATHS)
    └── static/
        ├── sanity-*.js      ← JS modules (correct MIME type)
        ├── favicon.ico
        └── ...
```

---

## Troubleshooting

### Studio still shows blank page

1. **Check console errors:**
   - Open DevTools → Console
   - Look for 404 or MIME type errors

2. **Verify paths in remote index.html:**
   - Should contain `/studio/static/` NOT `/static/`

3. **Rebuild and redeploy:**
   ```bash
   npm run build:studio
   npm run deploy:studio
   ```

### MIME type error persists

- Ensure `.htaccess` was uploaded to `/public_html/studio/`
- Check if server allows `.htaccess` files
- May need to contact Hostinger support

### Login works but dashboard blank

- Check Sanity project settings
- Verify CORS settings in Sanity dashboard
- Ensure dataset is set to "production"

---

## Next Steps

1. **Deploy now:**
   ```bash
   npm run deploy
   ```

2. **Test studio at:**
   https://paleturquoise-crow-983526.hostingersite.com/studio

3. **If it works:**
   - ✅ Login should display
   - ✅ Dashboard should load
   - ✅ Content editing should work

4. **Future updates:**
   - Site only: `npm run deploy:site`
   - Studio only: `npm run deploy:studio`
   - Both: `npm run deploy`

The studio should now work correctly! 🎉
