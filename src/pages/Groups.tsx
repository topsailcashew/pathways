import { useState, useEffect } from 'react';
import { MapPin, ArrowRight, X, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useConnectGroups } from '@/hooks/useConnectGroups';

export function Groups() {
  const { groups: groupsData, loading } = useConnectGroups();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Sync groups from Firestore to local state
  useEffect(() => {
    if (groupsData.length > 0) {
      setGroups(groupsData);
    }
  }, [groupsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-[600px] rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={() => setSelectedGroup(null)}
            className="absolute top-6 right-4 text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
          <button
            onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white mb-2"
          >
            <ChevronLeft size={14} /> Back to Groups
          </button>
          <h2 className="font-bold text-lg">{selectedGroup.name} Connect</h2>
          <p className="text-slate-400 text-sm">Leader: {selectedGroup.leader}</p>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Attendance (Today)</h3>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="space-y-3">
              {selectedGroup.members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{m.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      const updatedGroups = groups.map(g => {
                        if (g.id === selectedGroup.id) {
                          const updatedMembers = g.members.map((mem: any) => mem.id === m.id ? { ...mem, present: !mem.present } : mem);
                          return { ...g, members: updatedMembers };
                        }
                        return g;
                      });
                      setGroups(updatedGroups);
                      setSelectedGroup(updatedGroups.find(g => g.id === selectedGroup.id));
                    }}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${m.present ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
                  >
                    {m.present && <CheckCircle2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Prayer Requests</h3>
            <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none" rows={3} placeholder="Log any prayer needs here..." />
            <button className="w-full mt-3 bg-amber-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-amber-700">Save Update</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Connect Groups</h2>
          <p className="text-slate-500 text-sm">Select a group to manage attendance & prayer.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
          + New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: any) => (
          <div
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-amber-50 text-amber-700 p-2 rounded-lg">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                {group.members.length} Members
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-amber-700 transition-colors">{group.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Leader: {group.leader}</p>

            <div className="flex items-center text-xs font-medium text-blue-600 gap-1">
              View Portal <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
