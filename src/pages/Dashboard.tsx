import { UserPlus, Heart, CheckCircle2, ListTodo } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useTasks } from '@/hooks/useTasks';
import { Track } from '@/types/enums';

export function Dashboard() {
  const { members, loading: membersLoading } = useMembers();
  const { tasks, loading: tasksLoading } = useTasks();

  if (membersLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStats = () => {
    const total = members.length;
    const newcomers = members.filter((m: any) => m.track === Track.NEWCOMER).length;
    const believers = members.filter((m: any) => m.track === Track.NEW_BELIEVER).length;
    const serving = members.filter((m: any) => m.stage === 'serve').length;
    const overdueTasks = tasks.filter((t: any) => t.status === 'overdue').length;
    return { total, newcomers, believers, serving, overdueTasks };
  };

  const countInStage = (stageId: string) => members.filter((m: any) => m.stage === stageId).length;

  const stats = getStats();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">Ministry Overview</h2>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Newcomers (Active)</p>
            <p className="text-3xl font-bold text-slate-800">{stats.newcomers}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <UserPlus size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">New Believers</p>
            <p className="text-3xl font-bold text-slate-800">{stats.believers}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Heart size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Fully Integrated</p>
            <p className="text-3xl font-bold text-slate-800">{stats.serving}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
            <p className="text-3xl font-bold text-slate-800">{tasks.length}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <ListTodo size={24} />
          </div>
        </div>
      </div>

      {/* Pipelines Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Newcomer Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Newcomer Pipeline
            </h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Retention: 78%</span>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Sunday Experience', count: countInStage('sunday_nc'), target: 15 },
              { label: 'Newcomers Tent', count: countInStage('tent'), target: 10 },
              { label: 'Newcomers Lunch', count: countInStage('lunch'), target: 8 },
              { label: 'Social Group', count: countInStage('social'), target: 5 },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium text-slate-600">{step.label}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(step.count / 20) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right font-bold text-slate-700">{step.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Believer Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> New Believer Pipeline
            </h3>
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">Growth: +12%</span>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Salvation Card', count: countInStage('card') },
              { label: 'Next Steps', count: countInStage('steps') },
              { label: 'Baptism', count: countInStage('baptism') },
              { label: 'Connect Groups', count: countInStage('connect') },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium text-slate-600">{step.label}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(step.count / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right font-bold text-slate-700">{step.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
