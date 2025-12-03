# Stage Progression & Multi-Channel Communication Design

**Date:** 2024-12-02
**Status:** Design Approved
**Implementation:** Pending

## Overview

This document describes the design for two core features of the Pathways church management app:

1. **Stage Progression System**: Move people through integration journey stages with automatic trigger suggestions and staff approval
2. **Multi-Channel Communication System**: Track and manage communication via SMS, Email, WhatsApp, and Phone

## Design Decisions

### Stage Progression Approach
**Selected:** Hybrid (automatic suggestions + staff approval)

- System automatically evaluates triggers and suggests when someone is ready to advance
- Staff reviews suggestion and approves/dismisses
- Pastoral override: Staff can manually advance anyone at any time without meeting triggers
- Balance between automation efficiency and human pastoral care

### Message Templates
**Selected:** Hybrid (stage defaults + custom library)

- Each stage has default message templates (e.g., "Welcome to Newcomers Lunch" when advancing to that stage)
- Shared library of reusable custom templates
- Staff can select from library or write custom messages
- Variable substitution: `{firstName}`, `{lastName}`, `{stageName}`, `{nextEventDate}`, etc.

### Communication Integration
**Selected:** Hybrid (track all, integrate sending capability later)

- Track all communications immediately (SMS, Email, WhatsApp, Phone calls)
- Two send modes:
  - "Send via App" button (placeholder for future Twilio/SendGrid integration)
  - "Mark as Sent Manually" button (track messages sent outside the app)
- Future: Add real API integrations for automated sending

### Trigger System
**Selected:** Event-based triggers

- Triggers based on milestone events (e.g., "Attended 3 Sunday services", "Completed Newcomers Tent")
- Each stage defines triggers required to advance to next stage
- Client-side evaluation with real-time feedback
- Examples:
  - Visitor → Newcomers Tent: Attended 1 Sunday service
  - Newcomers Tent → Newcomers Lunch: Attended 3 Sunday services + 1 Tent
  - Newcomers Lunch → Growth Track: Attended 1 Lunch event

## Architecture

### Overall Approach
**Approach 2: Person-Detail Focused with Timeline**

Core component: `PersonDetailPanel` - a reusable slide-in panel that opens from both Pipeline and People pages.

**Panel Layout:**
```
┌─────────────────────────────────────────────┐
│ [X] Close                                    │
│  [Avatar] John Smith                         │
│  Newcomer • Joined Oct 2023                  │
│                                              │
│  Current Stage: Newcomers Tent               │
│  ┌──────────────────────────────────────┐  │
│  │ ✓ Attended Sunday (3x)               │  │
│  │ ✓ Attended Tent (1x)                 │  │
│  │ Ready for: Newcomers Lunch           │  │
│  │ [Advance Stage] [Dismiss]            │  │
│  └──────────────────────────────────────┘  │
│  ─── Timeline ───                            │
│  ○ Today • 📧 Sent welcome email            │
│  ○ Nov 12 • ✓ Attended: Newcomers Tent     │
│  ○ Oct 28 • 📱 SMS: Reminder sent           │
│  ─── Send Message ───                        │
│  [SMS] [Email] [WhatsApp] [Phone Log]      │
│  Template: [Select...▾]                     │
│  Message: [Textarea with template content]  │
│  [Send via App] [Mark as Sent Manually]    │
└─────────────────────────────────────────────┘
```

### Component Structure

```
src/components/
├── PersonDetailPanel.tsx          // Main panel component
├── StageProgressCard.tsx          // Progress indicators + advance button
├── CommunicationTimeline.tsx      // Activity history
├── MessageComposer.tsx            // Send message interface
└── TemplateSelector.tsx           // Template dropdown with preview
```

### Data Flow

1. **User clicks person** on Pipeline or People page
2. **PersonDetailPanel opens** with slide-in animation
3. **useStageProgress hook** evaluates triggers:
   - Fetches member's activity from `members/{id}/activity` sub-collection
   - Fetches trigger rules from `stage_triggers` collection
   - Evaluates each trigger (e.g., count Sunday service attendances)
   - Returns: `{ ready: boolean, triggersMet: [], nextStage: string }`
4. **If ready → Show suggestion card** with "Advance Stage" button
5. **Staff clicks "Advance"** → Transaction updates:
   - Update member's `currentStage` field
   - Create activity entry: `{ type: 'stage_change', from, to, timestamp, triggeredBy }`
   - Load default template for new stage
   - Show success feedback
6. **Timeline updates** in real-time via Firestore listeners

## Firestore Collections

### New Collections

#### `communications`
```typescript
{
  id: string,                        // Auto-generated
  memberId: string,                  // Reference to member
  type: 'sms' | 'email' | 'whatsapp' | 'phone',
  direction: 'outbound' | 'inbound',
  template: string | null,           // Template ID if used
  subject?: string,                  // For email only
  message: string,                   // Message content
  sentBy: string,                    // Staff member ID
  sentVia: 'app' | 'manual',        // Track if sent through app or manually logged
  timestamp: Timestamp,
  metadata?: {                       // Optional
    phoneNumber?: string,
    emailAddress?: string,
    whatsappNumber?: string,
    duration?: number               // For phone calls
  }
}
```

#### `stage_triggers`
```typescript
{
  id: string,                        // Auto-generated
  stageId: string,                   // Current stage
  nextStageId: string,               // Stage to advance to
  triggers: [
    {
      type: 'event_attendance',
      eventType: 'sunday' | 'tent' | 'lunch' | 'track',
      count: number                  // Required number of attendances
    }
  ],
  createdAt: Timestamp
}
```

**Example Documents:**
```typescript
// Visitor → Newcomers Tent
{
  stageId: 'visitor',
  nextStageId: 'newcomers_tent',
  triggers: [
    { type: 'event_attendance', eventType: 'sunday', count: 1 }
  ]
}

// Newcomers Tent → Newcomers Lunch
{
  stageId: 'newcomers_tent',
  nextStageId: 'newcomers_lunch',
  triggers: [
    { type: 'event_attendance', eventType: 'sunday', count: 3 },
    { type: 'event_attendance', eventType: 'tent', count: 1 }
  ]
}
```

#### `message_templates`
```typescript
{
  id: string,                        // Auto-generated
  name: string,                      // "Welcome to Newcomers Lunch"
  channel: 'sms' | 'email' | 'whatsapp' | 'phone',
  category: 'stage_default' | 'custom',
  stageId?: string,                  // If category = 'stage_default'
  subject?: string,                  // For email only
  body: string,                      // Message content with variables
  variables: string[],               // ['firstName', 'stageName', 'eventDate']
  createdBy: string,                 // Staff member ID
  createdAt: Timestamp,
  lastUsed?: Timestamp
}
```

**Example Templates:**
```typescript
// Stage default - Welcome to Tent
{
  name: 'Welcome to Newcomers Tent',
  channel: 'sms',
  category: 'stage_default',
  stageId: 'newcomers_tent',
  body: 'Hi {firstName}! Welcome to the Newcomers Tent journey. Our next event is {nextEventDate}. Looking forward to seeing you!',
  variables: ['firstName', 'nextEventDate']
}

// Custom - Prayer Request Follow-up
{
  name: 'Prayer Request Follow-up',
  channel: 'email',
  category: 'custom',
  subject: 'Checking in on your prayer request',
  body: 'Hi {firstName},\n\nI wanted to follow up on the prayer request you shared last week. How are things going?\n\nBlessings,\n{staffName}',
  variables: ['firstName', 'staffName']
}
```

### Sub-Collections

#### `members/{id}/activity`
Aggregates all member activity for timeline and trigger evaluation.

```typescript
{
  id: string,                        // Auto-generated
  type: 'event_attendance' | 'stage_change' | 'communication',
  timestamp: Timestamp,

  // For event_attendance
  eventId?: string,
  eventType?: 'sunday' | 'tent' | 'lunch' | 'track',
  eventName?: string,

  // For stage_change
  fromStage?: string,
  toStage?: string,
  triggeredBy?: 'auto' | 'manual',
  approvedBy?: string,              // Staff member ID

  // For communication
  communicationId?: string,          // Reference to communications collection
  channel?: 'sms' | 'email' | 'whatsapp' | 'phone',
  direction?: 'outbound' | 'inbound',
  summary?: string                   // Short description for timeline
}
```

## UI Components

### PersonDetailPanel Component

**Location:** `src/components/PersonDetailPanel.tsx`

**Props:**
```typescript
interface PersonDetailPanelProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**State Management:**
```typescript
const [member, setMember] = useState<Member | null>(null);
const [activity, setActivity] = useState<Activity[]>([]);
const [stageProgress, setStageProgress] = useState<StageProgress | null>(null);
const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email' | 'whatsapp' | 'phone'>('sms');
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
const [messageContent, setMessageContent] = useState('');
```

**Real-time Listeners:**
1. Member document: `members/{id}`
2. Activity sub-collection: `members/{id}/activity` (ordered by timestamp desc)
3. Stage triggers: `stage_triggers` where `stageId == member.currentStage`

**Key Functions:**
- `handleAdvanceStage()`: Execute Firestore transaction to advance stage
- `handleDismiss()`: Dismiss suggestion (optional: log dismissal reason)
- `handleSendMessage()`: Create communication record + activity entry
- `substituteVariables()`: Replace template variables with actual values

### StageProgressCard Component

**Visual Design:**
```
┌──────────────────────────────────────────┐
│ ✓ Attended Sunday Service (3/3)         │
│ ✓ Attended Newcomers Tent (1/1)         │
│ ✅ Ready to advance to: Newcomers Lunch │
│ [Advance Stage] [Dismiss]                │
└──────────────────────────────────────────┘
```

**States:**
- **Not Ready:** Show progress bars (e.g., "2/3 Sunday services")
- **Ready:** Green highlight + "Ready to advance" message + action buttons
- **No Triggers:** Display "Manual advancement only"

### CommunicationTimeline Component

**Visual Design:**
```
─── Timeline ───
○ Today • 📧 Email: Welcome to Newcomers Lunch
  Sent via app by Sarah Johnson

○ Nov 12 • ✓ Event: Attended Newcomers Tent
  First-time attendance

○ Nov 5 • 📱 SMS: Reminder about upcoming Tent event
  Marked as sent manually by Mike Davis

○ Oct 28 • ↗️ Stage Change: Visitor → Newcomers Tent
  Automatically triggered after 1 Sunday service
```

**Activity Types:**
- 📧 Email communications
- 📱 SMS communications
- 💬 WhatsApp communications
- 📞 Phone call logs
- ✓ Event attendances
- ↗️ Stage changes

**Sorting:** Most recent first (timestamp desc)

### MessageComposer Component

**Visual Design:**
```
─── Send Message ───
[SMS] [Email] [WhatsApp] [Phone Log]    ← Channel selector tabs

Template: [Select template ▾]            ← Dropdown

┌────────────────────────────────────────┐
│ Hi John! Welcome to the Newcomers     │  ← Message textarea
│ Lunch journey. Our next event is...   │
└────────────────────────────────────────┘

[Send via App] [Mark as Sent Manually]   ← Action buttons
```

**Template Selector:**
- Show stage default templates at top (if exist)
- Divider
- Show custom templates grouped by recent/all
- Show variables that will be substituted
- Live preview as user selects template

**Channel-Specific UI:**
- **SMS:** Character count (160 chars per segment)
- **Email:** Add subject line field
- **WhatsApp:** WhatsApp number validation
- **Phone:** Add call duration field + notes

## Hooks

### useStageProgress Hook

**Location:** `src/hooks/useStageProgress.ts`

```typescript
interface StageProgress {
  ready: boolean;
  nextStage: string | null;
  triggers: TriggerStatus[];
}

interface TriggerStatus {
  type: string;
  eventType?: string;
  required: number;
  current: number;
  met: boolean;
}

function useStageProgress(memberId: string): StageProgress {
  // 1. Fetch member's current stage
  // 2. Fetch trigger rules for current stage
  // 3. Fetch member's activity sub-collection
  // 4. Evaluate each trigger:
  //    - Count event attendances by type
  //    - Compare to required count
  // 5. Return status: ready if ALL triggers met
}
```

**Evaluation Logic:**
```typescript
// Example: Check if member attended 3 Sunday services
const sundayAttendances = activity.filter(
  a => a.type === 'event_attendance' && a.eventType === 'sunday'
).length;

const trigger = { type: 'event_attendance', eventType: 'sunday', count: 3 };
const met = sundayAttendances >= trigger.count;
```

**Return Values:**
- `ready: true` → All triggers met, show "Ready to advance" card
- `ready: false` → Show progress bars with current/required counts
- `nextStage: null` → No automatic progression (manual only)

## Trigger Evaluation & Error Handling

### Client-Side Evaluation

All trigger evaluation happens client-side using Firestore real-time listeners:

1. **Subscribe to activity sub-collection**: `members/{id}/activity`
2. **Filter events by type**: Extract event attendances
3. **Count by eventType**: Group and count (e.g., 3 Sunday services)
4. **Compare to requirements**: Check each trigger condition
5. **Real-time updates**: Re-evaluate whenever activity changes

**Performance Optimization:**
- Cache trigger rules (they rarely change)
- Use Firestore indexes on `members/{id}/activity` ordered by timestamp
- Limit activity queries to last 90 days (triggers are typically short-term)

### Error Handling

#### Race Condition: Multiple Staff Advance Same Person
**Problem:** Two staff members open panel simultaneously and both try to advance

**Solution:** Use Firestore transaction
```typescript
await db.runTransaction(async (transaction) => {
  const memberRef = db.collection('members').doc(memberId);
  const memberDoc = await transaction.get(memberRef);

  if (memberDoc.data().currentStage !== expectedStage) {
    throw new Error('Stage was already changed by someone else');
  }

  transaction.update(memberRef, {
    currentStage: nextStage,
    updatedAt: serverTimestamp()
  });
});
```

**User Feedback:** Show toast notification: "This person was already advanced by [Staff Name]"

#### Missing Trigger Rules
**Problem:** Stage exists but no trigger rules defined

**Solution:**
- Show "Manual advancement only" message in StageProgressCard
- Provide "Set Up Triggers" admin button (future feature)
- Log warning to console for admin visibility

#### Template Variable Not Found
**Problem:** Template uses `{nextEventDate}` but no upcoming event exists

**Solution:**
- Substitute with fallback: "TBD" or "to be announced"
- Show warning indicator in template preview
- Allow staff to edit before sending

#### Communication Send Failure
**Problem:** "Send via App" button clicked but API fails (future integration)

**Solution:**
- Show error toast with retry option
- Automatically save as draft
- Offer "Mark as Sent Manually" as fallback

#### Activity Sub-Collection Query Fails
**Problem:** Network issue or permission error loading activity

**Solution:**
- Show loading spinner during retry (3 attempts)
- Display error state: "Unable to load activity. [Retry]"
- Disable "Advance Stage" button until data loads

### Edge Cases

#### Person Manually Advanced While Panel Open
**Scenario:** Panel shows "Ready to advance", but admin manually changed stage via Firebase console

**Handling:**
- Real-time listener detects stage change
- Auto-update panel UI to reflect new stage
- Show notification: "Stage was updated externally"

#### Trigger Evaluation with Duplicate Events
**Scenario:** Member accidentally checked in twice to same event

**Handling:**
- Deduplicate by eventId + date
- Or: Count all (depends on church policy)
- Make configurable in trigger rules: `allowDuplicates: false`

#### Template Deletion While In Use
**Scenario:** Staff selects template, then admin deletes it before sending

**Handling:**
- Message content already loaded into textarea (unaffected)
- Show warning: "Template no longer exists (using cached content)"
- Remove from dropdown after send completes

## Implementation Phases

### Phase 1: Core Data & Panel (MVP)
- Create Firestore collections and security rules
- Build PersonDetailPanel component with slide-in animation
- Implement useStageProgress hook
- Add panel triggers from Pipeline and People pages
- Show static timeline (read-only activity history)

### Phase 2: Stage Progression
- Build StageProgressCard component
- Implement advance/dismiss actions
- Add transaction-based stage updates
- Create activity entries for stage changes
- Add pastoral override (manual advance button)

### Phase 3: Communication Tracking
- Build MessageComposer component
- Create TemplateSelector with variable substitution
- Implement "Mark as Sent Manually" button
- Log communications to Firestore
- Update timeline with communication entries

### Phase 4: Template Management
- Build template library admin interface
- Add stage default template configuration
- Implement template CRUD operations
- Add variable validation and preview

### Phase 5: Future Integrations
- Integrate Twilio for SMS sending
- Integrate SendGrid for email sending
- Add WhatsApp Business API
- Replace "Send via App" placeholder with real sending

## Security Considerations

### Firestore Security Rules

```javascript
// Communications: Staff can read/write, members can read their own
match /communications/{commId} {
  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff' ||
    resource.data.memberId == request.auth.uid
  );
  allow write: if request.auth != null &&
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff';
}

// Activity sub-collection: Staff can read/write, members can read their own
match /members/{memberId}/activity/{activityId} {
  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff' ||
    request.auth.uid == memberId
  );
  allow write: if request.auth != null &&
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff';
}

// Templates: Staff only
match /message_templates/{templateId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff';
}

// Triggers: Staff only
match /stage_triggers/{triggerId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'staff';
}
```

### Data Privacy
- Communications contain sensitive content → strict access control
- Phone numbers/emails should be encrypted at rest (future enhancement)
- Activity history visible only to staff and the member themselves
- Audit log: Track who advanced members and who sent messages

## Success Metrics

### Stage Progression
- Time to advancement: Average days between stages (should decrease with automation)
- Dismissal rate: % of suggestions dismissed (high = bad trigger tuning)
- Manual override rate: % of advancements without meeting triggers
- Completion rate: % of people reaching "Core Member" stage

### Communication
- Response rate: Track inbound communications per outbound sent
- Template usage: Most-used templates inform defaults
- Channel preference: Which channels get most engagement
- Message frequency: Ensure not over-communicating (max X per week)

## Future Enhancements

### Trigger System
- Time-based triggers: "Been in stage for 30 days"
- Score-based triggers: "Completed 80% of checklist"
- Compound triggers with OR logic: "Attended Tent OR Lunch"
- Seasonal triggers: "Registered for Summer Camp"

### Communication
- Scheduled sending: "Send this on Tuesday at 9am"
- Bulk messaging: "Send to all in Newcomers Tent stage"
- Message threads: Track conversations across channels
- Read receipts: See if messages were opened

### Analytics Dashboard
- Stage funnel visualization (Visitor → Core Member conversion rates)
- Communication heatmap (best times to send messages)
- Engagement scoring (who's responding vs. ghosting)
- Trigger performance (which triggers predict successful advancement)

### Integrations
- Calendar integration: Auto-populate {nextEventDate} from church calendar
- Check-in kiosk: Auto-log event attendance to activity feed
- Mobile app: Push notifications for new messages
- Volunteer scheduling: Trigger "Invite to serve" when reaching Core Member

## Conclusion

This design provides a practical, phased approach to implementing stage progression and multi-channel communication in Pathways. The hybrid approach balances automation with pastoral care, while the Person-Detail panel provides rich context for staff to make informed decisions.

The MVP (Phases 1-3) delivers immediate value by tracking activity and communications, while laying the foundation for future automation through API integrations.

**Next Steps:**
1. Set up worktree for isolated development
2. Create implementation plan with bite-sized tasks
3. Build Phase 1 (Core Data & Panel) first
4. Iterate based on user feedback before adding more features
