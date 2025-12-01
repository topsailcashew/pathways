import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Ministry } from '@/types/models';

export function useMinistries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'ministries'), orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ministriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Ministry[];
        setMinistries(ministriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching ministries:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { ministries, loading, error };
}
