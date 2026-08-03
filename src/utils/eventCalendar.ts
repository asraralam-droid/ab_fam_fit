import type { CommunityEvent, EventLocationType } from '../store/communitySlice';

export type CalendarProvider = 'google' | 'apple' | 'outlook' | 'yahoo';

export const CALENDAR_PROVIDER_OPTIONS: { value: CalendarProvider; label: string }[] = [
  { value: 'google', label: 'Google' },
  { value: 'apple', label: 'Apple' },
  { value: 'outlook', label: 'Outlook' },
  { value: 'yahoo', label: 'Yahoo' }
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime12h(iso: string) {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minPart = minutes === 0 ? '' : `:${pad(minutes)}`;
  return `${hours}${minPart} ${suffix}`;
}

function formatDayOrdinal(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ?
      'st' :
      day % 10 === 2 && day !== 12 ?
        'nd' :
        day % 10 === 3 && day !== 13 ?
          'rd' :
          'th';
  const month = d.toLocaleString(undefined, { month: 'short' });
  const year = d.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

function shortTimezoneLabel(timezone: string) {
  if (timezone.includes('PKT') || timezone.includes('Karachi')) return 'PKT';
  if (timezone.includes('UTC')) return 'UTC';
  if (timezone.includes('EST')) return 'EST';
  if (timezone.includes('PST')) return 'PST';
  if (timezone.includes('GMT')) return 'GMT';
  return timezone;
}

export function formatEventTimeRange(event: CommunityEvent) {
  return `${formatTime12h(event.startAt)} - ${formatTime12h(event.endAt)}`;
}

export function formatEventDate(event: CommunityEvent) {
  return formatDayOrdinal(event.startAt);
}

export function formatRegistrationDateTime(event: CommunityEvent) {
  const d = new Date(event.startAt);
  const datePart = d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short'
  });
  const tz = shortTimezoneLabel(event.timezone);
  return `${formatEventTimeRange(event)}, ${datePart}, ${tz}`;
}

export function mapsUrl(link: string, location: EventLocationType) {
  if (!link.trim()) return 'https://www.google.com/maps';
  if (location === 'virtual' && /^https?:\/\//i.test(link)) return link;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(link)}`;
}

function toIcsDate(iso: string) {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function buildIcsContent(event: CommunityEvent) {
  const uid = `${event.id}@misty.app`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Misty//Community Events//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.startAt)}`,
    `DTEND:${toIcsDate(event.endAt)}`,
    `SUMMARY:${event.title.replace(/[,;\\]/g, '')}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/[,;\\]/g, '')}`,
    `LOCATION:${event.link.replace(/[,;\\]/g, '')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadAppleCalendar(event: CommunityEvent) {
  const blob = new Blob([buildIcsContent(event)], {
    type: 'text/calendar;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildCalendarUrl(
  provider: CalendarProvider,
  event: CommunityEvent
): string | null {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.link);
  const start = toIcsDate(event.startAt);
  const end = toIcsDate(event.endAt);

  switch (provider) {
    case 'google':
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    case 'outlook':
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${encodeURIComponent(event.startAt)}&enddt=${encodeURIComponent(event.endAt)}&location=${location}`;
    case 'yahoo':
      return `https://calendar.yahoo.com/?v=60&title=${title}&st=${start}&et=${end}&desc=${details}&in_loc=${location}`;
    case 'apple':
      return null;
    default:
      return null;
  }
}

export function openCalendarProvider(provider: CalendarProvider, event: CommunityEvent) {
  if (provider === 'apple') {
    downloadAppleCalendar(event);
    return;
  }
  const url = buildCalendarUrl(provider, event);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}
