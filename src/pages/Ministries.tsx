import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { MINISTRIES, INITIAL_ROSTER } from '@/data/mockData';

export function Ministries() {
  const [roster] = useState(INITIAL_ROSTER);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ministries & Roster</h2>
          <p className="text-slate-500 text-sm">Sunday Service • Oct 29</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">
            Publish Roster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MINISTRIES.map((ministryName: string) => {
          const ministryRoster = roster.filter((r: any) => r.ministry === ministryName);

          return (
            <div key={ministryName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {ministryName}
                  <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-normal">
                    {ministryRoster.length} Roles
                  </span>
                </h3>
                <button className="text-xs text-blue-600 font-bold hover:underline">+ Add Role</button>
              </div>

              <div className="divide-y divide-slate-100 flex-1">
                {ministryRoster.length > 0 ? (
                  ministryRoster.map((spot: any) => (
                    <div key={spot.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{spot.role}</p>
                        <div className="flex items-center gap-2">
                          {spot.person ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                {spot.person.charAt(0)}
                              </div>
                              <span className="text-slate-800 font-medium text-sm">{spot.person}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-sm">-- Unassigned --</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {spot.status === 'confirmed' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"><CheckCircle2 size={14} /></span>}
                        {spot.status === 'pending' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600"><Clock size={14} /></span>}
                        {spot.status === 'empty' && <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Assign</button>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm italic">
                    No roles defined for this ministry yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
