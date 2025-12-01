// Mock data from original Pathways app for development

export const TRACKS = {
  NEWCOMER: 'newcomer',
  BELIEVER: 'believer',
} as const;

export const STAGES = {
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
} as const;

export const INITIAL_MEMBERS = [
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

export const INITIAL_TASKS = [
  { id: 1, memberId: 1, memberName: 'Sarah Jenkins', title: 'Invite to Newcomers Lunch', type: 'invite', due: 'Today', status: 'pending' },
  { id: 2, memberId: 2, memberName: 'Mike Ross', title: 'Deliver Bible', type: 'care', due: 'Tomorrow', status: 'pending' },
  { id: 3, memberId: 7, memberName: 'Chris Evans', title: 'Confirm Lunch RSVP', type: 'admin', due: 'Overdue', status: 'overdue' },
];

export const INITIAL_EVENTS = [
  { id: 1, name: 'Newcomers Lunch', date: 'Oct 29', time: '1:00 PM', location: 'Fellowship Hall', attendees: 12 },
  { id: 2, name: 'Growth Track: Step 1', date: 'Nov 05', time: '11:00 AM', location: 'Room 204', attendees: 8 },
  { id: 3, name: 'Baptism Service', date: 'Nov 12', time: '10:00 AM', location: 'Main Auditorium', attendees: 5 },
];

export const CONNECT_GROUP_NAMES = [
  'Kijitonyama', 'Makongo Juu', 'Mbezi Rainbow', 'Mikocheni', 'Mikocheni Bima',
  'Msasani', 'Msasani Beach', 'Oysterbay Chake Chake', 'Oysterbay Chole Road',
  'Oysterbay Haile Selassie', 'Oysterbay Kaunda Drive', "Oysterbay St. Peter's Square",
  'Posta', 'Savei Mlalakuwa', 'Sinza Vatican', 'Tegeta Wazo'
];

// Generate groups with some mock data
export const INITIAL_GROUPS = CONNECT_GROUP_NAMES.map((name, index) => ({
  id: index + 1,
  name: name,
  leader: `Leader ${index + 1}`,
  members: [
      { id: 1, name: 'Member A', present: false },
      { id: 2, name: 'Member B', present: false },
      { id: 3, name: 'Member C', present: false },
      { id: 4, name: 'Member D', present: false },
      { id: 5, name: 'Member E', present: false },
  ],
  prayers: []
}));

export const INITIAL_WORKFLOWS = [
  { id: 1, name: 'New Believer Welcome', trigger: 'Moved to Salvation Card', action: 'Send SMS + Assign Task', active: true, runs: 12 },
  { id: 2, name: 'Stalled Newcomer Alert', trigger: 'No movement for 14 days', action: 'Email Pastor', active: true, runs: 5 },
  { id: 3, name: 'Baptism Info Packet', trigger: 'Registered for Baptism', action: 'Send Email', active: false, runs: 0 },
];

export const MINISTRIES = [
  'Worship Band',
  'Hospitality',
  'Ushers',
  'Set up and Teardown',
  'Production',
  'Social Media',
  'Parking',
  'Kids'
];

export const INITIAL_ROSTER = [
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
