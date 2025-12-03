import { CheckCircle2, AlertCircle } from 'lucide-react';
import { StageProgress } from '@/types/models';

interface StageProgressCardProps {
  progress: StageProgress;
  loading: boolean;
  onAdvance: () => void;
  onDismiss: () => void;
}

export function StageProgressCard({
  progress,
  loading,
  onAdvance,
  onDismiss
}: StageProgressCardProps) {
  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // No triggers defined - manual advancement only
  if (progress.triggers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <AlertCircle size={16} />
          <span className="font-medium">Manual advancement only</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          No automatic triggers configured for this stage.
        </p>
      </div>
    );
  }

  // Show progress toward triggers
  return (
    <div className={`border rounded-xl p-4 transition-all ${
      progress.ready
        ? 'bg-green-50 border-green-500'
        : 'bg-white border-gray-200'
    }`}>
      <div className="space-y-3">
        {progress.triggers.map((trigger, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {trigger.met ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className={`text-sm font-medium ${
                  trigger.met ? 'text-green-900' : 'text-gray-700'
                }`}>
                  Attended {trigger.eventType?.replace('_', ' ')} ({trigger.current}/{trigger.required})
                </span>
              </div>
              {!trigger.met && (
                <div className="ml-6 mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(trigger.current / trigger.required) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {progress.ready && (
          <>
            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-3">
                <CheckCircle2 size={18} />
                <span>Ready to advance to: {progress.nextStage}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onAdvance}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Advance Stage
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
