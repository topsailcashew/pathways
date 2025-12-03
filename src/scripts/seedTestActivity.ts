import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit, Timestamp } from 'firebase/firestore';

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

export async function seedTestActivity() {
  console.log('Seeding test activity data...');

  // Get first member
  const membersSnapshot = await getDocs(query(collection(db, 'members'), limit(1)));

  if (membersSnapshot.empty) {
    console.error('No members found. Run seed script first.');
    return;
  }

  const memberId = membersSnapshot.docs[0].id;
  const memberName = membersSnapshot.docs[0].data().name;
  console.log(`Using member: ${memberName} (${memberId})`);

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
  console.log(`Member ${memberName} (${memberId}) should now be ready to advance stages.`);
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
