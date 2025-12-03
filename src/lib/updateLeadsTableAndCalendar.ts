import { supabase } from '@/lib/supabaseClient';
import { type Lead, type LeadWithProfile, type UpdatedLeadData, LeadStatus } from '@/app/leads/types';

async function updateLeadInDB(lead: Lead, updatedData: any) {
  const { error } = await supabase
    .from('leads')
    .update(updatedData)
    .eq('id', lead.id)

  if (error) {
    console.error('Error updating lead in database', error);
    return;
  }
}

function createDescription(lead: Partial<Lead>) {
  return `
    Address: ${lead.address ?? ''}
    Customer Phone: ${lead.phone ?? '' }
    Purchase Price: ${lead.purchase_price ?? ''}
    Notes: ${lead.notes ?? ''}
    `;
}

export async function syncCalendarEvent(lead: Lead, oldStatus: LeadStatus, newStatus: LeadStatus, editValues?: Partial<Lead>) {
  const ON_CALENDAR_STATUSES: LeadStatus[] = ['approved', 'picked up', 'sold'];
  const wasOnCalendar = ON_CALENDAR_STATUSES.includes(oldStatus);
  const willBeOnCalendar = ON_CALENDAR_STATUSES.includes(newStatus);

  try {
    if (!wasOnCalendar && willBeOnCalendar) {
      let description = createDescription(lead);

      // Create calendar event
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lead.title,
          description: description,
          startISO: lead.pickup_start,
          endISO: lead.pickup_end,
        }),
      });
      const result = await res.json();
      if (result.success && result.eventId) {
        return result.eventId;
      }
      return null;

    } else if (wasOnCalendar && !willBeOnCalendar) {
      // Delete calendar event
      const res = await fetch('/api/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEventId: lead.calendar_event_id }),
      });
      const result = await res.json();
      if (result.success) {
        return null;
      }
      return lead.calendar_event_id ?? null;

    } else if (lead.calendar_event_id && editValues) {
      let description = createDescription(editValues);

      // Edit calendar event
      const res = await fetch('/api/edit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarEventId: lead.calendar_event_id,
          title: editValues.title,
          description: description,
          pickup_start: editValues.pickup_start,
          pickup_end: editValues.pickup_end,
        }),
      });
      return lead.calendar_event_id;
    }
    return lead.calendar_event_id ?? null;

  } catch (error) {
    console.error('Error syncing calenar event:', error);
    return lead.calendar_event_id ?? null;
  } 
}

export async function updateLeadsTableAndCalendar({
  lead,
  updatedData,
}: {
  lead: LeadWithProfile;
  updatedData: UpdatedLeadData;
}): Promise<LeadWithProfile | null> {

  const newStatus = updatedData.status ?? lead.status;
  const calendarEditValues = {
    // extract only the info that needs to be updated on the calendar here
    title: updatedData.title ?? lead.title ?? '',
    address: updatedData.address ?? lead.address ?? '',
    phone: updatedData.phone ?? lead.phone ?? '',
    purchase_price: updatedData.purchase_price ?? lead.purchase_price ?? '',
    notes: updatedData.notes ?? lead.notes ?? '',
    pickup_start: updatedData.pickup_start ?? lead.pickup_start,
    pickup_end: updatedData.pickup_end ?? lead.pickup_end,
  }
  updatedData.calendar_event_id = await syncCalendarEvent(lead, lead.status, newStatus, calendarEditValues);
  await updateLeadInDB(lead, updatedData);

  // Refetch the full lead with profile info
  const { data } = await supabase
    .from('leads')
    .select('*, profiles(email, first_name, last_name)')
    .eq('id', lead.id)
    .single();

  return data ?? null;
}