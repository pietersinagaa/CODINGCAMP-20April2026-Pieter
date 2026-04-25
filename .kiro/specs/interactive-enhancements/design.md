# Design Document: Interactive Enhancements

## Overview

The Interactive Enhancements feature extends the existing To-Do List Life Dashboard with three user-customization capabilities: theme switching (light/dark mode), personalized greetings with custom user names, and configurable Pomodoro timer durations. These enhancements are designed to integrate seamlessly with the existing vanilla JavaScript architecture while maintaining the dashboard's core principles of simplicity, local-first data storage, and zero dependencies.

### Key Design Principles

- **Backward Compatibility**: All existing functionality remains unchanged; enhancements are purely additive
- **Local-First Persistence**: All customization preferences stored in browser Local Storage
- **Zero Dependencies**: Pure vanilla JavaScript with no external libraries
- **Minimal DOM Changes**: Leverage existing component structure with minimal modifications
- **CSS Variables**: Use CSS custom properties for theme switching to enable instant, performant theme changes
- **Progressive Enhancement**: Dashboard functions with default settings if customization data is unavailable

### Integration Strategy

The design follows a non-invasive integration approach:
1. Extend existing components rather than rewrite them
2. Add new SettingsComponent without modifying existing component architecture
3. Use CSS custom properties for theme management
4. Leverage existing StorageManager for all persistence needs

## Architecture

### System Architecture

The enhanced architecture adds a new SettingsComponent and extends three existing components (GreetingComponent, TimerComponent, and the global theme system):

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  (Add settings container, theme data attribute)         │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─────────────────────────────────┐
                          │                                 │
┌─────────────────────────▼─────────┐    ┌─────────────────▼──────────┐
│         styles.css                │    │        app.js               │
│  (Add dark theme CSS variables,   │    │  (Add SettingsComponent,    │
│   theme-specific selectors)       │    │   extend existing classes)  │
└───────────────────────────────────┘    └─────────────────┬───────────┘
                                                            │
                          ┌─────────────────────────────────┼─────────────────────────┐
                          │                                 │                         │
              ┌───────────▼──────────┐         ┌───────────▼──────────┐  ┌──────────▼─────────┐
              │  GreetingComponent   │         │   TimerComponent     │  │ SettingsComponent  │
              │  [EXTENDED]          │         │   [EXTENDED]         │  │  [NEW]             │
              │  + Custom name       │         │   + Custom duration  │  │  - Theme switcher  │
              │  + Name sanitization │         │   + Duration config  │  │  - Name input      │
              │                      │         │   + Validation       │  │  - Duration input  │
              └──────────────────────┘         └──────────────────────┘  │  - Save feedback   │
                                                                          └────────┬───────────┘
                                                                                  │
                          ┌───────────────────────────────────────────────────────┘
                          │
              ┌───────────▼──────────┐         ┌────────────────────────┐
              │   StorageManager     │         │   ThemeManager         │
              │   [EXISTING]         │         │   [NEW]                │
              │   + dashboard_theme  │────────▶│   - Apply theme        │
              │   + dashboard_       │         │   - Toggle theme       │
              │     user_name        │         │   - Persist theme      │
              │   + dashboard_       │         └────────────────────────┘
              │     pomodoro_        │
              │     duration         │
              └──────────────────────┘
```

### Component Modifications Summary

**New Components**:
- SettingsComponent: Manages all customization controls
- ThemeManager: Handles theme application and persistence

**Extended Components**:
- GreetingComponent: Add custom name display and sanitization
- TimerComponent: Add configurable duration support

**Unchanged Components**:
- TaskListComponent: No modifications
- QuickLinksComponent: No modifications
- StorageManager: No modifications (reused as-is)

### File Structure

```
todo-life-dashboard/
├── index.html          # Add settings container section
├── css/
│   └── styles.css      # Add dark theme variables and selectors
└── js/
    └── app.js          # Add SettingsComponent, ThemeManager, extend existing components
```

## Components and Interfaces

### 1. ThemeManager (New)

**Purpose**: Centralize theme management, application, and persistence

**Public Interface**:
```javascript
class ThemeManager {
  constructor(storageManager)
  init()                          // Load and apply saved theme
  toggleTheme()                   // Switch between light and dark
  setTheme(themeName)             // Set specific theme ('light' or 'dark')
  getCurrentTheme()               // Get current theme name
}
```

**Internal Methods**:
```javascript
_applyTheme(themeName)            // Apply theme to DOM via data attribute
_loadTheme()                      // Load theme from storage
_saveTheme(themeName)             // Persist theme to storage
```

**Storage Key**: `dashboard_theme`

**Theme Application Strategy**:
- Use `data-theme` attribute on `<body>` element
- CSS selectors target `[data-theme="dark"]` for dark mode styles
- Default to light mode if no preference exists

**DOM Integration**:
```html
<body data-theme="light">
  <!-- Dashboard content -->
</body>
```

### 2. SettingsComponent (New)

**Purpose**: Provide unified interface for all customization controls

**Public Interface**:
```javascript
class SettingsComponent {
  constructor(containerElement, storageManager, themeManager, greetingComponent, timerComponent)
  init()
  destroy()
}
```

**Internal Methods**:
```javascript
_setupThemeSwitcher()             // Initialize theme toggle control
_setupNameInput()                 // Initialize name customization
_setupDurationInput()             // Initialize timer duration customization
_saveUserName(name)               // Validate and save user name
_savePomodoroD
uration(minutes)      // Validate and save duration
_showSuccessFeedback(message)     // Display save confirmation
_validateName(name)               // Validate user name (max 50 chars)
_validateDuration(minutes)        // Validate duration (1-120 minutes)
_sanitizeHTML(text)               // Prevent HTML injection
```

**Dependencies**:
- StorageManager: For persisting settings
- ThemeManager: For theme switching
- GreetingComponent: For updating displayed name
- TimerComponent: For updating timer duration

**DOM Structure**:
```html
<div class="settings-component">
  <h2 class="settings-title">Settings</h2>
  
  <!-- Theme Switcher -->
  <div class="settings-section">
    <label class="settings-label">Theme</label>
    <div class="theme-switcher">
      <button class="theme-btn theme-btn-light" data-theme="light">
        Light
      </button>
      <button class="theme-btn theme-btn-dark" data-theme="dark">
        Dark
      </button>
    </div>
    <div class="theme-indicator">Current: <span class="current-theme">Light</span></div>
  </div>
  
  <!-- Name Customization -->
  <div class="settings-section">
    <label class="settings-label" for="user-name-input">Your Name</label>
    <input type="text" 
           id="user-name-input" 
           class="settings-input" 
           placeholder="Enter your name" 
           maxlength="50">
    <button class="btn-save-name">Save Name</button>
    <div class="settings-hint">Leave empty to remove name from greeting</div>
    <div class="name-error-message" style="display: none;"></div>
  </div>
  
  <!-- Timer Duration Customization -->
  <div class="settings-section">
    <label class="settings-label" for="duration-input">Timer Duration (minutes)</label>
    <input type="number" 
           id="duration-input" 
           class="settings-input" 
           placeholder="25" 
           min="1" 
           max="120">
    <button class="btn-save-duration">Save Duration</button>
    <div class="settings-hint">Default: 25 minutes (Range: 1-120)</div>
    <div class="duration-error-message" style="display: none;"></div>
  </div>
  
  <!-- Success Feedback -->
  <div class="settings-success-message" style="display: none;"></div>
</div>
```

**Validation Rules**:
- User Name: 0-50 characters, HTML sanitized
- Pomodoro Duration: 1-120 minutes, integer only

### 3. GreetingComponent (Extended)

**Purpose**: Display time, date, time-based greeting, and optional custom name

**Extended Public Interface**:
```javascript
class GreetingComponent {
  constructor(containerElement, storageManager)  // Add storageManager parameter
  init()
  destroy()
  setUserName(name)                              // NEW: Update displayed name
  getUserName()                                  // NEW: Get current name
}
```

**New Internal Methods**:
```javascript
_loadUserName()                   // Load name from storage
_sanitizeHTML(text)               // Prevent HTML injection
_updateGreetingDisplay()          // Update greeting with name
```

**Storage Key**: `dashboard_user_name`

**Modified DOM Structure**:
```html
<div class="greeting-component">
  <div class="time">12:34:56 PM</div>
  <div class="date">Monday, January 15, 2024</div>
  <div class="greeting">Good Afternoon, Alice</div>  <!-- Name appended if set -->
</div>
```

**Greeting Format**:
- With name: `"Good Afternoon, Alice"`
- Without name: `"Good Afternoon"`

**HTML Sanitization Strategy**:
- Use `textContent` instead of `innerHTML` for user-provided names
- Strip all HTML tags from input
- Prevent XSS attacks by treating name as plain text

### 4. TimerComponent (Extended)

**Purpose**: Provide focus timer with configurable duration

**Extended Public Interface**:
```javascript
class TimerComponent {
  constructor(containerElement, storageManager)  // Add storageManager parameter
  init()
  destroy()
  setDuration(minutes)                           // NEW: Update timer duration
  getDuration()                                  // NEW: Get current duration
}
```

**New Internal Methods**:
```javascript
_loadDuration()                   // Load duration from storage
_convertMinutesToSeconds(minutes) // Convert minutes to seconds
_updateDurationDisplay()          // Update display with new duration
```

**Storage Key**: `dashboard_pomodoro_duration`

**Modified State**:
```javascript
{
  duration: 1500,                 // Configurable (default 25 minutes in seconds)
  remaining: 1500,
  isRunning: false,
  intervalId: null,
  customDurationMinutes: 25       // NEW: Store minutes for display
}
```

**Duration Change Behavior**:
- Duration can only be changed when timer is stopped (not running)
- Changing duration resets the timer to new duration
- Duration persists across browser sessions

## Data Models

### Theme Preference Model

```javascript
{
  theme: string  // 'light' or 'dark'
}
```

**Storage Key**: `dashboard_theme`

**Default Value**: `'light'`

**Validation**: Must be either `'light'` or `'dark'`

### User Name Model

```javascript
{
  userName: string  // User's custom name (0-50 characters)
}
```

**Storage Key**: `dashboard_user_name`

**Default Value**: `null` or empty string

**Validation Rules**:
- Max 50 characters
- HTML sanitized (no tags allowed)
- Empty string removes name from greeting

### Pomodoro Duration Model

```javascript
{
  pomodoroMinutes: number  // Duration in minutes (1-120)
}
```

**Storage Key**: `dashboard_pomodoro_duration`

**Default Value**: `25`

**Validation Rules**:
- Integer between 1 and 120 (inclusive)
- Stored as minutes, converted to seconds for timer

### Local Storage Schema

```javascript
// localStorage['dashboard_theme']
"dark"

// localStorage['dashboard_user_name']
"Alice"

// localStorage['dashboard_pomodoro_duration']
45

// Existing keys (unchanged)
// localStorage['dashboard_tasks']
[...]

// localStorage['dashboard_links']
[...]
```

## Theme Implementation

### CSS Variables Strategy

The theme system uses CSS custom properties (variables) to enable instant theme switching without page reload.

**Light Theme (Default)**:
```css
:root {
  /* Existing variables remain unchanged */
  --color-primary: #00D9FF;
  --color-secondary: #FFE500;
  --color-danger: #FF006E;
  --color-warning: #FF9500;
  --color-success: #00FF94;
  
  --color-bg: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-border: #000000;
  
  --color-text-primary: #000000;
  --color-text-secondary: #000000;
  --color-text-muted: #666666;
}
```

**Dark Theme**:
```css
[data-theme="dark"] {
  /* Inverted color scheme */
  --color-bg: #1A1A1A;
  --color-surface: #2A2A2A;
  --color-border: #FFFFFF;
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #E0E0E0;
  --color-text-muted: #999999;
  
  /* Adjusted accent colors for dark mode */
  --color-primary: #00D9FF;
  --color-secondary: #FFE500;
  --color-danger: #FF006E;
  --color-warning: #FF9500;
  --color-success: #00FF94;
}
```

**Component-Specific Dark Mode Adjustments**:
```css
[data-theme="dark"] .greeting-component {
  background-color: #3A3A00;  /* Darker yellow */
}

[data-theme="dark"] .timer-component {
  background-color: #003A44;  /* Darker cyan */
}

[data-theme="dark"] .task-list-component {
  background-color: #4A2A4A;  /* Darker pink */
}

[data-theme="dark"] .quick-links-component {
  background-color: #2A4A2A;  /* Darker green */
}

[data-theme="dark"] .settings-component {
  background-color: #2A2A2A;
}

[data-theme="dark"] .task-item,
[data-theme="dark"] .input {
  background-color: #3A3A3A;
}

[data-theme="dark"] .task-item.completed {
  background-color: #2A2A2A;
}
```

### Theme Switching Mechanism

1. User clicks theme button in SettingsComponent
2. ThemeManager.setTheme() is called
3. ThemeManager updates `data-theme` attribute on `<body>`
4. CSS automatically applies new theme via `[data-theme="dark"]` selectors
5. Theme preference saved to Local Storage
6. Visual indicator updated to show current theme

**Performance**: Theme switching is instant because it only changes a single DOM attribute; CSS handles the rest.

## Error Handling

### Settings Validation Errors

**Invalid User Name**:
- Detect names exceeding 50 characters
- Show inline error: "Name cannot exceed 50 characters"
- Prevent saving until valid
- Clear error on valid input

**Invalid Pomodoro Duration**:
- Detect values outside 1-120 range
- Detect non-integer values
- Show inline error: "Duration must be between 1 and 120 minutes"
- Prevent saving until valid
- Clear error on valid input

**HTML Injection Prevention**:
- Sanitize all user-provided text before display
- Use `textContent` instead of `innerHTML`
- Strip HTML tags from input
- Log sanitization attempts for security monitoring

### Storage Errors

**Theme Preference Corruption**:
- If stored theme is not 'light' or 'dark', default to 'light'
- Log warning to console
- Continue with default theme

**User Name Corruption**:
- If stored name is not a string, default to empty string
- Log warning to console
- Continue without custom name

**Duration Corruption**:
- If stored duration is not a valid number (1-120), default to 25
- Log warning to console
- Continue with default duration

**Storage Unavailable**:
- Settings component detects storage unavailability
- Display warning: "Settings cannot be saved (storage unavailable)"
- Allow settings changes but don't persist
- Use in-memory defaults for current session

### Component Integration Errors

**Missing Component References**:
- SettingsComponent checks for required component references on init
- If GreetingComponent unavailable, disable name customization
- If TimerComponent unavailable, disable duration customization
- Log warnings for missing components
- Continue with available features

**Timer Duration Change During Active Timer**:
- Prevent duration changes while timer is running
- Show message: "Stop the timer before changing duration"
- Disable duration input while timer is active

## Testing Strategy

This feature will use a dual testing approach combining unit tests for specific scenarios and property-based tests for universal behaviors.

### Unit Testing

Unit tests will focus on:

**Theme Switching**:
- Theme toggle switches between light and dark
- Theme persists to Local Storage
- Theme loads correctly on page load
- Invalid theme values default to light
- Theme applies to all components

**Name Customization**:
- Name appears in greeting when set
- Name is removed when cleared
- Name validation (50 character limit)
- HTML sanitization prevents injection
- Name persists across sessions

**Duration Customization**:
- Duration updates timer initialization
- Duration validation (1-120 range)
- Duration persists across sessions
- Invalid durations default to 25
- Duration cannot change while timer running

**Settings Panel**:
- All controls render correctly
- Success feedback displays on save
- Error messages display for invalid input
- Current values display correctly
- Responsive layout on mobile and desktop

**Backward Compatibility**:
- Existing components function unchanged
- Tasks persist correctly
- Links persist correctly
- Timer works with default duration
- Greeting works without custom name

### Integration Testing

Integration tests will verify:
- Settings changes immediately affect components
- Multiple settings can be changed in sequence
- Cross-tab synchronization works for settings
- Theme applies consistently across all components
- Storage errors handled gracefully

### Browser Compatibility Testing

Manual testing in:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

Verify:
- Theme switching works
- CSS variables supported
- Local Storage accessible
- Responsive layout correct
- Touch targets adequate (44x44px minimum)

### Accessibility Testing

Verify:
- Color contrast meets WCAG AA in both themes
- All controls keyboard accessible
- Focus indicators visible
- Labels associated with inputs
- Error messages announced to screen readers

## Implementation Notes

### Initialization Order

The application initialization must be updated to:

1. Instantiate StorageManager
2. Instantiate ThemeManager and apply saved theme BEFORE rendering components
3. Instantiate and initialize GreetingComponent (with storageManager)
4. Instantiate and initialize TimerComponent (with storageManager)
5. Instantiate and initialize TaskListComponent (unchanged)
6. Instantiate and initialize QuickLinksComponent (unchanged)
7. Instantiate and initialize SettingsComponent (with all dependencies)

**Critical**: Theme must be applied before components render to prevent flash of unstyled content (FOUC).

### Component Communication

SettingsComponent communicates with other components via direct method calls:

```javascript
// Example: Updating user name
settingsComponent._saveUserName(name) {
  // Validate and sanitize
  const sanitized = this._sanitizeHTML(name);
  
  // Save to storage
  this.storageManager.save('dashboard_user_name', sanitized);
  
  // Update greeting component
  this.greetingComponent.setUserName(sanitized);
  
  // Show feedback
  this._showSuccessFeedback('Name saved!');
}
```

### HTML Sanitization Implementation

```javascript
_sanitizeHTML(text) {
  // Create a temporary div element
  const temp = document.createElement('div');
  
  // Set as text content (automatically escapes HTML)
  temp.textContent = text;
  
  // Return the escaped text
  return temp.textContent;
}
```

Alternative approach using regex:
```javascript
_sanitizeHTML(text) {
  // Strip all HTML tags
  return text.replace(/<[^>]*>/g, '');
}
```

### CSS Organization

Add new styles to existing `styles.css` in this order:

1. Dark theme CSS variables (after existing `:root` block)
2. Settings component styles (after existing component styles)
3. Theme-specific component overrides (at end of file)
4. Responsive adjustments for settings panel

### Performance Considerations

**Theme Switching**:
- Use CSS custom properties for instant switching
- No JavaScript style manipulation needed
- Single DOM attribute change triggers CSS cascade

**Storage Operations**:
- Batch storage writes when possible
- Use existing StorageManager error handling
- Avoid redundant saves

**Component Updates**:
- Only update components when settings actually change
- Use direct method calls instead of events for simplicity
- Minimize DOM manipulation

### Accessibility Considerations

**Color Contrast**:
- Light theme: Already meets WCAG AA
- Dark theme: Ensure all text has 4.5:1 contrast ratio minimum
- Test with contrast checker tools

**Keyboard Navigation**:
- All settings controls must be keyboard accessible
- Logical tab order through settings panel
- Enter key submits forms
- Escape key closes modals (if added later)

**Screen Reader Support**:
- Associate labels with inputs using `for` attribute
- Use `aria-live` for success/error messages
- Provide descriptive button text
- Use semantic HTML elements

**Touch Targets**:
- Maintain 44x44px minimum for all interactive elements
- Adequate spacing between controls
- Large enough buttons for theme switcher

## Migration and Rollout

### Backward Compatibility

The enhancement is fully backward compatible:
- No breaking changes to existing components
- Existing Local Storage keys unchanged
- Default behavior matches current implementation
- Users without saved preferences see no difference

### Data Migration

No data migration needed:
- New storage keys are independent
- Existing tasks and links unaffected
- Missing preferences use sensible defaults

### Rollout Strategy

1. Deploy code with new features
2. Users automatically get default settings
3. Users can customize at their convenience
4. No user action required for basic functionality

### Future Enhancements

Potential future additions:
- Additional theme options (high contrast, custom colors)
- More timer presets (15, 30, 45, 60 minutes)
- Import/export settings
- Sync settings across devices (requires backend)
- Keyboard shortcuts for theme switching
- Auto theme based on system preference (`prefers-color-scheme`)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property-Based Testing Applicability

This feature has aspects suitable for property-based testing:
- **Input validation** (name length, duration range)
- **Data sanitization** (HTML injection prevention)
- **Persistence round-trips** (save/load cycles)
- **State transformations** (timer reset behavior)

However, many aspects are NOT suitable for PBT:
- **UI rendering** (theme application, CSS styles)
- **Visual appearance** (colors, layouts)
- **One-time setup** (component initialization)

The properties below focus on the logic-heavy aspects where PBT provides value.

### Property Reflection

After analyzing all acceptance criteria, I identified these potential properties:

**Round-Trip Properties** (Persistence):
- Theme save/load round-trip (1.5, 1.6, 5.1)
- Name save/load round-trip (2.2, 2.5, 5.2)
- Duration save/load round-trip (3.2, 3.5, 5.3)

**Validation Properties**:
- Name length validation (2.6)
- Duration range validation (3.6, 3.8)

**Transformation Properties**:
- Name sanitization (2.8)
- Greeting formatting (2.3)
- Timer initialization (3.3)
- Timer reset (3.4)
- Settings display (4.4)

**Error Handling Properties**:
- Corrupted data handling (5.6)

**Redundancy Analysis**:
- Properties 1.5, 1.6, and 5.1 can be combined into a single theme round-trip property
- Properties 2.2, 2.5, and 5.2 can be combined into a single name round-trip property
- Properties 3.2, 3.5, and 5.3 can be combined into a single duration round-trip property
- Properties 3.3 and 3.4 both test timer duration behavior and can be combined
- Property 4.4 is redundant with the round-trip properties (if save/load works, display will work)

**Final Property Set** (after removing redundancy):
1. Theme persistence round-trip
2. Name persistence round-trip
3. Duration persistence round-trip
4. Name length validation
5. Duration range validation
6. HTML sanitization
7. Greeting name formatting
8. Timer duration behavior (initialization and reset)
9. Corrupted data handling

### Property 1: Theme Persistence Round-Trip

*For any* valid theme value ('light' or 'dark'), saving the theme to Local Storage and then loading it should return the same theme value.

**Validates: Requirements 1.5, 1.6, 5.1**

### Property 2: Name Persistence Round-Trip

*For any* valid user name (0-50 characters), saving the name to Local Storage and then loading it should return the same name value.

**Validates: Requirements 2.2, 2.5, 5.2**

### Property 3: Duration Persistence Round-Trip

*For any* valid Pomodoro duration (1-120 minutes), saving the duration to Local Storage and then loading it should return the same duration value.

**Validates: Requirements 3.2, 3.5, 5.3**

### Property 4: Name Length Validation

*For any* string, validation should reject names exceeding 50 characters and accept names of 50 characters or fewer.

**Validates: Requirements 2.6**

### Property 5: Duration Range Validation

*For any* number, validation should reject durations outside the range 1-120 minutes and accept durations within that range.

**Validates: Requirements 3.6, 3.8**

### Property 6: HTML Sanitization

*For any* string containing HTML tags, the sanitized output should not contain executable HTML elements and should be safe to display.

**Validates: Requirements 2.8**

### Property 7: Greeting Name Formatting

*For any* non-empty user name, the greeting display should contain the time-based greeting followed by a comma, space, and the user name.

**Validates: Requirements 2.3**

### Property 8: Timer Duration Behavior

*For any* valid custom duration, the timer should initialize to that duration when created and return to that duration when reset.

**Validates: Requirements 3.3, 3.4**

### Property 9: Corrupted Data Handling

*For any* corrupted or invalid preference data in Local Storage, the system should gracefully revert to default values without crashing.

**Validates: Requirements 5.6**

### Testing Strategy

**Dual Testing Approach**:

**Unit Tests** will cover:
- Specific UI examples (theme switcher exists, settings panel renders)
- Edge cases (empty name, default duration, storage unavailable)
- Integration points (settings update components)
- Responsive layout verification
- Accessibility checks
- Regression tests for existing functionality

**Property-Based Tests** will cover:
- All 9 correctness properties listed above
- Minimum 100 iterations per property test
- Random input generation for comprehensive coverage
- Each test tagged with: **Feature: interactive-enhancements, Property {number}: {property_text}**

**Property Test Library**:
- Use **fast-check** for JavaScript property-based testing
- Generators for: strings (various lengths), numbers (various ranges), HTML strings, theme values
- Shrinking to find minimal failing examples

**Example Property Test Structure**:
```javascript
// Feature: interactive-enhancements, Property 2: Name Persistence Round-Trip
fc.assert(
  fc.property(
    fc.string({ maxLength: 50 }), // Generate random names up to 50 chars
    (name) => {
      // Save name
      storageManager.save('dashboard_user_name', name);
      
      // Load name
      const loaded = storageManager.load('dashboard_user_name');
      
      // Assert round-trip preserves value
      return loaded === name;
    }
  ),
  { numRuns: 100 }
);
```

**Coverage Goals**:
- Unit tests: 100% of UI rendering code
- Property tests: 100% of validation and persistence logic
- Integration tests: All component interactions
- Browser tests: All supported browsers

