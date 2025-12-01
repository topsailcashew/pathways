import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Workflow } from '@/types/models';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'workflows'), orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const workflowsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Workflow[];
        setWorkflows(workflowsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching workflows:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { workflows, loading, error };
}
