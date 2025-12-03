import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { STAGES } from '@/data/mockData';
import { Member } from '@/types/models';
import { PersonDetailPanel } from '@/components/PersonDetailPanel';

export function People() {
  const { members, loading } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading people...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">People Database</h3>
            <button className="text-sm text-slate-500 hover:text-amber-600 font-medium">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Stage</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m: any) => {
                  const stageKey = m.currentStage?.toUpperCase?.() || '';
                  const stageLabel = (STAGES as any)[stageKey]?.label || m.currentStage || 'Unknown';

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">{m.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600">{m.email || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{m.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{stageLabel}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {m.tags?.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {m.tags?.length > 2 && (
                            <span className="text-xs text-slate-400">+{m.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-slate-300 ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Person Detail Panel */}
      <PersonDetailPanel
        member={selectedMember}
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
