import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import {
  INITIAL_MEMBERS,
  INITIAL_TASKS,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_WORKFLOWS,
  INITIAL_ROSTER,
  MINISTRIES,
} from '../data/mockData.js';
import { Track, TaskStatus, RosterStatus, CommunicationType } from '../types/enums.js';
import { Stage } from '../types/enums.js';
import type { Member, Task, Event, ConnectGroup, Workflow, Ministry } from '../types/models.js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Stage mapping from old IDs to new Stage enum
const STAGE_MAP: Record<string, Stage> = {
  'sunday_nc': Stage.SUNDAY_EXPERIENCE,
  'tent': Stage.NEWCOMERS_TENT,
  'lunch': Stage.NEWCOMERS_LUNCH,
  'social': Stage.SOCIAL_GROUP,
  'sunday_nb': Stage.SUNDAY_EXPERIENCE,
  'card': Stage.SALVATION_CARD,
  'steps': Stage.NEXT_STEPS,
  'baptism': Stage.BAPTISM,
  'connect': Stage.CONNECT_GROUPS,
  'growth': Stage.GROWTH_TRACK,
  'serve': Stage.SERVE,
};

// Track mapping
const TRACK_MAP: Record<string, Track> = {
  'newcomer': Track.NEWCOMER,
  'believer': Track.NEW_BELIEVER,
};

// Transform members
function transformMembers(): Omit<Member, 'id'>[] {
  return INITIAL_MEMBERS.map((member) => {
    const now = Timestamp.now();
    return {
      name: member.name,
      email: member.email,
      phone: member.phone,
      track: TRACK_MAP[member.type] || Track.NEWCOMER,
      currentStage: STAGE_MAP[member.stage] || Stage.SUNDAY_EXPERIENCE,
      tags: member.tags || [],
      notes: '',
      createdAt: now,
      updatedAt: now,
      metadata: {
        source: 'seed-script',
      },
    };
  });
}

// Transform tasks
function transformTasks(memberIdMap: Map<number, string>): Omit<Task, 'id'>[] {
  const allTasks: Omit<Task, 'id'>[] = [];

  // Tasks from INITIAL_TASKS
  INITIAL_TASKS.forEach((task) => {
    const firestoreMemberId = memberIdMap.get(task.memberId);
    if (firestoreMemberId) {
      allTasks.push({
        memberId: firestoreMemberId,
        title: task.title,
        description: `${task.type} task`,
        status: task.status === 'overdue' ? TaskStatus.PENDING :
                task.status === 'completed' ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        createdBy: 'system',
        createdAt: Timestamp.now(),
      });
    }
  });

  // Tasks from members
  INITIAL_MEMBERS.forEach((member) => {
    const firestoreMemberId = memberIdMap.get(member.id);
    if (firestoreMemberId && member.tasks && member.tasks.length > 0) {
      member.tasks.forEach((task) => {
        allTasks.push({
          memberId: firestoreMemberId,
          title: task.title,
          description: '',
          status: task.completed ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          createdBy: 'system',
          createdAt: Timestamp.now(),
        });
      });
    }
  });

  return allTasks;
}

// Transform events
function transformEvents(): Omit<Event, 'id'>[] {
  return INITIAL_EVENTS.map((event) => ({
    name: event.name,
    type: 'general',
    date: Timestamp.now(), // Using current time for demo
    qrCode: `qr-${event.id}`,
    attendees: [],
  }));
}

// Transform connect groups
function transformConnectGroups(): Omit<ConnectGroup, 'id'>[] {
  return INITIAL_GROUPS.map((group) => ({
    name: group.name,
    location: group.name, // Using name as location
    leaderId: '', // Empty for now
    members: [],
    prayerRequests: [],
  }));
}

// Transform workflows
function transformWorkflows(): Omit<Workflow, 'id'>[] {
  return INITIAL_WORKFLOWS.map((workflow) => ({
    name: workflow.name,
    trigger: {
      stage: Stage.SALVATION_CARD,
      track: Track.NEW_BELIEVER,
    },
    action: {
      type: CommunicationType.SMS,
      template: `Automated message for ${workflow.name}`,
    },
    active: workflow.active,
    runCount: workflow.runs,
  }));
}

// Transform ministries
function transformMinistries(): Omit<Ministry, 'id'>[] {
  // Group roster by ministry
  const ministryMap = new Map<string, typeof INITIAL_ROSTER>();

  INITIAL_ROSTER.forEach((slot) => {
    if (!ministryMap.has(slot.ministry)) {
      ministryMap.set(slot.ministry, []);
    }
    ministryMap.get(slot.ministry)!.push(slot);
  });

  const ministries: Omit<Ministry, 'id'>[] = [];

  // Create ministries from MINISTRIES list
  MINISTRIES.forEach((ministryName) => {
    const rosterSlots = ministryMap.get(ministryName) || [];

    ministries.push({
      name: ministryName,
      roster: rosterSlots.map((slot) => {
        const rosterSlot: any = {
          date: new Date().toISOString().split('T')[0], // Today's date
          role: slot.role,
          status: (slot.status.toUpperCase() as keyof typeof RosterStatus) in RosterStatus
            ? RosterStatus[slot.status.toUpperCase() as keyof typeof RosterStatus]
            : RosterStatus.EMPTY,
        };
        // Only include memberId if it exists (Firestore doesn't allow undefined)
        if (slot.person) {
          rosterSlot.memberId = slot.person;
        }
        return rosterSlot;
      }),
    });
  });

  return ministries;
}

// Seed the database
async function seedDatabase() {
  console.log('Starting database seed...\n');

  try {
    // Map to store old member IDs to new Firestore IDs
    const memberIdMap = new Map<number, string>();

    // 1. Seed Members
    console.log('Seeding members...');
    const members = transformMembers();
    const memberPromises = members.map(async (member, index) => {
      const docRef = await addDoc(collection(db, 'members'), member);
      const initialMember = INITIAL_MEMBERS[index];
      if (initialMember) {
        memberIdMap.set(initialMember.id, docRef.id);
      }
      return docRef.id;
    });
    const memberIds = await Promise.all(memberPromises);
    console.log(`✓ Created ${memberIds.length} members\n`);

    // 2. Seed Tasks
    console.log('Seeding tasks...');
    const tasks = transformTasks(memberIdMap);
    const taskPromises = tasks.map((task) => addDoc(collection(db, 'tasks'), task));
    const taskRefs = await Promise.all(taskPromises);
    console.log(`✓ Created ${taskRefs.length} tasks\n`);

    // 3. Seed Events
    console.log('Seeding events...');
    const events = transformEvents();
    const eventPromises = events.map((event) => addDoc(collection(db, 'events'), event));
    const eventRefs = await Promise.all(eventPromises);
    console.log(`✓ Created ${eventRefs.length} events\n`);

    // 4. Seed Connect Groups
    console.log('Seeding connect groups...');
    const groups = transformConnectGroups();
    const groupPromises = groups.map((group) => addDoc(collection(db, 'connectGroups'), group));
    const groupRefs = await Promise.all(groupPromises);
    console.log(`✓ Created ${groupRefs.length} connect groups\n`);

    // 5. Seed Workflows
    console.log('Seeding workflows...');
    const workflows = transformWorkflows();
    const workflowPromises = workflows.map((workflow) => addDoc(collection(db, 'workflows'), workflow));
    const workflowRefs = await Promise.all(workflowPromises);
    console.log(`✓ Created ${workflowRefs.length} workflows\n`);

    // 6. Seed Ministries
    console.log('Seeding ministries...');
    const ministries = transformMinistries();
    const ministryPromises = ministries.map((ministry) => addDoc(collection(db, 'ministries'), ministry));
    const ministryRefs = await Promise.all(ministryPromises);
    console.log(`✓ Created ${ministryRefs.length} ministries\n`);

    console.log('Database seeding complete!');
    console.log('\nSummary:');
    console.log(`  Members: ${memberIds.length}`);
    console.log(`  Tasks: ${taskRefs.length}`);
    console.log(`  Events: ${eventRefs.length}`);
    console.log(`  Connect Groups: ${groupRefs.length}`);
    console.log(`  Workflows: ${workflowRefs.length}`);
    console.log(`  Ministries: ${ministryRefs.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\nSeed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
