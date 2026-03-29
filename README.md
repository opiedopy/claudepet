# 🐾 My Pet Shop — PWA

## File Structure

```
/                          ← serve this as web root
├── index.html
├── manifest.json
├── sw.js
└── images/
    ├── dog.png
    ├── cat.png
    └── curler-hamster-icon.png
```

## Setup

1. Place your images in the `images/` folder (names must match exactly).
2. Serve from any static host (Netlify, Vercel, GitHub Pages, local server).
3. **Must be served over HTTPS** for PWA/Service Worker to work.
   - Exception: `localhost` works over HTTP for local dev.

## How to Deploy an Update (triggers the update banner)

1. Edit your files.
2. Open `sw.js` and bump the version string at the top:
   ```js
   const CACHE_VERSION = 'v2';  // was 'v1'
   ```
3. Deploy. The next time a user opens the app, the green banner
   **"Fresh update available! Tap to refresh"** will appear.
4. The user taps it → new version activates instantly.

## Target Platforms

- iPhone 12 / 15 (Safari, Add to Home Screen)
- iPad (recent, Safari)
- MacBook (recent, Chrome / Safari)

## PWA Install (iOS)

Safari → Share button → **Add to Home Screen**  
The hamster icon and "Pet Shop" name will appear on the home screen.

## Local Dev

```bash
npx serve .
# then open http://localhost:3000
```
