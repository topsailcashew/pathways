import { CheckCircle2, Clock } from 'lucide-react';
import { useMinistries } from '@/hooks/useMinistries';

export function Ministries() {
  const { ministries, loading } = useMinistries();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading ministries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ministries & Roster</h2>
          <p className="text-slate-500 text-sm">Sunday Service • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">
            Publish Roster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ministries.map((ministry: any) => {
          const ministryRoster = ministry.roster || [];

          return (
            <div key={ministry.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {ministry.name}
                  <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-normal">
                    {ministryRoster.length} Roles
                  </span>
                </h3>
                <button className="text-xs text-blue-600 font-bold hover:underline">+ Add Role</button>
              </div>

              <div className="divide-y divide-slate-100 flex-1">
                {ministryRoster.length > 0 ? (
                  ministryRoster.map((spot: any, index: number) => (
                    <div key={index} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{spot.role}</p>
                        <div className="flex items-center gap-2">
                          {spot.memberId ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                {spot.memberId.charAt(0)}
                              </div>
                              <span className="text-slate-800 font-medium text-sm">{spot.memberId}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-sm">-- Unassigned --</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {spot.status === 'CONFIRMED' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"><CheckCircle2 size={14} /></span>}
                        {spot.status === 'PENDING' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600"><Clock size={14} /></span>}
                        {spot.status === 'EMPTY' && <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Assign</button>}
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
