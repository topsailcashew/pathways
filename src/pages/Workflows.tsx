import { useState, useEffect } from 'react';
import { Plus, Zap, ArrowRight } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';

export function Workflows() {
  const { workflows: workflowsData, loading } = useWorkflows();
  const [workflows, setWorkflows] = useState<any[]>([]);

  // Sync workflows from Firestore to local state
  useEffect(() => {
    if (workflowsData.length > 0) {
      setWorkflows(workflowsData);
    }
  }, [workflowsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Automated Workflows</h2>
          <p className="text-slate-500 text-sm">"If This, Then That" for your ministry.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
          <Plus size={16} /> New Workflow
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map((wf: any) => (
          <div key={wf.id} className={`p-5 rounded-xl border flex items-center justify-between transition-all ${wf.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-75'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${wf.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{wf.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">IF: {wf.trigger}</span>
                  <ArrowRight size={12} />
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">THEN: {wf.action}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <span className="block text-xl font-bold text-slate-800">{wf.runs}</span>
                <span className="text-xs text-slate-400">Total Runs</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer" onClick={() => {
                const newWf = workflows.map(w => w.id === wf.id ? { ...w, active: !w.active } : w);
                setWorkflows(newWf);
              }}>
                <div className={`w-11 h-6 rounded-full peer transition-colors ${wf.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all ${wf.active ? 'translate-x-full border-white' : ''}`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
