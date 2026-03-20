# FreshCut Recall

Your personal client cheat sheet. Save details about people you meet at the salon — their name, phone number, clipper guard, what you talked about, pets, kids — and look them up before their next appointment so you never forget a face.

## How to Use

1. **Open index.html** in your browser (double-click it, or drag it into Chrome/Safari)
2. The app opens on the **Add** screen — type in someone's info fast between clients
3. Tap **Clients** at the bottom to search your database by name or phone number
4. Tap any person to see their full profile, edit their info, or delete them

## How to Deploy on Netlify

1. Push this entire folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) and connect the repo
3. Deploy — that's it, no build step needed

## How to Wrap for iOS

When you're ready to build this as an iOS app:
1. Install Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. Add iOS: `npx cap add ios`
3. Sync: `npx cap sync`
4. Open in Xcode: `npx cap open ios`

No special iOS flags — this app uses only localStorage and standard DOM APIs, which work perfectly in Capacitor's WebView.

## How to Make Changes

Upload any file to Claude and describe what you want changed. Claude will rewrite the full file for you — just replace the old one.

## Data

All data is saved in your browser's localStorage. Use the CSV export feature (in the code) as a backup if you ever need to move your data.