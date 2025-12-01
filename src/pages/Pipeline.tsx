import { useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { Track, Stage } from '@/types/enums';
import { NEWCOMER_STAGES, NEW_BELIEVER_STAGES } from '@/utils/constants';

export function Pipeline() {
  const { members, loading } = useMembers();
  const [pipelineFilter, setPipelineFilter] = useState<Track>(Track.NEWCOMER);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  const stages = pipelineFilter === Track.NEWCOMER ? NEWCOMER_STAGES : NEW_BELIEVER_STAGES;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Pathway View</h2>
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
            <button
              onClick={() => setPipelineFilter(Track.NEWCOMER)}
              className={`px-4 py-1.5 rounded-md transition-all ${pipelineFilter === Track.NEWCOMER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Newcomer
            </button>
            <button
              onClick={() => setPipelineFilter(Track.NEW_BELIEVER)}
              className={`px-4 py-1.5 rounded-md transition-all ${pipelineFilter === Track.NEW_BELIEVER ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              New Believer
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 px-4">
        <div className="flex gap-4 min-w-max h-full">
          {stages.map((stage: any) => {
            const stageMembers = members.filter((m: any) => m.stage === stage.id);
            const isShared = stage.track === 'shared';

            return (
              <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col">
                <div className={`mb-3 flex items-center justify-between px-2 py-2 rounded-lg ${isShared ? 'bg-slate-100 text-slate-800' : 'bg-white border border-slate-200 text-slate-700'}`}>
                  <span className="font-bold text-sm uppercase tracking-wider">{stage.label}</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                    {stageMembers.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {stageMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${member.type === TRACKS.NEWCOMER ? 'bg-blue-500' : 'bg-amber-500'}`}>
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-400">{member.joined}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2 mb-3">
                        {member.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>

                      {/* Quick Task Indicator */}
                      {member.tasks?.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1.5 rounded text-xs">
                          <ListTodo size={12} />
                          <span>{member.tasks.length} tasks</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-slate-300 hover:text-slate-500 flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Person
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
