import { useState } from 'react';
import { QrCode, Users, Briefcase } from 'lucide-react';
import { CheckIn } from './CheckIn';
import { Groups } from './Groups';
import { Ministries } from './Ministries';

type TabType = 'checkin' | 'groups' | 'ministries';

export function Ministry() {
  const [activeTab, setActiveTab] = useState<TabType>('checkin');

  const tabs = [
    { id: 'checkin' as TabType, label: 'Check-in', icon: QrCode },
    { id: 'groups' as TabType, label: 'Groups', icon: Users },
    { id: 'ministries' as TabType, label: 'Ministries', icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${
                  isActive
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'checkin' && <CheckIn />}
        {activeTab === 'groups' && <Groups />}
        {activeTab === 'ministries' && <Ministries />}
      </div>
    </div>
  );
}
