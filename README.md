# Novalis DR Archive

Novalis is a mobile-friendly installable web app for organizing desired realities, worlds, characters, timelines, lore, locations, diaries, wardrobes, school and career notes, finances, galleries, and memorials.

## Run locally

Use any static server from this folder. Examples:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Add to Home Screen

Deploy the folder to any static host that supports HTTPS, such as GitHub Pages, Netlify, Vercel, Firebase Hosting, or Cloudflare Pages. Once opened on your phone, use the browser's install or Add to Home Screen action.

## Cross-device login and sync

The app works locally out of the box using browser storage. For email login and cloud sync:

1. Create a Firebase project with Email/Password Auth and Firestore.
2. Copy `firebase-config.example.js` to `firebase-config.js`.
3. Fill in your Firebase credentials and set `enabled: true`.
4. Deploy the app to HTTPS hosting.

When Firebase is enabled, the login form uses email/password authentication and saves world data to Firestore so you can access it on multiple devices.
