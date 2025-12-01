export function Reports() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Monthly Impact Report</h2>
        <p className="text-slate-400">October 2023 Statistics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Newcomer Retention</h4>
          <span className="text-4xl font-bold text-slate-800">72%</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Growth Track Grads</h4>
          <span className="text-4xl font-bold text-slate-800">18</span>
        </div>
      </div>
    </div>
  );
}
