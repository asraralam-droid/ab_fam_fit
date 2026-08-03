import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudUpload,
  Copy,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { RootState } from '../../store';
import {
  communitySlice,
  CommunityEvent,
  EVENT_COLOR_HEX,
  EventAttendeeScope,
  EventColor,
  EventLocationType
} from '../../store/communitySlice';
import { CenteredModal, ConfirmModal } from '../../components/modals';
import {
  CALENDAR_PROVIDER_OPTIONS,
  formatEventDate,
  formatEventTimeRange,
  formatRegistrationDateTime,
  mapsUrl,
  openCalendarProvider,
  type CalendarProvider
} from '../../utils/eventCalendar';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const TIMEZONES = [
  'GMT+05:00 Asia/Karachi (PKT)',
  'GMT+00:00 UTC',
  'GMT-05:00 America/New_York (EST)',
  'GMT-08:00 America/Los_Angeles (PST)',
  'GMT+01:00 Europe/London (GMT)'
];

const LOCATION_OPTIONS: { value: EventLocationType; label: string }[] = [
  { value: 'in-person', label: 'In person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hybrid', label: 'Hybrid' }
];

const ATTENDEE_OPTIONS: { value: EventAttendeeScope; label: string }[] = [
  { value: 'all-members', label: 'All members' },
  { value: 'group-members', label: 'Group members only' },
  { value: 'invite-only', label: 'Invite only' }
];

const COLOR_OPTIONS: { value: EventColor; label: string }[] = [
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' }
];

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

function resolveUserId(
  email: string | undefined,
  members: { id: string; email: string }[]
) {
  if (!email) return 'guest';
  const found = members.find((m) => m.email === email);
  return found?.id ?? `guest-${email}`;
}

function eventToDraft(event: CommunityEvent): EventDraft {
  return {
    title: event.title,
    color: event.color,
    startAt: event.startAt.includes('T') && event.startAt.length <= 16 ?
      event.startAt :
      toDatetimeLocalValue(new Date(event.startAt)),
    endAt: event.endAt.includes('T') && event.endAt.length <= 16 ?
      event.endAt :
      toDatetimeLocalValue(new Date(event.endAt)),
    timezone: event.timezone,
    recurring: event.recurring,
    location: event.location,
    link: event.link,
    description: event.description,
    hideLocation: event.hideLocation,
    imageUrl: event.imageUrl,
    attendeeScope: event.attendeeScope,
    remindAttendees: event.remindAttendees,
    hideAttendees: event.hideAttendees,
    isPaid: event.isPaid,
    price: event.price,
    currency: event.currency,
    paymentLink: event.paymentLink
  };
}

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatEventBarTime(iso: string) {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const suffix = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const minPart = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;
  return `${hours}${minPart}${suffix}`;
}

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function eventOnDay(event: CommunityEvent, year: number, month: number, day: number) {
  const start = new Date(event.startAt);
  return (
    start.getFullYear() === year &&
    start.getMonth() === month &&
    start.getDate() === day
  );
}

type EventDraft = Omit<CommunityEvent, 'id'>;

function emptyEventDraft(): EventDraft {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    title: '',
    color: 'orange',
    startAt: toDatetimeLocalValue(start),
    endAt: toDatetimeLocalValue(end),
    timezone: TIMEZONES[0],
    recurring: false,
    location: 'virtual',
    link: '',
    description: '',
    hideLocation: false,
    attendeeScope: 'all-members',
    remindAttendees: true,
    hideAttendees: false,
    isPaid: false,
    price: 0,
    currency: 'USD',
    paymentLink: ''
  };
}

const inputClass =
  'w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-text focus:border-primary outline-none transition-all text-sm';
const labelClass = 'text-xs font-bold text-accent-gold mb-1 block';
const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

export function CommunityEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events } = useSelector((state: RootState) => state.community);
  const { user } = useSelector((state: RootState) => state.auth);
  const { members } = useSelector((state: RootState) => state.admin);
  const isAdmin = user?.role === 'admin';
  const currentUserId = resolveUserId(user?.email, members);
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [registerEventId, setRegisterEventId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const registerEvent = events.find((e) => e.id === registerEventId) ?? null;
  const editEvent = events.find((e) => e.id === editEventId) ?? null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const eventsForDay = (day: number) =>
  events.filter((e) => eventOnDay(e, year, month, day));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/community')}
              className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center hover:bg-border transition-colors flex-shrink-0"
              aria-label="Back to community">
              
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-text leading-tight">
                Events
              </h1>
              <p className="text-xs text-text-muted">Community calendar</p>
            </div>
          </div>
          {isAdmin &&
          <button
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors flex-shrink-0"
            aria-label="Add event">
            
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          }
        </div>

        <div className="px-4 pb-3 flex items-center justify-between">
          <button
            onClick={() =>
            setViewDate(new Date(year, month - 1, 1))
            }
            className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted"
            aria-label="Previous month">
            
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm font-bold text-accent-gold">
            {MONTHS[month]} {year}
          </p>
          <button
            onClick={() =>
            setViewDate(new Date(year, month + 1, 1))
            }
            className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted"
            aria-label="Next month">
            
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-2 pt-2">
        <div className="grid grid-cols-7 border border-border rounded-xl overflow-hidden bg-surface">
          {WEEKDAYS.map((day) =>
          <div
            key={day}
            className="text-center text-[10px] font-bold text-accent-gold py-2 border-b border-border bg-surface">
            
              {day}
            </div>
          )}
          {calendarCells.map((day, i) => {
            const isToday =
            day !== null &&
            sameCalendarDay(new Date(year, month, day), today);
            const dayEvents = day ? eventsForDay(day) : [];
            return (
              <div
                key={i}
                className={`min-h-[72px] border-b border-r border-border p-1 ${day === null ? 'bg-surface-2/40' : isToday ? 'bg-accent-gold/15' : 'bg-surface'}`}>
                
                {day !== null &&
                <>
                    <span className="text-[11px] font-bold text-accent-gold leading-none">
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayEvents.map((ev) =>
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className="text-[8px] leading-tight text-white px-1 py-0.5 rounded truncate text-left w-full hover:opacity-90 transition-opacity"
                    style={{
                      background: EVENT_COLOR_HEX[ev.color]
                    }}
                    title={ev.title}>
                    
                          {formatEventBarTime(ev.startAt)} {ev.title}
                        </button>
                  )}
                    </div>
                  </>
                }
              </div>);

          })}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Upcoming
        </p>
        {[...events].
        sort(
          (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        ).
        map((ev) =>
        <button
          type="button"
          key={ev.id}
          onClick={() => setSelectedEventId(ev.id)}
          className="bg-surface border border-border rounded-2xl p-3 flex gap-3 text-left w-full hover:bg-surface-2 transition-colors">
          
            <div
            className="w-1 rounded-full flex-shrink-0"
            style={{
              background: EVENT_COLOR_HEX[ev.color]
            }} />
          
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text truncate">{ev.title}</p>
              <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(ev.startAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              {ev.description &&
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {ev.description}
                </p>
            }
            </div>
          </button>
        )}
      </div>

      {selectedEvent &&
      <EventDetailModal
        event={selectedEvent}
        members={members}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onClose={() => setSelectedEventId(null)}
        onEdit={() => {
          setEditEventId(selectedEvent.id);
          setSelectedEventId(null);
        }}
        onDelete={() => setDeleteEventId(selectedEvent.id)}
        onRegister={() => {
          dispatch(
            communitySlice.actions.registerForEvent({
              eventId: selectedEvent.id,
              userId: currentUserId
            })
          );
          setRegisterEventId(selectedEvent.id);
          setSelectedEventId(null);
        }} />

      }

      {registerEvent &&
      <RegistrationModal
        event={registerEvent}
        open={!!registerEventId}
        onClose={() => setRegisterEventId(null)}
        onConfirm={(provider) => {
          openCalendarProvider(provider, registerEvent);
          toast.success('Added to your calendar');
          setRegisterEventId(null);
          setSelectedEventId(null);
        }} />

      }

      <ConfirmModal
        open={!!deleteEventId}
        title="Delete event?"
        message="This event will be permanently removed from the calendar."
        onClose={() => setDeleteEventId(null)}
        onConfirm={() => {
          if (deleteEventId) {
            dispatch(communitySlice.actions.deleteEvent(deleteEventId));
            toast.success('Event deleted');
            setDeleteEventId(null);
            setSelectedEventId(null);
          }
        }} />

      {isAdmin &&
      <AddEventModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(draft) => {
          dispatch(
            communitySlice.actions.addEvent({
              ...draft,
              id: `ev-${Date.now()}`,
              attendeeIds: []
            })
          );
          toast.success('Event created');
          setAddOpen(false);
        }} />

      }

      {isAdmin && editEvent &&
      <AddEventModal
        open={!!editEventId}
        mode="edit"
        initialDraft={eventToDraft(editEvent)}
        onClose={() => setEditEventId(null)}
        onSave={(draft) => {
          dispatch(
            communitySlice.actions.updateEvent({
              id: editEvent.id,
              patch: draft
            })
          );
          toast.success('Event updated');
          setEditEventId(null);
        }} />

      }
    </div>);

}

function EventDetailModal({
  event,
  members,
  currentUserId,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onRegister
}: {
  event: CommunityEvent;
  members: { id: string; name: string; email: string }[];
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRegister: () => void;
}) {
  const [attendeesOpen, setAttendeesOpen] = useState(false);
  const attendeeIds = event.attendeeIds ?? [];
  const attendees = attendeeIds.map((id) => {
    const member = members.find((m) => m.id === id);
    return {
      id,
      name: member?.name ?? 'Community member'
    };
  });
  const isRegistered = attendeeIds.includes(currentUserId);
  const showAttendees = isAdmin || !event.hideAttendees;
  const showLocation = isAdmin || !event.hideLocation || isRegistered;
  const locationUrl = mapsUrl(event.link, event.location);

  const copyLocation = () => {
    navigator.clipboard.writeText(event.link);
    toast.success('Location copied');
  };

  const openLocation = () => {
    window.open(locationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <CenteredModal
      open
      onClose={onClose}
      hideHeader
      maxWidth="md"
      panelClassName="max-h-[92vh] overflow-hidden flex flex-col p-0 max-w-[420px]">
      
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          <img
            src={event.imageUrl ?? DEFAULT_EVENT_IMAGE}
            alt=""
            className="w-full h-44 object-cover" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
            aria-label="Close">
            
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-text leading-snug flex-1">
              {event.title}
            </h2>
            {isAdmin &&
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                type="button"
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                aria-label="Delete event">
                
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                type="button"
                onClick={onEdit}
                className="p-2 text-text hover:bg-surface-2 rounded-lg transition-colors"
                aria-label="Edit event">
                
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            }
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-text-muted">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              {formatEventTimeRange(event)}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              {formatEventDate(event)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {showLocation &&
            <div className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 text-xs font-semibold">
                <button
                type="button"
                onClick={openLocation}
                className="inline-flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity">
                
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{event.link}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                </button>
                <button
                type="button"
                onClick={copyLocation}
                className="p-0.5 hover:opacity-70 flex-shrink-0"
                aria-label="Copy location">
                
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            }

            {event.isPaid ?
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-700 text-xs font-bold">
                Paid
                {event.price != null &&
              ` · ${event.currency ?? 'USD'} ${event.price}`
              }
              </span> :

            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-bold">
                Free
              </span>
            }
          </div>

          <div>
            <h3 className="text-sm font-bold text-text mb-1">Description</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {showAttendees &&
          <div className="border border-border rounded-xl overflow-hidden">
              <button
              type="button"
              onClick={() => setAttendeesOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 px-3 py-3 text-sm font-semibold text-text hover:bg-surface-2 transition-colors">
              
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-muted" />
                  {attendees.length} guest{attendees.length === 1 ? '' : 's'}
                </span>
                <ChevronDown
                className={`w-4 h-4 text-text-muted transition-transform ${attendeesOpen ? 'rotate-180' : ''}`} />
              
              </button>
              {attendeesOpen &&
            <ul className="border-t border-border divide-y divide-border max-h-40 overflow-y-auto">
                  {attendees.length === 0 ?
              <li className="px-3 py-2 text-xs text-text-muted">
                      No attendees yet.
                    </li> :
              attendees.map((a) =>
              <li
                key={a.id}
                className="px-3 py-2 text-sm text-text">
                
                        {a.name}
                      </li>
              )}
                </ul>
            }
            </div>
          }
        </div>
      </div>

      <div className="p-4 border-t border-border flex-shrink-0">
        {isRegistered ?
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-xl bg-surface-2 text-text-muted font-bold text-sm cursor-not-allowed">
          
            Registered
          </button> :

        <button
          type="button"
          onClick={onRegister}
          className="w-full h-11 rounded-xl bg-text text-surface font-bold text-sm hover:opacity-90 transition-opacity">
          
            Register
          </button>
        }
      </div>
    </CenteredModal>);

}

function RegistrationModal({
  event,
  open,
  onClose,
  onConfirm
}: {
  event: CommunityEvent;
  open: boolean;
  onClose: () => void;
  onConfirm: (provider: CalendarProvider) => void;
}) {
  const [provider, setProvider] = useState<CalendarProvider>('google');

  useEffect(() => {
    if (open) setProvider('google');
  }, [open]);

  if (!open) return null;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      hideHeader
      maxWidth="md"
      panelClassName="max-h-[92vh] overflow-hidden flex flex-col p-0 max-w-[420px]">
      
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden>
            👌
          </span>
          <div>
            <h3 className="text-base font-bold text-text leading-snug">
              Registration confirmed for {event.title}.
            </h3>
            <p className="text-sm text-text-muted mt-2">
              You have registered for 1 event. We will send you a reminder a day
              before each event.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-muted mb-1 block">
            Date &amp; time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              readOnly
              value={formatRegistrationDateTime(event)}
              className={`${inputClass} pl-10 cursor-default opacity-90`} />
            
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-muted mb-1 block">
            Calendar
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as CalendarProvider)}
            className={inputClass}>
            
            {CALENDAR_PROVIDER_OPTIONS.map((opt) =>
            <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(provider)}
          className="w-full h-11 rounded-xl bg-text text-surface font-bold text-sm hover:opacity-90 transition-opacity mt-1">
          
          Add to calendar
        </button>
      </div>
    </CenteredModal>);

}

function AddEventModal({
  open,
  onClose,
  onSave,
  mode = 'create',
  initialDraft
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: EventDraft) => void;
  mode?: 'create' | 'edit';
  initialDraft?: EventDraft;
}) {
  const [tab, setTab] = useState<'event' | 'payment'>('event');
  const [draft, setDraft] = useState<EventDraft>(emptyEventDraft);

  useEffect(() => {
    if (open) {
      setDraft(initialDraft ?? emptyEventDraft());
      setTab('event');
    }
  }, [open, initialDraft]);

  const reset = () => {
    setDraft(emptyEventDraft());
    setTab('event');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const patch = (partial: Partial<EventDraft>) => {
    setDraft((d) => ({
      ...d,
      ...partial
    }));
  };

  const validateEventTab = () => {
    if (!draft.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!draft.link.trim()) {
      toast.error('Link or address is required');
      return false;
    }
    if (!draft.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (draft.description.length > 300) {
      toast.error('Description must be 300 characters or less');
      return false;
    }
    if (new Date(draft.endAt) <= new Date(draft.startAt)) {
      toast.error('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateEventTab()) return;
    setTab('payment');
  };

  const handleSave = () => {
    if (!validateEventTab()) {
      setTab('event');
      return;
    }
    if (draft.isPaid && !draft.paymentLink?.trim()) {
      toast.error('Payment link is required for paid events');
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      link: draft.link.trim(),
      description: draft.description.trim(),
      paymentLink: draft.paymentLink?.trim() || undefined,
      price: draft.isPaid ? draft.price : undefined,
      currency: draft.isPaid ? draft.currency : undefined
    });
    reset();
  };

  if (!open) return null;

  return (
    <CenteredModal
      open={open}
      onClose={handleClose}
      hideHeader
      maxWidth="md"
      panelClassName="max-h-[92vh] overflow-hidden flex flex-col p-0 max-w-[420px]">
      
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
            <Plus className="w-4 h-4 text-text" />
          </div>
          <h3 className="text-lg font-bold text-text">
            {mode === 'edit' ? 'Edit Event' : 'Add Event'}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 -mr-2 text-text-muted hover:text-text"
          aria-label="Close">
          
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-border flex-shrink-0">
        <button
          type="button"
          onClick={() => setTab('event')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'event' ? 'text-text border-b-2 border-blue-500' : 'text-accent-gold'}`}>
          
          Event
        </button>
        <button
          type="button"
          onClick={() => {
            if (validateEventTab()) setTab('payment');
          }}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'payment' ? 'text-text border-b-2 border-blue-500' : 'text-accent-gold'}`}>
          
          Payment Details
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'event' ?
        <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Title
                {requiredMark}
              </label>
              <input
              value={draft.title}
              onChange={(e) => patch({
                title: e.target.value
              })}
              placeholder="Event"
              className={inputClass} />
            
            </div>

            <div>
              <label className={labelClass}>
                Color
                {requiredMark}
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    background: EVENT_COLOR_HEX[draft.color]
                  }} />
                <select
                value={draft.color}
                onChange={(e) =>
                patch({
                  color: e.target.value as EventColor
                })
                }
                className={`${inputClass} flex-1`}>
                
                  {COLOR_OPTIONS.map((opt) =>
                <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <div>
                <label className={labelClass}>
                  Start Time
                  {requiredMark}
                </label>
                <input
                type="datetime-local"
                value={draft.startAt}
                onChange={(e) => patch({
                  startAt: e.target.value
                })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} />
              
              </div>
              <span className="text-xs text-accent-gold pb-3 font-bold">to</span>
              <div>
                <label className={labelClass}>
                  End Time
                  {requiredMark}
                </label>
                <input
                type="datetime-local"
                value={draft.endAt}
                onChange={(e) => patch({
                  endAt: e.target.value
                })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} />
              
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Timezone
                {requiredMark}
              </label>
              <select
              value={draft.timezone}
              onChange={(e) => patch({
                timezone: e.target.value
              })}
              className={inputClass}>
                
                {TIMEZONES.map((tz) =>
              <option key={tz} value={tz}>
                    {tz}
                  </option>
              )}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
              type="checkbox"
              checked={draft.recurring}
              onChange={(e) => patch({
                recurring: e.target.checked
              })}
              className="w-4 h-4 rounded border-border accent-primary" />
              
              Will the event be recurring event?
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Location
                  {requiredMark}
                </label>
                <select
                value={draft.location}
                onChange={(e) =>
                patch({
                  location: e.target.value as EventLocationType
                })
                }
                className={inputClass}>
                  
                  {LOCATION_OPTIONS.map((opt) =>
                <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                )}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Link
                  {requiredMark}
                </label>
                <input
                value={draft.link}
                onChange={(e) => patch({
                  link: e.target.value
                })}
                placeholder="Link/Address"
                className={inputClass} />
              
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Description
                {requiredMark}
              </label>
              <textarea
              value={draft.description}
              onChange={(e) => patch({
                description: e.target.value
              })}
              placeholder="Description"
              rows={4}
              maxLength={300}
              className="w-full p-3 rounded-xl bg-surface-2 border border-border text-text focus:border-primary outline-none text-sm resize-none" />
            
              <p className="text-[10px] text-text-muted text-right mt-1">
                {draft.description.length} / 300
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
              type="checkbox"
              checked={draft.hideLocation}
              onChange={(e) => patch({
                hideLocation: e.target.checked
              })}
              className="w-4 h-4 rounded border-border accent-primary" />
              
              Hide location from non-attendees.
            </label>

            <div className="grid grid-cols-1 gap-3">
              <button
              type="button"
              onClick={() =>
              patch({
                imageUrl:
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
              })
              }
              className="rounded-xl border-2 border-dashed border-accent-gold/50 bg-accent-gold/10 p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-accent-gold/15 transition-colors">
                
                <CloudUpload className="w-8 h-8 text-accent-gold" />
                <p className="text-sm">
                  <span className="text-blue-600 font-semibold">
                    Click to upload
                  </span>
                </p>
                <p className="text-[10px] text-accent-gold">
                  SVG, PNG or JPG (Max 800 x 400px)
                </p>
                {draft.imageUrl &&
              <img
                src={draft.imageUrl}
                alt=""
                className="w-full max-h-24 object-cover rounded-lg mt-2" />

              }
              </button>

              <div>
                <label className={labelClass}>Who can attend the event?</label>
                <select
                value={draft.attendeeScope}
                onChange={(e) =>
                patch({
                  attendeeScope: e.target.value as EventAttendeeScope
                })
                }
                className={inputClass}>
                  
                  {ATTENDEE_OPTIONS.map((opt) =>
                <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                )}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                type="checkbox"
                checked={draft.remindAttendees}
                onChange={(e) => patch({
                  remindAttendees: e.target.checked
                })}
                className="w-4 h-4 rounded border-border accent-blue-600" />
                
                Remind attendees by email 1 day before
              </label>

              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                type="checkbox"
                checked={draft.hideAttendees}
                onChange={(e) => patch({
                  hideAttendees: e.target.checked
                })}
                className="w-4 h-4 rounded border-border accent-primary" />
                
                Hide attendees from group members
              </label>
            </div>
          </div> :

        <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
              type="checkbox"
              checked={draft.isPaid}
              onChange={(e) => patch({
                isPaid: e.target.checked
              })}
              className="w-4 h-4 rounded border-border accent-primary" />
              
              This is a paid event
            </label>

            {draft.isPaid &&
          <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Price</label>
                    <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.price ?? 0}
                  onChange={(e) =>
                  patch({
                    price: Number(e.target.value)
                  })
                  }
                  className={inputClass} />
                
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                  value={draft.currency ?? 'USD'}
                  onChange={(e) =>
                  patch({
                    currency: e.target.value
                  })
                  }
                  className={inputClass}>
                  
                      <option value="USD">USD</option>
                      <option value="PKR">PKR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Payment link
                    {requiredMark}
                  </label>
                  <input
                value={draft.paymentLink ?? ''}
                onChange={(e) => patch({
                  paymentLink: e.target.value
                })}
                placeholder="https://..."
                className={inputClass} />
              
                </div>
              </>
          }
            {!draft.isPaid &&
          <p className="text-sm text-text-muted">
                Free events do not require payment details. Click Create Event
                to publish.
              </p>
          }
          </div>
        }
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 h-11 rounded-xl border border-border text-accent-gold font-bold text-sm hover:bg-surface-2 transition-colors">
          
          Cancel Event
        </button>
        {tab === 'event' ?
        <button
          type="button"
          onClick={handleNext}
          className="px-6 h-11 rounded-xl bg-text text-surface font-bold text-sm hover:opacity-90 transition-opacity">
          
            Next
          </button> :

        <button
          type="button"
          onClick={handleSave}
          className="px-6 h-11 rounded-xl bg-text text-surface font-bold text-sm hover:opacity-90 transition-opacity">
          
            {mode === 'edit' ? 'Save Event' : 'Create Event'}
          </button>
        }
      </div>
    </CenteredModal>);

}
