# مصروفاتي (Masrofaty) — Deployment on Windows

## Deploy to Netlify (no tools needed)
1. Unzip `masrofaty.zip`. Keep `index.html` at the top level of the folder.
2. Sign in at https://app.netlify.com/drop
3. Drag the unzipped **folder** (not the zip) onto the page. You get an https:// link.
4. On iPhone, open the link in **Safari** → Share → **Add to Home Screen**.
5. Open the app once while online so files are cached; afterwards it starts offline.

## Test locally on Windows (optional)
Install Python, open PowerShell in the folder, run `python -m http.server 8080`, open http://localhost:8080.

## Updating
Edit files, then change `CACHE='masrofaty-v1'` to `v2` in `sw.js` and redeploy. Open apps reload once automatically.

## Notes
- Data lives only in this browser/device (IndexedDB). Use the Backup tab regularly.
- iOS may clear site data after long inactivity if the app is not added to the Home Screen.
