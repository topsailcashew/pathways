import React, { useState, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  GitMerge, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search,
  Plus,
  UserPlus,
  Heart,
  MoreHorizontal,
  X,
  ListTodo,
  BarChart3,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Tag,
  ArrowRight,
  Send,
  Sparkles,
  Loader2,
  FileText,
  BrainCircuit,
  Mic,
  QrCode,
  Scan,
  Workflow,
  Zap,
  CalendarCheck,
  UserCheck,
  Briefcase,
  MapPin,
  ChevronLeft
} from 'lucide-react';

// --- Constants & Data Models ---

const apiKey = "AIzaSyDCJF9BPkdZwwh46CW1lOIm5O23fEd3QAk"; // Gemini API Key injected by environment

const TRACKS = {
  NEWCOMER: 'newcomer',
  BELIEVER: 'believer',
};

const STAGES = {
  SUNDAY_NC: { id: 'sunday_nc', label: 'Sunday Experience', track: TRACKS.NEWCOMER, order: 1, next: 'tent' },
  TENT: { id: 'tent', label: 'Newcomers Tent', track: TRACKS.NEWCOMER, order: 2, next: 'lunch' },
  LUNCH: { id: 'lunch', label: 'Newcomers Lunch', track: TRACKS.NEWCOMER, order: 3, next: 'social' },
  SOCIAL: { id: 'social', label: 'Social Group', track: TRACKS.NEWCOMER, order: 4, next: 'connect' },
  
  SUNDAY_NB: { id: 'sunday_nb', label: 'Sunday Experience', track: TRACKS.BELIEVER, order: 1, next: 'card' },
  CARD: { id: 'card', label: 'Salvation Card', track: TRACKS.BELIEVER, order: 2, next: 'steps' },
  STEPS: { id: 'steps', label: 'Next Steps', track: TRACKS.BELIEVER, order: 3, next: 'baptism' },
  BAPTISM: { id: 'baptism', label: 'Baptism', track: TRACKS.BELIEVER, order: 4, next: 'connect' },

  CONNECT: { id: 'connect', label: 'Connect Groups', track: 'shared', order: 5, next: 'growth' },
  GROWTH: { id: 'growth', label: 'Growth Track', track: 'shared', order: 6, next: 'serve' },
  SERVE: { id: 'serve', label: 'Serve', track: 'shared', order: 7, next: null },
};

// Expanded Mock Data
const INITIAL_MEMBERS = [
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    type: TRACKS.NEWCOMER, 
    stage: 'tent', 
    joined: '2023-10-15', 
    email: 'sarah.j@example.com', 
    phone: '555-0123',
    tags: ['Young Adult', 'Worship Interest', 'Singer'],
    history: [
      { date: '2023-10-15', action: 'Attended Sunday Experience', type: 'system' },
      { date: '2023-10-17', action: 'Sent Welcome SMS', type: 'comm' }
    ],
    tasks: [
      { id: 101, title: 'Invite to Newcomers Lunch', due: '2023-10-25', completed: false }
    ]
  },
  { 
    id: 2, 
    name: 'Mike Ross', 
    type: TRACKS.BELIEVER, 
    stage: 'card', 
    joined: '2023-10-20', 
    email: 'mike.r@example.com', 
    phone: '555-0199',
    tags: ['Men', 'Needs Bible', 'Construction'],
    history: [
      { date: '2023-10-20', action: 'Filled Salvation Card', type: 'system' }
    ],
    tasks: [
      { id: 102, title: 'Deliver Bible & Welcome Kit', due: '2023-10-22', completed: false },
      { id: 103, title: 'Assign Discipleship Mentor', due: '2023-10-24', completed: false }
    ]
  },
  { id: 3, name: 'Jessica Chen', type: TRACKS.NEWCOMER, stage: 'social', joined: '2023-09-10', email: 'jess.c@example.com', phone: '555-0001', tags: ['Professional', 'Northside', 'Teacher'], history: [], tasks: [] },
  { id: 4, name: 'David Kim', type: TRACKS.BELIEVER, stage: 'baptism', joined: '2023-09-01', email: 'd.kim@test.com', phone: '555-9988', tags: ['Student', 'Introvert'], history: [], tasks: [] },
  { id: 5, name: 'Tom Hiddleston', type: TRACKS.NEWCOMER, stage: 'connect', joined: '2023-08-15', email: 'loki@asgard.com', phone: '555-0000', tags: ['Married', 'Men', 'Leadership'], history: [], tasks: [] },
  { id: 6, name: 'Emily Blunt', type: TRACKS.BELIEVER, stage: 'serve', joined: '2023-06-01', email: 'emily@movie.com', phone: '555-1111', tags: ['Kids Ministry', 'Mom'], history: [], tasks: [] },
  { id: 7, name: 'Chris Evans', type: TRACKS.NEWCOMER, stage: 'lunch', joined: '2023-10-01', email: 'cap@avengers.com', phone: '555-2222', tags: ['Single', 'Tech'], history: [], tasks: [] },
  { id: 8, name: 'Scarlett Jo', type: TRACKS.BELIEVER, stage: 'steps', joined: '2023-10-12', email: 'nat@avengers.com', phone: '555-3333', tags: ['Young Adult', 'Creative'], history: [], tasks: [] },
];

const INITIAL_TASKS = [
  { id: 1, memberId: 1, memberName: 'Sarah Jenkins', title: 'Invite to Newcomers Lunch', type: 'invite', due: 'Today', status: 'pending' },
  { id: 2, memberId: 2, memberName: 'Mike Ross', title: 'Deliver Bible', type: 'care', due: 'Tomorrow', status: 'pending' },
  { id: 3, memberId: 7, memberName: 'Chris Evans', title: 'Confirm Lunch RSVP', type: 'admin', due: 'Overdue', status: 'overdue' },
];

const INITIAL_EVENTS = [
  { id: 1, name: 'Newcomers Lunch', date: 'Oct 29', time: '1:00 PM', location: 'Fellowship Hall', attendees: 12 },
  { id: 2, name: 'Growth Track: Step 1', date: 'Nov 05', time: '11:00 AM', location: 'Room 204', attendees: 8 },
  { id: 3, name: 'Baptism Service', date: 'Nov 12', time: '10:00 AM', location: 'Main Auditorium', attendees: 5 },
];

const CONNECT_GROUP_NAMES = [
  'Kijitonyama', 'Makongo Juu', 'Mbezi Rainbow', 'Mikocheni', 'Mikocheni Bima', 
  'Msasani', 'Msasani Beach', 'Oysterbay Chake Chake', 'Oysterbay Chole Road', 
  'Oysterbay Haile Selassie', 'Oysterbay Kaunda Drive', "Oysterbay St. Peter's Square", 
  'Posta', 'Savei Mlalakuwa', 'Sinza Vatican', 'Tegeta Wazo'
];

// Generate groups with some mock data
const INITIAL_GROUPS = CONNECT_GROUP_NAMES.map((name, index) => ({
  id: index + 1,
  name: name, 
  leader: `Leader ${index + 1}`, // Placeholder leader names
  members: [
      { id: 1, name: 'Member A', present: false },
      { id: 2, name: 'Member B', present: false },
      { id: 3, name: 'Member C', present: false },
      { id: 4, name: 'Member D', present: false },
      { id: 5, name: 'Member E', present: false },
  ], 
  prayers: []
}));

const INITIAL_WORKFLOWS = [
  { id: 1, name: 'New Believer Welcome', trigger: 'Moved to Salvation Card', action: 'Send SMS + Assign Task', active: true, runs: 12 },
  { id: 2, name: 'Stalled Newcomer Alert', trigger: 'No movement for 14 days', action: 'Email Pastor', active: true, runs: 5 },
  { id: 3, name: 'Baptism Info Packet', trigger: 'Registered for Baptism', action: 'Send Email', active: false, runs: 0 },
];

const MINISTRIES = [
  'Worship Band', 
  'Hospitality', 
  'Ushers', 
  'Set up and Teardown', 
  'Production', 
  'Social Media', 
  'Parking', 
  'Kids'
];

const INITIAL_ROSTER = [
  { id: 1, ministry: 'Worship Band', role: 'Worship Leader', person: 'Sarah Jenkins', status: 'confirmed' },
  { id: 2, ministry: 'Worship Band', role: 'Acoustic Guitar', person: 'John Mayer', status: 'pending' },
  { id: 3, ministry: 'Worship Band', role: 'Drums', person: null, status: 'empty' },
  
  { id: 4, ministry: 'Hospitality', role: 'Greeter Lead', person: 'Tom Hiddleston', status: 'confirmed' },
  { id: 5, ministry: 'Hospitality', role: 'Door Greeter 1', person: null, status: 'empty' },
  
  { id: 6, ministry: 'Kids', role: 'Check-in Desk', person: 'Emily Blunt', status: 'confirmed' },
  { id: 7, ministry: 'Kids', role: 'Nursery Lead', person: null, status: 'empty' },
  
  { id: 8, ministry: 'Production', role: 'Camera Op', person: 'Chris Evans', status: 'pending' },
  { id: 9, ministry: 'Production', role: 'Sound Engineer', person: null, status: 'empty' },

  { id: 10, ministry: 'Ushers', role: 'Head Usher', person: null, status: 'empty' },
  { id: 11, ministry: 'Parking', role: 'Lot A Lead', person: 'Mike Ross', status: 'confirmed' },
];

// --- Components ---

const StatusBadge = ({ type }) => {
  const isNewcomer = type === TRACKS.NEWCOMER;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
      isNewcomer ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {isNewcomer ? 'Newcomer' : 'New Believer'}
    </span>
  );
};

const TagBadge = ({ label }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
    <Tag size={10} />
    {label}
  </span>
);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [pipelineFilter, setPipelineFilter] = useState(TRACKS.NEWCOMER);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Feature States
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null); // For Group Leader View

  // Pipeline Planner State
  const [planningStage, setPlanningStage] = useState(null); 
  const [stagePlan, setStagePlan] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // Matchmaker State
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [matchQuery, setMatchQuery] = useState('');
  const [matchResults, setMatchResults] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  
  // Auto-Fill Roster State
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // --- Logic Helpers ---

  const getStats = () => {
    const total = members.length;
    const newcomers = members.filter(m => m.type === TRACKS.NEWCOMER).length;
    const believers = members.filter(m => m.type === TRACKS.BELIEVER).length;
    const serving = members.filter(m => m.stage === 'serve').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
    return { total, newcomers, believers, serving, overdueTasks };
  };

  const getPipelineStages = (track) => {
    return Object.values(STAGES)
      .filter(s => s.track === track || s.track === 'shared')
      .sort((a, b) => a.order - b.order);
  };

  const updateMemberStage = (id, newStageId) => {
    setMembers(prev => prev.map(m => m.id === id ? { 
      ...m, 
      stage: newStageId,
      history: [...m.history, { date: new Date().toISOString().split('T')[0], action: `Moved to ${STAGES[newStageId.toUpperCase()].label}`, type: 'system' }]
    } : m));
  };

  const sendMessage = (memberId, method, text) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          history: [...m.history, { date: 'Just now', action: `${method}: ${text}`, type: 'comm' }]
        };
      }
      return m;
    }));
  };

  const addSmartNoteData = (memberId, note, extractedTags, extractedTasks) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const newHistory = [...m.history, { date: 'Just now', action: `Note: ${note}`, type: 'note' }];
        const newTags = [...new Set([...m.tags, ...extractedTags])];
        const newTasks = [...(m.tasks || []), ...extractedTasks.map((t, i) => ({
          id: Date.now() + i,
          title: t.title,
          due: t.due,
          completed: false
        }))];
        
        const globalTasksToAdd = extractedTasks.map((t, i) => ({
            id: Date.now() + i,
            memberId: m.id,
            memberName: m.name,
            title: t.title,
            type: 'ai-generated',
            due: t.due,
            status: 'pending'
        }));
        setTasks(prevTasks => [...prevTasks, ...globalTasksToAdd]);

        return { ...m, history: newHistory, tags: newTags, tasks: newTasks };
      }
      return m;
    }));
  };

  const openMemberDetail = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // --- API Helper ---
  const callGemini = async (prompt, isJson = false) => {
    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      
      if (isJson) {
         payload.generationConfig = { responseMimeType: "application/json" };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  };

  // --- Feature Logic: Matchmaker ---
  const handleMatchmaker = async () => {
    if (!matchQuery) return;
    setIsMatching(true);
    setMatchResults(null);

    const memberContext = members.map(m => ({
      id: m.id,
      name: m.name,
      tags: m.tags,
      stage: m.stage
    }));

    const prompt = `
      You are a church ministry recruiter. 
      User Request: "${matchQuery}"
      
      Analyze this list of members: ${JSON.stringify(memberContext)}.
      
      Return a JSON object with a "matches" array. Each match should have:
      - "id": Member ID
      - "name": Member Name
      - "reason": A short, convincing reason why they fit the role based on their tags or stage.
      
      Select the top 3 matches.
    `;

    const result = await callGemini(prompt, true);
    if (result) {
      try {
        setMatchResults(JSON.parse(result).matches);
      } catch (e) {
        console.error("Failed to parse match results", e);
      }
    }
    setIsMatching(false);
  };


  // --- Feature Logic: Pipeline Planner ---
  const handlePlanStage = async (stage) => {
    setPlanningStage(stage);
    setIsPlanning(true);
    setStagePlan(null);

    const peopleInStage = members.filter(m => m.stage === stage.id);
    const tags = peopleInStage.flatMap(m => m.tags);
    const tagCounts = tags.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
    const topTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(x => x[0]).join(', ');

    const prompt = `
      Act as a church event coordinator. Plan a session for the "${stage.label}" stage.
      Audience: ${peopleInStage.length} people.
      Key Demographics/Interests: ${topTags || "General mix"}.
      
      Create a plan in JSON format with these fields:
      - "theme": A catchy theme for the event.
      - "icebreaker": A specific icebreaker activity suitable for this group size and demographic.
      - "discussion": 2 discussion questions.
      - "logistics": One logistical tip (e.g. food/seating).
    `;

    const result = await callGemini(prompt, true);
    if (result) {
      try {
        setStagePlan(JSON.parse(result));
      } catch (e) {
        console.error("Failed to parse plan", e);
      }
    }
    setIsPlanning(false);
  };

  // --- Feature Logic: Auto-Fill Roster ---
  const handleAutoFillRoster = async () => {
    setIsAutoFilling(true);
    
    // Find empty spots
    const emptySpots = roster.filter(r => r.status === 'empty');
    if (emptySpots.length === 0) {
        alert("No empty spots to fill!");
        setIsAutoFilling(false);
        return;
    }

    // Mock AI Logic to find candidates
    const memberContext = members.map(m => ({ id: m.id, name: m.name, tags: m.tags }));
    const prompt = `
      I need to fill these church volunteer roles: ${emptySpots.map(s => `${s.role} for ${s.ministry}`).join(', ')}.
      
      Here is my member database: ${JSON.stringify(memberContext)}.
      
      Return a JSON object with a "suggestions" array. Each suggestion:
      - "roleId": (The ID of the roster spot)
      - "personName": (Name of the suggested member)
      
      Pick the best fit based on tags (e.g., 'Singer' for Worship, 'Introvert' NOT for Greeting).
    `;

    const result = await callGemini(prompt, true);
    
    if (result) {
        try {
            const suggestions = JSON.parse(result).suggestions;
            setRoster(prev => prev.map(spot => {
                const suggestion = suggestions.find(s => s.roleId === spot.id);
                return suggestion ? { ...spot, person: suggestion.personName, status: 'pending' } : spot;
            }));
        } catch(e) { console.error(e); }
    }
    setIsAutoFilling(false);
  };


  // --- Views ---

  const CheckInView = () => (
    <div className="max-w-5xl mx-auto space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">Event Check-in</h2>
         <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
            <Scan size={16} /> Open Scanner
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {events.map(event => (
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

  const GroupLeaderView = () => {
    // If a group is selected, show its "Leader Portal" view
    if (selectedGroup) {
      return (
        <div className="max-w-md mx-auto bg-white min-h-[600px] rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           <div className="bg-slate-900 p-6 text-white relative">
             <button 
                onClick={() => setSelectedGroup(null)} 
                className="absolute top-6 right-4 text-white/70 hover:text-white"
             >
                <X size={20} />
             </button>
             <button 
                onClick={() => setSelectedGroup(null)} 
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white mb-2"
             >
                <ChevronLeft size={14} /> Back to Groups
             </button>
             <h2 className="font-bold text-lg">{selectedGroup.name} Connect</h2>
             <p className="text-slate-400 text-sm">Leader: {selectedGroup.leader}</p>
           </div>
           
           <div className="flex-1 p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-800">Attendance (Today)</h3>
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="space-y-3">
                   {selectedGroup.members.map(m => (
                     <div key={m.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{m.name}</span>
                        </div>
                        <button 
                          onClick={() => {
                             const updatedGroups = groups.map(g => {
                               if (g.id === selectedGroup.id) {
                                  const updatedMembers = g.members.map(mem => mem.id === m.id ? {...mem, present: !mem.present} : mem);
                                  return {...g, members: updatedMembers};
                               }
                               return g;
                             });
                             setGroups(updatedGroups);
                             // Also update local selected group state to reflect change immediately
                             setSelectedGroup(updatedGroups.find(g => g.id === selectedGroup.id));
                          }}
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${m.present ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
                        >
                          {m.present && <CheckCircle2 size={14} />}
                        </button>
                     </div>
                   ))}
                </div>
              </div>
  
              <div className="pt-6 border-t border-slate-100">
                 <h3 className="font-bold text-slate-800 mb-3">Prayer Requests</h3>
                 <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none" rows="3" placeholder="Log any prayer needs here..." />
                 <button className="w-full mt-3 bg-amber-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-amber-700">Save Update</button>
              </div>
           </div>
        </div>
      );
    }

    // Default View: List of all Connect Groups
    return (
      <div className="max-w-6xl mx-auto space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Connect Groups</h2>
               <p className="text-slate-500 text-sm">Select a group to manage attendance & prayer.</p>
            </div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
               + New Group
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
               <div 
                  key={group.id} 
                  onClick={() => setSelectedGroup(group)}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
               >
                  <div className="flex items-start justify-between mb-3">
                     <div className="bg-amber-50 text-amber-700 p-2 rounded-lg">
                        <MapPin size={20} />
                     </div>
                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        {group.members.length} Members
                     </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-amber-700 transition-colors">{group.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">Leader: {group.leader}</p>
                  
                  <div className="flex items-center text-xs font-medium text-blue-600 gap-1">
                     View Portal <ArrowRight size={12} />
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  const WorkflowView = () => (
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
          {workflows.map(wf => (
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
                      const newWf = workflows.map(w => w.id === wf.id ? {...w, active: !w.active} : w);
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

  const MinistriesView = () => (
    <div className="max-w-6xl mx-auto space-y-8">
       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Ministries & Roster</h2>
            <p className="text-slate-500 text-sm">Sunday Service • Oct 29</p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={handleAutoFillRoster}
              disabled={isAutoFilling}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-70 transition-all"
            >
               {isAutoFilling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-yellow-300" />}
               Auto-Fill All Spots
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">
               Publish Roster
            </button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MINISTRIES.map(ministryName => {
             const ministryRoster = roster.filter(r => r.ministry === ministryName);
             
             return (
               <div key={ministryName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {ministryName}
                        <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-normal">
                           {ministryRoster.length} Roles
                        </span>
                     </h3>
                     <button className="text-xs text-blue-600 font-bold hover:underline">+ Add Role</button>
                  </div>
                  
                  <div className="divide-y divide-slate-100 flex-1">
                     {ministryRoster.length > 0 ? (
                        ministryRoster.map(spot => (
                           <div key={spot.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                              <div className="flex-1">
                                 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{spot.role}</p>
                                 <div className="flex items-center gap-2">
                                    {spot.person ? (
                                       <>
                                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                             {spot.person.charAt(0)}
                                          </div>
                                          <span className="text-slate-800 font-medium text-sm">{spot.person}</span>
                                       </>
                                    ) : (
                                       <span className="text-slate-400 italic text-sm">-- Unassigned --</span>
                                    )}
                                 </div>
                              </div>
                              <div className="text-right">
                                 {spot.status === 'confirmed' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"><CheckCircle2 size={14}/></span>}
                                 {spot.status === 'pending' && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600"><Clock size={14}/></span>}
                                 {spot.status === 'empty' && <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Assign</button>}
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

  const DashboardView = () => {
    const stats = getStats();
    const countInStage = (stageId) => members.filter(m => m.stage === stageId).length;

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
            {/* Newcomer = Blue */}
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">New Believers</p>
              <p className="text-3xl font-bold text-slate-800">{stats.believers}</p>
            </div>
            {/* Believer = Orange (Amber) */}
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Heart size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Fully Integrated</p>
              <p className="text-3xl font-bold text-slate-800">{stats.serving}</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><CheckCircle2 size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
              <p className="text-3xl font-bold text-slate-800">{tasks.length}</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><ListTodo size={24} /></div>
          </div>
        </div>

        {/* Pipelines Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Newcomer Pipeline - Deep Blue Theme */}
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

          {/* Believer Pipeline - Orange (Amber) Theme */}
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
  };

  const PipelineView = () => {
    const stages = getPipelineStages(pipelineFilter);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Pathway View</h2>
            <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
              <button 
                onClick={() => setPipelineFilter(TRACKS.NEWCOMER)}
                className={`px-4 py-1.5 rounded-md transition-all ${pipelineFilter === TRACKS.NEWCOMER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Newcomer
              </button>
              <button 
                onClick={() => setPipelineFilter(TRACKS.BELIEVER)}
                className={`px-4 py-1.5 rounded-md transition-all ${pipelineFilter === TRACKS.BELIEVER ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Believer
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4 px-4">
          <div className="flex gap-4 min-w-max h-full">
            {stages.map(stage => {
              const stageMembers = members.filter(m => m.stage === stage.id);
              const isShared = stage.track === 'shared';

              return (
                <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col">
                  <div className={`mb-3 flex items-center justify-between px-2 py-2 rounded-lg ${isShared ? 'bg-slate-100 text-slate-800' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    <span className="font-bold text-sm uppercase tracking-wider">{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                        {stageMembers.length}
                      </span>
                      {/* AI Planner Button */}
                      <button 
                        onClick={() => handlePlanStage(stage)}
                        className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                        title="AI Plan Event"
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {stageMembers.map(member => (
                      <div 
                        key={member.id} 
                        onClick={() => openMemberDetail(member)}
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
                          {member.tags.slice(0, 2).map(tag => (
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
        
        {/* Pipeline Planner Modal - Updated Colors */}
        {planningStage && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in duration-200">
               <button onClick={() => setPlanningStage(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                 <Sparkles size={18} className="text-amber-500" />
                 Event Planner
               </h3>
               <p className="text-sm text-slate-500 mb-4">Planning for: {planningStage.label}</p>

               {isPlanning ? (
                 <div className="py-8 flex flex-col items-center text-slate-400">
                   <Loader2 size={32} className="animate-spin mb-2 text-amber-500" />
                   <span className="text-xs">Analyzing demographics...</span>
                 </div>
               ) : stagePlan ? (
                 <div className="space-y-4">
                   <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                     <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-2">Theme: {stagePlan.theme}</h4>
                     <div className="text-sm space-y-3 text-slate-700">
                       <div>
                         <span className="font-bold text-slate-900">🧊 Icebreaker:</span>
                         <p>{stagePlan.icebreaker}</p>
                       </div>
                       <div>
                         <span className="font-bold text-slate-900">🗣️ Discussion:</span>
                         <ul className="list-disc pl-4 mt-1 space-y-1">
                            {stagePlan.discussion?.map((q, i) => <li key={i}>{q}</li>)}
                         </ul>
                       </div>
                       <div>
                         <span className="font-bold text-slate-900">💡 Logistics Tip:</span>
                         <p>{stagePlan.logistics}</p>
                       </div>
                     </div>
                   </div>
                   <button onClick={() => setPlanningStage(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium">Close</button>
                 </div>
               ) : (
                 <div className="text-center text-red-400">Failed to generate plan. Try again.</div>
               )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Member Detail Modal (The "Profile" View) ---
  const MemberDetailContent = () => {
    if (!selectedMember) return null;
    const [detailTab, setDetailTab] = useState('pathway'); // pathway, tasks, notes
    const [msgText, setMsgText] = useState('');
    const [smartNoteText, setSmartNoteText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessingNote, setIsProcessingNote] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    
    // Testimony Builder State
    const [testimonyDraft, setTestimonyDraft] = useState(null);
    const [testimonyInput, setTestimonyInput] = useState('');
    const [isBuildingTestimony, setIsBuildingTestimony] = useState(false);

    const currentTrack = selectedMember.type;
    const allStages = getPipelineStages(currentTrack);
    const currentStageIdx = allStages.findIndex(s => s.id === selectedMember.stage);
    const currentStageLabel = STAGES[selectedMember.stage.toUpperCase()]?.label || 'Unknown';
    const showTestimonyBuilder = selectedMember.stage === 'card' || selectedMember.stage === 'baptism';

    // --- AI Functions ---
    const handleMagicDraft = async () => {
      setIsGenerating(true);
      const prompt = `
        You are a warm, empathetic church leader. Write a short text message (SMS format, under 160 chars) to ${selectedMember.name}.
        Context: They are currently at the "${currentStageLabel}" stage of the integration pathway.
        Their tags/interests are: ${selectedMember.tags.join(', ')}.
        Goal: Encourage them warmly and invite them to take the next step relevant to their stage.
        Tone: Casual, inviting, not overly religious jargon.
      `;
      const result = await callGemini(prompt);
      setMsgText(result || "Hi! Hope to see you soon.");
      setIsGenerating(false);
    };

    const handleAiInsight = async () => {
      setIsInsightLoading(true);
      const prompt = `
        Act as a senior pastor and mentor. Analyze this church member profile:
        Name: ${selectedMember.name}
        Track: ${selectedMember.type === TRACKS.NEWCOMER ? 'Newcomer (Visitor)' : 'New Believer (Recent Convert)'}
        Current Stage: ${currentStageLabel}
        Tags/Interests: ${selectedMember.tags.join(', ')}
        
        Provide a "Spiritual Snapshot":
        1. A one-sentence observation about their potential needs based on their stage.
        2. A specific "Conversation Starter" question to ask them next time we see them.
        3. A recommended "Action Step" for the leader to take.
        Keep it brief, bulleted, and actionable.
      `;
      const result = await callGemini(prompt);
      setAiInsight(result);
      setIsInsightLoading(false);
    };

    const handleSmartNote = async () => {
      if (!smartNoteText.trim()) return;
      setIsProcessingNote(true);
      const prompt = `
        Analyze this pastoral note: "${smartNoteText}".
        Extract:
        1. "tags": A list of relevant short tags (strings) to add to the person's profile (e.g. "Musician", "Student").
        2. "tasks": A list of actionable tasks implied by the note. Each task object must have "title" (string) and "due" (string, e.g. "Tomorrow", "Next Week").
        
        Return valid JSON only.
      `;
      
      const result = await callGemini(prompt, true);
      if (result) {
        try {
           const parsed = JSON.parse(result);
           addSmartNoteData(selectedMember.id, smartNoteText, parsed.tags || [], parsed.tasks || []);
           setSmartNoteText(''); // Clear input
        } catch (e) {
           console.error("Failed to parse smart note", e);
        }
      }
      setIsProcessingNote(false);
    };

    const handleTestimonyBuilder = async () => {
       if (!testimonyInput) return;
       setIsBuildingTestimony(true);
       const prompt = `
         Create a 2-minute testimony script for a baptism based on these notes:
         "${testimonyInput}"
         
         Structure:
         1. The "Before" (Life before faith)
         2. The "Moment" (How they met Jesus)
         3. The "After" (How life is different now)
         
         Tone: Authentic, humble, hopeful. First-person perspective.
       `;
       const result = await callGemini(prompt);
       setTestimonyDraft(result);
       setIsBuildingTestimony(false);
    };

    return (
      <div className="flex h-full">
        {/* Left Sidebar: Profile Info */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col overflow-y-auto">
           <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4 ${selectedMember.type === TRACKS.NEWCOMER ? 'bg-blue-600' : 'bg-amber-500'}`}>
                {selectedMember.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{selectedMember.name}</h2>
              <div className="flex justify-center mt-2">
                <StatusBadge type={selectedMember.type} />
              </div>
           </div>

           <div className="space-y-4 flex-1">
             {/* AI Insight Button/Card - Replaced Gradient with Deep Blue */}
             <div className="bg-slate-900 p-4 rounded-xl text-white shadow-md">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <BrainCircuit size={16} className="text-amber-400" /> AI Assistant
                </h4>
                {!aiInsight ? (
                  <div className="text-center">
                    <p className="text-xs text-slate-300 mb-3">Get pastoral insights & conversation starters for {selectedMember.name.split(' ')[0]}.</p>
                    <button 
                      onClick={handleAiInsight}
                      disabled={isInsightLoading}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-white/10"
                    >
                      {isInsightLoading ? <Loader2 size={14} className="animate-spin" /> : '✨ Analyze Profile'}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs space-y-2 animate-in fade-in duration-500">
                    <div className="prose prose-invert prose-xs leading-snug">
                       <div style={{whiteSpace: 'pre-wrap'}}>{aiInsight}</div>
                    </div>
                    <button onClick={() => setAiInsight(null)} className="text-[10px] text-slate-400 hover:text-white underline mt-2">Close</button>
                  </div>
                )}
             </div>

             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Contact Info</h4>
                <div className="space-y-3 text-sm">
                   <div className="flex items-center gap-3 text-slate-600">
                     <Phone size={16} className="text-slate-400" /> 
                     {selectedMember.phone}
                   </div>
                   <div className="flex items-center gap-3 text-slate-600">
                     <Mail size={16} className="text-slate-400" /> 
                     {selectedMember.email}
                   </div>
                </div>
             </div>

             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                   {selectedMember.tags.map(t => <TagBadge key={t} label={t} />)}
                   <button className="text-xs text-blue-600 hover:underline">+ Add</button>
                </div>
             </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white">
           {/* Header & Tabs */}
           <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6">
              <div className="flex items-center gap-6 text-sm font-medium">
                 <button 
                   onClick={() => setDetailTab('pathway')}
                   className={`h-16 border-b-2 px-2 transition-colors ${detailTab === 'pathway' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                 >
                   Pathway Journey
                 </button>
                 <button 
                   onClick={() => setDetailTab('communication')}
                   className={`h-16 border-b-2 px-2 transition-colors ${detailTab === 'communication' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                 >
                   Communication
                 </button>
                 <button 
                   onClick={() => setDetailTab('history')}
                   className={`h-16 border-b-2 px-2 transition-colors ${detailTab === 'history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                 >
                   Log & Tasks
                 </button>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={24} />
              </button>
           </div>

           {/* Tab Content */}
           <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              
              {/* PATHWAY TAB */}
              {detailTab === 'pathway' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Integration Progress</h3>
                      <p className="text-sm text-slate-500">Track {selectedMember.name.split(' ')[0]}'s journey step-by-step.</p>
                    </div>
                    <div className="text-right">
                       <span className="text-3xl font-bold text-slate-800">{Math.round(((currentStageIdx) / allStages.length) * 100)}%</span>
                       <span className="text-sm text-slate-400 block">Complete</span>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    <div className="space-y-6">
                      {allStages.map((stage, idx) => {
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        const isFuture = idx > currentStageIdx;

                        return (
                          <div key={stage.id} className={`relative flex gap-6 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
                            {/* Icon/Dot */}
                            <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center border-4 z-10 transition-colors ${
                              isCompleted ? 'bg-green-500 border-green-100 text-white' : 
                              isCurrent ? 'bg-white border-amber-500 text-amber-500 shadow-md' : 
                              'bg-white border-slate-200 text-slate-300'
                            }`}>
                               {isCompleted ? <CheckCircle2 size={20} /> : <div className="w-3 h-3 rounded-full bg-current"></div>}
                            </div>

                            {/* Card */}
                            <div className={`flex-1 rounded-xl p-5 border ${isCurrent ? 'bg-white border-amber-200 shadow-sm ring-1 ring-amber-100' : 'bg-white border-slate-200'}`}>
                               <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className={`font-bold text-base ${isCurrent ? 'text-slate-800' : 'text-slate-600'}`}>{stage.label}</h4>
                                    <p className="text-sm text-slate-400 mt-1">
                                      {isCompleted ? 'Completed' : isCurrent ? 'Current Stage' : 'Up Next'}
                                    </p>
                                  </div>
                                  {isCurrent && stage.next && (
                                    <button 
                                      onClick={() => updateMemberStage(selectedMember.id, stage.next)}
                                      className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-2"
                                    >
                                      Mark Done <ArrowRight size={14} />
                                    </button>
                                  )}
                               </div>

                               {/* Testimony Builder Feature - Updated Colors */}
                               {isCurrent && showTestimonyBuilder && (
                                 <div className="mt-4 pt-4 border-t border-slate-100">
                                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                     <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                                       <Mic size={14} /> Testimony Builder
                                     </h5>
                                     {!testimonyDraft ? (
                                       <div className="space-y-2">
                                         <p className="text-xs text-slate-600">Help {selectedMember.name.split(' ')[0]} share their story. Add a few notes, and AI will draft a testimony.</p>
                                         <textarea 
                                            className="w-full text-sm p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            rows="3"
                                            placeholder="e.g. Grew up lonely, friend invited me to church, felt peace during worship, decided to follow Jesus..."
                                            value={testimonyInput}
                                            onChange={(e) => setTestimonyInput(e.target.value)}
                                         />
                                         <button 
                                           onClick={handleTestimonyBuilder}
                                           disabled={isBuildingTestimony || !testimonyInput}
                                           className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded font-medium hover:bg-slate-900 flex items-center gap-1"
                                         >
                                           {isBuildingTestimony ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                           Draft Testimony
                                         </button>
                                       </div>
                                     ) : (
                                       <div className="space-y-2">
                                          <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {testimonyDraft}
                                          </div>
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => { navigator.clipboard.writeText(testimonyDraft); alert('Copied!'); }}
                                              className="text-xs text-amber-600 font-medium hover:underline"
                                            >
                                              Copy to Clipboard
                                            </button>
                                            <button 
                                              onClick={() => setTestimonyDraft(null)}
                                              className="text-xs text-slate-400 hover:text-slate-600"
                                            >
                                              Start Over
                                            </button>
                                          </div>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* COMMUNICATION TAB */}
              {detailTab === 'communication' && (
                <div className="max-w-2xl mx-auto">
                   <h3 className="text-lg font-bold text-slate-800 mb-6">Send Message</h3>
                   
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-slate-700">Message</label>
                          <button 
                            onClick={handleMagicDraft}
                            disabled={isGenerating}
                            className="text-xs flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors font-medium"
                          >
                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Magic Draft
                          </button>
                        </div>
                        <textarea 
                          rows="6" 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                          placeholder="Type your message here or click 'Magic Draft' to generate one..." 
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                         <button 
                           onClick={() => { sendMessage(selectedMember.id, 'Email', msgText); setMsgText(''); }}
                           className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                         >
                           <Send size={16} /> Send Email
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {/* HISTORY TAB & SMART NOTES */}
              {detailTab === 'history' && (
                <div className="max-w-2xl mx-auto space-y-6">
                   
                   {/* Smart Note Input */}
                   <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <h4 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-2">
                        <Sparkles size={16} className="text-amber-500"/> Smart Note Processor
                      </h4>
                      <div className="relative">
                        <textarea 
                          className="w-full p-3 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                          placeholder="e.g., Met with Sarah, she loves singing and wants to join the choir. I need to email the worship pastor."
                          rows="2"
                          value={smartNoteText}
                          onChange={(e) => setSmartNoteText(e.target.value)}
                        />
                        <button 
                          onClick={handleSmartNote}
                          disabled={!smartNoteText || isProcessingNote}
                          className="absolute bottom-3 right-3 bg-amber-600 text-white px-3 py-1 text-xs rounded-md font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isProcessingNote ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                          Analyze & Save
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-700/60 mt-1 ml-1">AI will automatically detect tasks and add tags to the profile.</p>
                   </div>

                   {/* Tasks Section */}
                   <div>
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">Pending Tasks</h4>
                        <button className="text-sm text-blue-600 hover:underline">+ Add Task</button>
                     </div>
                     <div className="space-y-2">
                       {selectedMember.tasks && selectedMember.tasks.length > 0 ? (
                         selectedMember.tasks.map(t => (
                           <div key={t.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="w-5 h-5 rounded border border-slate-300 cursor-pointer hover:bg-slate-50"></div>
                              <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                              <span className="text-xs text-red-500 font-medium">{t.due}</span>
                           </div>
                         ))
                       ) : (
                         <div className="text-sm text-slate-400 italic">No pending tasks.</div>
                       )}
                     </div>
                   </div>

                   <hr className="border-slate-200" />

                   {/* History Feed */}
                   <div>
                      <h4 className="font-bold text-slate-800 mb-4">Activity Log</h4>
                      <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                        {[...selectedMember.history].reverse().map((h, i) => (
                           <div key={i} className="relative">
                              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${h.type === 'comm' ? 'bg-blue-400' : h.type === 'note' ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                              <p className="text-sm text-slate-800 font-medium">{h.action}</p>
                              <p className="text-xs text-slate-400">{h.date}</p>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

           </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <GitMerge className="text-amber-500 flex-shrink-0" size={24} />
          <span className="text-white text-xl font-bold hidden lg:block">Pathways</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'pipeline', icon: GitMerge, label: 'Pipeline' },
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'checkin', icon: QrCode, label: 'Check-in' },
            { id: 'groups', icon: Users, label: 'Groups' },
            { id: 'workflows', icon: Workflow, label: 'Workflows' },
            { id: 'ministries', icon: Briefcase, label: 'Ministries' }, // Replaced Roster with Ministries
            { id: 'reports', icon: BarChart3, label: 'Reports' },
            { id: 'members', icon: Users, label: 'People' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative ${activeTab === item.id ? 'bg-amber-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 hover:shadow-lg transition-all transform active:scale-95">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Person</span>
            </button>
          </div>
        </header>

        {/* View Content Container */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pipeline' && <PipelineView />}
          {activeTab === 'checkin' && <CheckInView />}
          {activeTab === 'groups' && <GroupLeaderView />}
          {activeTab === 'workflows' && <WorkflowView />}
          {activeTab === 'ministries' && <MinistriesView />} 
          
          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">My Tasks</h3>
               </div>
               <div className="divide-y divide-slate-100">
                  {tasks.map(task => (
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
          )}

          {activeTab === 'reports' && (
             <div className="max-w-5xl mx-auto space-y-6">
                {/* Replaced Gradient with Deep Blue */}
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg">
                   <h2 className="text-2xl font-bold mb-2">Monthly Impact Report</h2>
                   <p className="text-slate-400">October 2023 Statistics</p>
                </div>
                {/* Simplified Report View */}
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
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
               {/* Matchmaker Banner - Replaced Gradient with Deep Blue (Slate-900) */}
               <div className="bg-slate-900 rounded-xl p-3 text-white shadow-md">
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-white/10 rounded-lg">
                       <Sparkles size={18} className="text-amber-400" />
                     </div>
                     <div>
                       <h3 className="font-bold text-sm">Need a volunteer?</h3>
                       <p className="text-slate-300 text-xs">Find the perfect match with AI.</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => setShowMatchmaker(true)}
                     className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors"
                   >
                     ✨ AI Matchmaker
                   </button>
                 </div>

                 {/* Matchmaker Search Area (Conditional) */}
                 {showMatchmaker && (
                   <div className="mt-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20 animate-in fade-in slide-in-from-top-2">
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         className="flex-1 bg-white/90 text-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                         placeholder="Describe the role... e.g. 'Guitarist for youth band'"
                         value={matchQuery}
                         onChange={(e) => setMatchQuery(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleMatchmaker()}
                       />
                       <button 
                         onClick={handleMatchmaker}
                         disabled={isMatching || !matchQuery}
                         className="bg-amber-600 text-white font-bold px-4 py-1.5 text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
                       >
                         {isMatching ? <Loader2 size={14} className="animate-spin" /> : 'Find'}
                       </button>
                     </div>

                     {/* Results */}
                     {matchResults && (
                       <div className="mt-3 grid gap-2">
                         {matchResults.map((match, i) => (
                           <div key={i} className="bg-white text-slate-800 p-2 rounded-lg flex items-start gap-3 shadow-sm">
                             <div className="bg-slate-100 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                               {match.id}
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-sm">{match.name}</h4>
                               <p className="text-xs text-slate-600 leading-tight">{match.reason}</p>
                             </div>
                             <button onClick={() => openMemberDetail(members.find(m => m.id === match.id))} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 whitespace-nowrap">
                               View
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
               </div>

               {/* Table */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">People Database</h3>
                      <button className="text-sm text-slate-500 hover:text-amber-600 font-medium">Export CSV</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Stage</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map(m => (
                        <tr key={m.id} onClick={() => openMemberDetail(m)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                          <td className="px-6 py-4 text-slate-600">{STAGES[m.stage.toUpperCase()]?.label}</td>
                          <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <MemberDetailContent />
      </Modal>

    </div>
  );
}