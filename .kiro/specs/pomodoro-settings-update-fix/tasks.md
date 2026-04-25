# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Duration Save Method Invocation Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - button click and Enter key press with valid duration values
  - Test that clicking save button with valid duration (e.g., 30) fails to invoke `_savePomodoroDuration` method
  - Test that pressing Enter with valid duration (e.g., 45) fails to invoke `_savePomodoroDuration` method
  - Use spies/mocks to detect method invocation attempts
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: event handlers fail to call method due to malformed name `_savePomodoroD\nuration`
  - Check console for ReferenceError or TypeError
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Validation and Error Handling Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code by examining the `_savePomodoroDuration` method logic directly
  - Write property-based tests capturing observed validation behavior patterns:
    - Valid durations (1-120, integers) should be accepted and saved
    - Invalid durations (non-numeric, out of range, non-integer) should be rejected with specific error messages
    - Duration changes should be prevented when timer is running
    - Success feedback should display for valid saves
    - Error messages should clear on valid input
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code (by calling the method directly if possible, or by examining method logic)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix broken method name in js/app.js

  - [x] 3.1 Correct the method name in all three locations
    - Line 1862-1863 (Click Event Handler): Replace `this._savePomodoroD\nuration(minutes);` with `this._savePomodoroDuration(minutes);`
    - Line 1909-1910 (Keypress Event Handler): Replace `this._savePomodoroD\nuration(minutes);` with `this._savePomodoroDuration(minutes);`
    - Line 1911-1912 (Method Definition): Replace `_savePomodoroD\nuration(minutes) {` with `_savePomodoroDuration(minutes) {`
    - No changes to validation logic, error handling, or any other functionality
    - _Bug_Condition: isBugCondition(input) where (input.action == 'click' AND input.target == saveDurationButton) OR (input.action == 'keypress' AND input.key == 'Enter' AND input.target == durationInput) AND methodNameIsMalformed('_savePomodoroD\nuration')_
    - _Expected_Behavior: For any user interaction where save button is clicked or Enter key is pressed, the fixed code SHALL successfully invoke the `_savePomodoroDuration` method_
    - _Preservation: All validation logic, error handling, success feedback, timer running checks, and error clearing behavior must remain unchanged_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Duration Save Method Invocation Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that clicking save button successfully invokes `_savePomodoroDuration`
    - Verify that pressing Enter successfully invokes `_savePomodoroDuration`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Validation and Error Handling Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all validation logic works correctly after fix
    - Confirm error messages display correctly for invalid inputs
    - Confirm success feedback displays correctly for valid saves
    - Confirm timer running check prevents duration changes
    - Confirm error clearing works on valid input
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
