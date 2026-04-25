// To-Do List Life Dashboard

/**
 * StorageManager - Centralized Local Storage management with error handling
 */
class StorageManager {
  constructor() {
    this.isAvailable = this._checkAvailability();
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available and functional
   * @private
   */
  _checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Save data to localStorage with JSON serialization
   * @param {string} key - Storage key
   * @param {*} data - Data to store (will be JSON serialized)
   * @throws {Error} When quota is exceeded or serialization fails
   */
  save(key, data) {
    // Check if storage is available
    if (!this.isAvailable) {
      console.warn('Storage unavailable. Data will not be persisted.');
      return;
    }

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded:', error);
        throw new Error('Storage limit reached. Please delete some items.');
      } else if (error instanceof TypeError) {
        console.error('Failed to serialize data:', error);
        throw new Error('Unable to save data. Invalid data format.');
      } else {
        console.error('Storage save error:', error);
        throw error;
      }
    }
  }

  /**
   * Load data from localStorage with JSON parsing and error handling
   * @param {string} key - Storage key
   * @returns {*} Parsed data or null if not found or corrupted
   */
  load(key) {
    // Check if storage is available
    if (!this.isAvailable) {
      console.warn('Storage unavailable. Returning null.');
      return null;
    }

    try {
      const serialized = localStorage.getItem(key);
      
      // Return null if key doesn't exist
      if (serialized === null) {
        return null;
      }
      
      return JSON.parse(serialized);
    } catch (error) {
      console.error(`Failed to load data for key "${key}":`, error);
      
      // Handle corrupted data by preserving it and returning null
      try {
        const corrupted = localStorage.getItem(key);
        if (corrupted) {
          const backupKey = `${key}_corrupted_backup`;
          localStorage.setItem(backupKey, corrupted);
          console.warn(`Corrupted data backed up to "${backupKey}"`);
          
          // Display user-friendly message
          this._showCorruptedDataMessage();
        }
      } catch (backupError) {
        console.error('Failed to backup corrupted data:', backupError);
      }
      
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    if (!this.isAvailable) {
      console.warn('Storage unavailable. Cannot remove key.');
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all items from localStorage
   * Primarily used for testing and reset functionality
   */
  clear() {
    if (!this.isAvailable) {
      console.warn('Storage unavailable. Cannot clear.');
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Display a user-friendly message for corrupted data
   * @private
   */
  _showCorruptedDataMessage() {
    // Only show once per session
    if (window._corruptedDataMessageShown) {
      return;
    }
    window._corruptedDataMessageShown = true;

    const banner = document.getElementById('storage-warning-banner');
    if (banner) {
      banner.textContent = 'Unable to load saved data. Starting fresh.';
      banner.style.display = 'block';
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        banner.style.display = 'none';
      }, 10000);
    }
  }
}

/**
 * ThemeManager - Centralize theme management, application, and persistence
 */
class ThemeManager {
  /**
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   */
  constructor(storageManager) {
    if (!storageManager) {
      throw new Error('StorageManager is required for ThemeManager');
    }
    
    this.storageManager = storageManager;
    this.storageKey = 'dashboard_theme';
    this.currentTheme = 'light'; // Default theme
  }

  /**
   * Initialize theme manager - load and apply saved theme
   */
  init() {
    // Load saved theme from storage
    const savedTheme = this._loadTheme();
    
    // Apply the loaded theme (or default if none saved)
    this._applyTheme(savedTheme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   * @param {string} themeName - Theme name ('light' or 'dark')
   */
  setTheme(themeName) {
    // Validate theme name
    if (themeName !== 'light' && themeName !== 'dark') {
      console.warn(`Invalid theme name: ${themeName}. Defaulting to 'light'.`);
      themeName = 'light';
    }
    
    // Apply the theme
    this._applyTheme(themeName);
    
    // Save to storage
    this._saveTheme(themeName);
  }

  /**
   * Get the current theme name
   * @returns {string} Current theme name ('light' or 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Apply theme to DOM by updating data-theme attribute on body
   * @param {string} themeName - Theme name to apply
   * @private
   */
  _applyTheme(themeName) {
    // Validate theme name
    if (themeName !== 'light' && themeName !== 'dark') {
      console.warn(`Invalid theme name: ${themeName}. Defaulting to 'light'.`);
      themeName = 'light';
    }
    
    // Update current theme
    this.currentTheme = themeName;
    
    // Apply to DOM via data-theme attribute on body
    document.body.setAttribute('data-theme', themeName);
  }

  /**
   * Load theme preference from storage
   * @returns {string} Saved theme name or 'light' if none saved
   * @private
   */
  _loadTheme() {
    const savedTheme = this.storageManager.load(this.storageKey);
    
    // Validate loaded theme
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Default to light if no valid theme found
    if (savedTheme !== null) {
      console.warn(`Invalid theme in storage: ${savedTheme}. Defaulting to 'light'.`);
    }
    
    return 'light';
  }

  /**
   * Save theme preference to storage
   * @param {string} themeName - Theme name to save
   * @private
   */
  _saveTheme(themeName) {
    try {
      this.storageManager.save(this.storageKey, themeName);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }
}

/**
 * GreetingComponent - Display current time, date, and time-appropriate greeting
 */
class GreetingComponent {
  /**
   * @param {HTMLElement} containerElement - DOM element to render the component into
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   */
  constructor(containerElement, storageManager) {
    if (!containerElement) {
      throw new Error('Container element not found for GreetingComponent');
    }
    
    this.container = containerElement;
    this.storageManager = storageManager || null;
    this.intervalId = null;
    this.timeElement = null;
    this.dateElement = null;
    this.greetingElement = null;
    this.userName = '';
    this.storageKey = 'dashboard_user_name';
  }

  /**
   * Initialize the component and start clock updates
   */
  init() {
    // Create DOM structure
    this.container.innerHTML = `
      <div class="greeting-component">
        <div class="time"></div>
        <div class="date"></div>
        <div class="greeting"></div>
      </div>
    `;

    // Cache DOM references
    this.timeElement = this.container.querySelector('.time');
    this.dateElement = this.container.querySelector('.date');
    this.greetingElement = this.container.querySelector('.greeting');

    // Load saved user name
    if (this.storageManager) {
      this._loadUserName();
    }

    // Initial update
    this._updateTime();

    // Update every second
    this.intervalId = setInterval(() => this._updateTime(), 1000);
  }

  /**
   * Update the time, date, and greeting display
   * @private
   */
  _updateTime() {
    const now = new Date();
    
    // Update time display
    this.timeElement.textContent = this._formatTime(now);
    
    // Update date display
    this.dateElement.textContent = this._formatDate(now);
    
    // Update greeting with name
    this._updateGreetingDisplay();
  }

  /**
   * Get time-appropriate greeting based on hour
   * @param {number} hour - Hour in 24-hour format (0-23)
   * @returns {string} Greeting message
   * @private
   */
  _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good Evening';
    } else {
      // 21-4 (9 PM to 4 AM)
      return 'Good Night';
    }
  }

  /**
   * Update greeting display with time-based greeting and optional user name
   * @private
   */
  _updateGreetingDisplay() {
    const now = new Date();
    const hour = now.getHours();
    const baseGreeting = this._getGreeting(hour);
    
    // Format greeting with name if available
    if (this.userName && this.userName.trim() !== '') {
      // Use textContent for security (prevents HTML injection)
      this.greetingElement.textContent = `${baseGreeting}, ${this.userName}`;
    } else {
      this.greetingElement.textContent = baseGreeting;
    }
  }

  /**
   * Set custom user name for personalized greeting
   * @param {string} name - User name to display
   */
  setUserName(name) {
    // Sanitize the name
    const sanitizedName = this._sanitizeHTML(name);
    
    // Update internal state
    this.userName = sanitizedName;
    
    // Save to storage if available
    if (this.storageManager) {
      try {
        if (sanitizedName && sanitizedName.trim() !== '') {
          this.storageManager.save(this.storageKey, sanitizedName);
        } else {
          // Remove from storage if empty
          this.storageManager.remove(this.storageKey);
        }
      } catch (error) {
        console.error('Failed to save user name:', error);
      }
    }
    
    // Update display immediately
    this._updateGreetingDisplay();
  }

  /**
   * Get current user name
   * @returns {string} Current user name
   */
  getUserName() {
    return this.userName;
  }

  /**
   * Load user name from storage
   * @private
   */
  _loadUserName() {
    if (!this.storageManager) {
      return;
    }
    
    try {
      const savedName = this.storageManager.load(this.storageKey);
      
      if (savedName && typeof savedName === 'string') {
        this.userName = this._sanitizeHTML(savedName);
      } else {
        // Handle corrupted data
        if (savedName !== null) {
          console.warn(`Invalid user name in storage: ${savedName}. Defaulting to empty string.`);
        }
        this.userName = '';
      }
    } catch (error) {
      console.error('Failed to load user name:', error);
      this.userName = '';
    }
  }

  /**
   * Sanitize HTML to prevent injection attacks
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   * @private
   */
  _sanitizeHTML(text) {
    if (!text) {
      return '';
    }
    
    // Create a temporary div element
    const temp = document.createElement('div');
    
    // Set as text content (automatically escapes HTML)
    temp.textContent = text;
    
    // Return the escaped text
    return temp.textContent;
  }

  /**
   * Format time in 12-hour format with AM/PM
   * @param {Date} date - Date object to format
   * @returns {string} Formatted time string (e.g., "3:45 PM")
   * @private
   */
  _formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Pad minutes and seconds with leading zeros
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  }

  /**
   * Format date in readable format
   * @param {Date} date - Date object to format
   * @returns {string} Formatted date string (e.g., "Monday, January 15, 2024")
   * @private
   */
  _formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Clean up intervals and resources
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
/**
 * TimerComponent - 25-minute focus timer with start/stop/reset controls
 */
class TimerComponent {
  /**
   * @param {HTMLElement} containerElement - DOM element to render the component into
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   */
  constructor(containerElement, storageManager) {
    if (!containerElement) {
      throw new Error('Container element not found for TimerComponent');
    }
    
    this.container = containerElement;
    this.storageManager = storageManager || null;
    this.storageKey = 'dashboard_pomodoro_duration';
    this.customDurationMinutes = 25; // Default 25 minutes
    this.duration = 1500; // 25 minutes in seconds
    this.remaining = 1500;
    this.isRunning = false;
    this.intervalId = null;
    
    // DOM element references
    this.displayElement = null;
    this.startButton = null;
    this.stopButton = null;
    this.resetButton = null;
    this.notificationElement = null;
  }

  /**
   * Initialize the component and set up DOM and event listeners
   */
  init() {
    // Load saved duration from storage
    if (this.storageManager) {
      this._loadDuration();
    }

    // Create DOM structure
    this.container.innerHTML = `
      <div class="timer-component">
        <div class="timer-display">25:00</div>
        <div class="timer-controls">
          <button class="btn-start">Start</button>
          <button class="btn-stop">Stop</button>
          <button class="btn-reset">Reset</button>
        </div>
        <div class="timer-notification" style="display:none">Time's up!</div>
      </div>
    `;

    // Cache DOM references
    this.displayElement = this.container.querySelector('.timer-display');
    this.startButton = this.container.querySelector('.btn-start');
    this.stopButton = this.container.querySelector('.btn-stop');
    this.resetButton = this.container.querySelector('.btn-reset');
    this.notificationElement = this.container.querySelector('.timer-notification');

    // Set up event listeners
    this.startButton.addEventListener('click', () => this._start());
    this.stopButton.addEventListener('click', () => this._stop());
    this.resetButton.addEventListener('click', () => this._reset());

    // Initial display update
    this._updateDurationDisplay();
  }

  /**
   * Start the countdown timer
   * @private
   */
  _start() {
    if (this.isRunning) {
      return; // Already running
    }

    this.isRunning = true;
    this.notificationElement.style.display = 'none'; // Hide notification if visible

    // Start countdown interval
    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  /**
   * Stop/pause the countdown timer
   * @private
   */
  _stop() {
    if (!this.isRunning) {
      return; // Already stopped
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset the timer to 25 minutes
   * @private
   */
  _reset() {
    // Stop the timer if running
    this._stop();

    // Reset state
    this.remaining = this.duration;
    this.notificationElement.style.display = 'none';

    // Update display
    this.displayElement.textContent = this._formatTime(this.remaining);
  }

  /**
   * Decrement timer by 1 second and update display
   * @private
   */
  _tick() {
    if (this.remaining > 0) {
      this.remaining--;
      this.displayElement.textContent = this._formatTime(this.remaining);
    } else {
      // Timer reached zero
      this._stop();
      this._showNotification();
    }
  }

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time string (e.g., "25:00", "03:45")
   * @private
   */
  _formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
  }

  /**
   * Display completion notification when timer reaches zero
   * @private
   */
  _showNotification() {
    this.notificationElement.style.display = 'block';
  }

  /**
   * Set custom timer duration (only when timer is stopped)
   * @param {number} minutes - Duration in minutes (1-120)
   */
  setDuration(minutes) {
    // Validate: timer must be stopped
    if (this.isRunning) {
      console.warn('Cannot change duration while timer is running');
      return false;
    }

    // Validate: minutes must be a number between 1 and 120
    if (typeof minutes !== 'number' || minutes < 1 || minutes > 120) {
      console.warn('Duration must be between 1 and 120 minutes');
      return false;
    }

    // Update custom duration in minutes
    this.customDurationMinutes = minutes;

    // Convert to seconds and update duration
    this.duration = this._convertMinutesToSeconds(minutes);

    // Reset timer to new duration
    this.remaining = this.duration;
    this.notificationElement.style.display = 'none';

    // Update display
    this._updateDurationDisplay();

    // Save to storage if available
    if (this.storageManager) {
      try {
        this.storageManager.save(this.storageKey, minutes);
      } catch (error) {
        console.error('Failed to save timer duration:', error);
      }
    }

    return true;
  }

  /**
   * Get current timer duration in minutes
   * @returns {number} Current duration in minutes
   */
  getDuration() {
    return this.customDurationMinutes;
  }

  /**
   * Load duration from storage
   * @private
   */
  _loadDuration() {
    if (!this.storageManager) {
      return;
    }

    try {
      const savedDuration = this.storageManager.load(this.storageKey);

      // Validate loaded duration
      if (typeof savedDuration === 'number' && savedDuration >= 1 && savedDuration <= 120) {
        this.customDurationMinutes = savedDuration;
        this.duration = this._convertMinutesToSeconds(savedDuration);
        this.remaining = this.duration;
      } else {
        // Use default if invalid
        if (savedDuration !== null) {
          console.warn(`Invalid duration in storage: ${savedDuration}. Using default 25 minutes.`);
        }
        this.customDurationMinutes = 25;
        this.duration = 1500;
        this.remaining = 1500;
      }
    } catch (error) {
      console.error('Failed to load timer duration:', error);
      // Use defaults on error
      this.customDurationMinutes = 25;
      this.duration = 1500;
      this.remaining = 1500;
    }
  }

  /**
   * Convert minutes to seconds
   * @param {number} minutes - Minutes to convert
   * @returns {number} Seconds
   * @private
   */
  _convertMinutesToSeconds(minutes) {
    return minutes * 60;
  }

  /**
   * Update duration display with current remaining time
   * @private
   */
  _updateDurationDisplay() {
    if (this.displayElement) {
      this.displayElement.textContent = this._formatTime(this.remaining);
    }
  }

  /**
   * Clean up intervals and resources
   */
  destroy() {
    this._stop();
  }
}

/**
 * TaskListComponent - Manage task creation, editing, completion, and deletion with persistence
 */
class TaskListComponent {
  /**
   * @param {HTMLElement} containerElement - DOM element to render the component into
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   */
  constructor(containerElement, storageManager) {
    if (!containerElement) {
      throw new Error('Container element not found for TaskListComponent');
    }
    
    if (!storageManager) {
      throw new Error('StorageManager is required for TaskListComponent');
    }
    
    this.container = containerElement;
    this.storageManager = storageManager;
    this.tasks = [];
    this.storageKey = 'dashboard_tasks';
    
    // DOM element references
    this.taskInput = null;
    this.addButton = null;
    this.taskListElement = null;
  }

  /**
   * Initialize the component, create DOM structure, load tasks, and set up event listeners
   */
  init() {
    // Create DOM structure
    this.container.innerHTML = `
      <div class="task-list-component">
        <div class="task-input-container">
          <input type="text" class="task-input" placeholder="Add a new task...">
          <button class="btn-add-task">Add</button>
        </div>
        <div class="task-error-message" style="display: none;"></div>
        <ul class="task-list">
        </ul>
      </div>
    `;

    // Cache DOM references
    this.taskInput = this.container.querySelector('.task-input');
    this.addButton = this.container.querySelector('.btn-add-task');
    this.taskListElement = this.container.querySelector('.task-list');
    this.errorElement = this.container.querySelector('.task-error-message');

    // Load tasks from storage
    this._loadTasks();

    // Set up event listeners for add task
    this.addButton.addEventListener('click', () => {
      const text = this.taskInput.value;
      
      try {
        this._addTask(text);
        this.taskInput.value = ''; // Clear input on success
        this._clearError(); // Clear error on success
        this._renderTasks();
      } catch (error) {
        this._showError(error.message);
      }
    });

    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = this.taskInput.value;
        
        try {
          this._addTask(text);
          this.taskInput.value = ''; // Clear input on success
          this._clearError(); // Clear error on success
          this._renderTasks();
        } catch (error) {
          this._showError(error.message);
        }
      }
    });

    // Clear error on input
    this.taskInput.addEventListener('input', () => {
      if (this.taskInput.value.trim() !== '') {
        this._clearError();
      }
    });

    // Initial render
    this._renderTasks();
  }

  /**
   * Load tasks from storage
   * @private
   */
  _loadTasks() {
    const loadedTasks = this.storageManager.load(this.storageKey);
    
    if (loadedTasks && Array.isArray(loadedTasks)) {
      this.tasks = loadedTasks;
    } else {
      // Initialize with empty array if no tasks found
      this.tasks = [];
    }
  }

  /**
   * Save tasks to storage
   * @private
   */
  _saveTasks() {
    try {
      this.storageManager.save(this.storageKey, this.tasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      // Display user-friendly error message
      alert(error.message || 'Failed to save tasks. Please try again.');
    }
  }

  /**
   * Add a new task with validation
   * @param {string} text - Task text
   * @private
   */
  _addTask(text) {
    // Validate: trim whitespace
    const trimmedText = text.trim();
    
    // Validate: non-empty
    if (trimmedText === '') {
      throw new Error('Task cannot be empty');
    }
    
    // Validate: max 500 characters
    if (trimmedText.length > 500) {
      throw new Error('Task text cannot exceed 500 characters');
    }
    
    // Create new task
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };
    
    // Add to tasks array
    this.tasks.push(newTask);
    
    // Persist to storage
    this._saveTasks();
    
    return newTask;
  }

  /**
   * Edit an existing task with validation
   * @param {string} id - Task ID
   * @param {string} newText - New task text
   * @private
   */
  _editTask(id, newText) {
    // Validate: trim whitespace
    const trimmedText = newText.trim();
    
    // Validate: non-empty
    if (trimmedText === '') {
      throw new Error('Task cannot be empty');
    }
    
    // Validate: max 500 characters
    if (trimmedText.length > 500) {
      throw new Error('Task text cannot exceed 500 characters');
    }
    
    // Find task by ID
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Update task text
    task.text = trimmedText;
    
    // Persist to storage
    this._saveTasks();
    
    return task;
  }

  /**
   * Toggle task completion status
   * @param {string} id - Task ID
   * @private
   */
  _toggleComplete(id) {
    // Find task by ID
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Toggle completion status
    task.completed = !task.completed;
    
    // Persist to storage
    this._saveTasks();
    
    return task;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @private
   */
  _deleteTask(id) {
    // Find task index
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // Remove task from array
    this.tasks.splice(taskIndex, 1);
    
    // Persist to storage
    this._saveTasks();
  }

  /**
   * Show inline error message
   * @param {string} message - Error message to display
   * @private
   */
  _showError(message) {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
    }
  }

  /**
   * Clear inline error message
   * @private
   */
  _clearError() {
    if (this.errorElement) {
      this.errorElement.textContent = '';
      this.errorElement.style.display = 'none';
    }
  }

  /**
   * Render all tasks in creation order with visual states
   * @private
   */
  _renderTasks() {
    // Clear existing task list
    this.taskListElement.innerHTML = '';
    
    // Sort tasks by creation order (createdAt ascending)
    const sortedTasks = [...this.tasks].sort((a, b) => a.createdAt - b.createdAt);
    
    // Render each task
    sortedTasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.dataset.id = task.id;
      
      // Apply completed class for visual distinction
      if (task.completed) {
        taskItem.classList.add('completed');
      }
      
      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      
      // Create task text span
      const taskText = document.createElement('span');
      taskText.className = 'task-text';
      taskText.textContent = task.text;
      
      // Apply visual styles for completed tasks
      if (task.completed) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
      }
      
      // Create edit button
      const editButton = document.createElement('button');
      editButton.className = 'btn-edit';
      editButton.textContent = 'Edit';
      
      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete';
      deleteButton.textContent = 'Delete';
      
      // Assemble task item
      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskText);
      taskItem.appendChild(editButton);
      taskItem.appendChild(deleteButton);
      
      // Add event listeners
      checkbox.addEventListener('change', () => {
        try {
          this._toggleComplete(task.id);
          this._renderTasks();
        } catch (error) {
          alert(error.message);
        }
      });
      
      editButton.addEventListener('click', () => {
        const newText = prompt('Edit task:', task.text);
        
        if (newText !== null) { // User didn't cancel
          try {
            this._editTask(task.id, newText);
            this._renderTasks();
          } catch (error) {
            alert(error.message);
          }
        }
      });
      
      deleteButton.addEventListener('click', () => {
        if (confirm('Delete this task?')) {
          try {
            this._deleteTask(task.id);
            this._renderTasks();
          } catch (error) {
            alert(error.message);
          }
        }
      });
      
      // Add to task list
      this.taskListElement.appendChild(taskItem);
    });
  }

  /**
   * Reload tasks from storage and re-render
   * Used for cross-tab synchronization
   */
  reload() {
    this._loadTasks();
    this._renderTasks();
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up event listeners if needed
    this.taskInput = null;
    this.addButton = null;
    this.taskListElement = null;
  }
}

/**
 * QuickLinksComponent - Manage website shortcuts with URL validation and persistence
 */
class QuickLinksComponent {
  /**
   * @param {HTMLElement} containerElement - DOM element to render the component into
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   */
  constructor(containerElement, storageManager) {
    if (!containerElement) {
      throw new Error('Container element not found for QuickLinksComponent');
    }
    
    if (!storageManager) {
      throw new Error('StorageManager is required for QuickLinksComponent');
    }
    
    this.container = containerElement;
    this.storageManager = storageManager;
    this.links = [];
    this.storageKey = 'dashboard_links';
    
    // DOM element references
    this.nameInput = null;
    this.urlInput = null;
    this.addButton = null;
    this.linksContainer = null;
  }

  /**
   * Initialize the component, create DOM structure, load links, and set up event listeners
   */
  init() {
    // Create DOM structure
    this.container.innerHTML = `
      <div class="quick-links-component">
        <div class="link-input-container">
          <input type="text" class="link-name-input" placeholder="Name">
          <input type="url" class="link-url-input" placeholder="URL">
          <button class="btn-add-link">Add</button>
        </div>
        <div class="link-error-message" style="display: none;"></div>
        <div class="links-container">
        </div>
      </div>
    `;

    // Cache DOM references
    this.nameInput = this.container.querySelector('.link-name-input');
    this.urlInput = this.container.querySelector('.link-url-input');
    this.addButton = this.container.querySelector('.btn-add-link');
    this.linksContainer = this.container.querySelector('.links-container');
    this.errorElement = this.container.querySelector('.link-error-message');

    // Load links from storage
    this._loadLinks();

    // Set up event listeners for add link
    this.addButton.addEventListener('click', () => {
      const name = this.nameInput.value;
      const url = this.urlInput.value;
      
      try {
        this._addLink(name, url);
        this.nameInput.value = ''; // Clear inputs on success
        this.urlInput.value = '';
        this._clearError(); // Clear error on success
        this._renderLinks();
      } catch (error) {
        this._showError(error.message);
      }
    });

    // Allow Enter key to add link
    this.urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const name = this.nameInput.value;
        const url = this.urlInput.value;
        
        try {
          this._addLink(name, url);
          this.nameInput.value = ''; // Clear inputs on success
          this.urlInput.value = '';
          this._clearError(); // Clear error on success
          this._renderLinks();
        } catch (error) {
          this._showError(error.message);
        }
      }
    });

    // Clear error on input
    this.urlInput.addEventListener('input', () => {
      const url = this.urlInput.value.trim();
      if (url !== '' && this._validateURL(url)) {
        this._clearError();
      }
    });

    this.nameInput.addEventListener('input', () => {
      if (this.nameInput.value.trim() !== '') {
        this._clearError();
      }
    });

    // Initial render
    this._renderLinks();
  }

  /**
   * Load links from storage
   * @private
   */
  _loadLinks() {
    const loadedLinks = this.storageManager.load(this.storageKey);
    
    if (loadedLinks && Array.isArray(loadedLinks)) {
      this.links = loadedLinks;
    } else {
      // Initialize with empty array if no links found
      this.links = [];
    }
  }

  /**
   * Save links to storage
   * @private
   */
  _saveLinks() {
    try {
      this.storageManager.save(this.storageKey, this.links);
    } catch (error) {
      console.error('Failed to save links:', error);
      // Display user-friendly error message
      alert(error.message || 'Failed to save links. Please try again.');
    }
  }

  /**
   * Validate URL format (must start with http://, https://, or www.)
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid, false otherwise
   * @private
   */
  _validateURL(url) {
    // Regex pattern: must start with http://, https://, or www.
    const urlPattern = /^(https?:\/\/)|(www\.)/i;
    return urlPattern.test(url);
  }

  /**
   * Add a new quick link with validation
   * @param {string} name - Display name for the link
   * @param {string} url - URL for the link
   * @private
   */
  _addLink(name, url) {
    // Validate: trim whitespace
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    
    // Validate: non-empty name
    if (trimmedName === '') {
      throw new Error('Link name cannot be empty');
    }
    
    // Validate: max 50 characters for name
    if (trimmedName.length > 50) {
      throw new Error('Link name cannot exceed 50 characters');
    }
    
    // Validate: non-empty URL
    if (trimmedUrl === '') {
      throw new Error('URL cannot be empty');
    }
    
    // Validate: URL format
    if (!this._validateURL(trimmedUrl)) {
      throw new Error('Please enter a valid URL (http://, https://, or www.)');
    }
    
    // Create new link
    const newLink = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      name: trimmedName,
      url: trimmedUrl,
      createdAt: Date.now()
    };
    
    // Add to links array
    this.links.push(newLink);
    
    // Persist to storage
    this._saveLinks();
    
    return newLink;
  }

  /**
   * Delete a quick link
   * @param {string} id - Link ID
   * @private
   */
  _deleteLink(id) {
    // Find link index
    const linkIndex = this.links.findIndex(l => l.id === id);
    
    if (linkIndex === -1) {
      throw new Error('Link not found');
    }
    
    // Remove link from array
    this.links.splice(linkIndex, 1);
    
    // Persist to storage
    this._saveLinks();
  }

  /**
   * Open a URL in a new browser tab
   * @param {string} url - URL to open
   * @private
   */
  _openLink(url) {
    window.open(url, '_blank');
  }

  /**
   * Show inline error message
   * @param {string} message - Error message to display
   * @private
   */
  _showError(message) {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
    }
  }

  /**
   * Clear inline error message
   * @private
   */
  _clearError() {
    if (this.errorElement) {
      this.errorElement.textContent = '';
      this.errorElement.style.display = 'none';
    }
  }

  /**
   * Render all quick links as clickable buttons
   * @private
   */
  _renderLinks() {
    // Clear existing links
    this.linksContainer.innerHTML = '';
    
    // Sort links by creation order (createdAt ascending)
    const sortedLinks = [...this.links].sort((a, b) => a.createdAt - b.createdAt);
    
    // Render each link
    sortedLinks.forEach(link => {
      const linkButton = document.createElement('button');
      linkButton.className = 'quick-link-btn';
      linkButton.dataset.id = link.id;
      linkButton.dataset.url = link.url;
      
      // Create link name text
      const linkName = document.createTextNode(link.name);
      linkButton.appendChild(linkName);
      
      // Create delete button (×)
      const deleteSpan = document.createElement('span');
      deleteSpan.className = 'btn-delete-link';
      deleteSpan.textContent = '×';
      linkButton.appendChild(deleteSpan);
      
      // Add event listener for opening link
      linkButton.addEventListener('click', (e) => {
        // Check if delete button was clicked
        if (e.target.classList.contains('btn-delete-link')) {
          // Delete link
          if (confirm(`Delete link "${link.name}"?`)) {
            try {
              this._deleteLink(link.id);
              this._renderLinks();
            } catch (error) {
              alert(error.message);
            }
          }
        } else {
          // Open link in new tab
          this._openLink(link.url);
        }
      });
      
      // Add to links container
      this.linksContainer.appendChild(linkButton);
    });
  }

  /**
   * Reload links from storage and re-render
   * Used for cross-tab synchronization
   */
  reload() {
    this._loadLinks();
    this._renderLinks();
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up event listeners if needed
    this.nameInput = null;
    this.urlInput = null;
    this.addButton = null;
    this.linksContainer = null;
  }
}

/**
 * SettingsComponent - Unified interface for all customization controls
 */
class SettingsComponent {
  /**
   * @param {HTMLElement} containerElement - DOM element to render the component into
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   * @param {ThemeManager} themeManager - Theme manager instance for theme switching
   * @param {GreetingComponent} greetingComponent - Greeting component instance for name updates
   * @param {TimerComponent} timerComponent - Timer component instance for duration updates
   */
  constructor(containerElement, storageManager, themeManager, greetingComponent, timerComponent) {
    if (!containerElement) {
      throw new Error('Container element not found for SettingsComponent');
    }
    
    this.container = containerElement;
    this.storageManager = storageManager;
    this.themeManager = themeManager;
    this.greetingComponent = greetingComponent;
    this.timerComponent = timerComponent;
    
    // DOM element references
    this.themeLightButton = null;
    this.themeDarkButton = null;
    this.currentThemeSpan = null;
    this.userNameInput = null;
    this.saveNameButton = null;
    this.nameErrorElement = null;
    this.durationInput = null;
    this.saveDurationButton = null;
    this.durationErrorElement = null;
    this.successMessageElement = null;
  }

  /**
   * Initialize the component and create DOM structure
   */
  init() {
    // Check for required component references
    this._checkComponentReferences();

    // Create DOM structure
    this.container.innerHTML = `
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
        <div class="settings-section" id="name-section">
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
        <div class="settings-section" id="duration-section">
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
    `;

    // Cache DOM references
    this.themeLightButton = this.container.querySelector('.theme-btn-light');
    this.themeDarkButton = this.container.querySelector('.theme-btn-dark');
    this.currentThemeSpan = this.container.querySelector('.current-theme');
    this.userNameInput = this.container.querySelector('#user-name-input');
    this.saveNameButton = this.container.querySelector('.btn-save-name');
    this.nameErrorElement = this.container.querySelector('.name-error-message');
    this.durationInput = this.container.querySelector('#duration-input');
    this.saveDurationButton = this.container.querySelector('.btn-save-duration');
    this.durationErrorElement = this.container.querySelector('.duration-error-message');
    this.successMessageElement = this.container.querySelector('.settings-success-message');

    // Set up event listeners
    this._setupThemeSwitcher();
    this._setupNameInput();
    this._setupDurationInput();
  }

  /**
   * Check for required component references and log warnings for missing components
   * @private
   */
  _checkComponentReferences() {
    // Check ThemeManager
    if (!this.themeManager) {
      console.warn('SettingsComponent: ThemeManager not available. Theme switching will be disabled.');
    }

    // Check GreetingComponent
    if (!this.greetingComponent) {
      console.warn('SettingsComponent: GreetingComponent not available. Name customization will be disabled.');
    }

    // Check TimerComponent
    if (!this.timerComponent) {
      console.warn('SettingsComponent: TimerComponent not available. Duration customization will be disabled.');
    }

    // Check StorageManager
    if (!this.storageManager) {
      console.warn('SettingsComponent: StorageManager not available. Settings may not persist.');
    }
  }

  /**
   * Set up theme switcher controls
   * @private
   */
  _setupThemeSwitcher() {
    if (!this.themeManager) {
      console.warn('ThemeManager not available. Theme switcher disabled.');
      return;
    }

    // Get current theme and update visual indicator
    const currentTheme = this.themeManager.getCurrentTheme();
    this._updateThemeIndicator(currentTheme);

    // Add click handlers for theme buttons
    this.themeLightButton.addEventListener('click', () => {
      this.themeManager.setTheme('light');
      this._updateThemeIndicator('light');
    });

    this.themeDarkButton.addEventListener('click', () => {
      this.themeManager.setTheme('dark');
      this._updateThemeIndicator('dark');
    });
  }

  /**
   * Update visual indicator to show current theme
   * @param {string} themeName - Current theme name ('light' or 'dark')
   * @private
   */
  _updateThemeIndicator(themeName) {
    // Update text indicator
    if (this.currentThemeSpan) {
      this.currentThemeSpan.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }

    // Update active state styling on buttons
    if (themeName === 'light') {
      this.themeLightButton.classList.add('active');
      this.themeDarkButton.classList.remove('active');
    } else {
      this.themeDarkButton.classList.add('active');
      this.themeLightButton.classList.remove('active');
    }
  }

  /**
   * Set up name input controls
   * @private
   */
  _setupNameInput() {
    if (!this.greetingComponent) {
      console.warn('GreetingComponent not available. Name customization disabled.');
      // Disable name customization controls
      this._disableNameCustomization();
      return;
    }

    // Load current name and display it
    const currentName = this.greetingComponent.getUserName();
    if (currentName) {
      this.userNameInput.value = currentName;
    }

    // Add click handler for save name button
    this.saveNameButton.addEventListener('click', () => {
      const name = this.userNameInput.value;
      this._saveUserName(name);
    });

    // Allow Enter key to save name
    this.userNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const name = this.userNameInput.value;
        this._saveUserName(name);
      }
    });

    // Clear error on input (when user provides valid input)
    this.userNameInput.addEventListener('input', () => {
      const name = this.userNameInput.value;
      // Clear error if input is now valid
      if (this._validateName(name)) {
        this._clearNameError();
      }
    });
  }

  /**
   * Disable name customization controls when GreetingComponent is unavailable
   * @private
   */
  _disableNameCustomization() {
    if (this.userNameInput) {
      this.userNameInput.disabled = true;
      this.userNameInput.placeholder = 'Name customization unavailable';
    }
    if (this.saveNameButton) {
      this.saveNameButton.disabled = true;
    }
    // Show warning message
    if (this.nameErrorElement) {
      this.nameErrorElement.textContent = 'Name customization is unavailable (GreetingComponent not found)';
      this.nameErrorElement.style.display = 'block';
      this.nameErrorElement.style.color = '#FF9500'; // Warning color
    }
  }

  /**
   * Save user name with validation and sanitization
   * @param {string} name - User name to save
   * @private
   */
  _saveUserName(name) {
    // Validate name FIRST before any processing
    if (!this._validateName(name)) {
      this._showNameError('Name cannot exceed 50 characters');
      return; // Prevent saving
    }

    // Sanitize HTML
    const sanitizedName = this._sanitizeHTML(name);

    // Save to greeting component (which handles storage)
    this.greetingComponent.setUserName(sanitizedName);

    // Show success feedback
    if (sanitizedName && sanitizedName.trim() !== '') {
      this._showSuccessFeedback('Name saved!');
    } else {
      this._showSuccessFeedback('Name removed from greeting');
    }

    // Clear error on successful save
    this._clearNameError();
  }

  /**
   * Validate user name (max 50 characters)
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid, false otherwise
   * @private
   */
  _validateName(name) {
    // Empty names are valid (removes name from greeting)
    if (!name || name.trim() === '') {
      return true;
    }

    // Check 50 character limit
    return name.length <= 50;
  }

  /**
   * Sanitize HTML to prevent injection attacks
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   * @private
   */
  _sanitizeHTML(text) {
    if (!text) {
      return '';
    }
    
    // Create a temporary div element
    const temp = document.createElement('div');
    
    // Set as text content (automatically escapes HTML)
    temp.textContent = text;
    
    // Return the escaped text
    return temp.textContent;
  }

  /**
   * Show success feedback message
   * @param {string} message - Success message to display
   * @private
   */
  _showSuccessFeedback(message) {
    if (this.successMessageElement) {
      this.successMessageElement.textContent = message;
      this.successMessageElement.style.display = 'block';
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.successMessageElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Show inline error message for name validation
   * @param {string} message - Error message to display
   * @private
   */
  _showNameError(message) {
    if (this.nameErrorElement) {
      this.nameErrorElement.textContent = message;
      this.nameErrorElement.style.display = 'block';
    }
  }

  /**
   * Clear inline error message for name validation
   * @private
   */
  _clearNameError() {
    if (this.nameErrorElement) {
      this.nameErrorElement.textContent = '';
      this.nameErrorElement.style.display = 'none';
    }
  }

  /**
   * Set up duration input controls
   * @private
   */
  _setupDurationInput() {
    if (!this.timerComponent) {
      console.warn('TimerComponent not available. Duration customization disabled.');
      // Disable duration customization controls
      this._disableDurationCustomization();
      return;
    }

    // Load current duration and display it
    const currentDuration = this.timerComponent.getDuration();
    if (currentDuration) {
      this.durationInput.value = currentDuration;
    }

    // Add click handler for save duration button
    this.saveDurationButton.addEventListener('click', () => {
      const minutes = parseInt(this.durationInput.value, 10);
      this._savePomodoroDuration(minutes);
    });

    // Allow Enter key to save duration
    this.durationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const minutes = parseInt(this.durationInput.value, 10);
        this._savePomodoroDuration(minutes);
      }
    });

    // Clear error on input (when user provides valid input)
    this.durationInput.addEventListener('input', () => {
      const minutes = parseInt(this.durationInput.value, 10);
      // Clear error if input is now valid
      if (this._validateDuration(minutes)) {
        this._clearDurationError();
      }
    });
  }

  /**
   * Disable duration customization controls when TimerComponent is unavailable
   * @private
   */
  _disableDurationCustomization() {
    if (this.durationInput) {
      this.durationInput.disabled = true;
      this.durationInput.placeholder = 'Duration customization unavailable';
    }
    if (this.saveDurationButton) {
      this.saveDurationButton.disabled = true;
    }
    // Show warning message
    if (this.durationErrorElement) {
      this.durationErrorElement.textContent = 'Duration customization is unavailable (TimerComponent not found)';
      this.durationErrorElement.style.display = 'block';
      this.durationErrorElement.style.color = '#FF9500'; // Warning color
    }
  }

  /**
   * Save Pomodoro duration with validation
   * @param {number} minutes - Duration in minutes to save
   * @private
   */
  _savePomodoroDuration(minutes) {
    // Check if TimerComponent is available
    if (!this.timerComponent) {
      this._showDurationError('Duration customization is unavailable');
      return;
    }

    // Validate duration FIRST
    if (!this._validateDuration(minutes)) {
      // Provide specific error messages
      if (typeof minutes !== 'number' || isNaN(minutes)) {
        this._showDurationError('Please enter a valid number');
      } else if (!Number.isInteger(minutes)) {
        this._showDurationError('Duration must be a whole number');
      } else {
        this._showDurationError('Duration must be between 1 and 120 minutes');
      }
      return; // Prevent saving
    }

    // Check if timer is running - prevent duration changes while timer is active
    if (this.timerComponent.isRunning) {
      this._showDurationError('Stop the timer before changing duration');
      return; // Prevent saving
    }

    // Save to timer component (which handles storage)
    const success = this.timerComponent.setDuration(minutes);

    if (success) {
      // Show success feedback
      this._showSuccessFeedback(`Timer duration set to ${minutes} minutes`);

      // Clear error on successful save
      this._clearDurationError();
    } else {
      this._showDurationError('Failed to save duration');
    }
  }

  /**
   * Validate duration (1-120 minutes, integer)
   * @param {number} minutes - Duration to validate
   * @returns {boolean} True if valid, false otherwise
   * @private
   */
  _validateDuration(minutes) {
    // Check if it's a number
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      return false;
    }

    // Check if it's an integer
    if (!Number.isInteger(minutes)) {
      return false;
    }

    // Check range (1-120)
    return minutes >= 1 && minutes <= 120;
  }

  /**
   * Show inline error message for duration validation
   * @param {string} message - Error message to display
   * @private
   */
  _showDurationError(message) {
    if (this.durationErrorElement) {
      this.durationErrorElement.textContent = message;
      this.durationErrorElement.style.display = 'block';
    }
  }

  /**
   * Clear inline error message for duration validation
   * @private
   */
  _clearDurationError() {
    if (this.durationErrorElement) {
      this.durationErrorElement.textContent = '';
      this.durationErrorElement.style.display = 'none';
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clear DOM references
    this.themeLightButton = null;
    this.themeDarkButton = null;
    this.currentThemeSpan = null;
    this.userNameInput = null;
    this.saveNameButton = null;
    this.nameErrorElement = null;
    this.durationInput = null;
    this.saveDurationButton = null;
    this.durationErrorElement = null;
    this.successMessageElement = null;
  }
}

/**
 * Main Application Initialization
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Instantiate StorageManager
    const storageManager = new StorageManager();

    // Instantiate ThemeManager and apply saved theme BEFORE rendering components
    const themeManager = new ThemeManager(storageManager);
    themeManager.init();

    // Check if localStorage is available and show warning if not
    if (!storageManager.isAvailable) {
      const banner = document.getElementById('storage-warning-banner');
      if (banner) {
        banner.textContent = 'Storage disabled. Changes won\'t be saved.';
        banner.style.display = 'block';
      }
      console.warn('localStorage is not available. App will function without persistence.');
    }

    // Get container elements
    const greetingContainer = document.getElementById('greeting-container');
    const timerContainer = document.getElementById('timer-container');
    const taskListContainer = document.getElementById('task-list-container');
    const quickLinksContainer = document.getElementById('quick-links-container');
    const settingsContainer = document.getElementById('settings-container');

    // Component instances (stored for cross-tab sync and settings)
    let greetingComponent = null;
    let timerComponent = null;
    let taskListComponent = null;
    let quickLinksComponent = null;
    let settingsComponent = null;

    // Initialize GreetingComponent
    if (greetingContainer) {
      try {
        greetingComponent = new GreetingComponent(greetingContainer, storageManager);
        greetingComponent.init();
        console.log('GreetingComponent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize GreetingComponent:', error);
      }
    } else {
      console.error('Container element not found: #greeting-container');
    }

    // Initialize TimerComponent
    if (timerContainer) {
      try {
        timerComponent = new TimerComponent(timerContainer, storageManager);
        timerComponent.init();
        console.log('TimerComponent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize TimerComponent:', error);
      }
    } else {
      console.error('Container element not found: #timer-container');
    }

    // Initialize TaskListComponent
    if (taskListContainer) {
      try {
        taskListComponent = new TaskListComponent(taskListContainer, storageManager);
        taskListComponent.init();
        console.log('TaskListComponent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize TaskListComponent:', error);
      }
    } else {
      console.error('Container element not found: #task-list-container');
    }

    // Initialize QuickLinksComponent
    if (quickLinksContainer) {
      try {
        quickLinksComponent = new QuickLinksComponent(quickLinksContainer, storageManager);
        quickLinksComponent.init();
        console.log('QuickLinksComponent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize QuickLinksComponent:', error);
      }
    } else {
      console.error('Container element not found: #quick-links-container');
    }

    // Initialize SettingsComponent
    if (settingsContainer) {
      try {
        settingsComponent = new SettingsComponent(
          settingsContainer,
          storageManager,
          themeManager,
          greetingComponent,
          timerComponent
        );
        settingsComponent.init();
        console.log('SettingsComponent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SettingsComponent:', error);
      }
    } else {
      console.error('Container element not found: #settings-container');
    }

    // Set up cross-tab synchronization via storage events
    window.addEventListener('storage', (event) => {
      // Storage event fires when localStorage is modified in another tab
      if (event.key === 'dashboard_tasks' && taskListComponent) {
        console.log('Tasks updated in another tab, reloading...');
        taskListComponent.reload();
      } else if (event.key === 'dashboard_links' && quickLinksComponent) {
        console.log('Links updated in another tab, reloading...');
        quickLinksComponent.reload();
      }
    });

    console.log('Dashboard initialization complete');

  } catch (error) {
    console.error('Critical error during application initialization:', error);
    alert('Failed to initialize the dashboard. Please refresh the page.');
  }
});
