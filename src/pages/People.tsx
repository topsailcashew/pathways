import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { INITIAL_MEMBERS, STAGES } from '@/data/mockData';

export function People() {
  const [members] = useState(INITIAL_MEMBERS);

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
            {members.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                <td className="px-6 py-4 text-slate-600">{(STAGES as any)[m.stage.toUpperCase()]?.label || m.stage}</td>
                <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
