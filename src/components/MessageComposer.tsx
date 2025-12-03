import { useState } from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { CommunicationType } from '@/types/enums';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

interface MessageComposerProps {
  memberId: string;
  memberName: string;
  currentStage: string;
  onSend: (
    type: CommunicationType,
    message: string,
    sentVia: 'app' | 'manual',
    options?: { template?: string; subject?: string }
  ) => Promise<void>;
}

export function MessageComposer({
  memberName,
  currentStage,
  onSend
}: MessageComposerProps) {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationType>(CommunicationType.SMS);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { templates, substituteVariables } = useMessageTemplates(selectedChannel, currentStage);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (!templateId) {
      setMessage('');
      setSubject('');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Substitute variables
      const variables: Record<string, string> = {
        firstName: memberName.split(' ')[0] || '',
        lastName: memberName.split(' ')[1] || '',
        stageName: currentStage,
        nextEventDate: 'TBD',
        staffName: 'Staff' // TODO: Get from auth context
      };

      const substituted = substituteVariables(template.body, variables);
      setMessage(substituted);

      if (template.subject) {
        setSubject(substituteVariables(template.subject, variables));
      }
    }
  };

  const handleSend = async (sentVia: 'app' | 'manual') => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSend(selectedChannel, message, sentVia, {
        template: selectedTemplateId || undefined,
        subject: selectedChannel === CommunicationType.EMAIL ? subject : undefined
      });

      // Reset form
      setMessage('');
      setSubject('');
      setSelectedTemplateId('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const channels = [
    { type: CommunicationType.SMS, label: 'SMS', icon: MessageSquare },
    { type: CommunicationType.EMAIL, label: 'Email', icon: Mail },
    { type: CommunicationType.WHATSAPP, label: 'WhatsApp', icon: MessageSquare },
    { type: CommunicationType.PHONE, label: 'Phone Log', icon: Phone },
  ];

  return (
    <div className="space-y-4">
      {/* Channel Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {channels.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setSelectedChannel(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChannel === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template (optional)
        </label>
        <select
          value={selectedTemplateId}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        >
          <option value="">-- Select template or write custom message --</option>
          {templates
            .filter(t => t.category === 'stage_default')
            .map(template => (
              <option key={template.id} value={template.id}>
                {template.name} (Stage Default)
              </option>
            ))}
          {templates.filter(t => t.category === 'stage_default').length > 0 &&
           templates.filter(t => t.category === 'custom').length > 0 && (
            <option disabled>──────────</option>
          )}
          {templates
            .filter(t => t.category === 'custom')
            .map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
        </select>
      </div>

      {/* Subject (Email only) */}
      {selectedChannel === CommunicationType.EMAIL && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Email subject..."
          />
        </div>
      )}

      {/* Message Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
          placeholder="Type your message here..."
        />
        {selectedChannel === CommunicationType.SMS && message.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {message.length} characters ({Math.ceil(message.length / 160)} SMS segment{message.length > 160 ? 's' : ''})
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSend('app')}
          disabled={!message.trim() || sending}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {sending ? 'Sending...' : 'Send via App'}
        </button>
        <button
          onClick={() => handleSend('manual')}
          disabled={!message.trim() || sending}
          className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border border-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Mark as Sent Manually
        </button>
      </div>
    </div>
  );
}
