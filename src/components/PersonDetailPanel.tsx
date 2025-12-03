import { X } from 'lucide-react';
import { doc, runTransaction, Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Member } from '@/types/models';
import { useStageProgress } from '@/hooks/useStageProgress';
import { useCommunications } from '@/hooks/useCommunications';
import { useMemberActivity } from '@/hooks/useMemberActivity';
import { StageProgressCard } from './StageProgressCard';
import { CommunicationTimeline } from './CommunicationTimeline';
import { MessageComposer } from './MessageComposer';
import { CommunicationType } from '@/types/enums';

interface PersonDetailPanelProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonDetailPanel({ member, isOpen, onClose }: PersonDetailPanelProps) {

  const { progress, loading: progressLoading } = useStageProgress(
    member?.id || '',
    member?.currentStage || ''
  );

  const { sendCommunication } = useCommunications(member?.id || '');
  const { activity, loading: activityLoading } = useMemberActivity(member?.id || '');

  if (!isOpen || !member) return null;

  const handleAdvanceStage = async () => {
    if (!progress.nextStage || !member) return;

    try {
      await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, 'members', member.id);
        const memberDoc = await transaction.get(memberRef);

        if (!memberDoc.exists()) {
          throw new Error('Member not found');
        }

        // Check if stage hasn't changed
        if (memberDoc.data().currentStage !== member.currentStage) {
          throw new Error('Stage was already changed by someone else');
        }

        // Update member stage
        transaction.update(memberRef, {
          currentStage: progress.nextStage,
          updatedAt: Timestamp.now()
        });
      });

      // Create activity entry for stage change
      await addDoc(collection(db, `members/${member.id}/activity`), {
        type: 'stage_change',
        timestamp: Timestamp.now(),
        fromStage: member.currentStage,
        toStage: progress.nextStage,
        triggeredBy: 'auto',
        approvedBy: 'current-user' // TODO: Get from auth context
      });

      alert(`Successfully advanced to ${progress.nextStage}!`);
      onClose();
    } catch (error: any) {
      console.error('Error advancing stage:', error);
      if (error.message.includes('already changed')) {
        alert('This person was already advanced by someone else.');
      } else {
        alert('Failed to advance stage. Please try again.');
      }
    }
  };

  const handleDismiss = () => {
    // TODO: Optionally log dismissal reason
    alert('Suggestion dismissed');
  };

  const handleSendMessage = async (
    type: CommunicationType,
    message: string,
    sentVia: 'app' | 'manual',
    options?: { template?: string; subject?: string }
  ) => {
    await sendCommunication(
      type,
      message,
      'current-user', // TODO: Get from auth context
      sentVia,
      {
        template: options?.template || null,
        subject: options?.subject
      }
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-sm text-gray-600">
                {member.currentStage} • Joined {member.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stage Progress Card */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Current Stage: {member.currentStage}
            </h3>
            <StageProgressCard
              progress={progress}
              loading={progressLoading}
              onAdvance={handleAdvanceStage}
              onDismiss={handleDismiss}
            />
          </div>

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Activity Timeline
            </h3>
            <CommunicationTimeline
              activity={activity}
              loading={activityLoading}
            />
          </div>

          {/* Message Composer */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Send Message
            </h3>
            <MessageComposer
              memberId={member.id}
              memberName={member.name}
              currentStage={member.currentStage}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
