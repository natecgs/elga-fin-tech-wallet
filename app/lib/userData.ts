export const USER = {
  firstName: 'George',
  lastName: 'Sambara',
  fullName: 'George Native Sambara',
  phone: '27689053667',
  avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/69ad864f844bf0dd01fa9f1d_1772979841438_404b4cde.png',
};

export const BALANCES = {
  airtime: 'R6.00',
  data: '259 MB',
  minutes: '12 min',
  sms: '8 SMS',
  wallet: 'R45.10',
};

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getLastUpdated(): string {
  return 'Updated a few seconds ago';
}
