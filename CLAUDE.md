# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tab Timer is a Firefox extension (Manifest V2) that allows users to set a timer to automatically close the current tab. It provides two timer modes: countdown timer and specific end time.

## Architecture

### Three-Component Structure

**1. Popup UI (`popup/`)** - User interface for timer configuration
- `popup.html` - Two-view system:
  - **timer-setup-view**: Configure timer (toggle, time picker, quick buttons, start button)
  - **timer-countdown-view**: Active timer display (countdown, reset button)
- `popup.css` - 312px width compact design with dark blue (#1e40af) to purple (#7c3aed) gradient theme
- `popup.js` - UI logic, view switching, message passing to background script

**2. Background Script (`background.js`)** - Timer execution and tab management
- Non-persistent event page
- Uses browser.alarms API for timer completion (survives extension restarts)
- Stores active timer state in browser.storage.local with tabId
- Closes specific tab (not window) when timer completes

**3. Manifest (`manifest.json`)** - Extension configuration
- Requires permissions: tabs, storage, alarms, notifications
- Firefox-specific (gecko) with minimum version 57.0

### Key Workflows

**Starting a Timer:**
1. User configures time in popup (countdown or specific end time)
2. Popup sends message with `{command: 'start', timerInfo}` to background
3. Background captures current tab ID, calculates end time
4. Creates browser alarm and stores timer state
5. Popup switches to countdown-view, background sends periodic updates

**Timer Completion:**
1. browser.alarms.onAlarm fires in background script
2. Retrieves stored tabId from storage
3. Calls browser.tabs.remove(tabId) to close specific tab
4. Shows notification and cleans up state

**View Switching:**
- Popup maintains two views that never display simultaneously
- `showSetupView()` and `showCountdownView()` toggle display
- Reset button or timer completion returns to setup view

## UI Components

### Timer Setup View

**Countdown Mode:**
- Time picker with up/down arrows for HH:MM:SS
- Quick buttons: 5m, 10m, 15m (customizable in HTML)
- All times are in seconds for duration calculation

**End Time Mode:**
- Text input for time (12-hour format: "10:45")
- AM/PM dropdown (positioned far right with `margin-left: auto`)
- Three quick-select buttons showing next 15-minute intervals (calculated at least 10 minutes in future)
- Smart default: nearest 15-min interval (00, 15, 30, 45) at least 10 minutes away

**Toggle Labels:**
- "Countdown" and "End Time" labels are clickable (`cursor: pointer`)
- Clicking switches modes and updates toggle state

### Timer Countdown View

- Large countdown display (44px font)
- Label: "Before Tab Closes" (uppercase, 10px)
- Single "Reset" button

## Message Passing Protocol

Popup → Background:
- `{command: 'start', timerInfo: {mode, duration}}` - Start timer
- `{command: 'reset'}` - Cancel timer
- `{command: 'getTimerState'}` - Query current timer (for popup initialization)

Background → Popup:
- `{command: 'updateStatus', timeRemaining}` - Periodic countdown updates (every 1000ms)
- `{command: 'timerComplete'}` - Notify timer finished

## Testing the Extension

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from this directory
4. Extension icon appears in toolbar - click to open popup
5. After making code changes, click "Reload" next to extension in about:debugging

## Time Calculations

**Default End Time (`setDefaultEndTime()`):**
- Adds 10 minutes to current time
- Rounds up to nearest 15-minute mark
- Handles day rollover (11:56 PM → 12:00 AM)

**Quick Time Buttons (`populateQuickTimeButtons()`):**
- Generates next 3 intervals starting from default time
- Always displays 12-hour format with AM/PM

**Countdown → End Time Conversion:**
- User input is in HH:MM:SS (24-hour format internally)
- Duration stored in milliseconds: `hours * 3600 + minutes * 60 + seconds) * 1000`

**Specific Time → Duration:**
- Parses 12-hour input + AM/PM dropdown
- Converts to 24-hour, handles noon/midnight edge cases
- If target time < current time, schedules for next day
- Duration = target timestamp - current timestamp

## Styling Guidelines

- Primary gradient: `linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)`
- Applied to: toggle switch, start button
- Accent color: dark blue `#1e40af` for borders, arrows, active labels
- Font sizes: 10-14px range for readability in compact 312px width
- Use `white-space: nowrap` for single-line labels
- Button hover states use lighter blue backgrounds

## Browser API Usage

- `browser.tabs.query()` - Get current tab ID
- `browser.tabs.remove(tabId)` - Close specific tab
- `browser.alarms.create('closeWindowTimer', {when})` - Schedule timer completion
- `browser.alarms.onAlarm` - Listen for timer completion
- `browser.storage.local` - Persist timer state (survives restarts)
- `browser.notifications.create()` - Show completion notification
