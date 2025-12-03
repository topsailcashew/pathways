# Stage Progression & Communication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement stage progression with automatic trigger suggestions and multi-channel communication tracking in the Pathways church management app.

**Architecture:** Person-detail panel component that slides in from Pipeline and People pages, showing stage progress cards, activity timeline, and message composer. Uses Firestore real-time listeners for trigger evaluation and activity tracking.

**Tech Stack:** React 19.2.0, TypeScript, Firebase/Firestore, Tailwind CSS, lucide-react icons

---

## Phase 1: Data Models & Firestore Collections

### Task 1: Update Type Definitions

**Files:**
- Modify: `src/types/models.ts:32-39`
- Modify: `src/types/enums.ts:10-14`

**Step 1: Update Communication model**

Update the existing `Communication` interface in `src/types/models.ts` (lines 32-39):

```typescript
export interface Communication {
  id: string;
  memberId: string;
  type: CommunicationType;
  direction: 'outbound' | 'inbound';
  template: string | null;
  subject?: string; // For email only
  message: string;
  sentBy: string;
  sentVia: 'app' | 'manual'; // Track if sent through app or manually
  timestamp: Timestamp;
  metadata?: {
    phoneNumber?: string;
    emailAddress?: string;
    whatsappNumber?: string;
    duration?: number; // For phone calls
  };
}
```

**Step 2: Update CommunicationType enum**

Update the `CommunicationType` enum in `src/types/enums.ts` (lines 11-14):

```typescript
export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PHONE = 'phone',
}
```

**Step 3: Add new type definitions**

Add these new interfaces at the end of `src/types/models.ts`:

```typescript
export interface StageTrigger {
  id: string;
  stageId: string;
  nextStageId: string;
  triggers: TriggerRule[];
  createdAt: Timestamp;
}

export interface TriggerRule {
  type: 'event_attendance';
  eventType: 'sunday' | 'tent' | 'lunch' | 'track';
  count: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: CommunicationType;
  category: 'stage_default' | 'custom';
  stageId?: string;
  subject?: string;
  body: string;
  variables: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastUsed?: Timestamp;
}

export interface Activity {
  id: string;
  type: 'event_attendance' | 'stage_change' | 'communication';
  timestamp: Timestamp;

  // For event_attendance
  eventId?: string;
  eventType?: 'sunday' | 'tent' | 'lunch' | 'track';
  eventName?: string;

  // For stage_change
  fromStage?: string;
  toStage?: string;
  triggeredBy?: 'auto' | 'manual';
  approvedBy?: string;

  // For communication
  communicationId?: string;
  channel?: CommunicationType;
  direction?: 'outbound' | 'inbound';
  summary?: string;
}

export interface StageProgress {
  ready: boolean;
  nextStage: string | null;
  triggers: TriggerStatus[];
}

export interface TriggerStatus {
  type: string;
  eventType?: string;
  required: number;
  current: number;
  met: boolean;
}
```

**Step 4: Commit type updates**

```bash
cd ~/.config/superpowers/worktrees/pathways/stage-progression
git add src/types/models.ts src/types/enums.ts
git commit -m "feat: add stage progression and communication type definitions"
```

---

### Task 2: Create Firestore Security Rules

**Files:**
- Modify: `firestore.rules:1-end`

**Step 1: Add rules for new collections**

Add these rules to `firestore.rules` after the existing `members` rules:

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

**Step 2: Deploy security rules**

Run: `firebase deploy --only firestore:rules`

Expected: "✔ Deploy complete!"

**Step 3: Commit security rules**

```bash
git add firestore.rules
git commit -m "feat: add security rules for stage progression and communications"
```

---

### Task 3: Create Seed Data Script

**Files:**
- Create: `src/scripts/seedStageProgressionData.ts`

**Step 1: Write seed data script**

Create `src/scripts/seedStageProgressionData.ts`:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Stage } from '@/types/enums';

export async function seedStageProgressionData() {
  console.log('Seeding stage progression data...');

  // Seed stage triggers
  const triggers = [
    {
      stageId: Stage.SUNDAY_EXPERIENCE,
      nextStageId: Stage.NEWCOMERS_TENT,
      triggers: [
        { type: 'event_attendance', eventType: 'sunday', count: 1 }
      ],
      createdAt: Timestamp.now()
    },
    {
      stageId: Stage.NEWCOMERS_TENT,
      nextStageId: Stage.NEWCOMERS_LUNCH,
      triggers: [
        { type: 'event_attendance', eventType: 'sunday', count: 3 },
        { type: 'event_attendance', eventType: 'tent', count: 1 }
      ],
      createdAt: Timestamp.now()
    },
    {
      stageId: Stage.NEWCOMERS_LUNCH,
      nextStageId: Stage.GROWTH_TRACK,
      triggers: [
        { type: 'event_attendance', eventType: 'lunch', count: 1 }
      ],
      createdAt: Timestamp.now()
    }
  ];

  for (const trigger of triggers) {
    await addDoc(collection(db, 'stage_triggers'), trigger);
    console.log(`✓ Created trigger: ${trigger.stageId} → ${trigger.nextStageId}`);
  }

  // Seed message templates
  const templates = [
    {
      name: 'Welcome to Newcomers Tent',
      channel: 'sms',
      category: 'stage_default',
      stageId: Stage.NEWCOMERS_TENT,
      body: 'Hi {firstName}! Welcome to the Newcomers Tent journey. Our next event is {nextEventDate}. Looking forward to seeing you!',
      variables: ['firstName', 'nextEventDate'],
      createdBy: 'system',
      createdAt: Timestamp.now()
    },
    {
      name: 'Welcome to Newcomers Lunch',
      channel: 'email',
      category: 'stage_default',
      stageId: Stage.NEWCOMERS_LUNCH,
      subject: 'Welcome to Newcomers Lunch!',
      body: 'Hi {firstName},\n\nWe\'re excited to invite you to our Newcomers Lunch on {nextEventDate}. This is a great opportunity to connect with our church family and learn more about what God is doing here.\n\nLooking forward to seeing you there!\n\nBlessings,\n{staffName}',
      variables: ['firstName', 'nextEventDate', 'staffName'],
      createdBy: 'system',
      createdAt: Timestamp.now()
    },
    {
      name: 'Prayer Request Follow-up',
      channel: 'sms',
      category: 'custom',
      body: 'Hi {firstName}, checking in on the prayer request you shared. How are things going? - {staffName}',
      variables: ['firstName', 'staffName'],
      createdBy: 'system',
      createdAt: Timestamp.now()
    },
    {
      name: 'Event Reminder',
      channel: 'sms',
      category: 'custom',
      body: 'Hi {firstName}! Reminder: {eventName} is coming up on {eventDate}. We hope to see you there!',
      variables: ['firstName', 'eventName', 'eventDate'],
      createdBy: 'system',
      createdAt: Timestamp.now()
    }
  ];

  for (const template of templates) {
    await addDoc(collection(db, 'message_templates'), template);
    console.log(`✓ Created template: ${template.name}`);
  }

  console.log('✅ Stage progression data seeded successfully!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedStageProgressionData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding data:', error);
      process.exit(1);
    });
}
```

**Step 2: Add seed script to package.json**

Add this script to `package.json`:

```json
"scripts": {
  "seed:stage-progression": "tsx src/scripts/seedStageProgressionData.ts"
}
```

**Step 3: Run seed script**

Run: `npm run seed:stage-progression`

Expected: "✅ Stage progression data seeded successfully!"

**Step 4: Commit seed script**

```bash
git add src/scripts/seedStageProgressionData.ts package.json
git commit -m "feat: add seed script for stage progression data"
```

---

## Phase 2: Core Hooks

### Task 4: Create useStageProgress Hook

**Files:**
- Create: `src/hooks/useStageProgress.ts`

**Step 1: Write useStageProgress hook**

Create `src/hooks/useStageProgress.ts`:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { StageProgress, TriggerStatus, StageTrigger, Activity } from '@/types/models';

export function useStageProgress(memberId: string, currentStage: string) {
  const [progress, setProgress] = useState<StageProgress>({
    ready: false,
    nextStage: null,
    triggers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId || !currentStage) {
      setLoading(false);
      return;
    }

    let unsubscribeActivity: (() => void) | null = null;
    let stageTrigger: StageTrigger | null = null;

    const loadData = async () => {
      try {
        // 1. Fetch trigger rules for current stage
        const triggersQuery = query(
          collection(db, 'stage_triggers'),
          where('stageId', '==', currentStage),
          limit(1)
        );
        const triggersSnapshot = await getDocs(triggersQuery);

        if (triggersSnapshot.empty) {
          // No triggers defined - manual advancement only
          setProgress({
            ready: false,
            nextStage: null,
            triggers: []
          });
          setLoading(false);
          return;
        }

        stageTrigger = {
          id: triggersSnapshot.docs[0].id,
          ...triggersSnapshot.docs[0].data()
        } as StageTrigger;

        // 2. Subscribe to member's activity sub-collection
        const activityQuery = query(
          collection(db, `members/${memberId}/activity`),
          where('type', '==', 'event_attendance'),
          orderBy('timestamp', 'desc')
        );

        unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Activity[];

          // 3. Evaluate each trigger
          const triggerStatuses: TriggerStatus[] = stageTrigger!.triggers.map(rule => {
            const matchingEvents = activities.filter(
              activity => activity.eventType === rule.eventType
            );

            return {
              type: rule.type,
              eventType: rule.eventType,
              required: rule.count,
              current: matchingEvents.length,
              met: matchingEvents.length >= rule.count
            };
          });

          // 4. Check if all triggers met
          const allTriggersMet = triggerStatuses.length > 0 &&
            triggerStatuses.every(t => t.met);

          setProgress({
            ready: allTriggersMet,
            nextStage: allTriggersMet ? stageTrigger!.nextStageId : null,
            triggers: triggerStatuses
          });
          setLoading(false);
        });
      } catch (error) {
        console.error('Error loading stage progress:', error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeActivity) {
        unsubscribeActivity();
      }
    };
  }, [memberId, currentStage]);

  return { progress, loading };
}
```

**Step 2: Commit hook**

```bash
git add src/hooks/useStageProgress.ts
git commit -m "feat: add useStageProgress hook for trigger evaluation"
```

---

### Task 5: Create useCommunications Hook

**Files:**
- Create: `src/hooks/useCommunications.ts`

**Step 1: Write useCommunications hook**

Create `src/hooks/useCommunications.ts`:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Communication } from '@/types/models';
import { CommunicationType } from '@/types/enums';

export function useCommunications(memberId: string) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'communications'),
      where('memberId', '==', memberId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Communication[];

        setCommunications(comms);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching communications:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memberId]);

  const sendCommunication = async (
    type: CommunicationType,
    message: string,
    sentBy: string,
    sentVia: 'app' | 'manual',
    options?: {
      template?: string | null;
      subject?: string;
      metadata?: Communication['metadata'];
    }
  ) => {
    try {
      const communication: Omit<Communication, 'id'> = {
        memberId,
        type,
        direction: 'outbound',
        template: options?.template ?? null,
        subject: options?.subject,
        message,
        sentBy,
        sentVia,
        timestamp: Timestamp.now(),
        metadata: options?.metadata
      };

      const docRef = await addDoc(collection(db, 'communications'), communication);

      // Also create activity entry
      await addDoc(collection(db, `members/${memberId}/activity`), {
        type: 'communication',
        timestamp: Timestamp.now(),
        communicationId: docRef.id,
        channel: type,
        direction: 'outbound',
        summary: message.substring(0, 100)
      });

      return docRef.id;
    } catch (err) {
      console.error('Error sending communication:', err);
      throw err;
    }
  };

  return { communications, loading, error, sendCommunication };
}
```

**Step 2: Commit hook**

```bash
git add src/hooks/useCommunications.ts
git commit -m "feat: add useCommunications hook with send functionality"
```

---

### Task 6: Create useMessageTemplates Hook

**Files:**
- Create: `src/hooks/useMessageTemplates.ts`

**Step 1: Write useMessageTemplates hook**

Create `src/hooks/useMessageTemplates.ts`:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, or } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { MessageTemplate } from '@/types/models';
import { CommunicationType } from '@/types/enums';

export function useMessageTemplates(
  channel?: CommunicationType,
  stageId?: string
) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'message_templates'));

    // Filter by channel if provided
    if (channel) {
      q = query(q, where('channel', '==', channel));
    }

    // Order by category (stage_default first) then by createdAt
    q = query(q, orderBy('category', 'asc'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let templatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MessageTemplate[];

        // Filter stage defaults for current stage
        if (stageId) {
          templatesData = templatesData.filter(t =>
            t.category === 'custom' ||
            (t.category === 'stage_default' && t.stageId === stageId)
          );
        }

        setTemplates(templatesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching templates:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [channel, stageId]);

  const substituteVariables = (
    template: string,
    variables: Record<string, string>
  ): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value || 'TBD');
    });
    return result;
  };

  return { templates, loading, error, substituteVariables };
}
```

**Step 2: Commit hook**

```bash
git add src/hooks/useMessageTemplates.ts
git commit -m "feat: add useMessageTemplates hook with variable substitution"
```

---

### Task 7: Create useMemberActivity Hook

**Files:**
- Create: `src/hooks/useMemberActivity.ts`

**Step 1: Write useMemberActivity hook**

Create `src/hooks/useMemberActivity.ts`:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Activity } from '@/types/models';

export function useMemberActivity(memberId: string) {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `members/${memberId}/activity`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activityData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];

        setActivity(activityData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching activity:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memberId]);

  return { activity, loading, error };
}
```

**Step 2: Commit hook**

```bash
git add src/hooks/useMemberActivity.ts
git commit -m "feat: add useMemberActivity hook for timeline data"
```

---

## Phase 3: UI Components

### Task 8: Create StageProgressCard Component

**Files:**
- Create: `src/components/StageProgressCard.tsx`

**Step 1: Write StageProgressCard component**

Create `src/components/StageProgressCard.tsx`:

```typescript
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { StageProgress } from '@/types/models';

interface StageProgressCardProps {
  progress: StageProgress;
  loading: boolean;
  onAdvance: () => void;
  onDismiss: () => void;
}

export function StageProgressCard({
  progress,
  loading,
  onAdvance,
  onDismiss
}: StageProgressCardProps) {
  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // No triggers defined - manual advancement only
  if (progress.triggers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <AlertCircle size={16} />
          <span className="font-medium">Manual advancement only</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          No automatic triggers configured for this stage.
        </p>
      </div>
    );
  }

  // Show progress toward triggers
  return (
    <div className={`border rounded-xl p-4 transition-all ${
      progress.ready
        ? 'bg-green-50 border-green-500'
        : 'bg-white border-gray-200'
    }`}>
      <div className="space-y-3">
        {progress.triggers.map((trigger, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {trigger.met ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className={`text-sm font-medium ${
                  trigger.met ? 'text-green-900' : 'text-gray-700'
                }`}>
                  Attended {trigger.eventType?.replace('_', ' ')} ({trigger.current}/{trigger.required})
                </span>
              </div>
              {!trigger.met && (
                <div className="ml-6 mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(trigger.current / trigger.required) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {progress.ready && (
          <>
            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-3">
                <CheckCircle2 size={18} />
                <span>Ready to advance to: {progress.nextStage}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onAdvance}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Advance Stage
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit component**

```bash
git add src/components/StageProgressCard.tsx
git commit -m "feat: add StageProgressCard component"
```

---

### Task 9: Create CommunicationTimeline Component

**Files:**
- Create: `src/components/CommunicationTimeline.tsx`

**Step 1: Write CommunicationTimeline component**

Create `src/components/CommunicationTimeline.tsx`:

```typescript
import { Mail, MessageSquare, Phone, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Activity } from '@/types/models';
import { format } from 'date-fns';

interface CommunicationTimelineProps {
  activity: Activity[];
  loading: boolean;
}

export function CommunicationTimeline({ activity, loading }: CommunicationTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No activity yet
      </div>
    );
  }

  const getIcon = (item: Activity) => {
    if (item.type === 'communication') {
      switch (item.channel) {
        case 'email': return <Mail size={14} />;
        case 'sms': return <MessageSquare size={14} />;
        case 'whatsapp': return <MessageSquare size={14} />;
        case 'phone': return <Phone size={14} />;
      }
    }
    if (item.type === 'event_attendance') {
      return <CheckCircle2 size={14} />;
    }
    if (item.type === 'stage_change') {
      return <ArrowUpRight size={14} />;
    }
    return null;
  };

  const getIconColor = (item: Activity) => {
    if (item.type === 'communication') {
      return 'bg-blue-100 text-blue-600';
    }
    if (item.type === 'event_attendance') {
      return 'bg-green-100 text-green-600';
    }
    if (item.type === 'stage_change') {
      return 'bg-orange-100 text-orange-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const getDescription = (item: Activity) => {
    if (item.type === 'communication') {
      const channelName = item.channel?.toUpperCase();
      const directionIcon = item.direction === 'outbound' ? '→' : '←';
      return `${directionIcon} ${channelName}: ${item.summary}`;
    }
    if (item.type === 'event_attendance') {
      return `✓ Attended: ${item.eventName}`;
    }
    if (item.type === 'stage_change') {
      return `↗️ Stage Change: ${item.fromStage} → ${item.toStage}`;
    }
    return 'Unknown activity';
  };

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(item)}`}>
            {getIcon(item)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {getDescription(item)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.timestamp && format(item.timestamp.toDate(), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Install date-fns**

Run: `npm install date-fns`

Expected: "added 1 package"

**Step 3: Commit component**

```bash
git add src/components/CommunicationTimeline.tsx package.json package-lock.json
git commit -m "feat: add CommunicationTimeline component"
```

---

### Task 10: Create MessageComposer Component

**Files:**
- Create: `src/components/MessageComposer.tsx`

**Step 1: Write MessageComposer component**

Create `src/components/MessageComposer.tsx`:

```typescript
import { useState } from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { CommunicationType } from '@/types/enums';
import { MessageTemplate } from '@/types/models';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

interface MessageComposerProps {
  memberId: string;
  memberName: string;
  currentStage: string;
  onSend: (
    type: CommunicationType,
    message: string,
    sentVia: 'app' | 'manual',
    options?: { template?: string; subject?: string }
  ) => Promise<void>;
}

export function MessageComposer({
  memberId,
  memberName,
  currentStage,
  onSend
}: MessageComposerProps) {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationType>(CommunicationType.SMS);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { templates, substituteVariables } = useMessageTemplates(selectedChannel, currentStage);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (!templateId) {
      setMessage('');
      setSubject('');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Substitute variables
      const variables = {
        firstName: memberName.split(' ')[0],
        lastName: memberName.split(' ')[1] || '',
        stageName: currentStage,
        nextEventDate: 'TBD',
        staffName: 'Staff' // TODO: Get from auth context
      };

      const substituted = substituteVariables(template.body, variables);
      setMessage(substituted);

      if (template.subject) {
        setSubject(substituteVariables(template.subject, variables));
      }
    }
  };

  const handleSend = async (sentVia: 'app' | 'manual') => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSend(selectedChannel, message, sentVia, {
        template: selectedTemplateId || undefined,
        subject: selectedChannel === CommunicationType.EMAIL ? subject : undefined
      });

      // Reset form
      setMessage('');
      setSubject('');
      setSelectedTemplateId('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const channels = [
    { type: CommunicationType.SMS, label: 'SMS', icon: MessageSquare },
    { type: CommunicationType.EMAIL, label: 'Email', icon: Mail },
    { type: CommunicationType.WHATSAPP, label: 'WhatsApp', icon: MessageSquare },
    { type: CommunicationType.PHONE, label: 'Phone Log', icon: Phone },
  ];

  return (
    <div className="space-y-4">
      {/* Channel Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {channels.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setSelectedChannel(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChannel === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template (optional)
        </label>
        <select
          value={selectedTemplateId}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        >
          <option value="">-- Select template or write custom message --</option>
          {templates
            .filter(t => t.category === 'stage_default')
            .map(template => (
              <option key={template.id} value={template.id}>
                {template.name} (Stage Default)
              </option>
            ))}
          {templates.filter(t => t.category === 'stage_default').length > 0 &&
           templates.filter(t => t.category === 'custom').length > 0 && (
            <option disabled>──────────</option>
          )}
          {templates
            .filter(t => t.category === 'custom')
            .map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
        </select>
      </div>

      {/* Subject (Email only) */}
      {selectedChannel === CommunicationType.EMAIL && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Email subject..."
          />
        </div>
      )}

      {/* Message Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
          placeholder="Type your message here..."
        />
        {selectedChannel === CommunicationType.SMS && message.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {message.length} characters ({Math.ceil(message.length / 160)} SMS segment{message.length > 160 ? 's' : ''})
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSend('app')}
          disabled={!message.trim() || sending}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {sending ? 'Sending...' : 'Send via App'}
        </button>
        <button
          onClick={() => handleSend('manual')}
          disabled={!message.trim() || sending}
          className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border border-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Mark as Sent Manually
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit component**

```bash
git add src/components/MessageComposer.tsx
git commit -m "feat: add MessageComposer component with template support"
```

---

### Task 11: Create PersonDetailPanel Component

**Files:**
- Create: `src/components/PersonDetailPanel.tsx`

**Step 1: Write PersonDetailPanel component**

Create `src/components/PersonDetailPanel.tsx`:

```typescript
import { X, User } from 'lucide-react';
import { useState } from 'react';
import { doc, runTransaction, Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Member } from '@/types/models';
import { useStageProgress } from '@/hooks/useStageProgress';
import { useCommunications } from '@/hooks/useCommunications';
import { useMemberActivity } from '@/hooks/useMemberActivity';
import { StageProgressCard } from './StageProgressCard';
import { CommunicationTimeline } from './CommunicationTimeline';
import { MessageComposer } from './MessageComposer';
import { CommunicationType } from '@/types/enums';

interface PersonDetailPanelProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonDetailPanel({ member, isOpen, onClose }: PersonDetailPanelProps) {
  const [processing, setProcessing] = useState(false);

  const { progress, loading: progressLoading } = useStageProgress(
    member?.id || '',
    member?.currentStage || ''
  );

  const { sendCommunication } = useCommunications(member?.id || '');
  const { activity, loading: activityLoading } = useMemberActivity(member?.id || '');

  if (!isOpen || !member) return null;

  const handleAdvanceStage = async () => {
    if (!progress.nextStage || !member) return;

    setProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, 'members', member.id);
        const memberDoc = await transaction.get(memberRef);

        if (!memberDoc.exists()) {
          throw new Error('Member not found');
        }

        // Check if stage hasn't changed
        if (memberDoc.data().currentStage !== member.currentStage) {
          throw new Error('Stage was already changed by someone else');
        }

        // Update member stage
        transaction.update(memberRef, {
          currentStage: progress.nextStage,
          updatedAt: Timestamp.now()
        });
      });

      // Create activity entry for stage change
      await addDoc(collection(db, `members/${member.id}/activity`), {
        type: 'stage_change',
        timestamp: Timestamp.now(),
        fromStage: member.currentStage,
        toStage: progress.nextStage,
        triggeredBy: 'auto',
        approvedBy: 'current-user' // TODO: Get from auth context
      });

      alert(`Successfully advanced to ${progress.nextStage}!`);
      onClose();
    } catch (error: any) {
      console.error('Error advancing stage:', error);
      if (error.message.includes('already changed')) {
        alert('This person was already advanced by someone else.');
      } else {
        alert('Failed to advance stage. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = () => {
    // TODO: Optionally log dismissal reason
    alert('Suggestion dismissed');
  };

  const handleSendMessage = async (
    type: CommunicationType,
    message: string,
    sentVia: 'app' | 'manual',
    options?: { template?: string; subject?: string }
  ) => {
    await sendCommunication(
      type,
      message,
      'current-user', // TODO: Get from auth context
      sentVia,
      {
        template: options?.template || null,
        subject: options?.subject
      }
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-sm text-gray-600">
                {member.currentStage} • Joined {member.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stage Progress Card */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Current Stage: {member.currentStage}
            </h3>
            <StageProgressCard
              progress={progress}
              loading={progressLoading}
              onAdvance={handleAdvanceStage}
              onDismiss={handleDismiss}
            />
          </div>

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Activity Timeline
            </h3>
            <CommunicationTimeline
              activity={activity}
              loading={activityLoading}
            />
          </div>

          {/* Message Composer */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Send Message
            </h3>
            <MessageComposer
              memberId={member.id}
              memberName={member.name}
              currentStage={member.currentStage}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
```

**Step 2: Add slide-in animation to tailwind.config.js**

Add this to the `extend` section in `tailwind.config.js`:

```javascript
animation: {
  'slide-in-right': 'slideInRight 0.3s ease-out',
},
keyframes: {
  slideInRight: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
},
```

**Step 3: Commit component**

```bash
git add src/components/PersonDetailPanel.tsx tailwind.config.js
git commit -m "feat: add PersonDetailPanel component"
```

---

## Phase 4: Integration with Existing Pages

### Task 12: Update People Page

**Files:**
- Modify: `src/pages/People.tsx`

**Step 1: Add PersonDetailPanel to People page**

At the top of the file, import the new component:

```typescript
import { PersonDetailPanel } from '@/components/PersonDetailPanel';
```

Add state for selected member:

```typescript
const [selectedMember, setSelectedMember] = useState<Member | null>(null);
```

Add the panel before the closing `</div>`:

```typescript
<PersonDetailPanel
  member={selectedMember}
  isOpen={selectedMember !== null}
  onClose={() => setSelectedMember(null)}
/>
```

Update the table row click handler to open the panel. Find the table row and add:

```typescript
onClick={() => setSelectedMember(person)}
className="cursor-pointer hover:bg-gray-50 transition-colors"
```

**Step 2: Test the integration**

Run: `npm run dev`

Navigate to People page, click on a person row
Expected: Panel slides in from right with person details

**Step 3: Commit integration**

```bash
git add src/pages/People.tsx
git commit -m "feat: integrate PersonDetailPanel with People page"
```

---

### Task 13: Update Pipeline Page

**Files:**
- Modify: `src/pages/Pipeline.tsx`

**Step 1: Read current Pipeline page**

Run: `cat src/pages/Pipeline.tsx` (to understand current structure)

**Step 2: Add PersonDetailPanel to Pipeline page**

Import the component and add the same state/panel as People page:

```typescript
import { PersonDetailPanel } from '@/components/PersonDetailPanel';

// Inside component:
const [selectedMember, setSelectedMember] = useState<Member | null>(null);

// Add click handler to person cards in Pipeline:
onClick={() => setSelectedMember(person)}
className="cursor-pointer"

// Add panel before closing </div>:
<PersonDetailPanel
  member={selectedMember}
  isOpen={selectedMember !== null}
  onClose={() => setSelectedMember(null)}
/>
```

**Step 3: Test the integration**

Navigate to Pipeline page, click on a person card
Expected: Panel slides in from right with person details

**Step 4: Commit integration**

```bash
git add src/pages/Pipeline.tsx
git commit -m "feat: integrate PersonDetailPanel with Pipeline page"
```

---

## Phase 5: Testing & Verification

### Task 14: Create Test Data

**Files:**
- Create: `src/scripts/seedTestActivity.ts`

**Step 1: Write test data seed script**

Create `src/scripts/seedTestActivity.ts`:

```typescript
import { collection, addDoc, getDocs, query, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

export async function seedTestActivity() {
  console.log('Seeding test activity data...');

  // Get first member
  const membersSnapshot = await getDocs(query(collection(db, 'members'), limit(1)));

  if (membersSnapshot.empty) {
    console.error('No members found. Run seed script first.');
    return;
  }

  const memberId = membersSnapshot.docs[0].id;
  console.log(`Using member: ${memberId}`);

  // Seed event attendance activities
  const activities = [
    {
      type: 'event_attendance',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      eventId: 'event-1',
      eventType: 'sunday',
      eventName: 'Sunday Service - Nov 24'
    },
    {
      type: 'event_attendance',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
      eventId: 'event-2',
      eventType: 'sunday',
      eventName: 'Sunday Service - Nov 17'
    },
    {
      type: 'event_attendance',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)),
      eventId: 'event-3',
      eventType: 'sunday',
      eventName: 'Sunday Service - Nov 10'
    },
    {
      type: 'event_attendance',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
      eventId: 'event-4',
      eventType: 'tent',
      eventName: 'Newcomers Tent - Nov 21'
    }
  ];

  for (const activity of activities) {
    await addDoc(collection(db, `members/${memberId}/activity`), activity);
    console.log(`✓ Created activity: ${activity.eventName}`);
  }

  console.log('✅ Test activity data seeded successfully!');
  console.log(`Member ${memberId} should now be ready to advance stages.`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestActivity()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding test data:', error);
      process.exit(1);
    });
}
```

**Step 2: Add script to package.json**

```json
"scripts": {
  "seed:test-activity": "tsx src/scripts/seedTestActivity.ts"
}
```

**Step 3: Run test seed**

Run: `npm run seed:test-activity`

Expected: "✅ Test activity data seeded successfully!"

**Step 4: Commit seed script**

```bash
git add src/scripts/seedTestActivity.ts package.json
git commit -m "test: add test activity seed script"
```

---

### Task 15: Manual Testing Checklist

**Manual Tests to Run:**

**Step 1: Test Stage Progress Display**

1. Navigate to People page
2. Click on a person who has test activity data
3. Verify panel opens with:
   - Stage progress card showing trigger status
   - Green "Ready to advance" if all triggers met
   - Progress bars if triggers partially met

**Step 2: Test Stage Advancement**

1. Click "Advance Stage" button on ready member
2. Verify transaction succeeds
3. Check that:
   - Member's currentStage updated
   - Activity entry created in sub-collection
   - Panel closes or shows new stage

**Step 3: Test Message Templates**

1. Open person detail panel
2. Select different message channels (SMS, Email, WhatsApp, Phone)
3. Select a template from dropdown
4. Verify:
   - Template body loads with substituted variables
   - Email shows subject field
   - SMS shows character count

**Step 4: Test Communication Sending**

1. Write a custom message
2. Click "Mark as Sent Manually"
3. Verify:
   - Communication created in Firestore
   - Activity entry created
   - Timeline updates with new communication
   - Form resets

**Step 5: Test Timeline Display**

1. Open person with multiple activities
2. Verify timeline shows:
   - Event attendances
   - Stage changes
   - Communications
   - Correct timestamps and icons
   - Sorted by most recent first

**Step 6: Test Error Handling**

1. Try advancing member twice simultaneously (open two panels)
2. Verify race condition handled with error message
3. Try sending message with empty body
4. Verify button disabled

**Step 7: Commit verification notes**

```bash
git add -A
git commit -m "test: manual testing complete"
```

---

## Phase 6: Documentation & Cleanup

### Task 16: Update README

**Files:**
- Modify: `README.md`

**Step 1: Add feature documentation**

Add this section to README.md under "Features":

```markdown
### Stage Progression & Communication

- **Automatic Stage Triggers**: System evaluates event attendance and suggests when members are ready to advance stages
- **Pastoral Oversight**: Staff reviews and approves all stage advancements
- **Multi-Channel Communication**: Track SMS, Email, WhatsApp, and phone communications
- **Message Templates**: Use stage-specific templates with variable substitution
- **Activity Timeline**: Comprehensive history of events, stage changes, and communications

**Setup:**
```bash
# Seed stage triggers and message templates
npm run seed:stage-progression

# (Optional) Seed test activity data
npm run seed:test-activity
```

**Usage:**
- Navigate to People or Pipeline page
- Click on any person to open detail panel
- View stage progress and advancement suggestions
- Send messages using templates or custom content
- Track all interactions in the timeline
```

**Step 2: Commit README update**

```bash
git add README.md
git commit -m "docs: document stage progression and communication features"
```

---

### Task 17: Final Build & Verification

**Files:**
- None (build verification)

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 2: Run production build**

Run: `npm run build`

Expected: "✓ built in XXs" with no errors

**Step 3: Commit any fixes**

If any errors found, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve build errors"
```

---

## Summary

This implementation adds comprehensive stage progression and multi-channel communication tracking to Pathways:

**New Collections:**
- `communications` - Track all messages sent to members
- `stage_triggers` - Define automatic progression rules
- `message_templates` - Reusable message templates
- `members/{id}/activity` - Timeline of all member activity

**New Components:**
- `PersonDetailPanel` - Main slide-in panel (used in People & Pipeline pages)
- `StageProgressCard` - Shows trigger status and advancement UI
- `CommunicationTimeline` - Activity history with icons
- `MessageComposer` - Send messages with template support

**New Hooks:**
- `useStageProgress` - Real-time trigger evaluation
- `useCommunications` - Send and track messages
- `useMessageTemplates` - Load templates with variable substitution
- `useMemberActivity` - Timeline data

**Key Features:**
- Automatic trigger suggestions with staff approval
- Transaction-based stage updates (prevents race conditions)
- Variable substitution in templates ({firstName}, {stageName}, etc.)
- Hybrid communication (track all, integrate sending later)
- Comprehensive activity timeline

**Testing:**
- Manual testing checklist completed
- Production build verified
- Security rules deployed

**Next Steps:**
- Integrate real SMS/Email APIs (Twilio, SendGrid)
- Add admin UI for managing triggers and templates
- Implement bulk messaging
- Add analytics dashboard
