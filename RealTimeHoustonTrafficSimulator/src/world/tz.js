// Short time-zone names (CDT, EAT, JST…) for zones where en-US Intl only gives "GMT+3".
const NAMES = {
  'Africa/Cairo': { 'GMT+2': 'EET', 'GMT+3': 'EEST' }, 'Africa/Johannesburg': { 'GMT+2': 'SAST' },
  'Africa/Lagos': { 'GMT+1': 'WAT' }, 'Africa/Nairobi': { 'GMT+3': 'EAT' },
  'America/Argentina/Buenos_Aires': { 'GMT-3': 'ART' }, 'America/Bogota': { 'GMT-5': 'COT' },
  'America/Lima': { 'GMT-5': 'PET' }, 'America/Santiago': { 'GMT-4': 'CLT', 'GMT-3': 'CLST' },
  'America/Sao_Paulo': { 'GMT-3': 'BRT' }, 'Asia/Bangkok': { 'GMT+7': 'ICT' }, 'Asia/Dubai': { 'GMT+4': 'GST' },
  'Asia/Hong_Kong': { 'GMT+8': 'HKT' }, 'Asia/Kolkata': { 'GMT+5:30': 'IST' }, 'Asia/Manila': { 'GMT+8': 'PHT' },
  'Asia/Seoul': { 'GMT+9': 'KST' }, 'Asia/Shanghai': { 'GMT+8': 'CST' }, 'Asia/Singapore': { 'GMT+8': 'SGT' },
  'Asia/Tokyo': { 'GMT+9': 'JST' }, 'Australia/Melbourne': { 'GMT+10': 'AEST', 'GMT+11': 'AEDT' },
  'Australia/Sydney': { 'GMT+10': 'AEST', 'GMT+11': 'AEDT' }, 'Europe/Istanbul': { 'GMT+3': 'TRT' },
  'Europe/London': { 'GMT+1': 'BST' }, 'Europe/Moscow': { 'GMT+3': 'MSK' },
};
const CET = { 'GMT+1': 'CET', 'GMT+2': 'CEST' };
for (const z of ['Europe/Amsterdam', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Paris', 'Europe/Rome']) NAMES[z] = CET;

export function tzAbbr(tz, date = new Date()) {
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(date);
    const n = (p.find((q) => q.type === 'timeZoneName') || {}).value || '';
    return (NAMES[tz] && NAMES[tz][n]) || n;
  } catch (e) { return ''; }
}

/** "9:51 AM - CDT" in the given IANA zone (local zone when tz is empty). */
export function clockTz(tz, date = new Date()) {
  const t = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(tz ? { timeZone: tz } : {}) });
  const z = tzAbbr(tz || Intl.DateTimeFormat().resolvedOptions().timeZone, date);
  return z ? t + ' - ' + z : t;
}
