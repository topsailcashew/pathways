import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { StageProgress, TriggerStatus, StageTrigger, Activity } from '@/types/models';

export function useStageProgress(memberId: string, currentStage: string) {
  const [progress, setProgress] = useState<StageProgress>({
    ready: false,
    nextStage: null,
    triggers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId || !currentStage) {
      setLoading(false);
      return;
    }

    let unsubscribeActivity: (() => void) | null = null;
    let stageTrigger: StageTrigger | null = null;

    const loadData = async () => {
      try {
        // 1. Fetch trigger rules for current stage
        const triggersQuery = query(
          collection(db, 'stage_triggers'),
          where('stageId', '==', currentStage),
          limit(1)
        );
        const triggersSnapshot = await getDocs(triggersQuery);

        if (triggersSnapshot.empty) {
          // No triggers defined - manual advancement only
          setProgress({
            ready: false,
            nextStage: null,
            triggers: []
          });
          setLoading(false);
          return;
        }

        const triggerDoc = triggersSnapshot.docs[0];
        if (!triggerDoc) {
          setLoading(false);
          return;
        }

        stageTrigger = {
          id: triggerDoc.id,
          ...triggerDoc.data()
        } as StageTrigger;

        // 2. Subscribe to member's activity sub-collection
        const activityQuery = query(
          collection(db, `members/${memberId}/activity`),
          where('type', '==', 'event_attendance'),
          orderBy('timestamp', 'desc')
        );

        unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Activity[];

          // 3. Evaluate each trigger
          const triggerStatuses: TriggerStatus[] = stageTrigger!.triggers.map(rule => {
            const matchingEvents = activities.filter(
              activity => activity.eventType === rule.eventType
            );

            return {
              type: rule.type,
              eventType: rule.eventType,
              required: rule.count,
              current: matchingEvents.length,
              met: matchingEvents.length >= rule.count
            };
          });

          // 4. Check if all triggers met
          const allTriggersMet = triggerStatuses.length > 0 &&
            triggerStatuses.every(t => t.met);

          setProgress({
            ready: allTriggersMet,
            nextStage: allTriggersMet ? stageTrigger!.nextStageId : null,
            triggers: triggerStatuses
          });
          setLoading(false);
        });
      } catch (error) {
        console.error('Error loading stage progress:', error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeActivity) {
        unsubscribeActivity();
      }
    };
  }, [memberId, currentStage]);

  return { progress, loading };
}
