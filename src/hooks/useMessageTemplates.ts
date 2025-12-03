import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
