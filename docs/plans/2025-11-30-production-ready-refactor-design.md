# Production-Ready Refactor Design

**Date:** 2025-11-30
**Status:** Approved
**Approach:** Big-bang rewrite with clean architecture

## Overview

Transform the Pathways church management application from a prototype into a production-ready system with:
- **TypeScript strict mode** for type safety
- **Firebase backend** for data persistence, auth, and real-time updates
- **Component decomposition** from 1,632-line monolith to ~50 focused components
- **React Router** for proper navigation
- **Environment variables** for secure API key management
- **Comprehensive testing** (unit, integration, E2E)

## Goals & Constraints

### Primary Goal
Production-ready transformation - Deploy to real church users with confidence

### Key Constraints
- **Timeline:** Quality over speed - no hard deadline
- **Backend:** Firebase (managed services, minimal ops)
- **Security:** Environment variables + Firebase App Check
- **Type Safety:** Strict TypeScript from day one
- **Testing:** Full coverage - unit, integration, E2E

## Architecture

### Project Structure

```
pathways/
├── src/
│   ├── components/          # Reusable UI components (~50 total)
│   │   ├── common/          # Buttons, Badges, Modals, Forms
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── pipeline/        # Pipeline/Kanban components
│   │   ├── people/          # Member management components
│   │   ├── checkin/         # Event check-in components
│   │   ├── groups/          # Connect group components
│   │   ├── workflows/       # Automation components
│   │   └── ministries/      # Roster management components
│   ├── pages/               # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── Pipeline.tsx
│   │   ├── People.tsx
│   │   ├── CheckIn.tsx
│   │   ├── ConnectGroups.tsx
│   │   ├── GroupLeader.tsx
│   │   ├── Workflows.tsx
│   │   ├── Ministries.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── services/            # Firebase & API integration
│   │   ├── firebase.ts      # Firebase config & initialization
│   │   ├── auth.service.ts  # Authentication logic
│   │   ├── firestore.service.ts  # Database operations
│   │   ├── gemini.service.ts     # AI API calls
│   │   └── storage.service.ts    # File uploads
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication state
│   │   ├── useMembers.ts    # Member CRUD operations
│   │   ├── usePipeline.ts   # Pipeline state management
│   │   ├── useTasks.ts      # Task management
│   │   ├── useEvents.ts     # Event operations
│   │   └── useWorkflows.ts  # Workflow automation
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx  # Auth state & user info
│   │   └── DataContext.tsx  # Global app data
│   ├── types/               # TypeScript type definitions
│   │   ├── models.ts        # Data models (Member, Task, Event, etc.)
│   │   ├── api.ts           # API response types
│   │   └── enums.ts         # Enums and constants
│   ├── utils/               # Helper functions
│   │   ├── formatters.ts    # Date, phone, email formatters
│   │   ├── validators.ts    # Form validation
│   │   └── constants.ts     # App constants
│   ├── __tests__/           # Test files
│   │   ├── unit/            # Unit tests
│   │   ├── integration/     # Integration tests
│   │   ├── e2e/             # E2E tests
│   │   └── setup.ts         # Test configuration
│   ├── App.tsx              # Root app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles (Tailwind)
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── .env.example             # Environment variable template
├── .env.local               # Local secrets (gitignored)
├── tsconfig.json            # TypeScript strict config
├── vite.config.ts           # Vite with TS
├── vitest.config.ts         # Test configuration
├── playwright.config.ts     # E2E test configuration
└── package.json
```

### Architectural Patterns

1. **Feature-based component organization** - Components grouped by feature domain
2. **Service layer pattern** - All Firebase/API calls isolated in services
3. **Custom hooks for state** - Business logic in hooks, components stay presentational
4. **Context for global state** - Auth, theme, shared data via Context API
5. **Type-first development** - Define types before implementation

## Data Model & Firebase Schema

### Firestore Collections

#### Members Collection
```typescript
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  track: 'newcomer' | 'new-believer';
  currentStage: string;
  tags: string[];
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    source?: string;
    assignedTo?: string;
  };
}
```

#### Tasks Collection
```typescript
interface Task {
  id: string;
  memberId: string;        // Reference to member
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate?: Timestamp;
  createdBy: string;       // User ID
  createdAt: Timestamp;
}
```

#### Communications Collection
```typescript
interface Communication {
  id: string;
  memberId: string;
  type: 'email' | 'sms';
  content: string;
  sentAt: Timestamp;
  sentBy: string;          // User ID
}
```

#### Events Collection
```typescript
interface Event {
  id: string;
  name: string;
  type: string;
  date: Timestamp;
  qrCode: string;
  attendees: string[];     // Array of member IDs
}
```

#### Connect Groups Collection
```typescript
interface ConnectGroup {
  id: string;
  name: string;
  location: string;
  leaderId: string;
  members: string[];
  prayerRequests: Array<{
    request: string;
    date: Timestamp;
    member: string;
  }>;
}
```

#### Workflows Collection
```typescript
interface Workflow {
  id: string;
  name: string;
  trigger: { stage: string; track: string };
  action: { type: 'sms' | 'email'; template: string };
  active: boolean;
  runCount: number;
}
```

#### Ministries Collection
```typescript
interface Ministry {
  id: string;
  name: string;
  roster: Array<{
    date: string;
    role: string;
    memberId?: string;
    status: 'confirmed' | 'pending' | 'empty';
  }>;
}
```

### Real-time Subscriptions

- **Members collection** - Pipeline updates in real-time
- **Tasks collection** - Dashboard task list updates
- **Events attendees** - Check-in updates live

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require App Check for all requests
    match /{document=**} {
      allow read, write: if request.auth != null
                       && request.app.check != null;
    }

    // Admin-only writes
    match /{collection}/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## Routing & Navigation

### React Router v6 Setup

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppShell> {/* Nav + Layout */}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
              <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
              <Route path="/people/:id" element={<ProtectedRoute><MemberDetail /></ProtectedRoute>} />
              <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
              <Route path="/groups" element={<ProtectedRoute><ConnectGroups /></ProtectedRoute>} />
              <Route path="/groups/:id" element={<ProtectedRoute><GroupLeader /></ProtectedRoute>} />
              <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
              <Route path="/ministries" element={<ProtectedRoute><Ministries /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Navigation Improvements

- **URL-based routing** - Shareable links to specific members, groups, etc.
- **Browser back/forward** - Works correctly
- **Protected routes** - Redirect to login if not authenticated
- **Loading states** - During route transitions
- **404 page** - For invalid routes

### AppShell Component

- Persistent sidebar navigation (replaces tab buttons)
- User profile dropdown
- Notifications badge
- Mobile-responsive (hamburger menu)

## Environment Variables & Security

### Environment Configuration

```bash
# .env.example (committed to git)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=debug_token_for_local_dev

# .env.local (gitignored - actual secrets)
VITE_FIREBASE_API_KEY=AIza...
VITE_GEMINI_API_KEY=AIza...
# etc.
```

### Security Implementation

1. **Firebase App Check** - Prevents API abuse
   - reCAPTCHA v3 for web
   - Debug tokens for local development
   - Enforced in security rules

2. **API Key Protection:**
   - Gemini API key in environment variables (not hardcoded)
   - HTTP referrer restrictions in Google Cloud Console
   - Rate limiting via Firebase quota rules

3. **Authentication & Authorization:**
   - Firebase Auth (email/password + Google sign-in)
   - Custom claims for admin role
   - Protected routes require authentication

4. **Firestore Security Rules:**
   - Authenticated users can read all data
   - Only admins (custom claim) can write/update
   - Firebase App Check required for all requests
   - Row-level security for sensitive fields

## Component Decomposition Strategy

### Breaking Down the Monolithic App.jsx

**Current State:** 1,632 lines in one file
**Target State:** ~50 focused components

### Shared/Common Components (15)

**Form Controls:**
- `Button` - Reusable button with variants
- `Input` - Text input with validation
- `Select` - Dropdown select
- `TextArea` - Multi-line text input

**Display Elements:**
- `Badge` - Generic badge component
- `StatusBadge` - Track type indicator
- `TagBadge` - Member tag display

**Overlays:**
- `Modal` - Reusable modal wrapper
- `Drawer` - Side panel
- `Dialog` - Confirmation dialogs

**Layout Containers:**
- `Card` - Content card
- `Table` - Data table
- `Tabs` - Tab navigation

**Utilities:**
- `Spinner` - Loading indicator
- `ErrorBoundary` - Error handling
- `Toast` - Notifications

### Dashboard Components (8)

- `DashboardPage` - Main page wrapper
- `MetricsGrid` - Top-level stats (newcomers, new believers, integrated)
- `PipelineMetrics` - Track-specific metrics
- `RetentionChart` - Visual funnel representation
- `TaskList` - Pending tasks overview
- `RecentActivity` - Activity feed

### Pipeline Components (12)

- `PipelineBoard` - Kanban container
- `PipelineColumn` - Stage column
- `MemberCard` - Draggable member card
- `StageHeader` - Column header with count
- `TrackToggle` - Switch between newcomer/new believer tracks
- `EventPlannerModal` - AI event planning
- `BulkActionBar` - Multi-select actions

### People Components (10)

- `PeopleList` - Searchable member table
- `PeopleFilters` - Tag/track filters
- `MemberRow` - Table row component
- `MemberDetailModal` - Full profile view
- `PathwayJourneyTab` - Progress visualization
- `CommunicationTab` - Messaging interface
- `LogTasksTab` - Notes and tasks
- `AIMatchmaker` - Volunteer finder
- `TestimonyBuilder` - Baptism testimony generator

### Check-in Components (5)

- `CheckInPage` - Main check-in interface
- `EventSelector` - Choose event
- `QRCodeDisplay` - Show/generate QR codes
- `AttendeeList` - Manual check-in list
- `CheckInStats` - Event attendance stats

### Connect Groups Components (6)

- `ConnectGroupsPage` - Groups overview
- `GroupCard` - Individual group card
- `GroupLeaderPortal` - Leader dashboard
- `AttendanceTracker` - Mark attendance
- `PrayerRequestForm` - Add prayer requests
- `PrayerRequestList` - Display requests

### Workflows Components (4)

- `WorkflowsPage` - Automation management
- `WorkflowCard` - Individual workflow
- `WorkflowBuilder` - Create/edit workflows
- `WorkflowStats` - Execution statistics

### Ministries Components (5)

- `MinistriesPage` - Roster overview
- `MinistryRoster` - Individual ministry
- `RosterSlot` - Single roster position
- `VolunteerAssigner` - Assign volunteers
- `AIAutoFill` - Auto-suggest volunteers

### Component Design Principles

1. **Single Responsibility** - Each component does one thing well
2. **Props for Configuration** - No hardcoded data
3. **TypeScript Interfaces** - All props typed
4. **Composable** - Components build on each other
5. **Testable** - Isolated, easy to test
6. **Storybook-Ready** - Can be developed in isolation

## Comprehensive Testing Strategy

### Testing Stack

- **Vitest** - Unit/integration tests (faster than Jest, Vite-native)
- **React Testing Library** - Component testing
- **Playwright** - E2E tests
- **MSW (Mock Service Worker)** - API mocking
- **Firebase Emulators** - Local Firebase testing

### Test Coverage Breakdown

#### Unit Tests (60% of test suite)

**Services** (`gemini.service.ts`, `firestore.service.ts`):
- Mock Firebase SDK
- Test error handling, retries, data transforms
- Verify API call parameters

**Utils/Helpers** (formatters, validators):
- Pure functions, easy to test
- Edge cases and error conditions

**Custom Hooks** (`useMembers`, `usePipeline`):
- Test state updates, side effects
- Mock Firebase calls
- Verify React state management

#### Integration Tests (30% of test suite)

**Component + Firebase:**
- Use Firebase Emulators
- Test real data flow (create member → appears in list)
- Verify real-time subscriptions

**AI Features:**
- Mock Gemini API responses
- Test UI updates with AI-generated data
- Error handling for API failures

**Forms & Validation:**
- Submit flows
- Error states
- Field validation

#### E2E Tests (10% of test suite - critical paths)

**Newcomer Journey:**
1. Add new member
2. Move through pipeline stages
3. Send communication
4. Verify workflow triggers

**Event Check-in:**
1. Create event
2. Generate QR code
3. Mark attendance
4. Verify attendee list updates

**Group Management:**
1. Leader logs in
2. Takes attendance
3. Adds prayer request
4. Verifies data saved

**Workflow Automation:**
1. Set trigger
2. Move member to trigger stage
3. Verify action fired
4. Check communication sent

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

### CI/CD Integration

- Tests run on every commit
- Coverage reports uploaded
- E2E tests run on staging deployment
- Block merges if tests fail or coverage drops
- Automated Firebase deployment on main branch

## TypeScript Configuration

### Strict Mode Setup

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Type-First Development Workflow

1. Define types in `src/types/models.ts`
2. Create service interfaces
3. Implement components with full type safety
4. No `any` types allowed (except for third-party library edge cases)

## Migration Strategy (Big-Bang Rewrite)

### Phase 1: Foundation Setup
1. Create new TypeScript project structure
2. Set up Firebase project and configuration
3. Configure environment variables
4. Set up testing infrastructure
5. Create base types and models

### Phase 2: Core Services
1. Implement Firebase services (auth, firestore, storage)
2. Implement Gemini AI service
3. Create custom hooks for data access
4. Write service unit tests

### Phase 3: Common Components
1. Build shared UI components (buttons, inputs, modals)
2. Create layout components (AppShell, navigation)
3. Implement routing and protected routes
4. Test components in isolation

### Phase 4: Feature Modules
1. Build Dashboard module
2. Build Pipeline module
3. Build People module
4. Build Check-in module
5. Build Groups module
6. Build Workflows module
7. Build Ministries module

### Phase 5: Integration & Testing
1. Wire up all components with Firebase
2. Implement real-time subscriptions
3. Write integration tests
4. Write E2E tests
5. Test with Firebase emulators

### Phase 6: Data Migration
1. Export data from current app (if any production data exists)
2. Transform to Firestore schema
3. Import to Firebase
4. Verify data integrity

### Phase 7: Deployment
1. Set up Firebase hosting
2. Configure CI/CD pipeline
3. Deploy to staging
4. User acceptance testing
5. Deploy to production

## Success Criteria

### Functional Requirements Met
- All existing features reimplemented
- Data persists across sessions
- Real-time updates working
- AI features functional

### Technical Requirements Met
- TypeScript strict mode with no errors
- All tests passing
- 80%+ code coverage
- No hardcoded secrets
- Firebase security rules enforced

### Production Readiness
- App deployed to Firebase Hosting
- Users can authenticate
- Data is secure
- Performance is acceptable (< 2s page load)
- Mobile responsive

## Risks & Mitigations

### Risk: Long development time without working app
**Mitigation:** Use git worktree for parallel development, keep old app running

### Risk: Data model changes during development
**Mitigation:** Version Firestore schema, use migrations for changes

### Risk: Firebase costs exceed budget
**Mitigation:** Monitor usage, set billing alerts, optimize queries

### Risk: TypeScript learning curve
**Mitigation:** Start with simpler components, reference TypeScript docs, use AI assistance

### Risk: Test suite too slow
**Mitigation:** Use Vitest (faster), parallelize tests, mock external services

## Next Steps

1. ✅ Design approved
2. Create git worktree for isolated development
3. Generate detailed implementation plan
4. Begin Phase 1: Foundation Setup
