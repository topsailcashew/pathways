import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ConnectGroup } from '@/types/models';

export function useConnectGroups() {
  const [groups, setGroups] = useState<ConnectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'connectGroups'),
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConnectGroup[];
        
        setGroups(groupsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching groups:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { groups, loading, error };
}
