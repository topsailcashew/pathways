import { Track, Stage } from '@types/enums';

export const NEWCOMER_STAGES = [
  Stage.SUNDAY_EXPERIENCE,
  Stage.NEWCOMERS_TENT,
  Stage.NEWCOMERS_LUNCH,
  Stage.SOCIAL_GROUP,
  Stage.CONNECT_GROUPS,
  Stage.GROWTH_TRACK,
  Stage.SERVE,
];

export const NEW_BELIEVER_STAGES = [
  Stage.SUNDAY_EXPERIENCE,
  Stage.SALVATION_CARD,
  Stage.NEXT_STEPS,
  Stage.BAPTISM,
  Stage.CONNECT_GROUPS,
  Stage.GROWTH_TRACK,
  Stage.SERVE,
];

export const STAGE_COLORS: Record<string, string> = {
  [Stage.SUNDAY_EXPERIENCE]: 'bg-slate-100',
  [Stage.NEWCOMERS_TENT]: 'bg-blue-100',
  [Stage.NEWCOMERS_LUNCH]: 'bg-blue-200',
  [Stage.SOCIAL_GROUP]: 'bg-blue-300',
  [Stage.SALVATION_CARD]: 'bg-amber-100',
  [Stage.NEXT_STEPS]: 'bg-amber-200',
  [Stage.BAPTISM]: 'bg-amber-300',
  [Stage.CONNECT_GROUPS]: 'bg-green-100',
  [Stage.GROWTH_TRACK]: 'bg-green-200',
  [Stage.SERVE]: 'bg-green-300',
};

export const TRACK_COLORS = {
  [Track.NEWCOMER]: 'text-blue-600 bg-blue-50 border-blue-200',
  [Track.NEW_BELIEVER]: 'text-amber-600 bg-amber-50 border-amber-200',
};

export const MINISTRIES = [
  'Worship Band',
  'Hospitality',
  'Ushers',
  'Set up/Teardown',
  'Production',
  'Social Media',
  'Parking',
  'Kids',
];

export const DAR_ES_SALAAM_LOCATIONS = [
  'Mikocheni',
  'Masaki',
  'Oysterbay',
  'Msasani',
  'Kinondoni',
  'Regent Estate',
  'Mbezi Beach',
  'Kawe',
  'Ada Estate',
  'Sinza',
  'Mwenge',
  'Ubungo',
  'Kimara',
  'Goba',
  'Tegeta',
  'Mbezi',
];
