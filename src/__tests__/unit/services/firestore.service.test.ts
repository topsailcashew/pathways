import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreService } from '@services/firestore.service';
import { Track } from '@/types/enums';

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
