import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Communication } from '@/types/models';
import { CommunicationType } from '@/types/enums';

export function useCommunications(memberId: string) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'communications'),
      where('memberId', '==', memberId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Communication[];

        setCommunications(comms);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching communications:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memberId]);

  const sendCommunication = async (
    type: CommunicationType,
    message: string,
    sentBy: string,
    sentVia: 'app' | 'manual',
    options?: {
      template?: string | null;
      subject?: string;
      metadata?: Communication['metadata'];
    }
  ) => {
    try {
      const communication: Omit<Communication, 'id'> = {
        memberId,
        type,
        direction: 'outbound',
        template: options?.template ?? null,
        subject: options?.subject,
        message,
        sentBy,
        sentVia,
        timestamp: Timestamp.now(),
        metadata: options?.metadata
      };

      const docRef = await addDoc(collection(db, 'communications'), communication);

      // Also create activity entry
      await addDoc(collection(db, `members/${memberId}/activity`), {
        type: 'communication',
        timestamp: Timestamp.now(),
        communicationId: docRef.id,
        channel: type,
        direction: 'outbound',
        summary: message.substring(0, 100)
      });

      return docRef.id;
    } catch (err) {
      console.error('Error sending communication:', err);
      throw err;
    }
  };

  return { communications, loading, error, sendCommunication };
}
