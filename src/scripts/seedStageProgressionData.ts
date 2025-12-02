import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Stage } from '@/types/enums';

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

export async function seedStageProgressionData() {
  console.log('Seeding stage progression data...');

  try {
    // Seed stage triggers
    const triggers = [
      {
        stageId: Stage.SUNDAY_EXPERIENCE,
        nextStageId: Stage.NEWCOMERS_TENT,
        triggers: [
          { type: 'event_attendance' as const, eventType: 'sunday' as const, count: 1 }
        ],
        createdAt: Timestamp.now()
      },
      {
        stageId: Stage.NEWCOMERS_TENT,
        nextStageId: Stage.NEWCOMERS_LUNCH,
        triggers: [
          { type: 'event_attendance' as const, eventType: 'sunday' as const, count: 3 },
          { type: 'event_attendance' as const, eventType: 'tent' as const, count: 1 }
        ],
        createdAt: Timestamp.now()
      },
      {
        stageId: Stage.NEWCOMERS_LUNCH,
        nextStageId: Stage.GROWTH_TRACK,
        triggers: [
          { type: 'event_attendance' as const, eventType: 'lunch' as const, count: 1 }
        ],
        createdAt: Timestamp.now()
      }
    ];

    for (const trigger of triggers) {
      try {
        const docRef = await addDoc(collection(db, 'stage_triggers'), trigger);
        console.log(`✓ Created trigger: ${trigger.stageId} → ${trigger.nextStageId}`);
      } catch (error: any) {
        console.error(`Failed to create trigger ${trigger.stageId} → ${trigger.nextStageId}:`);
        console.error('Error details:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error seeding stage triggers:', error);
    throw error;
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
