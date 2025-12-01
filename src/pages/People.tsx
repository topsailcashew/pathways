import { useState } from 'react';
import { ChevronRight, Mail, Phone, Tag, Calendar, User, X } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { STAGES } from '@/data/mockData';
import { Member } from '@/types/models';
import { Modal } from '@/components/common/Modal';

export function People() {
  const { members, loading } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">People Database</h3>
            <button className="text-sm text-slate-500 hover:text-amber-600 font-medium">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Stage</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m: any) => {
                  const stageKey = m.currentStage?.toUpperCase?.() || '';
                  const stageLabel = (STAGES as any)[stageKey]?.label || m.currentStage || 'Unknown';

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">{m.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600">{m.email || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{m.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{stageLabel}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {m.tags?.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {m.tags?.length > 2 && (
                            <span className="text-xs text-slate-400">+{m.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-slate-300 ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Person Detail Modal */}
      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Person Details</h2>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedMember.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      selectedMember.track === 'newcomer'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedMember.track === 'newcomer' ? 'Newcomer' : 'New Believer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Mail size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800">{selectedMember.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Phone size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Stage Info */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase">Current Stage</span>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {(STAGES as any)[selectedMember.currentStage?.toUpperCase?.() || '']?.label || selectedMember.currentStage || 'Unknown'}
                </p>
              </div>

              {/* Tags */}
              {selectedMember.tags && selectedMember.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-700 uppercase">Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedMember.notes && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Notes</h4>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedMember.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Joined</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedMember.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Last Updated</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedMember.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Edit Person
            </button>
            <button
              onClick={() => setSelectedMember(null)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
