import { Timestamp } from 'firebase/firestore';
import { Track, TaskStatus, CommunicationType, RosterStatus } from './enums';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  track: Track;
  currentStage: string;
  tags: string[];
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    source?: string;
    assignedTo?: string;
  };
}

export interface Task {
  id: string;
  memberId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

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

export interface Event {
  id: string;
  name: string;
  type: string;
  date: Timestamp;
  qrCode: string;
  attendees: string[];
}

export interface ConnectGroup {
  id: string;
  name: string;
  location: string;
  leaderId: string;
  members: string[];
  prayerRequests: PrayerRequest[];
}

export interface PrayerRequest {
  request: string;
  date: Timestamp;
  member: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: {
    stage: string;
    track: Track;
  };
  action: {
    type: CommunicationType;
    template: string;
  };
  active: boolean;
  runCount: number;
}

export interface Ministry {
  id: string;
  name: string;
  roster: RosterSlot[];
}

export interface RosterSlot {
  date: string;
  role: string;
  memberId?: string;
  status: RosterStatus;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

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
