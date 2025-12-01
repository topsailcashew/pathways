import { ChevronRight } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { STAGES } from '@/data/mockData';

export function People() {
  const { members, loading } = useMembers();

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
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">People Database</h3>
          <button className="text-sm text-slate-500 hover:text-amber-600 font-medium">Export CSV</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Stage</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m: any) => {
              const stageKey = m.currentStage?.toUpperCase?.() || '';
              const stageLabel = (STAGES as any)[stageKey]?.label || m.currentStage || 'Unknown';

              return (
                <tr key={m.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{m.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600">{stageLabel}</td>
                  <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
