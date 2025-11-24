// Timer state
let timerInterval = null;

// Message listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case 'start':
      startTimer(message.timerInfo).then(sendResponse);
      return true; // Indicates async response
    case 'reset':
      resetTimer().then(() => sendResponse({ success: true }));
      return true;
    case 'getTimerState':
      getTimerState().then(sendResponse);
      return true;
  }
});

// Alarm listener for timer completion
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'closeWindowTimer') {
    handleTimerComplete();
  }
});

async function startTimer(timerInfo) {
  try {
    // Get the current tab ID
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (!tabs || tabs.length === 0) {
      console.error('No active tab found');
      return { success: false, error: 'No active tab' };
    }

    const tabId = tabs[0].id;
    const endTime = Date.now() + timerInfo.duration;

    // Store timer data
    const timerData = {
      tabId,
      endTime,
      mode: timerInfo.mode,
      active: true,
      startTime: Date.now()
    };

    await browser.storage.local.set({ timerData });

    // Create alarm
    await browser.alarms.create('closeWindowTimer', { when: endTime });

    // Start interval for status updates
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    timerInterval = setInterval(updatePopupStatus, 1000);

    console.log('Timer started:', timerData);
    return { success: true };

  } catch (error) {
    console.error('Error starting timer:', error);
    return { success: false, error: error.message };
  }
}

async function resetTimer() {
  try {
    // Clear alarm
    await browser.alarms.clear('closeWindowTimer');

    // Clear storage
    await browser.storage.local.remove('timerData');

    // Clear interval
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Notify popup
    try {
      await browser.runtime.sendMessage({
        command: 'updateStatus',
        status: 'No active timer. Tab remains open.'
      });
    } catch (e) {
      // Popup might be closed, ignore error
    }

    console.log('Timer reset');
  } catch (error) {
    console.error('Error resetting timer:', error);
  }
}

async function getTimerState() {
  try {
    const data = await browser.storage.local.get('timerData');

    if (data.timerData && data.timerData.active) {
      const timeRemaining = data.timerData.endTime - Date.now();

      if (timeRemaining > 0) {
        return {
          active: true,
          endTime: data.timerData.endTime,
          mode: data.timerData.mode,
          timeRemaining
        };
      } else {
        // Timer expired but alarm hasn't fired yet
        return { active: false };
      }
    }

    return { active: false };
  } catch (error) {
    console.error('Error getting timer state:', error);
    return { active: false };
  }
}

async function updatePopupStatus() {
  try {
    const state = await getTimerState();

    if (state.active && state.timeRemaining !== null) {
      // Timer is still active, send update
      try {
        await browser.runtime.sendMessage({
          command: 'updateStatus',
          timeRemaining: state.timeRemaining
        });
      } catch (e) {
        // Popup might be closed, that's ok
      }
    } else {
      // Timer is no longer active, stop interval
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  } catch (error) {
    console.error('Error updating popup status:', error);
  }
}

async function handleTimerComplete() {
  try {
    const data = await browser.storage.local.get('timerData');

    if (data.timerData && data.timerData.tabId) {
      const tabId = data.timerData.tabId;

      // Show notification
      try {
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/icon-48.png'),
          title: 'Tab Closer Timer',
          message: "Time's up! Closing tab."
        });
      } catch (e) {
        console.log('Could not show notification:', e);
      }

      // Close the tab
      try {
        await browser.tabs.remove(tabId);
      } catch (error) {
        console.error('Error closing tab:', error);
        // Tab might already be closed
      }

      // Clean up
      await resetTimer();

      console.log('Timer completed, tab closed');
    }
  } catch (error) {
    console.error('Error handling timer completion:', error);
  }
}

// Initialize: Check for existing timer on startup
(async function initialize() {
  const state = await getTimerState();

  if (state.active && !timerInterval) {
    // Resume timer interval if timer is active
    timerInterval = setInterval(updatePopupStatus, 1000);
    console.log('Resumed timer from previous session');
  }
})();
