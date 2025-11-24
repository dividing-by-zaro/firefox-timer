// DOM Elements
const timerModeToggle = document.getElementById('timer-mode-toggle');
const countdownLabel = document.getElementById('countdown-label');
const specificLabel = document.getElementById('specific-label');
const countdownMode = document.getElementById('countdown-mode');
const specificTimeMode = document.getElementById('specific-time-mode');
const countdownDisplay = document.getElementById('countdown-display');
const hoursValue = document.getElementById('hours-value');
const minutesValue = document.getElementById('minutes-value');
const secondsValue = document.getElementById('seconds-value');
const timeInput = document.getElementById('time-input');
const ampmSelect = document.getElementById('ampm-select');
const quickButtons = document.querySelectorAll('.quick-button');
const mainButton = document.getElementById('main-button');
const countdownTime = document.getElementById('countdown-time');
const toggleContainer = document.getElementById('toggle-container');
const timerHeader = document.getElementById('timer-header');

// Time values for countdown mode
let hours = 0;
let minutes = 15;
let seconds = 0;

// Timer state
let isTimerActive = false;

// Initialize display
updateTimeDisplay();

// Set default end time to nearest 15-minute interval at least 10 minutes away
function setDefaultEndTime() {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentHours = now.getHours();

  // Add 10 minutes to current time
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
  let targetMinutes = tenMinutesLater.getMinutes();
  let targetHours = tenMinutesLater.getHours();

  // Round up to nearest 15-minute interval
  const remainder = targetMinutes % 15;
  if (remainder !== 0) {
    targetMinutes = targetMinutes + (15 - remainder);
    if (targetMinutes >= 60) {
      targetMinutes = 0;
      targetHours = (targetHours + 1) % 24;
    }
  }

  // Set AM/PM dropdown
  if (targetHours >= 12) {
    ampmSelect.value = 'PM';
  } else {
    ampmSelect.value = 'AM';
  }

  // Convert to 12-hour format for display
  let displayHours = targetHours % 12;
  if (displayHours === 0) displayHours = 12;

  // Set the time input value in 12-hour format
  const timeString = `${String(displayHours).padStart(2, '0')}:${String(targetMinutes).padStart(2, '0')}`;
  timeInput.value = timeString;
}

setDefaultEndTime();

// Calculate and populate quick time buttons
function populateQuickTimeButtons() {
  const now = new Date();
  const quickTimeButtons = document.querySelectorAll('.quick-time-button');
  const quickTimes = [];

  // Add 10 minutes to current time as starting point
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
  let targetMinutes = tenMinutesLater.getMinutes();
  let targetHours = tenMinutesLater.getHours();

  // Round up to nearest 15-minute interval
  const remainder = targetMinutes % 15;
  if (remainder !== 0) {
    targetMinutes = targetMinutes + (15 - remainder);
    if (targetMinutes >= 60) {
      targetMinutes = 0;
      targetHours = (targetHours + 1) % 24;
    }
  }

  // Generate next 3 15-minute intervals
  for (let i = 0; i < 3; i++) {
    const time = new Date();
    time.setHours(targetHours, targetMinutes, 0, 0);

    quickTimes.push({
      hours24: targetHours,
      minutes: targetMinutes,
      display: formatTime12Hour(targetHours, targetMinutes)
    });

    // Add 15 minutes for next interval
    targetMinutes += 15;
    if (targetMinutes >= 60) {
      targetMinutes = 0;
      targetHours = (targetHours + 1) % 24;
    }
  }

  // Set button text and click handlers
  quickTimeButtons.forEach((button, index) => {
    button.textContent = quickTimes[index].display;
    button.addEventListener('click', () => {
      const selectedTime = quickTimes[index];

      // Set AM/PM dropdown
      if (selectedTime.hours24 >= 12) {
        ampmSelect.value = 'PM';
      } else {
        ampmSelect.value = 'AM';
      }

      // Convert to 12-hour format for time input
      let displayHours = selectedTime.hours24 % 12;
      if (displayHours === 0) displayHours = 12;

      const timeString = `${String(displayHours).padStart(2, '0')}:${String(selectedTime.minutes).padStart(2, '0')}`;
      timeInput.value = timeString;
    });
  });
}

populateQuickTimeButtons();

// View switching functions
function showSetupMode() {
  isTimerActive = false;
  toggleContainer.style.display = 'flex';
  timerHeader.style.display = 'none';
  countdownDisplay.style.display = 'none';

  // Show appropriate setup mode based on toggle
  if (timerModeToggle.checked) {
    countdownMode.style.display = 'none';
    specificTimeMode.style.display = 'block';
  } else {
    countdownMode.style.display = 'block';
    specificTimeMode.style.display = 'none';
  }

  // Update button
  mainButton.textContent = 'Start Timer';
  mainButton.className = 'primary-button';
}

function showActiveTimer() {
  isTimerActive = true;
  toggleContainer.style.display = 'none';
  timerHeader.style.display = 'flex';
  countdownMode.style.display = 'none';
  specificTimeMode.style.display = 'none';
  countdownDisplay.style.display = 'flex';

  // Update button
  mainButton.textContent = 'Reset';
  mainButton.className = 'secondary-button';
}

// Toggle between countdown and specific time mode
function switchTimerMode() {
  if (timerModeToggle.checked) {
    // Switch to specific time mode
    countdownLabel.style.color = '#1a1a1a';
    specificLabel.style.color = '#1e40af';
    countdownMode.style.display = 'none';
    specificTimeMode.style.display = 'block';
  } else {
    // Switch to countdown mode
    countdownLabel.style.color = '#1e40af';
    specificLabel.style.color = '#1a1a1a';
    countdownMode.style.display = 'block';
    specificTimeMode.style.display = 'none';
  }
}

timerModeToggle.addEventListener('change', switchTimerMode);

// Make labels clickable
countdownLabel.addEventListener('click', () => {
  if (timerModeToggle.checked) {
    timerModeToggle.checked = false;
    switchTimerMode();
  }
});

specificLabel.addEventListener('click', () => {
  if (!timerModeToggle.checked) {
    timerModeToggle.checked = true;
    switchTimerMode();
  }
});

// Increment/Decrement buttons
document.querySelectorAll('.increment-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const segment = btn.dataset.segment;
    incrementTime(segment);
    updateTimeDisplay();
  });
});

document.querySelectorAll('.decrement-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const segment = btn.dataset.segment;
    decrementTime(segment);
    updateTimeDisplay();
  });
});

function incrementTime(segment) {
  switch (segment) {
    case 'hours':
      hours = (hours + 1) % 24;
      break;
    case 'minutes':
      minutes = (minutes + 1) % 60;
      break;
    case 'seconds':
      seconds = (seconds + 1) % 60;
      break;
  }
}

function decrementTime(segment) {
  switch (segment) {
    case 'hours':
      hours = (hours - 1 + 24) % 24;
      break;
    case 'minutes':
      minutes = (minutes - 1 + 60) % 60;
      break;
    case 'seconds':
      seconds = (seconds - 1 + 60) % 60;
      break;
  }
}

function updateTimeDisplay() {
  hoursValue.textContent = String(hours).padStart(2, '0');
  minutesValue.textContent = String(minutes).padStart(2, '0');
  secondsValue.textContent = String(seconds).padStart(2, '0');
}

// Quick timer buttons
quickButtons.forEach(button => {
  button.addEventListener('click', () => {
    const mins = parseInt(button.dataset.minutes, 10);
    hours = 0;
    minutes = mins;
    seconds = 0;
    updateTimeDisplay();
  });
});

// Main button (Start/Reset)
mainButton.addEventListener('click', () => {
  if (isTimerActive) {
    // Reset button clicked
    browser.runtime.sendMessage({ command: 'reset' })
      .then(() => {
        // Reset countdown timer to default
        hours = 0;
        minutes = 15;
        seconds = 0;
        updateTimeDisplay();
        // Switch back to setup view
        showSetupMode();
      })
      .catch(error => {
        console.error('Error resetting timer:', error);
      });
  } else {
    // Start button clicked
    let timerInfo = {
      mode: timerModeToggle.checked ? 'specificTime' : 'countdown'
    };

    if (timerInfo.mode === 'countdown') {
      // Calculate total seconds
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      if (totalSeconds === 0) {
        alert('Please set a time greater than 0.');
        return;
      }

      timerInfo.duration = totalSeconds * 1000; // Convert to milliseconds

      // Send to background script
      browser.runtime.sendMessage({ command: 'start', timerInfo })
        .then(response => {
          if (response && response.success) {
            // Switch to countdown view
            showActiveTimer();
            // Initialize countdown display
            updateCountdownDisplay(timerInfo.duration);
          }
        })
        .catch(error => {
          console.error('Error starting timer:', error);
          alert('Error starting timer.');
        });
    } else {
      // Specific time mode
      const timeValue = timeInput.value;
      const ampm = ampmSelect.value;

      if (!timeValue) {
        alert('Please select a time.');
        return;
      }

      // Parse the time
      const [hoursStr, minutesStr] = timeValue.split(':');
      let targetHours = parseInt(hoursStr, 10);
      const targetMinutes = parseInt(minutesStr, 10);

      // Convert to 24-hour format
      if (ampm === 'PM' && targetHours !== 12) {
        targetHours += 12;
      } else if (ampm === 'AM' && targetHours === 12) {
        targetHours = 0;
      }

      // Create target date
      const now = new Date();
      const targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        targetHours,
        targetMinutes,
        0
      );

      // If target time is in the past, set it for tomorrow
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const duration = targetDate.getTime() - now.getTime();

      timerInfo.targetTime = targetDate.getTime();
      timerInfo.duration = duration;

      // Send to background script
      browser.runtime.sendMessage({ command: 'start', timerInfo })
        .then(response => {
          if (response && response.success) {
            // Switch to countdown view
            showActiveTimer();
            // Initialize countdown display
            updateCountdownDisplay(duration);
          }
        })
        .catch(error => {
          console.error('Error starting timer:', error);
          alert('Error starting timer.');
        });
    }
  }
});

// Helper functions
function updateCountdownDisplay(timeRemaining) {
  if (timeRemaining !== undefined && timeRemaining !== null && timeRemaining > 0) {
    const totalSeconds = Math.max(0, Math.floor(timeRemaining / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    countdownTime.textContent = timeStr;
  } else {
    countdownTime.textContent = '00:00:00';
  }
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function formatTime12Hour(hours24, minutes) {
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const displayHours = hours24 % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Listen for updates from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.command === 'updateStatus') {
    if (message.timeRemaining !== undefined && message.timeRemaining !== null && message.timeRemaining > 0) {
      // Update countdown display
      updateCountdownDisplay(message.timeRemaining);
    }
  } else if (message.command === 'timerComplete') {
    // Timer completed, switch back to setup view
    showSetupMode();
  }
});

// Check for existing timer on popup open
browser.runtime.sendMessage({ command: 'getTimerState' })
  .then(response => {
    if (response && response.active && response.timeRemaining > 0) {
      // Timer is active, show countdown view
      showActiveTimer();
      updateCountdownDisplay(response.timeRemaining);
    } else {
      // No active timer, show setup view
      showSetupMode();
    }
  })
  .catch(error => {
    console.error('Error getting timer state:', error);
    showSetupMode();
  });
