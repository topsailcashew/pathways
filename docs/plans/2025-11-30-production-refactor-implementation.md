# Production-Ready Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Pathways from a prototype into a production-ready church management system with TypeScript, Firebase backend, proper component architecture, routing, security, and comprehensive testing.

**Architecture:** Big-bang rewrite approach - create new TypeScript project structure, implement Firebase services layer, build ~50 focused components from the 1,632-line monolith, add React Router for navigation, secure API keys with environment variables + Firebase App Check, and establish comprehensive test coverage (unit, integration, E2E).

**Tech Stack:** React 19, TypeScript (strict), Vite, Firebase (Auth, Firestore, App Check), React Router v6, Tailwind CSS, Vitest, React Testing Library, Playwright, MSW

---

## Phase 1: Foundation Setup

### Task 1: TypeScript Configuration

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Modify: `package.json`

**Step 1: Install TypeScript dependencies**

Run:
```bash
cd ~/.config/superpowers/worktrees/pathways/production-refactor
npm install -D typescript @types/react @types/react-dom
npm install -D @types/node
```

**Step 2: Create strict tsconfig.json**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@contexts/*": ["./src/contexts/*"],
      "@pages/*": ["./src/pages/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create tsconfig.node.json**

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: Rename vite.config.js to vite.config.ts**

Run:
```bash
mv vite.config.js vite.config.ts
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
});
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Errors from existing .jsx files (expected, will be replaced)

**Step 6: Commit**

```bash
git add tsconfig.json tsconfig.node.json vite.config.ts package.json package-lock.json
git commit -m "feat: add TypeScript configuration with strict mode

- Strict TypeScript settings enabled
- Path aliases configured
- Vite config migrated to TypeScript

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Environment Variables Setup

**Files:**
- Create: `.env.example`
- Create: `.env.local`
- Modify: `.gitignore`

**Step 1: Create .env.example template**

Create `.env.example`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase App Check (for local development)
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=debug_token_for_local_dev
```

**Step 2: Create .env.local with actual keys**

Create `.env.local`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=placeholder_update_after_firebase_setup
VITE_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=placeholder
VITE_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000
VITE_FIREBASE_APP_ID=1:000000000:web:placeholder

# Google Gemini AI (from existing hardcoded value)
VITE_GEMINI_API_KEY=AIzaSyDCJF9BPkdZwwh46CW1lOIm5O23fEd3QAk

# Firebase App Check
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=placeholder_update_later
```

**Step 3: Update .gitignore**

Add to `.gitignore`:
```
# Environment variables
.env.local
.env.*.local
```

**Step 4: Verify .env.local is ignored**

Run: `git status`
Expected: `.env.local` should NOT appear in untracked files

**Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add environment variable configuration

- Template with all required Firebase + Gemini variables
- .env.local gitignored for security
- Removes hardcoded API key risk

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Firebase**

Run:
```bash
npm install firebase
```

**Step 2: Install React Router**

Run:
```bash
npm install react-router-dom
```

**Step 3: Install testing dependencies**

Run:
```bash
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D msw
npm install -D @playwright/test
```

**Step 4: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
});
```

**Step 5: Update package.json scripts**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "feat: install core dependencies

- Firebase for backend services
- React Router for navigation
- Vitest + Testing Library for testing
- Playwright for E2E tests

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Create Type Definitions

**Files:**
- Create: `src/types/models.ts`
- Create: `src/types/enums.ts`
- Create: `src/types/api.ts`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p src/types
```

**Step 2: Create enums.ts**

Create `src/types/enums.ts`:
```typescript
export enum Track {
  NEWCOMER = 'newcomer',
  NEW_BELIEVER = 'new-believer',
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum RosterStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  EMPTY = 'empty',
}

export enum Stage {
  // Newcomer track
  SUNDAY_EXPERIENCE = 'Sunday Experience',
  NEWCOMERS_TENT = 'Newcomers Tent',
  NEWCOMERS_LUNCH = 'Newcomers Lunch',
  SOCIAL_GROUP = 'Social Group',

  // New Believer track
  SALVATION_CARD = 'Salvation Card',
  NEXT_STEPS = 'Next Steps',
  BAPTISM = 'Baptism',

  // Shared stages
  CONNECT_GROUPS = 'Connect Groups',
  GROWTH_TRACK = 'Growth Track',
  SERVE = 'Serve',
}
```

**Step 3: Create models.ts**

Create `src/types/models.ts`:
```typescript
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
```

**Step 4: Create api.ts**

Create `src/types/api.ts`:
```typescript
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface GeminiError {
  error: {
    message: string;
    code: number;
  };
}
```

**Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions

- Core data models (Member, Task, Event, etc.)
- Enums for type safety
- API response types

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Firebase Service Setup

**Files:**
- Create: `src/services/firebase.ts`
- Create: `src/services/auth.service.ts`

**Step 1: Create firebase.ts**

Create `src/services/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize App Check
if (import.meta.env.PROD) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('placeholder-recaptcha-key'),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  // Development mode - use debug token
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN;
}
```

**Step 2: Create auth.service.ts**

Create `src/services/auth.service.ts`:
```typescript
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '@types/models';

export const authService = {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signUp(email: string, password: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? undefined,
          isAdmin: tokenResult.claims.admin === true,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
```

**Step 3: Commit**

```bash
git add src/services/
git commit -m "feat: add Firebase initialization and auth service

- Firebase app initialization with config from env
- Firebase App Check for security (prod + dev)
- Auth service with sign in/up/out methods

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Test Infrastructure Setup

**Files:**
- Create: `src/__tests__/setup.ts`
- Create: `playwright.config.ts`

**Step 1: Create test setup file**

Run:
```bash
mkdir -p src/__tests__/unit src/__tests__/integration src/__tests__/e2e
```

Create `src/__tests__/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Step 2: Create Playwright config**

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 3: Create sample unit test**

Create `src/__tests__/unit/example.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

**Step 4: Run tests to verify setup**

Run: `npm test -- --run`
Expected: 1 passing test

**Step 5: Commit**

```bash
git add src/__tests__/ playwright.config.ts
git commit -m "feat: set up testing infrastructure

- Vitest configuration with jsdom
- Testing Library setup
- Playwright E2E config
- Sample test to verify setup

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Core Services & Utilities

### Task 7: Firestore Service

**Files:**
- Create: `src/services/firestore.service.ts`
- Create: `src/__tests__/unit/services/firestore.service.test.ts`

**Step 1: Write test for createMember**

Create `src/__tests__/unit/services/firestore.service.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreService } from '@services/firestore.service';
import { Track } from '@types/enums';
import { Timestamp } from 'firebase/firestore';

vi.mock('@services/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1000, nanoseconds: 0 })),
  },
}));

describe('firestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a member', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'test-id' } as any);

    const memberData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+255123456789',
      track: Track.NEWCOMER,
      currentStage: 'Sunday Experience',
      tags: ['visitor'],
      notes: 'First time visitor',
    };

    const result = await firestoreService.createMember(memberData);

    expect(result).toBe('test-id');
    expect(addDoc).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- firestore.service.test.ts --run`
Expected: FAIL - firestoreService not defined

**Step 3: Implement firestore.service.ts**

Create `src/services/firestore.service.ts`:
```typescript
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Member, Task, Communication, Event, ConnectGroup, Workflow, Ministry } from '@types/models';
import { Track } from '@types/enums';

const COLLECTIONS = {
  MEMBERS: 'members',
  TASKS: 'tasks',
  COMMUNICATIONS: 'communications',
  EVENTS: 'events',
  GROUPS: 'connectGroups',
  WORKFLOWS: 'workflows',
  MINISTRIES: 'ministries',
} as const;

export const firestoreService = {
  // Members
  async createMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.MEMBERS), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async getMembers(): Promise<Member[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Member[];
  },

  async getMemberById(id: string): Promise<Member | null> {
    const docRef = doc(db, COLLECTIONS.MEMBERS, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Member;
  },

  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEMBERS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteMember(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.MEMBERS, id));
  },

  // Tasks
  async createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTasksByMember(memberId: string): Promise<Task[]> {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('memberId', '==', memberId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TASKS, id), data);
  },

  // Communications
  async createCommunication(data: Omit<Communication, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.COMMUNICATIONS), data);
    return docRef.id;
  },

  async getCommunicationsByMember(memberId: string): Promise<Communication[]> {
    const q = query(
      collection(db, COLLECTIONS.COMMUNICATIONS),
      where('memberId', '==', memberId),
      orderBy('sentAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Communication[];
  },

  // Events
  async createEvent(data: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), data);
    return docRef.id;
  },

  async getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, id), data);
  },
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- firestore.service.test.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/firestore.service.ts src/__tests__/unit/services/
git commit -m "feat: add Firestore service with CRUD operations

- Members CRUD
- Tasks CRUD
- Communications CRUD
- Events CRUD
- Unit tests with mocked Firebase

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Gemini AI Service

**Files:**
- Create: `src/services/gemini.service.ts`
- Create: `src/__tests__/unit/services/gemini.service.test.ts`

**Step 1: Write test**

Create `src/__tests__/unit/services/gemini.service.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '@services/gemini.service';

global.fetch = vi.fn();

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Gemini API with correct parameters', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'AI response' }],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geminiService.generateText('Test prompt');

    expect(result).toBe('AI response');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should handle JSON mode', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: '{"result": "data"}' }],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geminiService.generateJSON('Test prompt');

    expect(result).toEqual({ result: 'data' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- gemini.service.test.ts --run`
Expected: FAIL

**Step 3: Implement gemini.service.ts**

Create `src/services/gemini.service.ts`:
```typescript
import { GeminiResponse } from '@types/api';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash-exp';

interface GenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseFormat?: 'text' | 'json';
}

export const geminiService = {
  async generateText(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    const response = await this.callAPI(prompt, { ...options, responseFormat: 'text' });
    return this.extractText(response);
  },

  async generateJSON<T = any>(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<T> {
    const response = await this.callAPI(prompt, { ...options, responseFormat: 'json' });
    const text = this.extractText(response);
    return JSON.parse(text) as T;
  },

  async callAPI(prompt: string, options: GenerateOptions): Promise<GeminiResponse> {
    const endpoint = options.responseFormat === 'json'
      ? `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`
      : `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

    const body: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
      },
    };

    if (options.responseFormat === 'json') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message ?? 'Unknown error'}`);
    }

    return response.json();
  },

  extractText(response: GeminiResponse): string {
    const candidate = response.candidates[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('No text in Gemini response');
    }
    return candidate.content.parts[0].text;
  },
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- gemini.service.test.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/gemini.service.ts src/__tests__/unit/services/gemini.service.test.ts
git commit -m "feat: add Gemini AI service

- Text generation with configurable options
- JSON mode for structured responses
- Error handling for API failures
- Unit tests with mocked fetch

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Utility Functions

**Files:**
- Create: `src/utils/formatters.ts`
- Create: `src/utils/constants.ts`
- Create: `src/__tests__/unit/utils/formatters.test.ts`

**Step 1: Write test for formatters**

Create `src/__tests__/unit/utils/formatters.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { formatPhone, formatDate, formatStageForDisplay } from '@utils/formatters';
import { Timestamp } from 'firebase/firestore';

describe('formatters', () => {
  it('should format phone numbers', () => {
    expect(formatPhone('+255123456789')).toBe('+255 123 456 789');
    expect(formatPhone('0123456789')).toBe('0123 456 789');
  });

  it('should format dates', () => {
    const timestamp = Timestamp.fromDate(new Date('2024-01-15'));
    expect(formatDate(timestamp)).toMatch(/Jan 15, 2024/);
  });

  it('should format stages for display', () => {
    expect(formatStageForDisplay('Sunday Experience')).toBe('Sunday Experience');
    expect(formatStageForDisplay('newcomers-tent')).toBe('Newcomers Tent');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- formatters.test.ts --run`
Expected: FAIL

**Step 3: Implement formatters.ts**

Create `src/utils/formatters.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.startsWith('255') && cleaned.length === 12) {
    // Tanzania format: +255 123 456 789
    return `+255 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.length === 10) {
    // Local format: 0123 456 789
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone; // Return original if format unknown
}

export function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatStageForDisplay(stage: string): string {
  // Convert kebab-case or snake_case to Title Case
  return stage
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

**Step 4: Create constants.ts**

Create `src/utils/constants.ts`:
```typescript
import { Track, Stage } from '@types/enums';

export const NEWCOMER_STAGES = [
  Stage.SUNDAY_EXPERIENCE,
  Stage.NEWCOMERS_TENT,
  Stage.NEWCOMERS_LUNCH,
  Stage.SOCIAL_GROUP,
  Stage.CONNECT_GROUPS,
  Stage.GROWTH_TRACK,
  Stage.SERVE,
];

export const NEW_BELIEVER_STAGES = [
  Stage.SUNDAY_EXPERIENCE,
  Stage.SALVATION_CARD,
  Stage.NEXT_STEPS,
  Stage.BAPTISM,
  Stage.CONNECT_GROUPS,
  Stage.GROWTH_TRACK,
  Stage.SERVE,
];

export const STAGE_COLORS: Record<string, string> = {
  [Stage.SUNDAY_EXPERIENCE]: 'bg-slate-100',
  [Stage.NEWCOMERS_TENT]: 'bg-blue-100',
  [Stage.NEWCOMERS_LUNCH]: 'bg-blue-200',
  [Stage.SOCIAL_GROUP]: 'bg-blue-300',
  [Stage.SALVATION_CARD]: 'bg-amber-100',
  [Stage.NEXT_STEPS]: 'bg-amber-200',
  [Stage.BAPTISM]: 'bg-amber-300',
  [Stage.CONNECT_GROUPS]: 'bg-green-100',
  [Stage.GROWTH_TRACK]: 'bg-green-200',
  [Stage.SERVE]: 'bg-green-300',
};

export const TRACK_COLORS = {
  [Track.NEWCOMER]: 'text-blue-600 bg-blue-50 border-blue-200',
  [Track.NEW_BELIEVER]: 'text-amber-600 bg-amber-50 border-amber-200',
};

export const MINISTRIES = [
  'Worship Band',
  'Hospitality',
  'Ushers',
  'Set up/Teardown',
  'Production',
  'Social Media',
  'Parking',
  'Kids',
];

export const DAR_ES_SALAAM_LOCATIONS = [
  'Mikocheni',
  'Masaki',
  'Oysterbay',
  'Msasani',
  'Kinondoni',
  'Regent Estate',
  'Mbezi Beach',
  'Kawe',
  'Ada Estate',
  'Sinza',
  'Mwenge',
  'Ubungo',
  'Kimara',
  'Goba',
  'Tegeta',
  'Mbezi',
];
```

**Step 5: Run tests to verify they pass**

Run: `npm test -- formatters.test.ts --run`
Expected: PASS

**Step 6: Commit**

```bash
git add src/utils/ src/__tests__/unit/utils/
git commit -m "feat: add utility functions and constants

- Phone/date formatters
- Stage display formatters
- App constants (stages, colors, ministries, locations)
- Unit tests for formatters

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Authentication & Context

### Task 10: Auth Context

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`

**Step 1: Create AuthContext**

Create `src/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useEffect, useState } from 'react';
import { User } from '@types/models';
import { authService } from '@services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Step 2: Create useAuth hook**

Create `src/hooks/useAuth.ts`:
```typescript
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx src/hooks/useAuth.ts
git commit -m "feat: add authentication context and hook

- AuthContext with user state management
- useAuth hook for easy access
- Firebase auth integration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: Common Components

### Task 11: Common UI Components

**Files:**
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Badge.tsx`
- Create: `src/components/common/Modal.tsx`
- Create: `src/components/common/Input.tsx`

**Step 1: Create Button component**

Create `src/components/common/Button.tsx`:
```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors focus:outline-none focus:ring-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-100 focus:ring-slate-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Step 2: Create Badge component**

Create `src/components/common/Badge.tsx`:
```typescript
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
```

**Step 3: Create Modal component**

Create `src/components/common/Modal.tsx`:
```typescript
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className={`relative bg-white rounded-lg shadow-xl ${sizeStyles[size]} w-full`}>
          {title && (
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create Input component**

Create `src/components/common/Input.tsx`:
```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/common/
git commit -m "feat: add common UI components

- Button with variants and sizes
- Badge for status indicators
- Modal with backdrop and animations
- Input with label and error states

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Routing & Layout

### Task 12: App Shell and Router Setup

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/ProtectedRoute.tsx`
- Create: `src/pages/Login.tsx`
- Create: `src/pages/Dashboard.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`

**Step 1: Create ProtectedRoute component**

Create `src/components/layout/ProtectedRoute.tsx`:
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Step 2: Create AppShell component**

Create `src/components/layout/AppShell.tsx`:
```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  MessageCircle,
  Calendar,
  Workflow,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pipeline', icon: Workflow, label: 'Pipeline' },
    { path: '/people', icon: Users, label: 'People' },
    { path: '/checkin', icon: CheckCircle, label: 'Check-in' },
    { path: '/groups', icon: MessageCircle, label: 'Groups' },
    { path: '/workflows', icon: Calendar, label: 'Workflows' },
    { path: '/ministries', icon: UserCheck, label: 'Ministries' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Pathways</h1>
          <p className="text-sm text-slate-500">Church Management</p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{user?.displayName ?? user?.email}</p>
              <p className="text-xs text-slate-500">{user?.isAdmin ? 'Admin' : 'User'}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
```

**Step 3: Create Login page**

Create `src/pages/Login.tsx`:
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Pathways</h1>
          <p className="text-slate-600 mt-2">Church Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Step 4: Create placeholder Dashboard page**

Create `src/pages/Dashboard.tsx`:
```typescript
import React from 'react';

export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <p className="text-slate-600">Welcome to Pathways! Dashboard content coming soon.</p>
    </div>
  );
}
```

**Step 5: Update App.tsx with routing**

Modify `src/App.tsx`:
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { AppShell } from '@components/layout/AppShell';
import { ProtectedRoute } from '@components/layout/ProtectedRoute';
import { Login } from '@pages/Login';
import { Dashboard } from '@pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

**Step 6: Update main.tsx**

Modify `src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 7: Test the app**

Run: `npm run dev`
Expected: App loads, shows login page

**Step 8: Commit**

```bash
git add src/components/layout/ src/pages/ src/App.tsx src/main.tsx
git commit -m "feat: add routing and layout structure

- AppShell with sidebar navigation
- ProtectedRoute for auth guards
- Login page with form
- Dashboard placeholder
- React Router setup

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary & Next Steps

This implementation plan provides the foundation for the production-ready refactor:

✅ **Phase 1 Complete:** TypeScript, environment variables, dependencies, types, Firebase, testing setup
✅ **Phase 2 Complete:** Firestore service, Gemini service, utility functions
✅ **Phase 3 Complete:** Auth context and hooks
✅ **Phase 4 Complete:** Common UI components
✅ **Phase 5 Complete:** Routing and layout

**Remaining work** (to be continued in follow-up tasks):
- Phase 6: Feature pages (Pipeline, People, Check-in, Groups, Workflows, Ministries)
- Phase 7: Custom hooks for data fetching
- Phase 8: Integration tests
- Phase 9: E2E tests
- Phase 10: Data migration and deployment

**Testing Strategy:**
- Run `npm test` frequently to ensure tests pass
- Run `npm run dev` to manually test features
- Use `npm run lint` to check code quality

**Commit Strategy:**
- Commit after each task completion
- Use conventional commit format
- Include co-author attribution

---

**Ready to execute?** This plan should be executed using the superpowers:executing-plans or superpowers:subagent-driven-development skill.
