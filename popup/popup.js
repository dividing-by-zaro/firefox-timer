// DOM Elements
const timerModeToggle = document.getElementById('timer-mode-toggle');
const countdownLabel = document.getElementById('countdown-label');
const specificLabel = document.getElementById('specific-label');
const countdownMode = document.getElementById('countdown-mode');
const specificTimeMode = document.getElementById('specific-time-mode');
const hoursValue = document.getElementById('hours-value');
const minutesValue = document.getElementById('minutes-value');
const secondsValue = document.getElementById('seconds-value');
const timeInput = document.getElementById('time-input');
const ampmSelect = document.getElementById('ampm-select');
const quickButtons = document.querySelectorAll('.quick-button');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const statusText = document.getElementById('status-text');

// Time values for countdown mode
let hours = 0;
let minutes = 15;
let seconds = 0;

// Initialize display
updateTimeDisplay();

// Toggle between countdown and specific time mode
timerModeToggle.addEventListener('change', () => {
  if (timerModeToggle.checked) {
    // Switch to specific time mode
    countdownLabel.style.color = '#1a1a1a';
    specificLabel.style.color = '#4285f4';
    countdownMode.style.display = 'none';
    specificTimeMode.style.display = 'block';
  } else {
    // Switch to countdown mode
    countdownLabel.style.color = '#4285f4';
    specificLabel.style.color = '#1a1a1a';
    countdownMode.style.display = 'block';
    specificTimeMode.style.display = 'none';
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

// Start button
startButton.addEventListener('click', () => {
  let timerInfo = {
    mode: timerModeToggle.checked ? 'specificTime' : 'countdown'
  };

  if (timerInfo.mode === 'countdown') {
    // Calculate total seconds
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds === 0) {
      updateStatus('Please set a time greater than 0.');
      return;
    }

    timerInfo.duration = totalSeconds * 1000; // Convert to milliseconds

    // Send to background script
    browser.runtime.sendMessage({ command: 'start', timerInfo })
      .then(response => {
        if (response && response.success) {
          const endTime = new Date(Date.now() + timerInfo.duration);
          updateStatus(`Timer set to close tab at ${formatTime(endTime)}.`);
        }
      })
      .catch(error => {
        console.error('Error starting timer:', error);
        updateStatus('Error starting timer.');
      });
  } else {
    // Specific time mode
    const timeValue = timeInput.value;
    const ampm = ampmSelect.value;

    if (!timeValue) {
      updateStatus('Please select a time.');
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
          updateStatus(`Timer set for ${formatTime12Hour(targetHours, targetMinutes)}.`);
        }
      })
      .catch(error => {
        console.error('Error starting timer:', error);
        updateStatus('Error starting timer.');
      });
  }
});

// Reset button
resetButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ command: 'reset' })
    .then(() => {
      // Reset countdown timer to default
      hours = 0;
      minutes = 15;
      seconds = 0;
      updateTimeDisplay();
      updateStatus('No active timer. Tab remains open.');
    })
    .catch(error => {
      console.error('Error resetting timer:', error);
    });
});

// Helper functions
function updateStatus(message) {
  statusText.textContent = `Status: ${message}`;
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
      // Format time remaining as countdown
      const totalSeconds = Math.max(0, Math.floor(message.timeRemaining / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      updateStatus(`Timer active: ${timeStr} remaining.`);
    } else if (message.status) {
      updateStatus(message.status);
    }
  } else if (message.command === 'timerComplete') {
    updateStatus('Timer completed. Tab closed.');
  }
});

// Check for existing timer on popup open
browser.runtime.sendMessage({ command: 'getTimerState' })
  .then(response => {
    if (response && response.active && response.timeRemaining > 0) {
      // Format time remaining as countdown
      const totalSeconds = Math.floor(response.timeRemaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const endTime = new Date(response.endTime);
      updateStatus(`Timer active: ${timeStr} remaining. Closes at ${formatTime(endTime)}.`);
    }
  })
  .catch(error => {
    console.error('Error getting timer state:', error);
  });
