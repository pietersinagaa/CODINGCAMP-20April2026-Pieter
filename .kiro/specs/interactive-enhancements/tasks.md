# Implementation Plan: Interactive Enhancements

## Overview

This implementation plan extends the existing To-Do List Life Dashboard with three user-customization capabilities: theme switching (light/dark mode), personalized greetings with custom user names, and configurable Pomodoro timer durations. The implementation follows a non-invasive integration approach, extending existing components rather than rewriting them, and adding new components (SettingsComponent and ThemeManager) to manage customization.

## Tasks

- [x] 1. Add dark theme CSS variables and theme-specific styles
  - Add dark theme CSS variables to styles.css under `[data-theme="dark"]` selector
  - Define dark mode colors for background, surface, border, and text
  - Add theme-specific component overrides for all components
  - Ensure WCAG AA color contrast compliance in both themes
  - _Requirements: 1.3, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 2. Implement ThemeManager class
  - [x] 2.1 Create ThemeManager class in js/app.js
    - Implement constructor(storageManager)
    - Implement init() to load and apply saved theme
    - Implement toggleTheme() to switch between light and dark
    - Implement setTheme(themeName) to set specific theme
    - Implement getCurrentTheme() to get current theme name
    - Implement _applyTheme(themeName) to update data-theme attribute on body
    - Implement _loadTheme() to retrieve theme from storage
    - Implement _saveTheme(themeName) to persist theme preference
    - Use storage key "dashboard_theme" with default value "light"
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 5.1, 5.4_
  
  - [ ]* 2.2 Write property test for theme persistence round-trip
    - **Property 1: Theme Persistence Round-Trip**
    - **Validates: Requirements 1.5, 1.6, 5.1**
    - Test that saving and loading theme returns the same value
    - Generate random theme values ('light' or 'dark')
    - Verify round-trip consistency

- [ ] 3. Extend GreetingComponent with custom name support
  - [x] 3.1 Extend GreetingComponent class
    - Add storageManager parameter to constructor
    - Implement setUserName(name) to update displayed name
    - Implement getUserName() to get current name
    - Implement _loadUserName() to retrieve name from storage
    - Implement _sanitizeHTML(text) to prevent HTML injection
    - Implement _updateGreetingDisplay() to format greeting with name
    - Use storage key "dashboard_user_name"
    - Update greeting format: "Good Afternoon, Alice" or "Good Afternoon"
    - Use textContent instead of innerHTML for user-provided names
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8, 5.2, 6.1_
  
  - [ ]* 3.2 Write property test for name persistence round-trip
    - **Property 2: Name Persistence Round-Trip**
    - **Validates: Requirements 2.2, 2.5, 5.2**
    - Test that saving and loading name returns the same value
    - Generate random names (0-50 characters)
    - Verify round-trip consistency
  
  - [ ]* 3.3 Write property test for name length validation
    - **Property 4: Name Length Validation**
    - **Validates: Requirements 2.6**
    - Test that validation rejects names exceeding 50 characters
    - Test that validation accepts names of 50 characters or fewer
    - Generate random strings of various lengths
  
  - [ ]* 3.4 Write property test for HTML sanitization
    - **Property 6: HTML Sanitization**
    - **Validates: Requirements 2.8**
    - Test that sanitized output contains no executable HTML elements
    - Generate random strings with HTML tags
    - Verify output is safe to display
  
  - [ ]* 3.5 Write property test for greeting name formatting
    - **Property 7: Greeting Name Formatting**
    - **Validates: Requirements 2.3**
    - Test that greeting contains time-based greeting + comma + space + name
    - Generate random non-empty names
    - Verify format consistency

- [ ] 4. Extend TimerComponent with configurable duration
  - [x] 4.1 Extend TimerComponent class
    - Add storageManager parameter to constructor
    - Add customDurationMinutes property to state
    - Implement setDuration(minutes) to update timer duration
    - Implement getDuration() to get current duration
    - Implement _loadDuration() to retrieve duration from storage
    - Implement _convertMinutesToSeconds(minutes) conversion utility
    - Implement _updateDurationDisplay() to show new duration
    - Use storage key "dashboard_pomodoro_duration" with default 25
    - Ensure duration can only change when timer is stopped
    - Reset timer to new duration when duration changes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3, 6.2_
  
  - [ ]* 4.2 Write property test for duration persistence round-trip
    - **Property 3: Duration Persistence Round-Trip**
    - **Validates: Requirements 3.2, 3.5, 5.3**
    - Test that saving and loading duration returns the same value
    - Generate random durations (1-120 minutes)
    - Verify round-trip consistency
  
  - [ ]* 4.3 Write property test for duration range validation
    - **Property 5: Duration Range Validation**
    - **Validates: Requirements 3.6, 3.8**
    - Test that validation rejects durations outside 1-120 range
    - Test that validation accepts durations within range
    - Generate random numbers of various ranges
  
  - [ ]* 4.4 Write property test for timer duration behavior
    - **Property 8: Timer Duration Behavior**
    - **Validates: Requirements 3.3, 3.4**
    - Test that timer initializes to custom duration
    - Test that timer returns to custom duration when reset
    - Generate random valid durations

- [ ] 5. Checkpoint - Verify extended components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement SettingsComponent
  - [x] 6.1 Create SettingsComponent class in js/app.js
    - Implement constructor(containerElement, storageManager, themeManager, greetingComponent, timerComponent)
    - Implement init() to create DOM structure and set up event listeners
    - Create DOM structure with theme switcher, name input, and duration input sections
    - Implement destroy() to clean up resources
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 6.2 Implement theme switcher controls
    - Implement _setupThemeSwitcher() to initialize theme toggle buttons
    - Add click handlers for light and dark theme buttons
    - Update visual indicator to show current theme
    - Call themeManager.setTheme() when theme button clicked
    - _Requirements: 1.1, 1.2, 1.8, 4.1_
  
  - [x] 6.3 Implement name customization controls
    - Implement _setupNameInput() to initialize name input and save button
    - Implement _saveUserName(name) to validate, sanitize, and save name
    - Implement _validateName(name) to check 50 character limit
    - Implement _sanitizeHTML(text) to prevent HTML injection
    - Add click handler for save name button
    - Call greetingComponent.setUserName() after saving
    - Show success feedback after save
    - Handle empty name to remove from greeting
    - Display inline error for invalid names
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.8, 4.1, 4.3, 4.5_
  
  - [x] 6.4 Implement duration customization controls
    - Implement _setupDurationInput() to initialize duration input and save button
    - Implement _savePomodoroD
uration(minutes) to validate and save duration
    - Implement _validateDuration(minutes) to check 1-120 range and integer
    - Add click handler for save duration button
    - Call timerComponent.setDuration() after saving
    - Show success feedback after save
    - Display inline error for invalid durations
    - _Requirements: 3.1, 3.2, 3.6, 3.8, 4.1, 4.3, 4.5_
  
  - [x] 6.5 Implement feedback and validation UI
    - Implement _showSuccessFeedback(message) to display save confirmation
    - Add error message display for name validation failures
    - Add error message display for duration validation failures
    - Clear errors on valid input
    - Display current values for name and duration
    - _Requirements: 4.4, 4.5_

- [x] 7. Add settings container to HTML
  - Add settings-container section to index.html
  - Place after task-list-container in DOM order
  - Add appropriate semantic HTML structure
  - _Requirements: 4.2, 6.6, 6.7_

- [x] 8. Add settings component styles to CSS
  - Add .settings-component styles to styles.css
  - Style theme switcher buttons with active state indicators
  - Style name and duration input fields
  - Style save buttons and success/error messages
  - Add dark theme overrides for settings component
  - Ensure responsive layout on mobile (<768px) and desktop (≥768px)
  - Ensure touch-friendly control sizes (min 44px)
  - _Requirements: 4.6, 4.7, 7.5_

- [ ] 9. Update application initialization
  - [x] 9.1 Modify DOMContentLoaded handler in js/app.js
    - Instantiate ThemeManager after StorageManager
    - Call themeManager.init() BEFORE rendering components (prevent FOUC)
    - Pass storageManager to GreetingComponent constructor
    - Pass storageManager to TimerComponent constructor
    - Instantiate SettingsComponent with all dependencies
    - Call settingsComponent.init() after all other components
    - Store component references for cross-component communication
    - _Requirements: 5.4, 5.7, 6.3, 6.4, 6.5_
  
  - [ ]* 9.2 Write unit tests for initialization order
    - Test that theme applies before components render
    - Test that all components receive correct dependencies
    - Test that settings component can communicate with other components
    - _Requirements: 5.7_

- [ ] 10. Implement error handling for settings
  - [x] 10.1 Add validation error handling
    - Display inline error for names exceeding 50 characters
    - Display inline error for durations outside 1-120 range
    - Display inline error for non-integer durations
    - Prevent saving until validation passes
    - Clear errors on valid input
    - _Requirements: 2.6, 3.6, 3.8_
  
  - [x] 10.2 Add storage error handling
    - Handle corrupted theme preference (default to 'light')
    - Handle corrupted user name (default to empty string)
    - Handle corrupted duration (default to 25)
    - Display warning if storage unavailable
    - Log warnings to console for debugging
    - _Requirements: 5.5, 5.6_
  
  - [x] 10.3 Add component integration error handling
    - Check for required component references on SettingsComponent init
    - Disable name customization if GreetingComponent unavailable
    - Disable duration customization if TimerComponent unavailable
    - Prevent duration changes while timer is running
    - Log warnings for missing components
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 10.4 Write property test for corrupted data handling
    - **Property 9: Corrupted Data Handling**
    - **Validates: Requirements 5.6**
    - Test that system gracefully reverts to defaults for corrupted data
    - Generate random invalid preference data
    - Verify no crashes and defaults are used

- [ ] 11. Checkpoint - Verify complete integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Test backward compatibility
  - [ ]* 12.1 Verify existing functionality unchanged
    - Test that GreetingComponent displays time, date, and greeting correctly
    - Test that TimerComponent start, stop, and reset work correctly
    - Test that TaskListComponent CRUD operations work correctly
    - Test that QuickLinksComponent operations work correctly
    - Test that tasks and links persist to Local Storage correctly
    - Test that cross-tab synchronization still works
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 12.2 Test performance requirements
    - Verify dashboard renders within 1 second
    - Verify theme switching is instant (no page reload)
    - Verify no external network requests for core functionality
    - _Requirements: 6.6_
  
  - [ ]* 12.3 Test browser compatibility
    - Test in Chrome (latest)
    - Test in Firefox (latest)
    - Test in Edge (latest)
    - Test in Safari (latest)
    - Verify CSS variables supported in all browsers
    - _Requirements: 6.7_

- [ ] 13. Test complete user workflows
  - [ ]* 13.1 Test theme switching workflow
    - Test toggling between light and dark themes
    - Test theme persists across page reloads
    - Test theme applies to all components consistently
    - Test invalid theme values default to light
    - Test visual indicator shows current theme
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ]* 13.2 Test name customization workflow
    - Test adding custom name to greeting
    - Test name appears in greeting correctly formatted
    - Test removing name from greeting (empty input)
    - Test name persists across page reloads
    - Test name validation (50 character limit)
    - Test HTML sanitization prevents injection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [ ]* 13.3 Test duration customization workflow
    - Test changing timer duration
    - Test timer initializes with custom duration
    - Test timer resets to custom duration
    - Test duration persists across page reloads
    - Test duration validation (1-120 range)
    - Test duration cannot change while timer running
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 13.4 Test settings panel usability
    - Test all controls render correctly
    - Test success feedback displays on save
    - Test error messages display for invalid input
    - Test current values display correctly
    - Test responsive layout on mobile and desktop
    - Test keyboard accessibility for all controls
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 13.5 Test accessibility requirements
    - Test color contrast meets WCAG AA in both themes
    - Test all controls keyboard accessible
    - Test focus indicators visible
    - Test labels associated with inputs
    - Test error messages announced to screen readers
    - Test touch targets adequate (44x44px minimum)
    - _Requirements: 7.7_

- [ ] 14. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation extends existing components rather than rewriting them
- Theme must be applied before components render to prevent flash of unstyled content (FOUC)
- All customization preferences stored in browser Local Storage
- Zero dependencies - pure vanilla JavaScript
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Integration tests verify cross-component communication
- Backward compatibility is critical - all existing functionality must remain unchanged
