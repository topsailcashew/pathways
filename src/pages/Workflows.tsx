import { useState } from 'react';
import { Plus, Zap, ArrowRight, Trash2, X } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { firestoreService } from '@/services/firestore.service';
import { Modal } from '@/components/common/Modal';
import { Track, CommunicationType } from '@/types/enums';
import { NEWCOMER_STAGES, NEW_BELIEVER_STAGES } from '@/utils/constants';

export function Workflows() {
  const { workflows, loading } = useWorkflows();
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    track: Track.NEWCOMER,
    stage: '',
    actionType: CommunicationType.EMAIL,
    template: '',
  });

  const handleToggleActive = async (workflowId: string, currentActive: boolean) => {
    try {
      await firestoreService.updateWorkflow(workflowId, { active: !currentActive });
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await firestoreService.deleteWorkflow(workflowId);
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await firestoreService.createWorkflow({
        name: formData.name,
        trigger: {
          stage: formData.stage,
          track: formData.track,
        },
        action: {
          type: formData.actionType,
          template: formData.template,
        },
        active: true,
        runCount: 0,
      });
      setShowNewModal(false);
      setFormData({
        name: '',
        track: Track.NEWCOMER,
        stage: '',
        actionType: CommunicationType.EMAIL,
        template: '',
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const availableStages = formData.track === Track.NEWCOMER ? NEWCOMER_STAGES : NEW_BELIEVER_STAGES;

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
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Zap size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">No workflows yet</p>
          <p className="text-sm mt-2">Create your first automated workflow to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => (
          <div key={wf.id} className={`p-5 rounded-xl border flex items-center justify-between transition-all ${wf.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-75'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${wf.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{wf.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    IF: {wf.trigger.track} → {wf.trigger.stage}
                  </span>
                  <ArrowRight size={12} />
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                    THEN: Send {wf.action.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <span className="block text-xl font-bold text-slate-800">{wf.runCount || 0}</span>
                <span className="text-xs text-slate-400">Total Runs</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDeleteWorkflow(wf.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-2"
                  title="Delete workflow"
                >
                  <Trash2 size={18} />
                </button>
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={() => handleToggleActive(wf.id, wf.active)}
                >
                  <div className={`w-11 h-6 rounded-full peer transition-colors ${wf.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all ${wf.active ? 'translate-x-full border-white' : ''}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* New Workflow Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} size="lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Create New Workflow</h2>
            <button
              onClick={() => setShowNewModal(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleCreateWorkflow} className="space-y-6">
            {/* Workflow Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Email for Newcomers"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Trigger Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm">IF (Trigger)</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Track
                  </label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value as Track, stage: '' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={Track.NEWCOMER}>Newcomer</option>
                    <option value={Track.NEW_BELIEVER}>New Believer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select stage...</option>
                    {availableStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm">THEN (Action)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Communication Type
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as CommunicationType })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={CommunicationType.EMAIL}>Email</option>
                    <option value={CommunicationType.SMS}>SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message Template
                  </label>
                  <textarea
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    placeholder="Enter your message template here..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    You can use variables like {'{name}'}, {'{stage}'}, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Create Workflow
              </button>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
