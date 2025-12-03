# Manual Testing Checklist - Stage Progression & Communication

This document outlines the manual testing steps for the stage progression and communication features. These tests should be performed to verify the implementation is working correctly.

## Prerequisites

- Ensure Firebase project is configured
- Run seed scripts:
  ```bash
  npm run seed:stage-progression
  npm run seed:test-activity
  ```
- Have at least one member in the database

---

## Test 1: Stage Progress Display

**Objective:** Verify that stage progress is correctly displayed in the person detail panel.

**Steps:**
1. Navigate to the People page
2. Click on a person who has test activity data
3. Verify the person detail panel opens from the right
4. Check that the Stage Progress Card displays:
   - Current stage name
   - Trigger requirements and current progress
   - Progress bars for partially met triggers
   - Checkmarks for completed triggers

**Expected Results:**
- Panel slides in smoothly from right
- Stage progress card shows accurate trigger status
- If all triggers are met: green "Ready to advance" section appears
- If triggers are partially met: progress bars show current/required counts
- If no triggers are configured: "Manual advancement only" message displays

---

## Test 2: Stage Advancement

**Objective:** Verify that stage advancement works correctly with transaction-based updates.

**Steps:**
1. Open person detail panel for a member who is ready to advance (all triggers met)
2. Click the "Advance Stage" button
3. Wait for the operation to complete
4. Verify success message appears
5. Close and reopen the panel or refresh the page
6. Verify the member's current stage has been updated

**Expected Results:**
- Success alert: "Successfully advanced to [next stage]!"
- Member's `currentStage` field is updated in Firestore
- Activity entry is created in `members/{id}/activity` sub-collection with:
  - `type: 'stage_change'`
  - `fromStage` and `toStage` values
  - `triggeredBy: 'auto'`
  - Timestamp
- Panel closes after successful advancement

**Error Case:** Open two panels for the same person in different tabs, advance in one tab, then try to advance in the other
- Should show error: "This person was already advanced by someone else."

---

## Test 3: Message Templates

**Objective:** Verify that message templates load correctly and variable substitution works.

**Steps:**
1. Open person detail panel
2. Navigate to the "Send Message" section
3. Select different message channels (SMS, Email, WhatsApp, Phone Log)
4. For each channel, select a template from the dropdown
5. Verify template body loads with substituted variables
6. Check variable substitution for:
   - `{firstName}` - Should be replaced with person's first name
   - `{stageName}` - Should show current stage
   - `{nextEventDate}` - Should show "TBD" (or actual date if configured)

**Expected Results:**
- Template dropdown shows stage-specific templates first, then custom templates
- Template body appears in message textarea with variables replaced
- For Email channel: Subject field appears and is populated from template
- For SMS channel: Character count displays below message (e.g., "150 characters (1 SMS segment)")
- Switching channels resets the form and loads appropriate templates

---

## Test 4: Communication Sending

**Objective:** Verify that communications can be sent and tracked correctly.

**Steps:**
1. Open person detail panel
2. Select a message channel (e.g., SMS)
3. Either select a template or write a custom message
4. Click "Send via App" button
5. Wait for confirmation
6. Verify form resets
7. Check the Activity Timeline updates immediately
8. Verify in Firestore console that:
   - Communication document created in `communications` collection
   - Activity entry created in `members/{id}/activity` sub-collection

**Alternative Flow:** Click "Mark as Sent Manually" button
- Should create same documents but with `sentVia: 'manual'`

**Expected Results:**
- Message sends successfully
- Form clears (message, subject, template selection all reset)
- Timeline updates in real-time with new communication entry
- Communication document contains:
  - `memberId`, `type`, `direction: 'outbound'`
  - `message`, `sentBy`, `sentVia`, `timestamp`
  - `template` reference if template was used
  - `subject` if email channel
- Activity entry contains:
  - `type: 'communication'`
  - `communicationId`, `channel`, `direction`, `summary`

**Error Case:** Try sending with empty message
- "Send via App" and "Mark as Sent Manually" buttons should be disabled

---

## Test 5: Timeline Display

**Objective:** Verify that the activity timeline displays all activity types correctly.

**Steps:**
1. Open person detail panel for member with diverse activity
2. Scroll to the "Activity Timeline" section
3. Verify different activity types appear:
   - Event attendances (green checkmark icon)
   - Stage changes (orange arrow icon)
   - Communications (blue mail/message icons)
4. Check that activities are sorted by most recent first
5. Verify timestamps are formatted correctly (e.g., "Dec 2, 3:45 PM")

**Expected Results:**
- Timeline shows all activities in reverse chronological order
- Each activity has appropriate icon and color:
  - Event attendance: Green background, checkmark icon, shows event name
  - Stage change: Orange background, arrow icon, shows "fromStage → toStage"
  - Communication: Blue background, channel-specific icon, shows direction and summary
- Timestamps are human-readable and accurate
- Empty state shows "No activity yet" if no activity exists
- Real-time updates: new activities appear immediately

---

## Test 6: Error Handling

**Objective:** Verify that error conditions are handled gracefully.

**Steps:**
1. **Race condition test:**
   - Open two browser tabs/windows
   - Open same person's detail panel in both
   - Click "Advance Stage" in first tab
   - Immediately click "Advance Stage" in second tab
   - Verify second attempt shows error message

2. **Empty message test:**
   - Open person detail panel
   - Leave message field empty
   - Verify send buttons are disabled

3. **Network error simulation:**
   - Open browser DevTools
   - Go to Network tab and set to "Offline"
   - Try to send a message
   - Verify error message appears
   - Set back to "Online" and retry

**Expected Results:**
- Race condition: "This person was already advanced by someone else."
- Empty message: Buttons disabled (gray background, cursor not-allowed)
- Network error: "Failed to send message. Please try again." alert
- Panel remains open on errors (doesn't close prematurely)
- User can retry after fixing error

---

## Additional Checks

### Real-time Updates
- Open person detail panel
- In another tab, manually add an activity entry in Firestore console
- Verify timeline updates automatically without refresh

### Panel Interactions
- Verify panel closes when clicking backdrop (dark overlay)
- Verify panel closes when clicking X button
- Verify smooth slide-in animation (300ms ease-out)
- Verify panel is scrollable when content is long

### Responsive Design
- Test on different screen sizes
- Verify panel adapts to mobile (should be full-width on small screens)
- Verify all buttons and text are readable

---

## Completion Criteria

All tests above should pass before considering the feature complete. Document any issues found and create tickets for fixes.

**Testing Date:** _________________

**Tester Name:** _________________

**Results:** [ ] All Pass  [ ] Issues Found (document below)

**Issues:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
