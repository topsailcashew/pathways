import { useState } from 'react';
import { Scan, QrCode, CalendarCheck } from 'lucide-react';
import { INITIAL_EVENTS } from '@/data/mockData';

export function CheckIn() {
  const [events] = useState(INITIAL_EVENTS);
  const [qrModalEvent, setQrModalEvent] = useState<any>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Check-in</h2>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
          <Scan size={16} /> Open Scanner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: any) => (
          <div key={event.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <CalendarCheck size={24} />
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{event.attendees} Registered</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">{event.name}</h3>
            <div className="text-sm text-slate-500 space-y-1 mb-4">
              <p>{event.date} • {event.time}</p>
              <p>{event.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setQrModalEvent(event)}
                className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode size={16} /> QR Code
              </button>
              <button className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 py-2 rounded-lg text-sm font-bold transition-colors">
                Check-in List
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {qrModalEvent && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4" onClick={() => setQrModalEvent(null)}>
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl text-slate-800">{qrModalEvent.name}</h3>
            <div className="bg-slate-900 p-4 rounded-xl inline-block">
              <QrCode size={180} className="text-white" />
            </div>
            <p className="text-sm text-slate-500">Scan this code at the kiosk to check in.</p>
            <button onClick={() => setQrModalEvent(null)} className="text-sm text-slate-400 hover:text-slate-600 underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
