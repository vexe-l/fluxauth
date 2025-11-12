# FluxAuth Chrome Extension

Behavioral biometric authentication extension for Chrome.

## Features

- 🔒 **Real-time Monitoring**: Tracks typing behavior across all websites
- 📊 **Trust Scoring**: Continuous authentication with trust scores
- ⚠️ **Security Alerts**: Notifications when unusual patterns are detected
- 🎯 **Privacy-First**: Only captures timing patterns, never keystrokes

## Setup

### 1. Create Icons (Temporary Placeholders)

For now, you can use any PNG images as icons. Just create three files in the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Or download a lock icon from https://icons8.com or use an emoji-to-image converter.

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list!

### 3. Configure Extension

1. Click the FluxAuth icon in your Chrome toolbar
2. Enter your configuration:
   - **User ID**: Your FluxAuth user ID
   - **API Key**: `dev_key_12345_CHANGE_IN_PRODUCTION`
   - **API URL**: `http://localhost:3001/api` (or your deployed backend)
3. Toggle **Protection Status** to ON
4. Click **Save Settings**

### 4. Test It!

1. Make sure your FluxAuth backend is running (locally or deployed)
2. Visit any website and start typing
3. The extension will:
   - Monitor your typing behavior
   - Send data to the backend every 30 seconds
   - Show your trust score in the popup
   - Display alerts if unusual patterns detected

## How It Works

### Content Script (`content.js`)
- Runs on all web pages
- Captures keyboard events (keydown/keyup)
- Classifies keys without storing actual values
- Sends batches of events to backend
- Shows warning banner if low trust score

### Background Script (`background.js`)
- Manages session state
- Updates extension badge based on trust score
- Shows browser notifications for security alerts

### Popup (`popup.html` + `popup.js`)
- Settings interface
- Displays current trust score
- Shows session information
- Enable/disable toggle

## Development

### Files Structure
```
chrome-extension/
├── manifest.json       # Extension configuration
├── content.js          # Runs on web pages
├── background.js       # Background service worker
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

### Testing Tips

1. **Check Console**: Open DevTools on any page to see FluxAuth logs
2. **Background Console**: Go to `chrome://extensions/` → FluxAuth → "service worker" link
3. **Reload Extension**: Click reload icon in `chrome://extensions/` after making changes

## Troubleshooting

**Extension not monitoring?**
- Check that Protection Status is ON
- Verify User ID and API Key are set
- Check browser console for errors

**No trust score showing?**
- Make sure backend is running
- Check API URL is correct
- Open Network tab to see if requests are going through

**Badge not updating?**
- Check background service worker console for errors
- Verify permissions in manifest.json

## Privacy & Security

- ✅ Only captures timing information
- ✅ Never stores actual keystrokes
- ✅ Keys are classified into categories only (letter/number/special)
- ✅ Password field detection for extra privacy
- ✅ Data sent to your own backend only

## Next Steps

- [ ] Add icon files
- [ ] Deploy backend to production
- [ ] Update API URL in settings
- [ ] Test on various websites
- [ ] Publish to Chrome Web Store (optional)

## Support

For issues or questions, check the main FluxAuth repository.
