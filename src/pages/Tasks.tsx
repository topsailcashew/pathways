import { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { INITIAL_TASKS } from '@/data/mockData';

export function Tasks() {
  const [tasks] = useState(INITIAL_TASKS);

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
                <CheckCircle2 size={16} className="opacity-0 hover:opacity-100" />
              </button>
              <div>
                <p className="font-medium text-slate-800 line-through-none group-hover:text-amber-700 transition-colors">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {task.type === 'ai-generated' && <Sparkles size={12} className="text-amber-500" />}
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{task.type}</span>
                  <span className="text-xs text-slate-400">For {task.memberName}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2 py-1 rounded ${task.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                {task.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
