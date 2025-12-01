import { CheckCircle2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

export function Tasks() {
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">My Tasks</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {tasks.map((task: any) => (
          <div key={task.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <button className="w-5 h-5 rounded border border-slate-300 hover:border-amber-500 flex items-center justify-center text-white hover:text-amber-500 transition-colors">
                <CheckCircle2 size={16} className={task.status === 'COMPLETED' ? 'opacity-100 text-green-600' : 'opacity-0 hover:opacity-100'} />
              </button>
              <div>
                <p className={`font-medium text-slate-800 group-hover:text-amber-700 transition-colors ${task.status === 'COMPLETED' ? 'line-through' : ''}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{task.description || 'Task'}</span>
                  <span className="text-xs text-slate-400">By {task.createdBy}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2 py-1 rounded ${task.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
