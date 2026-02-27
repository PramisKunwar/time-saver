// ===== popup.js =====
// Handles the extension popup UI: loading/saving hourly rate,
// displaying weekly and monthly cost estimates.

// Wait for popup HTML to load
document.addEventListener("DOMContentLoaded", () => {
  const hourlyRateInput = document.getElementById("hourlyRate");
  const saveBtn = document.getElementById("saveRate");
  const saveMessage = document.getElementById("saveMessage");
  const weeklyTimeEl = document.getElementById("weeklyTime");
  const weeklyCostEl = document.getElementById("weeklyCost");
  const monthlyCostEl = document.getElementById("monthlyCost");
  const resetBtn = document.getElementById("resetBtn");

  // --- Load saved data from chrome.storage.local ---
  chrome.storage.local.get(["hourlyRate", "totalSeconds"], (data) => {
    // Use saved rate or default to 10
    const rate = data.hourlyRate || 10;
    hourlyRateInput.value = rate;

    // Get total seconds watched (default 0)
    const totalSeconds = data.totalSeconds || 0;

    // Update the display
    updateDisplay(totalSeconds, rate);
  });

  // --- Save hourly rate when user clicks Save ---
  saveBtn.addEventListener("click", () => {
    const rate = parseFloat(hourlyRateInput.value);

    // Validate input
    if (isNaN(rate) || rate < 0) {
      saveMessage.textContent = "Please enter a valid number.";
      saveMessage.style.color = "#ef4444";
      return;
    }

    // Save to chrome.storage.local
    chrome.storage.local.set({ hourlyRate: rate }, () => {
      saveMessage.textContent = "✓ Saved!";
      saveMessage.style.color = "#22c55e";

      // Refresh display with new rate
      chrome.storage.local.get(["totalSeconds"], (data) => {
        updateDisplay(data.totalSeconds || 0, rate);
      });

      // Clear message after 2 seconds
      setTimeout(() => {
        saveMessage.textContent = "";
      }, 2000);
    });
  });

  // --- Reset all data ---
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all watch time data?")) {
      chrome.storage.local.set({ totalSeconds: 0 }, () => {
        const rate = parseFloat(hourlyRateInput.value) || 10;
        updateDisplay(0, rate);
        saveMessage.textContent = "✓ Data reset!";
        saveMessage.style.color = "#22c55e";
        setTimeout(() => {
          saveMessage.textContent = "";
        }, 2000);
      });
    }
  });
});

/**
 * Update the popup display with time and cost information.
 * @param {number} totalSeconds - Total seconds watched this week
 * @param {number} hourlyRate - User's hourly rate in dollars
 */
function updateDisplay(totalSeconds, hourlyRate) {
  // Convert seconds to minutes for display
  const totalMinutes = Math.floor(totalSeconds / 60);

  // Convert seconds to hours for cost calculation
  const totalHours = totalSeconds / 3600;

  // Calculate weekly cost
  const weeklyCost = totalHours * hourlyRate;

  // Estimate monthly cost (weekly × 4)
  const monthlyCost = weeklyCost * 4;

  // Update the UI elements
  document.getElementById("weeklyTime").textContent =
    totalMinutes + " minutes";
  document.getElementById("weeklyCost").textContent =
    "$" + weeklyCost.toFixed(2);
  document.getElementById("monthlyCost").textContent =
    "$" + monthlyCost.toFixed(2);
}