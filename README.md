# Tab Timer

A Firefox extension that automatically closes tabs after a set timer. Perfect for managing time-sensitive content, taking breaks, or preventing tab overload.

## Features

- **Two Timer Modes**
  - **Countdown Timer**: Set a specific duration (hours, minutes, seconds)
  - **End Time**: Schedule tab closure for a specific time of day

- **Quick Timer Presets**
  - Countdown: 5, 10, and 15-minute quick buttons
  - End Time: Smart suggestions for next 15-minute intervals

- **Smart Defaults**
  - End time automatically suggests nearest 15-minute mark at least 10 minutes away
  - Handles day rollover (e.g., 11:56 PM → 12:00 AM next day)

- **Persistent Timers**
  - Timers continue running even if you close the popup
  - Survives browser restarts (uses Firefox's alarms API)

- **Clean, Modern Interface**
  - Compact 312px popup with gradient accent theme
  - Dual-view design: setup screen and countdown screen
  - Real-time countdown display

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/dividing-by-zaro/firefox-timer.git
   cd firefox-timer
   ```

2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

3. Click **"Load Temporary Add-on"**

4. Select the `manifest.json` file from the cloned directory

5. The Tab Timer icon will appear in your Firefox toolbar

> **Note**: Temporary add-ons are removed when Firefox restarts. For permanent installation, you'll need to sign the extension through Mozilla.

## Usage

### Setting a Countdown Timer

1. Click the Tab Timer icon in your toolbar
2. Ensure "Countdown" mode is selected (left side of toggle)
3. Use the up/down arrows to set hours, minutes, and seconds
   - Or click a quick preset: **5m**, **10m**, or **15m**
4. Click **Start Timer**
5. The view switches to show countdown and "Reset" button

### Setting an End Time

1. Click the Tab Timer icon in your toolbar
2. Click "End Time" or toggle the switch to End Time mode
3. Enter a time in 12-hour format (e.g., "10:45")
4. Select AM or PM from the dropdown
   - Or click one of the three quick time suggestions
5. Click **Start Timer**
6. The view switches to show countdown and "Reset" button

### Canceling a Timer

- Click the **Reset** button while timer is active
- Closes the popup without affecting the tab

## How It Works

- When you start a timer, Tab Timer records the current tab's ID
- The extension runs a background script that monitors the timer
- When the timer expires, **only the specific tab** where the timer was set will close
- Other tabs in the same window remain open
- A notification appears when the tab closes

## Development

### Project Structure

```
firefox-timer/
├── manifest.json       # Extension configuration (Manifest V2)
├── background.js       # Background script (timer logic, tab closing)
├── popup/
│   ├── popup.html     # Popup UI structure
│   ├── popup.css      # Styling (gradient theme, compact layout)
│   └── popup.js       # UI logic and message passing
└── assets/
    └── *.png          # Extension icons
```

### Testing Changes

1. Make your code changes
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Reload** next to "Tab Timer"
4. Open the popup to test your changes

### Key Technologies

- **Firefox WebExtensions API** (Manifest V2)
- **browser.alarms** - Persistent timer scheduling
- **browser.storage.local** - Timer state persistence
- **browser.tabs** - Tab management
- **browser.notifications** - Completion alerts

## Technical Details

- **Manifest Version**: 2 (Firefox-specific)
- **Minimum Firefox Version**: 57.0
- **Permissions Required**: tabs, storage, alarms, notifications
- **Background Script**: Non-persistent (event-driven)

## Browser Compatibility

Currently supports **Firefox only**. The extension uses:
- `browser.*` API namespace (Firefox standard)
- Manifest V2 format with Firefox-specific configurations
- `browser_action` (not `action` like Chrome's Manifest V3)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

## Credits

Built with Firefox WebExtensions API. UI inspired by modern timer applications.
