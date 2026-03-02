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

├── time-saver/
│       ├── manifest.json           # Extension config (Manifest V3)
│       ├── popup.html              # Popup UI (hourly rate + summaries)
│       ├── popup.css               # Popup styling
│       ├── popup.js                # Popup logic (save rate, display stats)
│       ├── content.js              # Content script (runs on YouTube)
│       └── icon.png                # Extension icon

---

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