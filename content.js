// ===== content.js =====
// This script runs on YouTube pages.
// It tracks how long the user watches videos and shows a floating cost overlay.

// --- State Variables ---
let secondsWatched = 0;       // Seconds watched on current video
let isPlaying = false;         // Is the video currently playing?
let timerInterval = null;      // Reference to the setInterval timer
let currentVideoId = null;     // Track which video we're on
let hourlyRate = 10;           // Default hourly rate

// --- Load the user's hourly rate from storage ---
chrome.storage.local.get(["hourlyRate"], (data) => {
  if (data.hourlyRate) {
    hourlyRate = data.hourlyRate;
  }
});

// Listen for changes to hourly rate (if user updates it in popup while watching)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.hourlyRate) {
    hourlyRate = changes.hourlyRate.newValue;
    updateOverlay(); // Refresh display with new rate
  }
});

// --- Create the floating overlay element ---
function createOverlay() {
  // Check if overlay already exists
  if (document.getElementById("ytvc-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "ytvc-overlay";

  // Style the overlay
  overlay.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: white;
    color: #1a1a1a;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    z-index: 99999;
    line-height: 1.6;
    min-width: 180px;
    border: 1px solid #f0f0f0;
    transition: opacity 0.3s;
  `;

  overlay.innerHTML = `
    <div style="font-weight: 700; color: #FF0000; margin-bottom: 4px; font-size: 12px;">
      ⏱️ Time Value
    </div>
    <div id="ytvc-time">Time Watched: 00:00</div>
    <div id="ytvc-cost" style="font-weight: 600;">Cost So Far: $0.00</div>
  `;

  document.body.appendChild(overlay);
}

// --- Update the overlay with current time and cost ---
function updateOverlay() {
  const timeEl = document.getElementById("ytvc-time");
  const costEl = document.getElementById("ytvc-cost");

  if (!timeEl || !costEl) return;

  // Format time as MM:SS
  const minutes = Math.floor(secondsWatched / 60);
  const seconds = secondsWatched % 60;
  const timeStr =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  // Calculate cost: (seconds / 3600) × hourly rate
  const cost = (secondsWatched / 3600) * hourlyRate;

  timeEl.textContent = "Time Watched: " + timeStr;
  costEl.textContent = "Cost So Far: $" + cost.toFixed(2);
}

// --- Start the timer (runs every second) ---
function startTimer() {
  if (timerInterval) return; // Don't start if already running

  timerInterval = setInterval(() => {
    secondsWatched++;
    updateOverlay();

    // Save total time to storage every 10 seconds (to avoid too many writes)
    if (secondsWatched % 10 === 0) {
      saveTotalTime();
    }
  }, 1000);
}

// --- Stop the timer ---
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  saveTotalTime(); // Save when paused
}

// --- Save total watched time to chrome.storage.local ---
function saveTotalTime() {
  chrome.storage.local.get(["totalSeconds"], (data) => {
    // We store the cumulative total across all videos
    const previousTotal = data.totalSeconds || 0;

    // We need to track what we've already saved to avoid double-counting
    chrome.storage.local.get(["lastSavedCurrent"], (saved) => {
      const lastSaved = saved.lastSavedCurrent || 0;
      const newSeconds = secondsWatched - lastSaved;

      if (newSeconds > 0) {
        chrome.storage.local.set({
          totalSeconds: previousTotal + newSeconds,
          lastSavedCurrent: secondsWatched,
        });
      }
    });
  });
}

// --- Get the current YouTube video ID from the URL ---
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

// --- Attach play/pause event listeners to the video element ---
function attachVideoListeners() {
  const video = document.querySelector("video");
  if (!video) return;

  // Remove old listeners to avoid duplicates
  video.removeEventListener("play", onPlay);
  video.removeEventListener("pause", onPause);

  // Add fresh listeners
  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPause);

  // If video is already playing when we attach, start tracking
  if (!video.paused) {
    onPlay();
  }
}

// --- Event handler: video starts playing ---
function onPlay() {
  isPlaying = true;
  createOverlay(); // Make sure overlay is visible
  startTimer();
}

// --- Event handler: video is paused ---
function onPause() {
  isPlaying = false;
  stopTimer();
}

// --- Check for video changes (YouTube is a SPA, pages don't fully reload) ---
function checkForVideoChange() {
  const newVideoId = getVideoId();

  // If the video ID changed, reset the current session timer
  if (newVideoId && newVideoId !== currentVideoId) {
    currentVideoId = newVideoId;

    // Save any remaining time from previous video
    saveTotalTime();

    // Reset current video timer
    secondsWatched = 0;
    chrome.storage.local.set({ lastSavedCurrent: 0 });

    stopTimer();
    updateOverlay();

    // Wait a moment for the new video element to load, then attach listeners
    setTimeout(attachVideoListeners, 1500);
  }
}

// --- Initialize ---
// Run when the content script first loads
function init() {
  createOverlay();
  currentVideoId = getVideoId();
  chrome.storage.local.set({ lastSavedCurrent: 0 });

  // Try to attach to video element (may need to wait for it)
  const tryAttach = setInterval(() => {
    const video = document.querySelector("video");
    if (video) {
      clearInterval(tryAttach);
      attachVideoListeners();
    }
  }, 500);

  // Clear after 10 seconds if no video found
  setTimeout(() => clearInterval(tryAttach), 10000);

  // Check for navigation changes every 2 seconds (YouTube SPA navigation)
  setInterval(checkForVideoChange, 2000);
}

// Start everything
init();