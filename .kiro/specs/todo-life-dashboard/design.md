# Design Document: To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a single-page browser application built with vanilla HTML5, CSS3, and JavaScript. The system provides a personal productivity dashboard featuring time-aware greetings, a focus timer, task management, and quick website access. All data persists locally using the browser's Local Storage API, eliminating the need for backend infrastructure.

### Key Design Principles

- **Zero Dependencies**: Pure vanilla JavaScript with no external libraries or frameworks
- **Local-First**: All data stored in browser Local Storage for instant access and privacy
- **Responsive Design**: Mobile-first approach with breakpoint at 768px
- **Performance**: Sub-1-second load time with no external network requests
- **Simplicity**: Clean component architecture with clear separation of concerns

## Architecture

### System Architecture

The application follows a component-based architecture where each major feature is encapsulated in a self-contained module. The architecture consists of:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  (Main HTML structure, component containers)            │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─────────────────────────────────┐
                          │                                 │
┌─────────────────────────▼─────────┐    ┌─────────────────▼──────────┐
│         styles.css                │    │        app.js               │
│  (All styling, responsive layout) │    │  (Application entry point)  │
└───────────────────────────────────┘    └─────────────────┬───────────┘
                                                            │
                          ┌─────────────────────────────────┼─────────────────────────┐
                          │                                 │                         │
                          │                                 │                         │
              ┌───────────▼──────────┐         ┌───────────▼──────────┐  ┌──────────▼─────────┐
              │  GreetingComponent   │         │   TimerComponent     │  │  TaskListComponent │
              │  - Display time      │         │   - 25min countdown  │  │  - CRUD operations │
              │  - Display date      │         │   - Start/Stop/Reset │  │  - Completion      │
              │  - Time-based        │         │   - Notification     │  │  - Persistence     │
              │    greeting          │         └──────────────────────┘  └────────┬───────────┘
              └──────────────────────┘                                            │
                                                                                  │
                          ┌───────────────────────────────────────────────────────┘
                          │
              ┌───────────▼──────────┐         ┌────────────────────────┐
              │ QuickLinksComponent  │         │   StorageManager       │
              │  - Add/Remove links  │────────▶│   - LocalStorage API   │
              │  - Open in new tab   │         │   - Serialization      │
              │  - URL validation    │         │   - Data retrieval     │
              └──────────────────────┘         └────────────────────────┘
```

### Component Responsibilities

1. **GreetingComponent**: Manages time display and contextual greetings
2. **TimerComponent**: Implements 25-minute focus timer with controls
3. **TaskListComponent**: Handles task CRUD operations and completion tracking
4. **QuickLinksComponent**: Manages website shortcuts with URL validation
5. **StorageManager**: Centralizes all Local Storage interactions

### File Structure

```
todo-life-dashboard/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling and responsive layout
└── js/
    └── app.js          # All JavaScript (components + initialization)
```

## Components and Interfaces

### 1. GreetingComponent

**Purpose**: Display current time, date, and time-appropriate greeting

**Public Interface**:
```javascript
class GreetingComponent {
  constructor(containerElement)
  init()                    // Initialize and start clock
  destroy()                 // Clean up intervals
}
```

**Internal Methods**:
```javascript
_updateTime()             // Update time display every second
_getGreeting(hour)        // Return greeting based on hour (5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night)
_formatTime(date)         // Format as 12-hour with AM/PM
_formatDate(date)         // Format as readable date string
```

**DOM Structure**:
```html
<div class="greeting-component">
  <div class="time">12:34 PM</div>
  <div class="date">Monday, January 15, 2024</div>
  <div class="greeting">Good Afternoon</div>
</div>
```

### 2. TimerComponent

**Purpose**: Provide 25-minute focus timer with start/stop/reset controls

**Public Interface**:
```javascript
class TimerComponent {
  constructor(containerElement)
  init()
  destroy()
}
```

**Internal Methods**:
```javascript
_start()                  // Begin countdown
_stop()                   // Pause countdown
_reset()                  // Reset to 25:00
_tick()                   // Decrement timer by 1 second
_formatTime(seconds)      // Format as MM:SS
_showNotification()       // Display completion message
```

**State**:
```javascript
{
  duration: 1500,         // 25 minutes in seconds
  remaining: 1500,
  isRunning: false,
  intervalId: null
}
```

**DOM Structure**:
```html
<div class="timer-component">
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button class="btn-start">Start</button>
    <button class="btn-stop">Stop</button>
    <button class="btn-reset">Reset</button>
  </div>
  <div class="timer-notification" style="display:none">Time's up!</div>
</div>
```

### 3. TaskListComponent

**Purpose**: Manage task creation, editing, completion, and deletion with persistence

**Public Interface**:
```javascript
class TaskListComponent {
  constructor(containerElement, storageManager)
  init()
  destroy()
}
```

**Internal Methods**:
```javascript
_addTask(text)            // Create new task
_editTask(id, newText)    // Update task text
_toggleComplete(id)       // Toggle completion status
_deleteTask(id)           // Remove task
_renderTasks()            // Re-render task list
_loadTasks()              // Load from storage
_saveTasks()              // Persist to storage
```

**Data Model**:
```javascript
Task {
  id: string,             // UUID or timestamp-based
  text: string,
  completed: boolean,
  createdAt: number       // Timestamp for ordering
}
```

**DOM Structure**:
```html
<div class="task-list-component">
  <div class="task-input-container">
    <input type="text" class="task-input" placeholder="Add a new task...">
    <button class="btn-add-task">Add</button>
  </div>
  <ul class="task-list">
    <li class="task-item" data-id="123">
      <input type="checkbox" class="task-checkbox">
      <span class="task-text">Sample task</span>
      <button class="btn-edit">Edit</button>
      <button class="btn-delete">Delete</button>
    </li>
  </ul>
</div>
```

### 4. QuickLinksComponent

**Purpose**: Manage website shortcuts with URL validation and persistence

**Public Interface**:
```javascript
class QuickLinksComponent {
  constructor(containerElement, storageManager)
  init()
  destroy()
}
```

**Internal Methods**:
```javascript
_addLink(name, url)       // Create new quick link
_deleteLink(id)           // Remove quick link
_validateURL(url)         // Validate URL format
_openLink(url)            // Open in new tab
_renderLinks()            // Re-render link buttons
_loadLinks()              // Load from storage
_saveLinks()              // Persist to storage
```

**Data Model**:
```javascript
QuickLink {
  id: string,
  name: string,
  url: string,
  createdAt: number
}
```

**URL Validation**: Accept URLs starting with `http://`, `https://`, or `www.`

**DOM Structure**:
```html
<div class="quick-links-component">
  <div class="link-input-container">
    <input type="text" class="link-name-input" placeholder="Name">
    <input type="url" class="link-url-input" placeholder="URL">
    <button class="btn-add-link">Add</button>
  </div>
  <div class="links-container">
    <button class="quick-link-btn" data-id="456" data-url="https://example.com">
      Example
      <span class="btn-delete-link">×</span>
    </button>
  </div>
</div>
```

### 5. StorageManager

**Purpose**: Centralize all Local Storage operations with error handling

**Public Interface**:
```javascript
class StorageManager {
  save(key, data)           // Serialize and save to localStorage
  load(key)                 // Load and deserialize from localStorage
  remove(key)               // Remove item from localStorage
  clear()                   // Clear all storage (for testing)
}
```

**Storage Keys**:
- `dashboard_tasks`: Array of Task objects
- `dashboard_links`: Array of QuickLink objects

**Error Handling**: Gracefully handle quota exceeded errors and corrupted data

## Data Models

### Task Model

```javascript
{
  id: string,              // Unique identifier (UUID or timestamp)
  text: string,            // Task description (max 500 chars)
  completed: boolean,      // Completion status
  createdAt: number        // Unix timestamp for ordering
}
```

**Validation Rules**:
- `text`: Required, non-empty after trimming, max 500 characters
- `completed`: Boolean, defaults to false
- `id`: Must be unique within task list

### QuickLink Model

```javascript
{
  id: string,              // Unique identifier
  name: string,            // Display name (max 50 chars)
  url: string,             // Valid URL
  createdAt: number        // Unix timestamp for ordering
}
```

**Validation Rules**:
- `name`: Required, non-empty after trimming, max 50 characters
- `url`: Must match URL pattern (http://, https://, or www.)
- `id`: Must be unique within links list

### Local Storage Schema

```javascript
// localStorage['dashboard_tasks']
[
  { id: "1", text: "Buy groceries", completed: false, createdAt: 1705334400000 },
  { id: "2", text: "Finish report", completed: true, createdAt: 1705334500000 }
]

// localStorage['dashboard_links']
[
  { id: "1", name: "Gmail", url: "https://gmail.com", createdAt: 1705334400000 },
  { id: "2", name: "GitHub", url: "https://github.com", createdAt: 1705334500000 }
]
```


## Error Handling

### Local Storage Errors

**Quota Exceeded**:
- Detect `QuotaExceededError` when saving
- Display user-friendly message: "Storage limit reached. Please delete some items."
- Prevent new additions until space is available
- Log error to console for debugging

**Corrupted Data**:
- Wrap `JSON.parse()` in try-catch blocks
- If parsing fails, log error and return empty array
- Display message: "Unable to load saved data. Starting fresh."
- Preserve corrupted data in separate key for potential recovery

**Storage Unavailable**:
- Check for `localStorage` availability on init
- If unavailable (private browsing, disabled), show warning
- Allow app to function without persistence
- Display banner: "Storage disabled. Changes won't be saved."

### User Input Errors

**Invalid Task Text**:
- Trim whitespace before validation
- Reject empty strings
- Show inline error: "Task cannot be empty"
- Clear error on valid input

**Invalid URL**:
- Validate URL format using regex: `^(https?:\/\/)|(www\.)`
- Show inline error: "Please enter a valid URL (http://, https://, or www.)"
- Prevent link creation until valid
- Clear error on valid input

**Edit Conflicts**:
- If task being edited is deleted by another tab, show message
- Discard edit and refresh task list
- Use storage events to detect cross-tab changes

### Timer Errors

**Browser Tab Inactive**:
- Timer may drift when tab is inactive due to browser throttling
- Document this limitation in user-facing help
- Consider using Web Workers for more accurate timing (future enhancement)

**Notification Permission**:
- Request notification permission on first timer completion
- If denied, fall back to in-page notification only
- Don't repeatedly prompt if user denies

### Component Initialization Errors

**Missing DOM Elements**:
- Check for required container elements on init
- Throw descriptive error if missing: `Error: Container element not found for GreetingComponent`
- Fail fast during development
- Log error and skip component in production

**Event Listener Failures**:
- Wrap event listener additions in try-catch
- Log errors but allow other components to initialize
- Provide fallback for critical interactions

