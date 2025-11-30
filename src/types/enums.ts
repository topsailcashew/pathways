export enum Track {
  NEWCOMER = 'newcomer',
  NEW_BELIEVER = 'new-believer',
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum RosterStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  EMPTY = 'empty',
}

export enum Stage {
  // Newcomer track
  SUNDAY_EXPERIENCE = 'Sunday Experience',
  NEWCOMERS_TENT = 'Newcomers Tent',
  NEWCOMERS_LUNCH = 'Newcomers Lunch',
  SOCIAL_GROUP = 'Social Group',

  // New Believer track
  SALVATION_CARD = 'Salvation Card',
  NEXT_STEPS = 'Next Steps',
  BAPTISM = 'Baptism',

  // Shared stages
  CONNECT_GROUPS = 'Connect Groups',
  GROWTH_TRACK = 'Growth Track',
  SERVE = 'Serve',
}
