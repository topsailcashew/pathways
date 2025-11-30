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
  content: string;
  sentAt: Timestamp;
  sentBy: string;
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
