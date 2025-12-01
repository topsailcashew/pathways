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
