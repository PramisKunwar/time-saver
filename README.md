# Youtube Time Value Calculator

A simple Chrome Extension that calculates how much monet you're spending while watching YouTube, based on your hourly rate.


---

## Core concept

When you watch a YouTube video, the extension tracks your watch time and calculates the cost:

---
Cost = (Time Watched in Hours) * Hourly Rate

**Example:** Watching 10 minutes at $12/hour = 0.166 *12 = **$1.99**

---

## Project Structure

```
├──time-saver/
│       ├── manifest.json           # Extension config (Manifest V3)
│       ├── popup.html              # Popup UI (hourly rate + summaries)
│       ├── popup.css               # Popup styling
│       ├── popup.js                # Popup logic (save rate, display stats)
│       ├── content.js              # Content script (runs on YouTube)
│       └── icon.png                # Extension icon
```

---

## 🧩 Extension Files

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 config — permissions, content scripts, popup |
| `popup.html` | Popup UI with hourly rate input, weekly/monthly summaries |
| `popup.css` | Clean, minimal styling with YouTube-inspired red accents |
| `popup.js` | Loads/saves hourly rate, calculates and displays cost estimates |
| `content.js` | Injected on YouTube — tracks video play/pause, shows floating overlay |
| `icon.png` | Extension toolbar icon |

---

## Features

- **Hourly Rate Input** - Set your rate (default: $10/hour), saved via 'chrome.storage.local'
- **Live Cost Overlay** - Floating box on Youtube showing time watched and cost in real-time
- **Play/Pause Detection** - Timer runs only while the video is playing
- **Weekly Summary** - Total watch time and cost displayed in the popup
- **Monthly Estimate** - Weekly cost *a
- **Reset Data** - One-click reset of all watch time data

---

## How to Install

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `public/chrome-extension` folder
6. Open any YouTube video — you'll see a floating cost overlay!

---

## 🛠️ Tech Stack

### Chrome Extension
- Vanilla JavaScript
- Chrome Extension APIs (Manifest V3)
- `chrome.storage.local` for persistence

## How It Works

### Content Script (`content.js`)
1. Detects the `<video>` element on YouTube pages
2. Listens for `play` and `pause` events
3. Increments a seconds counter every second while playing
4. Calculates cost: `(seconds / 3600) × hourlyRate`
5. Updates the floating overlay in real-time
6. Saves cumulative watch time to `chrome.storage.local` every 10 seconds
7. Handles YouTube's SPA navigation (video changes without page reload)

### Popup (`popup.js`)
1. Loads saved hourly rate and total watch time from storage
2. Displays weekly time/cost and estimated monthly cost
3. Allows updating the hourly rate
4. Provides a reset button to clear all data

---

## Simplicity Rules

This extension intentionally does **NOT** include:
- User accounts or login
- Cloud storage or databases
- API calls or AI features
- Analytics or notifications
- Background service workers
- Cross-tab or cross-site tracking

---

## 📄 License

Built for hackclub  — free to use and modify.