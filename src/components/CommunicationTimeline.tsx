import { Mail, MessageSquare, Phone, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Activity } from '@/types/models';
import { format } from 'date-fns';

interface CommunicationTimelineProps {
  activity: Activity[];
  loading: boolean;
}

export function CommunicationTimeline({ activity, loading }: CommunicationTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No activity yet
      </div>
    );
  }

  const getIcon = (item: Activity) => {
    if (item.type === 'communication') {
      switch (item.channel) {
        case 'email': return <Mail size={14} />;
        case 'sms': return <MessageSquare size={14} />;
        case 'whatsapp': return <MessageSquare size={14} />;
        case 'phone': return <Phone size={14} />;
      }
    }
    if (item.type === 'event_attendance') {
      return <CheckCircle2 size={14} />;
    }
    if (item.type === 'stage_change') {
      return <ArrowUpRight size={14} />;
    }
    return null;
  };

  const getIconColor = (item: Activity) => {
    if (item.type === 'communication') {
      return 'bg-blue-100 text-blue-600';
    }
    if (item.type === 'event_attendance') {
      return 'bg-green-100 text-green-600';
    }
    if (item.type === 'stage_change') {
      return 'bg-orange-100 text-orange-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const getDescription = (item: Activity) => {
    if (item.type === 'communication') {
      const channelName = item.channel?.toUpperCase();
      const directionIcon = item.direction === 'outbound' ? '→' : '←';
      return `${directionIcon} ${channelName}: ${item.summary}`;
    }
    if (item.type === 'event_attendance') {
      return `✓ Attended: ${item.eventName}`;
    }
    if (item.type === 'stage_change') {
      return `↗️ Stage Change: ${item.fromStage} → ${item.toStage}`;
    }
    return 'Unknown activity';
  };

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(item)}`}>
            {getIcon(item)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {getDescription(item)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.timestamp && format(item.timestamp.toDate(), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
