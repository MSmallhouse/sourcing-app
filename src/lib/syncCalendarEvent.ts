import { LeadStatus, type Lead } from '@/app/leads/types';
import { updateLeadInDB } from './updateLeadInDB';

const ON_CALENDAR_STATUSES: LeadStatus[] = ['approved', 'picked up', 'sold'];

export async function syncCalendarEvent(lead: Lead, oldStatus: LeadStatus, newStatus: LeadStatus, editValues?: Partial<Lead>) {
  const wasOnCalendar = ON_CALENDAR_STATUSES.includes(oldStatus);
  const willBeOnCalendar = ON_CALENDAR_STATUSES.includes(newStatus);
  try {
    if (!wasOnCalendar && willBeOnCalendar) {
      // Create calendar event
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lead.title,
          notes: lead.notes,
          startISO: lead.pickup_start,
          endISO: lead.pickup_end,
        }),
      });
      const result = await res.json();
      if (result.success && result.eventId) {
        await updateLeadInDB(lead, { calendar_event_id: result.eventId });
      }

    } else if (wasOnCalendar && !willBeOnCalendar) {
      // Delete calendar event
      const res = await fetch('/api/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEventId: lead.calendar_event_id }),
      });
      const result = await res.json();
      if (result.success) {
        await updateLeadInDB(lead, { calendar_event_id: null });
      }

    } else if (lead.calendar_event_id && editValues) {
      // Edit calendar event
      const res = await fetch('/api/edit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarEventId: lead.calendar_event_id,
          title: editValues.title ?? lead.title,
          notes: editValues.notes ?? lead.notes,
        }),
      });
    }
  } catch (error) {
    console.error('Error syncing calenar event:', error);
  }
}